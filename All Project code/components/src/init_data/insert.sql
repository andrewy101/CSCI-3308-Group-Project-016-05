--This is a dummy insert with the credentials 'username, password' to make sure that the test cases pass.
insert into users (username, password) values ('username', '$2b$10$VpZ9G.GO/fvygz/C3I333OERjkMdtQQQ7NNSQ3O7mY8FADhSEgKUm');


--Default categories
insert into categories (category, username) values ('Auto', NULL);
insert into categories (category, username) values ('Food', NULL);
insert into categories (category, username) values ('Entertainment', NULL);
insert into categories (category, username) values ('Other', NULL);


--Budgets for various months
insert into budgets (username, month, amount, category) values ('username', 12, 300.0, 'Food');
insert into budgets (username, month, amount, category) values ('username', 12, 250.0, 'Auto');
insert into budgets (username, month, amount, category) values ('username', 12, 70.0, 'Entertainment');
insert into budgets (username, month, amount, category) values ('username', 12, 50.0, 'Other');

insert into budgets (username, month, amount, category) values ('username', 11, 450.0, 'Food');
insert into budgets (username, month, amount, category) values ('username', 11, 100.0, 'Auto');
insert into budgets (username, month, amount, category) values ('username', 11, 150.0, 'Entertainment');
insert into budgets (username, month, amount, category) values ('username', 11, 75.0, 'Other');

--Receipt inserts
insert into receipts (description, username, category, amount, date, income) values ('Trip to Safeway', 'username', 'Food', 352.26, '2023-12-02', '0');
insert into receipts (description, username, category, amount, date, income) values ('Oil Change', 'username', 'Auto', 65.23, '2023-12-05', '0');
insert into receipts (description, username, category, amount, date, income) values ('Starbucks', 'username', 'Food', 14.63, '2023-12-09', '0');
insert into receipts (description, username, category, amount, date, income) values ('Chipotle', 'username', 'Food', 25.12, '2023-12-09', '0');
insert into receipts (description, username, category, amount, date, income) values ('Avs Game', 'username', 'Entertainment', 112.52, '2023-12-11', '0');
insert into receipts (description, username, category, amount, date, income) values ('Movie', 'username', 'Entertainment', 50.13, '2023-12-13', '0');
insert into receipts (description, username, category, amount, date, income) values ('Paycheck', 'username', 'Other', 643.39, '2023-12-14', '1');
insert into receipts (description, username, category, amount, date, income) values ('School Textbooks', 'username', 'Other', 600.0, '2023-12-15', '0');

insert into receipts (description, username, category, amount, date, income) values ('7-11 trip', 'username', 'Other', 23.49, '2023-11-15', '0');
insert into receipts (description, username, category, amount, date, income) values ('Dave & Busters', 'username', 'Entertainment', 139.50, '2023-11-12', '0');
insert into receipts (description, username, category, amount, date, income) values ('AutoZone', 'username', 'Auto', 249.63, '2023-11-15', '0');
insert into receipts (description, username, category, amount, date, income) values ('Nuggets Game', 'username', 'Entertainment', 167.89, '2023-11-24', '0');
insert into receipts (description, username, category, amount, date, income) values ('Snooze', 'username', 'Food', 19.63, '2023-11-15', '0');
insert into receipts (description, username, category, amount, date, income) values ('Steakhouse', 'username', 'Food', 363.43, '2023-11-26', '0');
insert into receipts (description, username, category, amount, date, income) values ('Bike Shop', 'username', 'Other', 20.49, '2023-11-15', '0');
insert into receipts (description, username, category, amount, date, income) values ('King Soopers', 'username', 'Food', 200.12, '2023-11-04', '0');


