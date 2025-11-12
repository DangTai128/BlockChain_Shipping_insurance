const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const Joi = require('joi');

// Validation schemas
const createUserSchema = Joi.object({
  walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  email: Joi.string().email().optional(),
  fullName: Joi.string().optional(),
  phone: Joi.string().optional()
});

const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  fullName: Joi.string().optional(),
  phone: Joi.string().optional()
});

// Create or update user
router.post('/', async (req, res) => {
  try {
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { walletAddress, email, fullName, phone } = value;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE wallet_address = ?',
      [walletAddress]
    );

    if (existingUsers.length > 0) {
      // Update existing user
      await pool.execute(
        'UPDATE users SET email = ?, full_name = ?, phone = ? WHERE wallet_address = ?',
        [email, fullName, phone, walletAddress]
      );

      res.json({
        message: 'User updated successfully',
        userId: existingUsers[0].id,
        walletAddress: walletAddress
      });
    } else {
      // Create new user
      const [result] = await pool.execute(
        'INSERT INTO users (wallet_address, email, full_name, phone) VALUES (?, ?, ?, ?)',
        [walletAddress, email, fullName, phone]
      );

      res.status(201).json({
        message: 'User created successfully',
        userId: result.insertId,
        walletAddress: walletAddress
      });
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: 'Failed to create/update user' });
  }
});

// Get user by wallet address
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const [users] = await pool.execute(
      'SELECT * FROM users WHERE wallet_address = ?',
      [walletAddress]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
router.put('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { error, value } = updateUserSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updateFields = [];
    const updateValues = [];

    if (value.email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(value.email);
    }

    if (value.fullName !== undefined) {
      updateFields.push('full_name = ?');
      updateValues.push(value.fullName);
    }

    if (value.phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(value.phone);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateValues.push(walletAddress);

    const [result] = await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE wallet_address = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get user statistics
router.get('/:walletAddress/stats', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Get user info
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE wallet_address = ?',
      [walletAddress]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = users[0].id;

    // Get user statistics
    const [totalPolicies] = await pool.execute(
      'SELECT COUNT(*) as total FROM policies WHERE user_id = ?',
      [userId]
    );

    const [activePolicies] = await pool.execute(
      'SELECT COUNT(*) as active FROM policies WHERE user_id = ? AND status = "Active"',
      [userId]
    );

    const [claimedPolicies] = await pool.execute(
      'SELECT COUNT(*) as claimed FROM policies WHERE user_id = ? AND status = "Claimed"',
      [userId]
    );

    const [totalClaims] = await pool.execute(
      'SELECT COUNT(*) as claims FROM claims WHERE user_id = ?',
      [userId]
    );

    const [totalCoverage] = await pool.execute(
      'SELECT SUM(coverage_amount) as coverage FROM policies WHERE user_id = ?',
      [userId]
    );

    res.json({
      walletAddress: walletAddress,
      totalPolicies: totalPolicies[0].total,
      activePolicies: activePolicies[0].active,
      claimedPolicies: claimedPolicies[0].claimed,
      totalClaims: totalClaims[0].claims,
      totalCoverage: totalCoverage[0].coverage || 0
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT * FROM users ORDER BY created_at DESC'
    );

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
