const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
require('dotenv').config();

const app = express();
const db = pgp(dbConfig);

app.listen(3000, () => {
    console.log('listening on port 3000');
});