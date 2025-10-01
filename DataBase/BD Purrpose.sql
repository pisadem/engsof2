CREATE DATABASE purrposedb;

USE purrposedb;

CREATE TABLE tokens_redefinicao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, 
    token VARCHAR(255) NOT NULL UNIQUE, 
    expires_at DATETIME NOT NULL, 
    used BOOLEAN DEFAULT FALSE, 
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(2) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    primeiroNome VARCHAR(255) NULL,
    ultimoNome VARCHAR(255) NULL,
    cpf VARCHAR(14) NULL UNIQUE,
    nascimento DATE NULL,
    razaoSocial VARCHAR(255) NULL,
    nomeFantasia VARCHAR(255) NULL,
    cnpj VARCHAR(18) NULL UNIQUE,
    criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

