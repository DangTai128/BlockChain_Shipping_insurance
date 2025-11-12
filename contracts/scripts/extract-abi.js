const fs = require('fs');
const path = require('path');

// Đọc ABI từ artifacts
const artifactPath = path.join(__dirname, '../artifacts/contracts/ShippingInsurance.sol/ShippingInsurance.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

// Tạo ABI cho frontend
const abi = artifact.abi;

// Tạo file ABI cho frontend
const frontendAbiPath = path.join(__dirname, '../../frontend/src/contracts/ShippingInsurance.json');
const frontendAbiDir = path.dirname(frontendAbiPath);

if (!fs.existsSync(frontendAbiDir)) {
  fs.mkdirSync(frontendAbiDir, { recursive: true });
}

fs.writeFileSync(frontendAbiPath, JSON.stringify({
  abi: abi,
  contractName: artifact.contractName,
  sourceName: artifact.sourceName
}, null, 2));

console.log('✅ Contract ABI exported to frontend');

// Tạo ABI string cho metaMaskService.js
const abiString = JSON.stringify(abi, null, 2);
const metaMaskServicePath = path.join(__dirname, '../../frontend/src/services/metaMaskService.js');

// Đọc file hiện tại
let content = fs.readFileSync(metaMaskServicePath, 'utf8');

// Thay thế ABI cũ bằng ABI mới
const abiRegex = /export const CONTRACT_ABI = \[[\s\S]*?\];/;
const newAbiExport = `export const CONTRACT_ABI = ${abiString};`;

content = content.replace(abiRegex, newAbiExport);

// Ghi lại file
fs.writeFileSync(metaMaskServicePath, content);

console.log('✅ MetaMask service ABI updated');
console.log('🎉 Contract ABI synchronization completed!');
