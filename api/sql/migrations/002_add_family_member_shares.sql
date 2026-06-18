CREATE TABLE IF NOT EXISTS family_member_shares (
  id VARCHAR(36) PRIMARY KEY,
  family_member_id VARCHAR(36) NOT NULL,
  shared_with_email VARCHAR(255) NOT NULL,
  shared_by_user_id VARCHAR(36) NOT NULL,
  recipient_user_id VARCHAR(36) NULL,
  permission ENUM('readonly', 'full_edit') NOT NULL DEFAULT 'full_edit',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (family_member_id, shared_with_email),
  INDEX idx_family_member_shares_recipient (recipient_user_id),
  INDEX idx_family_member_shares_email (shared_with_email)
);
