import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Eye, Edit, Trash2, Plus, Search, Filter, Briefcase, Users, TrendingUp, Calendar } from 'lucide-react';
import apiUrl from '../../constants/apiUrl';
import Navbar from '../../components/Navbar';
import { PageLoader } from '../../components/Loader';

const LoansList = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterEmployment, setFilterEmployment] = useState('All');

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${apiUrl}/getAllLoans`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setLoans(data.loans || []);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan plan?')) return;
    
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${apiUrl}/deleteLoan/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setLoans(loans.filter(loan => loan._id !== id));
      }
    } catch (error) {
      console.error('Error deleting loan:', error);
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.loanPlanId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || loan.loanType === filterType;
    const matchesEmployment = filterEmployment === 'All' || loan.employmentType === filterEmployment;
    return matchesSearch && matchesType && matchesEmployment;
  });

  const stats = {
    total: loans.length,
    salaried: loans.filter(l => l.employmentType === 'Salaried').length,
    selfEmployed: loans.filter(l => l.employmentType === 'Self-Employed').length,
    startup: loans.filter(l => l.employmentType === 'Startup').length,
  };

  if (loading) {
    return <PageLoader text="Loading loans..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Loan Management</h1>
              <p className="text-gray-600">Manage your loan offerings and applications</p>
            </div>
            <button
              onClick={() => navigate('/loans/create')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Loan Plan
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Total Loan Plans</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <DollarSign className="w-12 h-12 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Salaried</p>
                <p className="text-3xl font-bold">{stats.salaried}</p>
              </div>
              <Briefcase className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Self-Employed</p>
                <p className="text-3xl font-bold">{stats.selfEmployed}</p>
              </div>
              <Users className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">Startup</p>
                <p className="text-3xl font-bold">{stats.startup}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or loan ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="All">All Loan Types</option>
                <option value="Personal Loan">Personal Loan</option>
                <option value="Business Loan">Business Loan</option>
                <option value="Home Loan">Home Loan</option>
                <option value="Car Loan">Car Loan</option>
                <option value="Education Loan">Education Loan</option>
                <option value="Startup Loan">Startup Loan</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterEmployment}
                onChange={(e) => setFilterEmployment(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="All">All Employment Types</option>
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Startup">Startup</option>
                <option value="Business Owner">Business Owner</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loans Grid */}
        {filteredLoans.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Loan Plans Found</h3>
            <p className="text-gray-600 mb-6">Create your first loan plan to get started</p>
            <button
              onClick={() => navigate('/loans/create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Loan Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLoans.map((loan) => (
              <div
                key={loan._id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                      {loan.loanPlanId || 'N/A'}
                    </span>
                    <DollarSign className="w-8 h-8 text-white/80" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">
                    {loan.loanType || 'Loan Plan'}
                  </h3>
                  <p className="text-purple-100 text-sm">
                    {loan.employmentType || 'Employment Type'}
                  </p>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    {loan.name && (
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Applicant</p>
                          <p className="text-sm font-semibold text-gray-900">{loan.name}</p>
                        </div>
                      </div>
                    )}

                    {loan.city && (
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">City</p>
                          <p className="text-sm font-semibold text-gray-900">{loan.city}</p>
                        </div>
                      </div>
                    )}

                    {loan.date && (
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(loan.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {loan.isVerified !== undefined && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          loan.isVerified 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {loan.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => navigate(`/loans/view/${loan._id}`)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-xs font-semibold">View</span>
                    </button>
                    <button
                      onClick={() => navigate(`/loans/edit/${loan._id}`)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-xs font-semibold">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(loan._id)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-xs font-semibold">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoansList;
