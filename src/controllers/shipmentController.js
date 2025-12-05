const Shipment = require('../models/Shipment');

const getAllShipments = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      destination: req.query.destination,
      service: req.query.service,
      status: req.query.status,
      page: parseInt(req.query.page) || 1,
      limit: Math.min(parseInt(req.query.limit) || 10, 100),
    };

    const result = await Shipment.findAll(filters);
    res.json({
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getShipmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findById(id);

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json(shipment);
  } catch (error) {
    next(error);
  }
};

const createShipment = async (req, res, next) => {
  try {
    const shipmentData = req.body;
    const shipment = await Shipment.create(shipmentData, req.user.id);
    res.status(201).json(shipment);
  } catch (error) {
    next(error);
  }
};

const updateShipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shipmentData = req.body;

    const existingShipment = await Shipment.findById(id);
    if (!existingShipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const shipment = await Shipment.update(id, shipmentData, req.user.id);
    res.json(shipment);
  } catch (error) {
    next(error);
  }
};

const deleteShipment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const success = await Shipment.delete(id);
    if (!success) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const duplicateShipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { invoiceType } = req.body;

    const existingShipment = await Shipment.findById(id);
    if (!existingShipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const shipmentObj = existingShipment.toObject();
    const { id: shipmentId, consigneeNumber, createdAt, updatedAt, statusHistory, ...shipmentData } = shipmentObj;

    const duplicatedData = {
      ...shipmentData,
      invoiceType,
    };

    const newShipment = await Shipment.create(duplicatedData, req.user.id);
    res.status(201).json(newShipment);
  } catch (error) {
    next(error);
  }
};

const trackShipment = async (req, res, next) => {
  try {
    const { consigneeNumber } = req.params;
    const shipment = await Shipment.findByConsigneeNumber(consigneeNumber);

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const statusHistory = await Shipment.getStatusHistory(shipment.id);

    res.json({
      shipment,
      statusHistory,
    });
  } catch (error) {
    next(error);
  }
};

const getStatusHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const statusHistory = await Shipment.getStatusHistory(id);
    res.json(statusHistory);
  } catch (error) {
    next(error);
  }
};

const addStatusUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, location, notes } = req.body;

    const existingShipment = await Shipment.findById(id);
    if (!existingShipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Update shipment status
    await Shipment.update(id, { status }, req.user.id);

    // Add status history
    const statusUpdate = await Shipment.addStatusHistory(
      id,
      status,
      location || null,
      notes || 'Status updated',
      req.user.id
    );

    res.status(201).json(statusUpdate);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
  duplicateShipment,
  trackShipment,
  getStatusHistory,
  addStatusUpdate,
};
