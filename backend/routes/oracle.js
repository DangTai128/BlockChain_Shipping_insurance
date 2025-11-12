const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { ethers } = require('ethers');
const config = require('../config/blockchain');

// Oracle service để kiểm tra tình trạng hàng hóa
class OracleService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
    this.wallet = new ethers.Wallet(config.blockchain.privateKey, this.provider);
    this.contractAddress = config.blockchain.contractAddress;
    this.contract = null;
  }

  async initializeContract(contractABI) {
    if (this.contractAddress) {
      this.contract = new ethers.Contract(this.contractAddress, contractABI, this.wallet);
    }
  }

  // Giả lập API kiểm tra tình trạng hàng hóa
  async checkShipmentStatus(shipmentId) {
    // Trong thực tế, đây sẽ là API call đến hệ thống vận chuyển
    // Ở đây chúng ta giả lập dữ liệu
    
    const statuses = ['InTransit', 'Delivered', 'Damaged', 'Lost'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    // 90% khả năng hàng hóa được giao thành công
    const isDelivered = Math.random() < 0.9;
    const finalStatus = isDelivered ? 'Delivered' : randomStatus;
    
    return {
      shipmentId: shipmentId,
      status: finalStatus,
      location: this.getRandomLocation(),
      timestamp: new Date().toISOString(),
      notes: this.getStatusNotes(finalStatus)
    };
  }

  getRandomLocation() {
    const locations = [
      'Hà Nội, Việt Nam',
      'TP. Hồ Chí Minh, Việt Nam',
      'Đà Nẵng, Việt Nam',
      'Hải Phòng, Việt Nam',
      'Cần Thơ, Việt Nam',
      'Singapore',
      'Bangkok, Thái Lan',
      'Kuala Lumpur, Malaysia'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
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

  async updateShipmentStatusOnBlockchain(shipmentId, status) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

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

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to update shipment status: ${error.message}`);
    }
  }
}

const oracleService = new OracleService();

// Routes

// Kiểm tra tình trạng hàng hóa
router.post('/check-shipment', async (req, res) => {
  try {
    const { shipmentId } = req.body;

    if (!shipmentId) {
      return res.status(400).json({ error: 'Shipment ID is required' });
    }

    // Kiểm tra tình trạng hàng hóa
    const statusInfo = await oracleService.checkShipmentStatus(shipmentId);

    // Lưu vào database
    await pool.execute(
      `INSERT INTO shipment_tracking (shipment_id, status, location, notes) 
       VALUES (?, ?, ?, ?)`,
      [shipmentId, statusInfo.status, statusInfo.location, statusInfo.notes]
    );

    res.json(statusInfo);
  } catch (error) {
    console.error('Error checking shipment:', error);
    res.status(500).json({ error: 'Failed to check shipment status' });
  }
});

// Cập nhật tình trạng hàng hóa lên blockchain
router.post('/update-blockchain', async (req, res) => {
  try {
    const { shipmentId, status } = req.body;

    if (!shipmentId || !status) {
      return res.status(400).json({ error: 'Shipment ID and status are required' });
    }

    // Cập nhật lên blockchain
    const result = await oracleService.updateShipmentStatusOnBlockchain(shipmentId, status);

    // Cập nhật database
    await pool.execute(
      'UPDATE policies SET shipment_status = ? WHERE shipment_id = ?',
      [status, shipmentId]
    );

    res.json({
      message: 'Shipment status updated successfully',
      blockchain: result
    });
  } catch (error) {
    console.error('Error updating blockchain:', error);
    res.status(500).json({ error: error.message });
  }
});

// Lấy lịch sử theo dõi hàng hóa
router.get('/tracking/:shipmentId', async (req, res) => {
  try {
    const { shipmentId } = req.params;

    const [tracking] = await pool.execute(
      'SELECT * FROM shipment_tracking WHERE shipment_id = ? ORDER BY timestamp DESC',
      [shipmentId]
    );

    res.json(tracking);
  } catch (error) {
    console.error('Error fetching tracking history:', error);
    res.status(500).json({ error: 'Failed to fetch tracking history' });
  }
});

// Tự động kiểm tra tất cả hàng hóa đang vận chuyển
router.post('/auto-check', async (req, res) => {
  try {
    // Lấy tất cả hàng hóa đang vận chuyển
    const [activePolicies] = await pool.execute(
      'SELECT shipment_id FROM policies WHERE status = "Active" AND shipment_status = "InTransit"'
    );

    const results = [];

    for (const policy of activePolicies) {
      try {
        const statusInfo = await oracleService.checkShipmentStatus(policy.shipment_id);
        
        // Lưu vào database
        await pool.execute(
          `INSERT INTO shipment_tracking (shipment_id, status, location, notes) 
           VALUES (?, ?, ?, ?)`,
          [policy.shipment_id, statusInfo.status, statusInfo.location, statusInfo.notes]
        );

        // Cập nhật trạng thái policy
        await pool.execute(
          'UPDATE policies SET shipment_status = ? WHERE shipment_id = ?',
          [statusInfo.status, policy.shipment_id]
        );

        // Nếu hàng hóa bị hỏng hoặc mất, cập nhật lên blockchain
        if (statusInfo.status === 'Damaged' || statusInfo.status === 'Lost') {
          try {
            await oracleService.updateShipmentStatusOnBlockchain(policy.shipment_id, statusInfo.status);
          } catch (blockchainError) {
            console.error(`Blockchain update failed for ${policy.shipment_id}:`, blockchainError);
          }
        }

        results.push({
          shipmentId: policy.shipment_id,
          status: statusInfo.status,
          success: true
        });
      } catch (error) {
        results.push({
          shipmentId: policy.shipment_id,
          error: error.message,
          success: false
        });
      }
    }

    res.json({
      message: 'Auto check completed',
      results: results,
      totalChecked: activePolicies.length
    });
  } catch (error) {
    console.error('Error in auto check:', error);
    res.status(500).json({ error: 'Failed to perform auto check' });
  }
});

// Lấy thống kê Oracle
router.get('/stats', async (req, res) => {
  try {
    const [totalTrackings] = await pool.execute('SELECT COUNT(*) as total FROM shipment_tracking');
    const [damagedShipments] = await pool.execute('SELECT COUNT(*) as damaged FROM shipment_tracking WHERE status = "Damaged"');
    const [lostShipments] = await pool.execute('SELECT COUNT(*) as lost FROM shipment_tracking WHERE status = "Lost"');
    const [deliveredShipments] = await pool.execute('SELECT COUNT(*) as delivered FROM shipment_tracking WHERE status = "Delivered"');

    res.json({
      totalTrackings: totalTrackings[0].total,
      damagedShipments: damagedShipments[0].damaged,
      lostShipments: lostShipments[0].lost,
      deliveredShipments: deliveredShipments[0].delivered
    });
  } catch (error) {
    console.error('Error fetching Oracle stats:', error);
    res.status(500).json({ error: 'Failed to fetch Oracle statistics' });
  }
});

module.exports = router;
