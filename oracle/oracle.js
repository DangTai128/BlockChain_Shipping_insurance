const mysql = require('mysql2/promise');
const cron = require('node-cron');
const { ethers } = require('ethers');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shipping_insurance',
  port: process.env.DB_PORT || 3306
};

// Blockchain configuration
const blockchainConfig = {
  rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
  contractAddress: process.env.CONTRACT_ADDRESS || '',
  privateKey: process.env.PRIVATE_KEY || '',
  chainId: process.env.CHAIN_ID || 1337
};

// Oracle configuration
const oracleConfig = {
  updateInterval: process.env.ORACLE_UPDATE_INTERVAL || 300000, // 5 minutes
  apiKey: process.env.ORACLE_API_KEY || ''
};

class ShippingOracle {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.dbPool = null;
    this.isRunning = false;
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Shipping Oracle...');
      
      // Initialize database connection
      this.dbPool = mysql.createPool(dbConfig);
      console.log('✅ Database connected');

      // Initialize blockchain connection
      if (blockchainConfig.contractAddress && blockchainConfig.privateKey) {
        this.provider = new ethers.JsonRpcProvider(blockchainConfig.rpcUrl);
        this.wallet = new ethers.Wallet(blockchainConfig.privateKey, this.provider);
        
        // Contract ABI (simplified)
        const contractABI = [
          "function updateShipmentStatus(string memory _shipmentId, uint8 _status) external",
          "event ShipmentStatusUpdated(uint256 indexed policyId, string shipmentId, uint8 newStatus)"
        ];
        
        this.contract = new ethers.Contract(
          blockchainConfig.contractAddress,
          contractABI,
          this.wallet
        );
        
        console.log('✅ Blockchain connected');
      } else {
        console.log('⚠️ Blockchain not configured - running in database-only mode');
      }

      // Start monitoring
      this.startMonitoring();
      
    } catch (error) {
      console.error('❌ Oracle initialization failed:', error);
      throw error;
    }
  }

  startMonitoring() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🔄 Starting shipment monitoring...');

    // Check shipments every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      await this.checkAllShipments();
    });

    // Also run immediately
    setTimeout(() => {
      this.checkAllShipments();
    }, 5000);
  }

  async checkAllShipments() {
    try {
      console.log('🔍 Checking all active shipments...');
      
      // Get all active shipments from database
      const [shipments] = await this.dbPool.execute(`
        SELECT shipment_id, policy_id, coverage_amount 
        FROM policies 
        WHERE status = 'Active' AND shipment_status = 'InTransit'
      `);

      if (shipments.length === 0) {
        console.log('📦 No active shipments to check');
        return;
      }

      console.log(`📦 Found ${shipments.length} active shipments`);

      for (const shipment of shipments) {
        await this.checkShipmentStatus(shipment);
        // Add delay between checks to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error('❌ Error checking shipments:', error);
    }
  }

  async checkShipmentStatus(shipment) {
    try {
      const { shipment_id, policy_id } = shipment;
      
      // Simulate checking shipment status with external API
      const statusInfo = await this.simulateShipmentCheck(shipment_id);
      
      console.log(`📦 Shipment ${shipment_id}: ${statusInfo.status}`);

      // Update database
      await this.updateShipmentInDatabase(shipment_id, statusInfo);

      // Update blockchain if contract is available
      if (this.contract) {
        await this.updateShipmentOnBlockchain(shipment_id, statusInfo.status);
      }

      // Log tracking information
      await this.logTrackingInfo(shipment_id, statusInfo);

    } catch (error) {
      console.error(`❌ Error checking shipment ${shipment.shipment_id}:`, error);
    }
  }

  async simulateShipmentCheck(shipmentId) {
    // Simulate external API call to shipping company
    // In real implementation, this would call actual shipping APIs
    
    const statuses = ['InTransit', 'Delivered', 'Damaged', 'Lost'];
    
    // Simulate different scenarios based on shipment ID
    const random = Math.random();
    
    let status;
    if (random < 0.85) {
      status = 'Delivered'; // 85% chance of successful delivery
    } else if (random < 0.95) {
      status = 'Damaged'; // 10% chance of damage
    } else {
      status = 'Lost'; // 5% chance of loss
    }

    const locations = [
      'Hà Nội, Việt Nam',
      'TP. Hồ Chí Minh, Việt Nam',
      'Đà Nẵng, Việt Nam',
      'Singapore',
      'Bangkok, Thái Lan'
    ];

    return {
      shipmentId: shipmentId,
      status: status,
      location: locations[Math.floor(Math.random() * locations.length)],
      timestamp: new Date().toISOString(),
      notes: this.getStatusNotes(status)
    };
  }

  getStatusNotes(status) {
    const notes = {
      'InTransit': 'Hàng hóa đang trong quá trình vận chuyển',
      'Delivered': 'Hàng hóa đã được giao thành công',
      'Damaged': 'Hàng hóa bị hỏng trong quá trình vận chuyển',
      'Lost': 'Hàng hóa bị mất trong quá trình vận chuyển'
    };
    return notes[status] || 'Không có ghi chú';
  }

  async updateShipmentInDatabase(shipmentId, statusInfo) {
    try {
      await this.dbPool.execute(
        'UPDATE policies SET shipment_status = ? WHERE shipment_id = ?',
        [statusInfo.status, shipmentId]
      );

      // If shipment is damaged or lost, mark claim as processed
      if (statusInfo.status === 'Damaged' || statusInfo.status === 'Lost') {
        await this.dbPool.execute(
          'UPDATE policies SET status = ?, claim_processed = ? WHERE shipment_id = ?',
          ['Claimed', true, shipmentId]
        );

        // Create claim record
        await this.dbPool.execute(`
          INSERT INTO claims (claim_id, policy_id, user_id, claim_amount, timestamp, approved, processed)
          SELECT 
            (SELECT COALESCE(MAX(claim_id), 0) + 1 FROM claims c),
            p.id,
            p.user_id,
            p.coverage_amount,
            NOW(),
            true,
            true
          FROM policies p 
          WHERE p.shipment_id = ?
        `, [shipmentId]);

        console.log(`💰 Claim processed for shipment ${shipmentId}`);
      }

    } catch (error) {
      console.error('❌ Error updating database:', error);
    }
  }

  async updateShipmentOnBlockchain(shipmentId, status) {
    try {
      // Convert status string to enum value
      const statusMap = {
        'InTransit': 0,
        'Delivered': 1,
        'Damaged': 2,
        'Lost': 3
      };

      const statusValue = statusMap[status];
      if (statusValue === undefined) {
        throw new Error('Invalid status');
      }

      const tx = await this.contract.updateShipmentStatus(shipmentId, statusValue);
      const receipt = await tx.wait();

      console.log(`🔗 Blockchain updated for ${shipmentId}: ${receipt.hash}`);

    } catch (error) {
      console.error(`❌ Error updating blockchain for ${shipmentId}:`, error);
    }
  }

  async logTrackingInfo(shipmentId, statusInfo) {
    try {
      await this.dbPool.execute(`
        INSERT INTO shipment_tracking (shipment_id, status, location, notes)
        VALUES (?, ?, ?, ?)
      `, [shipmentId, statusInfo.status, statusInfo.location, statusInfo.notes]);

    } catch (error) {
      console.error('❌ Error logging tracking info:', error);
    }
  }

  async getStats() {
    try {
      const [totalTrackings] = await this.dbPool.execute('SELECT COUNT(*) as total FROM shipment_tracking');
      const [damagedShipments] = await this.dbPool.execute('SELECT COUNT(*) as damaged FROM shipment_tracking WHERE status = "Damaged"');
      const [lostShipments] = await this.dbPool.execute('SELECT COUNT(*) as lost FROM shipment_tracking WHERE status = "Lost"');
      const [deliveredShipments] = await this.dbPool.execute('SELECT COUNT(*) as delivered FROM shipment_tracking WHERE status = "Delivered"');

      return {
        totalTrackings: totalTrackings[0].total,
        damagedShipments: damagedShipments[0].damaged,
        lostShipments: lostShipments[0].lost,
        deliveredShipments: deliveredShipments[0].delivered,
        isRunning: this.isRunning
      };
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      return null;
    }
  }

  async stop() {
    this.isRunning = false;
    if (this.dbPool) {
      await this.dbPool.end();
    }
    console.log('🛑 Oracle stopped');
  }
}

// Create and start Oracle
const oracle = new ShippingOracle();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Oracle...');
  await oracle.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down Oracle...');
  await oracle.stop();
  process.exit(0);
});

// Start Oracle
oracle.initialize().catch(error => {
  console.error('❌ Failed to start Oracle:', error);
  process.exit(1);
});

module.exports = oracle;
