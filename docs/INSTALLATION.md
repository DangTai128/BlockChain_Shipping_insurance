# 🚀 Hướng dẫn cài đặt chi tiết

## Bước 1: Chuẩn bị môi trường

### Cài đặt Node.js
```bash
# Tải và cài đặt Node.js từ https://nodejs.org/
# Hoặc sử dụng nvm (Node Version Manager)
nvm install 18
nvm use 18
```

### Cài đặt MySQL
```bash
# Windows: Tải MySQL Installer từ https://dev.mysql.com/downloads/installer/
# Ubuntu/Debian:
sudo apt update
sudo apt install mysql-server

# macOS với Homebrew:
brew install mysql
brew services start mysql
```

### Cài đặt Git
```bash
# Windows: Tải Git từ https://git-scm.com/
# Ubuntu/Debian:
sudo apt install git

# macOS:
brew install git
```

### Cài đặt MetaMask Extension
- Truy cập https://metamask.io/
- Cài đặt MetaMask extension cho trình duyệt của bạn
- Tạo ví hoặc import ví hiện có

## Bước 2: Clone và setup dự án

```bash
# Clone repository
git clone <your-repository-url>
cd shipping-insurance-blockchain

# Cài đặt dependencies cho tất cả modules
npm install
```

## Bước 3: Cấu hình Database

### Tạo database MySQL
```sql
-- Đăng nhập MySQL
mysql -u root -p

-- Tạo database
CREATE DATABASE shipping_insurance;

-- Tạo user mới (tùy chọn)
CREATE USER 'shipping_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON shipping_insurance.* TO 'shipping_user'@'localhost';
FLUSH PRIVILEGES;

-- Thoát MySQL
EXIT;
```

## Bước 4: Cấu hình Environment Variables

### Backend Configuration
```bash
cd backend
cp env.example .env

# Chỉnh sửa file .env
nano .env
```

Nội dung file `.env`:
```env
# Database configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=shipping_insurance
DB_PORT=3306

# Server configuration
PORT=3001
HOST=localhost
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Blockchain configuration
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=
PRIVATE_KEY=
CHAIN_ID=1337

# JWT configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Oracle configuration
ORACLE_UPDATE_INTERVAL=300000
ORACLE_API_KEY=
```

### Frontend Configuration
```bash
cd frontend
cp env.example .env.local

# Chỉnh sửa file .env.local
nano .env.local
```

Nội dung file `.env.local`:
```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# Blockchain Configuration
REACT_APP_CONTRACT_ADDRESS=
REACT_APP_CHAIN_ID=1337
REACT_APP_RPC_URL=http://localhost:8545

# MetaMask Configuration
REACT_APP_NETWORK_NAME=Localhost
REACT_APP_NETWORK_SYMBOL=ETH
REACT_APP_NETWORK_DECIMALS=18
```

### Oracle Configuration
```bash
cd oracle
cp env.example .env

# Chỉnh sửa file .env
nano .env
```

Nội dung file `.env`:
```env
# Database configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=shipping_insurance
DB_PORT=3306

# Blockchain configuration
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=
PRIVATE_KEY=
CHAIN_ID=1337

# Oracle configuration
ORACLE_UPDATE_INTERVAL=300000
ORACLE_API_KEY=

# Logging
LOG_LEVEL=info
```

## Bước 5: Deploy Smart Contracts

### Cài đặt Hardhat dependencies
```bash
cd contracts
npm install
```

### Compile contracts
```bash
npm run compile
```

### Chạy Hardhat local network
```bash
# Terminal mới
npx hardhat node
```

Giữ terminal này chạy và mở terminal mới để deploy:

### Deploy contracts
```bash
cd contracts
npm run deploy
```

Sau khi deploy thành công, copy địa chỉ contract và cập nhật vào các file .env:
- `backend/.env` - CONTRACT_ADDRESS
- `frontend/.env.local` - REACT_APP_CONTRACT_ADDRESS  
- `oracle/.env` - CONTRACT_ADDRESS

### Lấy private key từ Hardhat
Từ output của `npx hardhat node`, copy một private key và cập nhật vào:
- `backend/.env` - PRIVATE_KEY
- `oracle/.env` - PRIVATE_KEY

## Bước 6: Chạy ứng dụng

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

### Terminal 2: Frontend
```bash
cd frontend
npm start
```

### Terminal 3: Oracle (tùy chọn)
```bash
cd oracle
npm start
```

## Bước 7: Cấu hình MetaMask

### Thêm mạng localhost
1. Mở MetaMask
2. Click vào network dropdown
3. Chọn "Add Network" > "Add Network Manually"
4. Nhập thông tin:
   - Network Name: `Localhost`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`
   - Block Explorer URL: (để trống)

### Import account
1. Trong MetaMask, click vào account icon
2. Chọn "Import Account"
3. Paste private key từ Hardhat node
4. Đặt tên account (ví dụ: "Local Account")

## Bước 8: Kiểm tra ứng dụng

### Truy cập ứng dụng
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Health check: http://localhost:3001/api/health

### Test chức năng
1. Kết nối MetaMask với mạng localhost
2. Tạo hợp đồng bảo hiểm mới
3. Kiểm tra danh sách hợp đồng
4. Chạy Oracle để kiểm tra tình trạng hàng hóa

## Troubleshooting

### Lỗi "Cannot connect to database"
```bash
# Kiểm tra MySQL đang chạy
sudo systemctl status mysql  # Linux
brew services list | grep mysql  # macOS

# Khởi động MySQL
sudo systemctl start mysql  # Linux
brew services start mysql  # macOS
```

### Lỗi "Contract not deployed"
```bash
# Kiểm tra Hardhat node đang chạy
ps aux | grep hardhat

# Restart Hardhat node
npx hardhat node
```

### Lỗi MetaMask connection
- Đảm bảo MetaMask đã được cài đặt
- Kiểm tra mạng đang kết nối là localhost:1337
- Refresh trang và thử lại

### Lỗi CORS
- Kiểm tra FRONTEND_URL trong backend/.env
- Đảm bảo URL khớp với frontend đang chạy

## Cấu trúc file quan trọng

```
├── contracts/
│   ├── contracts/ShippingInsurance.sol  # Smart contract chính
│   ├── scripts/deploy.js               # Script deploy
│   └── test/ShippingInsurance.test.js  # Tests
├── backend/
│   ├── routes/                        # API routes
│   ├── config/database.js            # Database config
│   └── server.js                      # Server chính
├── frontend/
│   ├── src/components/               # React components
│   ├── src/services/                 # API services
│   └── src/hooks/                    # Custom hooks
└── oracle/
    └── oracle.js                     # Oracle service
```

## Scripts hữu ích

### Chạy tất cả services
```bash
# Terminal 1: Hardhat node
npx hardhat node

# Terminal 2: Backend
cd backend && npm run dev

# Terminal 3: Frontend  
cd frontend && npm start

# Terminal 4: Oracle
cd oracle && npm start
```

### Reset database
```bash
mysql -u root -p
DROP DATABASE shipping_insurance;
CREATE DATABASE shipping_insurance;
EXIT;
```

### Rebuild contracts
```bash
cd contracts
npm run compile
npm run deploy
```

Chúc bạn thành công với dự án! 🎉
