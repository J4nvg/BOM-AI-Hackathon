-- Create the database (optional but recommended)
CREATE DATABASE IF NOT EXISTS medical_info_db;
USE medical_info_db;

-- Create the 'cancer' table
CREATE TABLE cancer (
    name VARCHAR(255) PRIMARY KEY
);

-- Create the 'information' table
CREATE TABLE information (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cancer_name VARCHAR(255) NOT NULL,
    info_type VARCHAR(50) NOT NULL, 
    info_content TEXT,
    FOREIGN KEY (cancer_name) REFERENCES cancer(name) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);
