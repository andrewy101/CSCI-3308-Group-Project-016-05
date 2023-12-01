CREATE TABLE IF NOT EXISTS users(
    username VARCHAR(50) PRIMARY KEY NOT NULL,
    password CHAR(60) NOT NULL
);

--Each receipt will have several items, incoming_expense is 1 if the receipt represents income, 0 otherwise.
CREATE TABLE IF NOT EXISTS receipts(
    
    receipt_id SERIAL PRIMARY KEY,
    description VARCHAR(120) NOT NULL,
    username VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount FLOAT NOT NULL,
    date DATE,
    income BOOLEAN,
    CONSTRAINT username FOREIGN KEY (username) references users(username) ON UPDATE CASCADE ON DELETE CASCADE
);

--Each item is tied to a receipt using receipt_id
CREATE TABLE IF NOT EXISTS items(

    receipt_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    amount FLOAT NOT NULL,
    CONSTRAINT receipt_id FOREIGN KEY (receipt_id) references receipts(receipt_id) ON UPDATE CASCADE ON DELETE CASCADE

);



CREATE TABLE IF NOT EXISTS categories(
    category VARCHAR(50) PRIMARY KEY NOT NULL,
    username VARCHAR(50),
    CONSTRAINT username FOREIGN KEY (username) references users(username) ON UPDATE CASCADE ON DELETE CASCADE
);

--This table is for the homepage, specifically for the feature that allows users to budget by category
CREATE TABLE IF NOT EXISTS budgets(
    username VARCHAR(50) NOT NULL,
    month INTEGER NOT NULL,
    amount FLOAT NOT NULL,
    category VARCHAR(50) NOT NULL,
    CONSTRAINT username FOREIGN KEY (username) references users(username) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT unique_month_category_combination UNIQUE (username, month, category)

);
