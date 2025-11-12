#!/bin/bash

# Script để chạy Hardhat node với persistent state
# Lưu trạng thái blockchain vào file để không bị mất khi restart

echo "🚀 Starting Hardhat node with persistent state..."

# Tạo thư mục để lưu blockchain state nếu chưa có
mkdir -p ./blockchain-state

# Chạy Hardhat node với persistent state
# --fork: Fork từ mainnet (tùy chọn)
# --db: Lưu trạng thái vào database
# --hostname: Cho phép kết nối từ bên ngoài
npx hardhat node \
  --hostname 0.0.0.0 \
  --port 8545 \
  --fork-url https://eth-mainnet.alchemyapi.io/v2/demo \
  --fork-block-number 18000000 \
  --db ./blockchain-state \
  --reset
