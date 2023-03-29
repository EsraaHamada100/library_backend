const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const books = require('./routes/books.js');
const users = require('./routes/users.js');
const search_terms = require('./routes/search_terms.js');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// here the string is refers to the parent route
// it's the route that repeats in all request
app.use("/books", books);
app.use("/users", users);
app.use("/search_terms", search_terms);

app.listen(4000, 'localhost', () => {
    console.log("SERVER IS RUNNING");
});
