-- Pakownik schema (SEOHOST / shared MySQL — bez CREATE DATABASE)
-- Uruchom na istniejącej bazie, np. srv74754_pakownik

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS family_members (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_family_members_user (user_id)
);

CREATE TABLE IF NOT EXISTS family_member_items (
  id VARCHAR(36) PRIMARY KEY,
  family_member_id VARCHAR(36) NOT NULL,
  category VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE,
  INDEX idx_family_member_items_member (family_member_id)
);

CREATE TABLE IF NOT EXISTS packing_lists (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  share_id VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  share_permission ENUM('readonly', 'checkoff', 'full_edit') NOT NULL DEFAULT 'checkoff',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_packing_lists_user (user_id),
  INDEX idx_packing_lists_share (share_id)
);

CREATE TABLE IF NOT EXISTS packing_list_members (
  list_id VARCHAR(36) NOT NULL,
  family_member_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (list_id, family_member_id),
  FOREIGN KEY (list_id) REFERENCES packing_lists(id) ON DELETE CASCADE,
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS list_items (
  id VARCHAR(36) PRIMARY KEY,
  list_id VARCHAR(36) NOT NULL,
  category VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  packed BOOLEAN NOT NULL DEFAULT FALSE,
  family_member_id VARCHAR(36) NULL,
  FOREIGN KEY (list_id) REFERENCES packing_lists(id) ON DELETE CASCADE,
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL,
  INDEX idx_list_items_list (list_id)
);
