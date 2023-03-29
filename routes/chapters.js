
const router = require('express').Router();
const connection = require('../database/connection');


// Get request => get a specific chapter
router.get("/:id", (req, res) => {
    const { id } = req.params;
    connection.query("select * from chapters where ?", { chapter_id: id }, (err, result, fields) => {
        if(result[0]) {
            res.send(result[0]);
        }else {
            res.statusCode = 404;
            res.json({
                "message": "Chapter not found"
            });
        }
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



// Put request => modify a specific chapter
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const data = req.body;
    connection.query("update chapters set ? where chapter_id = ?",
        [{ chapter_title: data.chapter_title, description: data.description }, id], (err, result) => {
            if (err) {
                res.statusCode = 505;
                res.json({
                    message: "Failed to update chapter data"
                });
            } else {
                res.json({
                    message: "Chapter updated successfully"
                });
            }
        });
});

// Delete request => delete a chapter
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    connection.query("delete from chapters where ?", { chapter_id: id }, (err, result) => {
        if (err) {
            res.statusCode = 500;
            res.json({
                message: "Failed to delete the chapter",
            });
        }
        res.json({
            message: "Chapter deleted successfully"
        })
    });
});

module.exports = router;