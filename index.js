const express = require('express');
const bodyParser = require('body-parser');
const app = express();


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


  app.use(cors());


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
