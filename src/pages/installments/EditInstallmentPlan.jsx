import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Upload, 
  X,
  Package,
  Image as ImageIcon,
  Calculator
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import baseApi from '../../constants/apiUrl';
import { CATEGORY_SPECIFICATIONS, getGroupedCategories } from '../../constants/productCategories';
import {
  DEFAULT_INSTALLMENT_PLAN,
  getVariantEffectivePrice,
  deriveProductPrice,
  mapInstallmentPlanToForm,
  submitInstallmentPlanUpdate,
  deletePartnerPaymentPlanApi,
} from '../../utils/installmentPartnerPlans';
import {
  PartnerStep4Tabs,
  ProductFinancePanel,
  PlanFinanceSection,
  AddPlanButton,
} from '../../components/installment/InstallmentFinanceUI';

const defaultPlan = DEFAULT_INSTALLMENT_PLAN;

const EditInstallmentPlan = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [localImages, setLocalImages] = useState([]);
  const [isAttachedProduct, setIsAttachedProduct] = useState(false);
  const [step4Tab, setStep4Tab] = useState('installments');

  const [form, setForm] = useState({
    userId: "",
    productName: "",
    city: "",
    price: "",
    partnerBasePrice: "",
    downpayment: "",
    installment: "",
    tenure: "",
    customTenure: "",
    postedBy: "Partner",
    videoUrl: "",
    description: "",
    companyName: "",
    companyNameOther: "",
    category: "",
    customCategory: "",
    status: "pending",
    productImages: [],
    paymentPlans: [{ ...defaultPlan }],
    productSpecifications: {
      category: "",
      subCategory: "",
      specifications: [],
    },
    variants: [],
    finance: { bankName: "", financeInfo: "" },
  });

  // Load userId from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        if (parsedData.userId) {
          setForm(prev => ({ ...prev, userId: parsedData.userId }));
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Fetch existing installment plan data
  useEffect(() => {
    const fetchInstallmentPlan = async () => {
      try {
        setFetchLoading(true);
        const token = localStorage.getItem('userToken');
        const partnerUserId = JSON.parse(localStorage.getItem('userData') || '{}')?.userId;

        const response = await fetch(`${baseApi}/getPartnerInstallment/${encodeURIComponent(id)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          }
        });

        const data = await response.json();
        
        if (data.success) {
          const plan = data.data;
          if (plan) {
            const mapped = mapInstallmentPlanToForm(plan, partnerUserId);
            const { _meta, ...formData } = mapped;
            setIsAttachedProduct(_meta.attached);
            setForm((prev) => ({ ...prev, ...formData }));
          } else {
            setError('Installment plan not found');
          }
        } else {
          setError(data.message || 'Failed to fetch installment plan');
        }
      } catch (err) {
        console.error('Error fetching plan:', err);
        setError('Failed to load installment plan');
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchInstallmentPlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!fetchLoading && form.paymentPlans?.length) {
      form.paymentPlans.forEach((_, idx) => recalcPlan(idx));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchLoading]);

  // Helper to update nested path safely
  const updateForm = (path, value) => {
    if (!path.includes('.')) {
      setForm(prev => ({ ...prev, [path]: value }));
      return;
    }
    const parts = path.split('.');
    setForm(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      let cur = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        if (cur[parts[i]] === undefined) cur[parts[i]] = {};
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  // Handle category change and initialize specifications
  const handleCategoryChange = (category) => {
    const specs = CATEGORY_SPECIFICATIONS[category] || [];
    const initializedSpecs = specs.map(spec => ({
      field: spec.field,
      value: ''
    }));

    setForm(prev => ({
      ...prev,
      category: category,
      productSpecifications: {
        category: category,
        subCategory: "",
        specifications: initializedSpecs
      }
    }));
  };

  // Update a specific specification value
  const updateSpecification = (fieldName, value) => {
    setForm(prev => {
      const updatedSpecs = prev.productSpecifications.specifications.map(spec =>
        spec.field === fieldName ? { ...spec, value } : spec
      );
      return {
        ...prev,
        productSpecifications: {
          ...prev.productSpecifications,
          specifications: updatedSpecs
        }
      };
    });
  };

  // Get specification value
  const getSpecValue = (fieldName) => {
    const spec = form.productSpecifications.specifications.find(s => s.field === fieldName);
    return spec ? spec.value : '';
  };

  // --- Calculation Logic ---
  const amortizedMonthlyPayment = (principal, annualInterestPercent, months) => {
    if (!months || months <= 0) return 0;
    const r = Number(annualInterestPercent) / 100 / 12;
    if (!r) return principal / months;
    const monthly = (principal * r) / (1 - Math.pow(1 + r, -months));
    return monthly;
  };

  const recalcPlan = (index) => {
    setForm(f => {
      if (!f.paymentPlans || !f.paymentPlans[index]) return f;
      const pp = [...f.paymentPlans];
      const p = { ...pp[index] };

      let cashPrice = 0;
      if (p.variantIndex !== undefined && p.variantIndex !== null && p.variantIndex !== -1 && f.variants?.[p.variantIndex]) {
        cashPrice = getVariantEffectivePrice(f.variants[p.variantIndex]);
      } else {
        cashPrice = deriveProductPrice(f.variants, f.price);
      }

      const downPayment = Number(p.downPayment) || 0;
      const financedAmount = Math.max(0, cashPrice - downPayment);
      const months = parseInt(p.tenureMonths) || 0;
      const isIslamic = p.interestType === "Profit-Based (Islamic/Shariah)";
      const isReducing = p.interestType === "Reducing Balance";

      let monthly = 0;
      let totalPayable = 0;
      let totalMarkup = 0;
      let rate = Number(p.interestRatePercent) || 0;

      if (isIslamic) {
        totalMarkup = Number(p.markup) || 0;
        rate = cashPrice > 0 ? (totalMarkup / cashPrice) * 100 : 0;
        totalPayable = financedAmount + totalMarkup;
        monthly = months > 0 ? totalPayable / months : 0;
      } else if (isReducing) {
        monthly = amortizedMonthlyPayment(financedAmount, rate, months);
        totalPayable = monthly * months;
        totalMarkup = Math.max(0, totalPayable - financedAmount);
      } else {
        totalMarkup = financedAmount * (rate / 100) * (months / 12);
        totalPayable = financedAmount + totalMarkup;
        monthly = months > 0 ? totalPayable / months : 0;
      }

      const totalCostToCustomer = cashPrice + totalMarkup;

      pp[index] = {
        ...p,
        interestRatePercent: Number(rate.toFixed(2)),
        markup: Number(totalMarkup.toFixed(2)),
        monthlyInstallment: Number(monthly.toFixed(2)),
        installmentPrice: Number(totalPayable.toFixed(2)),
        totalInterest: Number(totalMarkup.toFixed(2)),
        totalCostToCustomer: Number(totalCostToCustomer.toFixed(2)),
      };

      return { ...f, paymentPlans: pp };
    });
  };

  useEffect(() => {
    if (form.paymentPlans.length) {
      form.paymentPlans.forEach((_, idx) => recalcPlan(idx));
    }
    // eslint-disable-next-line
  }, [form.price, form.variants]);

  // --- Image Handling ---
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setLocalImages(prev => [...prev, ...files]);
  };

  const uploadSingleFile = async (file) => {
    const token = localStorage.getItem('userToken');
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch(`${baseApi}/upload-image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    const body = await res.json();
    return body.imageUrl || body.url || body.data?.url || body.data;
  };

  const handleUploadAll = async () => {
    if (!localImages.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of localImages) {
        const u = await uploadSingleFile(file);
        urls.push(u);
      }
      setForm(f => ({ ...f, productImages: [...f.productImages, ...urls] }));
      setLocalImages([]);
      setMessage("Images uploaded successfully!");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('userToken');
      const partnerUserId = form.userId || JSON.parse(localStorage.getItem('userData') || '{}')?.userId;

      await submitInstallmentPlanUpdate({
        installmentId: id,
        form,
        editorUserId: partnerUserId,
        isAttachedProduct,
        baseApi,
        token,
      });

      setMessage("Installment plan updated successfully!");
      setTimeout(() => navigate('/installments'), 2000);
    } catch (err) {
      setError(err?.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showVariantSection = Boolean(form.category);
  const fieldsLocked = isAttachedProduct;
  const isStepValid = () => {
    if (step === 1) return form.productName && form.city && form.category;
    if (step === 3 && !fieldsLocked) return form.productImages.length > 0;
    if (step === 4) {
      if (!form.paymentPlans.length) return false;
      if (showVariantSection && !fieldsLocked) {
        if (form.variants.length === 0) return false;
        if (form.variants.some((v) => !v.variantName || !Number(v.price))) return false;
      }
      if (showVariantSection && fieldsLocked) {
        const planVariantIdxs = form.paymentPlans
          .map((p) => p.variantIndex)
          .filter((ix) => ix !== null && ix !== undefined && ix !== -1 && ix !== "");
        if (form.variants.length > 0 && planVariantIdxs.length > 0) {
          if (!planVariantIdxs.every((ix) => Number(form.variants[Number(ix)]?.price) > 0)) return false;
        } else if (form.variants.length > 0) {
          if (!form.variants.some((v) => Number(v.price) > 0)) return false;
        } else if (!Number(form.price)) {
          return false;
        }
      }
      if (!showVariantSection && !fieldsLocked && !Number(form.price)) return false;
      if (!showVariantSection && fieldsLocked && !Number(form.price)) return false;
      return form.paymentPlans.every((p) => p.planName && Number(p.installmentPrice) > 0);
    }
    return true;
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading installment plan...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/installments')}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 mb-4 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Installments
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Edit Installment Plan</h1>
          <p className="text-gray-600 mt-1">Update your installment plan details</p>
          {isAttachedProduct && (
            <p className="mt-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              Shared catalog product: you only see and edit <strong>your company&apos;s payment plans</strong> on this listing.
            </p>
          )}
        </div>

        {/* Progress Steps */}
        <div className="glass-red rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Basic Info' },
              { num: 2, label: 'Specifications' },
              { num: 3, label: 'Images' },
              { num: 4, label: 'Payment Plans' }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    step === s.num
                      ? 'bg-red-600 text-white shadow-lg scale-110'
                      : step > s.num
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.num ? <Check className="w-6 h-6" /> : s.num}
                  </div>
                  <span className={`text-xs font-semibold ${
                    step === s.num ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-1 mx-4 rounded ${
                    step > s.num ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium animate-in fade-in">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 font-medium animate-in fade-in">
            {error}
          </div>
        )}

        {/* Form Content */}
        <div className="glass-red rounded-xl shadow-lg p-8 mb-8">
          {/* Step 1: Basic Details */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-red-600 pl-4">
                Basic Product Details
              </h2>

              {fieldsLocked && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-blue-800 mb-2">Shared catalog product</h3>
                  <p className="text-sm text-blue-600">
                    Product details are from the main listing and cannot be changed here. Update your cash prices and payment plans in step 4.
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Partner ID"
                  value={form.userId}
                  onChange={() => {}}
                  placeholder="Loading..."
                  readOnly={true}
                />

                <InputField
                  label="Product Name *"
                  value={form.productName}
                  onChange={v => updateForm('productName', v)}
                  placeholder="Enter product name"
                  readOnly={fieldsLocked}
                />
                
                <InputField
                  label="City *"
                  value={form.city}
                  onChange={v => updateForm('city', v)}
                  placeholder="e.g., Lahore"
                  readOnly={fieldsLocked}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={e => handleCategoryChange(e.target.value)}
                    disabled={fieldsLocked}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">Select Category</option>
                    {Object.entries(getGroupedCategories()).map(([group, categories]) => (
                      <optgroup key={group} label={group}>
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <InputField
                  label="Company / Brand"
                  value={form.companyName}
                  onChange={v => updateForm('companyName', v)}
                  placeholder="e.g., Samsung"
                  readOnly={fieldsLocked}
                />

                <InputField
                  label="Video URL"
                  value={form.videoUrl}
                  onChange={v => updateForm('videoUrl', v)}
                  placeholder="https://..."
                  readOnly={fieldsLocked}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => updateForm('description', e.target.value)}
                  rows={4}
                  disabled={fieldsLocked}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Describe the product..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Technical Specifications */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-red-600 pl-4">
                Technical Specifications
              </h2>

              {!form.category || !CATEGORY_SPECIFICATIONS[form.category] ? (
                <div className="py-20 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">
                    {!form.category ? 'Please select a category in Step 1' : 'No specific technical specifications required for this category'}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {!form.category ? 'Go back to Step 1 and select a product category' : 'Skip to the next step to continue'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {CATEGORY_SPECIFICATIONS[form.category]?.map((spec, index) => (
                    <div key={index} className={spec.type === 'textarea' ? 'md:col-span-2 lg:col-span-3' : ''}>
                      {spec.type === 'text' || !spec.type ? (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {spec.field} {spec.required && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            value={getSpecValue(spec.field)}
                            onChange={e => updateSpecification(spec.field, e.target.value)}
                            placeholder={spec.placeholder || `Enter ${spec.field.toLowerCase()}`}
                            required={spec.required}
                            disabled={fieldsLocked}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500"
                          />
                        </div>
                      ) : spec.type === 'select' ? (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {spec.field} {spec.required && <span className="text-red-500">*</span>}
                          </label>
                          <select
                            value={getSpecValue(spec.field)}
                            onChange={e => updateSpecification(spec.field, e.target.value)}
                            required={spec.required}
                            disabled={fieldsLocked}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                          >
                            <option value="">Select {spec.field}</option>
                            {spec.options?.map((option, i) => (
                              <option key={i} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      ) : spec.type === 'textarea' ? (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {spec.field} {spec.required && <span className="text-red-500">*</span>}
                          </label>
                          <textarea
                            value={getSpecValue(spec.field)}
                            onChange={e => updateSpecification(spec.field, e.target.value)}
                            placeholder={spec.placeholder || `Enter ${spec.field.toLowerCase()}`}
                            required={spec.required}
                            rows={3}
                            disabled={fieldsLocked}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none disabled:bg-gray-100 disabled:text-gray-500"
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Images */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-red-600 pl-4">
                Product Images
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Uploaded Images ({form.productImages.length})
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {form.productImages.map((url, i) => (
                      <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                        <img src={url} className="w-full h-full object-cover" alt="" />
                        {!fieldsLocked && (
                          <button
                            type="button"
                            onClick={() => updateForm('productImages', form.productImages.filter((_, idx) => idx !== i))}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {/* Local images preview */}
                    {localImages.map((file, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-blue-300 bg-blue-50">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-50" alt="" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    ))}

                    {!fieldsLocked && (
                      <label className="aspect-square rounded-lg border-4 border-dashed border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all flex flex-col items-center justify-center cursor-pointer group">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleFilesChange}
                        />
                        <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-red-600 transition-colors" />
                        <span className="text-xs font-medium text-gray-500 group-hover:text-red-600 mt-2">
                          Add Images
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Upload Panel */}
                {!fieldsLocked && (
                <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-8 flex flex-col justify-center items-center text-center space-y-6 text-white">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold">Upload Images</h3>
                  <p className="text-red-100 text-sm">
                    {localImages.length > 0
                      ? `${localImages.length} image${localImages.length > 1 ? 's' : ''} ready to upload`
                      : 'Select images to upload'}
                  </p>
                  <button
                    type="button"
                    disabled={!localImages.length || uploading}
                    onClick={handleUploadAll}
                    className="w-full py-3 bg-white text-red-600 rounded-lg font-bold hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : `Upload ${localImages.length || ''} Image${localImages.length !== 1 ? 's' : ''}`}
                  </button>
                </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Payment Plans */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-red-600 pl-4">
                  Variants & Payment Plans
                </h2>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Reference cash price</p>
                  <p className="text-xl font-bold text-red-600">
                    ₨ {deriveProductPrice(form.variants, form.price).toLocaleString()}
                  </p>
                </div>
              </div>

              <PartnerStep4Tabs active={step4Tab} onChange={setStep4Tab} />

              {(step4Tab === 'finance' || step4Tab === 'both') && (
                <ProductFinancePanel
                  finance={form.finance}
                  onUpdate={(field, value) => updateForm(`finance.${field}`, value)}
                />
              )}

              {(step4Tab === 'installments' || step4Tab === 'both') && (
              <>
              {showVariantSection && (
                <div className="space-y-4 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      {!fieldsLocked && (
                        <>
                          <h3 className="text-lg font-bold text-gray-800">Product Variants</h3>
                          <p className="text-sm text-gray-600 mt-1">Add variant options with cash price and optional discount (% off cash price).</p>
                        </>
                      )}
                    </div>
                    {!fieldsLocked && (
                      <button type="button" onClick={() => setForm(f => ({ ...f, variants: [...f.variants, { variantName: "", price: "", discountPercent: 0, status: "active" }] }))} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ Add Variant</button>
                    )}
                  </div>
                  {form.variants.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center">{fieldsLocked ? "This product has no variants. Use your cash price below." : "Add at least one variant before creating payment plans."}</p>
                  ) : (
                    <div className="space-y-4">
                      {form.variants.map((variant, vIdx) => (
                        <div key={vIdx} className="p-4 bg-white border border-gray-200 rounded-xl relative">
                          {!fieldsLocked && (
                            <button type="button" onClick={() => setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== vIdx) }))} className="absolute top-3 right-3 text-gray-400 hover:text-red-600"><X className="w-5 h-5" /></button>
                          )}
                          {fieldsLocked ? (
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <span className="text-xs font-medium text-gray-500">Product variant (from listing — not editable)</span>
                                <p className="text-base font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 cursor-default">{variant.variantName || `Variant ${vIdx + 1}`}</p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Your Cash Price (₨) *" type="number" value={variant.price} onChange={v => { const nv = [...form.variants]; nv[vIdx].price = v; setForm(f => ({ ...f, variants: nv })); }} />
                                <InputField label="Your Discount (%)" type="number" value={variant.discountPercent ?? ""} onChange={v => { const nv = [...form.variants]; nv[vIdx].discountPercent = v; setForm(f => ({ ...f, variants: nv })); }} placeholder="0" />
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4 pr-8">
                              <InputField label="Variant Name *" value={variant.variantName} onChange={v => { const nv = [...form.variants]; nv[vIdx].variantName = v; setForm(f => ({ ...f, variants: nv })); }} placeholder="e.g. 12GB / 256GB" />
                              <InputField label="Cash Price (₨) *" type="number" value={variant.price} onChange={v => { const nv = [...form.variants]; nv[vIdx].price = v; setForm(f => ({ ...f, variants: nv })); }} />
                              <InputField label="Discount (%)" type="number" value={variant.discountPercent ?? ""} onChange={v => { const nv = [...form.variants]; nv[vIdx].discountPercent = v; setForm(f => ({ ...f, variants: nv })); }} placeholder="0" />
                              <div className="flex flex-col justify-end">
                                <span className="text-xs text-gray-500">Effective cash price</span>
                                <span className="text-lg font-bold text-red-600">₨ {getVariantEffectivePrice(variant).toLocaleString()}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!showVariantSection && (
                <InputField label={fieldsLocked ? "Your Cash Price (₨)" : "Cash Price (₨) *"} type="number" value={form.price} onChange={v => updateForm('price', v)} placeholder="Cash price for installment calculations" />
              )}

              <div className="space-y-6">
                {form.paymentPlans.map((p, idx) => (
                  <PaymentPlanCard
                    key={p._id || idx}
                    plan={p}
                    index={idx}
                    form={form}
                    setForm={setForm}
                    recalcPlan={recalcPlan}
                    canRemove={form.paymentPlans.length > 1}
                    fieldsLocked={fieldsLocked}
                    productId={id}
                  />
                ))}
                <AddPlanButton
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      paymentPlans: [...f.paymentPlans, { ...defaultPlan }],
                    }))
                  }
                  className="mt-2"
                />
              </div>
              </>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-0 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          
          <div className="flex gap-4">
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                disabled={!isStepValid()}
                className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !isStepValid()}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Installment Plan'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Input Field Component
const InputField = ({ label, value, onChange, type = "text", placeholder = "", readOnly = false }) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${
        readOnly ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'bg-white'
      }`}
    />
  </div>
);

// Payment Plan Card Component
const PaymentPlanCard = ({
  plan,
  index,
  form,
  setForm,
  recalcPlan,
  canRemove,
  fieldsLocked,
  productId,
}) => {
  const updatePlan = (field, value) => {
    const pp = [...form.paymentPlans];
    pp[index][field] = value;
    setForm(f => ({ ...f, paymentPlans: pp }));
    setTimeout(() => recalcPlan(index), 0);
  };

  const handleRemove = async () => {
    if (!window.confirm('Remove this payment plan?')) return;
    if (plan._id && productId) {
      try {
        await deletePartnerPaymentPlanApi(productId, plan._id);
      } catch (e) {
        alert(e.message || 'Failed to delete plan');
        return;
      }
    }
    setForm((f) => ({
      ...f,
      paymentPlans: f.paymentPlans.filter((_, i) => i !== index),
    }));
  };

  const planCashPrice =
    plan.variantIndex !== null && plan.variantIndex !== undefined && form.variants[plan.variantIndex]
      ? getVariantEffectivePrice(form.variants[plan.variantIndex])
      : deriveProductPrice(form.variants, form.price);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-200 relative">
      {canRemove && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete this payment plan only"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {form.variants.length > 0 && (
        <div className="md:col-span-1 space-y-2">
          <label className="block text-sm font-medium text-gray-700">Applies To Variant</label>
          <select 
            value={plan.variantIndex ?? -1} 
            onChange={e => {
              const pp = [...form.paymentPlans];
              pp[index].variantIndex = e.target.value === "-1" ? null : parseInt(e.target.value);
              setForm(f => ({ ...f, paymentPlans: pp }));
              setTimeout(() => recalcPlan(index), 0);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white text-sm"
          >
            <option value="-1">{fieldsLocked && form.variants.length > 0 ? "— Select variant —" : "Standard (no variant)"}</option>
            {form.variants.map((v, vIdx) => (
              <option key={vIdx} value={vIdx}>{v.variantName} (₨ {getVariantEffectivePrice(v).toLocaleString()})</option>
            ))}
          </select>
        </div>
        )}

        <InputField
          label="Plan Name"
          value={plan.planName}
          onChange={v => updatePlan('planName', v)}
          placeholder="e.g., 12-Month Plan"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Interest Type</label>
          <select
            value={plan.interestType}
            onChange={e => updatePlan('interestType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          >
            <option>Flat Rate</option>
            <option>Reducing Balance</option>
            <option>Profit-Based (Islamic/Shariah)</option>
          </select>
        </div>

        <InputField
          label="Tenure (Months)"
          type="number"
          value={plan.tenureMonths}
          onChange={v => updatePlan('tenureMonths', v)}
        />

        <InputField
          label="Down Payment (₨)"
          type="number"
          value={plan.downPayment}
          onChange={v => updatePlan('downPayment', v)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {plan.interestType === "Profit-Based (Islamic/Shariah)" ? (
          <>
            <InputField
              label="Total Markup (₨)"
              type="number"
              value={plan.markup}
              onChange={v => updatePlan('markup', v)}
            />
            <InputField
              label="Markup Rate (%) - Auto"
              type="number"
              value={plan.interestRatePercent}
              readOnly
            />
          </>
        ) : (
          <>
            <InputField
              label="Interest Rate (%)"
              type="number"
              value={plan.interestRatePercent}
              onChange={v => updatePlan('interestRatePercent', v)}
            />
            <InputField
              label="Total Markup (₨) - Auto"
              type="number"
              value={plan.markup}
              readOnly
            />
          </>
        )}
      </div>

      <PlanFinanceSection plan={plan} index={index} setForm={setForm} />

      {/* Summary */}
      <div className="bg-white rounded-xl p-4 border-2 border-red-100">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-red-600" />
          <h4 className="font-bold text-gray-800">Calculation Summary</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <SummaryItem label="Monthly (EMI)" value={plan.monthlyInstallment} highlight />
          <SummaryItem label="Total Markup" value={plan.markup} />
          <SummaryItem label="Total Payable" value={plan.installmentPrice} />
          <SummaryItem label="Customer Cost" value={plan.totalCostToCustomer} highlight />
          <SummaryItem label="Financed Amount" value={Math.max(0, planCashPrice - (plan.downPayment || 0))} />
        </div>
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value, highlight }) => (
  <div className="text-center">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className={`text-lg font-bold ${highlight ? 'text-red-600' : 'text-gray-800'}`}>
      ₨ {Number(value || 0).toLocaleString()}
    </p>
  </div>
);

export default EditInstallmentPlan;

