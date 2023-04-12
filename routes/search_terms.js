const router = require('express').Router();
// const adminAuth = require('../middleware/admin');
const connection = require('../database/connection');
const { route } = require('./books');

const auth = require('../middleware/auth');
// Get request => get all search_terms or get search terms for specific user
router.get("/", auth, (req, res) => {
    let whereClause = '';
    if (req.query.user_id && req.query.user_id.trim() != '') {
        whereClause = `where user_id = ${req.query.user_id} `;
    }
    connection.query(`select * from search_terms ${whereClause}`, (err, result, fields) => {
        if (err) {
            console.log(err);
            result.statusCode = 500;
            res.send({
                message: "Server error, Failed to add search term"
            })

        } else {
            res.send(result);
        }

    });
});

// Get request => get a specific search term
// (I comment that because we will not gonna need it )
// router.get("/:id", (req, res) => {
//   const { id } = req.params;
//   connection.query("SELECT * FROM search_terms WHERE ?", { user_id : id }, (err, result, fields) => {
//           res.json(result);
//   });
// });

// Post request => save a new search term

router.post("/", auth, (req, res) => {
    const data = req.body;
    connection.query("insert into search_terms set ?",
        {
            user_id: data.user_id,
            search_word: data.search_word,
            search_date: data.search_date,
        },
        (err, result) => {
            if (err) {
                console.log(err);
                result.statusCode = 500;
                res.send({
                    message: "Server error, Failed to add search term"
                })

            } else {
                res.json({
                    message: "added successfully"
                })
            }
        });

});



// Put search term => modify a specific search_term 
// (I comment it because no user can chang his search terms)
// router.put("/:id", (req, res) => {
//   const { id } = req.params;
//   const data = req.body;
//   connection.query("update search_terms set ? where search_id = ?",
//       [{ 
//         search_id: data.search_id,
//         user_id: data.user_id,
//         search_word	: data.search_word,
//         search_date: data.search_date,
//          }, id], (err, result) => {
//           if (err) {
//               console.log(err);
//               res.statusCode = 505;
//               res.json({
//                   message: "Failed to update !"
//               });
//           } else {
//               res.json({
//                   message: "updated successfully !"
//               });
//           }
//       });
// });

// Delete request => delete a search term

router.delete("/:id", auth, (req, res) => {
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

// delete request => delete all searches for a specific user
router.delete('/', auth, (req, res) => {
    const userId = req.query.user_id;
    let whereClause = '';
    if (userId && userId.trim() != '') {
        whereClause = `WHERE user_id=${userId}`;
        connection.query(`delete from search_terms where user_id=${userId}`,
            (err, result) => {
                if (err) {
                    res.statusCode = 500;
                    res.json({
                        message: "Failed to delete the search!",
                    });
                } else {
                    res.json({
                        message: "All search terms are deleted successfully!",
                    });
                }
            });
    }
    // the user doesn't send the user_id 
    else {
        res.statusCode = 400;
        res.send({
            message: "You should provide a valid user id"
        });
    }
});

module.exports = router;






