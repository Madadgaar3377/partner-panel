import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Key, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Get email from location state (passed from signup) or localStorage
    const emailFromState = location.state?.email;
    const emailFromStorage = localStorage.getItem('signupEmail');
    
    if (emailFromState) {
      setFormData(prev => ({ ...prev, email: emailFromState }));
      localStorage.setItem('signupEmail', emailFromState);
    } else if (emailFromStorage) {
      setFormData(prev => ({ ...prev, email: emailFromStorage }));
    } else {
      // If no email found, redirect to signup
      navigate('/');
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.email || !formData.otp) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.otp.length < 4) {
      setError('OTP must be at least 4 digits');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://api.madadgaar.com.pk/api/verifyAccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp
        }),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        setSuccess(true);
        // Clear signup email from storage
        localStorage.removeItem('signupEmail');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(data.message || 'OTP verification failed. Please try again.');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-300 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-2">
          <div className="inline-block p-2 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl mb-4 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <img src="/madadgaar-logo.jpg" alt="logo" className="w-20 h-20 rounded-xl object-cover" />
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-2">Madadgaar</h1>
          <p className="text-gray-600 font-medium text-lg">Verify Your Account</p>
        </div>

        {/* OTP Verification Form */}
        <div className="glass-red rounded-3xl shadow-2xl p-8 animate-in fade-in slide-in-from-right-4 border border-white/50 backdrop-blur-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Enter OTP</h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification code to <span className="font-semibold text-red-600">{formData.email}</span>
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600">
                Account verified successfully! Redirecting to login...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  readOnly
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code (OTP) *
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="hidden"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Enter the 6-digit code sent to your email</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </span>
              ) : (
                'Verify Account'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 text-gray-600 hover:text-red-600 font-medium transition-colors mx-auto"
            >
              <ArrowLeft className="w-4 h-5" />
              Back to Login
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © 2024 Madadgaar. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;

