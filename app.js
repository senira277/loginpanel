const express = require('express');
const mysql = require('mysql');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config({
    path: './.env'
})

//connect mysql
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    database : process.env.DATABASE
});

db.connect( (error) => {
    if(error){
        console.log(error);
    }else{
        console.log("mysql Connected!");
    }
})

const PORT = process.env.PORT || 5000;

const publicDirectory = path.join(__dirname, './public')

app.use(express.static(publicDirectory));
//parse URL-encoded bodies
app.use(express.urlencoded({extended: false}));

//parse JSON bodies
app.use(express.json());

app.use(cookieParser());

//template
app.set('view engine', 'hbs');

//define routes
app.use('/', require('./routes/pages'))
app.use('/auth', require('./routes/auth'));

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
})