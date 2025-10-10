const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Rotas de autenticação
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/profile', protect, getUserProfile);

module.exports = router;