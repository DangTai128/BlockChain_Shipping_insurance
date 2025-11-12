const mysql = require('mysql2/promise');

// Database configuration
const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shipping_insurance',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Tạo connection pool
const pool = mysql.createPool(databaseConfig);

// Test connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Khởi tạo database và tables
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Tạo database nếu chưa tồn tại (sử dụng query thay vì execute)
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${databaseConfig.database}`);
    await connection.query(`USE ${databaseConfig.database}`);
    
    // Tạo bảng users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wallet_address VARCHAR(42) UNIQUE NOT NULL,
        email VARCHAR(255),
        full_name VARCHAR(255),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Tạo bảng policies
    await connection.query(`
      CREATE TABLE IF NOT EXISTS policies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        policy_id INT NOT NULL,
        user_id INT NOT NULL,
        shipment_id VARCHAR(255) UNIQUE NOT NULL,
        coverage_amount DECIMAL(20,8) NOT NULL,
        premium DECIMAL(20,8) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        status ENUM('Active', 'Claimed', 'Expired', 'Cancelled') DEFAULT 'Active',
        shipment_status ENUM('InTransit', 'Delivered', 'Damaged', 'Lost') DEFAULT 'InTransit',
        claim_processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Tạo bảng claims
    await connection.query(`
      CREATE TABLE IF NOT EXISTS claims (
        id INT AUTO_INCREMENT PRIMARY KEY,
        claim_id INT NOT NULL,
        policy_id INT NOT NULL,
        user_id INT NOT NULL,
        claim_amount DECIMAL(20,8) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        approved BOOLEAN DEFAULT FALSE,
        processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Tạo bảng shipment_tracking
    await connection.query(`
      CREATE TABLE IF NOT EXISTS shipment_tracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        shipment_id VARCHAR(255) NOT NULL,
        status ENUM('InTransit', 'Delivered', 'Damaged', 'Lost') NOT NULL,
        location VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        INDEX idx_shipment_id (shipment_id)
      )
    `);
    
    console.log('✅ Database tables created successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  config: databaseConfig
};