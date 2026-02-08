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
  MapPin,
  Trash2
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import baseApi from '../../constants/apiUrl';
import RichTextEditor from '../../components/RichTextEditor';

const CreateInsurancePlan = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = !!id;
  const isView = location.pathname.includes('/view/');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [userData, setUserData] = useState(null);
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadingDocuments, setUploadingDocuments] = useState({});

  const totalSteps = 5;

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    planName: '',
    description: '',
    policyType: '',
    planStatus: 'Active',
    planImage: '',
    insuranceCompanyId: '', // For dropdown selection
    // Step 2: Common fields for all policy types
    policyTerm: '', // e.g., "5 years", "10 years"
    eligibleAge: {
      min: '',
      max: '',
    },
    estimatedMaturity: '', // PKR amount
    
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
      rateCard: '', // Optional
      policyRiders: '', // Optional - 2nd attachment
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
        // Set default insurance company ID to current user
        if (parsed.userId) {
          setFormData(prev => ({ ...prev, insuranceCompanyId: parsed.userId }));
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
    if (!isEdit) {
      fetchInsuranceCompanies();
    } else {
      fetchPlanDetails();
    }
  }, [id, isEdit]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${baseApi}/getInsurancePlan/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = await response.json();
      if (data.success) {
        // Ensure eligibleAge is initialized if missing
        const formDataFromApi = {
          ...data.data,
          eligibleAge: data.data.eligibleAge || { min: '', max: '' }
        };
        setFormData(formDataFromApi);
        if (data.data.planImage) {
          setImagePreview(data.data.planImage);
        }
      } else {
        setError(data.message || 'Failed to load plan details');
      }
    } catch (err) {
      console.error('Error fetching plan details:', err);
      setError('Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  const fetchInsuranceCompanies = async () => {
    try {
      const token = localStorage.getItem('userToken');
      // Fetch all insurance companies by setting a high limit (1000 should be enough for all companies)
      const response = await fetch(`${baseApi}/getAllPartners?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success && data.data) {
        // Filter only insurance companies (PartnerType: "Insurance" or "Takaful")
        const insuranceOnly = data.data.filter(partner => 
          partner.companyDetails?.PartnerType === 'Insurance' || 
          partner.companyDetails?.PartnerType === 'Takaful' ||
          partner.UserType === 'partner' // Fallback: if PartnerType not set but is partner
        );
        setInsuranceCompanies(insuranceOnly);
      }
    } catch (err) {
      console.error('Error fetching insurance companies:', err);
    }
  };

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
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(`File size exceeds 5MB limit. Selected file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return null;
    }

    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      setError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      return null;
    }

    setUploadingDocuments(prev => ({ ...prev, [documentType]: true }));
    setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('document', file);
      
      const token = localStorage.getItem('userToken');
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(prev => ({ ...prev, [documentType]: percentComplete }));
        }
      });

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data.success && data.url) {
                resolve(data.url);
              } else {
                reject(new Error(data.message || 'Upload failed'));
              }
            } catch (err) {
              reject(new Error('Invalid response from server'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
      });

      xhr.open('POST', `${baseApi}/upload-document`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formDataUpload);

      const url = await uploadPromise;
      
      setFormData(prev => ({
        ...prev,
        planDocuments: {
          ...prev.planDocuments,
          [documentType]: url,
        },
      }));
      
      setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[documentType];
          return newProgress;
        });
      }, 1000);

      return url;
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload document');
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[documentType];
        return newProgress;
      });
      return null;
    } finally {
      setUploadingDocuments(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleDeleteDocument = async (documentType) => {
    const fileUrl = formData.planDocuments[documentType];
    
    if (!fileUrl) {
      return;
    }

    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${baseApi}/delete-document`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fileUrl }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove from state only after successful deletion
        setFormData(prev => ({
          ...prev,
          planDocuments: {
            ...prev.planDocuments,
            [documentType]: '',
          },
        }));
        setError(null);
        // Show success message (you can add a toast library if needed)
        alert('Document deleted successfully from R2');
      } else {
        setError(data.message || 'Failed to delete document');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) {
      return;
    }
    
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
        // Add new common fields (Step 2)
        policyTerm: formData.policyTerm,
        eligibleAge: formData.eligibleAge,
        estimatedMaturity: formData.estimatedMaturity,
        [policyKey]: policyData,
      };
      
      // planId will be auto-generated by the backend if not provided

      const token = localStorage.getItem('userToken');
      const url = isEdit 
        ? `${baseApi}/updateInsurancePlan/${id}`
        : `${baseApi}/createInsurancePlan`;
      
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        setMessage(isEdit ? 'Insurance plan updated successfully!' : 'Insurance plan created successfully!');
        // Disable form to prevent double submission
        setTimeout(() => {
          navigate('/insurance');
        }, 2000);
      } else {
        setError(data.message || `Failed to ${isEdit ? 'update' : 'create'} plan`);
        setLoading(false); // Re-enable on error
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Server error. Please try again.');
      setLoading(false); // Re-enable on error
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.planName && formData.policyType;
    }
    if (step === 2) {
      // Check common fields first
      if (!formData.policyTerm || !formData.eligibleAge?.min || !formData.eligibleAge?.max || !formData.estimatedMaturity) {
        return false;
      }
      const policyType = formData.policyType;
      const policyKey = `${policyType.charAt(0).toLowerCase() + policyType.slice(1)}${policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
      const policyData = formData[policyKey];
      
      if (policyType === 'Life') {
        // Check static fields: Premium Amount, Payment Frequency, Sum Assured, Policy Term, Estimated Maturity
        // Note: minEntryAge and maxEntryAge removed
        return policyData.planSubType && 
               policyData.sumAssured && 
               policyData.premiumAmount && 
               policyData.paymentFrequency &&
               formData.policyTerm &&
               formData.estimatedMaturity;
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
      return formData.planDocuments.productBrochure;
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
            <h1 className="text-3xl font-bold text-gray-800">
              {isEdit ? 'Edit Insurance Plan' : 'Create Insurance Plan'}
            </h1>
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

              {/* Insurance Company Dropdown - Only show if multiple companies available */}
              {/* Partner can only create plans for their own company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Company
                </label>
                <input
                  type="text"
                  value={insuranceCompanies.find(c => c.userId === formData.insuranceCompanyId)?.name || 
                         insuranceCompanies.find(c => c.userId === formData.insuranceCompanyId)?.companyDetails?.RegisteredCompanyName || 
                         'Your Company'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  disabled
                  readOnly
                />
                <p className="mt-1 text-xs text-gray-500">You can only create plans for your own company</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
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

              {/* Merged Form - Common Fields + Life Insurance Static Fields */}
              <div className="bg-gradient-to-br from-blue-50 to-orange-50 border-l-4 border-orange-500 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Policy Term - Common for all */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Policy Term <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="policyTerm"
                      value={formData.policyTerm}
                      onChange={handleInput}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                      required
                    >
                      <option value="">Select Policy Term</option>
                      <option value="1 year">1 year</option>
                      <option value="2 years">2 years</option>
                      <option value="3 years">3 years</option>
                      <option value="4 years">4 years</option>
                      <option value="5 years">5 years</option>
                      <option value="6 years">6 years</option>
                      <option value="7 years">7 years</option>
                      <option value="8 years">8 years</option>
                      <option value="9 years">9 years</option>
                      <option value="10 years">10 years</option>
                      <option value="15 years">15 years</option>
                      <option value="20 years">20 years</option>
                      <option value="25 years">25 years</option>
                      <option value="30 years">30 years</option>
                      <option value="Whole Life">Whole Life</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  {/* For Life Insurance - Static Fields */}
                  {formData.policyType === 'Life' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sum Assured <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="sumAssured"
                          value={formData.lifeInsurancePlan?.sumAssured || ''}
                          onChange={handlePolicyTypeInput}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                          placeholder="500000"
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
                          value={formData.lifeInsurancePlan?.premiumAmount || ''}
                          onChange={handlePolicyTypeInput}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                          placeholder="Enter premium amount"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Frequency <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="paymentFrequency"
                          value={formData.lifeInsurancePlan?.paymentFrequency || 'Monthly'}
                          onChange={handlePolicyTypeInput}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
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
                          Estimated Maturity <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">PKR</span>
                          <input
                            type="number"
                            name="estimatedMaturity"
                            value={formData.estimatedMaturity || ''}
                            onChange={handleInput}
                            className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Estimated Maturity - For non-Life insurance types */}
                  {formData.policyType !== 'Life' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Maturity <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">PKR</span>
                        <input
                          type="number"
                          name="estimatedMaturity"
                          value={formData.estimatedMaturity || ''}
                          onChange={handleInput}
                          className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Show Min/Max Policy Term inputs only when "Custom" is selected */}
                  {formData.policyTerm === 'Custom' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Min Policy Term (Years) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="policyTermYearsMin"
                          value={(() => {
                            if (!formData.policyType) return '';
                            const policyKey = `${formData.policyType.charAt(0).toLowerCase() + formData.policyType.slice(1)}${formData.policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
                            return formData[policyKey]?.policyTermYearsMin || '';
                          })()}
                          onChange={(e) => {
                            if (!formData.policyType) return;
                            const policyKey = `${formData.policyType.charAt(0).toLowerCase() + formData.policyType.slice(1)}${formData.policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
                            setFormData(prev => ({
                              ...prev,
                              [policyKey]: {
                                ...prev[policyKey],
                                policyTermYearsMin: e.target.value
                              }
                            }));
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="e.g., 1"
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
                          value={(() => {
                            if (!formData.policyType) return '';
                            const policyKey = `${formData.policyType.charAt(0).toLowerCase() + formData.policyType.slice(1)}${formData.policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
                            return formData[policyKey]?.policyTermYearsMax || '';
                          })()}
                          onChange={(e) => {
                            if (!formData.policyType) return;
                            const policyKey = `${formData.policyType.charAt(0).toLowerCase() + formData.policyType.slice(1)}${formData.policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
                            setFormData(prev => ({
                              ...prev,
                              [policyKey]: {
                                ...prev[policyKey],
                                policyTermYearsMax: e.target.value
                              }
                            }));
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="e.g., 30"
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Eligible Age Range - Common for all */}
                  <div className={formData.policyType === 'Life' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Eligible Age Range <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="eligibleAgeMin"
                        value={formData.eligibleAge?.min || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          eligibleAge: { ...(prev.eligibleAge || {}), min: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                        placeholder="Min"
                        required
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        name="eligibleAgeMax"
                        value={formData.eligibleAge?.max || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          eligibleAge: { ...(prev.eligibleAge || {}), max: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                        placeholder="Max"
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">e.g., 30-60 years</p>
                  </div>
                </div>
              </div>

              {/* Display Cards for Life Insurance Static Fields */}
              {formData.policyType === 'Life' && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-white border-2 border-orange-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Premium Amount</p>
                    <p className="text-lg font-bold text-gray-900">
                      PKR {formData.lifeInsurancePlan?.premiumAmount ? Number(formData.lifeInsurancePlan.premiumAmount).toLocaleString() : '0'}
                    </p>
                  </div>
                  <div className="bg-white border-2 border-orange-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Payment Frequency</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formData.lifeInsurancePlan?.paymentFrequency || 'Monthly'}
                    </p>
                  </div>
                  <div className="bg-white border-2 border-orange-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Sum Assured</p>
                    <p className="text-lg font-bold text-gray-900">
                      PKR {formData.lifeInsurancePlan?.sumAssured ? Number(formData.lifeInsurancePlan.sumAssured).toLocaleString() : '0'}
                    </p>
                  </div>
                  <div className="bg-white border-2 border-orange-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Policy Term</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formData.policyTerm || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white border-2 border-orange-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Estimated Maturity</p>
                    <p className="text-lg font-bold text-gray-900">
                      PKR {formData.estimatedMaturity ? Number(formData.estimatedMaturity).toLocaleString() : '0'}
                    </p>
                  </div>
                </div>
              )}

              {/* Policy-Specific Fields (excluding Life Insurance static fields) */}
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
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument('productBrochure')}
                        className="ml-auto text-red-600 hover:text-red-800 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">Delete</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate Card <span className="text-gray-500">(Optional)</span>
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
                  />
                  {formData.planDocuments.rateCard && (
                    <div className="mt-3 flex items-center gap-2 text-green-600">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">Document uploaded successfully</span>
                      <a href={formData.planDocuments.rateCard} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        View
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument('rateCard')}
                        className="ml-auto text-red-600 hover:text-red-800 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">Delete</span>
                      </button>
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
                      <a href={formData.planDocuments.claimProcedure} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        View
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument('claimProcedure')}
                        className="ml-auto text-red-600 hover:text-red-800 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">Delete</span>
                      </button>
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
