-- drops tables if the exists to avoid conflicts 
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS signed_in;
DROP TABLE IF EXISTS users;



-- creates user table 
CREATE TABLE users (
        email VARCHAR(50) UNIQUE NOT NULL PRIMARY KEY,
        password TEXT NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        family_name VARCHAR(50) NOT NULL,
        gender VARCHAR(6) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
        city VARCHAR(50) NOT NULL,
        country VARCHAR(50) NOT NULL);

-- Creates the signed in table
CREATE TABLE signed_in (
    token TEXT PRIMARY KEY,
    email VARCHAR(50) NOT NULL,
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE  -- cascade is for when a user is deleted there related data us also deleted.
    );

CREATE TABLE messages(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    user_email VARCHAR(50) NOT NULL,
    author_email VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (author_email) REFERENCES users(email) ON DELETE CASCADE
);

INSERT INTO users(email, password, first_name, family_name, gender, city, country)
VALUES ('erik_hugo@liu.se',
        '$2b$12$ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrs', -- bcrypt hash password example
        'erik',
        'hugo',
        'Other',
        'Malmö',
        'Sweden');
