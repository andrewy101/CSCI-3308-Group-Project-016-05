CREATE TABLE IF NOT EXISTS users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL
);


insert into users (username, password) values ('username', '$2b$10$VpZ9G.GO/fvygz/C3I333OERjkMdtQQQ7NNSQ3O7mY8FADhSEgKUm');