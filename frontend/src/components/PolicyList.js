import React, { useState, useEffect, useCallback } from 'react';
import { useMetaMask } from '../hooks/useMetaMask';
import { policyAPI } from '../services/api';
import './PolicyList.css';

const PolicyList = () => {
  const { account, isConnected } = useMetaMask();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userPolicies = await policyAPI.getByUser(account);
      setPolicies(userPolicies);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    if (isConnected && account) {
      fetchPolicies();
    }
  }, [isConnected, account, fetchPolicies]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#28a745';
      case 'Claimed': return '#17a2b8';
      case 'Expired': return '#6c757d';
      case 'Cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Active': return 'Đang hoạt động';
      case 'Claimed': return 'Đã bồi thường';
      case 'Expired': return 'Hết hạn';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getShipmentStatusText = (status) => {
    switch (status) {
      case 'InTransit': return 'Đang vận chuyển';
      case 'Delivered': return 'Đã giao hàng';
      case 'Damaged': return 'Bị hỏng';
      case 'Lost': return 'Bị mất';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) {
      return '0.0000'; // Trả về giá trị mặc định nếu không phải là số
    }
    return num.toFixed(4);
  };

  if (!isConnected) {
    return (
      <div className="policy-list">
        <div className="not-connected">
          <h2>Danh sách hợp đồng bảo hiểm</h2>
          <p>Vui lòng kết nối MetaMask để xem danh sách hợp đồng</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="policy-list">
        <div className="loading">
          <h2>Danh sách hợp đồng bảo hiểm</h2>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="policy-list">
        <div className="error">
          <h2>Danh sách hợp đồng bảo hiểm</h2>
          <p className="error-message">❌ {error}</p>
          <button onClick={fetchPolicies} className="retry-button">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="policy-list">
      <div className="policy-header">
        <h2>Danh sách hợp đồng bảo hiểm</h2>
        <button onClick={fetchPolicies} className="refresh-button">
          🔄 Làm mới
        </button>
      </div>

      {policies.length === 0 ? (
        <div className="no-policies">
          <p>Bạn chưa có hợp đồng bảo hiểm nào</p>
        </div>
      ) : (
        <div className="policies-grid">
          {policies.map((policy) => (
            <div key={policy.id} className="policy-card">
              <div className="policy-header-card">
                <h3>Hợp đồng #{policy.policy_id}</h3>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(policy.status) }}
                >
                  {getStatusText(policy.status)}
                </span>
              </div>

              <div className="policy-details">
                <div className="detail-row">
                  <span className="label">ID Lô hàng:</span>
                  <span className="value">{policy.shipment_id}</span>
                </div>

                <div className="detail-row">
                  <span className="label">Số tiền bảo hiểm:</span>
                  <span className="value">{formatAmount(policy.coverage_amount)} ETH</span>
                </div>

                <div className="detail-row">
                  <span className="label">Phí bảo hiểm:</span>
                  <span className="value">{formatAmount(policy.premium)} ETH</span>
                </div>

                <div className="detail-row">
                  <span className="label">Trạng thái vận chuyển:</span>
                  <span className="value">{getShipmentStatusText(policy.shipment_status)}</span>
                </div>

                <div className="detail-row">
                  <span className="label">Ngày bắt đầu:</span>
                  <span className="value">{formatDate(policy.start_time)}</span>
                </div>

                <div className="detail-row">
                  <span className="label">Ngày kết thúc:</span>
                  <span className="value">{formatDate(policy.end_time)}</span>
                </div>

                {policy.claim_processed && (
                  <div className="claim-info">
                    <span className="claim-badge">✅ Đã xử lý bồi thường</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PolicyList;
