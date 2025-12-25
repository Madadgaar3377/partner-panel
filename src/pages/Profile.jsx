import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  MapPin, 
  Camera,
  Save,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import baseApi from '../constants/apiUrl';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    userName: '',
    phoneNumber: '',
    WhatsappNumber: '',
    cnicNumber: '',
    Address: '',
    profilePic: '',
    userAccess: []
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Available access options for partners
  const accessOptions = [
    'Installments',
    'Loan',
    'Property',
    'Insurance',
  ];

  useEffect(() => {
    // Check if user is authenticated
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      navigate('/');
      return;
    }

    // Get user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const user = JSON.parse(storedUserData);
      setUserData(user);
      setFormData({
        name: user.name || '',
        userName: user.userName || '',
        phoneNumber: user.phoneNumber || '',
        WhatsappNumber: user.WhatsappNumber || '',
        cnicNumber: user.cnicNumber || '',
        Address: user.Address || '',
        profilePic: user.profilePic || '',
        userAccess: user.userAccess || []
      });
      setImagePreview(user.profilePic || '');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleAccessToggle = (access) => {
    setFormData((prev) => {
      const newAccess = prev.userAccess.includes(access)
        ? prev.userAccess.filter((a) => a !== access)
        : [...prev.userAccess, access];
      return { ...prev, userAccess: newAccess };
    });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return formData.profilePic;

    setUploadingImage(true);
    try {
      const imageFormData = new FormData();
      imageFormData.append('image', selectedImage);

      const response = await fetch(`${baseApi}/upload-image`, {
        method: 'POST',
        body: imageFormData,
      });

      const data = await response.json();

      if (data.success) {
        return data.url;
      } else {
        throw new Error('Image upload failed');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      throw new Error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validation
    if (formData.userAccess.length === 0) {
      setError('Please select at least one access area');
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      // Upload image first if selected
      let profilePicUrl = formData.profilePic;
      if (selectedImage) {
        profilePicUrl = await uploadImage();
      }

      // Prepare updates object
      const updates = {
        ...formData,
        profilePic: profilePicUrl
      };

      // Get token and userId
      const token = localStorage.getItem('userToken');
      const userId = userData.userId;

      const response = await fetch(`${baseApi}/updateUser`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, updates }),
      });

      const data = await response.json();

      if (data.success) {
        // Update localStorage with new user data
        localStorage.setItem('userData', JSON.stringify(data.user));
        setUserData(data.user);
        setSuccess(true);
        setSelectedImage(null);

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Redirect back to dashboard after 1 seconds
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      } else {
        setError(data.message || 'Update failed. Please try again.');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(formData.profilePic || '');
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Update Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-600 font-semibold">Profile updated successfully!</p>
              <p className="text-xs text-green-600 mt-1">Redirecting to profile...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="glass-red rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Profile Picture</h2>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Image Preview */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-red-100 flex items-center justify-center border-4 border-white shadow-lg">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-red-600" />
                  )}
                </div>
                {selectedImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <label className="block">
                  <div className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                    <Camera className="w-5 h-5 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">
                        {selectedImage ? selectedImage.name : 'Choose profile picture'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="glass-red rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="johndoe"
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={userData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="WhatsappNumber"
                    value={formData.WhatsappNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
              </div>

              {/* CNIC Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNIC Number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="cnicNumber"
                    value={formData.cnicNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="XXXXX-XXXXXXX-X"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  name="Address"
                  value={formData.Address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Your complete address"
                />
              </div>
            </div>

            {/* User Access Selection */}
            <div className="mt-5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Shield className="w-4 h-4 text-red-600" />
                Access Areas * (Choose at least one)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {accessOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleAccessToggle(option)}
                    className={`py-2 px-4 rounded-lg border-2 transition-all font-medium ${
                      formData.userAccess.includes(option)
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-red-400'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Select the services you want to manage as a partner
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || uploadingImage ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {uploadingImage ? 'Uploading Image...' : 'Updating Profile...'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Profile;

