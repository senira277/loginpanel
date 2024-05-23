
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    database : process.env.DATABASE
});

// Promisify db.query to use async/await
const query = promisify(db.query).bind(db);

exports.register = (req, res) => {
    console.log(req.body);

   //set vars
   
    const {name,email,password,passwordConfirm} = req.body; 

    //db queries -register
    db.query('SELECT email FROM users WHERE email = ?',[email],async (error, results) => {
        if(error){
            console.log(error);
        }
        if (results.length > 0) {
            // Email already registered
            return res.render('register', {
                message: 'Email already registered!'
            });
        }
        else if(password !== passwordConfirm){
            return res.render('register',{
                message: 'Passwords do NOT match!'
            });
        }
        //encrypt passwords
        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO users SET ?', {name: name, email: email, password:hashedPassword}, (error, results) => {
            if(error){
                console.log(error);
            } else {
                console.log(results);
                return res.render('register', {
                    message: 'User Registered!'
                });
            }
        })
    });

    


    
}


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Fetch user from the database
        const results = await query('SELECT * FROM users WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.render('login', { message: 'Email not registered!' });
        }

        const user = results[0];

        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render('login', { message: 'Password is incorrect!' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        // Cookie options
        const cookieOptions = {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true
        };

        res.cookie('jwt', token, cookieOptions);
        return res.redirect('dashboard'); // post-login page
    } catch (error) {
        console.error(error);
        return res.render('login', { message: 'An error occurred. Please try again.' });
    }
};

exports.dashboard = (req, res) => {
    res.render('dashboard');
}

exports.profile = async (req, res) => {
    if (!req.cookies.jwt) {
        return res.redirect('/login');
    }

    try {
        const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

        const results = await query('SELECT * FROM users WHERE id = ?', [decoded.id]);
        if (!results[0]) {
            return res.redirect('/login');
        }

        res.render('profile', {
            user: results[0]
        });
    } catch (error) {
        console.error(error);
        return res.redirect('/login');
    }
};

