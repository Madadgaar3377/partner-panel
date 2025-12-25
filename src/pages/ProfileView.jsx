import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  MapPin,
  Calendar,
  Shield,
  Wallet,
  Edit,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import baseApi from '../constants/apiUrl';

const ProfileView = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch(`${baseApi}/getUserById`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUserData(data.user);
        // Update localStorage with latest data
        localStorage.setItem('userData', JSON.stringify(data.user));
      } else {
        setError(data.message || 'Failed to fetch user data');
      }
    } catch (err) {
      console.error('Fetch user error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Check if user is authenticated
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      navigate('/');
      return;
    }

    fetchUserData();
  }, [navigate, fetchUserData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass-red rounded-xl shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Profile</h3>
            <p className="text-gray-600 mb-6">{error || 'Unable to load user data'}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-600 mt-1">View your account information</p>
          </div>
          <button
            onClick={() => navigate('/profile/edit')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="glass-red rounded-xl shadow-lg p-8 text-center sticky top-24">
              {/* Profile Picture */}
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-red-100 flex items-center justify-center border-4 border-white shadow-lg mx-auto">
                  {userData.profilePic ? (
                    <img 
                      src={userData.profilePic} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-red-600" />
                  )}
                </div>
                {/* Verification Badge */}
                <div className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md ${
                  userData.isVerified ? 'bg-green-500' : 'bg-yellow-500'
                }`}>
                  {userData.isVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Clock className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>

              {/* Name and Email */}
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{userData.name}</h2>
              <p className="text-sm text-gray-500 mb-1">{userData.userName || 'Username'}</p>
              <p className="text-sm text-gray-600 mb-4">{userData.email}</p>

              {/* Status Badges */}
              <div className="flex flex-col gap-2 mb-6">
                <div className={`px-3 py-2 rounded-lg ${
                  userData.isVerified 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <p className={`text-xs font-semibold uppercase ${
                    userData.isVerified ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {userData.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                  </p>
                </div>
                
                <div className={`px-3 py-2 rounded-lg ${
                  userData.isActive 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  <p className={`text-xs font-semibold uppercase ${
                    userData.isActive ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {userData.isActive ? '● Active' : '○ Inactive'}
                  </p>
                </div>

                {userData.isBlocked && (
                  <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-xs font-semibold uppercase text-red-700">
                      ⊗ Blocked
                    </p>
                  </div>
                )}
              </div>

              {/* User Type */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Account Type</p>
                <p className="text-sm font-semibold text-gray-800 uppercase">{userData.UserType}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="glass-red rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Phone className="w-5 h-5 text-red-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">{userData.email}</p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">{userData.phoneNumber || 'Not provided'}</p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <p className="text-xs text-gray-500 uppercase font-semibold">WhatsApp</p>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">{userData.WhatsappNumber || 'Not provided'}</p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <p className="text-xs text-gray-500 uppercase font-semibold">CNIC</p>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">{userData.cnicNumber || 'Not provided'}</p>
                </div>

                {userData.Address && (
                  <div className="md:col-span-2 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <p className="text-xs text-gray-500 uppercase font-semibold">Address</p>
                    </div>
                    <p className="text-sm text-gray-800 font-medium">{userData.Address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Access Areas */}
            {userData.userAccess && userData.userAccess.length > 0 && (
              <div className="glass-red rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Access Areas
                </h3>
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

            {/* Financial Information */}
            <div className="glass-red rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-red-600" />
                Financial Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 mb-1">Wallet Balance</p>
                  <p className="text-3xl font-bold text-green-800">₨ {userData.walletBalance?.toLocaleString() || '0'}</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 mb-1">User ID</p>
                  <p className="text-2xl font-bold text-blue-800">{userData.userId}</p>
                </div>
              </div>

              {/* Bank Account Info */}
              {userData.BankAccountinfo && userData.BankAccountinfo.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Bank Accounts</p>
                  <div className="space-y-3">
                    {userData.BankAccountinfo.map((account, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <p className="text-xs text-gray-500">Bank Name</p>
                            <p className="text-sm font-medium text-gray-800">{account.bankName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Account Name</p>
                            <p className="text-sm font-medium text-gray-800">{account.accountName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Account Number</p>
                            <p className="text-sm font-medium text-gray-800">{account.accountNumber}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Account Details */}
            <div className="glass-red rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-600" />
                Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Member Since</p>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(userData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(userData.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {userData.refferedBy && (
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Referred By</p>
                    <p className="text-sm font-medium text-gray-800">{userData.refferedBy}</p>
                  </div>
                )}

                {userData.lastIpAddress && (
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Last IP Address</p>
                    <p className="text-sm font-medium text-gray-800">{userData.lastIpAddress}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileView;

