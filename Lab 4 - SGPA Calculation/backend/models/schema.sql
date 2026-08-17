-- VIT SGPA Result Calculator - Database Schema
-- Run this file once against your MySQL server to set up the database.

CREATE DATABASE IF NOT EXISTS vit_sgpa_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vit_sgpa_db;

-- Students / users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  reg_number VARCHAR(30) DEFAULT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- One row per saved semester result (so a user can save/recompute multiple times)
CREATE TABLE IF NOT EXISTS results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  semester_label VARCHAR(50) DEFAULT 'Semester',
  sgpa DECIMAL(4,2) NOT NULL,
  total_credits INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Subjects belonging to a saved result
CREATE TABLE IF NOT EXISTS result_subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  result_id INT NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  credits INT NOT NULL,
  mse DECIMAL(5,2) NOT NULL,
  ese DECIMAL(5,2) NOT NULL,
  final_marks DECIMAL(5,2) NOT NULL,
  grade VARCHAR(5) NOT NULL,
  grade_point DECIMAL(3,1) NOT NULL,
  FOREIGN KEY (result_id) REFERENCES results(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_results_user ON results(user_id);
CREATE INDEX idx_result_subjects_result ON result_subjects(result_id);
