const mongoose = require('mongoose');
const { generateConsigneeNumber } = require('../utils/helpers');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const shipmentSchema = new mongoose.Schema(
  {
    consigneeNumber: {
      type: String,
      unique: true,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'pending',
    },
    companyName: String,

    // Shipper information
    shipperName: String,
    shipperPhone: String,
    shipperAddress: String,
    shipperCountry: String,
    shipperCity: String,
    shipperPostal: String,

    // Receiver information
    consigneeCompanyName: String,
    receiverName: String,
    receiverEmail: String,
    receiverPhone: String,
    receiverAddress: String,
    receiverCountry: String,
    receiverCity: String,
    receiverZip: String,

    // Shipment details
    accountNo: String,
    shipmentType: String,
    pieces: Number,
    description: String,
    fragile: {
      type: Boolean,
      default: false,
    },
    currency: String,
    shipperReference: String,
    comments: String,
    totalVolumetricWeight: Number,
    dimensions: String,
    weight: Number,
    invoiceType: String,

    // Status history
    statusHistory: [statusHistorySchema],

    // Created by
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Static methods
shipmentSchema.statics.findAll = async function (filters = {}) {
  const {
    startDate,
    endDate,
    destination,
    service,
    status,
    page = 1,
    limit = 10,
  } = filters;

  const query = {};

  if (startDate) {
    query.createdAt = { ...query.createdAt, $gte: new Date(startDate) };
  }

  if (endDate) {
    query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
  }

  if (destination) {
    query.receiverCountry = { $regex: destination, $options: 'i' };
  }

  if (service) {
    query.service = service;
  }

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    this.countDocuments(query),
  ]);

  return {
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

shipmentSchema.statics.findById = async function (id) {
  return await this.findOne({ _id: id });
};

shipmentSchema.statics.findByConsigneeNumber = async function (consigneeNumber) {
  return await this.findOne({ consigneeNumber });
};

shipmentSchema.statics.create = async function (shipmentData, userId) {
  const consigneeNumber = generateConsigneeNumber();

  const shipment = new this({
    consigneeNumber,
    service: shipmentData.service,
    status: 'pending',
    companyName: shipmentData.companyName,
    shipperName: shipmentData.shipperName,
    shipperPhone: shipmentData.shipperPhone,
    shipperAddress: shipmentData.shipperAddress,
    shipperCountry: shipmentData.shipperCountry,
    shipperCity: shipmentData.shipperCity,
    shipperPostal: shipmentData.shipperPostal,
    consigneeCompanyName: shipmentData.consigneeCompanyName,
    receiverName: shipmentData.receiverName,
    receiverEmail: shipmentData.receiverEmail,
    receiverPhone: shipmentData.receiverPhone,
    receiverAddress: shipmentData.receiverAddress,
    receiverCountry: shipmentData.receiverCountry,
    receiverCity: shipmentData.receiverCity,
    receiverZip: shipmentData.receiverZip,
    accountNo: shipmentData.accountNo,
    shipmentType: shipmentData.shipmentType,
    pieces: shipmentData.pieces,
    description: shipmentData.description,
    fragile: shipmentData.fragile || false,
    currency: shipmentData.currency,
    shipperReference: shipmentData.shipperReference || null,
    comments: shipmentData.comments || null,
    totalVolumetricWeight: shipmentData.totalVolumetricWeight || null,
    dimensions: shipmentData.dimensions || null,
    weight: shipmentData.weight || null,
    invoiceType: shipmentData.invoiceType || null,
    createdBy: userId,
    statusHistory: [
      {
        status: 'pending',
        notes: 'Shipment created',
        createdBy: userId,
      },
    ],
  });

  await shipment.save();
  return shipment;
};

shipmentSchema.statics.update = async function (id, shipmentData, userId) {
  const updateData = {};

  const updateableFields = [
    'service', 'status', 'companyName', 'shipperName', 'shipperPhone', 'shipperAddress',
    'shipperCountry', 'shipperCity', 'shipperPostal', 'consigneeCompanyName', 'receiverName',
    'receiverEmail', 'receiverPhone', 'receiverAddress', 'receiverCountry', 'receiverCity',
    'receiverZip', 'accountNo', 'shipmentType', 'pieces', 'description', 'fragile',
    'currency', 'shipperReference', 'comments', 'totalVolumetricWeight', 'dimensions',
    'weight', 'invoiceType',
  ];

  for (const field of updateableFields) {
    if (shipmentData[field] !== undefined) {
      updateData[field] = shipmentData[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error('No fields to update');
  }

  const shipment = await this.findByIdAndUpdate(id, updateData, { new: true });

  // Add status history if status changed
  if (shipmentData.status) {
    await this.addStatusHistory(id, shipmentData.status, null, 'Status updated', userId);
  }

  return shipment;
};

shipmentSchema.statics.delete = async function (id) {
  const result = await this.findByIdAndDelete(id);
  return result !== null;
};

shipmentSchema.statics.addStatusHistory = async function (shipmentId, status, location, notes, userId) {
  const shipment = await this.findById(shipmentId);

  if (!shipment) {
    throw new Error('Shipment not found');
  }

  shipment.statusHistory.push({
    status,
    location,
    notes,
    createdBy: userId,
  });

  await shipment.save();
  return shipment.statusHistory[shipment.statusHistory.length - 1];
};

shipmentSchema.statics.getStatusHistory = async function (shipmentId) {
  const shipment = await this.findById(shipmentId).populate('statusHistory.createdBy', 'fullName');

  if (!shipment) {
    return [];
  }

  return shipment.statusHistory.map((history) => ({
    _id: history._id,
    status: history.status,
    location: history.location,
    notes: history.notes,
    createdAt: history.createdAt,
    createdByName: history.createdBy?.fullName || null,
  }));
};

const Shipment = mongoose.model('Shipment', shipmentSchema);

module.exports = Shipment;
