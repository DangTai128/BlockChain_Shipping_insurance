import { ethers } from 'ethers';

// Contract ABI - This should match your deployed contract
export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "claimId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "policyId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "payoutAmount",
        "type": "uint256"
      }
    ],
    "name": "ClaimApproved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "claimId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "policyId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "claimant",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "claimAmount",
        "type": "uint256"
      }
    ],
    "name": "ClaimSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "policyId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "policyholder",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "shipmentId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "coverageAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "premium",
        "type": "uint256"
      }
    ],
    "name": "PolicyCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "policyId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "shipmentId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "enum ShippingInsurance.ShipmentStatus",
        "name": "newStatus",
        "type": "uint8"
      }
    ],
    "name": "ShipmentStatusUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "claims",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "claimId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "policyId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "claimant",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "claimAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "processed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_shipmentId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_coverageAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_duration",
        "type": "uint256"
      }
    ],
    "name": "createPolicy",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_claimId",
        "type": "uint256"
      }
    ],
    "name": "getClaim",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "claimId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "policyId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "claimant",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "claimAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "processed",
            "type": "bool"
          }
        ],
        "internalType": "struct ShippingInsurance.Claim",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_policyId",
        "type": "uint256"
      }
    ],
    "name": "getPolicy",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "policyId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "policyholder",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "shipmentId",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "coverageAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "premium",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "startTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "endTime",
            "type": "uint256"
          },
          {
            "internalType": "enum ShippingInsurance.InsuranceStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "enum ShippingInsurance.ShipmentStatus",
            "name": "shipmentStatus",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "claimProcessed",
            "type": "bool"
          }
        ],
        "internalType": "struct ShippingInsurance.InsurancePolicy",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalClaims",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalPolicies",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserPolicies",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "oracleAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "policies",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "policyId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "policyholder",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "shipmentId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "coverageAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "premium",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "enum ShippingInsurance.InsuranceStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "enum ShippingInsurance.ShipmentStatus",
        "name": "shipmentStatus",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "claimProcessed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_oracleAddress",
        "type": "address"
      }
    ],
    "name": "setOracleAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "shipmentToPolicy",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_shipmentId",
        "type": "string"
      },
      {
        "internalType": "enum ShippingInsurance.ShipmentStatus",
        "name": "_status",
        "type": "uint8"
      }
    ],
    "name": "updateShipmentStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "userPolicies",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Contract configuration
export const CONTRACT_CONFIG = {
  address: process.env.REACT_APP_CONTRACT_ADDRESS || '',
  chainId: parseInt(process.env.REACT_APP_CHAIN_ID || '1337'),
  rpcUrl: process.env.REACT_APP_RPC_URL || 'http://localhost:8545'
};

// MetaMask service
export class MetaMaskService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }

  async connect() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Initialize contract
      if (CONTRACT_CONFIG.address) {
        this.contract = new ethers.Contract(
          CONTRACT_CONFIG.address,
          CONTRACT_ABI,
          this.signer
        );
      }

      return accounts[0];
    } catch (error) {
      throw new Error('Failed to connect to MetaMask');
    }
  }

  async getAccount() {
    if (!window.ethereum) {
      return null;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });
      return accounts[0] || null;
    } catch (error) {
      return null;
    }
  }

  async getBalance(address) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async getChainId() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const chainId = await window.ethereum.request({
      method: 'eth_chainId',
    });

    return chainId;
  }

  async switchNetwork(chainId) {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error) {
      // If the network doesn't exist, add it
      if (error.code === 4902) {
        await this.addNetwork();
      } else {
        throw error;
      }
    }
  }

  async addNetwork() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x539', // 1337 in hex
          chainName: 'Localhost',
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['http://localhost:8545'],
          blockExplorerUrls: null,
        },
      ],
    });
  }

  async createPolicy(shipmentId, coverageAmount, duration) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const coverageAmountWei = ethers.parseEther(coverageAmount);
    const premium = (coverageAmountWei * 2n) / 100n; // 2% premium

    const tx = await this.contract.createPolicy(shipmentId, coverageAmountWei, duration, {
      value: premium
    });

    return await tx.wait();
  }

  async getPolicy(policyId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    return await this.contract.getPolicy(policyId);
  }

  async getUserPolicies(userAddress) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const policyIds = await this.contract.getUserPolicies(userAddress);
    const policies = [];

    for (const policyId of policyIds) {
      const policy = await this.getPolicy(policyId);
      policies.push(policy);
    }

    return policies;
  }

  async getContractInfo() {
    if (!this.contract || !this.provider) {
      throw new Error('Contract or provider not initialized');
    }

    const balance = await this.provider.getBalance(CONTRACT_CONFIG.address);
    const totalPolicies = await this.contract.getTotalPolicies();
    const totalClaims = await this.contract.getTotalClaims();
    const oracleAddress = await this.contract.oracleAddress();

    return {
      contractAddress: CONTRACT_CONFIG.address,
      balance: ethers.formatEther(balance),
      totalPolicies: totalPolicies.toString(),
      totalClaims: totalClaims.toString(),
      oracleAddress: oracleAddress
    };
  }

  isConnected() {
    return this.provider !== null && this.signer !== null;
  }

  getProvider() {
    return this.provider;
  }

  getSigner() {
    return this.signer;
  }

  getContract() {
    return this.contract;
  }
}

// Create singleton instance
export const metaMaskService = new MetaMaskService();
