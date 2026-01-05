import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Building2, Package, DollarSign, Shield, Users, FileText, Upload, Image as ImageIcon, X } from 'lucide-react';
import apiUrl from '../../constants/apiUrl';
import Navbar from '../../components/Navbar';
import { PageLoader } from '../../components/Loader';

const EditLoan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const totalSteps = 5;

  const [formData, setFormData] = useState({
    productName: '',
    bankName: '',
    planImage: '',
    majorCategory: '',
    subCategory: '',
    minFinancingAmount: '',
    maxFinancingAmount: '',
    minTenure: '',
    maxTenure: '',
    tenureUnit: 'Months',
    financingType: '',
    indicativeRate: '',
    rateType: '',
    eligibility: {
      minAge: '',
      maxAge: '',
      minIncome: '',
      employmentType: [],
      requiredDocuments: []
    },
    targetAudience: [],
    description: '',
    planDocument: ''
  });

  const [documentInput, setDocumentInput] = useState('');

  const majorCategories = [
    'Home / Real Estate Financing',
    'Auto Financing',
    'Personal Financing',
    'Business / SME Financing',
    'Other / Specialized Financing',
    'Installment / Buy-Now-Pay-Later Plans',
    'Shariah-Compliant / Islamic Plans'
  ];

  const subCategories = {
    'Home / Real Estate Financing': ['Home Purchase', 'Construction Loan', 'Renovation / Extension Loan', 'Plot Purchase'],
    'Auto Financing': ['Car (New / Used)', 'Motorcycle / Scooter', 'Commercial Vehicle / Truck', 'Auto Lease / Ijarah'],
    'Personal Financing': ['Education Loan', 'Medical / Health Expenses', 'Wedding / Family Events', 'Travel / Holiday Loan', 'Emergency / Personal Needs'],
    'Business / SME Financing': ['Working Capital', 'Equipment / Machinery Purchase', 'Expansion / New Project', 'Trade / Import / Export Finance'],
    'Other / Specialized Financing': ['Agriculture / Farming Loans', 'Gold / Jewelry Financing', 'Electronics / Appliances Purchase', 'Debt Consolidation / Balance Transfer'],
    'Installment / Buy-Now-Pay-Later Plans': ['Consumer Goods Installments', 'Furniture / Home Appliances', 'Mobile / Electronics Installments'],
    'Shariah-Compliant / Islamic Plans': ['Islamic Home Financing (Murabaha / Musharakah)', 'Islamic Auto Financing (Ijarah / Murabaha)', 'Islamic Business Financing']
  };

  const employmentTypes = ['Salaried', 'Business', 'Self-Employed'];
  const targetAudienceOptions = ['Salaried Individuals', 'Business Owners', 'SME / Entrepreneurs', 'Students', 'Other'];

  useEffect(() => {
    fetchLoanData();
  }, [id]);

  const fetchLoanData = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${apiUrl}/getAllLoans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success && data.loans) {
        const loan = data.loans.find(l => l._id === id);
        if (loan) {
          setFormData({
            productName: loan.productName || '',
            bankName: loan.bankName || '',
            planImage: loan.planImage || '',
            majorCategory: loan.majorCategory || '',
            subCategory: loan.subCategory || '',
            minFinancingAmount: loan.minFinancingAmount || '',
            maxFinancingAmount: loan.maxFinancingAmount || '',
            minTenure: loan.minTenure || '',
            maxTenure: loan.maxTenure || '',
            tenureUnit: loan.tenureUnit || 'Months',
            financingType: loan.financingType || '',
            indicativeRate: loan.indicativeRate || '',
            rateType: loan.rateType || '',
            eligibility: {
              minAge: loan.eligibility?.minAge || '',
              maxAge: loan.eligibility?.maxAge || '',
              minIncome: loan.eligibility?.minIncome || '',
              employmentType: loan.eligibility?.employmentType || [],
              requiredDocuments: loan.eligibility?.requiredDocuments || []
            },
            targetAudience: loan.targetAudience || [],
            description: loan.description || '',
            planDocument: loan.planDocument || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching loan:', error);
      setError('Failed to load loan data');
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEligibilityInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      eligibility: { ...prev.eligibility, [name]: value }
    }));
  };

  const handleEmploymentTypeToggle = (type) => {
    setFormData(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        employmentType: prev.eligibility.employmentType.includes(type)
          ? prev.eligibility.employmentType.filter(t => t !== type)
          : [...prev.eligibility.employmentType, type]
      }
    }));
  };

  const handleTargetAudienceToggle = (audience) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.includes(audience)
        ? prev.targetAudience.filter(a => a !== audience)
        : [...prev.targetAudience, audience]
    }));
  };

  const addDocument = () => {
    if (documentInput.trim()) {
      setFormData(prev => ({
        ...prev,
        eligibility: {
          ...prev.eligibility,
          requiredDocuments: [...prev.eligibility.requiredDocuments, documentInput.trim()]
        }
      }));
      setDocumentInput('');
    }
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        requiredDocuments: prev.eligibility.requiredDocuments.filter((_, i) => i !== index)
      }
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should not exceed 5MB');
      return;
    }

    setUploadingImage(true);
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
      if (data.success && data.imageUrl) {
        setFormData(prev => ({ ...prev, planImage: data.imageUrl }));
      } else {
        setError('Failed to upload image');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDocument(true);
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
      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, planDocument: data.url }));
      } else {
        setError('Failed to upload document');
      }
    } catch (err) {
      console.error('Document upload error:', err);
      setError('Failed to upload document');
    } finally {
      setUploadingDocument(false);
    }
  };

  const nextStep = () => {
    setError(null);
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepContent = () => {
    // Same as CreateLoan - copy the renderStepContent function from CreateLoan
    return null; // Placeholder - will be filled with actual steps
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setMessage(null);

    // Validation
    if (!formData.productName || !formData.bankName || !formData.majorCategory) {
      setError('Please fill in all required fields (Product Name, Bank Name, Major Category)');
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${apiUrl}/updateLoan/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage('Loan plan updated successfully!');
        setTimeout(() => {
          navigate('/loans');
        }, 2000);
      } else {
        setError(result.message || 'Failed to update loan plan');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader text="Loading loan data..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-blue-100 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Edit Loan Plan</h1>
              <p className="text-gray-600">Update financing plan details</p>
            </div>
            <button
              onClick={() => navigate('/loans')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to List
            </button>
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
        <div className="space-y-6">
          
          {/* 1. Plan Identification */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-100">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">1. Plan Identification</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInput}
                  placeholder="e.g., Auto Ijarah, Home Loan, Personal Finance"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bank / Financial Partner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInput}
                  placeholder="e.g., Meezan Bank, Bank Alfalah"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Upload Plan Image / Photo (JPG, PNG, Max 5MB)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-all">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="planImageUpload"
                  />
                  <label htmlFor="planImageUpload" className="cursor-pointer flex flex-col items-center">
                    {formData.planImage ? (
                      <div className="relative">
                        <img src={formData.planImage} alt="Plan" className="w-32 h-32 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setFormData(prev => ({ ...prev, planImage: '' }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-700">
                          {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Product Category */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-purple-100">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">2. Product Category</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Major Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="majorCategory"
                  value={formData.majorCategory}
                  onChange={handleInput}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Major Category</option>
                  {majorCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {formData.majorCategory && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInput}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Subcategory</option>
                    {subCategories[formData.majorCategory]?.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* 3. Financing Amount & 4. Tenure */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-green-100">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">3. Financing Amount & 4. Tenure</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Financing Amount (PKR)
                </label>
                <input
                  type="number"
                  name="minFinancingAmount"
                  value={formData.minFinancingAmount}
                  onChange={handleInput}
                  placeholder="e.g., 100000"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Financing Amount (PKR)
                </label>
                <input
                  type="number"
                  name="maxFinancingAmount"
                  value={formData.maxFinancingAmount}
                  onChange={handleInput}
                  placeholder="e.g., 5000000"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Tenure
                </label>
                <input
                  type="number"
                  name="minTenure"
                  value={formData.minTenure}
                  onChange={handleInput}
                  placeholder="e.g., 12"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Tenure
                </label>
                <input
                  type="number"
                  name="maxTenure"
                  value={formData.maxTenure}
                  onChange={handleInput}
                  placeholder="e.g., 60"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tenure Unit
                </label>
                <select
                  name="tenureUnit"
                  value={formData.tenureUnit}
                  onChange={handleInput}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="Months">Months</option>
                  <option value="Years">Years</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. Financing Type & 6. Interest/Profit Rate */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-100">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">5. Financing Type & 6. Interest/Profit Rate</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Financing Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-orange-400 transition-all">
                    <input
                      type="radio"
                      name="financingType"
                      value="Conventional"
                      checked={formData.financingType === 'Conventional'}
                      onChange={handleInput}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Conventional</p>
                      <p className="text-sm text-gray-600">Standard bank loan with interest; payments include principal + interest</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-orange-400 transition-all">
                    <input
                      type="radio"
                      name="financingType"
                      value="Islamic"
                      checked={formData.financingType === 'Islamic'}
                      onChange={handleInput}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Islamic</p>
                      <p className="text-sm text-gray-600">Shariah-compliant loan; no interest (Riba); based on trade, lease, or partnership</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Indicative Rate (% per annum)
                </label>
                <input
                  type="text"
                  name="indicativeRate"
                  value={formData.indicativeRate}
                  onChange={handleInput}
                  placeholder="e.g., 8% - 12%"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rate Type
                </label>
                <select
                  name="rateType"
                  value={formData.rateType}
                  onChange={handleInput}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Rate Type</option>
                  <option value="Fixed">Fixed - Payment stays the same</option>
                  <option value="Variable">Variable - Payment may change based on bank rate</option>
                  <option value="Floating">Floating - Payment changes according to market benchmark</option>
                </select>
              </div>
            </div>
          </div>

          {/* 7. Eligibility Criteria */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-100">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">7. Eligibility Criteria</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Age
                </label>
                <input
                  type="number"
                  name="minAge"
                  value={formData.eligibility.minAge}
                  onChange={handleEligibilityInput}
                  placeholder="e.g., 21"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Age
                </label>
                <input
                  type="number"
                  name="maxAge"
                  value={formData.eligibility.maxAge}
                  onChange={handleEligibilityInput}
                  placeholder="e.g., 60"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Income (PKR / month)
                </label>
                <input
                  type="number"
                  name="minIncome"
                  value={formData.eligibility.minIncome}
                  onChange={handleEligibilityInput}
                  placeholder="e.g., 30000"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Employment Type
                </label>
                <div className="flex flex-wrap gap-3">
                  {employmentTypes.map(type => (
                    <label key={type} className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-red-400 transition-all">
                      <input
                        type="checkbox"
                        checked={formData.eligibility.employmentType.includes(type)}
                        onChange={() => handleEmploymentTypeToggle(type)}
                      />
                      <span className="text-sm font-medium text-gray-900">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Required Documents (e.g., CNIC, Salary Slip, Bank Statement, Property Papers)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={documentInput}
                    onChange={(e) => setDocumentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDocument())}
                    placeholder="Enter document name and press Enter"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={addDocument}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
                  >
                    Add
                  </button>
                </div>
                {formData.eligibility.requiredDocuments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.eligibility.requiredDocuments.map((doc, index) => (
                      <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        {doc}
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="hover:text-red-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 8. Target Audience */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-indigo-100">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">8. Target Audience</h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {targetAudienceOptions.map(audience => (
                <label key={audience} className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-indigo-400 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.targetAudience.includes(audience)}
                    onChange={() => handleTargetAudienceToggle(audience)}
                  />
                  <span className="text-sm font-medium text-gray-900">{audience}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 9. Description & 10. Upload Document */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-teal-100">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">9. Description & 10. Upload Document</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Optional Notes / Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInput}
                  rows="4"
                  placeholder="Additional plan details, special features, offers, or restrictions"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Upload Plan Document (PDF / Word)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-teal-400 transition-all">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="planDocumentUpload"
                  />
                  <label htmlFor="planDocumentUpload" className="cursor-pointer flex flex-col items-center">
                    {formData.planDocument ? (
                      <div className="flex items-center gap-3">
                        <Upload className="w-8 h-8 text-green-600" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">Document uploaded</p>
                          <p className="text-xs text-gray-500">{formData.planDocument.split('/').pop()}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setFormData(prev => ({ ...prev, planDocument: '' }));
                          }}
                          className="ml-4 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-700">
                          {uploadingDocument ? 'Uploading...' : 'Click to upload document'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PDF or Word document</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={() => navigate('/loans')}
              className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {submitting ? 'Updating Loan Plan...' : 'Update Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLoan;
