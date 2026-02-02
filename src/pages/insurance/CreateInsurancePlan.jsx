import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Upload, 
  X,
  Shield,
  FileText,
  Image as ImageIcon,
  Building2,
  DollarSign,
  Users,
  Calendar,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import baseApi from '../../constants/apiUrl';

const CreateInsurancePlan = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [userData, setUserData] = useState(null);

  const totalSteps = 5;

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    planName: '',
    description: '',
    policyType: '',
    planStatus: 'Active',
    planImage: '',
    
    // Life Insurance
    lifeInsurancePlan: {
      planSubType: '',
      sumAssured: '',
      policyTermYearsMin: '',
      policyTermYearsMax: '',
      premiumPaymentTerm: '',
      maturityBenefit: false,
      bonusApplicable: false,
      deathBenefitDescription: '',
      ridersAvailable: [],
      minEntryAge: '',
      maxEntryAge: '',
      medicalRequirement: '',
      premiumAmount: '',
      paymentFrequency: 'Monthly',
      claimType: '',
      maturityProcessingTimeDays: '',
      requiredDocuments: [],
    },
    
    // Health Insurance
    healthInsurancePlan: {
      coverageType: '',
      annualCoverageLimit: '',
      roomRentLimit: '',
      icuCoverage: false,
      opdCoverage: false,
      preExistingCoverage: false,
      waitingPeriodDays: '',
      panelHospitalsAvailable: false,
      panelHospitalList: '',
      cashlessFacility: false,
      annualPremium: '',
      paymentFrequency: 'Monthly',
      claimType: '',
      claimTATDays: '',
      requiredClaimDocuments: [],
    },
    
    // Motor Insurance
    motorInsurancePlan: {
      motorType: '',
      coverageType: '',
      vehicleValueRangeMin: '',
      vehicleValueRangeMax: '',
      theftCoverage: false,
      floodCoverage: false,
      naturalCalamities: false,
      annualPremium: '',
      deductibleExcess: '',
      claimProcessType: '',
      averageClaimTATDays: '',
      requiredDocuments: [],
    },
    
    // Travel Insurance
    travelInsurancePlan: {
      travelType: '',
      geographicCoverage: '',
      tripDurationDays: '',
      medicalCoverageLimit: '',
      baggageLoss: false,
      flightDelay: false,
      premiumAmount: '',
      coveragePeriod: '',
      claimType: '',
      claimTATDays: '',
      requiredDocuments: [],
    },
    
    // Property Insurance
    propertyInsurancePlan: {
      propertyType: '',
      coverageAmount: '',
      fireCoverage: false,
      theftCoverage: false,
      naturalDisasterCoverage: false,
      premiumAmount: '',
      claimType: '',
      claimTATDays: '',
      requiredDocuments: [],
    },
    
    // Takaful
    takafulPlan: {
      takafulType: '',
      contributionAmount: '',
      contributionFrequency: 'Monthly',
      sumCovered: '',
      surplusDistribution: false,
      shariahComplianceCertificate: '',
      claimType: '',
      maturityBenefit: false,
      profitSharingDetails: '',
      requiredDocuments: [],
    },
    
    // Common Documents
    planDocuments: {
      productBrochure: '',
      policyWording: '',
      rateCard: '',
      claimProcedure: '',
      secpApproval: '',
      otherDocuments: [],
    },
    
    // Authorization
    authorization: {
      authorizationToList: false,
      confirmationOfAccuracy: false,
      consentForLeadSharing: false,
    },
    
    tags: [],
  });

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        setUserData(parsed);
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePolicyTypeInput = (e) => {
    const { name, value, type, checked } = e.target;
    const policyType = formData.policyType;
    const policyKey = `${policyType.charAt(0).toLowerCase() + policyType.slice(1)}${policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
    
    setFormData(prev => ({
      ...prev,
      [policyKey]: {
        ...prev[policyKey],
        [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
      }
    }));
  };

  const handleArrayToggle = (arrayName, value, isPolicySpecific = false) => {
    if (isPolicySpecific) {
      const policyType = formData.policyType;
      const policyKey = `${policyType.charAt(0).toLowerCase() + policyType.slice(1)}${policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
      
      setFormData(prev => ({
        ...prev,
        [policyKey]: {
          ...prev[policyKey],
          [arrayName]: prev[policyKey][arrayName].includes(value)
            ? prev[policyKey][arrayName].filter(item => item !== value)
            : [...prev[policyKey][arrayName], value]
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [arrayName]: prev[arrayName].includes(value)
          ? prev[arrayName].filter(item => item !== value)
          : [...prev[arrayName], value]
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should not exceed 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);
      
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${baseApi}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataUpload,
      });
      
      const data = await response.json();
      if (data.success && (data.url || data.imageUrl)) {
        setFormData(prev => ({ ...prev, planImage: data.url || data.imageUrl }));
        setError(null);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image');
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async (file, documentType) => {
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('document', file);
      
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${baseApi}/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataUpload,
      });
      
      const data = await response.json();
      if (data.success && data.url) {
        setFormData(prev => ({
          ...prev,
          planDocuments: {
            ...prev.planDocuments,
            [documentType]: data.url,
          },
        }));
        return data.url;
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload document');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const policyType = formData.policyType;
      if (!policyType) {
        setError('Please select a policy type');
        setLoading(false);
        return;
      }

      const policyKey = `${policyType.charAt(0).toLowerCase() + policyType.slice(1)}${policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
      const policyData = formData[policyKey];
      
      const payload = {
        planName: formData.planName,
        description: formData.description || undefined,
        policyType: formData.policyType,
        planStatus: formData.planStatus,
        planImage: formData.planImage,
        planDocuments: formData.planDocuments,
        authorization: formData.authorization,
        tags: formData.tags,
        [policyKey]: policyData,
      };
      
      // planId will be auto-generated by the backend if not provided

      const token = localStorage.getItem('userToken');
      const response = await fetch(`${baseApi}/createInsurancePlan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Insurance plan created successfully!');
        setTimeout(() => navigate('/insurance'), 2000);
      } else {
        setError(data.message || 'Failed to create plan');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.planName && formData.policyType;
    }
    if (step === 2) {
      const policyType = formData.policyType;
      const policyKey = `${policyType.charAt(0).toLowerCase() + policyType.slice(1)}${policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
      const policyData = formData[policyKey];
      
      if (policyType === 'Life') {
        return policyData.planSubType && policyData.sumAssured && policyData.premiumAmount && 
               policyData.minEntryAge && policyData.maxEntryAge;
      } else if (policyType === 'Health') {
        return policyData.coverageType && policyData.annualCoverageLimit && policyData.annualPremium;
      } else if (policyType === 'Motor') {
        return policyData.motorType && policyData.coverageType && policyData.annualPremium;
      } else if (policyType === 'Travel') {
        return policyData.travelType && policyData.geographicCoverage && policyData.premiumAmount;
      } else if (policyType === 'Property') {
        return policyData.propertyType && policyData.coverageAmount && policyData.premiumAmount;
      } else if (policyType === 'Takaful') {
        return policyData.takafulType && policyData.contributionAmount && policyData.sumCovered;
      }
      return false;
    }
    if (step === 3) {
      return formData.planDocuments.productBrochure && 
             formData.planDocuments.policyWording && 
             formData.planDocuments.rateCard;
    }
    if (step === 4) {
      return true; // Image is optional
    }
    if (step === 5) {
      return formData.authorization.authorizationToList && 
             formData.authorization.confirmationOfAccuracy && 
             formData.authorization.consentForLeadSharing;
    }
    return true;
  };

  const renderPolicyTypeFields = () => {
    const policyType = formData.policyType;
    if (!policyType) return null;

    const policyKey = `${policyType.charAt(0).toLowerCase() + policyType.slice(1)}${policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
    const policyData = formData[policyKey];

    if (policyType === 'Life') {
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Life Insurance Plan Details</h3>
            <p className="text-sm text-blue-700">Fill in all required fields for your life insurance plan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Sub-Type <span className="text-red-500">*</span>
              </label>
              <select
                name="planSubType"
                value={policyData.planSubType}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select Sub-Type</option>
                <option value="Term">Term</option>
                <option value="Endowment">Endowment</option>
                <option value="Whole Life">Whole Life</option>
                <option value="ULIP">ULIP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sum Assured <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="sumAssured"
                value={policyData.sumAssured}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="500000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Policy Term (Years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="policyTermYearsMin"
                value={policyData.policyTermYearsMin}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Policy Term (Years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="policyTermYearsMax"
                value={policyData.policyTermYearsMax}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Premium Payment Term (Years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="premiumPaymentTerm"
                value={policyData.premiumPaymentTerm}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Premium Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="premiumAmount"
                value={policyData.premiumAmount}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Frequency <span className="text-red-500">*</span>
              </label>
              <select
                name="paymentFrequency"
                value={policyData.paymentFrequency}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Semi-Annually">Semi-Annually</option>
                <option value="Annually">Annually</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Entry Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="minEntryAge"
                value={policyData.minEntryAge}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Entry Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxEntryAge"
                value={policyData.maxEntryAge}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical Requirement <span className="text-red-500">*</span>
              </label>
              <textarea
                name="medicalRequirement"
                value={policyData.medicalRequirement}
                onChange={handlePolicyTypeInput}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Medical examination requirements"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Death Benefit Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="deathBenefitDescription"
                value={policyData.deathBenefitDescription}
                onChange={handlePolicyTypeInput}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Describe death benefit coverage in detail"
                required
              />
            </div>

            <div className="md:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="maturityBenefit"
                  checked={policyData.maturityBenefit}
                  onChange={handlePolicyTypeInput}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Maturity Benefit Offered</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="bonusApplicable"
                  checked={policyData.bonusApplicable}
                  onChange={handlePolicyTypeInput}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Bonus Applicable</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="claimType"
                value={policyData.claimType}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., Death Claim, Maturity Claim"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maturity Processing Time (Days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maturityProcessingTimeDays"
                value={policyData.maturityProcessingTimeDays}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>
      );
    }

    if (policyType === 'Health') {
      return (
        <div className="space-y-6">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Health Insurance Plan Details</h3>
            <p className="text-sm text-green-700">Fill in all required fields for your health insurance plan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coverage Type <span className="text-red-500">*</span>
              </label>
              <select
                name="coverageType"
                value={policyData.coverageType}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select Coverage Type</option>
                <option value="Individual">Individual</option>
                <option value="Family">Family</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Coverage Limit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="annualCoverageLimit"
                value={policyData.annualCoverageLimit}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="500000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Rent Limit
              </label>
              <input
                type="number"
                name="roomRentLimit"
                value={policyData.roomRentLimit}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waiting Period (Days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="waitingPeriodDays"
                value={policyData.waitingPeriodDays}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Premium <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="annualPremium"
                value={policyData.annualPremium}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Frequency <span className="text-red-500">*</span>
              </label>
              <select
                name="paymentFrequency"
                value={policyData.paymentFrequency}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Semi-Annually">Semi-Annually</option>
                <option value="Annually">Annually</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Type <span className="text-red-500">*</span>
              </label>
              <select
                name="claimType"
                value={policyData.claimType}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select Claim Type</option>
                <option value="Cashless">Cashless</option>
                <option value="Reimbursement">Reimbursement</option>
                <option value="Both">Both</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim TAT (Days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="claimTATDays"
                value={policyData.claimTATDays}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {policyData.panelHospitalsAvailable && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Panel Hospital List
                </label>
                <textarea
                  name="panelHospitalList"
                  value={policyData.panelHospitalList}
                  onChange={handlePolicyTypeInput}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="List of panel hospitals or URL"
                />
              </div>
            )}

            <div className="md:col-span-2 flex gap-6 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="icuCoverage"
                  checked={policyData.icuCoverage}
                  onChange={handlePolicyTypeInput}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">ICU Coverage</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="opdCoverage"
                  checked={policyData.opdCoverage}
                  onChange={handlePolicyTypeInput}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">OPD Coverage</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="preExistingCoverage"
                  checked={policyData.preExistingCoverage}
                  onChange={handlePolicyTypeInput}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Pre-existing Coverage</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="panelHospitalsAvailable"
                  checked={policyData.panelHospitalsAvailable}
                  onChange={handlePolicyTypeInput}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Panel Hospitals Available</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="cashlessFacility"
                  checked={policyData.cashlessFacility}
                  onChange={handlePolicyTypeInput}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Cashless Facility</span>
              </label>
            </div>
          </div>
        </div>
      );
    }

    if (policyType === 'Motor') {
      return (
        <div className="space-y-6">
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Motor Insurance Plan Details</h3>
            <p className="text-sm text-purple-700">Fill in all required fields for your motor insurance plan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motor Type <span className="text-red-500">*</span>
              </label>
              <select
                name="motorType"
                value={policyData.motorType}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select Motor Type</option>
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coverage Type <span className="text-red-500">*</span>
              </label>
              <select
                name="coverageType"
                value={policyData.coverageType}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select Coverage Type</option>
                <option value="Comprehensive">Comprehensive</option>
                <option value="Third Party">Third Party</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Vehicle Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="vehicleValueRangeMin"
                value={policyData.vehicleValueRangeMin}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Vehicle Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="vehicleValueRangeMax"
                value={policyData.vehicleValueRangeMax}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Premium <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="annualPremium"
                value={policyData.annualPremium}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deductible / Excess <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="deductibleExcess"
                value={policyData.deductibleExcess}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Process Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="claimProcessType"
                value={policyData.claimProcessType}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., Cashless, Reimbursement"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Claim TAT (Days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="averageClaimTATDays"
                value={policyData.averageClaimTATDays}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2 flex gap-6 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="theftCoverage"
                  checked={policyData.theftCoverage}
                  onChange={handlePolicyTypeInput}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Theft Coverage</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="floodCoverage"
                  checked={policyData.floodCoverage}
                  onChange={handlePolicyTypeInput}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Flood Coverage</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="naturalCalamities"
                  checked={policyData.naturalCalamities}
                  onChange={handlePolicyTypeInput}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Natural Calamities</span>
              </label>
            </div>
          </div>
        </div>
      );
    }

    if (policyType === 'Travel') {
      return (
        <div className="space-y-6">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">Travel Insurance Plan Details</h3>
            <p className="text-sm text-indigo-700">Fill in all required fields for your travel insurance plan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Travel Type <span className="text-red-500">*</span>
              </label>
              <select
                name="travelType"
                value={policyData.travelType}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select Travel Type</option>
                <option value="Single">Single</option>
                <option value="Multiple">Multiple</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Geographic Coverage <span className="text-red-500">*</span>
              </label>
              <select
                name="geographicCoverage"
                value={policyData.geographicCoverage}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select Coverage</option>
                <option value="Domestic">Domestic</option>
                <option value="International">International</option>
                <option value="Both">Both</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip Duration (Days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="tripDurationDays"
                value={policyData.tripDurationDays}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical Coverage Limit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="medicalCoverageLimit"
                value={policyData.medicalCoverageLimit}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Premium Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="premiumAmount"
                value={policyData.premiumAmount}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coverage Period <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="coveragePeriod"
                value={policyData.coveragePeriod}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., 30 days, 1 year"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="claimType"
                value={policyData.claimType}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim TAT (Days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="claimTATDays"
                value={policyData.claimTATDays}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="baggageLoss"
                  checked={policyData.baggageLoss}
                  onChange={handlePolicyTypeInput}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Baggage Loss Coverage</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="flightDelay"
                  checked={policyData.flightDelay}
                  onChange={handlePolicyTypeInput}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Flight Delay Coverage</span>
              </label>
            </div>
          </div>
        </div>
      );
    }

    if (policyType === 'Property') {
      return (
        <div className="space-y-6">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
            <h3 className="text-lg font-semibold text-amber-900 mb-2">Property Insurance Plan Details</h3>
            <p className="text-sm text-amber-700">Fill in all required fields for your property insurance plan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type <span className="text-red-500">*</span>
              </label>
              <select
                name="propertyType"
                value={policyData.propertyType}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select Property Type</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coverage Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="coverageAmount"
                value={policyData.coverageAmount}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Premium Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="premiumAmount"
                value={policyData.premiumAmount}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="claimType"
                value={policyData.claimType}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim TAT (Days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="claimTATDays"
                value={policyData.claimTATDays}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2 flex gap-6 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="fireCoverage"
                  checked={policyData.fireCoverage}
                  onChange={handlePolicyTypeInput}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Fire Coverage</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="theftCoverage"
                  checked={policyData.theftCoverage}
                  onChange={handlePolicyTypeInput}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Theft Coverage</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="naturalDisasterCoverage"
                  checked={policyData.naturalDisasterCoverage}
                  onChange={handlePolicyTypeInput}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Natural Disaster Coverage</span>
              </label>
            </div>
          </div>
        </div>
      );
    }

    if (policyType === 'Takaful') {
      return (
        <div className="space-y-6">
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded">
            <h3 className="text-lg font-semibold text-emerald-900 mb-2">Takaful Plan Details</h3>
            <p className="text-sm text-emerald-700">Fill in all required fields for your Takaful plan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Takaful Type <span className="text-red-500">*</span>
              </label>
              <select
                name="takafulType"
                value={policyData.takafulType}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select Takaful Type</option>
                <option value="Family">Family</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contribution Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="contributionAmount"
                value={policyData.contributionAmount}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contribution Frequency <span className="text-red-500">*</span>
              </label>
              <select
                name="contributionFrequency"
                value={policyData.contributionFrequency}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Semi-Annually">Semi-Annually</option>
                <option value="Annually">Annually</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sum Covered <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="sumCovered"
                value={policyData.sumCovered}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shariah Compliance Certificate <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="shariahComplianceCertificate"
                value={policyData.shariahComplianceCertificate}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Certificate URL or reference"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="claimType"
                value={policyData.claimType}
                onChange={handlePolicyTypeInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profit Sharing Details
              </label>
              <textarea
                name="profitSharingDetails"
                value={policyData.profitSharingDetails}
                onChange={handlePolicyTypeInput}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Describe profit sharing details"
              />
            </div>

            <div className="md:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="surplusDistribution"
                  checked={policyData.surplusDistribution}
                  onChange={handlePolicyTypeInput}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Surplus Distribution</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="maturityBenefit"
                  checked={policyData.maturityBenefit}
                  onChange={handlePolicyTypeInput}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Maturity Benefit</span>
              </label>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">{policyType} Insurance Plan Details</h3>
          <p className="text-sm text-blue-700">Please fill in all required fields for {policyType} insurance plan.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/insurance')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Create Insurance Plan</h1>
            <p className="text-gray-600 mt-1">Step {step} of {totalSteps}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[...Array(totalSteps)].map((_, i) => (
              <div key={i} className="flex-1 flex items-center">
                <div className="flex-1 h-2 rounded-full mx-1 relative overflow-hidden">
                  <div className={`absolute inset-0 transition-all duration-300 ${
                    i + 1 < step ? 'bg-orange-600' : i + 1 === step ? 'bg-orange-400' : 'bg-gray-200'
                  }`} style={{ width: i + 1 <= step ? '100%' : '0%' }} />
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  i + 1 < step ? 'bg-orange-600 text-white' : 
                  i + 1 === step ? 'bg-orange-500 text-white ring-4 ring-orange-200' : 
                  'bg-gray-200 text-gray-500'
                }`}>
                  {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Basic Info</span>
            <span>Plan Details</span>
            <span>Documents</span>
            <span>Image</span>
            <span>Authorization</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <p className="text-green-700">{message}</p>
            </div>
          )}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-orange-600" />
                  Basic Information
                </h2>
                <p className="text-gray-600 mt-1">Enter the basic details of your insurance plan</p>
              </div>
              
              {userData && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-1">Registered Company Name</p>
                  <p className="font-semibold text-gray-800 text-lg">
                    {userData.companyDetails?.RegisteredCompanyName || userData.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">This will be automatically used as the insurance company for your plan</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="planName"
                  value={formData.planName}
                  onChange={handleInput}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Comprehensive Life Insurance Plan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInput}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter a detailed description of the insurance plan..."
                />
                <p className="mt-1 text-xs text-gray-500">Provide a comprehensive description of the plan features, benefits, and coverage details.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="policyType"
                    value={formData.policyType}
                    onChange={handleInput}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Policy Type</option>
                    <option value="Life">Life</option>
                    <option value="Health">Health</option>
                    <option value="Motor">Motor</option>
                    <option value="Travel">Travel</option>
                    <option value="Property">Property</option>
                    <option value="Takaful">Takaful</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="planStatus"
                    value={formData.planStatus}
                    onChange={handleInput}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Limited">Limited</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Policy-Type Specific Details */}
          {step === 2 && formData.policyType && (
            <div className="space-y-6">
              <div className="border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-orange-600" />
                  Plan Details
                </h2>
                <p className="text-gray-600 mt-1">Fill in the specific details for {formData.policyType} insurance</p>
              </div>
              {renderPolicyTypeFields()}
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-orange-600" />
                  Required Documents
                </h2>
                <p className="text-gray-600 mt-1">Upload all required documents for your insurance plan</p>
              </div>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Brochure <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleDocumentUpload(e.target.files[0], 'productBrochure');
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  {formData.planDocuments.productBrochure && (
                    <div className="mt-3 flex items-center gap-2 text-green-600">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">Document uploaded successfully</span>
                      <a href={formData.planDocuments.productBrochure} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        View
                      </a>
                    </div>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Wording <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleDocumentUpload(e.target.files[0], 'policyWording');
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  {formData.planDocuments.policyWording && (
                    <div className="mt-3 flex items-center gap-2 text-green-600">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">Document uploaded successfully</span>
                      <a href={formData.planDocuments.policyWording} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        View
                      </a>
                    </div>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate Card <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleDocumentUpload(e.target.files[0], 'rateCard');
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  {formData.planDocuments.rateCard && (
                    <div className="mt-3 flex items-center gap-2 text-green-600">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">Document uploaded successfully</span>
                      <a href={formData.planDocuments.rateCard} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        View
                      </a>
                    </div>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Claim Procedure (Optional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleDocumentUpload(e.target.files[0], 'claimProcedure');
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {formData.planDocuments.claimProcedure && (
                    <div className="mt-3 flex items-center gap-2 text-green-600">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">Document uploaded successfully</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Plan Image */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-orange-600" />
                  Plan Image
                </h2>
                <p className="text-gray-600 mt-1">Upload a thumbnail image for your insurance plan (Optional)</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors">
                {imagePreview || formData.planImage ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={imagePreview || formData.planImage}
                        alt="Plan preview"
                        className="max-w-full h-64 object-cover rounded-lg shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, planImage: '' }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">Image uploaded successfully</p>
                  </div>
                ) : (
                  <div>
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <div className="mt-4">
                        <span className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors inline-block">
                          {uploading ? 'Uploading...' : 'Upload Image'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">JPG, PNG or GIF (Max 5MB)</p>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Authorization */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Check className="w-6 h-6 text-orange-600" />
                  Authorization & Declaration
                </h2>
                <p className="text-gray-600 mt-1">Please review and accept the authorization terms</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.authorization.authorizationToList}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        authorization: { ...prev.authorization, authorizationToList: e.target.checked }
                      }))}
                      className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      required
                    />
                    <div>
                      <span className="font-medium text-gray-800">Authorization to List Plan on Madadgaar <span className="text-red-500">*</span></span>
                      <p className="text-sm text-gray-600 mt-1">
                        I authorize Madadgaar Expert Partner to display, compare, and promote this insurance/takaful plan on its platform.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.authorization.confirmationOfAccuracy}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        authorization: { ...prev.authorization, confirmationOfAccuracy: e.target.checked }
                      }))}
                      className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      required
                    />
                    <div>
                      <span className="font-medium text-gray-800">Confirmation of Accuracy <span className="text-red-500">*</span></span>
                      <p className="text-sm text-gray-600 mt-1">
                        I confirm that all information provided is accurate and true.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.authorization.consentForLeadSharing}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        authorization: { ...prev.authorization, consentForLeadSharing: e.target.checked }
                      }))}
                      className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      required
                    />
                    <div>
                      <span className="font-medium text-gray-800">Consent for Lead Sharing <span className="text-red-500">*</span></span>
                      <p className="text-sm text-gray-600 mt-1">
                        I consent for Madadgaar to share client leads for services requested.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => {
                  if (isStepValid()) {
                    setStep(step + 1);
                    setError(null);
                  } else {
                    setError('Please fill in all required fields');
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !isStepValid()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Plan
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateInsurancePlan;
