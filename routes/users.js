const router = require('express').Router();
// const adminAuth = require('../middleware/admin');
const connection = require('../database/connection');

// Get request => get all users
router.get("/", (req, res) => {
  connection.query("select * from users", (err, result, fields) => {
      res.send(result);
      console.log(result);
  });
});

// Get request => get a specific user
router.get("/:id", (req, res) => {
  const { id } = req.params;
  connection.query("SELECT * FROM users WHERE ?", { user_id : id }, (err, result, fields) => {
      if (result[0]) {
          res.json(result[0]);
      } else {
          res.statusCode = 404;
          res.json({
              message: "User not found !",
          });
      }
  });
});

// Post request => save a new user
router.post("/", (req, res) => {
  const data = req.body;
  // INSERT INTO tableName SET column1 = 'value1', column2 = 'value2';
  // he uses this way here
  connection.query("insert into users set ?",
      {
          user_id: data.user_id,
          email: data.email,
          password: data.password,
          phone: data.phone,
          active: data.active,
          type: data.type,
      },
      (err, result) => {
          if (err) {
            console.log(err);
              result.statusCode = 500;
              res.send({
                  message: "Failed to save the user"
              })

          } else {
              res.json({
                  message: "User added successfully!"
              })
          }
      });

});



// Put request => modify a specific movie
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;
  connection.query("update users set ? where user_id = ?",
      [{ user_id: data.user_id,
        email: data.email,
        password: data.password,
        phone: data.phone,
        active: data.active,
        type: data.type,
         }, id], (err, result) => {
          if (err) {
              console.log(err);
              res.statusCode = 505;
              res.json({
                  message: "Failed to update the user !"
              });
          } else {
              res.json({
                  message: "User updated successfully !"
              });
          }
      });
});

// Delete request => delete a movie
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  connection.query("delete from users where ?", { user_id: id }, (err, result) => {
      if (err) {
          console.log(err);
          res.statusCode = 500;
          res.json({
              message: "Failed to delete the user!",
          });
      }
      res.json({
          message: "user deleted successfully!"
      })
  });
});

module.exports = router;




