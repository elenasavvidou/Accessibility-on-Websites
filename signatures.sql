DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL primary key,
    signature text NOT NULL,
    userid INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- create table users --

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL primary key,
    first VARCHAR (300) NOT NULL,
    last VARCHAR (300) NOT NULL,
    email VARCHAR(300) NOT NULL UNIQUE,
    password VARCHAR(300) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- create a new table --

DROP TABLE IF EXISTS user_profiles;

CREATE TABLE user_profiles (
    id SERIAL primary key,
    userid INT NOT NULL UNIQUE,
    age INT,
    city VARCHAR(100),
    homepage VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
