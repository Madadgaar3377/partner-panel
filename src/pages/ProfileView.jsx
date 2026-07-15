import React, { useState, useEffect, useCallback } from 'react';
import {
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
  Download,
  Link2,
  QrCode,
  Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import baseApi from '../constants/apiUrl';
import { createPartnerProfileQrCard } from '../utils/partnerProfileQr';

const FRONTEND_ORIGIN = 'https://madadgaar.com.pk';

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const ProfileView = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copyDone, setCopyDone] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrBusy, setQrBusy] = useState(false);

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

  const publicProfileUrl = userData?.userId
    ? `${FRONTEND_ORIGIN}/partner/${encodeURIComponent(userData.userId)}`
    : '';
  const companyName =
    userData?.companyDetails?.RegisteredCompanyName || userData?.name || 'Partner';
  const profileInitial = companyName.charAt(0).toUpperCase();

  const copyPublicLink = async () => {
    if (!publicProfileUrl) return;
    try {
      await navigator.clipboard.writeText(publicProfileUrl);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = publicProfileUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopyDone(true);
        setTimeout(() => setCopyDone(false), 2000);
      } catch {
        setError('Could not copy link');
      }
    }
  };

  const generateBrandedQr = async () => {
    if (!publicProfileUrl || !userData?.isVerified) return;
    setQrBusy(true);
    setError('');
    try {
      let profilePicForQr = userData.profilePic || '';
      const token = localStorage.getItem('userToken');

      // R2-hosted images may display normally but reject canvas reads. Fetch the
      // authenticated user's saved logo through the API and embed it as data.
      if (profilePicForQr && token) {
        try {
          const logoResponse = await fetch(`${baseApi}/profile-image-for-qr`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (logoResponse.ok) {
            profilePicForQr = await blobToDataUrl(await logoResponse.blob());
          }
        } catch {
          // Keep the direct URL fallback for sources that already allow CORS.
        }
      }

      const dataUrl = await createPartnerProfileQrCard({
        publicUrl: publicProfileUrl,
        companyName:
          userData.companyDetails?.RegisteredCompanyName || userData.name || 'Partner',
        partnerName: userData.name || '',
        partnerType: userData.companyDetails?.PartnerType || '',
        profilePic: profilePicForQr,
        userId: userData.userId || '',
        isVerified: Boolean(userData.isVerified),
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('QR generate failed', err);
      setError('Failed to generate QR code');
    } finally {
      setQrBusy(false);
    }
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `madadgaar-partner-${userData?.userId || 'profile'}-qr.png`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7f9]">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="h-1.5 bg-red-200" />
            <div className="flex items-center gap-5 p-7">
              <div className="h-24 w-24 rounded-2xl bg-gray-200" />
              <div className="flex-1 space-y-3">
                <div className="h-7 w-52 max-w-full rounded bg-gray-200" />
                <div className="h-4 w-36 rounded bg-gray-100" />
                <div className="h-4 w-64 max-w-full rounded bg-gray-100" />
              </div>
            </div>
          </div>
          <div className="mt-6 grid animate-pulse grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-72 rounded-2xl border border-gray-200 bg-white" />
            <div className="h-96 rounded-2xl border border-gray-200 bg-white lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#f6f7f9]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
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
    <div className="min-h-screen bg-[#f6f7f9]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Profile identity header */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="h-1.5 bg-red-600" />
          <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="relative shrink-0">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 sm:h-24 sm:w-24">
                  {userData.profilePic ? (
                    <img
                      src={userData.profilePic}
                      alt={`${companyName} logo`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black text-red-600">{profileInitial}</span>
                  )}
                </div>
                <span
                  className={`absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white ${
                    userData.isVerified ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  title={userData.isVerified ? 'Verified partner' : 'Verification pending'}
                >
                  {userData.isVerified ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : (
                    <Clock className="h-4 w-4 text-white" />
                  )}
                </span>
              </div>

              <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                    {companyName}
                  </h1>
                  {userData.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-600">{userData.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {userData.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    {userData.companyDetails?.PartnerType || userData.UserType}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              {userData.isVerified && (
                <a
                  href={publicProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold text-gray-700 transition hover:border-red-300 hover:text-red-700"
                >
                  <Eye className="h-4 w-4" />
                  View public page
                </a>
              )}
              <button
                onClick={() => navigate('/profile/edit')}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Share public profile + QR */}
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50">
              <Link2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-950">Public storefront</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Share your verified products, contact details and company profile with one link.
              </p>
            </div>
          </div>

          {!userData.isVerified ? (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Your public profile is available after admin verification. Once verified, you can copy the link and download a branded QR.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <div className="min-w-0">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Public URL</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    readOnly
                    value={publicProfileUrl}
                    className="min-h-[46px] min-w-0 flex-1 rounded-xl border border-gray-300 bg-gray-50 px-3 font-mono text-sm text-gray-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={copyPublicLink}
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700"
                  >
                    <Copy className="w-4 h-4" />
                    {copyDone ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="mt-6 border-t border-gray-200 pt-5">
                  <h3 className="text-base font-black text-gray-900">Use your QR anywhere</h3>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-gray-600">
                    Download the branded PNG for your shop, invoices, social posts or product packaging.
                    Scanning it opens your live partner storefront.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={generateBrandedQr}
                      disabled={qrBusy}
                      className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-red-600 px-5 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <QrCode className={`h-4 w-4 ${qrBusy ? 'animate-pulse' : ''}`} />
                      {qrBusy ? 'Adding your logo…' : qrDataUrl ? 'Regenerate QR' : 'Generate QR'}
                    </button>
                    {qrDataUrl && (
                      <button
                        type="button"
                        onClick={downloadQr}
                        className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 text-sm font-bold text-white transition hover:bg-black"
                      >
                        <Download className="h-4 w-4" />
                        Download PNG
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mx-auto lg:mx-0">
                <p className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-gray-500 lg:text-left">
                  QR preview
                </p>
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-2 shadow-sm">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Partner profile QR card"
                      className="h-auto w-56 rounded-xl bg-white sm:w-64"
                    />
                  ) : (
                    <div className="flex aspect-[900/1280] w-56 flex-col items-center justify-center gap-3 rounded-xl bg-white px-6 text-center sm:w-64">
                      <QrCode className="h-12 w-12 text-red-600" />
                      <p className="text-sm font-bold text-gray-800">Ready to generate</p>
                      <p className="text-xs leading-5 text-gray-500">
                        Your partner logo, verified name and Madadgaar QR branding will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Account overview */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Account overview</p>
                  <h2 className="mt-1 text-lg font-black text-gray-950">Partner status</h2>
                </div>
                <Shield className="h-5 w-5 text-red-600" />
              </div>

              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-600">Verification</span>
                  <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${
                    userData.isVerified ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {userData.isVerified ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                    {userData.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-600">Account</span>
                  <span className={`text-sm font-bold ${userData.isActive ? 'text-emerald-700' : 'text-gray-500'}`}>
                    {userData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-sm text-gray-600">Partner ID</span>
                  <span className="truncate font-mono text-xs font-bold text-gray-800">{userData.userId}</span>
                </div>
                <div className="py-3">
                  <span className="text-sm text-gray-600">Services</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(userData.userAccess || []).length > 0 ? (
                      userData.userAccess.map((access, index) => (
                        <span
                          key={index}
                          className="rounded-lg border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-bold capitalize text-red-700"
                        >
                          {access}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm font-medium text-gray-700">
                        {userData.companyDetails?.PartnerType || userData.UserType}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {userData.isBlocked && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
                  This account is blocked.
                </div>
              )}
            </div>
          </aside>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
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
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
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
                      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-900 transition hover:border-red-200 hover:bg-red-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-100 bg-white">
                        <Shield className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{access}</p>
                        <p className="text-xs text-gray-500">Service access</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
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
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-red-600" />
                Financial Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <p className="mb-1 text-sm text-gray-600">Wallet Balance</p>
                  <p className="text-3xl font-black text-gray-950">₨ {userData.walletBalance?.toLocaleString() || '0'}</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <p className="mb-1 text-sm text-gray-600">User ID</p>
                  <p className="break-all font-mono text-xl font-black text-gray-950">{userData.userId}</p>
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
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
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

                    {userData.companyDetails.CommissionPercentage && (
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Commission Percentage</p>
                        <p className="text-sm font-medium text-gray-800">{userData.companyDetails.CommissionPercentage}%</p>
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
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
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
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
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

