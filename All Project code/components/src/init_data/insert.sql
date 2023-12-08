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
insert into receipts (description, username, category, amount, date, income) values ('Trip to Safeway', 'username', 'Food', 10.78, '2023-12-02', false);
insert into items (receipt_id, name, amount) values (1, 'Orange', 3.29);
insert into items (receipt_id, name, amount) values (1, 'Bread', 7.49);

insert into receipts (description, username, category, amount, date, income) values ('Jiffy Lube', 'username', 'Auto', 65.23, '2023-12-05', false);
insert into items (receipt_id, name, amount) values (2, 'Oil Change', 65.23);

insert into receipts (description, username, category, amount, date, income) values ('Starbucks', 'username', 'Food', 12.00, '2023-12-09', false);
insert into items (receipt_id, name, amount) values (3, '20oz Pumpkin Spice Latte', 5.75);
insert into items (receipt_id, name, amount) values (3, 'Breakfast Sandwich', 6.25);

insert into receipts (description, username, category, amount, date, income) values ('Chipotle', 'username', 'Food', 25.12, '2023-12-09', false);
insert into items (receipt_id, name, amount) values (4, 'Chipotle Bowl', 14.25);
insert into items (receipt_id, name, amount) values (4, 'Cheese Quesadilla', 7.50);
insert into items (receipt_id, name, amount) values (4, 'Coke', 4.25);

insert into receipts (description, username, category, amount, date, income) values ('Avs Game', 'username', 'Entertainment', 112.52, '2023-12-11', false);
insert into items (receipt_id, name, amount) values (5, 'Ticket', 112.52);

insert into receipts (description, username, category, amount, date, income) values ('Movie', 'username', 'Entertainment', 50.13, '2023-12-13', false);
insert into items (receipt_id, name, amount) values (6, 'Ticket', 50.13);

insert into receipts (description, username, category, amount, date, income) values ('Paycheck', 'username', 'Other', 643.39, '2023-12-14', true);
insert into items (receipt_id, name, amount) values (7, 'Paycheck', 643.39);

insert into receipts (description, username, category, amount, date, income) values ('School Textbooks', 'username', 'Other', 221.95, '2023-12-15', false);
insert into items (receipt_id, name, amount) values (8, 'Differential Equations', 58.95);
insert into items (receipt_id, name, amount) values (8, 'Introduction to Linear Algebra', 62.0);
insert into items (receipt_id, name, amount) values (8, 'Computer Systems', 55.25);
insert into items (receipt_id, name, amount) values (8, 'Fundamentals of Physics', 45.75);

insert into receipts (description, username, category, amount, date, income) values ('7-11 trip', 'username', 'Other', 2.49, '2023-11-15', false);
insert into items (receipt_id, name, amount) values (9, 'Big Gulp', 2.49);

insert into receipts (description, username, category, amount, date, income) values ('Dave & Busters', 'username', 'Entertainment', 147.20, '2023-11-12', false);
insert into items (receipt_id, name, amount) values (10, 'Tickets', 115.0);
insert into items (receipt_id, name, amount) values (10, '12pc Wings', 14.59);
insert into items (receipt_id, name, amount) values (10, 'Loaded Fries', 12.25);
insert into items (receipt_id, name, amount) values (10, 'Coke', 5.45);

insert into receipts (description, username, category, amount, date, income) values ('AutoZone', 'username', 'Auto', 248.45, '2023-11-15', false);
insert into items (receipt_id, name, amount) values (11, 'Tire Replacement', 248.45);

insert into receipts (description, username, category, amount, date, income) values ('Nuggets Game', 'username', 'Entertainment', 180.64, '2023-11-24', false);
insert into items (receipt_id, name, amount) values (12, 'Ticket', 167.89);
insert into items (receipt_id, name, amount) values (12, 'Hotdog', 12.75);

insert into receipts (description, username, category, amount, date, income) values ('Snooze', 'username', 'Food', 19.60, '2023-11-15', false);
insert into items (receipt_id, name, amount) values (13, 'Eggs Benedict', 14.15);
insert into items (receipt_id, name, amount) values (13, 'Latte', 5.45);

insert into receipts (description, username, category, amount, date, income) values ('Steakhouse', 'username', 'Food', 86.91, '2023-11-26', false);
insert into items (receipt_id, name, amount) values (14, 'Sirloin Steak', 45.45);
insert into items (receipt_id, name, amount) values (14, 'Loaded Steak Fries', 17.25);
insert into items (receipt_id, name, amount) values (14, 'Onion Rings', 17.12);
insert into items (receipt_id, name, amount) values (14, 'Coke', 7.09);

insert into receipts (description, username, category, amount, date, income) values ('Bike Shop', 'username', 'Other', 20.49, '2023-11-15', false);
insert into items (receipt_id, name, amount) values (15, 'Wheel', 20.49);

insert into receipts (description, username, category, amount, date, income) values ('King Soopers', 'username', 'Food', 93.95, '2023-11-04', false);
insert into items (receipt_id, name, amount) values (16, 'Smart Water x6', 14.99);
insert into items (receipt_id, name, amount) values (16, 'Toothpaste', 7.99);
insert into items (receipt_id, name, amount) values (16, 'Trash Bag 30gal', 17.99);
insert into items (receipt_id, name, amount) values (16, 'Chicken Wings', 24.99);
insert into items (receipt_id, name, amount) values (16, 'New York Style Cheesecake', 27.99);