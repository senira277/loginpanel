const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const mysql = require('mysql');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.protect = async (req, res, next) => {
    // Get token and check if it exists
    let token;
    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return res.redirect('/login');
    }

    try {
        // Verify token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // Check if user still exists
        const results = await promisify(db.query).bind(db)('SELECT * FROM users WHERE id = ?', [decoded.id]);
        if (!results[0]) {
            return res.redirect('/login');
        }

        req.user = results[0];
        next();
    } catch (error) {
        console.error(error);
        return res.redirect('/login');
    }
};
