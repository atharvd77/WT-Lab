package com.bookverse.api;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
public class BookverseApplication {
  public static void main(String[] args) {
    SpringApplication.run(BookverseApplication.class, args);
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**").allowedOriginPatterns("*").allowedMethods("*").allowedHeaders("*")
            .allowCredentials(true);
      }
    };
  }

  @Converter
  public static class JsonListConverter implements AttributeConverter<List<String>, String> {
    private final ObjectMapper mapper = new ObjectMapper();

    public String convertToDatabaseColumn(List<String> value) {
      try {
        return mapper.writeValueAsString(value == null ? List.of() : value);
      } catch (Exception e) {
        return "[]";
      }
    }

    public List<String> convertToEntityAttribute(String value) {
      try {
        return value == null ? new ArrayList<>() : mapper.readValue(value, new TypeReference<>() {
        });
      } catch (Exception e) {
        return new ArrayList<>();
      }
    }
  }
}
