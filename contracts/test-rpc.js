// Test RPC connection trực tiếp
const { ethers } = require('ethers');

async function testRPCConnection() {
  console.log('🔍 Testing RPC Connection...');
  
  try {
    // Test với provider mới
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    
    // Test basic connection
    console.log('1. Testing basic connection...');
    const network = await provider.getNetwork();
    console.log('✅ Network:', network);
    
    // Test getBalance
    console.log('2. Testing getBalance...');
    const testAddress = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
    const balance = await provider.getBalance(testAddress);
    console.log('✅ Balance:', ethers.formatEther(balance), 'ETH');
    
    // Test block number
    console.log('3. Testing block number...');
    const blockNumber = await provider.getBlockNumber();
    console.log('✅ Block number:', blockNumber);
    
    // Test accounts
    console.log('4. Testing accounts...');
    const accounts = await provider.listAccounts();
    console.log('✅ Accounts count:', accounts.length);
    
    // Test contract
    console.log('5. Testing contract...');
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const code = await provider.getCode(contractAddress);
    console.log('✅ Contract code length:', code.length);
    
    console.log('🎉 All RPC tests passed!');
    
  } catch (error) {
    console.log('❌ RPC test failed:', error.message);
    console.log('💡 Try restarting Hardhat node');
  }
}

testRPCConnection();
