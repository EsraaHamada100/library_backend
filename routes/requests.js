const router = require('express').Router();
const connection = require('../database/connection');

// authentications
const auth = require('../middleware/auth');

// Get request => get all requests or get a specific type of requests
router.get("/", auth, (req, res) => {
    let conditions = [];
    if (req.query.approval_state && req.query.approval_state.trim() != '') {
        conditions.push(`approval_state='${req.query.approval_state}'`);
    }
    if (req.query.user_id && req.query.user_id != '') {
        conditions.push(`user_id='${req.query.user_id}'`);
    }
    if (req.query.book_id && req.query.book_id != '') {
        conditions.push(`requests.book_id='${req.query.book_id}'`);
    }
    let whereClause = '';

    if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(" AND ")}`;
        console.log(whereClause);
    }

    connection.query(
        `select request_id, user_id, book_name, approval_state, pdf_file 
         from requests 
         join books on requests.book_id = books.book_id 
         ${whereClause}`,
        (err, result, fields) => {
            if (err) {
                console.log(err);
                res.statusCode = 500;
                res.send({
                    message: "Failed to get the requests",
                });
                return;
            }
            res.send(result);
        });
});

// Get request => get a specific request
router.get("/:id", auth, (req, res) => {
    const { id } = req.params;
    connection.query("SELECT * FROM requests WHERE ?", { request_id: id }, (err, result, fields) => {
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

// Post request => save a new request
router.post("/", auth, (req, res) => {
    const data = req.body;
    // INSERT INTO tableName SET column1 = 'value1', column2 = 'value2';
    // he uses this way here
    connection.query("insert into requests set ?",
        {
            user_id: data.user_id,
            book_id: data.book_id,
            approval_state: data.approval_state ? data.approval_state : "pending",
        },
        (err, result) => {
            if (err) {
                console.log(err);
                if (err.code === "ER_DUP_ENTRY") {
                    // Handle duplicate entry error
                    res.statusCode = 400;
                    res.send({
                        message: "Request already exists"
                    });
                } else {
                    res.statusCode = 500;
                    res.send({
                        message: "Failed to save the request"
                    });
                }

            } else {
                res.json({
                    message: "request added successfully!"
                })
            }
        });

});



// Put request => modify a specific request
router.put("/:id", auth, (req, res) => {
    const { id } = req.params;
    const data = req.body;
    connection.query("update requests set ? where request_id = ?",
        [{
            approval_state: data.approval_state ,
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

// Delete request => delete a request
router.delete("/:id", auth, (req, res) => {
    const { id } = req.params;
    connection.query("delete from requests where ?", { request_id: id }, (err, result) => {
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




