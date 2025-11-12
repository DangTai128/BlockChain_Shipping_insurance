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
      console.log('📄 Contract code length:', code.length);
    }
  } catch (error) {
    console.log('❌ Contract check failed:', error.message);
  }
  
  // 3. Kiểm tra accounts
  try {
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const accounts = await provider.listAccounts();
    console.log('✅ Available accounts:', accounts.length);
    if (accounts.length > 0) {
      const balance = await provider.getBalance(accounts[0]);
      console.log('💰 First account balance:', ethers.formatEther(balance), 'ETH');
    }
  } catch (error) {
    console.log('❌ Accounts check failed:', error.message);
  }
  
  console.log('🎯 Debug completed!');
}

debugContractCreation();
