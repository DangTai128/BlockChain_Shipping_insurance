const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const Joi = require('joi');

// Validation schemas
const createPolicySchema = Joi.object({
  shipmentId: Joi.string().required(),
  coverageAmount: Joi.number().positive().required(),
  duration: Joi.number().positive().required(),
  userAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required()
});

const updatePolicySchema = Joi.object({
  status: Joi.string().valid('Active', 'Claimed', 'Expired', 'Cancelled').optional(),
  shipmentStatus: Joi.string().valid('InTransit', 'Delivered', 'Damaged', 'Lost').optional()
});

// Create new policy
router.post('/', async (req, res) => {
  try {
    const { error, value } = createPolicySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { shipmentId, coverageAmount, duration, userAddress } = value;
    const premium = (coverageAmount * 2) / 100; // 2% premium
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 1000);

    // Check if shipment already exists
    const [existingPolicy] = await pool.execute(
      'SELECT id FROM policies WHERE shipment_id = ?',
      [shipmentId]
    );

    if (existingPolicy.length > 0) {
      return res.status(400).json({ error: 'Shipment already insured' });
    }

    // Get or create user
    let [users] = await pool.execute(
      'SELECT id FROM users WHERE wallet_address = ?',
      [userAddress]
    );

    let userId;
    if (users.length === 0) {
      const [result] = await pool.execute(
        'INSERT INTO users (wallet_address) VALUES (?)',
        [userAddress]
      );
      userId = result.insertId;
    } else {
      userId = users[0].id;
    }

    // Create policy
    const [result] = await pool.execute(
      `INSERT INTO policies 
       (policy_id, user_id, shipment_id, coverage_amount, premium, start_time, end_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [0, userId, shipmentId, coverageAmount, premium, startTime, endTime]
    );

    const policyId = result.insertId;

    // Update policy_id with the actual ID
    await pool.execute(
      'UPDATE policies SET policy_id = ? WHERE id = ?',
      [policyId, policyId]
    );

    res.status(201).json({
      message: 'Policy created successfully',
      policyId: policyId,
      shipmentId: shipmentId,
      coverageAmount: coverageAmount,
      premium: premium
    });

  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({ error: 'Failed to create policy' });
  }
});

// Get all policies
router.get('/', async (req, res) => {
  try {
    const [policies] = await pool.execute(`
      SELECT p.*, u.wallet_address, u.email, u.full_name
      FROM policies p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    res.json(policies);
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ error: 'Failed to fetch policies' });
  }
});

// Get policy by ID
router.get('/:policyId', async (req, res) => {
  try {
    const { policyId } = req.params;

    const [policies] = await pool.execute(`
      SELECT p.*, u.wallet_address, u.email, u.full_name
      FROM policies p
      JOIN users u ON p.user_id = u.id
      WHERE p.policy_id = ?
    `, [policyId]);

    if (policies.length === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json(policies[0]);
  } catch (error) {
    console.error('Error fetching policy:', error);
    res.status(500).json({ error: 'Failed to fetch policy' });
  }
});

// Get policies by user address
router.get('/user/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;

    const [policies] = await pool.execute(`
      SELECT p.*, u.wallet_address, u.email, u.full_name
      FROM policies p
      JOIN users u ON p.user_id = u.id
      WHERE u.wallet_address = ?
      ORDER BY p.created_at DESC
    `, [userAddress]);

    res.json(policies);
  } catch (error) {
    console.error('Error fetching user policies:', error);
    res.status(500).json({ error: 'Failed to fetch user policies' });
  }
});

// Update policy
router.put('/:policyId', async (req, res) => {
  try {
    const { policyId } = req.params;
    const { error, value } = updatePolicySchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updateFields = [];
    const updateValues = [];

    if (value.status) {
      updateFields.push('status = ?');
      updateValues.push(value.status);
    }

    if (value.shipmentStatus) {
      updateFields.push('shipment_status = ?');
      updateValues.push(value.shipmentStatus);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateValues.push(policyId);

    await pool.execute(
      `UPDATE policies SET ${updateFields.join(', ')} WHERE policy_id = ?`,
      updateValues
    );

    res.json({ message: 'Policy updated successfully' });
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({ error: 'Failed to update policy' });
  }
});

// Get policy statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalPolicies] = await pool.execute('SELECT COUNT(*) as total FROM policies');
    const [activePolicies] = await pool.execute('SELECT COUNT(*) as active FROM policies WHERE status = "Active"');
    const [claimedPolicies] = await pool.execute('SELECT COUNT(*) as claimed FROM policies WHERE status = "Claimed"');
    const [totalClaims] = await pool.execute('SELECT COUNT(*) as claims FROM claims');
    const [totalCoverage] = await pool.execute('SELECT SUM(coverage_amount) as coverage FROM policies');

    res.json({
      totalPolicies: totalPolicies[0].total,
      activePolicies: activePolicies[0].active,
      claimedPolicies: claimedPolicies[0].claimed,
      totalClaims: totalClaims[0].claims,
      totalCoverage: totalCoverage[0].coverage || 0
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
