const router = require("express").Router();
// const adminAuth = require('../middleware/admin');
const connection = require("../database/connection");
const crypto = require("crypto");

// Get request => get all users
router.get("/", (req, res) => {
  console.log(req.query.name);
  let conditions = [];
  // making sure that he specify an name in the parameters
  if (req.query.name && req.query.name.trim != "") {
    conditions.push(`name='${req.query.name}'`);
  }
  if (req.query.email && req.query.email.trim != "") {
    conditions.push(`email='${req.query.email}'`);
  }
  let whereClause = '';

    if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(' AND ')}`;
    }
  });

// router.get("/", (req, res) => {
//     connection.query("select * from users", (err, result, fields) => {
//         res.send(result);
//         console.log(result);
//     });
// });

// Get request => get a specific user
router.get("/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "SELECT * FROM users WHERE ?",
    { user_id: id },
    (err, result, fields) => {
      if (result[0]) {
        res.json(result[0]);
      } else {
        res.statusCode = 404;
        res.json({
          message: "User not found !",
        });
      }
    }
  );
});

// Post request => save a new user
router.post("/", (req, res) => {
  const data = req.body;
  // INSERT INTO tableName SET column1 = 'value1', column2 = 'value2';
  // he uses this way here
  const { salt, hash } = hashPassword(data.password);
  connection.query(
    "insert into users set ?",
    {
      user_id: data.user_id,
      name: data.name,
      email: data.email,
      password: `${salt}&${hash}`,
      phone: data.phone,
      active: data.active,
      type: data.type,
    },
    (err, result) => {
      if (err) {
        console.log(err);
        result.statusCode = 500;
        res.send({
          message: "Failed to save the user",
        });
      } else {
        res.json({
          message: "User added successfully!",
        });
      }
    }
  );
});

// Post request => Login
router.post("/login", function (req, res) {
  const data = req.body;
  connection.query(
    "SELECT * FROM users WHERE email= ?",
    data.email,
    (err, result) => {
      if (result[0]) {
        const { salt, hash } = result[0].password.split("&");
        const isMatch = verifyPassword(data.password, salt, hash);
        if (isMatch) {
          res.send({
            message: "You have been logged in successfully",
          });
        } else {
          res.statusCode = 401;
          res.send({
            message: "Invalid email or password",
          });
        }
      } else {
        res.statusCode = 404;
        res.send("This email doesn't exist, you can sign up first");
      }
    }
  );
});

// Put request => modify a specific movie
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;
  connection.query(
    "update users set ? where user_id = ?",
    [
      {
        user_id: data.user_id,
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        active: data.active,
        type: data.type,
      },
      id,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        res.statusCode = 505;
        res.json({
          message: "Failed to update the user !",
        });
      } else {
        res.json({
          message: "User updated successfully !",
        });
      }
    }
  );
});

// Delete request => delete a movie
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "delete from users where ?",
    { user_id: id },
    (err, result) => {
      if (err) {
        console.log(err);
        res.statusCode = 500;
        res.json({
          message: "Failed to delete the user!",
        });
      }
      res.json({
        message: "user deleted successfully!",
      });
    }
  );
});

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha256")
    .toString("hex");
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const computedHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha256")
    .toString("hex");
  return computedHash === hash;
}

module.exports = router;

