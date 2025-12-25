import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft,
  DollarSign,
  Calendar,
  MapPin,
  Building,
  FileText,
  User,
  Mail,
  Phone,
  Tag,
  Video,
  AlertCircle,
  Package,
  CheckCircle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import baseApi from '../../constants/apiUrl';

const InstallmentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [installment, setInstallment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  const fetchInstallmentDetail = useCallback(async () => {
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
        const found = data.data.find(item => item._id === id);
        if (found) {
          setInstallment(found);
        } else {
          setError('Installment plan not found');
        }
      } else {
        setError(data.message || 'Failed to fetch installment');
      }
    } catch (err) {
      console.error('Fetch installment error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      navigate('/');
      return;
    }

    fetchInstallmentDetail();
  }, [navigate, fetchInstallmentDetail]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !installment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass-red rounded-xl shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Error</h3>
            <p className="text-gray-600 mb-6">{error || 'Installment not found'}</p>
            <button
              onClick={() => navigate('/installments')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const creator = installment.createdBy?.[0] || {};
  const images = installment.productImages || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/installments')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Installments
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images & Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Images */}
            {images.length > 0 && (
              <div className="glass-red rounded-xl shadow-lg overflow-hidden">
                {/* Main Image */}
                <div className="h-96 bg-gray-100 overflow-hidden">
                  <img 
                    src={images[selectedImage]} 
                    alt={installment.productName}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === index 
                              ? 'border-blue-600' 
                              : 'border-gray-200 hover:border-blue-400'
                          }`}
                        >
                          <img 
                            src={img} 
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Product Details */}
            <div className="glass-red rounded-xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {installment.productName || 'Installment Plan'}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    {installment.category && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                        <Tag className="w-3 h-3 inline mr-1" />
                        {installment.category}
                      </span>
                    )}
                    {installment.companyName && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                        <Building className="w-3 h-3 inline mr-1" />
                        {installment.companyName}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                  installment.status === 'active' || installment.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : installment.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {installment.status || 'Active'}
                </span>
              </div>

              {/* Price & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <p className="text-sm text-blue-700 mb-1">Product Price</p>
                  <p className="text-3xl font-bold text-blue-800">
                    ₨ {installment.price?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                {installment.city && (
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <p className="text-sm text-purple-700 mb-1">Location</p>
                    <p className="text-xl font-bold text-purple-800 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {installment.city}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              {installment.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{installment.description}</p>
                </div>
              )}

              {/* Video URL */}
              {installment.videoUrl && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Video
                  </h3>
                  <a 
                    href={installment.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Watch Video
                  </a>
                </div>
              )}
            </div>

            {/* Payment Plans */}
            {installment.paymentPlans && installment.paymentPlans.length > 0 && (
              <div className="glass-red rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  Payment Plans
                </h2>
                <div className="space-y-4">
                  {installment.paymentPlans.map((plan, index) => (
                    <div 
                      key={index}
                      className="p-6 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800">
                          {plan.planName || `Plan ${index + 1}`}
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                          {plan.tenureMonths} Months
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {plan.installmentPrice > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Plan Price</p>
                            <p className="text-lg font-bold text-gray-800">
                              ₨ {plan.installmentPrice.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {plan.downPayment > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Down Payment</p>
                            <p className="text-lg font-bold text-gray-800">
                              ₨ {plan.downPayment.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {plan.monthlyInstallment > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Monthly Installment</p>
                            <p className="text-lg font-bold text-green-600">
                              ₨ {plan.monthlyInstallment.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {plan.interestRatePercent > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Interest Rate</p>
                            <p className="text-lg font-bold text-gray-800">
                              {plan.interestRatePercent}%
                            </p>
                          </div>
                        )}
                        {plan.interestType && (
                          <div className="md:col-span-2">
                            <p className="text-xs text-gray-500 mb-1">Interest Type</p>
                            <p className="text-sm font-medium text-gray-700">
                              {plan.interestType}
                            </p>
                          </div>
                        )}
                      </div>

                      {plan.otherChargesNote && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                          <p className="text-xs text-yellow-700 font-semibold mb-1">Note:</p>
                          <p className="text-sm text-yellow-800">{plan.otherChargesNote}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Features - Conditional rendering based on category */}
            {installment.mechanicalBike && Object.keys(installment.mechanicalBike.generalFeatures || {}).some(key => installment.mechanicalBike.generalFeatures[key]) && (
              <div className="glass-red rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Mechanical Bike Specifications</h2>
                
                {/* General Features */}
                {installment.mechanicalBike.generalFeatures && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">General Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(installment.mechanicalBike.generalFeatures).map(([key, value]) => value && (
                        <div key={key} className="p-3 bg-white rounded-lg">
                          <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-sm font-medium text-gray-800">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance */}
                {installment.mechanicalBike.performance && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(installment.mechanicalBike.performance).map(([key, value]) => value && (
                        <div key={key} className="p-3 bg-white rounded-lg">
                          <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-sm font-medium text-gray-800">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assembly */}
                {installment.mechanicalBike.assembly && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Assembly</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(installment.mechanicalBike.assembly).map(([key, value]) => value && (
                        <div key={key} className="p-3 bg-white rounded-lg">
                          <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-sm font-medium text-gray-800">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Electrical Bike Specifications */}
            {installment.electricalBike && Object.values(installment.electricalBike).some(val => val) && (
              <div className="glass-red rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Electrical Bike Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(installment.electricalBike).map(([key, value]) => value && (
                    <div key={key} className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-sm font-medium text-gray-800">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Creator Info & Actions */}
          <div className="space-y-6">
            {/* Creator Information */}
            {creator.name && (
              <div className="glass-red rounded-xl shadow-lg p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Posted By
                </h3>
                
                <div className="flex items-center gap-3 mb-4">
                  {creator.profileImage ? (
                    <img 
                      src={creator.profileImage} 
                      alt={creator.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-800">{creator.name}</p>
                    {creator.userType && (
                      <p className="text-xs text-gray-500 capitalize">{creator.userType}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {creator.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{creator.email}</span>
                    </div>
                  )}
                  {creator.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{creator.phoneNumber}</span>
                    </div>
                  )}
                  {creator.city && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{creator.city}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status & Date */}
            <div className="glass-red rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Plan Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Plan ID</p>
                  <p className="text-sm font-medium text-gray-800 break-all">
                    {installment.installmentPlanId || installment._id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Created</p>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(installment.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                {installment.updatedAt && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(installment.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
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

export default InstallmentDetail;
