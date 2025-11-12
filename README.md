# 🚛 Bảo hiểm Vận chuyển Blockchain

## 📋 Mô tả dự án
Dự án blockchain về bảo hiểm vận chuyển tự động trả bồi thường khi hàng hóa bị hỏng trong quá trình vận chuyển. Đây là dự án dành cho sinh viên đại học học tập về blockchain và smart contracts.

## 🛠️ Công nghệ sử dụng
- **Frontend**: ReactJS với MetaMask integration
- **Backend**: Node.js + Express + MySQL
- **Blockchain**: Ethereum Smart Contracts (Solidity)
- **Database**: MySQL
- **Oracle**: Service kiểm tra tình trạng hàng hóa tự động
- **Development**: Hardhat cho smart contracts

## 📁 Cấu trúc dự án
```
├── contracts/          # Smart contracts (Solidity + Hardhat)
│   ├── contracts/      # Solidity contracts
│   ├── scripts/        # Deploy scripts
│   └── test/          # Contract tests
├── frontend/           # ReactJS frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # API services
│   │   ├── hooks/     # Custom hooks
│   │   └── types/     # JavaScript types
├── backend/            # Node.js backend
│   ├── routes/         # API routes
│   ├── config/         # Database config
│   └── middleware/     # Express middleware
├── oracle/             # Oracle service
├── database/           # SQL files
└── docs/              # Tài liệu
```

## 🚀 Cài đặt và chạy nhanh

### ⚡ Chạy toàn bộ dự án với 1 lệnh

#### **Chế độ thông thường (tự động deploy, không mất dữ liệu):**
```bash
# Cài đặt tất cả dependencies
npm run install:all

# Setup environment files
npm run setup:env

# Import database
mysql -u root -p < database/shipping_insurance.sql

# Chạy toàn bộ dự án (tự động deploy contract nếu cần)
npm run dev:all
```

#### **Chế độ persistent (lưu trạng thái blockchain):**
```bash
# Cài đặt tất cả dependencies
npm run install:all

# Import database
mysql -u root -p < database/shipping_insurance.sql

# Chạy toàn bộ dự án với persistent state
npm run dev:all:preserve
```

### 🌐 Truy cập ứng dụng
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health check**: http://localhost:3001/api/health

---

## 📖 Hướng dẫn chi tiết

### 🔧 Yêu cầu hệ thống
- Node.js >= 16.0.0
- MySQL >= 8.0
- MetaMask extension trên trình duyệt
- Git

### 📥 Cài đặt từng bước

#### 1. Clone repository
```bash
git clone <repository-url>
cd shipping-insurance-blockchain
```

#### 2. Cài đặt dependencies
```bash
# Cài đặt tất cả dependencies
npm run install:all

# Hoặc cài đặt từng phần riêng biệt
cd contracts && npm install
cd ../backend && npm install  
cd ../frontend && npm install
cd ../oracle && npm install
```

#### 3. Cấu hình Database MySQL

**Cách 1: Import file SQL (Khuyến nghị)**
```bash
# Import database từ file SQL
mysql -u root -p < database/shipping_insurance.sql
```

**Cách 2: Tạo thủ công**
```sql
-- Tạo database
CREATE DATABASE shipping_insurance;

-- Tạo user (tùy chọn)
CREATE USER 'shipping_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON shipping_insurance.* TO 'shipping_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 4. Cấu hình Environment Variables

**Backend (.env)**
```bash
# Copy từ backend/env.example
cp backend/env.example backend/.env

# Cập nhật các giá trị trong backend/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=shipping_insurance
PORT=3001
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=
PRIVATE_KEY=
```

**Frontend (.env.local)**
```bash
# Copy từ frontend/env.example
cp frontend/env.example frontend/.env.local

# Cập nhật các giá trị trong frontend/.env.local
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_CONTRACT_ADDRESS=your_contract_address
REACT_APP_CHAIN_ID=1337
```

**Oracle (.env)**
```bash
# Copy từ oracle/env.example
cp oracle/env.example oracle/.env

# Cập nhật các giá trị trong oracle/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
CONTRACT_ADDRESS=your_contract_address
PRIVATE_KEY=your_private_key # Private key của tài khoản Oracle trên mạng Hardhat
```

#### 5. Deploy Smart Contracts
```bash
cd contracts

# Compile contracts
npm run compile

# Deploy to local network (cần chạy Hardhat node trước)
npx hardhat node &
npm run deploy
```

#### 6. Chạy các services

**Cách 1: Chạy tất cả cùng lúc (Khuyến nghị)**
```bash
npm run dev:all
```

**Cách 2: Chạy từng service riêng biệt**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm start

# Terminal 3: Oracle (tùy chọn)
cd oracle && npm start
```

### 🎯 Hướng dẫn sử dụng

#### 1. Thiết lập MetaMask

**Cài đặt MetaMask:**
- Truy cập https://metamask.io/
- Cài đặt MetaMask extension cho trình duyệt

**Thêm mạng Localhost:**
1. Mở MetaMask → Click dropdown mạng → "Add Network" → "Add Network Manually"
2. Nhập thông tin:
   - **Network Name**: `Localhost`
   - **RPC URL**: `http://localhost:8545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: `ETH`
3. Click "Save"

**Import Account để test:**
1. Chạy Hardhat node: `npx hardhat node`
2. Copy private key từ danh sách accounts
3. MetaMask → Account icon → "Import Account" → Paste private key
4. Đặt tên account (ví dụ: "Local Account")

**Account mẫu từ Hardhat:**
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### 2. Tạo hợp đồng bảo hiểm
1. Mở ứng dụng frontend tại http://localhost:3000
2. Kết nối MetaMask wallet
3. Nhập thông tin lô hàng:
   - ID lô hàng (ví dụ: SHIP001)
   - Số tiền bảo hiểm (ETH)
   - Thời gian bảo hiểm (ngày)
4. Xác nhận giao dịch trên MetaMask
5. Hợp đồng sẽ được tạo và lưu vào database

#### 3. Theo dõi Oracle
- Oracle sẽ tự động kiểm tra tình trạng hàng hóa mỗi 5 phút
- Khi phát hiện hàng hóa bị hỏng/mất, hệ thống sẽ:
  - Cập nhật trạng thái lên blockchain
  - Tự động xử lý claim
  - Chuyển tiền bồi thường cho người dùng

### 🧪 Testing

#### Test Smart Contracts
```bash
npm run test:contracts
```

#### Test Backend API
```bash
npm run test:backend
```

### 📊 API Endpoints

#### Blockchain API
- `GET /api/blockchain/info` - Thông tin contract
- `POST /api/blockchain/create-policy` - Tạo hợp đồng
- `GET /api/blockchain/policy/:id` - Lấy thông tin hợp đồng
- `GET /api/blockchain/user/:address/policies` - Hợp đồng của user

#### Policy API
- `GET /api/policy` - Danh sách hợp đồng
- `POST /api/policy` - Tạo hợp đồng mới
- `GET /api/policy/:id` - Chi tiết hợp đồng
- `GET /api/policy/user/:address` - Hợp đồng của user
- `PUT /api/policy/:id` - Cập nhật hợp đồng
- `GET /api/policy/stats/overview` - Thống kê tổng quan

#### User API
- `GET /api/user` - Danh sách user
- `POST /api/user` - Tạo/cập nhật user
- `GET /api/user/:address` - Chi tiết user
- `PUT /api/user/:address` - Cập nhật user
- `GET /api/user/:address/stats` - Thống kê user

#### Oracle API
- `POST /api/oracle/check-shipment` - Kiểm tra lô hàng
- `GET /api/oracle/tracking/:id` - Lịch sử theo dõi
- `POST /api/oracle/auto-check` - Kiểm tra tự động
- `POST /api/oracle/update-blockchain` - Cập nhật blockchain
- `GET /api/oracle/stats` - Thống kê Oracle

### 🔧 Troubleshooting

#### Lỗi "Hợp đồng chưa được khởi tạo"
- **Nguyên nhân**: Contract chưa được deploy hoặc địa chỉ contract không đúng
- **Giải pháp tự động**: Sử dụng Smart Deploy
  ```bash
  # Chạy với tự động deploy (khuyến nghị)
  npm run dev:all
  
  # Hoặc deploy thủ công
  npm run deploy
  ```
- **Kiểm tra**: Đảm bảo file `frontend/.env.local` có `REACT_APP_CONTRACT_ADDRESS`
- **Smart Deploy**: Tự động kiểm tra và deploy contract khi cần thiết

#### Lỗi MySQL "Cannot read properties of undefined"
- **Nguyên nhân**: File .env chưa được tạo hoặc cấu hình database sai
- **Giải pháp**:
  ```bash
  # Setup environment files
  npm run setup:env
  
  # Hoặc copy thủ công
  cp backend/env.example backend/.env
  cp oracle/env.example oracle/.env
  ```

#### Lỗi Backend "Cannot read properties of undefined (reading 'rpcUrl')"
- **Nguyên nhân**: Backend thiếu blockchain configuration
- **Giải pháp**:
  ```bash
  # Setup environment files với blockchain config
  npm run setup:env
  
  # Hoặc deploy để tự động cấu hình
  npm run deploy
  ```

#### Lỗi Oracle "Cannot read properties of undefined (reading 'rpcUrl')"
- **Nguyên nhân**: Oracle thiếu blockchain configuration
- **Giải pháp**: Tương tự như Backend
  ```bash
  # Setup environment files
  npm run setup:env
  
  # Hoặc deploy để tự động cấu hình
  npm run deploy
  ```

#### Lỗi "Blockchain not configured" trong Oracle
- **Nguyên nhân**: Oracle chưa có contract address và private key
- **Giải pháp**: Chạy smart deploy để tự động cấu hình
  ```bash
  npm run deploy
  ```

#### Lỗi kết nối MetaMask
- Đảm bảo MetaMask extension đã được cài đặt trên trình duyệt
- Kiểm tra mạng đang kết nối (localhost:1337)
- Refresh trang và thử lại

#### Lỗi database
- Kiểm tra MySQL đang chạy: `sudo systemctl status mysql`
- Xác nhận thông tin kết nối trong .env
- Kiểm tra database `shipping_insurance` đã được tạo
- Import lại database: `mysql -u root -p < database/shipping_insurance.sql`

#### Lỗi "This command is not supported in the prepared statement protocol yet"
- **Nguyên nhân**: Sử dụng `execute()` với lệnh DDL như `CREATE DATABASE`
- **Giải pháp**: Đã sửa trong code, sử dụng `query()` thay vì `execute()` cho DDL
- **Khắc phục**: Restart backend để áp dụng thay đổi

#### Lỗi smart contract
- Đảm bảo Hardhat node đang chạy: `npx hardhat node`
- Kiểm tra contract đã được deploy
- Xác nhận địa chỉ contract trong .env

#### Lỗi "File @openzeppelin/contracts not found"
- **Nguyên nhân**: OpenZeppelin contracts chưa được cài đặt hoặc phiên bản không tương thích
- **Giải pháp**:
  ```bash
  cd contracts
  npm install
  npx hardhat compile
  ```
- **Lưu ý**: Sử dụng OpenZeppelin v4.9.0 để tương thích với Solidity ^0.8.19
- Redeploy contracts: `npm run build:contracts`

#### Lỗi CORS
- Kiểm tra FRONTEND_URL trong backend/.env
- Đảm bảo URL khớp với frontend đang chạy

#### Lỗi dependencies
- Xóa node_modules và cài lại: `npm run install:all`
- Kiểm tra phiên bản Node.js: `node --version`

### 📋 Scripts có sẵn

```bash
# Cài đặt và setup
npm run install:all          # Cài đặt tất cả dependencies
npm run setup               # Cài đặt + build contracts (thông thường)
npm run setup:preserve      # Cài đặt + build contracts (persistent)

# Chạy dự án
npm run dev:all            # Chạy tất cả services (tự động deploy)
npm run dev:all:preserve   # Chạy tất cả services (persistent state)
npm run dev:contracts      # Chỉ chạy Hardhat node (thông thường)
npm run dev:contracts:smart # Chỉ chạy Hardhat node (tự động deploy)
npm run dev:contracts:preserve # Chỉ chạy Hardhat node (persistent)
npm run dev:backend        # Chỉ chạy backend
npm run dev:frontend       # Chỉ chạy frontend
npm run dev:oracle         # Chỉ chạy oracle

# Build và deploy
npm run build:contracts    # Compile + deploy contracts (thông thường)
npm run build:contracts:preserve # Compile + deploy contracts (persistent)
npm run deploy:preserve    # Deploy lên persistent network

# Test
npm run test:contracts     # Test smart contracts
npm run test:backend       # Test backend API

# Quản lý blockchain state
npm run reset:blockchain   # Reset blockchain state (xóa dữ liệu cũ)
npm run backup:blockchain  # Backup blockchain state
```

### 💾 Persistent State Management

#### **Lưu trạng thái blockchain:**
- Sử dụng `npm run dev:all:preserve` để chạy với persistent state
- Dữ liệu blockchain được lưu trong `contracts/blockchain-state/`
- Dữ liệu sẽ được giữ lại khi restart server

#### **Quản lý dữ liệu:**
```bash
# Reset blockchain state (xóa tất cả dữ liệu)
npm run reset:blockchain

# Backup blockchain state
npm run backup:blockchain

# Restore từ backup
cd contracts && tar -xzf blockchain-backup-YYYYMMDD-HHMMSS.tar.gz
```

#### **So sánh 3 chế độ:**

| Tính năng | Thông thường | Smart Deploy | Persistent |
|-----------|-------------|--------------|------------|
| **Script** | `npm run dev:contracts` | `npm run dev:all` | `npm run dev:all:preserve` |
| **Tự động deploy** | ❌ | ✅ | ❌ |
| **Dữ liệu blockchain** | Mất khi restart | Mất khi restart | Được lưu trữ |
| **Tốc độ khởi động** | Nhanh | Trung bình | Chậm hơn |
| **Phù hợp** | Manual deploy | Development/Test | Production-like |
| **Dung lượng** | Ít | Ít | Nhiều hơn |

### 🗄️ Database Schema

#### Tables chính:
- **users**: Thông tin người dùng
- **policies**: Hợp đồng bảo hiểm
- **claims**: Yêu cầu bồi thường
- **shipment_tracking**: Lịch sử theo dõi hàng hóa

#### Views:
- **policy_details**: Chi tiết hợp đồng với thông tin user
- **user_statistics**: Thống kê của từng user

#### Stored Procedures:
- **GetUserPolicies**: Lấy hợp đồng của user
- **GetPolicyStatistics**: Thống kê tổng quan
- **UpdateShipmentStatus**: Cập nhật trạng thái hàng hóa

### 🎓 Giá trị học tập

#### Cho sinh viên đại học:
- Hiểu cách blockchain hoạt động trong thực tế
- Học cách tích hợp MetaMask với ứng dụng web
- Thực hành với smart contracts và Solidity
- Làm việc với Oracle và external data
- Phát triển full-stack application

#### Kỹ năng phát triển:
- Smart contract development
- Web3 integration
- Full-stack development
- Database design
- API development
- Frontend development

### 🚀 Hướng phát triển tương lai

#### Tính năng có thể thêm:
- Multi-signature wallets
- Insurance pools
- Risk assessment algorithms
- Mobile app
- Integration với các shipping companies thực tế
- Machine learning cho fraud detection

#### Cải tiến kỹ thuật:
- Layer 2 solutions (Polygon, Arbitrum)
- IPFS cho document storage
- Advanced Oracle networks (Chainlink)
- Gas optimization
- Security audits

### 📚 Tài liệu tham khảo
- [Ethereum Documentation](https://ethereum.org/developers/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [MetaMask Documentation](https://docs.metamask.io/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

### 👥 Đóng góp
Dự án này được tạo cho mục đích học tập. Mọi đóng góp và cải tiến đều được chào đón!

### 📄 License
MIT License - Xem file LICENSE để biết thêm chi tiết.
