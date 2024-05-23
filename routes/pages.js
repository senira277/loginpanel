const express = require('express');
const authMiddleware = require('../middleware/auth')

const router = express.Router();

router.get('/',(req,res) => {
    res.render('index');
});

router.get('/register',(req,res) => {
    res.render('register');
});

router.get('/login',(req,res) => {
    res.render('login');
});

router.get('/dashboard', authMiddleware.protect, (req, res) => {
    res.render('dashboard', { user: req.user });
});

router.get('/profile',authMiddleware.protect,(req,res) => {
  
    res.render('profile', {user: req.user});
});
module.exports = router;