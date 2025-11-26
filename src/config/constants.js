module.exports = {
  SHIPMENT_STATUS: {
    PENDING: 'pending',
    IN_TRANSIT: 'inTransit',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    RETURNED: 'returned',
    ON_HOLD: 'onHold',
  },

  SERVICE_TYPE: {
    EXPRESS: 'express',
    STANDARD: 'standard',
    ECONOMY: 'economy',
    OVERNIGHT: 'overnight',
    INTERNATIONAL: 'international',
  },

  SHIPMENT_TYPE: {
    DOCS: 'docs',
    NON_DOCS_FLYER: 'nonDocsFlyer',
    NON_DOCS_BOX: 'nonDocsBox',
  },

  INVOICE_TYPE: {
    COMMERCIAL: 'commercial',
    GIFT: 'gift',
    PERFORMANCE: 'performance',
    SAMPLE: 'sample',
  },

  CURRENCY_TYPE: {
    USD: 'usd',
    EUR: 'eur',
    GBP: 'gbp',
    AED: 'aed',
    PKR: 'pkr',
  },

  USER_ROLES: {
    ADMIN: 'admin',
    OPERATOR: 'operator',
    VIEWER: 'viewer',
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
};
