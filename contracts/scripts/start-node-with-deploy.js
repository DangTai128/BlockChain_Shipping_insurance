const hre = require("hardhat");
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting Hardhat node with smart contract management...");
  
  // Tạo thư mục để lưu blockchain state nếu chưa có
  const stateDir = path.join(__dirname, '../blockchain-state');
  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true });
    console.log("📁 Created blockchain state directory");
  }

  // Cấu hình Hardhat node
  const nodeConfig = {
    hostname: "0.0.0.0",
    port: 8545,
    chainId: 1337,
    db: stateDir,
    reset: process.argv.includes('--reset')
  };

  console.log("⚙️ Node configuration:", {
    hostname: nodeConfig.hostname,
    port: nodeConfig.port,
    chainId: nodeConfig.chainId,
    db: nodeConfig.db,
    reset: nodeConfig.reset
  });

  // Start Hardhat node
  const nodeProcess = spawn('npx', ['hardhat', 'node'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe',
    shell: true
  });

  // Log node output
  nodeProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Started HTTP and WebSocket JSON-RPC server')) {
      console.log("✅ Hardhat node started successfully");
      console.log("🔗 RPC URL: http://localhost:8545");
      
      // Wait a bit for node to be ready, then deploy contracts
      setTimeout(async () => {
        try {
          console.log("🔍 Checking and deploying contracts...");
          await deployContracts();
        } catch (error) {
          console.error("❌ Error deploying contracts:", error);
        }
      }, 3000);
    }
    console.log(output);
  });

  nodeProcess.stderr.on('data', (data) => {
    console.error("Node error:", data.toString());
  });

  nodeProcess.on('close', (code) => {
    console.log(`Hardhat node process exited with code ${code}`);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Hardhat node...');
    nodeProcess.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down Hardhat node...');
    nodeProcess.kill();
    process.exit(0);
  });
}

async function deployContracts() {
  try {
    // Run smart deploy script
    const deployProcess = spawn('npx', ['hardhat', 'run', 'scripts/smart-deploy.js', '--network', 'localhost'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
      shell: true
    });

    deployProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    deployProcess.stderr.on('data', (data) => {
      console.error("Deploy error:", data.toString());
    });

    deployProcess.on('close', (code) => {
      if (code === 0) {
        console.log("🎉 Contract deployment completed successfully!");
        console.log("💡 You can now connect MetaMask and use the application");
      } else {
        console.error("❌ Contract deployment failed");
      }
    });

  } catch (error) {
    console.error("❌ Error running deploy script:", error);
  }
}

main().catch((error) => {
  console.error("❌ Error starting node:", error);
  process.exit(1);
});
