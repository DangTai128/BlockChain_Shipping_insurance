import { useState, useEffect, useCallback } from 'react';
import { metaMaskService } from '../services/metaMaskService';

export const useMetaMask = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== 'undefined' && !!window.ethereum;

  // Connect to MetaMask
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      setError('MetaMask is not installed');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const connectedAccount = await metaMaskService.connect();
      setAccount(connectedAccount);
      setIsConnected(true);

      // Get account info
      const accountBalance = await metaMaskService.getBalance(connectedAccount);
      const currentChainId = await metaMaskService.getChainId();

      setBalance(accountBalance);
      setChainId(currentChainId);

      // Switch to correct network if needed
      const targetChainId = '0x539'; // 1337 in hex
      if (currentChainId !== targetChainId) {
        await metaMaskService.switchNetwork(targetChainId);
        setChainId(targetChainId);
      }

    } catch (err) {
      setError(err.message || 'Failed to connect to MetaMask');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskInstalled]);

  // Disconnect from MetaMask
  const disconnect = useCallback(() => {
    setAccount(null);
    setBalance('0');
    setChainId('');
    setIsConnected(false);
    setError(null);
  }, []);

  // Get account info
  const getAccountInfo = useCallback(async () => {
    if (!account) return null;

    try {
      const accountBalance = await metaMaskService.getBalance(account);
      const currentChainId = await metaMaskService.getChainId();

      return {
        address: account,
        balance: accountBalance,
        chainId: currentChainId,
      };
    } catch (err) {
      console.error('Error getting account info:', err);
      return null;
    }
  }, [account]);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!account) return;

    try {
      const accountBalance = await metaMaskService.getBalance(account);
      setBalance(accountBalance);
    } catch (err) {
      console.error('Error refreshing balance:', err);
    }
  }, [account]);

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        refreshBalance();
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(chainId);
      // Optionally refresh the page or show a message
      window.location.reload();
    };

    // Add event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Check if already connected
    const checkConnection = async () => {
      try {
        const connectedAccount = await metaMaskService.getAccount();
        if (connectedAccount) {
          setAccount(connectedAccount);
          setIsConnected(true);
          await refreshBalance();
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    };

    checkConnection();

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [isMetaMaskInstalled, account, disconnect, refreshBalance]);

  return {
    account,
    balance,
    chainId,
    isConnected,
    isConnecting,
    isMetaMaskInstalled,
    error,
    connect,
    disconnect,
    getAccountInfo,
    refreshBalance,
  };
};
