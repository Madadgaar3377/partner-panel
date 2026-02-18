import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveUserSession, clearUserSession } from '../utils/auth';
import baseApi from '../constants/apiUrl';

const PARTNER_API = (baseApi || '').replace(/\/$/, '');

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
    const query = window.location.search || (window.location.hash && window.location.hash.indexOf('?') >= 0 ? window.location.hash.slice(window.location.hash.indexOf('?')) : '');
    const token = searchParams.get('token') || new URLSearchParams(query).get('token');
    const trimmedToken = token && typeof token === 'string' ? token.trim() : '';

    if (!trimmedToken) {
      setStatus('error');
      setMessage('No token provided. Please log in from the main site or use the form below.');
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const res = await fetch(`${PARTNER_API}/auth/partnerSession`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${trimmedToken}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!mounted) return;

        if (!res.ok || !data.success) {
          clearUserSession();
          setStatus('error');
          setMessage(data?.message || 'Invalid or expired token. Please log in again.');
          setSearchParams({});
          return;
        }

        const user = data.user;
        if (!user) {
          setStatus('error');
          setMessage('Could not load session.');
          setSearchParams({});
          return;
        }

        saveUserSession(trimmedToken, user);

        // Remove token from URL
        setSearchParams({});
        if (window.history && window.history.replaceState) {
          const cleanUrl = window.location.pathname + window.location.hash.split('?')[0] || '';
          window.history.replaceState({}, '', cleanUrl || '/');
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
