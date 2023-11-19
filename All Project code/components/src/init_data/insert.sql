--This is a dummy insert with the credentials 'username, password' to make sure that the test cases pass.
insert into users (username, password) values ('username', '$2b$10$VpZ9G.GO/fvygz/C3I333OERjkMdtQQQ7NNSQ3O7mY8FADhSEgKUm');

--Dummy expenses for dummy user
--insert into expenses (description, username, category, amount, date) values ('Chipotle', 'username', 'Food', 420.18, '2023-10-03');
--insert into expenses (description, username, category, amount, date) values ('Replaced Alternator', 'username', 'Auto', 358.12, '2023-10-15');
--insert into expenses (description, username, category, amount, date) values ('Hulu Subscription', 'username', 'Entertainment', 85.52, '2023-11-11');
--insert into expenses (description, username, category, amount, date) values ('Birthday Gift', 'username', 'Other', 120.96, '2023-11-15');
--insert into expenses (description, username, category, amount, date) values ('Toothbrush', 'username', 'Other', 3.29, '2023-11-15');
--insert into expenses (description, username, category, amount, date) values ('Groceries', 'username', 'Food', 125.56, '2023-10-03');
--insert into expenses (description, username, category, amount, date) values ('Gas', 'username', 'Auto', 65.36, '2023-10-15');


--Default categories
insert into categories (category, username) values ('Auto', NULL);
insert into categories (category, username) values ('Food', NULL);
insert into categories (category, username) values ('Entertainment', NULL);
insert into categories (category, username) values ('Other', NULL);


--Budgets for various months
insert into budgets (username, month, amount, category) values ('username', 10, 300.0, 'Food');
insert into budgets (username, month, amount, category) values ('username', 10, 250.0, 'Auto');
insert into budgets (username, month, amount, category) values ('username', 10, 70.0, 'Entertainment');
insert into budgets (username, month, amount, category) values ('username', 10, 50.0, 'Other');

