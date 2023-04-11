const router = require("express").Router();
const connection = require("../database/connection");

const auth = require("../middleware/auth");
const adminAuth = require("../middleware/admin_auth");
const { hashPassword, verifyPassword, authenticateUser, getUserDataByEmail, getUserDataById} = require("../helper/user_functions");


//! Route handler for logging out
router.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy();

  res.send({
    message: 'Logout successful'
  });
});


//! Get request => get all users
// TODO add adminAuth
router.get("/", (req, res) => {
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


//! Get request => get a specific user
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

//! Post request => save a new user
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

//! login a user
router.post('/login', async (req, res) => {
  // Authenticate user credentials
  const email = req.body.email;
  const password = req.body.password;
  console.log( req.body.email,req.body.password);
  try {
    const isAuthenticated = await authenticateUser(email, password);
    if (isAuthenticated) {
      // Create a new session for the user
      const userData = await getUserDataByEmail(email);
      if(userData.active){
        res.send({ message: 'Logged in successfully!', data: userData });
      }else{
        res.statusCode = 401;
        res.send({message: "User account pending verification by administrator. Please try again later."});
      }

    } else {
      res.statusCode = 400;
      res.send({ message: 'Invalid username or password' });
    }
  } catch (err) {
    console.log(err);
    res.statusCode = 500;
    res.send({ message: ` Server error ` });
  }
});



//! Put request => modify a specific user
router.put("/:id", auth, (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const userData = getUserDataById(id);

  } catch (error) {
    res.statusCode = 505;
    res.json({
      message: "Failed to update the user !",
    });
    return;
  }
  connection.query(
    "update users set ? where user_id = ?",
    [
      {
        name: data.name || userData.name,
        email: data.email || userData.email,
        password: data.password || userData.password,
        phone: data.phone || userData.phone,
        active: data.active || userData.active,
        type: data.type || userData.type,
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

//! Delete request => delete a user
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



module.exports = router;
