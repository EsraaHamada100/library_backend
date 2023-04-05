const router = require("express").Router();
// const adminAuth = require('../middleware/admin');
const connection = require("../database/connection");
const crypto = require("crypto");

const auth = require("../middleware/auth");
const adminAuth = require("../middleware/admin_auth");


router.get('/check-login', (req, res) => {
  console.log(req.session);
  if (req.session.user) {
    res.send({ message: 'user is currently logged in' });
  } else {
    res.send({ message: 'No user is currently logged in' });
  }
});
// Route handler for logging out
router.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy();

  res.send({
    message: 'Logout successful'
  });
});

// Get request => get all users
// TODO add adminAuth
router.get("/",  (req, res) => {
  console.log(req.query.name);
  let conditions = [];
  // making sure that he specify an name in the parameters
  if (req.query.name && req.query.name.trim() != "") {
    conditions.push(`name='${req.query.name}'`);
  }
  if (req.query.email && req.query.email.trim() != "") {
    conditions.push(`email='${req.query.email}'`);
  }
  let whereClause = "";

  if (conditions.length > 0) {
    whereClause = `WHERE ${conditions.join(" AND ")}`;
  }
  connection.query(
    `select * from users ${whereClause}`, (err, result, fields) => {
      res.send(result);
    }
  )
});

// router.get("/", (req, res) => {
//     connection.query("select * from users", (err, result, fields) => {
//         res.send(result);
//         console.log(result);
//     });
// });

// Get request => get a specific user
router.get("/:id", adminAuth, (req, res) => {
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
  console.log(salt, '&', hash);
  userData =
    connection.query(
      "insert into users set ?",
      {
        name: data.name,
        email: data.email,
        password: `${salt}&${hash}`,
        phone: data.phone,
        active: data.active ? data.active : 0,
        type: data.type ? data.type : 'user',
      },
      (err, result) => {
        if (err) {
          console.log(err);
          if (err.sqlMessage.includes("Duplicate")) {
            res.statusCode = 409  //conflict
            res.send({
              message: "The email address is already registered."
            })
          } else {
            res.statusCode = 500;
            res.send({
              message: "Failed to save the user",
            });
          }
        } else {
          res.json({
            message: "User added successfully!",
          });
        }
      }
    );
});
// Post request => change active state

// Post request => Login
// router.post("/login", auth, function (req, res) {
//   const data = req.body;
//   console.log(req.body);
//   connection.query(
//     "SELECT * FROM users WHERE email= ?",
//     data.email,
//     (err, result) => {
//       if (result[0]) {
//         const passwordData = result[0].password.split("&");
//         const salt = passwordData[0];
//         const hash = passwordData[1];
//         console.log(passwordData);
//         const isMatch = verifyPassword(data.password, salt, hash);
//         if (isMatch) {
//           res.send({
//             message: "You have been logged in successfully",
//           });
//         } else {
//           res.statusCode = 401;
//           res.send({
//             message: "Invalid email or password",
//           });
//         }
//       } else {
//         res.statusCode = 404;
//         res.send("This email doesn't exist, you can sign up first");
//       }
//     }
//   );
// });

router.post('/login', async (req, res) => {
  // Authenticate user credentials
  const isAuthenticated = await authenticateUser(req.body.email, req.body.password);
  if (isAuthenticated) {
    // Create a new session for the user
    req.session.user = req.body.email;


  } else {
    res.statusCode = 400;
    res.send({ message: 'Invalid username or password' });
  }
});

function getUserData(email){
    
    // return  the user data
    connection.query("SELECT * FROM users WHERE email= ?", req.body.email,
      (err, result) => {
        if (err) {
          // res.statusCode = 500;
          // res.send({
          //   message: "Server error"
          // });
          return {};
        }
        const user = result[0];
        return {
          message: 'Login successfully',
          data: {
            'user_id': user.user_id,
            'email': user.email,
            'phone': user.phone,
            'type': user.type,
          }
        };

      });
}

// function authenticateUser(email, password) {
//   connection.query(
//     "SELECT * FROM users WHERE email= ?",
//     email,
//     (err, result) => {
//       if (err) {
//         console.log('an error accure');
//         return false;
//       }
//       if (result[0]) {
//         const passwordData = result[0].password.split("&");
//         const salt = passwordData[0];
//         const hash = passwordData[1];
//         console.log(passwordData);
//         const isMatch = verifyPassword(password, salt, hash);
//         if (isMatch) {
//           console.log('he is a valid user');
//           return true;
//         }else {
//           console.log('the password is incorrect');
//           return false;
//         }
//       }
//     });

// }

function authenticateUser(email, password) {
  // I made that to use await
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM users WHERE email= ?",
      email,
      (err, result) => {
        if (err) {
          console.log('an error accure');
          reject(new Error('An error occurred while authenticating user'));
        }
        if (result[0]) {
          const passwordData = result[0].password.split("&");
          const salt = passwordData[0];
          const hash = passwordData[1];
          console.log(passwordData);
          const isMatch = verifyPassword(password, salt, hash);
          if (isMatch) {
            console.log('he is a valid user');
            resolve(true);
          } else {
            console.log('the password is incorrect');
            resolve(false);
          }
        }
      });
  });
}
// Put request => modify a specific user
router.put("/:id", auth, (req, res) => {
  const { id } = req.params;
  const data = req.body;
  connection.query(
    "update users set ? where user_id = ?",
    [
      {
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

// Delete request => delete a user
router.delete("/:id", adminAuth, (req, res) => {
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
