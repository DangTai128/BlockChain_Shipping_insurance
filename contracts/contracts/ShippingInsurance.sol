// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ShippingInsurance
 * @dev Smart contract cho hệ thống bảo hiểm vận chuyển tự động
 * @author Sinh viên đại học
 */
contract ShippingInsurance is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    // Enums
    enum InsuranceStatus { Active, Claimed, Expired, Cancelled }
    enum ShipmentStatus { InTransit, Delivered, Damaged, Lost }
    
    // Structs
    struct InsurancePolicy {
        uint256 policyId;
        address policyholder;
        string shipmentId;
        uint256 coverageAmount;
        uint256 premium;
        uint256 startTime;
        uint256 endTime;
        InsuranceStatus status;
        ShipmentStatus shipmentStatus;
        bool claimProcessed;
    }
    
    struct Claim {
        uint256 claimId;
        uint256 policyId;
        address claimant;
        uint256 claimAmount;
        uint256 timestamp;
        bool approved;
        bool processed;
    }
    
    // State variables
    Counters.Counter private _policyCounter;
    Counters.Counter private _claimCounter;
    
    mapping(uint256 => InsurancePolicy) public policies;
    mapping(uint256 => Claim) public claims;
    mapping(string => uint256) public shipmentToPolicy;
    mapping(address => uint256[]) public userPolicies;
    
    // Oracle address (sẽ được set bởi owner)
    address public oracleAddress;
    
    // Events
    event PolicyCreated(
        uint256 indexed policyId,
        address indexed policyholder,
        string shipmentId,
        uint256 coverageAmount,
        uint256 premium
    );
    
    event ClaimSubmitted(
        uint256 indexed claimId,
        uint256 indexed policyId,
        address indexed claimant,
        uint256 claimAmount
    );
    
    event ClaimApproved(
        uint256 indexed claimId,
        uint256 indexed policyId,
        uint256 payoutAmount
    );
    
    event ShipmentStatusUpdated(
        uint256 indexed policyId,
        string shipmentId,
        ShipmentStatus newStatus
    );
    
    // Modifiers
    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Only oracle can call this function");
        _;
    }
    
    modifier policyExists(uint256 _policyId) {
        require(_policyId <= _policyCounter.current(), "Policy does not exist");
        _;
    }
    
    modifier policyActive(uint256 _policyId) {
        require(policies[_policyId].status == InsuranceStatus.Active, "Policy is not active");
        _;
    }
    
    constructor() Ownable() {}
    
    /**
     * @dev Tạo hợp đồng bảo hiểm mới
     * @param _shipmentId ID của lô hàng
     * @param _coverageAmount Số tiền bảo hiểm
     * @param _duration Thời gian bảo hiểm (giây)
     */
    function createPolicy(
        string memory _shipmentId,
        uint256 _coverageAmount,
        uint256 _duration
    ) external payable nonReentrant {
        require(bytes(_shipmentId).length > 0, "Shipment ID cannot be empty");
        require(_coverageAmount > 0, "Coverage amount must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(shipmentToPolicy[_shipmentId] == 0, "Shipment already insured");
        
        // Tính phí bảo hiểm (2% của số tiền bảo hiểm)
        uint256 premium = (_coverageAmount * 2) / 100;
        require(msg.value >= premium, "Insufficient premium payment");
        
        _policyCounter.increment();
        uint256 policyId = _policyCounter.current();
        
        policies[policyId] = InsurancePolicy({
            policyId: policyId,
            policyholder: msg.sender,
            shipmentId: _shipmentId,
            coverageAmount: _coverageAmount,
            premium: premium,
            startTime: block.timestamp,
            endTime: block.timestamp + _duration,
            status: InsuranceStatus.Active,
            shipmentStatus: ShipmentStatus.InTransit,
            claimProcessed: false
        });
        
        shipmentToPolicy[_shipmentId] = policyId;
        userPolicies[msg.sender].push(policyId);
        
        // Hoàn trả tiền thừa nếu có
        if (msg.value > premium) {
            payable(msg.sender).transfer(msg.value - premium);
        }
        
        emit PolicyCreated(policyId, msg.sender, _shipmentId, _coverageAmount, premium);
    }
    
    /**
     * @dev Oracle cập nhật trạng thái vận chuyển
     * @param _shipmentId ID của lô hàng
     * @param _status Trạng thái mới của lô hàng
     */
    function updateShipmentStatus(
        string memory _shipmentId,
        ShipmentStatus _status
    ) external onlyOracle {
        uint256 policyId = shipmentToPolicy[_shipmentId];
        require(policyId > 0, "Shipment not found");
        
        InsurancePolicy storage policy = policies[policyId];
        require(policy.status == InsuranceStatus.Active, "Policy is not active");
        
        policy.shipmentStatus = _status;
        
        // Tự động xử lý claim nếu hàng hóa bị hỏng hoặc mất
        if (_status == ShipmentStatus.Damaged || _status == ShipmentStatus.Lost) {
            _processAutomaticClaim(policyId);
        }
        
        emit ShipmentStatusUpdated(policyId, _shipmentId, _status);
    }
    
    /**
     * @dev Xử lý claim tự động khi hàng hóa bị hỏng/mất
     * @param _policyId ID của hợp đồng bảo hiểm
     */
    function _processAutomaticClaim(uint256 _policyId) internal {
        InsurancePolicy storage policy = policies[_policyId];
        require(!policy.claimProcessed, "Claim already processed");
        
        _claimCounter.increment();
        uint256 claimId = _claimCounter.current();
        
        uint256 claimAmount = policy.coverageAmount;
        
        claims[claimId] = Claim({
            claimId: claimId,
            policyId: _policyId,
            claimant: policy.policyholder,
            claimAmount: claimAmount,
            timestamp: block.timestamp,
            approved: true,
            processed: true
        });
        
        policy.claimProcessed = true;
        policy.status = InsuranceStatus.Claimed;
        
        // Chuyển tiền bồi thường
        payable(policy.policyholder).transfer(claimAmount);
        
        emit ClaimSubmitted(claimId, _policyId, policy.policyholder, claimAmount);
        emit ClaimApproved(claimId, _policyId, claimAmount);
    }
    
    /**
     * @dev Lấy thông tin hợp đồng bảo hiểm
     * @param _policyId ID của hợp đồng bảo hiểm
     */
    function getPolicy(uint256 _policyId) external view policyExists(_policyId) returns (InsurancePolicy memory) {
        return policies[_policyId];
    }
    
    /**
     * @dev Lấy danh sách hợp đồng của người dùng
     * @param _user Địa chỉ người dùng
     */
    function getUserPolicies(address _user) external view returns (uint256[] memory) {
        return userPolicies[_user];
    }
    
    /**
     * @dev Lấy thông tin claim
     * @param _claimId ID của claim
     */
    function getClaim(uint256 _claimId) external view returns (Claim memory) {
        require(_claimId <= _claimCounter.current(), "Claim does not exist");
        return claims[_claimId];
    }
    
    /**
     * @dev Set địa chỉ Oracle (chỉ owner)
     * @param _oracleAddress Địa chỉ Oracle
     */
    function setOracleAddress(address _oracleAddress) external onlyOwner {
        require(_oracleAddress != address(0), "Invalid oracle address");
        oracleAddress = _oracleAddress;
    }
    
    /**
     * @dev Rút tiền từ contract (chỉ owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Lấy số dư contract
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Lấy tổng số hợp đồng đã tạo
     */
    function getTotalPolicies() external view returns (uint256) {
        return _policyCounter.current();
    }
    
    /**
     * @dev Lấy tổng số claim đã xử lý
     */
    function getTotalClaims() external view returns (uint256) {
        return _claimCounter.current();
    }
}
