const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying contracts and updating configuration...");
  
  // Lấy contract factory
  const ShippingInsurance = await hre.ethers.getContractFactory("ShippingInsurance");
  
  // Deploy contract
  const shippingInsurance = await ShippingInsurance.deploy();
  
  // Chờ contract được deploy
  await shippingInsurance.waitForDeployment();
  
  const contractAddress = await shippingInsurance.getAddress();
  
  console.log("✅ ShippingInsurance deployed to:", contractAddress);
  console.log("Contract owner:", await shippingInsurance.owner());
  
  // Lưu địa chỉ contract vào file để frontend/backend có thể sử dụng
  const contractInfo = {
    address: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };
  
  // Lưu vào backend config
  const backendConfigPath = path.join(__dirname, '../../backend/config/contract-address.json');
  const backendConfigDir = path.dirname(backendConfigPath);
  if (!fs.existsSync(backendConfigDir)) {
    fs.mkdirSync(backendConfigDir, { recursive: true });
  }
  fs.writeFileSync(backendConfigPath, JSON.stringify(contractInfo, null, 2));
  console.log("📝 Contract address saved to backend/config/contract-address.json");
  
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
  console.log("📝 Contract address saved to frontend/.env.local");
  
  // Lưu vào oracle config
  const oracleConfigPath = path.join(__dirname, '../../oracle/.env');
  const oracleEnv = `DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=shipping_insurance
DB_PORT=3306
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=${contractAddress}
PRIVATE_KEY=
CHAIN_ID=1337
ORACLE_UPDATE_INTERVAL=300000
ORACLE_API_KEY=
LOG_LEVEL=info
`;
  fs.writeFileSync(oracleConfigPath, oracleEnv);
  console.log("📝 Contract address saved to oracle/.env");
  
  console.log("🎉 Deployment completed successfully!");
  console.log("💡 Contract address:", contractAddress);
  console.log("💡 You can now run: npm run dev:all");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
