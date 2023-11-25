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

//Home endpoint
app.get('/home', (req, res) => {
  
  //This will fail if they don't have a session but have login=true in the query, therefore granting access when they shouldn't have it
  if (!(req.session.user && req.query.login)) {
    return res.render('pages/login', {
      message: 'Please login or make an account.',
      error: true
    });
  } 

  if(!req.query.month){
    req.query.month = '2023-12'; //default to current month
  }
  const month = parseInt(req.query.month.substring(5));
  const username = req.session.user.username;
  
 
  var totalForMonth = `SELECT SUM(amount) as monthlyTotal FROM receipts WHERE username = ${username} AND EXTRACT(MONTH FROM date) = ${month}`;

  var totalsByCategory = `
          SELECT 
            receipts.category,
            EXTRACT(MONTH FROM receipts.date) as curr_month,
            SUM(receipts.amount) as total_amount_for_category,
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
                    EXTRACT(MONTH FROM date) = ${month} - 1
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

  db.task('get-everything', task => {
    return task.batch([task.any(totalsByCategory), task.any(totalForMonth)]);
  })
    .then(data => {
      
      if(data[1][0].monthlytotal === 0 || data[1][0].monthlytotal === null){
        res.redirect('/home?login=true&month=2023-12&error=true');
      }
      else if (req.query.error){
        res.render('pages/home', {
          data,
          message: "No expenses yet for selected month!",
          error: true
          
        })
      }
      else{
        res.render('pages/home', {
          data
          
        })
      }
      
    })
    
    .catch(err => {
      console.log('SQL ERROR');
      console.log(err);

    });
});

app.post('/adjust_budget', (req, res) =>{ 

  var adjust_budget_query = `
  INSERT INTO budgets (username, month, amount, category) VALUES ($1, $2, $3, $4)
  ON CONFLICT (month, category)
  DO UPDATE SET amount = $3`;

  db.result(adjust_budget_query, [req.session.user.username, req.body.month, req.body.budgetAdjustment, req.body.category])

    .then(() => {
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
  res.render('pages/report');
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

// Display expense table
app.get('/expenses', (req, res) => {
  if (!req.session.user) {
    return res.render('pages/login', {
      message: 'Please login or make an account.',
      error: true
    });
  }  
  db.any(`SELECT * FROM expenses WHERE username = $1
          ORDER BY date DESC;`, [req.session.user.username])
  .then(expenses => {
    res.render('pages/expenses', {
      expenses
    });
  });
});

// Delete expense rows
app.post('/expenses/delete', (req, res) => {
  if (req.session.user) {
    db.tx(async t => {
      await t.none(`DELETE from expenses WHERE expense_id = $1;`, [parseInt(req.body.expense_id)]);
      res.redirect('/expenses');
    });
  }
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

module.exports = app.listen(3000);