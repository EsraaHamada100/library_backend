const express = require('express');
const bodyParser = require('body-parser');
const app = express();


const session = require('express-session');

// to solve  Server is not configured to allow requests from your origin. error
const cors = require('cors');

const books = require('./routes/books.js');
const chapters = require('./routes/chapters.js');
const users = require('./routes/users.js');
const search_terms = require('./routes/search_terms.js');
const requests = require('./routes/requests.js');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
// Set up session middleware

// We add this because we want it to set teh access permission to cookies
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
  }));
  app.use(cors());
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });

// here the string is refers to the parent route
// it's the route that repeats in all request
app.use("/books", books);
app.use("/chapters", chapters);
app.use("/users", users);
app.use("/search_terms", search_terms);
app.use("/requests", requests);


app.listen(4000, 'localhost', () => {
    console.log("SERVER IS RUNNING");
});
