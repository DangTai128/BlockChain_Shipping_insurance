import React, { useState } from 'react';
import { useMetaMask } from '../hooks/useMetaMask';
import { metaMaskService } from '../services/metaMaskService';
import { policyAPI } from '../services/api';
import './CreatePolicyForm.css';

const CreatePolicyForm = ({ onPolicyCreated }) => {
  const { account, isConnected } = useMetaMask();
  const [formData, setFormData] = useState({
    shipmentId: '',
    coverageAmount: '',
    duration: '7'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected || !account) {
      setError('Vui lòng kết nối MetaMask trước');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form data
      if (!formData.shipmentId.trim()) {
        throw new Error('Vui lòng nhập ID lô hàng');
      }

      if (!formData.coverageAmount || parseFloat(formData.coverageAmount) <= 0) {
        throw new Error('Số tiền bảo hiểm phải lớn hơn 0');
      }

      const duration = parseInt(formData.duration);
      if (duration <= 0) {
        throw new Error('Thời gian bảo hiểm phải lớn hơn 0');
      }

      // Create policy on blockchain
      const tx = await metaMaskService.createPolicy(
        formData.shipmentId,
        formData.coverageAmount,
        duration * 24 * 60 * 60 // Convert days to seconds
      );

      // Save to database
      await policyAPI.create({
        shipment_id: formData.shipmentId,
        coverage_amount: parseFloat(formData.coverageAmount),
        duration: duration * 24 * 60 * 60,
        userAddress: account
      });

      setSuccess(`Hợp đồng bảo hiểm đã được tạo thành công! TX: ${tx.transactionHash}`);
      
      // Reset form
      setFormData({
        shipmentId: '',
        coverageAmount: '',
        duration: '7'
      });

      if (onPolicyCreated) {
        onPolicyCreated();
      }

    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tạo hợp đồng bảo hiểm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatePremium = () => {
    const coverage = parseFloat(formData.coverageAmount);
    if (isNaN(coverage) || coverage <= 0) return '0';
    return (coverage * 0.02).toFixed(4); // 2% premium
  };

  return (
    <div className="create-policy-form">
      <h2>Tạo hợp đồng bảo hiểm mới</h2>
      
      <form onSubmit={handleSubmit} className="policy-form">
        <div className="form-group">
          <label htmlFor="shipmentId">ID Lô hàng *</label>
          <input
            type="text"
            id="shipmentId"
            name="shipmentId"
            value={formData.shipmentId}
            onChange={handleInputChange}
            placeholder="Nhập ID lô hàng (ví dụ: SHIP001)"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="coverageAmount">Số tiền bảo hiểm (ETH) *</label>
          <input
            type="number"
            id="coverageAmount"
            name="coverageAmount"
            value={formData.coverageAmount}
            onChange={handleInputChange}
            placeholder="Nhập số tiền bảo hiểm"
            step="0.001"
            min="0.001"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="duration">Thời gian bảo hiểm (ngày) *</label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            placeholder="Nhập số ngày bảo hiểm"
            min="1"
            max="365"
            required
            disabled={isSubmitting}
          />
        </div>

        {formData.coverageAmount && (
          <div className="premium-info">
            <div className="premium-item">
              <span>Số tiền bảo hiểm:</span>
              <span>{parseFloat(formData.coverageAmount).toFixed(4)} ETH</span>
            </div>
            <div className="premium-item">
              <span>Phí bảo hiểm (2%):</span>
              <span>{calculatePremium()} ETH</span>
            </div>
            <div className="premium-item total">
              <span>Tổng cộng:</span>
              <span>{(parseFloat(formData.coverageAmount) + parseFloat(calculatePremium())).toFixed(4)} ETH</span>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="submit-button"
          disabled={!isConnected || isSubmitting}
        >
          {isSubmitting ? 'Đang tạo hợp đồng...' : 'Tạo hợp đồng bảo hiểm'}
        </button>

        {!isConnected && (
          <p className="connection-warning">
            ⚠️ Vui lòng kết nối MetaMask để tạo hợp đồng bảo hiểm
          </p>
        )}
      </form>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          ✅ {success}
        </div>
      )}
    </div>
  );
};

export default CreatePolicyForm;
