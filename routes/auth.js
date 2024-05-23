const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();

router.post('/register',authController.register);

router.post('/login', authController.login);


router.get('/dashboard', authController.dashboard);
router.get('/profile', authController.profile);


module.exports = router;