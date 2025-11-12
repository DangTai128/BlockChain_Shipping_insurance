const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting Hardhat node with persistent state...");
  
  // Tạo thư mục để lưu blockchain state nếu chưa có
  const stateDir = path.join(__dirname, '../blockchain-state');
  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true });
    console.log("📁 Created blockchain state directory");
  }

  // Cấu hình Hardhat node với persistent state
  const nodeConfig = {
    hostname: "0.0.0.0",
    port: 8545,
    chainId: 1337,
    // Lưu trạng thái vào file
    db: stateDir,
    // Reset blockchain state (xóa dữ liệu cũ)
    reset: process.argv.includes('--reset'),
    // Fork từ mainnet để có dữ liệu thực tế (tùy chọn)
    fork: process.env.FORK_URL || undefined,
    forkBlockNumber: process.env.FORK_BLOCK_NUMBER || undefined
  };

  console.log("⚙️ Node configuration:", {
    hostname: nodeConfig.hostname,
    port: nodeConfig.port,
    chainId: nodeConfig.chainId,
    db: nodeConfig.db,
    reset: nodeConfig.reset
  });

  // Start Hardhat node
  await hre.run("node", nodeConfig);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error starting persistent node:", error);
    process.exit(1);
  });
