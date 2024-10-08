DROP DATABASE IF EXISTS GC;
CREATE DATABASE GC;

\c GC

DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS company CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS published_code;
DROP TABLE IF EXISTS friend;


CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    company BOOLEAN NOT NULL DEFAULT FALSE,
    bio VARCHAR (255),
    profile_image VARCHAR(255),
    first_name VARCHAR(32) NOT NULL,
    last_name VARCHAR(32) NOT NULL,
    username VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE company (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "user"(id)
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    comment_id INT,
    user_id INT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user"(id)
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_reply INT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES "user"(id)
);

CREATE TABLE published_code (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    in_use BOOLEAN NOT NULL DEFAULT FALSE,
    company_id INT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user"(id),
    FOREIGN KEY (company_id) REFERENCES company(id)
);

CREATE TABLE friend (
    id SERIAL PRIMARY KEY,
    user_id1 INT NOT NULL,
    user_id2 INT NOT NULL,
    request BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id1) REFERENCES "user"(id),
    FOREIGN KEY (user_id2) REFERENCES "user"(id)
);