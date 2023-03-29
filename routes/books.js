const router = require('express').Router();
// const adminAuth = require('../middleware/admin');
const connection = require('../database/connection');
const formidable = require('formidable');
const { PassThrough } = require('stream');
const PDFDocument = require('pdfkit');
const fs = require('fs');


// Get request => search for books or get them

router.get("/", (req, res) => {
    console.log(req.query.author);
    let conditions = [];
    // making sure that he specify an author in the parameters
    if (req.query.author && req.query.author.trim != '') {
        conditions.push(`author='${req.query.author}'`);
    }
    if (req.query.field && req.query.field.trim != '') {
        conditions.push(`field='${req.query.field}'`);
    }
    if (req.query.book_name && req.query.book_name.trim != '') {
        conditions.push(`book_name='${req.query.book_name}'`);
    }
    let whereClause = '';

    if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(' AND ')}`;
    }
    connection.query(`select books.*, chapters.chapter_title, chapters.description from books INNER JOIN chapters
    ON books.book_id = chapters.book_id ${whereClause} GROUP BY books.book_id`, (err, result, fields) => {
        res.send(result);
    });
});

// Get a specific book 
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM books WHERE ?';
    connection.query(query, { book_id: id }, (err, result, fields) => {
        if (result[0]) {
            res.json(result[0]);
        } else {
            res.statusCode = 404;
            res.json({
                message: "Book not found",
            });
        }
    });
});

// Post request => save a new book
router.post("/", (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        // the  error happens when we try to parse the form data
        if (err) {
            console.log(err);
            return res.end('Error parsing form data.');
        }
        console.log(files);

        connection.query("insert into books set ?",
            {
                book_name: fields.book_name,
                description: fields.description,
                author: fields.author,
                field: fields.field,
                publication_date: fields.publication_date,
                cover_link: fields.cover_link,
                pdf_file: files.pdf_file,
            },

            (err, result) => {
                console.log(err, result);

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
            },
        );

    });
});

// Get request => get a specific book pdf 
// TODO implementing that latter
router.get("/download_file/:id", (req, res) => {
    const { id } = req.params;
    const query = 'SELECT pdf_file FROM books WHERE book_id = ?';
    connection.query(query, [id], (error, results) => {
        if (error || results.length == 0) {
            console.log(error);
            return res.status(404).send('File not found.');
        }

        const blobFile = results[0].blob_data;

        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result;

            // Create a new PDF document
            const doc = new PDFDocument();

            // Convert the text to PDF and add it to the document
            doc.text(text);

            // Save the PDF to a file
            const writeStream = fs.createWriteStream('output.pdf');
            doc.pipe(writeStream);
            doc.end();
            writeStream.on('finish', () => {
                console.log('PDF created successfully!');
            });
        };
        reader.readAsText(blobFile);
    });
});


// Put request => modify a specific movie
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const data = req.body;
    let columns = [];

    connection.query("update books set ? where book_id = ?",
        [{ book_name: data.book_name, description: data.description, author: data.author, field: data.field, publication_date: data.publication_date, cover_link: data.cover_link, }, id], 
        (err, result) => {
            if (err) {
                console.log(err);
                res.statusCode = 505;
                res.json({
                    message: "Failed to update the book"
                });
            } else {
                res.json({
                    message: "Book updated successfully"
                });
            }
        });
});

// Delete request => delete a movie
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    connection.query("delete from books where ?", { book_id: id }, (err, result) => {
        if (err) {
            console.log(err);
            res.statusCode = 500;
            res.json({
                message: "Failed to delete the movie",
            });
        }
        res.json({
            message: "Movie deleted successfully"
        })
    });
});

module.exports = router;

