--This is a dummy insert with the credentials 'username, password' to make sure that the test cases pass.
insert into users (username, password) values ('username', '$2b$10$VpZ9G.GO/fvygz/C3I333OERjkMdtQQQ7NNSQ3O7mY8FADhSEgKUm');

--Dummy expenses for dummy user
insert into expenses (username, category, amount, date) values ('username', 'Food', 420, '2023-10-03');
insert into expenses (username, category, amount, date) values ('username', 'Auto', 358, '2023-10-15');
insert into expenses (username, category, amount, date) values ('username', 'Entertainment', 85, '2023-11-11');
insert into expenses (username, category, amount, date) values ('username', 'Other', 120, '2023-11-15');

--Default categories
insert into default_categories (category) values ('Food');
insert into default_categories (category) values ('Auto');
insert into default_categories (category) values ('Entertainment');
insert into default_categories (category) values ('Other');
