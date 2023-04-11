const connection = require("../database/connection");
const crypto = require("crypto");

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

function authenticateUser(email, password) {
    console.log(email, password);
    if (!(email && password)) {
        reject(new Error('undefined values'));

    }
    // I made that to use await
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM users WHERE email= ?",
            email,
            (err, result) => {
                if (err) {
                    console.log(err);
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
                } else {
                    resolve(false);
                }
            });
    });
}

function getUserDataByEmail(email) {
    return new Promise((resolve, reject) => {

        // return  the user data
        connection.query("SELECT  * FROM users WHERE email= ?", email,
            (err, result) => {
                if (err) {
                    console.log(err);
                    reject(new Error('An error occurred while getting user data'));
                }
                const user = result[0];
                return resolve({
                    'user_id': user.user_id,
                    'name': user.name,
                    'email': user.email,
                    'phone': user.phone,
                    'active': user.active,
                    'type': user.type,
                });
            });
    });
}

function getUserDataById(id) {
    return new Promise((resolve, reject) => {

        // return  the user data
        connection.query("SELECT  * FROM users WHERE email= ?", email,
            (err, result) => {
                if (err) {
                    console.log(err);
                    reject(new Error('An error occurred while getting user data'));
                }
                const user = result[0];
                return resolve(user);
            });
    });
}

module.exports = {
    hashPassword,
    verifyPassword,
    authenticateUser,
    getUserDataByEmail,
    getUserDataById,
};