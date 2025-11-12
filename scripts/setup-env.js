const fs = require('fs');
const path = require('path');

// Copy env.example to .env for backend
const backendEnvExample = path.join(__dirname, '../backend/env.example');
const backendEnv = path.join(__dirname, '../backend/.env');

if (fs.existsSync(backendEnvExample)) {
  fs.copyFileSync(backendEnvExample, backendEnv);
  console.log('✅ Backend .env file created from env.example');
} else {
  // Tạo backend .env với config mặc định
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
CONTRACT_ADDRESS=
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CHAIN_ID=1337

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
`;
  fs.writeFileSync(backendEnv, backendEnvContent);
  console.log('✅ Backend .env file created with default config');
}

// Copy env.example to .env for oracle
const oracleEnvExample = path.join(__dirname, '../oracle/env.example');
const oracleEnv = path.join(__dirname, '../oracle/.env');

if (fs.existsSync(oracleEnvExample)) {
  fs.copyFileSync(oracleEnvExample, oracleEnv);
  console.log('✅ Oracle .env file created from env.example');
} else {
  console.log('⚠️ Oracle env.example not found');
}

console.log('🎉 Environment files setup completed!');
