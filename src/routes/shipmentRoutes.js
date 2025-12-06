const express = require('express');
const {
  getAllShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
  duplicateShipment,
  trackShipment,
  getStatusHistory,
  addStatusUpdate,
  downloadInvoice,
} = require('../controllers/shipmentController');
const { shipmentValidation } = require('../middleware/validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { USER_ROLES } = require('../config/constants');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', getAllShipments);
router.get('/track/:consigneeNumber', trackShipment);
router.get('/:id', getShipmentById);
router.get('/:id/status-history', getStatusHistory);
router.get('/:id/download-invoice', downloadInvoice);
router.post('/', authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.OPERATOR), shipmentValidation, createShipment);
router.put('/:id', authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.OPERATOR), updateShipment);
router.delete('/:id', authorizeRoles(USER_ROLES.ADMIN), deleteShipment);
router.post('/:id/duplicate', authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.OPERATOR), duplicateShipment);
router.post('/:id/status', authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.OPERATOR), addStatusUpdate);

module.exports = router;
