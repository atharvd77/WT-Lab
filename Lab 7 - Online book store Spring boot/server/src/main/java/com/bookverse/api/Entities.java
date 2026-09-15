package com.bookverse.api;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "users")
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Integer id;
  @Column(nullable = false)
  String name;
  @Column(nullable = false, unique = true)
  String email;
  @Column(nullable = false)
  String password;
  String phone;
  String avatar;
  @Column(nullable = false)
  String role = "user";
  @Convert(converter = BookverseApplication.JsonListConverter.class)
  List<String> addresses;
  Instant createdAt = Instant.now();
}

@Entity
@Table(name = "books")
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
class Book {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Integer id;
  @Column(nullable = false)
  String title;
  @Column(nullable = false)
  String author;
  @Column(nullable = false, columnDefinition = "TEXT")
  String description;
  @Column(nullable = false, unique = true)
  String isbn;
  @Column(nullable = false)
  String category;
  String publisher;
  String language;
  @Column(nullable = false, precision = 10, scale = 2)
  BigDecimal price;
  BigDecimal originalPrice;
  String coverImage;
  @Column(nullable = false)
  Integer stock = 0;
  Integer lowStockThreshold = 5;
  float rating = 0;
  int numReviews = 0;
  boolean featured;
  boolean bestseller;
  @Convert(converter = BookverseApplication.JsonListConverter.class)
  List<String> tags;
  Instant createdAt = Instant.now();
  Instant updatedAt = Instant.now();
}

@Entity
@Table(name = "carts")
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
class Cart {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Integer id;
  @Column(nullable = false, unique = true)
  Integer userId;
  @Column(columnDefinition = "JSON")
  String items = "[]";
  Instant createdAt = Instant.now();
}

@Entity
@Table(name = "reviews")
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
class Review {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Integer id;
  Integer userId;
  Integer bookId;
  int rating;
  String comment;
  Instant createdAt = Instant.now();
}

@Entity
@Table(name = "orders")
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
class OrderEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Integer id;
  Integer userId;
  @Column(columnDefinition = "JSON")
  String items;
  @Column(columnDefinition = "JSON")
  String shippingAddress;
  BigDecimal subtotal, shippingFee, total;
  String paymentMethod = "cod", paymentStatus = "pending", orderStatus = "pending", razorpayOrderId, razorpayPaymentId;
  Instant createdAt = Instant.now();
}

@Entity
@Table(name = "payments")
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
class Payment {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Integer id;
  Integer orderId, userId;
  String razorpayOrderId, razorpayPaymentId;
  BigDecimal amount;
  String currency = "INR", status = "created", signature;
  Instant createdAt = Instant.now();
}
