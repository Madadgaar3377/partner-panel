import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Shield, Eye, Edit, Trash2, Search, Filter, Users, TrendingUp, User, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { PageLoader } from '../../components/Loader';
import baseApi from '../../constants/apiUrl';
import { getAuthHeaders, isAuthenticated, clearUserSession } from '../../utils/auth';

const InsuranceList = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPolicyType, setFilterPolicyType] = useState('all');
  const [applicationsCount, setApplicationsCount] = useState({});
  const [creatorInfo, setCreatorInfo] = useState({});

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check authentication
      if (!isAuthenticated()) {
        clearUserSession();
        navigate('/');
        return;
      }
      
      const headers = getAuthHeaders();
      
      // Fetch plans
      const response = await fetch(`${baseApi}/getMyInsurancePlans`, {
        headers: headers,
      });

      const data = await response.json();
      if (data.success && data.data) {
        const plansList = Array.isArray(data.data) ? data.data : [];
        setPlans(plansList);

        // Fetch applications count for each plan
        const applicationsResponse = await fetch(`${baseApi}/getAllInsuranceApplications`, {
          headers: headers,
        });
        
        const applicationsData = await applicationsResponse.json();
        if (applicationsData.success && applicationsData.data) {
          const counts = {};
          const creatorMap = {};
          
          plansList.forEach(plan => {
            const planId = plan._id.toString();
            // Count applications for this plan
            const count = applicationsData.data.filter(app => 
              app.planId && app.planId.toString() === planId
            ).length;
            counts[planId] = count;
            
            // Store creator info
            if (plan.createdBy) {
              creatorMap[planId] = {
                createdBy: plan.createdBy,
                insuranceCompanyId: plan.insuranceCompanyId,
              };
            }
          });
          
          setApplicationsCount(counts);
          setCreatorInfo(creatorMap);
        }
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error('Error fetching insurance plans:', err);
      setError('Failed to load insurance plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    try {
      // Check authentication
      if (!isAuthenticated()) {
        clearUserSession();
        navigate('/');
        return;
      }
      
      const headers = getAuthHeaders();
      const response = await fetch(`${baseApi}/deleteInsurancePlan/${planId}`, {
        method: 'DELETE',
        headers: headers,
      });

      const data = await response.json();
      if (data.success) {
        alert('Plan deleted successfully');
        fetchPlans();
      } else {
        alert(data.message || 'Failed to delete plan');
      }
    } catch (err) {
      console.error('Error deleting plan:', err);
      alert('Failed to delete plan');
    }
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = !searchTerm || 
      plan.planName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.planId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.policyType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || plan.planStatus === filterStatus;
    const matchesPolicyType = filterPolicyType === 'all' || plan.policyType === filterPolicyType;

    return matchesSearch && matchesStatus && matchesPolicyType;
  });

  const getStatusBadge = (status) => {
    const badges = {
      Active: 'bg-green-100 text-green-800',
      Limited: 'bg-yellow-100 text-yellow-800',
      Closed: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    total: plans.length,
    active: plans.filter(p => p.planStatus === 'Active').length,
    totalApplications: Object.values(applicationsCount).reduce((sum, count) => sum + count, 0),
    approved: plans.filter(p => p.approvalStatus === 'approved').length,
  };

  if (loading) {
    return <PageLoader text="Loading insurance plans..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-red-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Insurance Management</h1>
              <p className="text-gray-600">Manage your insurance plans and applications</p>
            </div>
            <button
              onClick={() => navigate('/insurance/create')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-orange-800 transform hover:scale-105 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Insurance Plan
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">Total Plans</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Shield className="w-12 h-12 text-orange-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Active Plans</p>
                <p className="text-3xl font-bold">{stats.active}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Applications</p>
                <p className="text-3xl font-bold">{stats.totalApplications}</p>
              </div>
              <Users className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Approved Plans</p>
                <p className="text-3xl font-bold">{stats.approved}</p>
              </div>
              <FileText className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by plan name, ID, or policy type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Limited">Limited</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterPolicyType}
                onChange={(e) => setFilterPolicyType(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
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
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Plans Grid */}
        {filteredPlans.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {plans.length === 0 ? 'No Insurance Plans Found' : 'No Plans Match Filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {plans.length === 0 
                ? 'Create your first insurance plan to get started'
                : 'Try adjusting your search or filters'}
            </p>
            {plans.length === 0 && (
              <button
                onClick={() => navigate('/insurance/create')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Insurance Plan
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => {
              const planId = plan._id.toString();
              const appCount = applicationsCount[planId] || 0;
              const creator = creatorInfo[planId];
              
              return (
                <div
                  key={plan._id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                    {plan.planImage && (
                      <div className="mb-4">
                        <img src={plan.planImage} alt={plan.planName} className="w-full h-32 object-cover rounded-lg" />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                        {plan.planId || plan._id}
                      </span>
                      <Shield className="w-8 h-8 text-white/80" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">
                      {plan.planName || 'Insurance Plan'}
                    </h3>
                    <p className="text-orange-100 text-sm">
                      {plan.policyType || 'Policy Type'}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Policy Type</p>
                          <p className="text-sm font-semibold text-gray-900">{plan.policyType || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(plan.planStatus)}`}>
                            {plan.planStatus || 'Active'}
                          </span>
                        </div>
                      </div>

                      {creator && (
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Created By</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {creator.createdBy === creator.insuranceCompanyId ? 'You (Partner)' : 'Admin/Agent'}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Applications</p>
                          <p className="text-sm font-semibold text-gray-900">{appCount} {appCount === 1 ? 'application' : 'applications'}</p>
                        </div>
                      </div>

                      {plan.viewCount !== undefined && (
                        <div className="flex items-start gap-2">
                          <Eye className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Views</p>
                            <p className="text-sm font-semibold text-gray-900">{plan.viewCount || 0}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                      <button
                        onClick={() => navigate(`/insurance/view/${plan._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/insurance/edit/${plan._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => navigate('/insurance/applications')}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                        title={`View ${appCount} applications`}
                      >
                        <Users className="w-4 h-4" />
                        {appCount > 0 && <span className="text-xs">{appCount}</span>}
                      </button>
                      <button
                        onClick={() => handleDelete(plan._id)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default InsuranceList;
