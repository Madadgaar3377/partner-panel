import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Shield,
  FileText, 
  Upload, 
  X,
  Building2,
  AlertCircle
} from 'lucide-react';
import baseApi from '../../constants/apiUrl';
import Navbar from '../../components/Navbar';

const CompleteInsuranceProfile = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  const totalSteps = 4;

  const [formData, setFormData] = useState({
    policyTypesOffered: [],
    
    // Life Insurance Profile
    lifeInsuranceProfile: {
      secpApprovalReference: '',
      productsOffered: [],
      maturityBenefitOffered: false,
      bonusProfitSharing: false,
      dedicatedLifeClaimsDesk: false,
      averageLifeClaimTATDays: '',
      sumAssuredRange: '',
    },
    
    // Health Insurance Profile
    healthInsuranceProfile: {
      secpApprovalReference: '',
      coverageType: '',
      panelHospitalsAvailable: false,
      totalPanelHospitals: '',
      cashlessFacility: false,
      averageHealthClaimTATDays: '',
      preExistingCoverage: false,
    },
    
    // Motor Insurance Profile
    motorInsuranceProfile: {
      secpApprovalReference: '',
      coverageTypes: [],
      panelWorkshopsAvailable: false,
      totalPanelWorkshops: '',
      roadsideAssistance: false,
      averageMotorClaimTATDays: '',
      vehicleTypesCovered: [],
    },
    
    // Travel Insurance Profile
    travelInsuranceProfile: {
      secpApprovalReference: '',
      travelCoverageType: '',
      geographicCoverage: '',
      emergencyAssistancePartner: '',
      averageTravelClaimTATDays: '',
      maxTripDurationDays: '',
    },
    
    // Property Insurance Profile
    propertyInsuranceProfile: {
      secpApprovalReference: '',
      propertyCoverageTypes: [],
      riskTypesCovered: [],
      surveyorNetworkAvailable: false,
      averagePropertyClaimTATDays: '',
      propertyLocationsCovered: [],
    },
    
    // Takaful Profile
    takafulProfile: {
      takafulType: '',
      shariahBoardApprovalReference: '',
      contributionModel: '',
      surplusDistributionPolicy: '',
      averageTakafulClaimTATDays: '',
      panelServiceProviders: false,
    },
    
    // Documents
    insuranceDocuments: {
      secpRegistrationCertificate: '',
      policyTypeApprovalLetters: {
        Life: '',
        Health: '',
        Motor: '',
        Travel: '',
        Property: '',
        Takaful: '',
      },
      companyProfilePDF: '',
      shariahComplianceCertificate: '',
      panelHospitalList: '',
      panelWorkshopList: '',
    },
    
    // Authorization
    insuranceAuthorization: {
      authorizationToCompleteProfile: false,
      accuracyOfInformation: false,
      consentForDisplayAndLeadSharing: false,
    },
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${baseApi}/getUserById`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUserData(data.user);
        // Load existing insurance profile if available
        if (data.user.companyDetails?.insuranceProfile) {
          setFormData(prev => ({
            ...prev,
            ...data.user.companyDetails.insuranceProfile,
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePolicyTypeInput = (e, policyType) => {
    const { name, value, type, checked } = e.target;
    const policyKey = `${policyType.charAt(0).toLowerCase() + policyType.slice(1)}${policyType === 'Takaful' ? '' : 'Insurance'}Profile`;
    
    setFormData(prev => ({
      ...prev,
      [policyKey]: {
        ...prev[policyKey],
        [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
      }
    }));
  };

  const handleArrayToggle = (arrayName, value, isPolicySpecific = false, policyType = '') => {
    if (isPolicySpecific && policyType) {
      const policyKey = `${policyType.charAt(0).toLowerCase() + policyType.slice(1)}${policyType === 'Takaful' ? '' : 'Insurance'}Profile`;
      
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

  const handleDocumentUpload = async (file, documentType, policyType = null) => {
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
        if (policyType) {
          setFormData(prev => ({
            ...prev,
            insuranceDocuments: {
              ...prev.insuranceDocuments,
              policyTypeApprovalLetters: {
                ...prev.insuranceDocuments.policyTypeApprovalLetters,
                [policyType]: data.url,
              },
            },
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            insuranceDocuments: {
              ...prev.insuranceDocuments,
              [documentType]: data.url,
            },
          }));
        }
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
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${baseApi}/updateInsuranceProfile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          insuranceProfile: {
            ...formData,
            insuranceProfileCompleted: true,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Insurance profile completed successfully!');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError(data.message || 'Failed to save profile');
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
      return formData.policyTypesOffered.length > 0;
    }
    if (step === 2) {
      // Validate policy-specific fields based on selected types
      const selectedTypes = formData.policyTypesOffered;
      for (const type of selectedTypes) {
        const policyKey = `${type.charAt(0).toLowerCase() + type.slice(1)}${type === 'Takaful' ? '' : 'Insurance'}Profile`;
        const profile = formData[policyKey];
        
        if (type === 'Life' && !profile.secpApprovalReference) return false;
        if (type === 'Health' && (!profile.secpApprovalReference || !profile.coverageType)) return false;
        if (type === 'Motor' && (!profile.secpApprovalReference || profile.coverageTypes.length === 0)) return false;
        if (type === 'Travel' && (!profile.secpApprovalReference || !profile.travelCoverageType)) return false;
        if (type === 'Property' && (!profile.secpApprovalReference || profile.propertyCoverageTypes.length === 0)) return false;
        if (type === 'Takaful' && (!profile.shariahBoardApprovalReference || !profile.takafulType)) return false;
      }
      return true;
    }
    if (step === 3) {
      return formData.insuranceDocuments.secpRegistrationCertificate && 
             formData.insuranceDocuments.companyProfilePDF;
    }
    if (step === 4) {
      return formData.insuranceAuthorization.authorizationToCompleteProfile && 
             formData.insuranceAuthorization.accuracyOfInformation && 
             formData.insuranceAuthorization.consentForDisplayAndLeadSharing;
    }
    return true;
  };

  const renderPolicyTypeFields = () => {
    const selectedTypes = formData.policyTypesOffered;
    if (selectedTypes.length === 0) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-yellow-800">Please select at least one policy type in Step 1</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {selectedTypes.map((type) => {
          const policyKey = `${type.charAt(0).toLowerCase() + type.slice(1)}${type === 'Takaful' ? '' : 'Insurance'}Profile`;
          const profile = formData[policyKey];
          
          if (type === 'Life') {
            return (
              <div key={type} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Life Insurance Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Life SECP Approval Reference <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="secpApprovalReference"
                      value={profile.secpApprovalReference}
                      onChange={(e) => handlePolicyTypeInput(e, 'Life')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Average Life Claim TAT (Days) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="averageLifeClaimTATDays"
                      value={profile.averageLifeClaimTATDays}
                      onChange={(e) => handlePolicyTypeInput(e, 'Life')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Life Products Offered <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {['Term', 'Endowment', 'Whole Life', 'ULIP'].map(product => (
                        <label key={product} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profile.productsOffered.includes(product)}
                            onChange={() => handleArrayToggle('productsOffered', product, true, 'Life')}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{product}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2 flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="maturityBenefitOffered"
                        checked={profile.maturityBenefitOffered}
                        onChange={(e) => handlePolicyTypeInput(e, 'Life')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Maturity Benefit Offered</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="bonusProfitSharing"
                        checked={profile.bonusProfitSharing}
                        onChange={(e) => handlePolicyTypeInput(e, 'Life')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Bonus / Profit Sharing</span>
                    </label>
                  </div>
                </div>
              </div>
            );
          }
          
          // Similar implementations for other policy types...
          return (
            <div key={type} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800">{type} Insurance Profile</h3>
              <p className="text-sm text-gray-600 mt-2">Fill in {type} insurance profile details</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Complete Insurance Profile</h1>
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
            <span>Policy Types</span>
            <span>Profile Details</span>
            <span>Documents</span>
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

          {/* Step 1: Policy Types Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-orange-600" />
                  Select Policy Types Offered
                </h2>
                <p className="text-gray-600 mt-1">Select all policy types your company offers</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Life', 'Health', 'Motor', 'Travel', 'Property', 'Takaful'].map(type => (
                  <label key={type} className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.policyTypesOffered.includes(type)}
                      onChange={() => handleArrayToggle('policyTypesOffered', type)}
                      className="w-5 h-5 text-orange-600"
                    />
                    <span className="font-medium text-gray-700">{type} Insurance</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Policy-Type Specific Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-orange-600" />
                  Policy-Type Profile Details
                </h2>
                <p className="text-gray-600 mt-1">Fill in details for each selected policy type</p>
              </div>
              {renderPolicyTypeFields()}
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Upload className="w-6 h-6 text-orange-600" />
                  Required Documents
                </h2>
                <p className="text-gray-600 mt-1">Upload all required documents</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SECP Registration Certificate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleDocumentUpload(e.target.files[0], 'secpRegistrationCertificate');
                      }
                    }}
                    className="w-full"
                  />
                  {formData.insuranceDocuments.secpRegistrationCertificate && (
                    <p className="mt-2 text-sm text-green-600">✓ Uploaded</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Profile PDF <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleDocumentUpload(e.target.files[0], 'companyProfilePDF');
                      }
                    }}
                    className="w-full"
                  />
                  {formData.insuranceDocuments.companyProfilePDF && (
                    <p className="mt-2 text-sm text-green-600">✓ Uploaded</p>
                  )}
                </div>

                {formData.policyTypesOffered.map(type => (
                  <div key={type}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {type} Policy-Type Approval Letter
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleDocumentUpload(e.target.files[0], 'policyTypeApprovalLetter', type);
                        }
                      }}
                      className="w-full"
                    />
                    {formData.insuranceDocuments.policyTypeApprovalLetters[type] && (
                      <p className="mt-2 text-sm text-green-600">✓ Uploaded</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Authorization */}
          {step === 4 && (
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
                      checked={formData.insuranceAuthorization.authorizationToCompleteProfile}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        insuranceAuthorization: { ...prev.insuranceAuthorization, authorizationToCompleteProfile: e.target.checked }
                      }))}
                      className="mt-1 w-5 h-5 text-orange-600"
                      required
                    />
                    <div>
                      <span className="font-medium text-gray-800">Authorization to Complete Profile <span className="text-red-500">*</span></span>
                      <p className="text-sm text-gray-600 mt-1">
                        I authorize the completion of my insurance company profile.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.insuranceAuthorization.accuracyOfInformation}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        insuranceAuthorization: { ...prev.insuranceAuthorization, accuracyOfInformation: e.target.checked }
                      }))}
                      className="mt-1 w-5 h-5 text-orange-600"
                      required
                    />
                    <div>
                      <span className="font-medium text-gray-800">Accuracy of Information <span className="text-red-500">*</span></span>
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
                      checked={formData.insuranceAuthorization.consentForDisplayAndLeadSharing}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        insuranceAuthorization: { ...prev.insuranceAuthorization, consentForDisplayAndLeadSharing: e.target.checked }
                      }))}
                      className="mt-1 w-5 h-5 text-orange-600"
                      required
                    />
                    <div>
                      <span className="font-medium text-gray-800">Consent for Display & Lead Sharing <span className="text-red-500">*</span></span>
                      <p className="text-sm text-gray-600 mt-1">
                        I consent for Madadgaar to display our company profile and policy offerings, and to share client leads for services requested.
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
                    Submit Profile
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

export default CompleteInsuranceProfile;
