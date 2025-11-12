const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const config = require('../config/blockchain');

// Blockchain service
class BlockchainService {
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

  async getContractInfo() {
    if (!this.contract) {
      return { error: 'Contract not initialized' };
    }

    try {
      const balance = await this.provider.getBalance(this.contractAddress);
      const totalPolicies = await this.contract.getTotalPolicies();
      const totalClaims = await this.contract.getTotalClaims();
      const oracleAddress = await this.contract.oracleAddress();

      return {
        contractAddress: this.contractAddress,
        balance: ethers.formatEther(balance),
        totalPolicies: totalPolicies.toString(),
        totalClaims: totalClaims.toString(),
        oracleAddress: oracleAddress
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async createPolicy(userAddress, shipmentId, coverageAmount, duration) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const premium = (coverageAmount * 2n) / 100n; // 2% premium
      
      const tx = await this.contract.createPolicy(
        shipmentId,
        coverageAmount,
        duration,
        { value: premium }
      );

      const receipt = await tx.wait();
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to create policy: ${error.message}`);
    }
  }

  async getPolicy(policyId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const policy = await this.contract.getPolicy(policyId);
      return {
        policyId: policy.policyId.toString(),
        policyholder: policy.policyholder,
        shipmentId: policy.shipmentId,
        coverageAmount: ethers.formatEther(policy.coverageAmount),
        premium: ethers.formatEther(policy.premium),
        startTime: new Date(Number(policy.startTime) * 1000).toISOString(),
        endTime: new Date(Number(policy.endTime) * 1000).toISOString(),
        status: ['Active', 'Claimed', 'Expired', 'Cancelled'][policy.status],
        shipmentStatus: ['InTransit', 'Delivered', 'Damaged', 'Lost'][policy.shipmentStatus],
        claimProcessed: policy.claimProcessed
      };
    } catch (error) {
      throw new Error(`Failed to get policy: ${error.message}`);
    }
  }

  async getUserPolicies(userAddress) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const policyIds = await this.contract.getUserPolicies(userAddress);
      const policies = [];

      for (const policyId of policyIds) {
        const policy = await this.getPolicy(policyId);
        policies.push(policy);
      }

      return policies;
    } catch (error) {
      throw new Error(`Failed to get user policies: ${error.message}`);
    }
  }
}

const blockchainService = new BlockchainService();

// Routes
router.get('/info', async (req, res) => {
  try {
    const info = await blockchainService.getContractInfo();
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/create-policy', async (req, res) => {
  try {
    const { userAddress, shipmentId, coverageAmount, duration } = req.body;

    if (!userAddress || !shipmentId || !coverageAmount || !duration) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const coverageAmountWei = ethers.parseEther(coverageAmount.toString());
    const result = await blockchainService.createPolicy(
      userAddress,
      shipmentId,
      coverageAmountWei,
      duration
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/policy/:policyId', async (req, res) => {
  try {
    const { policyId } = req.params;
    const policy = await blockchainService.getPolicy(policyId);
    res.json(policy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/user/:userAddress/policies', async (req, res) => {
  try {
    const { userAddress } = req.params;
    const policies = await blockchainService.getUserPolicies(userAddress);
    res.json(policies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
