--This is a dummy insert with the credentials 'username, password' to make sure that the test cases pass.
insert into users (email, username, password) values ('user@gmail.com', 'username', '$2b$10$VpZ9G.GO/fvygz/C3I333OERjkMdtQQQ7NNSQ3O7mY8FADhSEgKUm');

--Default categories
insert into default_categories (category) values ('Food');
insert into default_categories (category) values ('Auto');
insert into default_categories (category) values ('Entertainment');
insert into default_categories (category) values ('Other');