import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Building2, 
  FileText, 
  Users, 
  Upload, 
  X,
  Shield,
  CreditCard
} from 'lucide-react';
import apiUrl from '../constants/apiUrl';
import Navbar from '../components/Navbar';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [userData, setUserData] = useState(null);

  const totalSteps = 4;

  const [formData, setFormData] = useState({
    companyDetails: {
      RegisteredCompanyName: '',
      PartnerType: '',
      SECPRegistrationCertificate: '',
      SECPRegistrationNumber: '',
      NTN: '',
      STRN: '',
      AuthorizationReference: '',
      HeadOfficeAddress: '',
      OfficialWebsite: '',
      DeliveryPolicyDocument: '',
      CompanyProfilePDF: '',
      CommissionType: '',
      CommissionLock: '',
      cnicPic: [],
      AuthorizedAgencyLetter: '',
      AuthorizedContactPerson: [],
      AuthorizationDeclaration: [
        { text: 'I declare that all information provided is accurate and true', isTrue: false },
        { text: 'I agree to the terms and conditions of the partnership', isTrue: false },
        { text: 'I authorize Madadgaar to verify the provided information', isTrue: false }
      ]
    },
    BankAccountinfo: []
  });

  const [contactPerson, setContactPerson] = useState({
    fullName: '',
    Designation: '',
    phoneNumber: '',
    OfficeAddress: '',
    email: ''
  });

  const [bankAccount, setBankAccount] = useState({
    accountNumber: '',
    accountName: '',
    bankName: ''
  });

  const partnerTypes = [
    'Installment',
    'Loan',
    'Property',
    'Insurance'
  ];

  const commissionTypes = ['Percentage', 'Fixed Amount', 'Hybrid'];

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

      // If user already has company details, pre-fill the form
      if (user.companyDetails) {
        setFormData(prev => ({
          ...prev,
          companyDetails: {
            ...prev.companyDetails,
            ...user.companyDetails
          },
          BankAccountinfo: user.BankAccountinfo || []
        }));
      }
    }
  }, [navigate]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      companyDetails: {
        ...prev.companyDetails,
        [name]: value
      }
    }));
  };

  const handleDeclarationToggle = (index) => {
    setFormData(prev => ({
      ...prev,
      companyDetails: {
        ...prev.companyDetails,
        AuthorizationDeclaration: prev.companyDetails.AuthorizationDeclaration.map((item, i) =>
          i === index ? { ...item, isTrue: !item.isTrue } : item
        )
      }
    }));
  };

  const handleContactPersonInput = (e) => {
    const { name, value } = e.target;
    setContactPerson(prev => ({ ...prev, [name]: value }));
  };

  const addContactPerson = () => {
    if (!contactPerson.fullName || !contactPerson.phoneNumber) {
      setError('Please fill in contact person name and phone number');
      return;
    }

    setFormData(prev => ({
      ...prev,
      companyDetails: {
        ...prev.companyDetails,
        AuthorizedContactPerson: [...prev.companyDetails.AuthorizedContactPerson, contactPerson]
      }
    }));

    setContactPerson({
      fullName: '',
      Designation: '',
      phoneNumber: '',
      OfficeAddress: '',
      email: ''
    });
  };

  const removeContactPerson = (index) => {
    setFormData(prev => ({
      ...prev,
      companyDetails: {
        ...prev.companyDetails,
        AuthorizedContactPerson: prev.companyDetails.AuthorizedContactPerson.filter((_, i) => i !== index)
      }
    }));
  };

  const handleBankAccountInput = (e) => {
    const { name, value } = e.target;
    setBankAccount(prev => ({ ...prev, [name]: value }));
  };

  const addBankAccount = () => {
    if (!bankAccount.accountNumber || !bankAccount.accountName || !bankAccount.bankName) {
      setError('Please fill in all bank account fields');
      return;
    }

    setFormData(prev => ({
      ...prev,
      BankAccountinfo: [...prev.BankAccountinfo, bankAccount]
    }));

    setBankAccount({
      accountNumber: '',
      accountName: '',
      bankName: ''
    });
  };

  const removeBankAccount = (index) => {
    setFormData(prev => ({
      ...prev,
      BankAccountinfo: prev.BankAccountinfo.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size is too large. Please upload an image less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Invalid file type. Please upload an image file');
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('userToken');
      const response = await fetch(`${apiUrl}/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Failed to upload image');
        return;
      }

      if (data.success && data.imageUrl) {
        if (fieldName === 'cnicPic') {
          setFormData(prev => ({
            ...prev,
            companyDetails: {
              ...prev.companyDetails,
              cnicPic: [...prev.companyDetails.cnicPic, data.imageUrl]
            }
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            companyDetails: {
              ...prev.companyDetails,
              [fieldName]: data.imageUrl
            }
          }));
        }
        setError(null);
      } else {
        setError('Failed to upload image. Please try again.');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Network error. Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDocumentUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size is too large. Please upload a file less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PDF or Word document');
      return;
    }

    setUploadingDocument(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('document', file);

      const token = localStorage.getItem('userToken');
      const response = await fetch(`${apiUrl}/upload-document`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Failed to upload document');
        return;
      }

      if (data.success && data.url) {
        setFormData(prev => ({
          ...prev,
          companyDetails: {
            ...prev.companyDetails,
            [fieldName]: data.url
          }
        }));
        setError(null);
      } else if (data.success && data.message) {
        // Handle non-core route response
        setError(data.message || 'Upload request accepted but URL not available');
      } else {
        setError('Failed to upload document. Please try again.');
      }
    } catch (err) {
      console.error('Document upload error:', err);
      setError('Network error. Failed to upload document.');
    } finally {
      setUploadingDocument(false);
    }
  };

  const removeCnicImage = (index) => {
    setFormData(prev => ({
      ...prev,
      companyDetails: {
        ...prev.companyDetails,
        cnicPic: prev.companyDetails.cnicPic.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    // Validation
    if (!formData.companyDetails.RegisteredCompanyName || !formData.companyDetails.PartnerType) {
      setError('Please fill in Company Name and Partner Type');
      setLoading(false);
      return;
    }

    // Check if all declarations are accepted
    const allDeclarationsAccepted = formData.companyDetails.AuthorizationDeclaration.every(d => d.isTrue);
    if (!allDeclarationsAccepted) {
      setError('Please accept all authorization declarations');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      
      // Prepare the request body according to backend API structure
      const requestBody = {
        userId: userData?.userId,
        updates: {
          companyDetails: formData.companyDetails,
          BankAccountinfo: formData.BankAccountinfo
        }
      };

      const response = await fetch(`${apiUrl}/updateUser`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      
      if (result.success) {
        // Update localStorage with new user data
        localStorage.setItem('userData', JSON.stringify(result.user));
        
        // Check if user is verified by admin
        if (result.user.isVerified) {
          setMessage('Profile completed successfully! Redirecting to dashboard...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setMessage('Profile completed successfully! Redirecting to verification page...');
          setTimeout(() => {
            navigate('/pending-verification');
          }, 2000);
        }
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && (!formData.companyDetails.RegisteredCompanyName || !formData.companyDetails.PartnerType)) {
      setError('Please fill in Company Name and Partner Type');
      return;
    }
    setError(null);
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-100">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Step 1: Company Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Registered Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="RegisteredCompanyName"
                  value={formData.companyDetails.RegisteredCompanyName}
                  onChange={handleInput}
                  placeholder="Enter your registered company name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Partner Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="PartnerType"
                  value={formData.companyDetails.PartnerType}
                  onChange={handleInput}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Partner Type</option>
                  {partnerTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  SECP Registration Number
                </label>
                <input
                  type="text"
                  name="SECPRegistrationNumber"
                  value={formData.companyDetails.SECPRegistrationNumber}
                  onChange={handleInput}
                  placeholder="e.g., 0012345"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  NTN (National Tax Number)
                </label>
                <input
                  type="text"
                  name="NTN"
                  value={formData.companyDetails.NTN}
                  onChange={handleInput}
                  placeholder="e.g., 1234567-8"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  STRN (Sales Tax Registration Number)
                </label>
                <input
                  type="text"
                  name="STRN"
                  value={formData.companyDetails.STRN}
                  onChange={handleInput}
                  placeholder="e.g., 01-23-4567-890-12"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Head Office Address
                </label>
                <textarea
                  name="HeadOfficeAddress"
                  value={formData.companyDetails.HeadOfficeAddress}
                  onChange={handleInput}
                  rows="3"
                  placeholder="Enter complete office address"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Official Website
                </label>
                <input
                  type="url"
                  name="OfficialWebsite"
                  value={formData.companyDetails.OfficialWebsite}
                  onChange={handleInput}
                  placeholder="https://www.example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Authorization Reference
                </label>
                <input
                  type="text"
                  name="AuthorizationReference"
                  value={formData.companyDetails.AuthorizationReference}
                  onChange={handleInput}
                  placeholder="Reference number or code"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-purple-100">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Step 2: Documents & Certificates</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SECP Certificate */}
              <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <FileText className="w-5 h-5 inline mr-2" />
                  SECP Registration Certificate
                </label>
                {formData.companyDetails.SECPRegistrationCertificate ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Uploaded</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        companyDetails: { ...prev.companyDetails, SECPRegistrationCertificate: '' }
                      }))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleDocumentUpload(e, 'SECPRegistrationCertificate')}
                      className="hidden"
                      id="secpCertificate"
                    />
                    <label
                      htmlFor="secpCertificate"
                      className="block w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                    >
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-sm text-gray-600">
                        {uploadingDocument ? 'Uploading...' : 'Choose PDF/Word file'}
                      </p>
                    </label>
                  </>
                )}
              </div>

              {/* Company Profile PDF */}
              <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <FileText className="w-5 h-5 inline mr-2" />
                  Company Profile PDF
                </label>
                {formData.companyDetails.CompanyProfilePDF ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Uploaded</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        companyDetails: { ...prev.companyDetails, CompanyProfilePDF: '' }
                      }))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleDocumentUpload(e, 'CompanyProfilePDF')}
                      className="hidden"
                      id="companyProfile"
                    />
                    <label
                      htmlFor="companyProfile"
                      className="block w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                    >
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-sm text-gray-600">
                        {uploadingDocument ? 'Uploading...' : 'Choose PDF file'}
                      </p>
                    </label>
                  </>
                )}
              </div>

              {/* Delivery Policy Document */}
              <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <FileText className="w-5 h-5 inline mr-2" />
                  Delivery Policy Document
                </label>
                {formData.companyDetails.DeliveryPolicyDocument ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Uploaded</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        companyDetails: { ...prev.companyDetails, DeliveryPolicyDocument: '' }
                      }))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleDocumentUpload(e, 'DeliveryPolicyDocument')}
                      className="hidden"
                      id="deliveryPolicy"
                    />
                    <label
                      htmlFor="deliveryPolicy"
                      className="block w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                    >
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-sm text-gray-600">
                        {uploadingDocument ? 'Uploading...' : 'Choose PDF/Word file'}
                      </p>
                    </label>
                  </>
                )}
              </div>

              {/* Authorized Agency Letter */}
              <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <FileText className="w-5 h-5 inline mr-2" />
                  Authorized Agency Letter
                </label>
                {formData.companyDetails.AuthorizedAgencyLetter ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Uploaded</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        companyDetails: { ...prev.companyDetails, AuthorizedAgencyLetter: '' }
                      }))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleDocumentUpload(e, 'AuthorizedAgencyLetter')}
                      className="hidden"
                      id="agencyLetter"
                    />
                    <label
                      htmlFor="agencyLetter"
                      className="block w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                    >
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-sm text-gray-600">
                        {uploadingDocument ? 'Uploading...' : 'Choose PDF/Word file'}
                      </p>
                    </label>
                  </>
                )}
              </div>

              {/* CNIC Pictures */}
              <div className="md:col-span-2 bg-gray-50 p-6 rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <CreditCard className="w-5 h-5 inline mr-2" />
                  CNIC Pictures (Front & Back)
                </label>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {formData.companyDetails.cnicPic.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`CNIC ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeCnicImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'cnicPic')}
                  className="hidden"
                  id="cnicPic"
                />
                <label
                  htmlFor="cnicPic"
                  className="block w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                >
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">
                    {uploadingImage ? 'Uploading...' : 'Click to add CNIC image'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 5MB)</p>
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-green-100">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Step 3: Contact Persons & Bank Details</h2>
            </div>

            {/* Authorized Contact Persons */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Authorized Contact Persons</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="fullName"
                  value={contactPerson.fullName}
                  onChange={handleContactPersonInput}
                  placeholder="Full Name *"
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <input
                  type="text"
                  name="Designation"
                  value={contactPerson.Designation}
                  onChange={handleContactPersonInput}
                  placeholder="Designation"
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={contactPerson.phoneNumber}
                  onChange={handleContactPersonInput}
                  placeholder="Phone Number *"
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <input
                  type="email"
                  name="email"
                  value={contactPerson.email}
                  onChange={handleContactPersonInput}
                  placeholder="Email"
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <input
                  type="text"
                  name="OfficeAddress"
                  value={contactPerson.OfficeAddress}
                  onChange={handleContactPersonInput}
                  placeholder="Office Address"
                  className="md:col-span-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                type="button"
                onClick={addContactPerson}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
              >
                Add Contact Person
              </button>

              {formData.companyDetails.AuthorizedContactPerson.length > 0 && (
                <div className="mt-4 space-y-3">
                  {formData.companyDetails.AuthorizedContactPerson.map((person, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-900">{person.fullName}</p>
                        <p className="text-sm text-gray-600">{person.Designation} • {person.phoneNumber}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeContactPerson(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bank Account Information */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Bank Account Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  name="accountNumber"
                  value={bankAccount.accountNumber}
                  onChange={handleBankAccountInput}
                  placeholder="Account Number *"
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <input
                  type="text"
                  name="accountName"
                  value={bankAccount.accountName}
                  onChange={handleBankAccountInput}
                  placeholder="Account Name *"
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <input
                  type="text"
                  name="bankName"
                  value={bankAccount.bankName}
                  onChange={handleBankAccountInput}
                  placeholder="Bank Name *"
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                type="button"
                onClick={addBankAccount}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
              >
                Add Bank Account
              </button>

              {formData.BankAccountinfo.length > 0 && (
                <div className="mt-4 space-y-3">
                  {formData.BankAccountinfo.map((account, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-900">{account.bankName}</p>
                        <p className="text-sm text-gray-600">{account.accountName} • {account.accountNumber}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBankAccount(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Commission Settings */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Commission Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Commission Type
                  </label>
                  <select
                    name="CommissionType"
                    value={formData.companyDetails.CommissionType}
                    onChange={handleInput}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Commission Type</option>
                    {commissionTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Commission Lock Period (Days)
                  </label>
                  <input
                    type="text"
                    name="CommissionLock"
                    value={formData.companyDetails.CommissionLock}
                    onChange={handleInput}
                    placeholder="e.g., 30 days"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-100">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Step 4: Authorization & Declaration</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 font-medium mb-4">
                Please review and accept the following declarations:
              </p>

              {formData.companyDetails.AuthorizationDeclaration.map((declaration, index) => (
                <label
                  key={index}
                  className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-red-400 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={declaration.isTrue}
                    onChange={() => handleDeclarationToggle(index)}
                    className="mt-1"
                  />
                  <span className="text-sm font-medium text-gray-900">{declaration.text}</span>
                </label>
              ))}

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> By completing this profile, you agree to provide accurate information. 
                  Madadgaar reserves the right to verify all submitted documents and information.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-blue-100 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Complete Your Profile</h1>
              <p className="text-gray-600">Please provide your company details to continue</p>
            </div>
            {userData?.companyDetails?.RegisteredCompanyName && (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
              >
                Skip for Now
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            {[...Array(totalSteps)].map((_, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                  currentStep > index + 1 ? 'bg-green-500 text-white' :
                  currentStep === index + 1 ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > index + 1 ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Company Info</span>
            <span>Documents</span>
            <span>Contacts & Bank</span>
            <span>Declaration</span>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-6">
            {message}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {loading ? 'Submitting...' : 'Complete Profile'}
                <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;

