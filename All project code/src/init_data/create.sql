CREATE TABLE IF NOT EXISTS users(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    password VARCHAR(60)
);


insert into users (user_id, username, password) values (0, 'username', 'password');