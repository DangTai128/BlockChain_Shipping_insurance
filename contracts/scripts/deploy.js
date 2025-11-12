const hre = require("hardhat");

async function main() {
  console.log("Deploying ShippingInsurance contract...");
  
  // Lấy contract factory
  const ShippingInsurance = await hre.ethers.getContractFactory("ShippingInsurance");
  
  // Deploy contract
  const shippingInsurance = await ShippingInsurance.deploy();
  
  // Chờ contract được deploy
  await shippingInsurance.waitForDeployment();
  
  const contractAddress = await shippingInsurance.getAddress();
  
  console.log("ShippingInsurance deployed to:", contractAddress);
  console.log("Contract owner:", await shippingInsurance.owner());
  
  // Lưu địa chỉ contract vào file để frontend/backend có thể sử dụng
  const fs = require('fs');
  const contractInfo = {
    address: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    '../backend/config/contract-address.json', 
    JSON.stringify(contractInfo, null, 2)
  );
  
  console.log("Contract address saved to backend/config/contract-address.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
