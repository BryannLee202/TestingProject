-- Run this once in MySQL Workbench (connected to your local MySQL80 instance,
-- localhost:3306) to prepare the database for the YiYi Book backend.
--
-- How: open Workbench -> connect as root (or any admin account) -> open this
-- file (File > Open SQL Script) -> click the lightning-bolt "Execute" icon.

CREATE DATABASE IF NOT EXISTS bookstore
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Dedicated app user (avoids putting your root password in application-local.properties)
CREATE USER IF NOT EXISTS 'bookstore_user'@'localhost' IDENTIFIED BY 'bookstore_pass';
GRANT ALL PRIVILEGES ON bookstore.* TO 'bookstore_user'@'localhost';
FLUSH PRIVILEGES;

-- Sanity check
SELECT User, Host FROM mysql.user WHERE User = 'bookstore_user';
