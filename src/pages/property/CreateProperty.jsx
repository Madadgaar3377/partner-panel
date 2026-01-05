import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiUrl from "../../constants/apiUrl";
import Navbar from "../../components/Navbar";
import cities from "../../constants/cites";


const CreateProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Main property type selection
  const [propertyType, setPropertyType] = useState('Project'); // 'Project' or 'Individual'

  // Project form data
  const [projectData, setProjectData] = useState({
    projectName: '',
    city: '',
    district: '',
    tehsil: '',
    area: '',
    street: '',
    locationGPS: '',
    projectType: 'Residential',
    developmentType: '',
    infrastructureStatus: '',
    projectStage: '',
    expectedCompletionDate: '',
    utilities: {
      electricity: false,
      water: false,
      gas: false,
      internet: false,
      sewage: false,
    },
    amenities: {
      security: false,
      cctv: false,
      fireSafety: false,
      parks: false,
      playground: false,
      clubhouse: false,
      gym: false,
      swimmingPool: false,
      mosque: false,
      school: false,
      medical: false,
      parking: false,
      evCharging: false,
      wasteManagement: false,
      elevator: false,
    },
    description: '',
    highlights: ['', '', ''],
    totalLandArea: '',
    propertyTypesAvailable: [],
    totalUnits: '',
    typicalUnitSizes: '',
    nearbyLandmarks: '',
    remarks: '',
    transaction: {
      type: 'Sale',
      price: '',
      advanceAmount: '',
      monthlyRent: '',
      contractDuration: '',
      bookingAmount: '',
      downPayment: '',
      monthlyInstallment: '',
      tenure: '',
      totalPayable: '',
      additionalInfo: '',
    },
    images: [],
    contact: {
      name: '',
      email: '',
      number: '',
      whatsapp: '',
      cnic: '',
      city: '',
      area: '',
    },
  });

  // Individual property form data
  const [individualData, setIndividualData] = useState({
    title: '',
    description: '',
    propertyType: 'Apartment / Flat',
    areaUnit: 'sq. ft',
    areaSize: '',
    city: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    kitchenType: '',
    furnishingStatus: '',
    floor: '',
    totalFloors: '',
    possessionStatus: '',
    zoningType: 'Residential',
    utilities: {
      electricity: false,
      water: false,
      gas: false,
      internet: false,
    },
    amenities: {
      security: false,
      cctv: false,
      parking: false,
      elevator: false,
      gym: false,
      swimmingPool: false,
    },
    nearbyLandmarks: '',
    transaction: {
      type: 'Sale',
      price: '',
      advanceAmount: '',
      monthlyRent: '',
      contractDuration: '',
      bookingAmount: '',
      downPayment: '',
      monthlyInstallment: '',
      tenure: '',
      totalPayable: '',
      additionalInfo: '',
    },
    images: [],
    contact: {
      name: '',
      email: '',
      number: '',
      whatsapp: '',
      cnic: '',
      city: '',
      area: '',
    },
  });

  // Auto-fill contact info from user data
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      const contactData = {
        name: user.name || '',
        email: user.email || '',
        number: user.phoneNumber || '',
        whatsapp: user.WhatsappNumber || '',
        cnic: user.cnicNumber || '',
        city: user.Address || '',
        area: user.Address || '',
      };
      setProjectData(prev => ({ ...prev, contact: contactData }));
      setIndividualData(prev => ({ ...prev, contact: contactData }));
    }
  }, []);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    setUploadError('');

    try {
      const token = localStorage.getItem('userToken');
      const uploadedUrls = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${apiUrl}/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();

        if (response.ok && data.success) {
          uploadedUrls.push(data.url || data.imageUrl || data.data?.url || data.data);
        } else {
          throw new Error(data.message || 'Upload failed');
        }
      }

      if (propertyType === 'Project') {
        setProjectData(prev => ({ 
          ...prev, 
          images: [...prev.images, ...uploadedUrls] 
        }));
      } else {
        setIndividualData(prev => ({ 
          ...prev, 
          images: [...prev.images, ...uploadedUrls] 
        }));
      }

    } catch (err) {
      setUploadError(err.message || 'Failed to upload images.');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    if (propertyType === 'Project') {
      setProjectData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else {
      setIndividualData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const handleProjectChange = (field, value, nested = null) => {
    if (nested) {
      setProjectData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [nested]: value
        }
      }));
    } else {
      setProjectData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleIndividualChange = (field, value, nested = null) => {
    if (nested) {
      setIndividualData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [nested]: value
        }
      }));
    } else {
      setIndividualData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleHighlightChange = (index, value) => {
    const newHighlights = [...projectData.highlights];
    newHighlights[index] = value;
    setProjectData(prev => ({ ...prev, highlights: newHighlights }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('userToken');
      
      // Prepare the data object to match backend expectations
      const propertyData = {
        type: propertyType,
        project: propertyType === 'Project' ? projectData : undefined,
        individualProperty: propertyType === 'Individual' ? individualData : undefined,
      };

      // Wrap in 'data' property as backend expects req.body.data
      const payload = {
        data: propertyData
      };

      console.log('Creating property:', { type: propertyType });

      const response = await fetch(`${apiUrl}/createProperty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        setSuccess('Property created successfully!');
        setTimeout(() => navigate('/property'), 2000);
      } else {
        setError(responseData.message || 'Failed to create property');
        console.error('API Error:', responseData);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextOrSubmit = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      handleNext();
    }
  };

  const currentImages = propertyType === 'Project' ? projectData.images : individualData.images;

  const steps = propertyType === 'Project' 
    ? [
        { step: 1, id: 'basic', label: 'Project Info', description: 'Location & Details' },
        { step: 2, id: 'overview', label: 'Overview', description: 'Description & Highlights' },
        { step: 3, id: 'units', label: 'Units', description: 'Property Types' },
        { step: 4, id: 'amenities', label: 'Amenities', description: 'Facilities' },
        { step: 5, id: 'transaction', label: 'Transaction', description: 'Pricing Details' },
        { step: 6, id: 'contact', label: 'Contact', description: 'Contact Information' },
      ]
    : [
        { step: 1, id: 'basic', label: 'Basic Info', description: 'Property Details' },
        { step: 2, id: 'details', label: 'Details', description: 'Rooms & Features' },
        { step: 3, id: 'utilities', label: 'Utilities', description: 'Available Services' },
        { step: 4, id: 'amenities', label: 'Amenities', description: 'Facilities' },
        { step: 5, id: 'transaction', label: 'Transaction', description: 'Pricing Details' },
        { step: 6, id: 'contact', label: 'Contact', description: 'Contact Information' },
      ];

  const totalSteps = steps.length;
  const currentStepData = steps.find(s => s.step === currentStep);
  const activeTab = currentStepData?.id || 'basic';

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-red-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Add New Property
              </h1>
              <p className="text-gray-600">Real Estate Management System</p>
            </div>
            <button
              onClick={() => navigate('/property')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all shadow-md"
            >
              Back to List
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-md">
            <p className="text-sm text-red-700 font-semibold">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl shadow-md">
            <p className="text-sm text-emerald-700 font-semibold">{success}</p>
          </div>
        )}

        {/* Property Type Selector */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-red-100">
            <label className="block text-sm font-bold text-gray-900 mb-6">
              Select Property Type *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPropertyType('Project')}
                className={`py-8 px-6 rounded-2xl font-bold text-sm transition-all transform hover:scale-105 ${
                  propertyType === 'Project'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xl shadow-red-200/50'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🏗️ Project
              </button>
              <button
                type="button"
                onClick={() => setPropertyType('Individual')}
                className={`py-8 px-6 rounded-2xl font-bold text-sm transition-all transform hover:scale-105 ${
                  propertyType === 'Individual'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xl shadow-red-200/50'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🏠 Individual Property
              </button>
            </div>
        </div>

        {/* Step Progress */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-red-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Step {currentStep} of {totalSteps}
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {currentStepData?.label}
              </h3>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-red-100">
        
        {/* PROJECT FORM */}
        {propertyType === 'Project' && (
            <>
                {/* Basic/Project Info Tab */}
                {activeTab === 'basic' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b-2 border-red-100">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Project Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Project Name *
                                </label>
                                <input
                                    type="text"
                                    value={projectData.projectName}
                                    onChange={(e) => handleProjectChange('projectName', e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    City *
                                </label>
                                <select
                                    value={projectData.city}
                                    onChange={(e) => handleProjectChange('city', e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Select City</option>
                                    {cities.map((city) => (
                                        <option key={city.value} value={city.value}>{city.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    District
                                </label>
                                <input
                                    type="text"
                                    value={projectData.district}
                                    onChange={(e) => handleProjectChange('district', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tehsil / Town
                                </label>
                                <input
                                    type="text"
                                    value={projectData.tehsil}
                                    onChange={(e) => handleProjectChange('tehsil', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Area / Neighborhood / Sector
                                </label>
                                <input
                                    type="text"
                                    value={projectData.area}
                                    onChange={(e) => handleProjectChange('area', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Street / Block / Locality
                                </label>
                                <input
                                    type="text"
                                    value={projectData.street}
                                    onChange={(e) => handleProjectChange('street', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    GPS Location (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={projectData.locationGPS}
                                    onChange={(e) => handleProjectChange('locationGPS', e.target.value)}
                                    placeholder="e.g., 24.8607,67.0011"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Project Type *
                                </label>
                                <select
                                    value={projectData.projectType}
                                    onChange={(e) => handleProjectChange('projectType', e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                >
                                    <option value="Residential">Residential</option>
                                    <option value="Commercial">Commercial</option>
                                    <option value="Industrial">Industrial</option>
                                    <option value="Semi-Commercial">Semi-Commercial</option>
                                    <option value="Semi-Industrial">Semi-Industrial</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Type of Development
                                </label>
                                <input
                                    type="text"
                                    value={projectData.developmentType}
                                    onChange={(e) => handleProjectChange('developmentType', e.target.value)}
                                    placeholder="e.g., Gated Community, Mixed Use"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Infrastructure Status
                                </label>
                                <select
                                    value={projectData.infrastructureStatus}
                                    onChange={(e) => handleProjectChange('infrastructureStatus', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Select Status</option>
                                    <option value="Developed">Developed</option>
                                    <option value="Under Development">Under Development</option>
                                    <option value="New Project">New Project</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Project Stage
                                </label>
                                <select
                                    value={projectData.projectStage}
                                    onChange={(e) => handleProjectChange('projectStage', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Select Stage</option>
                                    <option value="Planning">Planning</option>
                                    <option value="Under Construction">Under Construction</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Expected Completion Date
                                </label>
                                <input
                                    type="text"
                                    value={projectData.expectedCompletionDate}
                                    onChange={(e) => handleProjectChange('expectedCompletionDate', e.target.value)}
                                    placeholder="e.g., Dec 2025"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Utilities Checkboxes */}
                        <div>
                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-900 uppercase tracking-wider xs:tracking-widest mb-3">
                                Utility Connections Provided
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {['electricity', 'water', 'gas', 'internet', 'sewage'].map(utility => (
                                    <label key={utility} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={projectData.utilities[utility]}
                                            onChange={(e) => handleProjectChange('utilities', e.target.checked, utility)}
                                            className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                        />
                                        <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 capitalize">
                                            {utility}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Images */}
                        <div>
                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                Project Images/Videos
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingImages}
                                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-dashed border-gray-200 focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            
                            {uploadingImages && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="font-bold">Uploading images...</span>
                                </div>
                            )}

                            {uploadError && (
                                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-bold">
                                    {uploadError}
                                </div>
                            )}
                            
                            {currentImages.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2 xs:gap-3">
                                    {currentImages.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <div className="w-16 h-16 xs:w-20 xs:h-20 rounded-lg overflow-hidden border-2 border-gray-100 shadow-sm">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700 active:scale-90"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b-2 border-red-100">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Project Overview</h2>
                        </div>
                        
                        <div>
                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                Brief Description
                            </label>
                            <textarea
                                value={projectData.description}
                                onChange={(e) => handleProjectChange('description', e.target.value)}
                                rows="4"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                Key Features / Highlights
                            </label>
                            {[0, 1, 2].map(i => (
                                <input
                                    key={i}
                                    type="text"
                                    value={projectData.highlights[i]}
                                    onChange={(e) => handleHighlightChange(i, e.target.value)}
                                    placeholder={`Feature ${i + 1}`}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none mb-2"
                                />
                            ))}
                        </div>

                        <div>
                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                Total Land / Built-up Area
                            </label>
                            <input
                                type="text"
                                value={projectData.totalLandArea}
                                onChange={(e) => handleProjectChange('totalLandArea', e.target.value)}
                                placeholder="e.g., 50 acres, 100 kanals"
                                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                Nearby Landmarks
                            </label>
                            <textarea
                                value={projectData.nearbyLandmarks}
                                onChange={(e) => handleProjectChange('nearbyLandmarks', e.target.value)}
                                rows="3"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                Remarks / Notes
                            </label>
                            <textarea
                                value={projectData.remarks}
                                onChange={(e) => handleProjectChange('remarks', e.target.value)}
                                rows="3"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                            />
                        </div>
                    </div>
                )}

                {/* Units Tab */}
                {activeTab === 'units' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b-2 border-red-100">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Units / Property Types</h2>
                        </div>
                        
                        <div>
                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                Property Types Available
                            </label>
                            <div className="text-xs text-gray-500 mb-2">Select all that apply:</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {['Apartment / Flat', 'Villa / House', 'Penthouse', 'Studio Apartment', 'Duplex / Triplex', 
                                  'Townhouse / Row House', 'Serviced Apartment', 'Residential Plot / Land', 'Commercial Plot / Land', 
                                  'Office / Office Space', 'Retail / Shop / Showroom', 'Warehouse / Industrial Unit'].map(type => (
                                    <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={projectData.propertyTypesAvailable.includes(type)}
                                            onChange={(e) => {
                                                const newTypes = e.target.checked
                                                    ? [...projectData.propertyTypesAvailable, type]
                                                    : projectData.propertyTypesAvailable.filter(t => t !== type);
                                                handleProjectChange('propertyTypesAvailable', newTypes);
                                            }}
                                            className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                        />
                                        <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900">
                                            {type}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Approx. Number of Units
                                </label>
                                <input
                                    type="number"
                                    value={projectData.totalUnits}
                                    onChange={(e) => handleProjectChange('totalUnits', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Typical Unit Sizes
                                </label>
                                <input
                                    type="text"
                                    value={projectData.typicalUnitSizes}
                                    onChange={(e) => handleProjectChange('typicalUnitSizes', e.target.value)}
                                    placeholder="e.g., 1200-2000 sq. ft"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Amenities Tab for Project */}
                {activeTab === 'amenities' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b-2 border-red-100">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Amenities & Facilities</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.keys(projectData.amenities).map(amenity => (
                                <label key={amenity} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={projectData.amenities[amenity]}
                                        onChange={(e) => handleProjectChange('amenities', e.target.checked, amenity)}
                                        className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                    />
                                    <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 capitalize">
                                        {amenity.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Transaction Tab for Project */}
                {activeTab === 'transaction' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b-2 border-red-100">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Transaction Details</h2>
                        </div>
                        
                        <div>
                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                Transaction Type *
                            </label>
                            <select
                                value={projectData.transaction.type}
                                onChange={(e) => handleProjectChange('transaction', e.target.value, 'type')}
                                required
                                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                            >
                                <option value="Sale">For Sale</option>
                                <option value="Rent">For Rent</option>
                                <option value="Installment">For Installment</option>
                            </select>
                        </div>

                        {projectData.transaction.type === 'Sale' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Price (PKR)
                                </label>
                                <input
                                    type="number"
                                    value={projectData.transaction.price}
                                    onChange={(e) => handleProjectChange('transaction', e.target.value, 'price')}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                        )}

                        {projectData.transaction.type === 'Rent' && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xs:gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Advance Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={projectData.transaction.advanceAmount}
                                        onChange={(e) => handleProjectChange('transaction', e.target.value, 'advanceAmount')}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Monthly Rent
                                    </label>
                                    <input
                                        type="number"
                                        value={projectData.transaction.monthlyRent}
                                        onChange={(e) => handleProjectChange('transaction', e.target.value, 'monthlyRent')}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Contract Duration
                                    </label>
                                    <input
                                        type="text"
                                        value={projectData.transaction.contractDuration}
                                        onChange={(e) => handleProjectChange('transaction', e.target.value, 'contractDuration')}
                                        placeholder="e.g., 1 year"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {projectData.transaction.type === 'Installment' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Booking Amount
                                        </label>
                                        <input
                                            type="number"
                                            value={projectData.transaction.bookingAmount}
                                            onChange={(e) => handleProjectChange('transaction', e.target.value, 'bookingAmount')}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Down Payment
                                        </label>
                                        <input
                                            type="number"
                                            value={projectData.transaction.downPayment}
                                            onChange={(e) => handleProjectChange('transaction', e.target.value, 'downPayment')}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Monthly Installment
                                        </label>
                                        <input
                                            type="number"
                                            value={projectData.transaction.monthlyInstallment}
                                            onChange={(e) => handleProjectChange('transaction', e.target.value, 'monthlyInstallment')}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Tenure
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.transaction.tenure}
                                            onChange={(e) => handleProjectChange('transaction', e.target.value, 'tenure')}
                                            placeholder="e.g., 3 years"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Total Amount Payable
                                    </label>
                                    <input
                                        type="number"
                                        value={projectData.transaction.totalPayable}
                                        onChange={(e) => handleProjectChange('transaction', e.target.value, 'totalPayable')}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                Additional Information
                            </label>
                            <textarea
                                value={projectData.transaction.additionalInfo}
                                onChange={(e) => handleProjectChange('transaction', e.target.value, 'additionalInfo')}
                                rows="3"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                            />
                        </div>
                    </div>
                )}

                {/* Contact Tab for Project */}
                {activeTab === 'contact' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b-2 border-red-100">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={projectData.contact.name}
                                    onChange={(e) => handleProjectChange('contact', e.target.value, 'name')}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={projectData.contact.email}
                                    onChange={(e) => handleProjectChange('contact', e.target.value, 'email')}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Contact Number *
                                </label>
                                <input
                                    type="tel"
                                    value={projectData.contact.number}
                                    onChange={(e) => handleProjectChange('contact', e.target.value, 'number')}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    WhatsApp
                                </label>
                                <input
                                    type="tel"
                                    value={projectData.contact.whatsapp}
                                    onChange={(e) => handleProjectChange('contact', e.target.value, 'whatsapp')}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    CNIC
                                </label>
                                <input
                                    type="text"
                                    value={projectData.contact.cnic}
                                    onChange={(e) => handleProjectChange('contact', e.target.value, 'cnic')}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    City
                                </label>
                                <input
                                    type="text"
                                    value={projectData.contact.city}
                                    onChange={(e) => handleProjectChange('contact', e.target.value, 'city')}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Area
                                </label>
                                <input
                                    type="text"
                                    value={projectData.contact.area}
                                    onChange={(e) => handleProjectChange('contact', e.target.value, 'area')}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </>
        )}

        {/* INDIVIDUAL PROPERTY FORM */}
        {propertyType === 'Individual' && (
            <>
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b-2 border-red-100">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Property Title *
                                </label>
                                <input
                                    type="text"
                                    value={individualData.title}
                                    onChange={(e) => handleIndividualChange('title', e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="e.g., Luxury 3 Bedroom Apartment"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={individualData.description}
                                    onChange={(e) => handleIndividualChange('description', e.target.value)}
                                    rows="4"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Detailed description of the property..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Property Type *
                                </label>
                                <select
                                    value={individualData.propertyType}
                                    onChange={(e) => handleIndividualChange('propertyType', e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                >
                                    <option value="Apartment / Flat">Apartment / Flat</option>
                                    <option value="Villa / House">Villa / House</option>
                                    <option value="Penthouse">Penthouse</option>
                                    <option value="Studio Apartment">Studio Apartment</option>
                                    <option value="Duplex / Triplex">Duplex / Triplex</option>
                                    <option value="Townhouse / Row House">Townhouse / Row House</option>
                                    <option value="Serviced Apartment">Serviced Apartment</option>
                                    <option value="Residential Plot / Land">Residential Plot / Land</option>
                                    <option value="Commercial Plot / Land">Commercial Plot / Land</option>
                                    <option value="Office / Office Space">Office / Office Space</option>
                                    <option value="Retail / Shop / Showroom">Retail / Shop / Showroom</option>
                                    <option value="Warehouse / Industrial Unit">Warehouse / Industrial Unit</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Area Unit *
                                </label>
                                <select
                                    value={individualData.areaUnit}
                                    onChange={(e) => handleIndividualChange('areaUnit', e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                >
                                    <option value="sq. ft">Square Feet (sq. ft)</option>
                                    <option value="sq. m">Square Meters (sq. m)</option>
                                    <option value="kanal">Kanal</option>
                                    <option value="marla">Marla</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Area Size *
                                </label>
                                <input
                                    type="text"
                                    value={individualData.areaSize}
                                    onChange={(e) => handleIndividualChange('areaSize', e.target.value)}
                                    required
                                    placeholder="e.g., 1200"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    City *
                                </label>
                                <select
                                    value={individualData.city}
                                    onChange={(e) => handleIndividualChange('city', e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Select City</option>
                                    {cities.map((city) => (
                                        <option key={city.value} value={city.value}>{city.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Location / Area *
                                </label>
                                <input
                                    type="text"
                                    value={individualData.location}
                                    onChange={(e) => handleIndividualChange('location', e.target.value)}
                                    required
                                    placeholder="e.g., DHA Phase 5, Bahria Town"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Images */}
                        <div>
                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                Property Images/Videos
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingImages}
                                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-dashed border-gray-200 focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            
                            {uploadingImages && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="font-bold">Uploading images...</span>
                                </div>
                            )}

                            {uploadError && (
                                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-bold">
                                    {uploadError}
                                </div>
                            )}
                            
                            {currentImages.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2 xs:gap-3">
                                    {currentImages.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <div className="w-16 h-16 xs:w-20 xs:h-20 rounded-lg overflow-hidden border-2 border-gray-100 shadow-sm">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700 active:scale-90"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Details Tab */}
                {activeTab === 'details' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b-2 border-red-100">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Bedrooms
                                </label>
                                <input
                                    type="number"
                                    value={individualData.bedrooms}
                                    onChange={(e) => handleIndividualChange('bedrooms', e.target.value)}
                                    min="0"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Bathrooms
                                </label>
                                <input
                                    type="number"
                                    value={individualData.bathrooms}
                                    onChange={(e) => handleIndividualChange('bathrooms', e.target.value)}
                                    min="0"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Kitchen Type
                                </label>
                                <select
                                    value={individualData.kitchenType}
                                    onChange={(e) => handleIndividualChange('kitchenType', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Select Type</option>
                                    <option value="Modular">Modular</option>
                                    <option value="Open">Open</option>
                                    <option value="Closed">Closed</option>
                                    <option value="Semi-Open">Semi-Open</option>
                                    <option value="Island">Island</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Furnishing Status
                                </label>
                                <select
                                    value={individualData.furnishingStatus}
                                    onChange={(e) => handleIndividualChange('furnishingStatus', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Select Status</option>
                                    <option value="Unfurnished">Unfurnished</option>
                                    <option value="Semi-Furnished">Semi-Furnished</option>
                                    <option value="Fully Furnished">Fully Furnished</option>
                                    <option value="Gray Structure">Gray Structure</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Floor
                                </label>
                                <input
                                    type="number"
                                    value={individualData.floor}
                                    onChange={(e) => handleIndividualChange('floor', e.target.value)}
                                    min="0"
                                    placeholder="e.g., 5"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Total Floors
                                </label>
                                <input
                                    type="number"
                                    value={individualData.totalFloors}
                                    onChange={(e) => handleIndividualChange('totalFloors', e.target.value)}
                                    min="0"
                                    placeholder="e.g., 10"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Possession Status
                                </label>
                                <select
                                    value={individualData.possessionStatus}
                                    onChange={(e) => handleIndividualChange('possessionStatus', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Select Status</option>
                                    <option value="Ready">Ready</option>
                                    <option value="Under Construction">Under Construction</option>
                                    <option value="New Project">New Project</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Zoning Type
                                </label>
                                <select
                                    value={individualData.zoningType}
                                    onChange={(e) => handleIndividualChange('zoningType', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                >
                                    <option value="Residential">Residential</option>
                                    <option value="Commercial">Commercial</option>
                                    <option value="Industrial">Industrial</option>
                                    <option value="Semi Commercial">Semi Commercial</option>
                                    <option value="Semi Industrial">Semi Industrial</option>
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nearby Landmarks / Area Features
                                </label>
                                <textarea
                                    value={individualData.nearbyLandmarks}
                                    onChange={(e) => handleIndividualChange('nearbyLandmarks', e.target.value)}
                                    rows="3"
                                    placeholder="e.g., Near shopping mall, close to school..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Utilities Tab */}
                {activeTab === 'utilities' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b-2 border-red-100">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Utility Supplies</h2>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {['electricity', 'water', 'gas', 'internet'].map(utility => (
                                <label key={utility} className="flex items-center gap-2 cursor-pointer group p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={individualData.utilities[utility]}
                                        onChange={(e) => handleIndividualChange('utilities', e.target.checked, utility)}
                                        className="w-5 h-5 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                    />
                                    <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 capitalize">
                                        {utility === 'electricity' ? 'Electricity / Power Supply' : 
                                         utility === 'water' ? 'Water Supply' :
                                         utility === 'gas' ? 'Gas Connection' :
                                         'Internet / Broadband'}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Amenities Tab for Individual */}
                {activeTab === 'amenities' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b-2 border-red-100">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Amenities & Facilities</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.keys(individualData.amenities).map(amenity => (
                                <label key={amenity} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={individualData.amenities[amenity]}
                                        onChange={(e) => handleIndividualChange('amenities', e.target.checked, amenity)}
                                        className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                    />
                                    <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 capitalize">
                                        {amenity.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Transaction Tab for Individual */}
                {activeTab === 'transaction' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b-2 border-red-100">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Transaction Details</h2>
                        </div>
                        
                        <div>
                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                Transaction Type *
                            </label>
                            <select
                                value={individualData.transaction.type}
                                onChange={(e) => handleIndividualChange('transaction', e.target.value, 'type')}
                                required
                                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                            >
                                <option value="Sale">For Sale</option>
                                <option value="Rent">For Rent</option>
                                <option value="Installment">For Installment</option>
                            </select>
                        </div>

                        {individualData.transaction.type === 'Sale' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Price (PKR) *
                                </label>
                                <input
                                    type="number"
                                    value={individualData.transaction.price}
                                    onChange={(e) => handleIndividualChange('transaction', e.target.value, 'price')}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="e.g., 15000000"
                                />
                            </div>
                        )}

                        {individualData.transaction.type === 'Rent' && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xs:gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Advance Amount *
                                    </label>
                                    <input
                                        type="number"
                                        value={individualData.transaction.advanceAmount}
                                        onChange={(e) => handleIndividualChange('transaction', e.target.value, 'advanceAmount')}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Monthly Rent *
                                    </label>
                                    <input
                                        type="number"
                                        value={individualData.transaction.monthlyRent}
                                        onChange={(e) => handleIndividualChange('transaction', e.target.value, 'monthlyRent')}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Contract Duration
                                    </label>
                                    <input
                                        type="text"
                                        value={individualData.transaction.contractDuration}
                                        onChange={(e) => handleIndividualChange('transaction', e.target.value, 'contractDuration')}
                                        placeholder="e.g., 1 year, 6 months"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {individualData.transaction.type === 'Installment' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Booking / Confirmation Amount *
                                        </label>
                                        <input
                                            type="number"
                                            value={individualData.transaction.bookingAmount}
                                            onChange={(e) => handleIndividualChange('transaction', e.target.value, 'bookingAmount')}
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Down Payment *
                                        </label>
                                        <input
                                            type="number"
                                            value={individualData.transaction.downPayment}
                                            onChange={(e) => handleIndividualChange('transaction', e.target.value, 'downPayment')}
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Monthly Installment *
                                        </label>
                                        <input
                                            type="number"
                                            value={individualData.transaction.monthlyInstallment}
                                            onChange={(e) => handleIndividualChange('transaction', e.target.value, 'monthlyInstallment')}
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Tenure / Duration
                                        </label>
                                        <input
                                            type="text"
                                            value={individualData.transaction.tenure}
                                            onChange={(e) => handleIndividualChange('transaction', e.target.value, 'tenure')}
                                            placeholder="e.g., 3 years, 36 months"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Total Amount Payable by Buyer / Consumer
                                    </label>
                                    <input
                                        type="number"
                                        value={individualData.transaction.totalPayable}
                                        onChange={(e) => handleIndividualChange('transaction', e.target.value, 'totalPayable')}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                Additional Information
                            </label>
                            <textarea
                                value={individualData.transaction.additionalInfo}
                                onChange={(e) => handleIndividualChange('transaction', e.target.value, 'additionalInfo')}
                                rows="3"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                            />
                        </div>
                    </div>
                )}

                {/* Contact Tab for Individual */}
                {activeTab === 'contact' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b-2 border-red-100">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={individualData.contact.name}
                                    onChange={(e) => handleIndividualChange('contact', e.target.value, 'name')}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Contact Number *
                                </label>
                                <input
                                    type="tel"
                                    value={individualData.contact.number}
                                    onChange={(e) => handleIndividualChange('contact', e.target.value, 'number')}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={individualData.contact.email}
                                    onChange={(e) => handleIndividualChange('contact', e.target.value, 'email')}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    WhatsApp
                                </label>
                                <input
                                    type="tel"
                                    value={individualData.contact.whatsapp}
                                    onChange={(e) => handleIndividualChange('contact', e.target.value, 'whatsapp')}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    CNIC
                                </label>
                                <input
                                    type="text"
                                    value={individualData.contact.cnic}
                                    onChange={(e) => handleIndividualChange('contact', e.target.value, 'cnic')}
                                    placeholder="e.g., 42101-1234567-8"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </>
        )}
        
        </div>

        {/* Navigation Buttons */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-red-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate('/property')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <div className="flex-1" />
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrevious}
                disabled={loading}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
            )}
            <button
              type="button"
              onClick={handleNextOrSubmit}
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-md ${
                isLastStep 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white' 
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
              } ${loading ? 'opacity-70 cursor-not-allowed scale-100' : ''}`}
            >
              {loading ? 'Creating...' : isLastStep ? '✓ Create Property' : 'Next Step →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProperty;
