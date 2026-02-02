import React, { useState, useEffect } from 'react';
import { Plus, Shield, Eye, Edit, Trash2, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import baseApi from '../../constants/apiUrl';

const InsuranceList = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPolicyType, setFilterPolicyType] = useState('all');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${baseApi}/getMyInsurancePlans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success && data.data) {
        setPlans(Array.isArray(data.data) ? data.data : []);
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
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${baseApi}/deleteInsurancePlan/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading insurance plans...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Insurance Plans</h1>
            <p className="text-gray-600 mt-1">Manage your insurance offerings</p>
          </div>
          <button
            onClick={() => navigate('/insurance/create')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create Plan
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search plans..."
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
              <option value="Active">Active</option>
              <option value="Limited">Limited</option>
              <option value="Closed">Closed</option>
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

        {filteredPlans.length === 0 ? (
          <div className="glass-red rounded-xl shadow-lg p-8 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {plans.length === 0 ? 'No Insurance Plans' : 'No Plans Match Filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {plans.length === 0 
                ? 'Create your first insurance plan to get started'
                : 'Try adjusting your search or filters'}
            </p>
            {plans.length === 0 && (
              <button
                onClick={() => navigate('/insurance/create')}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg"
              >
                Create First Plan
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <div key={plan._id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{plan.planName || 'Unnamed Plan'}</h3>
                    <p className="text-sm text-gray-500">ID: {plan.planId || plan._id}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(plan.planStatus)}`}>
                    {plan.planStatus || 'Active'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Policy Type:</span>
                    <span className="ml-2">{plan.policyType || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Status:</span>
                    <span className="ml-2">{plan.planStatus || 'Active'}</span>
                  </div>
                  {plan.viewCount !== undefined && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Views:</span>
                      <span className="ml-2">{plan.viewCount || 0}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => navigate(`/insurance/view/${plan._id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/insurance/edit/${plan._id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default InsuranceList;
