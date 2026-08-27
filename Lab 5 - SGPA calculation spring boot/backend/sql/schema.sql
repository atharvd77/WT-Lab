-- VIT SGPA Calculator - Reference Schema
-- NOTE: By default the Spring Boot app auto-creates/updates these tables via
-- `spring.jpa.hibernate.ddl-auto=update` (see application.properties). This
-- script is provided for reference or for manual setup if you prefer to
-- manage the schema yourself (set ddl-auto=validate or none in that case).

CREATE DATABASE IF NOT EXISTS vit_sgpa_db;
USE vit_sgpa_db;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  reg_no VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS results (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  semester_label VARCHAR(100) DEFAULT 'Semester',
  sgpa DECIMAL(4,2) NOT NULL,
  total_credits INT NOT NULL,
  subjects_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
