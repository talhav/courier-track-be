-- PostgreSQL Database Schema for Courier Track System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'operator',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shipments table
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consignee_number VARCHAR(100) UNIQUE NOT NULL,
    service VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',

    -- Company Info
    company_name VARCHAR(255) NOT NULL,

    -- Shipper Info
    shipper_name VARCHAR(255) NOT NULL,
    shipper_phone VARCHAR(50) NOT NULL,
    shipper_address TEXT NOT NULL,
    shipper_country VARCHAR(100) NOT NULL,
    shipper_city VARCHAR(100) NOT NULL,
    shipper_postal VARCHAR(50) NOT NULL,

    -- Consignee Info
    consignee_company_name VARCHAR(255) NOT NULL,
    receiver_name VARCHAR(255) NOT NULL,
    receiver_email VARCHAR(255) NOT NULL,
    receiver_phone VARCHAR(50) NOT NULL,
    receiver_address TEXT NOT NULL,
    receiver_country VARCHAR(100) NOT NULL,
    receiver_city VARCHAR(100) NOT NULL,
    receiver_zip VARCHAR(50) NOT NULL,

    -- Shipment Details
    account_no VARCHAR(100) NOT NULL,
    shipment_type VARCHAR(50) NOT NULL,
    pieces INTEGER NOT NULL,
    description TEXT NOT NULL,
    fragile BOOLEAN DEFAULT false,
    currency VARCHAR(10) NOT NULL,
    shipper_reference VARCHAR(255),
    comments TEXT,

    -- Box Dimensions (optional - for nonDocsBox type)
    total_volumetric_weight DECIMAL(10, 2),
    dimensions VARCHAR(50),
    weight DECIMAL(10, 2),

    -- Invoice Type (optional - for duplicated shipments)
    invoice_type VARCHAR(50),

    -- Tracking
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shipment status history table
CREATE TABLE shipment_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_shipments_consignee_number ON shipments(consignee_number);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_service ON shipments(service);
CREATE INDEX idx_shipments_created_at ON shipments(created_at);
CREATE INDEX idx_shipments_receiver_country ON shipments(receiver_country);
CREATE INDEX idx_shipment_status_history_shipment_id ON shipment_status_history(shipment_id);
CREATE INDEX idx_users_email ON users(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
-- Password hash is bcrypt hash of 'admin123'
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES ('admin@couriertrack.com', '$2b$10$rXVzKZ.CjCjXqK0Q3L7YuO8B7fY/0EKE8JyPZXw7LVq8zPLF5LXVS', 'System Admin', 'admin', true);
