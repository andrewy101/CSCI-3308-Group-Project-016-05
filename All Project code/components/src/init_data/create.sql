CREATE TABLE IF NOT EXISTS users(
    username VARCHAR(50) PRIMARY KEY NOT NULL,
    password CHAR(60) NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses(
    expense_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount FLOAT NOT NULL,
    date DATE,
    FOREIGN KEY (username) REFERENCES users (username)
);

CREATE TABLE IF NOT EXISTS default_categories(
    category VARCHAR(50) PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS custom_categories(
    category VARCHAR(50) NOT NULL,
    username VARCHAR(50) NOT NULL
);