const express = require('express');
const { login, getProfile } = require('../controllers/authController');
const { loginValidation } = require('../middleware/validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', loginValidation, login);
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
