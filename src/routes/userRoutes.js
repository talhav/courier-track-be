const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
} = require('../controllers/userController');
const { userValidation } = require('../middleware/validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { USER_ROLES } = require('../config/constants');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', authorizeRoles(USER_ROLES.ADMIN), getAllUsers);
router.get('/:id', authorizeRoles(USER_ROLES.ADMIN), getUserById);
router.post('/', authorizeRoles(USER_ROLES.ADMIN), userValidation, createUser);
router.put('/:id', authorizeRoles(USER_ROLES.ADMIN), updateUser);
router.delete('/:id', authorizeRoles(USER_ROLES.ADMIN), deleteUser);
router.patch('/:id/password', authorizeRoles(USER_ROLES.ADMIN), updatePassword);

module.exports = router;
