import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Shield,
  Eye,
  XCircle,
  Clock,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import baseApi from '../../constants/apiUrl';
import { getAuthHeaders, isAuthenticated, clearUserSession, getUserData } from '../../utils/auth';

const InsuranceApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPolicyType, setFilterPolicyType] = useState('all');

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check authentication
      if (!isAuthenticated()) {
        clearUserSession();
        navigate('/');
        return;
      }
      
      const headers = getAuthHeaders();
      const userData = getUserData();
      const currentUserId = userData?.userId;

      // Get current user to filter by insuranceCompanyId and createdBy
      const userResponse = await fetch(`${baseApi}/getUserById`, {
        headers: headers,
      });
      const userResponseData = await userResponse.json();
      const userId = userResponseData?.data?.userId || currentUserId;

      // Fetch all applications
      const response = await fetch(`${baseApi}/getAllInsuranceApplications`, {
        headers: headers,
      });

      const data = await response.json();
      if (data.success && data.data) {
        // First, get all plans created by this partner to filter efficiently
        const plansResponse = await fetch(`${baseApi}/getMyInsurancePlans`, {
          headers: headers,
        });
        const plansData = await plansResponse.json();
        const partnerPlanIds = plansData.success && plansData.data 
          ? plansData.data.map(plan => plan._id.toString())
          : [];

        // Filter applications for plans created by this partner
        // A partner should see applications for plans where:
        // 1. insuranceCompanyId matches (plan belongs to partner's company), OR
        // 2. planId is in the list of plans created by this partner
        const filtered = data.data.filter(app => {
          // Check if application's insuranceCompanyId matches
          if (app.insuranceCompanyId === userId) {
            return true;
          }
          
          // Check if the plan was created by this partner
          if (app.planId && partnerPlanIds.includes(app.planId.toString())) {
            return true;
          }
          
          return false;
        });
        
        setApplications(filtered);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const getStatusBadge = (status) => {
    const badges = {
      new: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'New' },
      under_review: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Under Review' },
      docs_required: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Docs Required' },
      submitted: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Submitted' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };
    const badge = badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.applicationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.planName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesPolicyType = filterPolicyType === 'all' || app.policyType === filterPolicyType;
    return matchesSearch && matchesStatus && matchesPolicyType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Insurance Applications</h1>
          <p className="text-gray-600 mt-1">View applications for your insurance plans</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="under_review">Under Review</option>
              <option value="docs_required">Docs Required</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filterPolicyType}
              onChange={(e) => setFilterPolicyType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Policy Types</option>
              <option value="Life">Life</option>
              <option value="Health">Health</option>
              <option value="Motor">Motor</option>
              <option value="Travel">Travel</option>
              <option value="Property">Property</option>
              <option value="Takaful">Takaful</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Applications Found</h3>
            <p className="text-gray-600">
              {applications.length === 0 
                ? 'You have no insurance applications yet'
                : 'No applications match your filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredApplications.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            {app.applicantInfo?.fullName || 'N/A'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Application ID: {app.applicationId}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Shield className="w-4 h-4" />
                        <span><strong>Plan:</strong> {app.planName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span><strong>Policy Type:</strong> {app.policyType || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{app.applicantInfo?.mobileNumber || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{app.applicantInfo?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{app.applicantInfo?.city || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedApplication(app)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Application Details</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Applicant Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Applicant Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium">{selectedApplication.applicantInfo?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">CNIC</p>
                      <p className="font-medium">{selectedApplication.applicantInfo?.cnic}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Mobile Number</p>
                      <p className="font-medium">{selectedApplication.applicantInfo?.mobileNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedApplication.applicantInfo?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{selectedApplication.applicantInfo?.residentialAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">City</p>
                      <p className="font-medium">{selectedApplication.applicantInfo?.city}</p>
                    </div>
                  </div>
                </div>

                {/* Plan Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Plan Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Plan Name</p>
                      <p className="font-medium">{selectedApplication.planName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Policy Type</p>
                      <p className="font-medium">{selectedApplication.policyType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Company</p>
                      <p className="font-medium">{selectedApplication.registeredCompanyName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      {getStatusBadge(selectedApplication.status)}
                    </div>
                  </div>
                </div>

                {/* Policy-Specific Details */}
                {selectedApplication.policySpecificDetails && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Policy-Specific Details</h3>
                    <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                      {JSON.stringify(selectedApplication.policySpecificDetails, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Documents */}
                {selectedApplication.documents && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Documents</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedApplication.documents).map(([key, value]) => (
                        value && (
                          <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <a
                              href={value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View Document
                            </a>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InsuranceApplications;
