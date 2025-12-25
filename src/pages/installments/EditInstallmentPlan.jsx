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

const defaultPlan = {
  planName: "",
  installmentPrice: 0,
  downPayment: 0,
  monthlyInstallment: 0,
  tenureMonths: 12,
  interestRatePercent: 0,
  interestType: "Flat Rate",
  markup: 0,
  otherChargesNote: "",
};

const CATEGORY_OPTIONS = [
  { value: "", label: "Select category" },
  { value: "phones", label: "Phones / Mobile" },
  { value: "bikes_mechanical", label: "Bikes — Mechanical" },
  { value: "bikes_electric", label: "Bikes — Electric" },
  { value: "air_conditioner", label: "Air Conditioner" },
  { value: "appliances", label: "Home Appliances / Other" },
  { value: "other", label: "Other (custom)" },
];

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

  const [form, setForm] = useState({
    userId: "",
    productName: "",
    city: "",
    price: "",
    downpayment: "",
    videoUrl: "",
    description: "",
    companyName: "",
    companyNameOther: "",
    category: "",
    customCategory: "",
    status: "pending",
    productImages: [],
    paymentPlans: [{ ...defaultPlan }],

    generalFeatures: { operatingSystem: "", simSupport: "", phoneDimensions: "", phoneWeight: "", colors: "" },
    performance: { processor: "", gpu: "" },
    display: { screenSize: "", screenResolution: "", technology: "", protection: "" },
    battery: { type: "" },
    camera: { frontCamera: "", backCamera: "", features: "" },
    memory: { internalMemory: "", ram: "", cardSlot: "" },
    connectivity: { data: "", nfc: "", bluetooth: "", infrared: "" },

    airConditioner: {
      brand: "", model: "", color: "", capacityInTon: "", type: "", energyEfficient: "",
      display: "", indoorDimension: "", outdoorDimension: "", indoorWeightKg: "",
      outdoorWeightKg: "", powerSupply: "", otherFeatures: "", warranty: "",
    },

    electricalBike: {
      model: "", dimensions: "", weight: "", speed: "", batterySpec: "", chargingTime: "",
      brakes: "", warranty: "", transmission: "", rangeKm: "", groundClearance: "",
      starting: "", motor: "", controllers: "", electricityConsumption: "", recommendedLoadCapacity: "",
      wheelBase: "", shocks: "", tyreFront: "", tyreBack: "", otherFeatures: "", colors: "",
    },

    mechanicalBike: {
      generalFeatures: { model: "", dimensions: "", weight: "", engine: "", colors: "", other: "" },
      performance: { transmission: "", groundClearance: "", starting: "", displacement: "", petrolCapacity: "" },
      assembly: { compressionRatio: "", boreAndStroke: "", tyreAtFront: "", tyreAtBack: "", seatHeight: "" },
    },
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
        const response = await fetch(`${baseApi}/getAllCreateInstallnment`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (data.success) {
          const plan = data.data.find(p => p._id === id || p.installmentPlanId === id);
          if (plan) {
            setForm({
              ...form,
              productName: plan.productName || "",
              city: plan.city || "",
              price: plan.price || "",
              downpayment: plan.downpayment || "",
              videoUrl: plan.videoUrl || "",
              description: plan.description || "",
              companyName: plan.companyName || "",
              companyNameOther: plan.companyNameOther || "",
              category: plan.category || "",
              customCategory: plan.customCategory || "",
              status: plan.status || "pending",
              productImages: plan.productImages || [],
              paymentPlans: plan.paymentPlans?.length > 0 ? plan.paymentPlans : [{ ...defaultPlan }],
              generalFeatures: plan.generalFeatures || form.generalFeatures,
              performance: plan.performance || form.performance,
              display: plan.display || form.display,
              battery: plan.battery || form.battery,
              camera: plan.camera || form.camera,
              memory: plan.memory || form.memory,
              connectivity: plan.connectivity || form.connectivity,
              airConditioner: plan.airConditioner || form.airConditioner,
              electricalBike: plan.electricalBike || form.electricalBike,
              mechanicalBike: plan.mechanicalBike || form.mechanicalBike,
            });
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
    // eslint-disable-next-line
  }, [id]);

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

      const cashPrice = Number(f.price) || 0;
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
    if (form.paymentPlans.length && form.price) {
      form.paymentPlans.forEach((_, idx) => recalcPlan(idx));
    }
    // eslint-disable-next-line
  }, [form.price]);

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
      const res = await fetch(`${baseApi}/updateInstallment/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...form,
          category: form.category === "other" ? form.customCategory : form.category,
          price: Number(form.price),
          downpayment: Number(form.downpayment),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Installment plan updated successfully!");
        setTimeout(() => navigate('/installments'), 2000);
      } else {
        setError(data.message || "Failed to update plan.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) return form.productName && form.city && form.price && form.category;
    if (step === 3) return form.productImages.length > 0;
    if (step === 4) return form.paymentPlans.length > 0;
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="User ID"
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
                />
                
                <InputField
                  label="City *"
                  value={form.city}
                  onChange={v => updateForm('city', v)}
                  placeholder="e.g., Lahore"
                />

                <InputField
                  label="Base Price (PKR) *"
                  type="number"
                  value={form.price}
                  onChange={v => updateForm('price', v)}
                  placeholder="0"
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={e => updateForm('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  >
                    {CATEGORY_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {form.category === "other" && (
                    <InputField
                      value={form.customCategory}
                      onChange={v => updateForm('customCategory', v)}
                      placeholder="Specify category..."
                    />
                  )}
                </div>

                <InputField
                  label="Company / Brand"
                  value={form.companyName}
                  onChange={v => updateForm('companyName', v)}
                  placeholder="e.g., Samsung"
                />

                <InputField
                  label="Video URL"
                  value={form.videoUrl}
                  onChange={v => updateForm('videoUrl', v)}
                  placeholder="https://..."
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
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

              {form.category === "phones" && (
                <PhoneSpecs form={form} updateForm={updateForm} />
              )}

              {form.category === "bikes_mechanical" && (
                <MechanicalBikeSpecs form={form} updateForm={updateForm} />
              )}

              {form.category === "bikes_electric" && (
                <ElectricalBikeSpecs form={form} updateForm={updateForm} />
              )}

              {form.category === "air_conditioner" && (
                <AirConditionerSpecs form={form} updateForm={updateForm} />
              )}

              {(!form.category || form.category === "other" || form.category === "appliances") && (
                <div className="py-20 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">
                    No specific technical specifications required for this category
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Skip to the next step to continue
                  </p>
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
                        <button
                          type="button"
                          onClick={() => updateForm('productImages', form.productImages.filter((_, idx) => idx !== i))}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
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

                    {/* Add button */}
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
                  </div>
                </div>

                {/* Upload Panel */}
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
              </div>
            </div>
          )}

          {/* Step 4: Payment Plans */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-red-600 pl-4">
                  Payment Plans
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Product Price</p>
                    <p className="text-xl font-bold text-red-600">
                      ₨ {Number(form.price || 0).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, paymentPlans: [...f.paymentPlans, { ...defaultPlan }] }))}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    + Add Plan
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {form.paymentPlans.map((p, idx) => (
                  <PaymentPlanCard
                    key={idx}
                    plan={p}
                    index={idx}
                    form={form}
                    setForm={setForm}
                    recalcPlan={recalcPlan}
                    canRemove={form.paymentPlans.length > 1}
                  />
                ))}
              </div>
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

// Phone Specifications Component
const PhoneSpecs = ({ form, updateForm }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div className="col-span-full">
      <h3 className="text-lg font-semibold text-red-600 mb-4">General Features</h3>
    </div>
    <InputField label="Operating System" value={form.generalFeatures.operatingSystem} onChange={v => updateForm('generalFeatures.operatingSystem', v)} />
    <InputField label="SIM Support" value={form.generalFeatures.simSupport} onChange={v => updateForm('generalFeatures.simSupport', v)} />
    <InputField label="Dimensions" value={form.generalFeatures.phoneDimensions} onChange={v => updateForm('generalFeatures.phoneDimensions', v)} />
    <InputField label="Weight" value={form.generalFeatures.phoneWeight} onChange={v => updateForm('generalFeatures.phoneWeight', v)} />
    <InputField label="Colors" value={form.generalFeatures.colors} onChange={v => updateForm('generalFeatures.colors', v)} />
    
    <div className="col-span-full mt-4">
      <h3 className="text-lg font-semibold text-red-600 mb-4">Performance</h3>
    </div>
    <InputField label="Processor" value={form.performance.processor} onChange={v => updateForm('performance.processor', v)} />
    <InputField label="GPU" value={form.performance.gpu} onChange={v => updateForm('performance.gpu', v)} />
    
    <div className="col-span-full mt-4">
      <h3 className="text-lg font-semibold text-red-600 mb-4">Display</h3>
    </div>
    <InputField label="Screen Size" value={form.display.screenSize} onChange={v => updateForm('display.screenSize', v)} />
    <InputField label="Resolution" value={form.display.screenResolution} onChange={v => updateForm('display.screenResolution', v)} />
    <InputField label="Technology" value={form.display.technology} onChange={v => updateForm('display.technology', v)} />
    
    <div className="col-span-full mt-4">
      <h3 className="text-lg font-semibold text-red-600 mb-4">Camera & Memory</h3>
    </div>
    <InputField label="Front Camera" value={form.camera.frontCamera} onChange={v => updateForm('camera.frontCamera', v)} />
    <InputField label="Back Camera" value={form.camera.backCamera} onChange={v => updateForm('camera.backCamera', v)} />
    <InputField label="RAM" value={form.memory.ram} onChange={v => updateForm('memory.ram', v)} />
    <InputField label="Internal Memory" value={form.memory.internalMemory} onChange={v => updateForm('memory.internalMemory', v)} />
    <InputField label="Battery Type" value={form.battery.type} onChange={v => updateForm('battery.type', v)} />
  </div>
);

// Mechanical Bike Specs
const MechanicalBikeSpecs = ({ form, updateForm }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <InputField label="Engine" value={form.mechanicalBike.generalFeatures.engine} onChange={v => updateForm('mechanicalBike.generalFeatures.engine', v)} />
    <InputField label="Model Year" value={form.mechanicalBike.generalFeatures.model} onChange={v => updateForm('mechanicalBike.generalFeatures.model', v)} />
    <InputField label="Displacement" value={form.mechanicalBike.performance.displacement} onChange={v => updateForm('mechanicalBike.performance.displacement', v)} />
    <InputField label="Transmission" value={form.mechanicalBike.performance.transmission} onChange={v => updateForm('mechanicalBike.performance.transmission', v)} />
    <InputField label="Fuel Capacity" value={form.mechanicalBike.performance.petrolCapacity} onChange={v => updateForm('mechanicalBike.performance.petrolCapacity', v)} />
    <InputField label="Ground Clearance" value={form.mechanicalBike.performance.groundClearance} onChange={v => updateForm('mechanicalBike.performance.groundClearance', v)} />
  </div>
);

// Electrical Bike Specs
const ElectricalBikeSpecs = ({ form, updateForm }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <InputField label="Model Year" value={form.electricalBike.model} onChange={v => updateForm('electricalBike.model', v)} />
    <InputField label="Battery Spec" value={form.electricalBike.batterySpec} onChange={v => updateForm('electricalBike.batterySpec', v)} />
    <InputField label="Range (KM)" value={form.electricalBike.rangeKm} onChange={v => updateForm('electricalBike.rangeKm', v)} />
    <InputField label="Motor" value={form.electricalBike.motor} onChange={v => updateForm('electricalBike.motor', v)} />
    <InputField label="Charging Time" value={form.electricalBike.chargingTime} onChange={v => updateForm('electricalBike.chargingTime', v)} />
    <InputField label="Speed" value={form.electricalBike.speed} onChange={v => updateForm('electricalBike.speed', v)} />
  </div>
);

// Air Conditioner Specs
const AirConditionerSpecs = ({ form, updateForm }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <InputField label="Brand" value={form.airConditioner.brand} onChange={v => updateForm('airConditioner.brand', v)} />
    <InputField label="Capacity (Ton)" value={form.airConditioner.capacityInTon} onChange={v => updateForm('airConditioner.capacityInTon', v)} />
    <InputField label="Energy Efficient" value={form.airConditioner.energyEfficient} onChange={v => updateForm('airConditioner.energyEfficient', v)} />
    <InputField label="Type" value={form.airConditioner.type} onChange={v => updateForm('airConditioner.type', v)} />
    <InputField label="Warranty" value={form.airConditioner.warranty} onChange={v => updateForm('airConditioner.warranty', v)} />
  </div>
);

// Payment Plan Card Component
const PaymentPlanCard = ({ plan, index, form, setForm, recalcPlan, canRemove }) => {
  const updatePlan = (field, value) => {
    const pp = [...form.paymentPlans];
    pp[index][field] = value;
    setForm(f => ({ ...f, paymentPlans: pp }));
    setTimeout(() => recalcPlan(index), 0);
  };

  const financedAmount = Math.max(0, (parseFloat(form.price) || 0) - (plan.downPayment || 0));

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-200 relative">
      {canRemove && (
        <button
          type="button"
          onClick={() => setForm(f => ({ ...f, paymentPlans: f.paymentPlans.filter((_, i) => i !== index) }))}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
          <SummaryItem label="Financed Amount" value={financedAmount} />
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

