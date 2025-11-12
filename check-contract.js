// Script để kiểm tra contract connection
const { ethers } = require('ethers');

async function checkContractConnection() {
  console.log('🔍 Checking Contract Connection...');
  
  try {
    // 1. Kiểm tra RPC connection
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const network = await provider.getNetwork();
    console.log('✅ RPC Connection:', network);
    
    // 2. Kiểm tra contract address
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const code = await provider.getCode(contractAddress);
    
    if (code === '0x') {
      console.log('❌ Contract not deployed at address:', contractAddress);
      console.log('💡 Run: npm run deploy');
    } else {
      console.log('✅ Contract deployed at address:', contractAddress);
      console.log('📄 Contract code length:', code.length);
      
      // 3. Test contract call
      const contractABI = [
        "function getTotalPolicies() external view returns (uint256)",
        "function owner() external view returns (address)"
      ];
      
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      
      try {
        const totalPolicies = await contract.getTotalPolicies();
        const owner = await contract.owner();
        console.log('✅ Contract call successful:');
        console.log('   - Total policies:', totalPolicies.toString());
        console.log('   - Owner:', owner);
      } catch (error) {
        console.log('❌ Contract call failed:', error.message);
      }
    }
    
    // 4. Kiểm tra accounts
    const accounts = await provider.listAccounts();
    console.log('✅ Available accounts:', accounts.length);
    
    if (accounts.length > 0) {
      const balance = await provider.getBalance(accounts[0]);
      console.log('💰 First account balance:', ethers.formatEther(balance), 'ETH');
    }
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('💡 Make sure Hardhat node is running: npm run dev:contracts');
  }
  
  console.log('🎯 Contract connection check completed!');
}

checkContractConnection();
