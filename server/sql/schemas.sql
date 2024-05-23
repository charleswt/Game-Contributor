DROP DATABASE IF EXISTS GC;

CREATE DATABASE GC;

USE GC;

CREATE TABLE company_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id);
);

CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first VARCHAR(32)NOT NULL UNIQUE,
    last VARCHAR(32)NOT NULL UNIQUE,
    username VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    company_user_id INT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (company_user_id) REFERENCES company_user(id);
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES user(id);
);

CREATE TABLE published_code (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company_user_id INT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (company_user_id) REFERENCES company_user(id);
);

CREATE TABLE friend (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id1 INT NOT NULL,
    user_id2 INT NOT NULL,
    request BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id1) REFERENCES user(id),
    FOREIGN KEY (user_id2) REFERENCES user(id),
    UNIQUE(user_id1, user_id2),
    CHECK (user_id1 < user_id2)
);