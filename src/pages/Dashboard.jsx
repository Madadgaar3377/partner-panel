import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  FileText, 
  Home, 
  Users, 
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { PageLoader } from '../components/Loader';
import baseApi from '../constants/apiUrl';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      window.location.href = '/';
      return;
    }

    // Get user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    // Fetch dashboard data
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${baseApi}/partnerDashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (!userData || loading) {
    return <PageLoader text="Loading dashboard..." />;
  }

  const stats = dashboardData?.stats || {
    totalInstallments: 0,
    totalInstallmentRequests: 0,
    totalProperties: 0,
    totalPropertyApplications: 0
  };

  const recentInstallments = dashboardData?.recent?.recentInstallments || [];
  const recentProperties = dashboardData?.recent?.recentProperties || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {userData.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600">Here's what's happening with your partner account today.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Installments */}
          <div className="glass-red rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.totalInstallments}</h3>
            <p className="text-sm text-gray-600">Installment Plans</p>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">Plans you've created</p>
            </div>
          </div>

          {/* Total Installment Requests */}
          <div className="glass-red rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Requests</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.totalInstallmentRequests}</h3>
            <p className="text-sm text-gray-600">Installment Requests</p>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">Applications received</p>
            </div>
          </div>

          {/* Total Properties */}
          <div className="glass-red rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Properties</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.totalProperties}</h3>
            <p className="text-sm text-gray-600">Properties Listed</p>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">Properties you've added</p>
            </div>
          </div>

          {/* Total Property Applications */}
          <div className="glass-red rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Applications</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.totalPropertyApplications}</h3>
            <p className="text-sm text-gray-600">Property Applications</p>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">Inquiries received</p>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Installments */}
          <div className="glass-red rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-white" />
                <h3 className="text-xl font-bold text-white">Recent Installment Plans</h3>
              </div>
            </div>
            <div className="p-6">
              {recentInstallments.length > 0 ? (
                <div className="space-y-4">
                  {recentInstallments.map((installment, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{installment.title || installment.planName || 'Installment Plan'}</h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          Active
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {installment.totalAmount && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span>₨ {installment.totalAmount?.toLocaleString()}</span>
                          </div>
                        )}
                        {installment.duration && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{installment.duration} months</span>
                          </div>
                        )}
                      </div>
                      {installment.createdAt && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>Created {new Date(installment.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No installment plans yet</p>
                  <p className="text-sm text-gray-400 mt-1">Create your first installment plan to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Properties */}
          <div className="glass-red rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
              <div className="flex items-center gap-3">
                <Home className="w-6 h-6 text-white" />
                <h3 className="text-xl font-bold text-white">Recent Properties</h3>
              </div>
            </div>
            <div className="p-6">
              {recentProperties.length > 0 ? (
                <div className="space-y-4">
                  {recentProperties.map((property, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{property.title || property.propertyName || 'Property'}</h4>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          Listed
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {property.price && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span>₨ {property.price?.toLocaleString()}</span>
                          </div>
                        )}
                        {property.location && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{property.location}</span>
                          </div>
                        )}
                      </div>
                      {property.createdAt && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>Listed {new Date(property.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No properties listed yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add your first property to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Access Areas */}
        {userData.userAccess && userData.userAccess.length > 0 && (
          <div className="glass-red rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Your Access Areas</h3>
            <div className="flex flex-wrap gap-3">
              {userData.userAccess.map((access, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium shadow-md"
                >
                  {access}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-6 text-center text-gray-500 text-sm">
        <p>Logged in at: {new Date(localStorage.getItem('loginTime')).toLocaleString()}</p>
        <p className="mt-2">© 2024 Madadgaar. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;

