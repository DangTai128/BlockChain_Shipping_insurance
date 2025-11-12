const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🔍 Checking contract deployment status...");
  
  // Đường dẫn file lưu trạng thái
  const stateFile = path.join(__dirname, '../contract-state.json');
  
  let contractAddress = null;
  let isDeployed = false;
  
  // Kiểm tra file state
  if (fs.existsSync(stateFile)) {
    try {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      contractAddress = state.address;
      console.log("📄 Found saved contract address:", contractAddress);
      
      // Kiểm tra contract có tồn tại trên blockchain không
      const provider = new hre.ethers.JsonRpcProvider("http://localhost:8545");
      const code = await provider.getCode(contractAddress);
      isDeployed = code !== '0x';
      
      if (isDeployed) {
        console.log("✅ Contract is already deployed and active");
      } else {
        console.log("⚠️ Contract address exists but contract not found on blockchain");
      }
    } catch (error) {
      console.log("❌ Error reading state file:", error.message);
    }
  }
  
  // Nếu contract chưa deploy hoặc không tồn tại, deploy mới
  if (!isDeployed) {
    console.log("🚀 Deploying new contract...");
    
    // Lấy contract factory
    const ShippingInsurance = await hre.ethers.getContractFactory("ShippingInsurance");
    
    // Deploy contract
    const shippingInsurance = await ShippingInsurance.deploy();
    
    // Chờ contract được deploy
    await shippingInsurance.waitForDeployment();
    
    contractAddress = await shippingInsurance.getAddress();
    
    console.log("✅ New contract deployed to:", contractAddress);
    console.log("Contract owner:", await shippingInsurance.owner());
    
    // Lưu trạng thái
    const contractState = {
      address: contractAddress,
      network: hre.network.name,
      deployedAt: new Date().toISOString(),
      owner: await shippingInsurance.owner()
    };
    
    fs.writeFileSync(stateFile, JSON.stringify(contractState, null, 2));
    console.log("💾 Contract state saved to:", stateFile);
  }
  
  // Cập nhật configuration files
  await updateConfigurationFiles(contractAddress);
  
  console.log("🎉 Contract ready at address:", contractAddress);
}

async function updateConfigurationFiles(contractAddress) {
  console.log("📝 Updating configuration files...");
  
  // Lưu vào backend config
  const backendConfigPath = path.join(__dirname, '../../backend/config/contract-address.json');
  const backendConfigDir = path.dirname(backendConfigPath);
  if (!fs.existsSync(backendConfigDir)) {
    fs.mkdirSync(backendConfigDir, { recursive: true });
  }
  
  const contractInfo = {
    address: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(backendConfigPath, JSON.stringify(contractInfo, null, 2));
  console.log("📝 Backend config updated");
  
  // Cập nhật backend .env với blockchain config
  const backendEnvPath = path.join(__dirname, '../../backend/.env');
  const backendEnvContent = `# Backend Environment Variables
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=shipping_insurance
DB_PORT=3306

# Server Configuration
PORT=3001
NODE_ENV=development

# Blockchain Configuration
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=${contractAddress}
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CHAIN_ID=1337

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
`;
  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log("📝 Backend .env updated with blockchain config");
  
  // Lưu vào frontend config
  const frontendConfigPath = path.join(__dirname, '../../frontend/.env.local');
  const frontendEnv = `REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_CONTRACT_ADDRESS=${contractAddress}
REACT_APP_CHAIN_ID=1337
REACT_APP_RPC_URL=http://localhost:8545
REACT_APP_NETWORK_NAME=Localhost
REACT_APP_NETWORK_SYMBOL=ETH
REACT_APP_NETWORK_DECIMALS=18
`;
  fs.writeFileSync(frontendConfigPath, frontendEnv);
  console.log("📝 Frontend config updated");
  
  // Lưu vào oracle config
  const oracleConfigPath = path.join(__dirname, '../../oracle/.env');
  const oracleEnv = `DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=shipping_insurance
DB_PORT=3306
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=${contractAddress}
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CHAIN_ID=1337
ORACLE_UPDATE_INTERVAL=300000
ORACLE_API_KEY=
LOG_LEVEL=info
`;
  fs.writeFileSync(oracleConfigPath, oracleEnv);
  console.log("📝 Oracle config updated");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
