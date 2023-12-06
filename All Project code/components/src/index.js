const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.
const path = require('path');

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
//Establish folder that contains static files
app.use(express.static(path.join(__dirname, 'resources')));

//Root URL endpoint
app.get('/', (req, res) => {
  
  //Session check
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.redirect('/home');
});

//Variable to be used later on in the login endpoint
const user = {
  username: undefined
}


// Get endpoint for /expenses, shows an entire table of receipts entered by the user, or by create.sql
app.get('/expenses', (req, res) => {
  //Session check
  if (!req.session.user) {
    return res.render('pages/login', {
      message: 'Please login or make an account.',
      error: true
    });
  }
  //This query takes everything from the receipts table that belongs to the current user and shows the most recent receipts first
  const username = req.session.user.username;
  db.any(`SELECT * FROM receipts WHERE username = $1 ORDER BY date DESC;`, [req.session.user.username])
  .then(receipts => {
    res.render('pages/expenses', {
      receipts,
      curr_user: username
    });
  });
});

// New receipt page get endpoint
app.get('/expenses/new', (req, res) => {
  //Session check
  if (!req.session.user) {
    return res.render('pages/login', {
      message: 'Please login or make an account.',
      error: true
    });
  }  
  //This query returns all of the categories that are available to the current user for a new receipt
  const username = req.session.user.username;
  const categories = db.any(`SELECT * FROM categories WHERE username IS NULL OR username = $1;`, [req.session.user.username])
  .then(categories => {
    res.render('pages/newExpense', {
      categories,
      curr_user: username
    });
  });
});

//Create new receipt post endpoint
app.post('/expenses/new', (req, res) => {
  //Session check
  if (!req.session.user) {
    return res.render('pages/login', {
      message: 'Please login or make an account.',
      error: true
    });
  }  

  //Insert query containing all of the form data from the ejs page
  db.tx(async t => {
    const receipt = await t.any(`INSERT INTO receipts (username, income, date, category, description, amount) values($1, $2, $3, $4, $5, $6) RETURNING *;`, 
    [req.session.user.username, req.body.income, req.body.date, req.body.category, req.body.description, req.body.amount]);

    //Insert query for all of the individual items in the receipt, being inserted into the 'items' table. These are tied to the receipt by receipt_id
    for (let i = 0; i < req.body.lineItems.length; i++) {
      await t.none(`INSERT INTO items (receipt_id, name, amount) values($1, $2, $3);`, 
      [receipt[0].receipt_id, req.body.lineItems[i].name, req.body.lineItems[i].amount]);
    }

    res.sendStatus(200);
  });

  //Insert query to add category if the user created a new one
  db.one(`SELECT category FROM categories WHERE (username = $1 OR username IS NULL) AND category = $2`,
  [req.session.user.username, req.body.category])
  .catch(err => {
    db.none(`INSERT INTO categories (username, category) values($1, $2);`, 
    [req.session.user.username, req.body.category]);
  });
}); 

// Delete expense rows post endpoint
app.post('/expenses/delete', (req, res) => {
  //Deletes all selected receipts 
  if (req.session.user) {
    db.tx(async t => {
      for (let i = 0; i < req.body.receipt_ids.length; i++) {
        const receipt_id = parseInt(req.body.receipt_ids[i]);
        await t.none(`DELETE from receipts WHERE receipt_id = $1;`, [receipt_id]);
      }
      res.sendStatus(200);
    });
  }
});

//Expenses info get endpoint
app.get('/expenses/info', (req, res) => {
  //This endpoint displays all individual items for the receipt selected by user. This is called when the info button is clicked for a receipt.
  db.any(`SELECT * FROM items WHERE receipt_id = $1`, [req.query.id])
  .then(items => {
    res.json({
      items
    });
  });
});

//Home get endpoint
app.get('/home', async (req, res) => {
  
  //Session check. User must both have a session and have 'login=true' in the query to view page
  if (!(req.session.user && req.query.login)) {
    return res.render('pages/login', {
      message: 'Please login or make an account.',
      error: true
    });
  } 


  const username = req.session.user.username;

  //Condition will only be true if there are expenses to display for selected month
  if(req.query.show){

    //Get just the month from the date
    var month = parseInt(req.query.month.substring(5));
    //This query gets the total spendings and total income for the selected month to be sent to home.ejs and used for simple calculations
    var totalForMonth = `

      SELECT 
        SUM(CASE WHEN income = false THEN amount ELSE 0 END) as monthlyTotalSpendings,
        SUM(CASE WHEN income = true THEN amount ELSE 0 END) as monthlyTotalIncome
      FROM receipts 
      WHERE username = '${username}' 
      AND EXTRACT(MONTH FROM date) = ${month};`;

  //This query returns the total income and total expenses for each category for the selected month and current user
  var totalsByCategory = `
          SELECT 
            receipts.category,
            EXTRACT(MONTH FROM receipts.date) as curr_month,
            SUM(CASE WHEN income = false THEN receipts.amount ELSE 0 END) as total_amount_for_category,
            SUM(CASE WHEN income = true THEN receipts.amount ELSE 0 END) as total_income_for_category,
            COALESCE(budget_amount.amount, 0.0) as budget_amount,
            COALESCE(prior_month.total_amount, 0.0) as total_amount_for_prior_month
          FROM 
            receipts
          LEFT JOIN 
            (
                SELECT 
                    budgets.category,
                    SUM(budgets.amount) as amount
                FROM 
                    budgets
                WHERE 
                    budgets.month = ${month}
                    AND budgets.username = '${username}'
                GROUP BY 
                    budgets.category
            ) budget_amount
          ON 
            receipts.category = budget_amount.category
          LEFT JOIN
            (
                SELECT 
                    category,
                    SUM(amount) as total_amount
                FROM 
                    receipts
                WHERE 
                    EXTRACT(MONTH FROM date) = ${month - 1}
                    AND username = '${username}'
                GROUP BY 
                    category
            ) prior_month
          ON 
            receipts.category = prior_month.category
          WHERE 
            EXTRACT(MONTH FROM receipts.date) = ${month}
            AND receipts.username = '${username}'
          GROUP BY 
            receipts.category, EXTRACT(MONTH FROM receipts.date), budget_amount.amount, prior_month.total_amount;

          `;

  //Running the query
  var data = await db.task('get-everything', task => { return task.batch([task.any(totalsByCategory), task.any(totalForMonth)]);});

  //If query is empty, there is nothing to show for the selected month. This will redirect to home again and will select any month that the user does have expenses for, and show that.
  if(data[0].length === 0){
    res.redirect(`/home?login=true&error=true`)
  }

  else{

    if(req.query.error){
      res.render('pages/home', {data, message: "No expenses yet for selected month!", curr_user: username} );
    }
    else{
      //Show expenses/income for selected month
      res.render('pages/home', {data, curr_user: username});

    }
  }
  }
  else{
    var month = "";
    if(req.query.month){
      month = parseInt(req.query.month.substring(5));
      res.redirect(`/home?login=true&show=true&month=2023-${month}`);
    }
    else{
      //Query to return any expenses for any month, in the event that the month the user tried to select did not have any expenses
      const get_month =  await db.any(`SELECT EXTRACT(MONTH from date) as any_month FROM receipts WHERE username = '${req.session.user.username}';`);

      //If the query is empty, the user doesn't have any expenses at all.
      if(get_month.length === 0){
        res.render('pages/homeError', {
        message: "No expenses yet to display for user " + username + "!", curr_user: username
        });
      }
      else{
        //Otherwise, get the month the user has expenses for
        month = get_month[0].any_month;
        //If there was an error in the query, the user tried to view a month which had no expenses. They then get redirected to home and are shown expenses for a month that they do have expenses for.
        if(req.query.error){
          res.redirect(`/home?login=true&show=true&error=true&month=2023-${month}`);
        }
        else{
          res.redirect(`/home?login=true&show=true&month=2023-${month}`);
        } 
      }
    }
  }

});

//Budget adjustment endpoint (POST)
app.post('/adjust_budget', (req, res) =>{ 

  //Runs query to update budget with the correct value for the correct category for the correct month, cannot have two rows in the table with the same username, month, and category
  var adjust_budget_query = `
    INSERT INTO budgets (username, month, amount, category) VALUES ($1, $2, $3, $4)
    ON CONFLICT (username, month, category)
    DO UPDATE SET amount = $3`;

  db.result(adjust_budget_query, [req.session.user.username, req.body.month, req.body.budgetAdjustment, req.body.category])

    .then(() => {
      //If successful, redirect to home
      res.redirect(`/home?login=true&month=2023-${req.body.month}`);
    })
    .catch((err) => {
      console.log(err);
    });

});

//Expense report endpoint (get)
app.get('/report', (req, res) => {
  //Session check
  if (!req.session.user) {
    return res.render('pages/login', {
      message: 'Please login or make an account.',
      error: true
    });
  }  
  

  if(!req.query.month){
    req.query.month = '2023-12'; //default to current month
  }

  const month = req.query.month;
  const username = req.session.user.username;

  //Query gets all receipts belonging to current user for selected month, sorted by oldest receipts first.
  query1 = `SELECT * FROM receipts WHERE username = '${username}' AND EXTRACT(MONTH FROM date) = ${month} ORDER BY date ASC;`;
  //Query to return totals for month for user
  querytotal = `

      SELECT 
        SUM(CASE WHEN income = false THEN amount ELSE 0 END) as monthlyTotalSpendings,
        SUM(CASE WHEN income = true THEN amount ELSE 0 END) as monthlyTotalIncome
      FROM receipts 
      WHERE username = '${username}' 
      AND EXTRACT(MONTH FROM date) = ${month};`;
  //Query to get current month by extracting from date
  getmonthname = `SELECT to_char(date, 'Month') AS monthstring FROM receipts WHERE username = '${username}' AND EXTRACT(MONTH FROM date) = ${month};`;
  //Run queries
  db.task('get-everything', task => {
    return task.batch([
      task.any(query1), //query 1
      task.any(querytotal), //query 2
      task.any(getmonthname) //query 3
    ]);
  })
  //If successful, render the report page with results from queries
    .then(Expenses => {
        res.render('pages/report', {
        Expenses,
        curr_user: username
        })
  
    });

});

//Profile page (get)
app.get('/profile', (req, res) => {
  //Session check
  if (!req.session.user) {
    return res.render('pages/login', {
      message: 'Please login or make an account.',
      error: true
    });
  } 
  //If session exists, show profile page for current user
  const username = req.session.user.username;
  res.render('pages/profile', {curr_user: username});
});

//Welcome endpoint
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});

//Get login
app.get('/login', (req, res) => {
  res.render('pages/login')
});

//Logout (get)
app.get('/logout', (req, res) => {
  //Destroy the user's session
  req.session.destroy();
  res.render('pages/login', {
    message: "Logged out successfully!",
    error: false
  })
});

//Register (get)
app.get('/register', (req, res) => {
  //Destroy the user's session if it exists
  if (req.session.user) {
    req.session.destroy();
  }
  res.render('pages/register');
});


//Register endpoint (POST)
app.post('/register', async (req, res) => {

  // Can't have blank username or password
  if (req.body.username === '' || req.body.password === '') {
    return res.render('pages/register', {
      message: 'Fields cannot be blank.',
      error: true
    })
  }
  //hash the password using bcrypt library
  const hash = await bcrypt.hash(req.body.password, 10);
  if(hash.err){
    console.log('Error hashing password');
  }
  else{
    //Insert user's credentials into users table
    try{
      const query = `insert into users (username, password) values($1, $2)`
      const insertQuery = await db.any(query, [req.body.username, hash]);
      res.redirect('/login');
    }
    catch{
      //If username already exists, render register ejs page with username taken message
      res.render('pages/register', {
        error: true,
        message: 'Username taken!'

      });
    }
    
  }
});


//Login (post)
app.post('/login', async (req, res) => {
  try{
    //Get credentials from users table based on login form data
    userQuery = `select * from users where username = $1`;
    const find_user = await db.any(userQuery, [req.body.username]);

    //If user does not exist in users table
    if(find_user.length == 0){
      res.render('pages/login', {
        message: 'User not found.',
        error: true
      });
    }
 
    else{
      // check if password from request matches with password in DB
      //If user exists, we compare passwords based on password entered in login form
      const user_found = find_user[0];
      //Compare login form password with password for user in DB
      const match = await bcrypt.compare(req.body.password, user_found.password);
      //If password does not match, send appropriate message
      if(!match){
        res.render('pages/login', {
          message: "Incorrect username or password.",
          error: true
        })
      }
      //Otherwise, if password matches, create session for user and redirect to /home
      else{

        user.username = user_found.username;
        req.session.user = user;
        res.redirect('/home?login=true');
      }

    }

    }
    //If invalid input is entered to login form, display appropriate message
    catch(error){
      res.render('pages/login', {
        message: "Invalid input!",
        error: true
      })
    }
  
  
});



// Delete account endpoint (delete)
app.delete('/profile/delete', async (req, res) => {
  try {
      const { username } = req.session.user;
 
 
      //Delete entry from users table using username from session
      await db.none('DELETE FROM users WHERE username = $1', [username]);
 
 
      //Still in progress (deleting profile picture)
      /*const profilePicturePath = `public/uploads/profile/profile_${username}`;
      if (fs.existsSync(profilePicturePath)) {
          fs.unlinkSync(profilePicturePath);
      }*/
 
 
      //Destroy the session upon deletion
      req.session.destroy();
      res.json({ success: true });
      
  } catch (error) { //Display appropriate error if the entry in the DB is not able to be deleted
      console.error('Error deleting account:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
 });
 
 //Profile settings endpoint (get)
 app.get('/profile/settings', (req, res) => {
  //Render profile settings page using username from session
  const username = req.session.user.username;
  res.render('pages/profile', {curr_user: username}); 
 });
 
 
 //Username change endpoint (post)
 app.post('/profile/settings/username', async (req, res) => {

  //Grab user's current username and desired username from the session and from the form respectively
  const currentUser = req.session.user;
  const newUsername = req.body.newUsername;
 
 
  try {
    //Check if form is empty
    if (!newUsername) {
      return res.status(400).json({ success: false, error: 'New username is required.' });
    }
 
 
    //If form is not empty, update the entry in the users table to change the username
    const updateUsernameQuery = `
      UPDATE users
      SET username = $1
      WHERE username = $2
    `;
    await db.none(updateUsernameQuery, [newUsername, currentUser.username]);
 
 
    //Update the username in the session
    req.session.user.username = newUsername;
 
    //Add a success message to the session
    req.session.successMessage = 'Username updated successfully';
 
    //Redirect back to profile settings if successful
    res.redirect('/profile/settings');
  } catch (error) { //Check for database error if username couldn't be updated
    console.error('Error updating username:', error);
    res.status(500).send('Internal Server Error');
  }
 });
 
 
 //Password change endpoint (POST)
 app.post('/profile/settings/password', async (req, res) => {
  //Get current usenrame from session, and the new password from the request body (entered in form)
  const currentUser = req.session.user;
  const { newPassword, confirmPassword } = req.body;
 
 
  try {
    //Password and confirmed password should match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match' });
    }
 
 
    //Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
 
 
    //Update the current user's password with the new hashed password in the users table
    const updatePasswordQuery = `
      UPDATE users
      SET password = $1
      WHERE username = $2
    `;
    await db.none(updatePasswordQuery, [hashedPassword, currentUser.username]);
 
 
    //Add a success message to the session
    req.session.successMessage = 'Password updated successfully';
 
    //Redirect to profile settings if successful
    res.redirect('/profile/settings');

  } catch (error) {//Check for database error when updating current user's password
    console.error('Error updating password:', error);
    res.status(500).send('Internal Server Error');
  }
 });
 

module.exports = app.listen(3000);