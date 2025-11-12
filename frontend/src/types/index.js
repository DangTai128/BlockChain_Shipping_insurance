// Types for the application
// Converted from TypeScript to JavaScript

// User interface
const User = {
  id: Number,
  wallet_address: String,
  email: String,
  full_name: String,
  phone: String,
  created_at: String,
  updated_at: String
};

// Policy interface
const Policy = {
  id: Number,
  policy_id: Number,
  user_id: Number,
  shipment_id: String,
  coverage_amount: Number,
  premium: Number,
  start_time: String,
  end_time: String,
  status: String, // 'Active' | 'Claimed' | 'Expired' | 'Cancelled'
  shipment_status: String, // 'InTransit' | 'Delivered' | 'Damaged' | 'Lost'
  claim_processed: Boolean,
  created_at: String,
  updated_at: String,
  wallet_address: String,
  email: String,
  full_name: String
};

// Claim interface
const Claim = {
  id: Number,
  claim_id: Number,
  policy_id: Number,
  user_id: Number,
  claim_amount: Number,
  timestamp: String,
  approved: Boolean,
  processed: Boolean,
  created_at: String,
  updated_at: String
};

// ShipmentTracking interface
const ShipmentTracking = {
  id: Number,
  shipment_id: String,
  status: String, // 'InTransit' | 'Delivered' | 'Damaged' | 'Lost'
  location: String,
  timestamp: String,
  notes: String
};

// BlockchainInfo interface
const BlockchainInfo = {
  contractAddress: String,
  balance: String,
  totalPolicies: String,
  totalClaims: String,
  oracleAddress: String
};

// CreatePolicyData interface
const CreatePolicyData = {
  shipmentId: String,
  coverageAmount: Number,
  duration: Number,
  userAddress: String
};

// MetaMaskAccount interface
const MetaMaskAccount = {
  address: String,
  balance: String,
  chainId: String
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    User,
    Policy,
    Claim,
    ShipmentTracking,
    BlockchainInfo,
    CreatePolicyData,
    MetaMaskAccount
  };
}
