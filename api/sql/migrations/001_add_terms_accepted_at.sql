-- Uruchom na istniejącej bazie SEOHOST, jeśli users nie ma jeszcze terms_accepted_at
ALTER TABLE users
  ADD COLUMN terms_accepted_at DATETIME NULL AFTER password_hash;
