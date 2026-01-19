import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, Mail, Phone, LogOut } from 'lucide-react';
import Navbar from '../components/Navbar';

const PendingVerification = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('loginExpiration');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-yellow-100 overflow-hidden">
          
          {/* Header with Animation */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-8 text-center">
            <div className="inline-block p-4 bg-white/20 rounded-full mb-4 animate-pulse">
              <Clock className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Account Pending Verification</h1>
            <p className="text-yellow-100 text-lg">Your profile is complete and under review</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            
            {/* Status Message */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Profile Successfully Submitted!</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Thank you for completing your partner profile. Your application has been received and is currently being reviewed by our admin team.
                  </p>
                </div>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-6 bg-yellow-500 rounded"></span>
                What happens next?
              </h3>
              
              <div className="space-y-3 ml-3">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Document Verification</p>
                    <p className="text-sm text-gray-600">Our team will review your submitted documents and company information.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Admin Approval</p>
                    <p className="text-sm text-gray-600">Once verified, an admin will approve your account for partnership.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Email Notification</p>
                    <p className="text-sm text-gray-600">You'll receive an email notification once your account is approved.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Full Access Granted</p>
                    <p className="text-sm text-gray-600">After approval, you can login and access your partner dashboard.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-blue-600" />
                <h4 className="font-bold text-gray-900">Expected Timeline</h4>
              </div>
              <p className="text-gray-700">
                Verification typically takes <strong>1-3 business days</strong>. We'll notify you via email as soon as your account is approved.
              </p>
            </div>

            {/* Contact Information */}
            <div className="border-2 border-gray-200 rounded-xl p-6">
              <h4 className="font-bold text-gray-900 mb-4">Need Assistance?</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>Email: <a href="mailto:support@madadgaar.com" className="text-blue-600 hover:underline font-medium">support@madadgaar.com</a></span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>Phone: <a href="tel:+92300000000" className="text-blue-600 hover:underline font-medium">+92 300 000 0000</a></span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all shadow-lg"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-all shadow-lg"
              >
                Refresh Status
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Your application reference ID and further details have been sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingVerification;

