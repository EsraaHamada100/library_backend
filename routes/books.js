const router = require('express').Router();
// const adminAuth = require('../middleware/admin');
const connection = require('../database/connection');


// Get request => get all movies
router.get("/", (req, res) => {
    connection.query("select * from books", (err, result, fields) => {
        res.send(result);
    });
});
// Post request => save a new book
router.post("/", (req, res) => {
    const data = req.body;
    // INSERT INTO tableName SET column1 = 'value1', column2 = 'value2';
    // he uses this way here
    connection.query("insert into books set ?",
        {
            book_name: data.book_name,
            description: data.description,
            author: data.author, field: data.field,
            publication_data: data.publication_data,
            cover_link: data.cover_link,
            pdf_file: data.pdf_file,
        },
        (err, result) => {
            if (err) {
                result.statusCode = 500;
                res.send({
                    message: "Failed to save the book"
                })

            } else {
                res.json({
                    message: "book created !"
                })
            }
        });

});

// Get request => get a specific movie
router.get("/:id", (req, res) => {
    const { id } = req.params;
    // you can also use :
    // "select * from movie where id=?",{id}
    connection.query("select * from movie where ?", { id: id }, (err, result, fields) => {
        // if there is no result this will return undefined which means false
        if (result[0]) {
            res.json(result[0]);
        } else {
            res.statusCode = 404;
            res.json({
                message: "Movie not found",
            });
        }
    });
});
;

// Put request => modify a specific movie
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const data = req.body;
    connection.query("update movies set ? where id = ?",
        [{ name: data.name, description: data.description }, id], (err, result) => {
            if (err) {
                res.statusCode = 505;
                res.json({
                    message: "Failed to update the movie"
                });
            } else {
                res.json({
                    message: "Movie updated successfully"
                });
            }
        });
});

// Delete request => delete a movie
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    connection.query("delete from movies where ?", { id: id }, (err, result) => {
        if (err) {
            res.statusCode = 500;
            res.json({
                message: "failed to delete the movie",
            });
        }
        res.json({
            message: "Movie deleted successfully"
        })
    });
});

module.exports = router;