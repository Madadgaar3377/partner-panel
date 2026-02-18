import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveUserSession, clearUserSession } from '../utils/auth';
import baseApi from '../constants/apiUrl';

/**
 * Handles login via Bearer token in URL (redirect from main site when user is partner).
 * Calls GET /auth/partnerSession with Bearer token, saves session, then redirects.
 */
export default function LoginWithToken() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token || !token.trim()) {
      setStatus('error');
      setMessage('No token provided.');
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const res = await fetch(`${baseApi}/auth/partnerSession`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.trim()}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!mounted) return;

        if (!res.ok || !data.success) {
          clearUserSession();
          setStatus('error');
          setMessage(data?.message || 'Invalid or expired token. Please log in again.');
          setSearchParams({}); // Remove token from URL
          return;
        }

        const user = data.user;
        if (!user) {
          setStatus('error');
          setMessage('Could not load session.');
          setSearchParams({});
          return;
        }

        saveUserSession(token.trim(), user);

        // Remove token from URL without full reload
        setSearchParams({});
        setStatus('success');

        const hasCompanyDetails = user.companyDetails && user.companyDetails.RegisteredCompanyName;

        if (!hasCompanyDetails) {
          navigate('/complete-profile', { replace: true });
        } else if (!user.isVerified) {
          navigate('/pending-verification', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Login with token error:', err);
        clearUserSession();
        setStatus('error');
        setMessage('Network error. Please try again.');
        setSearchParams({});
      }
    })();

    return () => { mounted = false; };
  }, [searchParams, setSearchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-block p-2 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl mb-4 shadow-2xl">
          <img src="/madadgaar-logo.jpg" alt="logo" className="w-20 h-20 rounded-xl object-cover" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Madadgaar Partner Portal</h1>

        {status === 'loading' && (
          <div className="mt-8">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Signing you in...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg border border-red-100">
            <p className="text-red-600 font-medium mb-4">{message}</p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-8">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}
