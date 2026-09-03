const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("bookverse_token");
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const text = await response.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const message = payload?.message || "Something went wrong.";
    throw new Error(message);
  }

  return payload?.data ?? payload ?? {};
}

export const api = {
  async login(payload) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async register(payload) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async logout() {
    return request("/auth/logout", { method: "POST" });
  },

  async getMe() {
    return request("/auth/me");
  },

  async getBooks(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const query = params.toString();
    return request(`/books${query ? `?${query}` : ""}`);
  },

  async getBook(id) {
    return request(`/books/${id}`);
  },

  async getCategories() {
    const data = await request("/books");
    const books = data?.books || [];
    const categories = [
      ...new Set(books.map((book) => book.category).filter(Boolean)),
    ].sort();
    return { categories };
  },

  async getCart() {
    return request("/cart");
  },

  async addToCart(bookId, quantity = 1) {
    return request("/cart", {
      method: "POST",
      body: JSON.stringify({ bookId, quantity }),
    });
  },

  async updateCartItem(bookId, quantity) {
    return request(`/cart/${bookId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  },

  async removeCartItem(bookId) {
    return request(`/cart/${bookId}`, {
      method: "DELETE",
    });
  },

  async getReviews(bookId) {
    return request(`/reviews/book/${bookId}`);
  },

  async submitReview(bookId, payload) {
    return request(`/reviews/book/${bookId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async createOrder(payload) {
    return request("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getOrders() {
    return request("/orders");
  },

  async getOrder(id) {
    return request(`/orders/${id}`);
  },

  async verifyPayment(payload) {
    return request("/orders/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getAdminDashboard() {
    return request("/admin/dashboard");
  },

  async getAdminOrders() {
    return request("/admin/orders");
  },

  async getAdminInventory() {
    return request("/admin/inventory");
  },
};

export default api;
