const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
require('dotenv').config();

const app = express();
const db = pgp(dbConfig);

module.exports = app.listen(3000);

app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
  });

  
