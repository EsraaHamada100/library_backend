const router = require('express').Router();
// const adminAuth = require('../middleware/admin');
const connection = require('../database/connection');

// Get request => get all users
router.get("/", (req, res) => {
  connection.query("select * from requests", (err, result, fields) => {
      res.send(result);
      console.log(result);
  });
});

// Get request => get a specific user
router.get("/:id", (req, res) => {
  const { id } = req.params;
  connection.query("SELECT * FROM requests WHERE ?", { request_id : id }, (err, result, fields) => {
      if (result[0]) {
          res.json(result[0]);
      } else {
          res.statusCode = 404;
          res.json({
              message: "request not found !",
          });
      }
  });
});

// Post request => save a new user
router.post("/", (req, res) => {
  const data = req.body;
  // INSERT INTO tableName SET column1 = 'value1', column2 = 'value2';
  // he uses this way here
  connection.query("insert into requests set ?",
      {
          request_id: data.request_id	,
          user_id: data.user_id,
          book_id: data.book_id,
          approval_state: data.approval_state,
      },
      (err, result) => {
          if (err) {
            console.log(err);
              result.statusCode = 500;
              res.send({
                  message: "Failed to save the request"
              })

          } else {
              res.json({
                  message: "request added successfully!"
              })
          }
      });

});



// Put request => modify a specific movie
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;
  connection.query("update requests set ? where request_id = ?",
      [{ 
          request_id: data.request_id	,
          user_id: data.user_id,
          book_id: data.book_id,
          approval_state: data.approval_state,
         }, id], (err, result) => {
          if (err) {
              console.log(err);
              res.statusCode = 505;
              res.json({
                  message: "Failed to update the request !"
              });
          } else {
              res.json({
                  message: "request updated successfully !"
              });
          }
      });
});

// Delete request => delete a movie
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  connection.query("delete from requests where ?", { request_id	: id }, (err, result) => {
      if (err) {
          console.log(err);
          res.statusCode = 500;
          res.json({
              message: "Failed to delete the request!",
          });
      }
      res.json({
          message: "request deleted successfully!"
      })
  });
});

module.exports = router;




