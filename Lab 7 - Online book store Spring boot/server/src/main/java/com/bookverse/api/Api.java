package com.bookverse.api;

import java.util.Map;

public final class Api {
  private Api() {
  }

  public record Envelope(boolean success, String message, Object data) {
  }

  public static Envelope ok(String message, Object data) {
    return new Envelope(true, message, data);
  }

  public static Envelope error(String message) {
    return new Envelope(false, message, null);
  }

  public static Map<String, Object> user(User u) {
    return Map.of("id", u.id, "name", u.name, "email", u.email, "phone", u.phone == null ? "" : u.phone, "role",
        u.role);
  }
}
