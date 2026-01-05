import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiUrl from "../../constants/apiUrl";
import Navbar from "../../components/Navbar";
import { PageLoader } from "../../components/Loader";

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyId, setPropertyId] = useState(''); // Store propertyId for updates

  // Main property type
  const [propertyType, setPropertyType] = useState('Project');

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

  // Load property data for editing
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${apiUrl}/getProperty/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.success && data.property) {
          const prop = data.property;
          
          // Extract propertyId from contact info
          let extractedPropertyId = null;
          if (prop.project?.contact?.propertyId) {
            extractedPropertyId = prop.project.contact.propertyId;
          } else if (prop.individualProperty?.contact?.propertyId) {
            extractedPropertyId = prop.individualProperty.contact.propertyId;
          }
          
          if (extractedPropertyId) {
            setPropertyId(extractedPropertyId);
          } else {
            setError('Property ID not found. Cannot update property.');
          }
          
          console.log('Loaded property for editing:', {
            mongoId: id,
            propertyId: extractedPropertyId,
            type: prop.type
          });
          
          setPropertyType(prop.type || 'Project');
          
          if (prop.type === 'Project' && prop.project) {
            setProjectData(prop.project);
          } else if (prop.type === 'Individual' && prop.individualProperty) {
            setIndividualData(prop.individualProperty);
          }
        } else {
          setError('Property not found');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load property data');
      } finally {
        setFetching(false);
      }
    };
    
    fetchProperty();
  }, [id]);

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
    if (!propertyId) {
      setError('Property ID is missing. Cannot update property.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('userToken');
      
      // Prepare the data object
      const propertyData = {
        propertyId: propertyId, // Required for update
        type: propertyType,
        project: propertyType === 'Project' ? projectData : undefined,
        individualProperty: propertyType === 'Individual' ? individualData : undefined,
      };

      const payload = {
        data: propertyData
      };

      console.log('Updating property:', { 
        propertyId, 
        type: propertyType 
      });

      const response = await fetch(`${apiUrl}/updateProperty`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        setSuccess('Property updated successfully!');
        setTimeout(() => navigate('/property'), 2000);
      } else {
        setError(responseData.message || 'Failed to update property');
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

  if (fetching) {
    return <PageLoader text="Loading property..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-red-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Edit Property
              </h1>
              <p className="text-gray-600">Update your property information</p>
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

        {/* Property Type Display (Read-only) */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-red-100">
          <label className="block text-sm font-bold text-gray-900 mb-4">
            Property Type
          </label>
          <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-xl border-2 border-gray-200">
            <span className="text-2xl">
              {propertyType === 'Project' ? '🏗️' : '🏠'}
            </span>
            <span className="text-lg font-bold text-gray-900">
              {propertyType === 'Project' ? 'Project' : 'Individual Property'}
            </span>
            <span className="ml-auto text-sm text-gray-500 font-medium">
              (Cannot be changed)
            </span>
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

        {/* Form Content - Import from CreateProperty */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-red-100">
          <p className="text-center text-gray-500 py-12">
            Form content will be rendered here based on propertyType and activeTab
            <br />
            <span className="text-sm">This uses the same form structure as CreateProperty</span>
          </p>
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
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white' 
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
              } ${loading ? 'opacity-70 cursor-not-allowed scale-100' : ''}`}
            >
              {loading ? 'Updating...' : isLastStep ? '✓ Update Property' : 'Next Step →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProperty;
