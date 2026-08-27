package com.vit.sgpa.service;

import com.vit.sgpa.dto.AuthResponse;
import com.vit.sgpa.dto.LoginRequest;
import com.vit.sgpa.dto.SignupRequest;
import com.vit.sgpa.dto.UserDto;
import com.vit.sgpa.entity.User;
import com.vit.sgpa.exception.ApiException;
import com.vit.sgpa.repository.UserRepository;
import com.vit.sgpa.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("An account with this email already exists.", HttpStatus.CONFLICT);
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRegNo(request.getRegNo());

        User saved = userRepository.save(user);

        String token = jwtUtil.generateToken(saved.getId(), saved.getEmail());
        UserDto userDto = new UserDto(saved.getId(), saved.getName(), saved.getEmail(), saved.getRegNo());

        return new AuthResponse("Account created successfully.", token, userDto);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Invalid email or password.", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ApiException("Invalid email or password.", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        UserDto userDto = new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRegNo());

        return new AuthResponse("Login successful.", token, userDto);
    }
}
