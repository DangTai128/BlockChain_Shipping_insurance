// Blockchain configuration
const blockchainConfig = {
  rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
  contractAddress: process.env.CONTRACT_ADDRESS || '',
  privateKey: process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  chainId: parseInt(process.env.CHAIN_ID || '1337')
};

module.exports = {
  blockchain: blockchainConfig
};
