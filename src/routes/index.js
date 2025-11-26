const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const shipmentRoutes = require('./shipmentRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/shipments', shipmentRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
