// MetaMask Circuit Breaker Fix
// Hướng dẫn khắc phục lỗi "circuit breaker is open"

console.log(`
🔧 HƯỚNG DẪN KHẮC PHỤC LỖI METAMASK "CIRCUIT BREAKER IS OPEN"

❌ Lỗi: "Không thể thực thi vì bộ ngắt mạch đang mở"
✅ Nguyên nhân: MetaMask cache lỗi kết nối cũ

🚀 GIẢI PHÁP:

1. 🔄 RESET METAMASK:
   - Mở MetaMask extension
   - Click vào Settings (⚙️)
   - Scroll xuống "Advanced"
   - Click "Reset Account"
   - Xác nhận reset

2. 🔄 CLEAR BROWSER CACHE:
   - Ctrl + Shift + Delete
   - Chọn "All time"
   - Check "Cached images and files"
   - Click "Clear data"

3. 🔄 RESTART BROWSER:
   - Đóng hoàn toàn trình duyệt
   - Mở lại trình duyệt
   - Mở lại MetaMask

4. 🔄 RECONNECT NETWORK:
   - MetaMask → Networks → Localhost
   - Click "Delete" network
   - Add lại network:
     - Network Name: Localhost
     - RPC URL: http://localhost:8545
     - Chain ID: 1337
     - Currency Symbol: ETH

5. 🔄 REFRESH PAGE:
   - F5 hoặc Ctrl + R
   - Thử lại debug

6. 🔄 ALTERNATIVE - SWITCH ACCOUNT:
   - MetaMask → Account icon
   - Switch to account khác
   - Switch lại account cũ

💡 Nếu vẫn lỗi:
- Thử trình duyệt khác (Chrome/Firefox)
- Disable các extension khác
- Kiểm tra firewall/antivirus

🎯 Sau khi làm xong, thử lại Debug Tool!
`);

// Test RPC connection
const { ethers } = require('ethers');

async function testRPCAfterFix() {
  console.log('\n🔍 Testing RPC after potential fixes...');
  
  try {
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const balance = await provider.getBalance('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
    console.log('✅ RPC working - Balance:', ethers.formatEther(balance), 'ETH');
    console.log('💡 MetaMask should work now!');
  } catch (error) {
    console.log('❌ RPC still has issues:', error.message);
  }
}

testRPCAfterFix();
