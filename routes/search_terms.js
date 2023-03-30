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

// Get request => get a specific user
router.get("/:id", (req, res) => {
  const { id } = req.params;
  connection.query("SELECT * FROM search_terms WHERE ?", { search_id : id }, (err, result, fields) => {
      if (result[0]) {
          res.json(result[0]);
      } else {
          res.statusCode = 404;
          res.json({
              message: "search not found !",
          });
      }
  });
});

// Post request => save a new user
router.post("/", (req, res) => {
  const data = req.body;
  connection.query("insert into search_terms set ?",
      {
        search_id: data.search_id,
        user_id: data.user_id,
        search_word	: data.search_word,
        search_date: data.search_date,
      },
      (err, result) => {
          if (err) {
            console.log(err);
              result.statusCode = 500;
              res.send({
                  message: "not found !"
              })

          } else {
              res.json({
                  message: "added successfully"
              })
          }
      });

});



// Put request => modify a specific movie
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;
  connection.query("update search_terms set ? where search_id = ?",
      [{ 
        search_id: data.search_id,
        user_id: data.user_id,
        search_word	: data.search_word,
        search_date: data.search_date,
         }, id], (err, result) => {
          if (err) {
              console.log(err);
              res.statusCode = 505;
              res.json({
                  message: "Failed to update !"
              });
          } else {
              res.json({
                  message: "updated successfully !"
              });
          }
      });
});

// Delete request => delete a movie
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  connection.query("delete from search_terms where ?", { search_id: id }, (err, result) => {
      if (err) {
          console.log(err);
          res.statusCode = 500;
          res.json({
              message: "Failed to delete the search!",
          });
      }
      res.json({
          message: "search deleted successfully!"
      })
  });
});

module.exports = router;






