const User = require('../models/User');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const userData = req.body;

    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = await User.create(userData);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userData = req.body;

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await User.findByEmail(userData.email);
      if (emailExists) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    const user = await User.update(id, userData);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const success = await User.delete(id);
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    await User.updatePassword(id, password);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
};
