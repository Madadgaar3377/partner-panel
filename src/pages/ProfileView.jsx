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
  Clock,
  Building2,
  FileText,
  Eye,
  Users,
  Download
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

              {/* Partner Type / Access Areas */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Partner Type</p>
                {userData.userAccess && userData.userAccess.length >= 2 ? (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Access Areas:</p>
                    {userData.userAccess.map((access, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold mr-1 mb-1"
                      >
                        {access}
                      </span>
                    ))}
                  </div>
                ) : userData.companyDetails?.PartnerType ? (
                  <span className="inline-block px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-semibold">
                    {userData.companyDetails.PartnerType}
                  </span>
                ) : userData.userAccess && userData.userAccess.length === 1 ? (
                  <span className="inline-block px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-semibold">
                    {userData.userAccess[0]}
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 bg-gray-500 text-white rounded-lg text-sm font-semibold">
                    {userData.UserType}
                  </span>
                )}
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

            {/* Access Areas - Enhanced Display */}
            {userData.userAccess && userData.userAccess.length > 0 && (
              <div className="glass-red rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Service Access & Permissions
                </h3>
                
                {/* <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Access Level:</strong> {userData.userAccess.length === 1 ? 'Single Service' : 'Multi-Service Partner'}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    You have access to {userData.userAccess.length} service(s) on the platform
                  </p>
                </div> */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {userData.userAccess.map((access, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:from-red-600 hover:to-red-700 transition-all"
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{access}</p>
                        <p className="text-xs text-red-100">Service Access</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ))}
                </div>

                {/* {userData.userAccess.length >= 2 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Multi-Service Partner Benefits Active
                    </p>
                  </div>
                )} */}
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

            {/* Company Details */}
            {userData.companyDetails && userData.companyDetails.RegisteredCompanyName && (
              <div className="glass-red rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-red-600" />
                  Company Information
                </h3>
                
                {/* Info Banner */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">Verified Company Profile</p>
                    <p className="text-xs text-blue-700">
                      Your company documents have been verified and cannot be changed. 
                      Contact support if you need to update any documents.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Company Name</p>
                      <p className="text-sm font-medium text-gray-800">{userData.companyDetails.RegisteredCompanyName}</p>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Partner Type / Access Areas</p>
                      {userData.userAccess && userData.userAccess.length >= 2 ? (
                        <div className="flex flex-wrap gap-1">
                          {userData.userAccess.map((access, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold"
                            >
                              {access}
                            </span>
                          ))}
                        </div>
                      ) : userData.companyDetails.PartnerType ? (
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          {userData.companyDetails.PartnerType}
                        </span>
                      ) : userData.userAccess && userData.userAccess.length === 1 ? (
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          {userData.userAccess[0]}
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          Not Set
                        </span>
                      )}
                    </div>

                    {userData.companyDetails.SECPRegistrationNumber && (
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">SECP Registration Number</p>
                        <p className="text-sm font-medium text-gray-800">{userData.companyDetails.SECPRegistrationNumber}</p>
                      </div>
                    )}

                    {userData.companyDetails.NTN && (
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">NTN</p>
                        <p className="text-sm font-medium text-gray-800">{userData.companyDetails.NTN}</p>
                      </div>
                    )}

                    {userData.companyDetails.STRN && (
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">STRN</p>
                        <p className="text-sm font-medium text-gray-800">{userData.companyDetails.STRN}</p>
                      </div>
                    )}

                    {userData.companyDetails.AuthorizationReference && (
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Authorization Reference</p>
                        <p className="text-sm font-medium text-gray-800">{userData.companyDetails.AuthorizationReference}</p>
                      </div>
                    )}

                    {userData.companyDetails.OfficialWebsite && (
                      <div className="p-4 bg-white rounded-lg border border-gray-200 md:col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Official Website</p>
                        <a 
                          href={userData.companyDetails.OfficialWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {userData.companyDetails.OfficialWebsite}
                        </a>
                      </div>
                    )}

                    {userData.companyDetails.HeadOfficeAddress && (
                      <div className="p-4 bg-white rounded-lg border border-gray-200 md:col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Head Office Address</p>
                        <p className="text-sm font-medium text-gray-800">{userData.companyDetails.HeadOfficeAddress}</p>
                      </div>
                    )}

                    {userData.companyDetails.CommissionType && (
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Commission Type</p>
                        <p className="text-sm font-medium text-gray-800">{userData.companyDetails.CommissionType}</p>
                      </div>
                    )}

                    {userData.companyDetails.CommissionLock && (
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Commission Lock Period</p>
                        <p className="text-sm font-medium text-gray-800">{userData.companyDetails.CommissionLock}</p>
                      </div>
                    )}
                  </div>

                  {/* Documents Section */}
                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-red-600" />
                      Company Documents
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {userData.companyDetails.SECPRegistrationCertificate && (
                        <a
                          href={userData.companyDetails.SECPRegistrationCertificate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">SECP Certificate</span>
                          </div>
                          <Eye className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                        </a>
                      )}

                      {userData.companyDetails.CompanyProfilePDF && (
                        <a
                          href={userData.companyDetails.CompanyProfilePDF}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-900">Company Profile</span>
                          </div>
                          <Eye className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                        </a>
                      )}

                      {userData.companyDetails.DeliveryPolicyDocument && (
                        <a
                          href={userData.companyDetails.DeliveryPolicyDocument}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-purple-600" />
                            <span className="text-sm font-medium text-purple-900">Delivery Policy</span>
                          </div>
                          <Eye className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                        </a>
                      )}

                      {userData.companyDetails.AuthorizedAgencyLetter && (
                        <a
                          href={userData.companyDetails.AuthorizedAgencyLetter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-orange-600" />
                            <span className="text-sm font-medium text-orange-900">Agency Letter</span>
                          </div>
                          <Eye className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* CNIC Images */}
                  {userData.companyDetails.cnicPic && userData.companyDetails.cnicPic.length > 0 && (
                    <div className="pt-6 border-t border-gray-200">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-red-600" />
                        CNIC Documents
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {userData.companyDetails.cnicPic.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative group"
                          >
                            <img
                              src={url}
                              alt={`CNIC ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-red-500 transition-all"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg flex items-center justify-center transition-all">
                              <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Authorized Contact Persons */}
            {userData.companyDetails && userData.companyDetails.AuthorizedContactPerson && userData.companyDetails.AuthorizedContactPerson.length > 0 && (
              <div className="glass-red rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-600" />
                  Authorized Contact Persons
                </h3>
                <div className="space-y-4">
                  {userData.companyDetails.AuthorizedContactPerson.map((person, index) => (
                    <div key={index} className="p-5 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{person.fullName}</h4>
                          {person.Designation && (
                            <p className="text-sm text-gray-600">{person.Designation}</p>
                          )}
                        </div>
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          Contact #{index + 1}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {person.phoneNumber && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{person.phoneNumber}</span>
                          </div>
                        )}
                        {person.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{person.email}</span>
                          </div>
                        )}
                        {person.OfficeAddress && (
                          <div className="flex items-center gap-2 text-sm md:col-span-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{person.OfficeAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

