import React from 'react';
import { useMetaMask } from '../hooks/useMetaMask';
import './Header.css';

const Header = () => {
  const { 
    account, 
    balance, 
    isConnected, 
    isConnecting, 
    isMetaMaskInstalled, 
    error, 
    connect, 
    disconnect 
  } = useMetaMask();

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    return parseFloat(balance).toFixed(4);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>🚛 Bảo hiểm Vận chuyển</h1>
        </div>
        
        <div className="wallet-section">
          {!isMetaMaskInstalled ? (
            <div className="wallet-error">
              <span>⚠️ MetaMask không được cài đặt</span>
            </div>
          ) : !isConnected ? (
            <button 
              className="connect-button"
              onClick={connect}
              disabled={isConnecting}
            >
              {isConnecting ? 'Đang kết nối...' : 'Kết nối MetaMask'}
            </button>
          ) : (
            <div className="wallet-info">
              <div className="account-info">
                <span className="address">{formatAddress(account)}</span>
                <span className="balance">{formatBalance(balance)} ETH</span>
              </div>
              <button 
                className="disconnect-button"
                onClick={disconnect}
              >
                Ngắt kết nối
              </button>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
