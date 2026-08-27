package com.vit.sgpa.security;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Lightweight principal placed into the SecurityContext after a JWT is verified.
 * Avoids a DB round trip on every request just to identify "who is calling".
 */
@Data
@AllArgsConstructor
public class AuthenticatedUser {
    private Long id;
    private String email;
}
