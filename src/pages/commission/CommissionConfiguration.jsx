import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';
import ApiBaseUrl from '../../constants/apiUrl';
import { getUserData } from '../../utils/auth';

const CommissionConfiguration = () => {
  const navigate = useNavigate();
  const userData = getUserData();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasExistingRules, setHasExistingRules] = useState(false);
  
  // Determine partner type from company details
  const partnerType = userData?.companyDetails?.PartnerType || 'Property';
  
  const [commissionData, setCommissionData] = useState({
    partnerType: partnerType,
    notes: '',
    propertyCommission: {
      saleCommission: {
        enabled: false,
        commissionBasis: 'Sale Price',
        commissionType: 'Percentage',
        commissionValue: 0,
        earnedAt: 'Agreement Signed',
        payableAt: 'Deal Closed',
        eligibleAgents: 'Verified Agents Only',
      },
      rentCommission: {
        enabled: false,
        commissionBasis: 'Rent Amount',
        commissionType: 'Percentage',
        commissionValue: 0,
        earnedAt: 'Agreement Signed',
        payableAt: 'Deal Closed',
        eligibleAgents: 'Verified Agents Only',
      },
      installmentCommission: {
        enabled: false,
        commissionBasis: 'First Installment Amount',
        commissionType: 'Percentage',
        commissionValue: 0,
        earnedAt: 'Agreement Signed',
        payableAt: 'Deal Closed',
        eligibleAgents: 'Verified Agents Only',
      },
    },
    installmentProductCommission: {
      installmentSaleCommission: {
        enabled: false,
        commissionBasis: 'Product Cash Price',
        commissionType: 'Percentage',
        commissionValue: 0,
        earnedAt: 'Product Delivered',
        payableAt: 'Deal Closed',
        eligibleAgents: 'Verified Agents Only',
      },
      cashSaleCommission: {
        enabled: false,
        commissionBasis: 'Product Cash Price',
        commissionType: 'Percentage',
        commissionValue: 0,
        earnedAt: 'Product Delivered',
        payableAt: 'Deal Closed',
        eligibleAgents: 'Verified Agents Only',
      },
    },
    loanCommission: {
      homeLoanCommission: {
        enabled: false,
        commissionBasis: 'Disbursed Loan Amount',
        commissionType: 'Percentage',
        commissionValue: 0,
        earnedAt: 'Loan Disbursed',
        payableAt: 'Deal Closed',
        eligibleAgents: 'Verified Agents Only',
      },
      personalLoanCommission: {
        enabled: false,
        commissionBasis: 'Disbursed Loan Amount',
        commissionType: 'Percentage',
        commissionValue: 0,
        earnedAt: 'Loan Disbursed',
        payableAt: 'Deal Closed',
        eligibleAgents: 'Verified Agents Only',
      },
      businessLoanCommission: {
        enabled: false,
        commissionBasis: 'Disbursed Loan Amount',
        commissionType: 'Percentage',
        commissionValue: 0,
        earnedAt: 'Loan Disbursed',
        payableAt: 'Deal Closed',
        eligibleAgents: 'Verified Agents Only',
      },
      autoLoanCommission: {
        enabled: false,
        commissionBasis: 'Disbursed Loan Amount',
        commissionType: 'Percentage',
        commissionValue: 0,
        earnedAt: 'Loan Disbursed',
        payableAt: 'Deal Closed',
        eligibleAgents: 'Verified Agents Only',
      },
    },
    insuranceCommission: {
      policyIssuanceCommission: {
        enabled: false,
        commissionBasis: 'Yearly Premium Amount',
        commissionType: 'Percentage',
        commissionValue: 0,
        earnedAt: 'Policy Issued',
        payableAt: 'Deal Closed',
        eligibleAgents: 'Verified Agents Only',
      },
      claimSettlementCommission: {
        enabled: false,
        commissionBasis: 'Claim Settlement Amount',
        commissionType: 'Percentage',
        commissionValue: 0,
        earnedAt: 'Claim Approved / Settled',
        payableAt: 'Claim Settled',
        eligibleAgents: 'Verified Agents Only',
      },
      policyRenewalCommission: {
        enabled: false,
        commissionBasis: 'Renewal Premium Amount',
        commissionType: 'Percentage',
        commissionValue: 0,
        earnedAt: 'Renewal Completed',
        payableAt: 'Deal Closed',
        eligibleAgents: 'Verified Agents Only',
      },
    },
  });

  useEffect(() => {
    fetchCommissionRules();
  }, []);

  const fetchCommissionRules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${ApiBaseUrl}/getCommissionRules`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && response.data.data) {
        setCommissionData(response.data.data);
        setHasExistingRules(true);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // No commission rules yet, use defaults
        setHasExistingRules(false);
      } else {
        console.error('Error fetching commission rules:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCommissionChange = (category, type, field, value) => {
    setCommissionData({
      ...commissionData,
      [category]: {
        ...commissionData[category],
        [type]: {
          ...commissionData[category][type],
          [field]: value,
        },
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const endpoint = hasExistingRules ? '/updateCommissionRules' : '/createCommissionRules';
      const method = hasExistingRules ? 'put' : 'post';
      
      const response = await axios[method](`${ApiBaseUrl}${endpoint}`, commissionData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        alert(`Commission rules ${hasExistingRules ? 'updated' : 'created'} successfully!`);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error saving commission rules:', error);
      alert('Failed to save commission rules. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderCommissionField = (category, type, config, label) => {
    return (
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-800">{label}</h4>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) =>
                handleCommissionChange(category, type, 'enabled', e.target.checked)
              }
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Enable</span>
          </label>
        </div>

        {config.enabled && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission Type
                </label>
                <select
                  value={config.commissionType}
                  onChange={(e) =>
                    handleCommissionChange(category, type, 'commissionType', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Percentage">Percentage (%)</option>
                  <option value="Fixed Amount">Fixed Amount (PKR)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission Value *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.commissionValue}
                  onChange={(e) =>
                    handleCommissionChange(
                      category,
                      type,
                      'commissionValue',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Basis
              </label>
              <select
                value={config.commissionBasis}
                onChange={(e) =>
                  handleCommissionChange(category, type, 'commissionBasis', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {category === 'propertyCommission' && type === 'saleCommission' && (
                  <option value="Sale Price">Sale Price</option>
                )}
                {category === 'propertyCommission' && type === 'rentCommission' && (
                  <>
                    <option value="Rent Amount">Rent Amount</option>
                    <option value="Advance / Security Deposit">Advance / Security Deposit</option>
                  </>
                )}
                {category === 'propertyCommission' && type === 'installmentCommission' && (
                  <>
                    <option value="First Installment Amount">First Installment Amount</option>
                    <option value="Booking Amount">Booking Amount</option>
                    <option value="Sale Price">Sale Price</option>
                  </>
                )}
                {category === 'installmentProductCommission' && (
                  <>
                    <option value="Product Cash Price">Product Cash Price</option>
                    <option value="Total Installment Price">Total Installment Price</option>
                    <option value="First Installment Amount">First Installment Amount</option>
                    <option value="Down Payment / Advance Amount">Down Payment / Advance Amount</option>
                  </>
                )}
                {category === 'loanCommission' && (
                  <>
                    <option value="Approved Loan Amount">Approved Loan Amount</option>
                    <option value="Disbursed Loan Amount">Disbursed Loan Amount</option>
                    <option value="First Tranche / Partial Disbursement Amount">
                      First Tranche / Partial Disbursement Amount
                    </option>
                  </>
                )}
                {category === 'insuranceCommission' && type === 'policyIssuanceCommission' && (
                  <>
                    <option value="Yearly Premium Amount">Yearly Premium Amount</option>
                    <option value="First Premium / Initial Payment">
                      First Premium / Initial Payment
                    </option>
                  </>
                )}
                {category === 'insuranceCommission' && type === 'claimSettlementCommission' && (
                  <option value="Claim Settlement Amount">Claim Settlement Amount</option>
                )}
                {category === 'insuranceCommission' && type === 'policyRenewalCommission' && (
                  <option value="Renewal Premium Amount">Renewal Premium Amount</option>
                )}
              </select>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Commission Earned At:</strong> {config.earnedAt}<br />
                <strong>Commission Payable At:</strong> {config.payableAt}<br />
                <strong>Eligible Agents:</strong> {config.eligibleAgents}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loader />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Commission Configuration</h1>
            <p className="mt-2 text-sm text-gray-600">
              Configure commission rules for agents working on your products. Define separate rules
              for each transaction type.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Commission */}
            {partnerType === 'Property' && (
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  🏢 Property Commission Rules
                </h2>
                <div className="space-y-6">
                  {renderCommissionField(
                    'propertyCommission',
                    'saleCommission',
                    commissionData.propertyCommission.saleCommission,
                    'Property Sale Commission'
                  )}
                  {renderCommissionField(
                    'propertyCommission',
                    'rentCommission',
                    commissionData.propertyCommission.rentCommission,
                    'Property Rent Commission'
                  )}
                  {renderCommissionField(
                    'propertyCommission',
                    'installmentCommission',
                    commissionData.propertyCommission.installmentCommission,
                    'Installment Property Commission'
                  )}
                </div>
              </div>
            )}

            {/* Installment Product Commission */}
            {partnerType === 'Installment' && (
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  🛒 Installment Product Commission Rules
                </h2>
                <div className="space-y-6">
                  {renderCommissionField(
                    'installmentProductCommission',
                    'installmentSaleCommission',
                    commissionData.installmentProductCommission.installmentSaleCommission,
                    'Product on Installment Sale'
                  )}
                  {renderCommissionField(
                    'installmentProductCommission',
                    'cashSaleCommission',
                    commissionData.installmentProductCommission.cashSaleCommission,
                    'Product on Cash Sale'
                  )}
                </div>
              </div>
            )}

            {/* Loan Commission */}
            {partnerType === 'Loan' && (
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  💰 Loan Partner Commission Rules
                </h2>
                <div className="space-y-6">
                  {renderCommissionField(
                    'loanCommission',
                    'homeLoanCommission',
                    commissionData.loanCommission.homeLoanCommission,
                    'Home Loan Commission'
                  )}
                  {renderCommissionField(
                    'loanCommission',
                    'personalLoanCommission',
                    commissionData.loanCommission.personalLoanCommission,
                    'Personal Loan Commission'
                  )}
                  {renderCommissionField(
                    'loanCommission',
                    'businessLoanCommission',
                    commissionData.loanCommission.businessLoanCommission,
                    'Business Loan Commission'
                  )}
                  {renderCommissionField(
                    'loanCommission',
                    'autoLoanCommission',
                    commissionData.loanCommission.autoLoanCommission,
                    'Auto / Vehicle Loan Commission'
                  )}
                </div>
              </div>
            )}

            {/* Insurance Commission */}
            {partnerType === 'Insurance' && (
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  🛡 Insurance Partner Commission Rules
                </h2>
                <div className="space-y-6">
                  {renderCommissionField(
                    'insuranceCommission',
                    'policyIssuanceCommission',
                    commissionData.insuranceCommission.policyIssuanceCommission,
                    'Policy Issuance Commission'
                  )}
                  {renderCommissionField(
                    'insuranceCommission',
                    'claimSettlementCommission',
                    commissionData.insuranceCommission.claimSettlementCommission,
                    'Claim Settlement Commission'
                  )}
                  {renderCommissionField(
                    'insuranceCommission',
                    'policyRenewalCommission',
                    commissionData.insuranceCommission.policyRenewalCommission,
                    'Policy Renewal Commission'
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={commissionData.notes}
                onChange={(e) => setCommissionData({ ...commissionData, notes: e.target.value })}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional information or special instructions..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : hasExistingRules ? 'Update Rules' : 'Create Rules'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CommissionConfiguration;
