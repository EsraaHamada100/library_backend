
const router = require('express').Router();
const connection = require('../database/connection');


// Get request => get all chapters of specific book
router.get("/:id", (req, res) => {
    const { id } = req.params;
    connection.query("select * from chapters where ?", { book_id: id }, (err, result, fields) => {
        res.send(result);
    });
});


// Post request => add a chapter
router.post("/", (req, res) => {
    const data = req.body;

    connection.query("insert into chapters set ?",
        { book_id: data.book_id, chapter_title: data.chapter_title, description: data.description },
        (err) => {
            if (err) {
                res.statusCode = 500;
                res.send({
                    message: "Failed to save the chapter"
                })

            } else {
                res.json({
                    message: "chapter created !"
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