CREATE DATABASE IF NOT EXISTS Dts;
USE Dts;

CREATE TABLE districts (
district_id INT PRIMARY KEY AUTO_INCREMENT,
district_name VARCHAR(100) NOT NULL UNIQUE,
province VARCHAR(50) NOT NULL
);

CREATE TABLE users (
user_id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
phone VARCHAR(15) NOT NULL UNIQUE,
address VARCHAR(255),
password VARCHAR(255) NOT NULL
);

CREATE TABLE district_info (
district_id INT PRIMARY KEY,
total_population INT NOT NULL,
no_of_female INT NOT NULL,
no_of_male INT NOT NULL,
FOREIGN KEY (district_id) REFERENCES districts(district_id)
);
