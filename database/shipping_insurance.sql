-- =============================================
-- Database: shipping_insurance
-- Description: Database cho hệ thống bảo hiểm vận chuyển blockchain
-- Author: Sinh viên đại học
-- Created: 2024
-- =============================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS `shipping_insurance` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Sử dụng database
USE `shipping_insurance`;

-- =============================================
-- Table: users
-- Description: Thông tin người dùng
-- =============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `wallet_address` varchar(42) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wallet_address` (`wallet_address`),
  KEY `idx_email` (`email`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: policies
-- Description: Hợp đồng bảo hiểm
-- =============================================
CREATE TABLE IF NOT EXISTS `policies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `policy_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `shipment_id` varchar(255) NOT NULL,
  `coverage_amount` decimal(20,8) NOT NULL,
  `premium` decimal(20,8) NOT NULL,
  `start_time` timestamp NOT NULL,
  `end_time` timestamp NOT NULL,
  `status` enum('Active','Claimed','Expired','Cancelled') DEFAULT 'Active',
  `shipment_status` enum('InTransit','Delivered','Damaged','Lost') DEFAULT 'InTransit',
  `claim_processed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `shipment_id` (`shipment_id`),
  KEY `idx_policy_id` (`policy_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_shipment_status` (`shipment_status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_policies_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: claims
-- Description: Yêu cầu bồi thường
-- =============================================
CREATE TABLE IF NOT EXISTS `claims` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `claim_id` int(11) NOT NULL,
  `policy_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `claim_amount` decimal(20,8) NOT NULL,
  `timestamp` timestamp NOT NULL,
  `approved` tinyint(1) DEFAULT 0,
  `processed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_claim_id` (`claim_id`),
  KEY `idx_policy_id` (`policy_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_approved` (`approved`),
  KEY `idx_processed` (`processed`),
  KEY `idx_timestamp` (`timestamp`),
  CONSTRAINT `fk_claims_policy` FOREIGN KEY (`policy_id`) REFERENCES `policies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_claims_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: shipment_tracking
-- Description: Lịch sử theo dõi hàng hóa
-- =============================================
CREATE TABLE IF NOT EXISTS `shipment_tracking` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `shipment_id` varchar(255) NOT NULL,
  `status` enum('InTransit','Delivered','Damaged','Lost') NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_shipment_id` (`shipment_id`),
  KEY `idx_status` (`status`),
  KEY `idx_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Insert sample data
-- =============================================

-- Insert sample users
INSERT INTO `users` (`wallet_address`, `email`, `full_name`, `phone`) VALUES
('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 'user1@example.com', 'Nguyễn Văn A', '0123456789'),
('0x8ba1f109551bD432803012645Hac136c4c8e4e4', 'user2@example.com', 'Trần Thị B', '0987654321'),
('0x1234567890123456789012345678901234567890', 'user3@example.com', 'Lê Văn C', '0369258147');

-- Insert sample policies
INSERT INTO `policies` (`policy_id`, `user_id`, `shipment_id`, `coverage_amount`, `premium`, `start_time`, `end_time`, `status`, `shipment_status`) VALUES
(1, 1, 'SHIP001', 1.00000000, 0.02000000, '2024-01-01 00:00:00', '2024-01-08 00:00:00', 'Active', 'InTransit'),
(2, 2, 'SHIP002', 2.50000000, 0.05000000, '2024-01-02 00:00:00', '2024-01-09 00:00:00', 'Active', 'InTransit'),
(3, 3, 'SHIP003', 0.50000000, 0.01000000, '2024-01-03 00:00:00', '2024-01-10 00:00:00', 'Claimed', 'Damaged');

-- Insert sample claims
INSERT INTO `claims` (`claim_id`, `policy_id`, `user_id`, `claim_amount`, `timestamp`, `approved`, `processed`) VALUES
(1, 3, 3, 0.50000000, '2024-01-05 10:30:00', 1, 1);

-- Insert sample shipment tracking
INSERT INTO `shipment_tracking` (`shipment_id`, `status`, `location`, `notes`) VALUES
('SHIP001', 'InTransit', 'Hà Nội, Việt Nam', 'Hàng hóa đang trong quá trình vận chuyển'),
('SHIP002', 'InTransit', 'TP. Hồ Chí Minh, Việt Nam', 'Hàng hóa đang trong quá trình vận chuyển'),
('SHIP003', 'Damaged', 'Singapore', 'Hàng hóa bị hỏng trong quá trình vận chuyển'),
('SHIP003', 'InTransit', 'Bangkok, Thái Lan', 'Hàng hóa đang trong quá trình vận chuyển');

-- =============================================
-- Create views for easier querying
-- =============================================

-- View: policy_details
CREATE OR REPLACE VIEW `policy_details` AS
SELECT 
    p.id,
    p.policy_id,
    p.shipment_id,
    p.coverage_amount,
    p.premium,
    p.start_time,
    p.end_time,
    p.status,
    p.shipment_status,
    p.claim_processed,
    p.created_at,
    u.wallet_address,
    u.email,
    u.full_name,
    u.phone
FROM policies p
JOIN users u ON p.user_id = u.id;

-- View: user_statistics
CREATE OR REPLACE VIEW `user_statistics` AS
SELECT 
    u.id,
    u.wallet_address,
    u.email,
    u.full_name,
    COUNT(p.id) as total_policies,
    COUNT(CASE WHEN p.status = 'Active' THEN 1 END) as active_policies,
    COUNT(CASE WHEN p.status = 'Claimed' THEN 1 END) as claimed_policies,
    COUNT(c.id) as total_claims,
    COALESCE(SUM(p.coverage_amount), 0) as total_coverage,
    COALESCE(SUM(c.claim_amount), 0) as total_claims_amount
FROM users u
LEFT JOIN policies p ON u.id = p.user_id
LEFT JOIN claims c ON u.id = c.user_id
GROUP BY u.id, u.wallet_address, u.email, u.full_name;

-- =============================================
-- Create stored procedures
-- =============================================

DELIMITER //

-- Procedure: Get user policies with details
CREATE PROCEDURE GetUserPolicies(IN user_wallet VARCHAR(42))
BEGIN
    SELECT 
        p.*,
        u.wallet_address,
        u.email,
        u.full_name
    FROM policies p
    JOIN users u ON p.user_id = u.id
    WHERE u.wallet_address = user_wallet
    ORDER BY p.created_at DESC;
END //

-- Procedure: Get policy statistics
CREATE PROCEDURE GetPolicyStatistics()
BEGIN
    SELECT 
        COUNT(*) as total_policies,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_policies,
        COUNT(CASE WHEN status = 'Claimed' THEN 1 END) as claimed_policies,
        COUNT(CASE WHEN status = 'Expired' THEN 1 END) as expired_policies,
        COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled_policies,
        COALESCE(SUM(coverage_amount), 0) as total_coverage,
        COALESCE(SUM(premium), 0) as total_premium
    FROM policies;
END //

-- Procedure: Update shipment status
CREATE PROCEDURE UpdateShipmentStatus(
    IN shipment_id VARCHAR(255),
    IN new_status ENUM('InTransit','Delivered','Damaged','Lost'),
    IN new_location VARCHAR(255),
    IN notes TEXT
)
BEGIN
    -- Update policy status
    UPDATE policies 
    SET shipment_status = new_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE policies.shipment_id = shipment_id;
    
    -- Insert tracking record
    INSERT INTO shipment_tracking (shipment_id, status, location, notes)
    VALUES (shipment_id, new_status, new_location, notes);
    
    -- If damaged or lost, process claim automatically
    IF new_status IN ('Damaged', 'Lost') THEN
        UPDATE policies 
        SET status = 'Claimed',
            claim_processed = 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE policies.shipment_id = shipment_id;
        
        -- Create claim record
        INSERT INTO claims (claim_id, policy_id, user_id, claim_amount, timestamp, approved, processed)
        SELECT 
            (SELECT COALESCE(MAX(claim_id), 0) + 1 FROM claims c),
            p.id,
            p.user_id,
            p.coverage_amount,
            NOW(),
            1,
            1
        FROM policies p 
        WHERE p.shipment_id = shipment_id;
    END IF;
END //

DELIMITER ;

-- =============================================
-- Create indexes for better performance
-- =============================================

-- Additional indexes for better query performance
CREATE INDEX idx_policies_user_status ON policies(user_id, status);
CREATE INDEX idx_policies_shipment_status ON policies(shipment_status, status);
CREATE INDEX idx_claims_policy_processed ON claims(policy_id, processed);
CREATE INDEX idx_tracking_shipment_timestamp ON shipment_tracking(shipment_id, timestamp);

-- =============================================
-- Grant permissions (optional)
-- =============================================

-- Create user for application (optional)
-- CREATE USER 'shipping_app'@'localhost' IDENTIFIED BY 'your_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON shipping_insurance.* TO 'shipping_app'@'localhost';
-- FLUSH PRIVILEGES;

-- =============================================
-- Database setup complete
-- =============================================

-- Show database structure
SHOW TABLES;

-- Show sample data
SELECT 'Users:' as info;
SELECT * FROM users LIMIT 5;

SELECT 'Policies:' as info;
SELECT * FROM policy_details LIMIT 5;

SELECT 'Claims:' as info;
SELECT * FROM claims LIMIT 5;

SELECT 'Shipment Tracking:' as info;
SELECT * FROM shipment_tracking LIMIT 5;

-- Show statistics
CALL GetPolicyStatistics();
