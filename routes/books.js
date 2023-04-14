const router = require("express").Router();
const connection = require("../database/connection");

// middleware
const adminAuth = require("../middleware/admin_auth");
const auth = require("../middleware/auth");
// Get request => get all authors but distinct
router.get("/authors", auth, (req, res) => {


  // replaces any quotation marks in the chapter title and description
  //  with escaped quotes (this is to avoid invalid JSON syntax).
  connection.query(
    `SELECT DISTINCT author FROM books`,
    (err, result, fields) => {
      if (err) {
        res.statusCode = 500;
        res.send({
          message: "Failed get authors",
        });
      } 
      // to get all authors as a list
      const authors = result.map(authorMap => authorMap.author);

      console.log(result);
      res.send({'authors': authors});
    }
  );
});


// Get request => get all authors but fields but distinct
router.get("/fields", auth, (req, res) => {


  // replaces any quotation marks in the chapter title and description
  //  with escaped quotes (this is to avoid invalid JSON syntax).
  connection.query(
    `SELECT DISTINCT field FROM books`,
    (err, result, _) => {
      if (err) {
        res.statusCode = 500;
        res.send({
          message: "Failed get fields",
        });
      } 
      // to get all fields as a list
      const fields = result.map(fieldMap => fieldMap.field);

      console.log(result);
      res.send({'fields': fields});
    }
  );
});


// Get request => search for books or get them (user & admin)
router.get("/", auth, (req, res) => {

  // console.log(req.query.author);
  let conditions = [];
  // making sure that he specify an author in the parameters
  if (req.query.author && req.query.author.trim() != '') {
    conditions.push(`author='${req.query.author}'`);
  }
  if (req.query.field && req.query.field.trim() != '') {
    conditions.push(`field='${req.query.field}'`);
  }
  // here I will return the book if it's contain this word
  if (req.query.book_name && req.query.book_name.trim() != '') {
    conditions.push(`book_name LIKE '%${req.query.book_name}%'`);
  }
  let whereClause = '';

  if (conditions.length > 0) {
    whereClause = `WHERE ${conditions.join(" AND ")}`;
  }

  // replaces any quotation marks in the chapter title and description
  //  with escaped quotes (this is to avoid invalid JSON syntax).
  connection.query(
    `select books.*,  CONCAT('[', GROUP_CONCAT(
        CONCAT('{ "title": "', REPLACE(chapters.chapter_title, '"', '\\"'), 
               '", "description": "', REPLACE(chapters.description, '"', '\\"'), '" }')), ']'
    ) AS chapters
    FROM books
    LEFT JOIN chapters ON books.book_id = chapters.book_id ${whereClause} GROUP BY books.book_id`,
    (err, result, fields) => {
      result.map((book) => (book["chapters"] = JSON.parse(book["chapters"])));
      res.send(result);
    }
  );
});

// Get a specific book
router.get("/:id", auth, (req, res) => {
  const { id } = req.params;
  const query = `select books.*,  CONCAT('[', GROUP_CONCAT(
        CONCAT('{ "title": "', REPLACE(chapters.chapter_title, '"', '\\"'), 
               '", "description": "', REPLACE(chapters.description, '"', '\\"'), '" }')), ']'
    ) AS chapters
    FROM books
    LEFT JOIN chapters ON books.book_id = chapters.book_id  WHERE books.book_id=?`;
  connection.query(query, id, (err, result) => {
    if (result[0] && result[0].book_id != null) {
      // to convert a stringList to json data
      result[0].chapters = JSON.parse(result[0].chapters);
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
router.post("/", adminAuth, (req, res) => {
  const data = req.body;

  connection.query(
    "insert into books set ?",
    {
      book_name: data.book_name,
      description: data.description,
      author: data.author,
      field: data.field,
      publication_date: data.publication_date,
      cover_link: data.cover_link,
      pdf_file: data.pdf_file,
    },

    (err, result) => {
      console.log(err, result);

      if (err) {
        res.statusCode = 500;
        res.send({
          message: "Failed to save the book",
        });
      } else {
        res.json({
          message: "book created !",
        });
      }
    }
  );
});

// Put request => modify a specific book
router.put("/:id", adminAuth, (req, res) => {
  const { id } = req.params;
  const data = req.body;
  let columns = [];

  connection.query(
    "update books set ? where book_id = ?",
    [
      {
        book_name: data.book_name,
        description: data.description,
        author: data.author,
        field: data.field,
        publication_date: data.publication_date,
        cover_link: data.cover_link,
      },
      id,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        res.statusCode = 505;
        res.json({
          message: "Failed to update the book",
        });
      } else {
        res.json({
          message: "Book updated successfully",
        });
      }
    }
  );
});

// Delete request => delete a book
router.delete("/:id", adminAuth, (req, res) => {
  const { id } = req.params;
  connection.query(
    "delete from books where ?",
    { book_id: id },
    (err, result) => {
      if (err) {
        console.log(err);
        res.statusCode = 500;
        res.json({
          message: "Failed to delete the book",
        });
      }
      res.json({
        message: "book deleted successfully",
      });
    }
  );
});



module.exports = router;
