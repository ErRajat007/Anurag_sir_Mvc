const express = require('express'); 
const authController = require('../controllers/authController');
const router = express.Router();
  
router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/forgot-password', authController.forgotPassword);
router.put('/reset-password', authController.resetPassword);
router.post('/facebook-login', authController.fbLogin);
router.post('/google-login', authController.googleLogin);

module.exports = router;
