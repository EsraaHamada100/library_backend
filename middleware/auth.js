
const connection = require("../database/connection");

const auth = (req, res, next) => {
    const { authorization } = req.headers;
    // if the user forget to include authentication in the header
    if (!authorization) {
        res.statusCode = 401;
        res.send({
            message: "You are unauthorized"
        });
        return;
    }
    connection.query(`SELECT * FROM users WHERE user_id = ${authorization}`,
        (err, result) => {
            // SERVER error
            if (err) {
                console.log(err);
                res.statusCode = 500;
                res.send({
                    message: "Server error",
                });
                return;
            }

            // if he doesn't exist in database
            if (!result[0]) {
                res.statusCode = 401;
                res.send({
                    message: "You are unauthorized"
                });
                return;
            }
            next();
        });

}

module.exports = auth;