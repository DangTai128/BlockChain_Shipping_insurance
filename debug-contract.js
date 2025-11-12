// Debug script để kiểm tra tạo hợp đồng
const { ethers } = require('ethers');

async function debugContractCreation() {
  console.log('🔍 Debug Contract Creation...');
  
  // 1. Kiểm tra RPC connection
  try {
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const network = await provider.getNetwork();
    console.log('✅ RPC Connection:', network);
  } catch (error) {
    console.log('❌ RPC Connection failed:', error.message);
    return;
  }
  
  // 2. Kiểm tra contract address
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  try {
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      console.log('❌ Contract not deployed at address:', contractAddress);
    } else {
      console.log('✅ Contract deployed at address:', contractAddress);
    }
  } catch (error) {
    console.log('❌ Contract check failed:', error.message);
  }
  
  // 3. Kiểm tra MetaMask connection
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        console.log('✅ MetaMask connected:', accounts[0]);
      } else {
        console.log('⚠️ MetaMask not connected');
      }
    } catch (error) {
      console.log('❌ MetaMask check failed:', error.message);
    }
  } else {
    console.log('⚠️ MetaMask not available (run in browser)');
  }
  
  console.log('🎯 Debug completed!');
}

// Export cho browser
if (typeof window !== 'undefined') {
  window.debugContractCreation = debugContractCreation;
}

// Run nếu trong Node.js
if (typeof require !== 'undefined' && require.main === module) {
  debugContractCreation();
}
