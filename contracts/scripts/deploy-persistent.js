const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying contracts to persistent network...");
  
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
    deployedAt: new Date().toISOString(),
    persistent: true
  };
  
  // Lưu vào backend config
  const backendConfigPath = path.join(__dirname, '../../backend/config/contract-address.json');
  fs.writeFileSync(backendConfigPath, JSON.stringify(contractInfo, null, 2));
  console.log("📝 Contract address saved to backend/config/contract-address.json");
  
  // Lưu vào frontend config
  const frontendConfigPath = path.join(__dirname, '../../frontend/.env.local');
  const frontendEnv = `REACT_APP_CONTRACT_ADDRESS=${contractAddress}\nREACT_APP_CHAIN_ID=1337\nREACT_APP_RPC_URL=http://localhost:8545\n`;
  fs.writeFileSync(frontendConfigPath, frontendEnv);
  console.log("📝 Contract address saved to frontend/.env.local");
  
  // Lưu vào oracle config
  const oracleConfigPath = path.join(__dirname, '../../oracle/.env');
  const oracleEnv = `CONTRACT_ADDRESS=${contractAddress}\nRPC_URL=http://localhost:8545\nCHAIN_ID=1337\n`;
  fs.writeFileSync(oracleConfigPath, oracleEnv);
  console.log("📝 Contract address saved to oracle/.env");
  
  console.log("🎉 Deployment completed successfully!");
  console.log("💡 Use 'npm run dev:all:preserve' to start with persistent state");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
