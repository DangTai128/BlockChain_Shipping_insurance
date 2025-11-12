import { ethers } from 'ethers';
import ContractInfo from '../contracts/ShippingInsurance.json';

// Contract ABI - This should match your deployed contract
export const CONTRACT_ABI = ContractInfo.abi;

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

  async initProvider() {
    if (this.provider) return; // Already initialized
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    this.provider = new ethers.BrowserProvider(window.ethereum);
    // Try to get the signer if accounts are already connected
    const accounts = await this.provider.listAccounts();
    if (accounts.length > 0) {
      this.signer = await this.provider.getSigner();

      // Initialize contract if address and signer are available
      if (CONTRACT_CONFIG.address && this.signer) {
        this.contract = new ethers.Contract(
          CONTRACT_CONFIG.address,
          CONTRACT_ABI,
          this.signer
        );
      }
    }
  }

  async connect() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      await this.initProvider();
      
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
      await this.initProvider();
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
    
    // Use Promise.all to fetch all policies in parallel for better performance
    const policyPromises = policyIds.map(policyId => this.getPolicy(policyId));
    
    return Promise.all(policyPromises);
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
