const { body, query, validationResult } = require('express-validator');
const { SHIPMENT_STATUS, SERVICE_TYPE, SHIPMENT_TYPE, INVOICE_TYPE, CURRENCY_TYPE, USER_ROLES } = require('../config/constants');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const shipmentValidation = [
  body('service').isIn(Object.values(SERVICE_TYPE)).withMessage('Invalid service type'),
  body('companyName').notEmpty().trim().withMessage('Company name is required'),
  body('shipperName').notEmpty().trim().withMessage('Shipper name is required'),
  body('shipperPhone').notEmpty().trim().withMessage('Shipper phone is required'),
  body('shipperAddress').notEmpty().trim().withMessage('Shipper address is required'),
  body('shipperCountry').notEmpty().trim().withMessage('Shipper country is required'),
  body('shipperCity').notEmpty().trim().withMessage('Shipper city is required'),
  body('shipperPostal').notEmpty().trim().withMessage('Shipper postal code is required'),
  body('consigneeCompanyName').notEmpty().trim().withMessage('Consignee company name is required'),
  body('receiverName').notEmpty().trim().withMessage('Receiver name is required'),
  body('receiverEmail').isEmail().withMessage('Valid receiver email is required'),
  body('receiverPhone').notEmpty().trim().withMessage('Receiver phone is required'),
  body('receiverAddress').notEmpty().trim().withMessage('Receiver address is required'),
  body('receiverCountry').notEmpty().trim().withMessage('Receiver country is required'),
  body('receiverCity').notEmpty().trim().withMessage('Receiver city is required'),
  body('receiverZip').notEmpty().trim().withMessage('Receiver zip code is required'),
  body('accountNo').notEmpty().trim().withMessage('Account number is required'),
  body('shipmentType').isIn(Object.values(SHIPMENT_TYPE)).withMessage('Invalid shipment type'),
  body('pieces').isInt({ min: 1 }).withMessage('Pieces must be at least 1'),
  body('description').notEmpty().trim().withMessage('Description is required'),
  body('fragile').optional({ nullable: true }).isBoolean().withMessage('Fragile must be a boolean'),
  body('currency').isIn(Object.values(CURRENCY_TYPE)).withMessage('Invalid currency type'),
  body('shipperReference').optional({ nullable: true, checkFalsy: true }).trim(),
  body('comments').optional({ nullable: true, checkFalsy: true }).trim(),
  body('totalVolumetricWeight').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage('Total volumetric weight must be positive'),
  body('dimensions').optional({ nullable: true, checkFalsy: true }).trim(),
  body('weight').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage('Weight must be positive'),
  body('invoiceType').optional({ nullable: true, checkFalsy: true }).isIn(Object.values(INVOICE_TYPE)).withMessage('Invalid invoice type'),
  validate,
];

const userValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('fullName').notEmpty().trim().withMessage('Full name is required'),
  body('phone').optional({ nullable: true, checkFalsy: true }).trim(),
  body('role').isIn(Object.values(USER_ROLES)).withMessage('Invalid role'),
  body('password').optional({ nullable: true, checkFalsy: true }).isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

module.exports = {
  shipmentValidation,
  userValidation,
  loginValidation,
  validate,
};
