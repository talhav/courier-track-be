const pool = require('../config/database');
const { generateConsigneeNumber } = require('../utils/helpers');

class Shipment {
  static async findAll(filters = {}) {
    const {
      startDate,
      endDate,
      destination,
      service,
      status,
      page = 1,
      limit = 10,
    } = filters;

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (startDate) {
      conditions.push(`created_at >= $${paramCount++}`);
      params.push(startDate);
    }

    if (endDate) {
      conditions.push(`created_at <= $${paramCount++}`);
      params.push(endDate);
    }

    if (destination) {
      conditions.push(`receiver_country ILIKE $${paramCount++}`);
      params.push(`%${destination}%`);
    }

    if (service) {
      conditions.push(`service = $${paramCount++}`);
      params.push(service);
    }

    if (status) {
      conditions.push(`status = $${paramCount++}`);
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countQuery = `SELECT COUNT(*) FROM shipments ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Data query
    const dataQuery = `
      SELECT *
      FROM shipments
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `;
    const result = await pool.query(dataQuery, [...params, limit, offset]);

    return {
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async findById(id) {
    const query = `SELECT * FROM shipments WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByConsigneeNumber(consigneeNumber) {
    const query = `SELECT * FROM shipments WHERE consignee_number = $1`;
    const result = await pool.query(query, [consigneeNumber]);
    return result.rows[0];
  }

  static async create(shipmentData, userId) {
    const consigneeNumber = generateConsigneeNumber();

    const query = `
      INSERT INTO shipments (
        consignee_number, service, status, company_name,
        shipper_name, shipper_phone, shipper_address, shipper_country, shipper_city, shipper_postal,
        consignee_company_name, receiver_name, receiver_email, receiver_phone, receiver_address,
        receiver_country, receiver_city, receiver_zip,
        account_no, shipment_type, pieces, description, fragile, currency,
        shipper_reference, comments, total_volumetric_weight, dimensions, weight, invoice_type,
        created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
      )
      RETURNING *
    `;

    const values = [
      consigneeNumber,
      shipmentData.service,
      'pending',
      shipmentData.companyName,
      shipmentData.shipperName,
      shipmentData.shipperPhone,
      shipmentData.shipperAddress,
      shipmentData.shipperCountry,
      shipmentData.shipperCity,
      shipmentData.shipperPostal,
      shipmentData.consigneeCompanyName,
      shipmentData.receiverName,
      shipmentData.receiverEmail,
      shipmentData.receiverPhone,
      shipmentData.receiverAddress,
      shipmentData.receiverCountry,
      shipmentData.receiverCity,
      shipmentData.receiverZip,
      shipmentData.accountNo,
      shipmentData.shipmentType,
      shipmentData.pieces,
      shipmentData.description,
      shipmentData.fragile || false,
      shipmentData.currency,
      shipmentData.shipperReference || null,
      shipmentData.comments || null,
      shipmentData.totalVolumetricWeight || null,
      shipmentData.dimensions || null,
      shipmentData.weight || null,
      shipmentData.invoiceType || null,
      userId,
    ];

    const result = await pool.query(query, values);

    // Create initial status history
    await this.addStatusHistory(result.rows[0].id, 'pending', null, 'Shipment created', userId);

    return result.rows[0];
  }

  static async update(id, shipmentData, userId) {
    const fields = [];
    const values = [];
    let paramCount = 1;

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
        const snakeField = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        fields.push(`${snakeField} = $${paramCount++}`);
        values.push(shipmentData[field]);
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `
      UPDATE shipments
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    // Add status history if status changed
    if (shipmentData.status) {
      await this.addStatusHistory(id, shipmentData.status, null, 'Status updated', userId);
    }

    return result.rows[0];
  }

  static async delete(id) {
    const query = `DELETE FROM shipments WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  static async addStatusHistory(shipmentId, status, location, notes, userId) {
    const query = `
      INSERT INTO shipment_status_history (shipment_id, status, location, notes, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [shipmentId, status, location, notes, userId]);
    return result.rows[0];
  }

  static async getStatusHistory(shipmentId) {
    const query = `
      SELECT ssh.*, u.full_name as created_by_name
      FROM shipment_status_history ssh
      LEFT JOIN users u ON ssh.created_by = u.id
      WHERE ssh.shipment_id = $1
      ORDER BY ssh.created_at DESC
    `;
    const result = await pool.query(query, [shipmentId]);
    return result.rows;
  }
}

module.exports = Shipment;
