const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// const movies = require('./routes/movies.js');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// here the string is refers to the parent route
// it's the route that repeats in all request
// app.use("/movies", movies);

app.listen(4000, 'localhost', () => {
    console.log("SERVER IS RUNNING");
});