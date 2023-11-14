const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.

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

//Home endpoint
app.get('/home', (req, res) => {
  res.render('pages/home');
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
  res.render('pages/register');
});


//Register endpoint (POST)
app.post('/register', async (req, res) => {
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
      res.redirect('/register');
   
    }
 
    else{
      // check if password from request matches with password in DB
      const user = find_user[0];
      const match = await bcrypt.compare(req.body.password, user.password);
      if(!match){
        res.render('pages/login', {
          message: "Incorrect username or password.",
          error: true
        })
      }
      else{
        req.session.user = user;
        req.session.save();
    
        res.redirect('/home');
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