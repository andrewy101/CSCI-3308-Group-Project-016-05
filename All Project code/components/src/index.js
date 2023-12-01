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
app.use(express.static(path.join(__dirname, 'resources')));

app.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.redirect('/home');
});

const user = {
  username: undefined
}
// Display expense table
app.get('/expenses', (req, res) => {
  if (!req.session.user) {
    return res.render('pages/login', {
      message: 'Please login or make an account.',
      error: true
    });
  }
  db.any(`SELECT * FROM receipts WHERE username = $1 ORDER BY date DESC;`, [req.session.user.username])
  .then(receipts => {
    res.render('pages/expenses', {
      receipts
    });
  });
});

// New receipt page
app.get('/expenses/new', (req, res) => {
  if (!req.session.user) {
    return res.render('pages/login', {
      message: 'Please login or make an account.',
      error: true
    });
  }  
  const categories = db.any(`SELECT * FROM categories WHERE username IS NULL OR username = $1;`, [req.session.user.username])
  .then(categories => {
    res.render('pages/newExpense', {
      categories
    });
  });
});

//Create new receipt
app.post('/expenses/new', (req, res) => {
  if (!req.session.user) {
    return res.render('pages/login', {
      message: 'Please login or make an account.',
      error: true
    });
  }  
  db.tx(async t => {
    const receipt = await t.any(`INSERT INTO receipts (username, income, date, category, description, amount) values($1, $2, $3, $4, $5, $6) RETURNING *;`, 
    [req.session.user.username, req.body.income, req.body.date, req.body.category, req.body.description, req.body.amount]);

    for (let i = 0; i < req.body.lineItems.length; i++) {
      await t.none(`INSERT INTO items (receipt_id, name, amount) values($1, $2, $3);`, 
      [receipt[0].receipt_id, req.body.lineItems[i].name, req.body.lineItems[i].amount]);
    }

    res.sendStatus(200);
  });

  db.one(`SELECT category FROM categories WHERE (username = $1 OR username IS NULL) AND category = $2`,
  [req.session.user.username, req.body.category])
  .catch(err => {
    db.none(`INSERT INTO categories (username, category) values($1, $2);`, 
    [req.session.user.username, req.body.category]);
  });
}); 

// Delete expense rows
app.post('/expenses/delete', (req, res) => {
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

app.get('/expenses/info', (req, res) => {
  db.any(`SELECT * FROM items WHERE receipt_id = $1`, [req.query.id])
  .then(items => {
    res.json({
      items
    });
  });
});
//Home endpoint
app.get('/home', async (req, res) => {
  
  //This will fail if they don't have a session but have login=true in the query, therefore granting access when they shouldn't have it
  if (!(req.session.user && req.query.login)) {
    return res.render('pages/login', {
      message: 'Please login or make an account.',
      error: true
    });
  } 


  const username = req.session.user.username;

  if(req.query.show){

    var month = parseInt(req.query.month.substring(5));
    var totalForMonth = `

  SELECT 
    SUM(CASE WHEN income = false THEN amount ELSE 0 END) as monthlyTotalSpendings,
    SUM(CASE WHEN income = true THEN amount ELSE 0 END) as monthlyTotalIncome
  FROM receipts 
  WHERE username = '${username}' 
  AND EXTRACT(MONTH FROM date) = ${month};`;

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

  var data = await db.task('get-everything', task => { return task.batch([task.any(totalsByCategory), task.any(totalForMonth)]);});

  if(data[0].length === 0){
    res.redirect(`/home?login=true&error=true`)
  }

  else{
    if(req.query.error){
      res.render('pages/home', {data, message: "No expenses yet for selected month!"});
    }
    else{
      res.render('pages/home', {data});

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
      const get_month =  await db.any(`SELECT EXTRACT(MONTH from date) as any_month FROM receipts WHERE username = '${req.session.user.username}';`);

    
      if(get_month.length === 0){
        res.render('pages/homeError', {
        message: "No expenses yet to display for user " + username + "!"
        });
      }
      else{
        month = get_month[0].any_month;
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

app.post('/adjust_budget', (req, res) =>{ 

  var adjust_budget_query = `
  INSERT INTO budgets (username, month, amount, category) VALUES ($1, $2, $3, $4)
  ON CONFLICT (username, month, category)
  DO UPDATE SET amount = $3`;

  db.result(adjust_budget_query, [req.session.user.username, req.body.month, req.body.budgetAdjustment, req.body.category])

    .then((data) => {
      
      res.redirect(`/home?login=true&month=2023-${req.body.month}`);
    })
    .catch((err) => {
      console.log(err);
    });

});

app.get('/report', (req, res) => {
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

  query1 = `SELECT * FROM receipts WHERE username = '${username}' AND EXTRACT(MONTH FROM date) = ${month} ORDER BY date ASC;`;
  querytotal = `

  SELECT 
    SUM(CASE WHEN income = false THEN amount ELSE 0 END) as monthlyTotalSpendings,
    SUM(CASE WHEN income = true THEN amount ELSE 0 END) as monthlyTotalIncome
  FROM receipts 
  WHERE username = '${username}' 
  AND EXTRACT(MONTH FROM date) = ${month};`;
  
  getmonthname = `SELECT to_char(date, 'Month') AS monthstring FROM receipts WHERE username = '${username}' AND EXTRACT(MONTH FROM date) = ${month};`;
  db.task('get-everything', task => {
    return task.batch([
      task.any(query1), //query 1
      task.any(querytotal), //query 2
      task.any(getmonthname)
    ]);
  })
    .then(Expenses => {
        res.render('pages/report', {
        Expenses
        })
  
    });

});

app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.render('pages/login', {
      message: 'Please login or make an account.',
      error: true
    });
  } 
  res.render('pages/profile');
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
  req.session.destroy();
  res.render('pages/login', {
    message: "Logged out successfully!",
    error: false
  })
});

//Register (get)
app.get('/register', (req, res) => {
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
  // To-DO: Insert username and hashed password into the 'users' table
  if(hash.err){
    console.log('Error hashing password');
  }
  else{
    try{
      const query = `insert into users (username, password) values($1, $2)`
      const insertQuery = await db.any(query, [req.body.username, hash]);
      res.redirect('/login');
    }
    catch{
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
    userQuery = `select * from users where username = $1`;
    const find_user = await db.any(userQuery, [req.body.username]);

    
    if(find_user.length == 0){
      res.render('pages/login', {
        message: 'User not found.',
        error: true
      });
    }
 
    else{
      // check if password from request matches with password in DB
      const user_found = find_user[0];
      const match = await bcrypt.compare(req.body.password, user_found.password);
      if(!match){
        res.render('pages/login', {
          message: "Incorrect username or password.",
          error: true
        })
      }
      else{

        user.username = user_found.username;
        req.session.user = user;
        res.redirect('/home?login=true');
      }

    }

    }
    catch(error){
      res.render('pages/login', {
        message: "Invalid input!",
        error: true
      })
    }
  
  
});



// Delete Account Endpoint
app.delete('/profile/delete', async (req, res) => {
  try {
      const { username } = req.session.user;
 
 
      // Add logic to delete the user's account from the database
      await db.none('DELETE FROM users WHERE username = $1', [username]);
 
 
      // Add logic to delete the user's profile picture file (if it exists)
      const profilePicturePath = `public/uploads/profile/profile_${username}`;
      if (fs.existsSync(profilePicturePath)) {
          fs.unlinkSync(profilePicturePath);
      }
 
 
      // Clear the session and respond with success
      req.session.destroy();
      res.json({ success: true });
  } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
 });
 
 
 
 
 
 
 // Profile settings page - GET route
 app.get('/profile/settings', (req, res) => {
  // Render the profile settings page
  res.render('pages/profile'); // Adjust the path if needed
 });
 
 
 // Change Username - POST route
 app.post('/profile/settings/username', async (req, res) => {
  const currentUser = req.session.user;
  const newUsername = req.body.newUsername;
 
 
  try {
    // Check if newUsername is provided
    if (!newUsername) {
      return res.status(400).json({ success: false, error: 'New username is required.' });
    }
 
 
    // Update the current user's username in the 'users' table
    const updateUsernameQuery = `
      UPDATE users
      SET username = $1
      WHERE username = $2
    `;
    await db.none(updateUsernameQuery, [newUsername, currentUser.username]);
 
 
    // Update the username in the session
    req.session.user.username = newUsername;
 
 
    // Add a success message to the session
    req.session.successMessage = 'Username updated successfully';
 
 
    res.redirect('/profile/settings');
  } catch (error) {
    console.error('Error updating username:', error);
    res.status(500).send('Internal Server Error');
  }
 });
 
 
 // Change Password - POST route
 app.post('/profile/settings/password', async (req, res) => {
  const currentUser = req.session.user;
  const { newPassword, confirmPassword } = req.body;
 
 
  try {
    // Validate that newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match' });
    }
 
 
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
 
 
    // Update the current user's password in the 'users' table
    const updatePasswordQuery = `
      UPDATE users
      SET password = $1
      WHERE username = $2
    `;
    await db.none(updatePasswordQuery, [hashedPassword, currentUser.username]);
 
 
    // Add a success message to the session
    req.session.successMessage = 'Password updated successfully';
 
 
    res.redirect('/profile/settings');
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).send('Internal Server Error');
  }
 });
 

module.exports = app.listen(3000);