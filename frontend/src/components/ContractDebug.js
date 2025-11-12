import React, { useState } from 'react';
import { ethers } from 'ethers';
import { MetaMaskService } from '../services/metaMaskService';

const ContractDebug = () => {
  const [debugInfo, setDebugInfo] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');

  const metaMaskService = new MetaMaskService();

  const runDebug = async () => {
    let info = '🔍 Debug Contract Creation...\n\n';
    
    try {
      // 1. Kiểm tra MetaMask
      if (!window.ethereum) {
        info += '❌ MetaMask not installed\n';
        setDebugInfo(info);
        return;
      }
      info += '✅ MetaMask is installed\n';

      // 2. Kiểm tra RPC connection trước
      info += '🔍 Testing RPC connection...\n';
      try {
        const provider = new ethers.JsonRpcProvider('http://localhost:8545');
        const network = await provider.getNetwork();
        info += `✅ RPC working - Network: ${network.name} (${network.chainId})\n`;
      } catch (rpcError) {
        info += `❌ RPC connection failed: ${rpcError.message}\n`;
        info += '💡 Try: npm run dev:contracts\n';
        setDebugInfo(info);
        return;
      }

      // 3. Kết nối MetaMask với retry
      info += '🔍 Connecting to MetaMask...\n';
      let connectedAccount;
      try {
        connectedAccount = await metaMaskService.connect();
        setAccount(connectedAccount);
        setIsConnected(true);
        info += `✅ MetaMask connected: ${connectedAccount}\n`;
      } catch (metaMaskError) {
        info += `❌ MetaMask connection failed: ${metaMaskError.message}\n`;
        info += '💡 Try the following fixes:\n';
        info += '   1. Reset MetaMask account\n';
        info += '   2. Clear browser cache\n';
        info += '   3. Restart browser\n';
        info += '   4. Re-add localhost network\n';
        setDebugInfo(info);
        return;
      }

      // 4. Kiểm tra contract
      if (metaMaskService.contract) {
        info += '✅ Contract instance created\n';
        
        // 5. Kiểm tra network
        const network = await metaMaskService.provider.getNetwork();
        info += `✅ Network: ${network.name} (Chain ID: ${network.chainId})\n`;

        // 6. Kiểm tra balance với error handling
        try {
          const balance = await metaMaskService.provider.getBalance(connectedAccount);
          info += `✅ Balance: ${metaMaskService.provider.formatEther(balance)} ETH\n`;
        } catch (balanceError) {
          info += `⚠️ Balance check failed: ${balanceError.message}\n`;
          info += '💡 This might be a MetaMask circuit breaker issue\n';
        }

        // 7. Test contract call với error handling
        try {
          const totalPolicies = await metaMaskService.contract.getTotalPolicies();
          info += `✅ Contract call successful: ${totalPolicies} policies\n`;
        } catch (contractError) {
          info += `❌ Contract call failed: ${contractError.message}\n`;
          if (contractError.message.includes('circuit breaker')) {
            info += '💡 MetaMask circuit breaker is open. Try:\n';
            info += '   1. Reset MetaMask account\n';
            info += '   2. Clear browser cache\n';
            info += '   3. Restart browser\n';
          }
        }

      } else {
        info += '❌ Contract instance not created\n';
        info += '💡 Check REACT_APP_CONTRACT_ADDRESS in .env.local\n';
      }

    } catch (error) {
      info += `❌ Unexpected error: ${error.message}\n`;
    }

    setDebugInfo(info);
  };

  const testCreatePolicy = async () => {
    if (!metaMaskService.contract) {
      alert('Contract not connected');
      return;
    }

    try {
      const shipmentId = 'TEST-' + Date.now();
      const coverageAmount = ethers.parseEther('0.1'); // 0.1 ETH
      const duration = 7 * 24 * 60 * 60; // 7 days in seconds
      const premium = ethers.parseEther('0.01'); // 0.01 ETH premium

      console.log('Creating policy with:', {
        shipmentId,
        coverageAmount: ethers.formatEther(coverageAmount),
        duration,
        premium: ethers.formatEther(premium)
      });

      const tx = await metaMaskService.contract.createPolicy(
        shipmentId,
        coverageAmount,
        duration,
        { value: premium }
      );

      console.log('Transaction sent:', tx.hash);
      alert(`Policy creation transaction sent: ${tx.hash}`);
      
    } catch (error) {
      console.error('Error creating policy:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🔧 Contract Debug Tool</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runDebug}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Run Debug
        </button>
        
        {isConnected && (
          <button 
            onClick={testCreatePolicy}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Test Create Policy
          </button>
        )}
      </div>

      {account && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
          <strong>Connected Account:</strong> {account}
        </div>
      )}

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '5px',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        fontSize: '14px'
      }}>
        {debugInfo || 'Click "Run Debug" to start...'}
      </div>
    </div>
  );
};

export default ContractDebug;
