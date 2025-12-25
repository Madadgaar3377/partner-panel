import React, { useState, useEffect, useCallback } from 'react';
import { Plus, FileText, DollarSign, Calendar, TrendingUp, AlertCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import baseApi from '../../constants/apiUrl';

const InstallmentsList = () => {
  const navigate = useNavigate();
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  const fetchInstallments = useCallback(async () => {
    try {
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch(`${baseApi}/getAllCreateInstallnment`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setInstallments(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch installments');
      }
    } catch (err) {
      console.error('Fetch installments error:', err);
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

    fetchInstallments();
  }, [navigate, fetchInstallments]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this installment plan?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${baseApi}/deleteInstallment/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Remove deleted item from list or refresh
        setInstallments(prev => prev.filter(item => item._id !== id && item.installmentPlanId !== id));
        setError(''); // Clear any previous errors
      } else {
        setError(data.message || 'Failed to delete installment plan');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete installment plan');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading installment plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Installment Plans</h1>
            <p className="text-gray-600 mt-1">Manage all your installment plans</p>
          </div>
          <button
            onClick={() => navigate('/installments/create')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create Plan
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {installments.length === 0 ? (
          <div className="glass-red rounded-xl shadow-lg p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Installment Plans Yet</h3>
            <p className="text-gray-600 mb-6">Create your first installment plan to get started</p>
            <button
              onClick={() => navigate('/installments/create')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            >
              Create First Plan
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-red rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Plans</p>
                    <p className="text-3xl font-bold text-gray-800">{installments.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="glass-red rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Plans</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {installments.filter(i => i.status === 'active').length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="glass-red rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Value</p>
                    <p className="text-3xl font-bold text-gray-800">
                      ₨ {installments.reduce((sum, i) => sum + (i.totalAmount || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Installments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {installments.map((installment) => {
                const firstPlan = installment.paymentPlans?.[0] || {};
                const mainImage = installment.productImages?.[0] || '';

                return (
                  <div
                    key={installment._id}
                    className="glass-red rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
                  >
                    {/* Product Image */}
                    {mainImage && (
                      <div className="h-48 bg-gray-100 overflow-hidden">
                        <img 
                          src={mainImage} 
                          alt={installment.productName || 'Product'}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-1">
                            {installment.productName || 'Installment Plan'}
                          </h3>
                          {installment.category && (
                            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                              {installment.category}
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-2 ${
                          installment.status === 'active' || installment.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : installment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {installment.status || 'Active'}
                        </span>
                      </div>

                      {installment.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {installment.description}
                        </p>
                      )}

                      <div className="space-y-3">
                        {installment.price && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Price:</span>
                            <span className="font-semibold text-gray-800">
                              ₨ {installment.price.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {firstPlan.monthlyInstallment && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Monthly:</span>
                            <span className="font-semibold text-gray-800">
                              ₨ {firstPlan.monthlyInstallment.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {firstPlan.tenureMonths && (
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Tenure:</span>
                            <span className="font-semibold text-gray-800">
                              {firstPlan.tenureMonths} months
                            </span>
                          </div>
                        )}

                        {installment.city && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">City:</span>
                            <span className="font-semibold text-gray-800">
                              {installment.city}
                            </span>
                          </div>
                        )}

                        {installment.paymentPlans && installment.paymentPlans.length > 1 && (
                          <div className="pt-2">
                            <span className="text-xs text-blue-600 font-medium">
                              +{installment.paymentPlans.length - 1} more plan{installment.paymentPlans.length > 2 ? 's' : ''}
                            </span>
                          </div>
                        )}

                        {installment.createdAt && (
                          <div className="pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              Created: {new Date(installment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <button
                          onClick={() => navigate(`/installments/view/${installment._id}`)}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => navigate(`/installments/edit/${installment._id}`)}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          title="Edit Plan"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(installment._id)}
                          disabled={deleteLoading === installment._id}
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Plan"
                        >
                          {deleteLoading === installment._id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default InstallmentsList;

