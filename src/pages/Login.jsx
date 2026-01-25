import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import baseApi from '../constants/apiUrl';
import { saveUserSession } from '../utils/auth';

const Login = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    try {
      const response = await fetch(`${baseApi}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        const user = data.user;
        
        // Check if email is verified first
        if (!user.emailVerify) {
          setError('Please verify your email address before logging in. Check your inbox for the verification link.');
          return;
        }
        
        // Save user session (20 days expiration)
        saveUserSession(data.token, user);
        
        // Check if user has completed their profile
        // Profile is considered complete if RegisteredCompanyName exists (main required field)
        const hasCompanyDetails = user.companyDetails && 
                                  user.companyDetails.RegisteredCompanyName;
        
        // Routing logic based on verification states
        if (user.emailVerify && !user.isVerified) {
          // Email verified but not admin verified
          if (!hasCompanyDetails) {
            // Profile incomplete - redirect to complete profile
            window.location.href = '/complete-profile';
          } else {
            // Profile complete but waiting for admin approval
            window.location.href = '/pending-verification';
          }
        } else if (user.emailVerify && user.isVerified) {
          // Both email verified and admin verified
          if (!hasCompanyDetails) {
            // Edge case: verified but profile incomplete - redirect to complete profile
            window.location.href = '/complete-profile';
          } else {
            // Fully verified - redirect to dashboard
            window.location.href = '/dashboard';
          }
        } else {
          // Should not reach here, but fallback
          setError('Account verification status unclear. Please contact support.');
        }
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4 relative overflow-hidden">
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
          <p className="text-gray-600 font-medium text-lg">Partner Portal</p>
        </div>

        {/* Login Form */}
        <div className="glass-red rounded-3xl shadow-2xl p-8 animate-in fade-in slide-in-from-right-4 border border-white/50 backdrop-blur-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 mb-6">Login to access your partner dashboard</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-gray-400 outline-none transition-all"
                  placeholder="partner@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <a
                  href="/forget-password"
                  className="text-xs text-red-600 hover:text-red-700 font-bold transition-colors hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-gray-400 outline-none transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </span>
              ) : (
                'Login to Dashboard'
              )}
            </button>
          </form>

          {/* Toggle to Signup */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onToggleForm}
                className="text-red-600 hover:text-red-700 font-bold transition-colors hover:underline"
              >
                Sign Up Now
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-gray-500 text-sm font-medium">
            © 2025 Madadgaar. All rights reserved.
          </p>
          <p className="text-gray-400 text-xs">
            Secure • Reliable • Professional
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

