const router = require('express').Router();
// const adminAuth = require('../middleware/admin');
const connection = require('../database/connection');

// Get request => get all search_terms
router.get("/", (req, res) => {
  connection.query("select * from search_terms", (err, result, fields) => {
      res.send(result);
      console.log(result);
  });
});

module.exports = router;

