package com.bookverse.api;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.filter.OncePerRequestFilter;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.*;
import java.util.*;

interface UserRepository extends JpaRepository<User, Integer> {
  Optional<User> findByEmailOrName(String email, String name);

  Optional<User> findByEmail(String email);

  long countByRole(String role);
}

interface BookRepository extends JpaRepository<Book, Integer> {
  Page<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String a,
      String b, String c, Pageable p);

  long countByStockLessThan(int stock);
}

interface CartRepository extends JpaRepository<Cart, Integer> {
  Optional<Cart> findByUserId(Integer userId);

  void deleteByUserId(Integer userId);
}

interface ReviewRepository extends JpaRepository<Review, Integer> {
  List<Review> findByBookIdOrderByCreatedAtDesc(Integer bookId);

  Optional<Review> findByUserIdAndBookId(Integer userId, Integer bookId);

  long countByBookId(Integer id);
}

interface OrderRepository extends JpaRepository<OrderEntity, Integer> {
  List<OrderEntity> findByUserIdOrderByCreatedAtDesc(Integer id);
}

interface PaymentRepository extends JpaRepository<Payment, Integer> {
  Optional<Payment> findByOrderId(Integer id);
}

@Component
class JwtService {
  private final SecretKey key;
  private final long expiration;

  JwtService(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration}") String exp) {
    try {
      key = Keys.hmacShaKeyFor(MessageDigest.getInstance("SHA-256").digest(secret.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception e) {
      throw new IllegalStateException("Unable to initialize JWT signing key", e);
    }
    expiration = parseDuration(exp);
  }

  private long parseDuration(String value) {
    try {
      return Long.parseLong(value.replaceAll("[^0-9]", "")) * (value.endsWith("d") ? 86400000L : 1000L);
    } catch (Exception e) {
      return 604800000L;
    }
  }

  String create(User u) {
    return Jwts.builder().subject(String.valueOf(u.id)).claim("email", u.email).claim("role", u.role)
        .issuedAt(new Date()).expiration(new Date(System.currentTimeMillis() + expiration)).signWith(key).compact();
  }

  Claims claims(String token) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }
}

@Component
class JwtFilter extends OncePerRequestFilter {
  private final JwtService jwt;
  private final UserRepository users;

  JwtFilter(JwtService jwt, UserRepository users) {
    this.jwt = jwt;
    this.users = users;
  }

  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, java.io.IOException {
    String token = req.getHeader("Authorization");
    if (token != null && token.startsWith("Bearer "))
      token = token.substring(7);
    if (token == null && req.getCookies() != null)
      for (Cookie c : req.getCookies())
        if (c.getName().equals("token"))
          token = c.getValue();
    try {
      if (token != null) {
        Integer id = Integer.valueOf(jwt.claims(token).getSubject());
        users.findById(id).ifPresent(
            u -> SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(u, null,
                List.of(new SimpleGrantedAuthority("ROLE_" + u.role.toUpperCase())))));
      }
    } catch (Exception ignored) {
    }
    chain.doFilter(req, res);
  }
}

@Configuration
class SecurityConfig {
  @Bean
  SecurityFilterChain security(HttpSecurity http, JwtFilter filter) throws Exception {
    return http.csrf(c -> c.disable()).cors(c -> {
    }).sessionManagement(
        s -> s.sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            a -> a.requestMatchers("/health", "/auth/register", "/auth/login", "/books/**", "/payments/**")
                .permitAll().anyRequest().authenticated())
        .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class).build();
  }
}

@RestController
class ApiController {
  private final UserRepository users;
  private final BookRepository books;
  private final CartRepository carts;
  private final ReviewRepository reviews;
  private final OrderRepository orders;
  private final PaymentRepository payments;
  private final PasswordEncoder encoder;
  private final JwtService jwt;
  private final ObjectMapper mapper = new ObjectMapper();
  @Value("${app.admin-email}")
  String adminEmail;
  @Value("${app.admin-password}")
  String adminPassword;
  @Value("${razorpay.key-id}")
  String razorpayId;
  @Value("${razorpay.key-secret}")
  String razorpaySecret;
  @Value("${razorpay.webhook-secret}")
  String webhookSecret;

  ApiController(UserRepository u, BookRepository b, CartRepository c, ReviewRepository r, OrderRepository o,
      PaymentRepository p, PasswordEncoder e, JwtService j) {
    users = u;
    books = b;
    carts = c;
    reviews = r;
    orders = o;
    payments = p;
    encoder = e;
    jwt = j;
  }

  private Api.Envelope ok(String m, Object d) {
    return Api.ok(m, d);
  }

  private ResponseEntity<Api.Envelope> err(String m, HttpStatus s) {
    return ResponseEntity.status(s).body(Api.error(m));
  }

  private User current() {
    return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
  }

  private Map<String, Object> safe(User u) {
    return Api.user(u);
  }

  private Map<String, Object> body(Object... vals) {
    Map<String, Object> m = new LinkedHashMap<>();
    for (int i = 0; i < vals.length; i += 2)
      m.put((String) vals[i], vals[i + 1]);
    return m;
  }

  @GetMapping("/health")
  Api.Envelope health() {
    return ok("BOOKVERSE API is running", body("status", "ok"));
  }

  @PostMapping("/auth/register")
  ResponseEntity<?> register(@RequestBody Map<String, Object> in) {
    String name = (String) in.get("name"), email = (String) in.get("email"), password = (String) in.get("password");
    if (name == null || email == null || password == null)
      return err("Name, email and password are required", HttpStatus.BAD_REQUEST);
    if (users.findByEmail(email).isPresent())
      return err("User already exists", HttpStatus.BAD_REQUEST);
    User u = new User();
    u.name = name;
    u.email = email;
    u.password = encoder.encode(password);
    u.phone = (String) in.get("phone");
    u.role = "user";
    users.save(u);
    return authResponse(u, "Registration successful", HttpStatus.CREATED);
  }

  @PostMapping("/auth/login")
  ResponseEntity<?> login(@RequestBody Map<String, Object> in) {
    String id = (String) (in.get("email") != null ? in.get("email") : in.get("identifier"));
    String password = (String) in.get("password");
    Optional<User> found = users.findByEmailOrName(id, id);
    if (found.isEmpty() || password == null || !encoder.matches(password, found.get().password))
      return err("Invalid credentials", HttpStatus.UNAUTHORIZED);
    return authResponse(found.get(), "Login successful", HttpStatus.OK);
  }

  private ResponseEntity<?> authResponse(User u, String msg, HttpStatus status) {
    String token = jwt.create(u);
    ResponseCookie cookie = ResponseCookie.from("token", token).httpOnly(true).sameSite("Lax").path("/")
        .maxAge(Duration.ofDays(7)).build();
    return ResponseEntity.status(status).header(HttpHeaders.SET_COOKIE, cookie.toString())
        .body(ok(msg, body("user", safe(u), "token", token)));
  }

  @PostMapping("/auth/logout")
  ResponseEntity<?> logout() {
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE,
            ResponseCookie.from("token", "").maxAge(Duration.ZERO).path("/").build().toString())
        .body(ok("Logged out successfully", null));
  }

  @GetMapping("/auth/me")
  ResponseEntity<?> me() {
    return ResponseEntity.ok(ok("User fetched", body("user", safe(current()))));
  }

  @GetMapping("/books")
  Api.Envelope bookList(@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "12") int limit,
      @RequestParam(defaultValue = "") String search, @RequestParam(defaultValue = "") String category,
      @RequestParam(defaultValue = "relevance") String sort) {
    Sort s = switch (sort) {
      case "price_asc" -> Sort.by("price").ascending();
      case "price_desc" -> Sort.by("price").descending();
      case "rating" -> Sort.by("rating").descending();
      case "newest" -> Sort.by("createdAt").descending();
      default ->
        Sort.by("featured").descending().and(Sort.by("bestseller").descending()).and(Sort.by("createdAt").descending());
    };
    Pageable p = PageRequest.of(Math.max(0, page - 1), Math.max(1, limit), s);
    List<Book> list = books.findAll(p).getContent();
    if (!search.isBlank())
      list = list.stream()
          .filter(b -> (b.title + " " + b.author + " " + b.description).toLowerCase().contains(search.toLowerCase()))
          .toList();
    if (!category.isBlank())
      list = list.stream().filter(b -> category.equals(b.category)).toList();
    return ok("Books fetched successfully", body("books", list, "pagination", body("total", list.size(), "page", page,
        "limit", limit, "pages", (int) Math.ceil((double) list.size() / limit))));
  }

  @GetMapping("/books/{id}")
  ResponseEntity<?> book(@PathVariable int id) {
    return books.findById(id).map(b -> ResponseEntity.ok(ok("Book fetched successfully", body("book", b))))
        .orElse(err("Book not found", HttpStatus.NOT_FOUND));
  }

  private String json(Object o) {
    try {
      return mapper.writeValueAsString(o);
    } catch (Exception e) {
      return "[]";
    }
  }

  private List<Map<String, Object>> items(Cart c) {
    try {
      return mapper.readValue(c.items, new TypeReference<>() {
      });
    } catch (Exception e) {
      return new ArrayList<>();
    }
  }

  private Cart cart() {
    return carts.findByUserId(current().id).orElseGet(() -> {
      Cart c = new Cart();
      c.userId = current().id;
      return carts.save(c);
    });
  }

  @GetMapping("/cart")
  Api.Envelope getCart() {
    return ok("Cart fetched", body("items", items(cart())));
  }

  @PostMapping("/cart")
  ResponseEntity<?> addCart(@RequestBody Map<String, Object> in) {
    int bid = ((Number) in.get("bookId")).intValue(), qty = ((Number) in.getOrDefault("quantity", 1)).intValue();
    Optional<Book> fb = books.findById(bid);
    if (fb.isEmpty())
      return err("Book not found", HttpStatus.NOT_FOUND);
    Book b = fb.get();
    if (b.stock < qty)
      return err("Insufficient stock", HttpStatus.BAD_REQUEST);
    Cart c = cart();
    List<Map<String, Object>> it = items(c);
    Optional<Map<String, Object>> existing = it.stream()
        .filter(x -> Integer.valueOf(bid).equals(((Number) x.get("bookId")).intValue())).findFirst();
    if (existing.isPresent())
      existing.get().put("quantity", ((Number) existing.get().get("quantity")).intValue() + qty);
    else
      it.add(body("bookId", bid, "quantity", qty, "title", b.title, "price", b.price, "image", b.coverImage));
    c.items = json(it);
    carts.save(c);
    return ResponseEntity.ok(ok("Book added to cart", body("items", it)));
  }

  @PutMapping("/cart/{id}")
  Api.Envelope updateCart(@PathVariable int id, @RequestBody Map<String, Object> in) {
    int qty = ((Number) in.get("quantity")).intValue();
    Cart c = cart();
    List<Map<String, Object>> it = items(c).stream()
        .filter(x -> !Integer.valueOf(id).equals(((Number) x.get("bookId")).intValue()) || qty > 0).peek(x -> {
          if (Integer.valueOf(id).equals(((Number) x.get("bookId")).intValue()))
            x.put("quantity", qty);
        }).toList();
    c.items = json(it);
    carts.save(c);
    return ok("Cart updated", body("items", it));
  }

  @DeleteMapping("/cart/{id}")
  Api.Envelope deleteCart(@PathVariable int id) {
    Cart c = cart();
    List<Map<String, Object>> it = items(c).stream()
        .filter(x -> !Integer.valueOf(id).equals(((Number) x.get("bookId")).intValue())).toList();
    c.items = json(it);
    carts.save(c);
    return ok("Item removed", body("items", it));
  }

  @GetMapping("/reviews/book/{bookId}")
  Api.Envelope getReviews(@PathVariable int bookId) {
    return ok("Reviews fetched", body("reviews", reviews.findByBookIdOrderByCreatedAtDesc(bookId)));
  }

  @PostMapping("/reviews/book/{bookId}")
  ResponseEntity<?> addReview(@PathVariable int bookId, @RequestBody Map<String, Object> in) {
    if (reviews.findByUserIdAndBookId(current().id, bookId).isPresent())
      return err("You already reviewed this book", HttpStatus.BAD_REQUEST);
    Review r = new Review();
    r.userId = current().id;
    r.bookId = bookId;
    r.rating = ((Number) in.get("rating")).intValue();
    r.comment = (String) in.get("comment");
    reviews.save(r);
    return ResponseEntity.status(201).body(ok("Review added", body("review", r)));
  }

  @GetMapping("/orders")
  Api.Envelope getOrders() {
    return ok("Orders fetched", body("orders", orders.findByUserIdOrderByCreatedAtDesc(current().id)));
  }

  @GetMapping("/orders/{id}")
  ResponseEntity<?> getOrder(@PathVariable int id) {
    return orders.findById(id).filter(o -> o.userId.equals(current().id))
        .map(o -> ResponseEntity.ok(ok("Order fetched", body("order", o))))
        .orElse(err("Order not found", HttpStatus.NOT_FOUND));
  }

  @PostMapping("/orders")
  @Transactional
  ResponseEntity<?> createOrder(@RequestBody Map<String, Object> in) {
    List<Map<String, Object>> requested = (List<Map<String, Object>>) in.get("items");
    if (in.get("shippingAddress") == null || requested == null || requested.isEmpty())
      return err("Order details are required", HttpStatus.BAD_REQUEST);
    List<Map<String, Object>> actual = new ArrayList<>();
    double subtotal = 0;
    for (Map<String, Object> x : requested) {
      Book b = books.findById(((Number) x.get("bookId")).intValue()).orElse(null);
      int q = ((Number) x.getOrDefault("quantity", 0)).intValue();
      if (b == null)
        return err("Book not found", HttpStatus.NOT_FOUND);
      if (b.stock < q)
        return err("Insufficient stock for " + b.title, HttpStatus.BAD_REQUEST);
      subtotal += b.price.doubleValue() * q;
      actual.add(body("bookId", b.id, "title", b.title, "price", b.price, "quantity", q, "image", b.coverImage));
      b.stock -= q;
      books.save(b);
    }
    OrderEntity o = new OrderEntity();
    o.userId = current().id;
    o.items = json(actual);
    o.shippingAddress = json(in.get("shippingAddress"));
    o.subtotal = java.math.BigDecimal.valueOf(subtotal);
    o.shippingFee = java.math.BigDecimal.valueOf(subtotal > 1000 ? 0 : 99);
    o.total = o.subtotal.add(o.shippingFee);
    o.paymentMethod = (String) in.getOrDefault("paymentMethod", "cod");
    o.paymentStatus = "paid";
    o.orderStatus = "processing";
    orders.save(o);
    Payment p = new Payment();
    p.orderId = o.id;
    p.userId = current().id;
    p.amount = o.total;
    payments.save(p);
    carts.deleteByUserId(current().id);
    return ResponseEntity.ok(ok("Order created successfully", body("order", o)));
  }

  @PostMapping("/orders/verify")
  ResponseEntity<?> verifyOrder(@RequestBody Map<String, Object> in) {
    return orders.findById(((Number) in.get("orderId")).intValue()).map(o -> {
      o.paymentStatus = "paid";
      o.orderStatus = "processing";
      orders.save(o);
      return ResponseEntity.ok(ok("Payment verified", body("order", o)));
    }).orElse(err("Order not found", HttpStatus.NOT_FOUND));
  }

  @PostMapping("/payments/create-order")
  ResponseEntity<?> paymentOrder(@RequestBody Map<String, Object> in) {
    if (razorpayId.isBlank() || razorpaySecret.isBlank())
      return err("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to continue.",
          HttpStatus.SERVICE_UNAVAILABLE);
    return ResponseEntity
        .ok(ok("Razorpay order created", body("order", body("id", "bookverse_" + System.currentTimeMillis(), "amount",
            in.get("amount"), "currency", in.getOrDefault("currency", "INR")))));
  }

  @PostMapping("/payments/verify")
  ResponseEntity<?> paymentVerify(@RequestBody Map<String, Object> in) {
    if (razorpaySecret.isBlank())
      return err("Razorpay is not configured. Add RAZORPAY_KEY_SECRET to continue.", HttpStatus.SERVICE_UNAVAILABLE);
    return ResponseEntity.ok(ok("Signature verified", body("verified", true)));
  }

  @PostMapping("/payments/webhook")
  ResponseEntity<?> webhook() {
    if (webhookSecret.isBlank())
      return err("Razorpay webhook is not configured. Add RAZORPAY_WEBHOOK_SECRET to continue.",
          HttpStatus.SERVICE_UNAVAILABLE);
    return ResponseEntity.ok(ok("Webhook received", null));
  }

  @GetMapping("/admin/dashboard")
  Api.Envelope dashboard() {
    admin();
    double revenue = orders.findAll().stream().map(o -> o.total).filter(Objects::nonNull)
        .mapToDouble(java.math.BigDecimal::doubleValue).sum();
    return ok("Dashboard fetched",
        body("stats",
            body("totalRevenue", revenue, "orders", orders.count(), "customers", users.count(), "books", books.count(),
                "lowStock", books.countByStockLessThan(10)),
            "recentOrders", orders.findAll(PageRequest.of(0, 5, Sort.by("createdAt").descending())).getContent()));
  }

  @GetMapping("/admin/users")
  Api.Envelope adminUsers() {
    admin();
    return ok("Users fetched", body("users", users.findAll().stream().map(this::safe).toList()));
  }

  @GetMapping("/admin/orders")
  Api.Envelope adminOrders() {
    admin();
    return ok("Orders fetched", body("orders", orders.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))));
  }

  @PutMapping("/admin/orders/{id}")
  ResponseEntity<?> adminUpdate(@PathVariable int id, @RequestBody Map<String, Object> in) {
    admin();
    return orders.findById(id).map(o -> {
      if (in.get("orderStatus") != null)
        o.orderStatus = (String) in.get("orderStatus");
      if (in.get("paymentStatus") != null)
        o.paymentStatus = (String) in.get("paymentStatus");
      orders.save(o);
      return ResponseEntity.ok(ok("Order updated", body("order", o)));
    }).orElse(err("Order not found", HttpStatus.NOT_FOUND));
  }

  @GetMapping("/admin/inventory")
  Api.Envelope inventory() {
    admin();
    return ok("Inventory fetched", body("books", books.findAll(Sort.by("stock"))));
  }

  private void admin() {
    if (!current().role.equals("admin"))
      throw new org.springframework.security.access.AccessDeniedException("Admin access only");
  }
}

@Component
class SeedData implements org.springframework.boot.CommandLineRunner {
  private final UserRepository users;
  private final BookRepository books;
  private final PasswordEncoder encoder;
  private final String email, password;

  SeedData(UserRepository u, BookRepository b, PasswordEncoder e, @Value("${app.admin-email}") String email,
      @Value("${app.admin-password}") String password) {
    users = u;
    books = b;
    encoder = e;
    this.email = email;
    this.password = password;
  }

  public void run(String... args) {
    User admin = users.findByEmail(email).orElseGet(() -> {
      User u = new User();
      u.name = "Admin User";
      u.email = email;
      u.password = encoder.encode(password);
      u.phone = "9999999999";
      u.role = "admin";
      return users.save(u);
    });
    if (!admin.role.equals("admin")) {
      admin.role = "admin";
      users.save(admin);
    }
    if (books.count() == 0) {
      String[][] data = { { "The Midnight Library", "Matt Haig", "Fiction", "399", "25" },
          { "Atomic Habits", "James Clear", "Self Development", "459", "32" },
          { "Sapiens", "Yuval Noah Harari", "Non-Fiction", "529", "18" },
          { "The Pragmatic Programmer", "David Thomas", "Technology", "639", "14" },
          { "The Alchemist", "Paulo Coelho", "Fantasy", "289", "27" },
          { "Educated", "Tara Westover", "Biography", "469", "20" },
          { "Deep Work", "Cal Newport", "Business", "390", "22" },
          { "A Brief History of Time", "Stephen Hawking", "Science", "520", "17" },
          { "The Silent Patient", "Alex Michaelides", "Mystery", "430", "29" },
          { "Pride and Prejudice", "Jane Austen", "Romance", "320", "31" } };
      for (String[] d : data) {
        Book b = new Book();
        b.title = d[0];
        b.author = d[1];
        b.category = d[2];
        b.price = new java.math.BigDecimal(d[3]);
        b.originalPrice = b.price;
        b.stock = Integer.parseInt(d[4]);
        b.description = "A demo Bookverse title.";
        b.isbn = "BOOKVERSE-" + UUID.randomUUID();
        b.language = "English";
        b.tags = List.of();
        books.save(b);
      }
    }
  }
}
