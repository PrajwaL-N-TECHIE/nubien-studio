CREATE DATABASE IF NOT EXISTS buildicy;
USE buildicy;

CREATE TABLE IF NOT EXISTS contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    project_type VARCHAR(255),
    budget VARCHAR(255),
    timeline VARCHAR(255),
    message TEXT,
    selected_tags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
