import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  CreditCard,
  Home,
  Shield,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import baseApi from '../../constants/apiUrl';

const InstallmentRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch(`${baseApi}/getAllRequestInstallments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setRequests(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch requests');
      }
    } catch (err) {
      console.error('Fetch requests error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      navigate('/');
      return;
    }

    fetchRequests();
  }, [navigate, fetchRequests]);

  const fetchApplicationDetails = async (applicationId) => {
    setDetailLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${baseApi}/getApplication/${applicationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectedRequest(data.data);
      } else {
        setError(data.message || 'Failed to fetch application details');
      }
    } catch (err) {
      console.error('Fetch application details error:', err);
      setError('Failed to load application details');
    } finally {
      setDetailLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this application?`)) {
      return;
    }

    setStatusLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      const response = await fetch(`${baseApi}/updateApplicationStatus`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
          approvedBy: userData.userId || userData.email
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(`Application ${newStatus} successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Update local state
        setRequests(prev => prev.map(req => 
          req.applicationId === applicationId ? { ...req, status: newStatus } : req
        ));
        
        if (selectedRequest && selectedRequest.applicationId === applicationId) {
          setSelectedRequest({ ...selectedRequest, status: newStatus });
        }
      } else {
        setError(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Update status error:', err);
      setError('Failed to update application status');
    } finally {
      setStatusLoading(false);
    }
  };

  const cancelApplication = async (applicationId, userId) => {
    if (!window.confirm('Are you sure you want to cancel this application?')) {
      return;
    }

    setStatusLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      
      const response = await fetch(`${baseApi}/cancelApplication`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ applicationId, userId })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage('Application cancelled successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Update local state
        setRequests(prev => prev.map(req => 
          req.applicationId === applicationId ? { ...req, status: 'cancelled' } : req
        ));
        
        if (selectedRequest && selectedRequest.applicationId === applicationId) {
          setSelectedRequest({ ...selectedRequest, status: 'cancelled' });
        }
      } else {
        setError(data.message || 'Failed to cancel application');
      }
    } catch (err) {
      console.error('Cancel application error:', err);
      setError('Failed to cancel application');
    } finally {
      setStatusLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading installment requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Installment Requests</h1>
          <p className="text-gray-600 mt-1">Manage all installment applications</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="glass-red rounded-xl shadow-lg p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Requests Yet</h3>
            <p className="text-gray-600">Installment applications will appear here</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="glass-red rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                    <p className="text-3xl font-bold text-gray-800">{requests.length}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="glass-red rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {requests.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="glass-red rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Approved</p>
                    <p className="text-3xl font-bold text-green-600">
                      {requests.filter(r => r.status === 'approved').length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="glass-red rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rejected</p>
                    <p className="text-3xl font-bold text-red-600">
                      {requests.filter(r => r.status === 'rejected').length}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
              {requests.map((request) => {
                const userInfo = request.UserInfo?.[0] || {};
                const planInfo = request.PlanInfo?.[0] || {};

                return (
                  <div
                    key={request._id}
                    className="glass-red rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left Section - User Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-800">
                                {userInfo.name || 'N/A'}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Application ID: {request.applicationId || request._id.slice(-8)}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {userInfo.email && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span>{userInfo.email}</span>
                            </div>
                          )}
                          {userInfo.phone && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{userInfo.phone}</span>
                            </div>
                          )}
                          {userInfo.city && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{userInfo.city}, {userInfo.state}</span>
                            </div>
                          )}
                          {userInfo.occupation && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Briefcase className="w-4 h-4 text-gray-400" />
                              <span>{userInfo.occupation}</span>
                            </div>
                          )}
                        </div>

                        {/* Plan Info */}
                        {(planInfo.planPrice || planInfo.monthlyInstallment) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-4 text-sm">
                              {planInfo.planPrice && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">Plan Price:</span>
                                  <span className="font-semibold text-gray-800">
                                    ₨ {planInfo.planPrice.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {planInfo.monthlyInstallment && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">Monthly:</span>
                                  <span className="font-semibold text-gray-800">
                                    ₨ {planInfo.monthlyInstallment.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {planInfo.tenureMonths && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">Tenure:</span>
                                  <span className="font-semibold text-gray-800">
                                    {planInfo.tenureMonths} months
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {request.applicationNote && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Application Note:</p>
                            <p className="text-sm text-gray-700">{request.applicationNote}</p>
                          </div>
                        )}
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex flex-col gap-2 lg:items-end">
                        <p className="text-xs text-gray-500">
                          Applied: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => fetchApplicationDetails(request.applicationId)}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Detail Modal */}
        {selectedRequest && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedRequest(null)}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {detailLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading application details...</p>
                </div>
              ) : (
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Application Details</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        ID: {selectedRequest.applicationId || selectedRequest._id}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Status */}
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Current Status</p>
                      {getStatusBadge(selectedRequest.status)}
                    </div>

                    {/* User Information */}
                    {selectedRequest.UserInfo && selectedRequest.UserInfo[0] && (
                      <div className="border border-gray-200 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-800">Applicant Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Name" value={selectedRequest.UserInfo[0].name} icon={User} />
                          <InfoItem label="Email" value={selectedRequest.UserInfo[0].email} icon={Mail} />
                          <InfoItem label="Phone" value={selectedRequest.UserInfo[0].phone} icon={Phone} />
                          <InfoItem label="CNIC" value={selectedRequest.UserInfo[0].cnic} icon={CreditCard} />
                          <InfoItem label="City" value={selectedRequest.UserInfo[0].city} icon={MapPin} />
                          <InfoItem label="State" value={selectedRequest.UserInfo[0].state} icon={MapPin} />
                          <InfoItem label="Address" value={selectedRequest.UserInfo[0].address} icon={Home} />
                          <InfoItem label="Occupation" value={selectedRequest.UserInfo[0].occupation} icon={Briefcase} />
                          <InfoItem label="Monthly Income" value={selectedRequest.UserInfo[0].monthlyIncome ? `₨ ${Number(selectedRequest.UserInfo[0].monthlyIncome).toLocaleString()}` : 'N/A'} icon={DollarSign} />
                        </div>
                      </div>
                    )}

                    {/* Plan Information */}
                    {selectedRequest.PlanInfo && selectedRequest.PlanInfo[0] && (
                      <div className="border border-gray-200 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <FileText className="w-5 h-5 text-green-600" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-800">Plan Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Plan Name" value={selectedRequest.PlanInfo[0].planName} />
                          <InfoItem label="Plan Price" value={`₨ ${Number(selectedRequest.PlanInfo[0].planPrice || 0).toLocaleString()}`} icon={DollarSign} />
                          <InfoItem label="Monthly Installment" value={`₨ ${Number(selectedRequest.PlanInfo[0].monthlyInstallment || 0).toLocaleString()}`} icon={DollarSign} />
                          <InfoItem label="Tenure" value={`${selectedRequest.PlanInfo[0].tenureMonths || 0} months`} icon={Calendar} />
                          <InfoItem label="Down Payment" value={`₨ ${Number(selectedRequest.PlanInfo[0].downPayment || 0).toLocaleString()}`} icon={DollarSign} />
                          <InfoItem label="Interest Rate" value={`${selectedRequest.PlanInfo[0].interestRatePercent || 0}%`} />
                        </div>
                      </div>
                    )}

                    {/* Financial Information */}
                    {selectedRequest.financialInfo && (
                      <div className="border border-gray-200 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <DollarSign className="w-5 h-5 text-yellow-600" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-800">Financial Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Employment Type" value={selectedRequest.financialInfo.employmentType} />
                          <InfoItem label="Employer Name" value={selectedRequest.financialInfo.employerName} />
                          <InfoItem label="Bank Name" value={selectedRequest.financialInfo.bankName} />
                          <InfoItem label="Account Number" value={selectedRequest.financialInfo.accountNumber} />
                        </div>
                      </div>
                    )}

                    {/* Guarantor Information */}
                    {selectedRequest.guarantorInfo && (
                      <div className="border border-gray-200 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Shield className="w-5 h-5 text-purple-600" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-800">Guarantor Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoItem label="Name" value={selectedRequest.guarantorInfo.name} icon={User} />
                          <InfoItem label="Relation" value={selectedRequest.guarantorInfo.relation} />
                          <InfoItem label="Phone" value={selectedRequest.guarantorInfo.phone} icon={Phone} />
                          <InfoItem label="CNIC" value={selectedRequest.guarantorInfo.cnic} icon={CreditCard} />
                        </div>
                      </div>
                    )}

                    {/* Application Note */}
                    {selectedRequest.applicationNote && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Application Note</p>
                        <p className="text-gray-800">{selectedRequest.applicationNote}</p>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Applied on:</span>{' '}
                        {new Date(selectedRequest.createdAt).toLocaleString()}
                      </div>
                      {selectedRequest.updatedAt && (
                        <div>
                          <span className="font-medium">Last updated:</span>{' '}
                          {new Date(selectedRequest.updatedAt).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="border-t pt-6">
                      <h4 className="text-sm font-semibold text-gray-600 mb-3">Update Status</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedRequest.status !== 'approved' && (
                          <button
                            onClick={() => updateApplicationStatus(selectedRequest.applicationId, 'approved')}
                            disabled={statusLoading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Approve
                          </button>
                        )}
                        {selectedRequest.status !== 'rejected' && (
                          <button
                            onClick={() => updateApplicationStatus(selectedRequest.applicationId, 'rejected')}
                            disabled={statusLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        )}
                        {selectedRequest.status === 'approved' && selectedRequest.status !== 'in_progress' && (
                          <button
                            onClick={() => updateApplicationStatus(selectedRequest.applicationId, 'in_progress')}
                            disabled={statusLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            In Progress
                          </button>
                        )}
                        {selectedRequest.status === 'in_progress' && selectedRequest.status !== 'completed' && (
                          <button
                            onClick={() => updateApplicationStatus(selectedRequest.applicationId, 'completed')}
                            disabled={statusLoading}
                            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Complete
                          </button>
                        )}
                        {selectedRequest.status === 'pending' && (
                          <button
                            onClick={() => cancelApplication(selectedRequest.applicationId, selectedRequest.userId)}
                            disabled={statusLoading}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="mt-6 w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Info Item Component
const InfoItem = ({ label, value, icon: Icon }) => {
  if (!value || value === 'N/A' || value === 'null' || value === 'undefined') return null;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
      <p className="text-sm text-gray-800 font-semibold">{value}</p>
    </div>
  );
};

export default InstallmentRequests;
