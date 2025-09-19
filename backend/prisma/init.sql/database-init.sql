-- Database initialization script for Evangelism App
-- This script creates the database and sets up initial configuration

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS evangelism_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE evangelism_db;

-- Create user if it doesn't exist
CREATE USER IF NOT EXISTS 'evangelism_user'@'%' IDENTIFIED BY 'evangelism_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON evangelism_db.* TO 'evangelism_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Set default authentication plugin for MySQL 8.0 compatibility
ALTER USER 'evangelism_user'@'%' IDENTIFIED WITH mysql_native_password BY 'evangelism_password';

-- Flush privileges again
FLUSH PRIVILEGES;
