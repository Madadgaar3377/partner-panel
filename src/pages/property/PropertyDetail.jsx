import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2, MapPin, Bed, Bath, Home, DollarSign, Calendar, Eye, Edit, ArrowLeft,
  Maximize, Car, Zap, CheckCircle, TreeDeciduous, Dumbbell, Users, Baby, Church,
  School, Hospital, ShoppingBag, Bus, ChevronLeft, ChevronRight, Droplet, Wifi,
  Flame, Trash2, Shield, Camera, ParkingCircle, LifeBuoy
} from 'lucide-react';
import apiUrl from '../../constants/apiUrl';
import Navbar from '../../components/Navbar';
import { PageLoader } from '../../components/Loader';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchPropertyDetail();
  }, [id]);

  const fetchPropertyDetail = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${apiUrl}/getProperty/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        setProperty(data.data);
        console.log('Property data:', data.data);
      }
    } catch (error) {
      console.error('Error fetching property details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract property data based on type
  const getPropertyData = () => {
    if (!property) return null;

    if (property.type === 'Project' && property.project) {
      return {
        type: 'Project',
        name: property.project.projectName || 'Unnamed Project',
        description: property.project.description,
        city: property.project.city,
        location: `${property.project.area || ''}, ${property.project.city || ''}`.trim(),
        fullLocation: [property.project.street, property.project.area, property.project.tehsil, property.project.district, property.project.city].filter(Boolean).join(', '),
        projectType: property.project.projectType,
        transactionType: property.project.transaction?.type,
        price: property.project.transaction?.price || 0,
        advanceAmount: property.project.transaction?.advanceAmount || 0,
        monthlyRent: property.project.transaction?.monthlyRent || 0,
        monthlyInstallment: property.project.transaction?.monthlyInstallment || 0,
        contractDuration: property.project.transaction?.contractDuration,
        bookingAmount: property.project.transaction?.bookingAmount,
        downPayment: property.project.transaction?.downPayment,
        tenure: property.project.transaction?.tenure,
        totalPayable: property.project.transaction?.totalPayable,
        additionalInfo: property.project.transaction?.additionalInfo,
        images: property.project.images || [],
        contact: property.project.contact || {},
        utilities: property.project.utilities || {},
        amenities: property.project.amenities || {},
        highlights: property.project.highlights || [],
        totalLandArea: property.project.totalLandArea,
        propertyTypesAvailable: property.project.propertyTypesAvailable || [],
        totalUnits: property.project.totalUnits,
        typicalUnitSizes: property.project.typicalUnitSizes,
        developmentType: property.project.developmentType,
        infrastructureStatus: property.project.infrastructureStatus,
        projectStage: property.project.projectStage,
        expectedCompletionDate: property.project.expectedCompletionDate,
        nearbyLandmarks: property.project.nearbyLandmarks,
        remarks: property.project.remarks,
      };
    } else if (property.type === 'Individual' && property.individualProperty) {
      return {
        type: 'Individual',
        name: property.individualProperty.title || 'Unnamed Property',
        description: property.individualProperty.description,
        city: property.individualProperty.city,
        location: property.individualProperty.location,
        fullLocation: `${property.individualProperty.location}, ${property.individualProperty.city}`,
        propertyType: property.individualProperty.propertyType,
        transactionType: property.individualProperty.transaction?.type,
        price: property.individualProperty.transaction?.price || 0,
        advanceAmount: property.individualProperty.transaction?.advanceAmount || 0,
        monthlyRent: property.individualProperty.transaction?.monthlyRent || 0,
        monthlyInstallment: property.individualProperty.transaction?.monthlyInstallment || 0,
        contractDuration: property.individualProperty.transaction?.contractDuration,
        bookingAmount: property.individualProperty.transaction?.bookingAmount,
        downPayment: property.individualProperty.transaction?.downPayment,
        tenure: property.individualProperty.transaction?.tenure,
        totalPayable: property.individualProperty.transaction?.totalPayable,
        additionalInfo: property.individualProperty.transaction?.additionalInfo,
        images: property.individualProperty.images || [],
        contact: property.individualProperty.contact || {},
        utilities: property.individualProperty.utilities || {},
        amenities: property.individualProperty.amenities || {},
        bedrooms: property.individualProperty.bedrooms,
        bathrooms: property.individualProperty.bathrooms,
        areaSize: property.individualProperty.areaSize,
        areaUnit: property.individualProperty.areaUnit,
        kitchenType: property.individualProperty.kitchenType,
        furnishingStatus: property.individualProperty.furnishingStatus,
        floor: property.individualProperty.floor,
        totalFloors: property.individualProperty.totalFloors,
        possessionStatus: property.individualProperty.possessionStatus,
        zoningType: property.individualProperty.zoningType,
        nearbyLandmarks: property.individualProperty.nearbyLandmarks,
      };
    }
    return null;
  };

  const propData = getPropertyData();

  const nextImage = () => {
    if (propData?.images && propData.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % propData.images.length);
    }
  };

  const prevImage = () => {
    if (propData?.images && propData.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + propData.images.length) % propData.images.length);
    }
  };

  if (loading) {
    return <PageLoader text="Loading property details..." />;
  }

  if (!property || !propData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-6">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/property')}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  // Utility icons mapping
  const utilityIcons = {
    electricity: { icon: Zap, label: 'Electricity' },
    water: { icon: Droplet, label: 'Water Supply' },
    gas: { icon: Flame, label: 'Gas Connection' },
    internet: { icon: Wifi, label: 'Internet/Broadband' },
    sewage: { icon: Trash2, label: 'Sewage System' },
  };

  // Amenity icons mapping
  const amenityIcons = {
    security: { icon: Shield, label: '24/7 Security' },
    cctv: { icon: Camera, label: 'CCTV Surveillance' },
    fireSafety: { icon: LifeBuoy, label: 'Fire Safety' },
    parks: { icon: TreeDeciduous, label: 'Parks' },
    playground: { icon: Baby, label: 'Playground' },
    clubhouse: { icon: Home, label: 'Clubhouse' },
    gym: { icon: Dumbbell, label: 'Gym' },
    swimmingPool: { icon: Eye, label: 'Swimming Pool' },
    mosque: { icon: Church, label: 'Mosque' },
    school: { icon: School, label: 'School' },
    medical: { icon: Hospital, label: 'Medical Center' },
    parking: { icon: ParkingCircle, label: 'Parking' },
    evCharging: { icon: Zap, label: 'EV Charging' },
    wasteManagement: { icon: Trash2, label: 'Waste Management' },
    elevator: { icon: Building2, label: 'Elevator' },
  };

  const activeUtilities = Object.entries(propData.utilities || {})
    .filter(([key, value]) => value === true)
    .map(([key]) => utilityIcons[key])
    .filter(Boolean);

  const activeAmenities = Object.entries(propData.amenities || {})
    .filter(([key, value]) => value === true)
    .map(([key]) => amenityIcons[key])
    .filter(Boolean);

  const transactionLabel = propData.transactionType === 'Sale' ? 'For Sale' :
                          propData.transactionType === 'Rent' ? 'For Rent' :
                          propData.transactionType === 'Installment' ? 'On Installment' : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header with Actions */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <button
            onClick={() => navigate('/property')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold hover:bg-gray-100 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Properties
          </button>
          <button
            onClick={() => navigate(`/property/edit/${id}`)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
          >
            <Edit className="w-5 h-5" />
            Edit Property
          </button>
        </div>

        {/* Property Type Badge */}
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
            {propData.type === 'Project' ? '🏗️ Project' : '🏠 Individual Property'}
          </span>
          {propData.type === 'Project' && propData.projectType && (
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
              {propData.projectType}
            </span>
          )}
          {propData.type === 'Individual' && propData.propertyType && (
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
              {propData.propertyType}
            </span>
          )}
        </div>

        {/* Image Gallery */}
        {propData.images && propData.images.length > 0 && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
            <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-gray-100 to-gray-200">
              <img
                src={propData.images[currentImageIndex]}
                alt={propData.name}
                className="w-full h-full object-cover"
              />
              
              {propData.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-900" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-900" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {propData.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="absolute top-4 right-4">
                <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                  propData.transactionType === 'Sale' ? 'bg-green-500 text-white' :
                  propData.transactionType === 'Rent' ? 'bg-blue-500 text-white' :
                  'bg-orange-500 text-white'
                }`}>
                  {transactionLabel}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {propData.images.length > 1 && (
              <div className="p-4 bg-gray-50 flex gap-2 overflow-x-auto">
                {propData.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? 'border-red-600 scale-110' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title and Basic Info */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{propData.name}</h1>
              
              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <MapPin className="w-5 h-5 text-red-600" />
                <span className="text-lg">{propData.fullLocation || propData.location || propData.city}</span>
              </div>

              {/* Stats for Individual Property */}
              {propData.type === 'Individual' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {propData.bedrooms > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                      <Bed className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{propData.bedrooms}</p>
                        <p className="text-xs text-gray-600">Bedrooms</p>
                      </div>
                    </div>
                  )}
                  {propData.bathrooms > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                      <Bath className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{propData.bathrooms}</p>
                        <p className="text-xs text-gray-600">Bathrooms</p>
                      </div>
                    </div>
                  )}
                  {propData.areaSize && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                      <Maximize className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="text-lg font-bold text-gray-900">{propData.areaSize} {propData.areaUnit}</p>
                        <p className="text-xs text-gray-600">Area</p>
                      </div>
                    </div>
                  )}
                  {propData.totalFloors > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
                      <Building2 className="w-6 h-6 text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{propData.floor}/{propData.totalFloors}</p>
                        <p className="text-xs text-gray-600">Floor</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stats for Project */}
              {propData.type === 'Project' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {propData.totalLandArea && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                      <Maximize className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="text-lg font-bold text-gray-900">{propData.totalLandArea}</p>
                        <p className="text-xs text-gray-600">Total Area</p>
                      </div>
                    </div>
                  )}
                  {propData.totalUnits > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                      <Building2 className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{propData.totalUnits}</p>
                        <p className="text-xs text-gray-600">Total Units</p>
                      </div>
                    </div>
                  )}
                  {propData.typicalUnitSizes && (
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                      <Home className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{propData.typicalUnitSizes}</p>
                        <p className="text-xs text-gray-600">Unit Sizes</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {propData.description && (
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {propData.description}
                  </p>
                </div>
              )}
            </div>

            {/* Highlights (Project only) */}
            {propData.type === 'Project' && propData.highlights && propData.highlights.filter(h => h).length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Highlights</h2>
                <ul className="space-y-3">
                  {propData.highlights.filter(h => h).map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Property Types Available (Project only) */}
            {propData.type === 'Project' && propData.propertyTypesAvailable && propData.propertyTypesAvailable.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Types Available</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {propData.propertyTypesAvailable.map((type, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                      <Home className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-900">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Property Features (Individual only) */}
            {propData.type === 'Individual' && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Features</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {propData.kitchenType && <DetailItem label="Kitchen Type" value={propData.kitchenType} />}
                  {propData.furnishingStatus && <DetailItem label="Furnishing" value={propData.furnishingStatus} />}
                  {propData.possessionStatus && <DetailItem label="Possession Status" value={propData.possessionStatus} />}
                  {propData.zoningType && <DetailItem label="Zoning Type" value={propData.zoningType} />}
                </div>
              </div>
            )}

            {/* Project Details (Project only) */}
            {propData.type === 'Project' && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Details</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {propData.developmentType && <DetailItem label="Development Type" value={propData.developmentType} />}
                  {propData.infrastructureStatus && <DetailItem label="Infrastructure" value={propData.infrastructureStatus} />}
                  {propData.projectStage && <DetailItem label="Project Stage" value={propData.projectStage} />}
                  {propData.expectedCompletionDate && <DetailItem label="Expected Completion" value={propData.expectedCompletionDate} />}
                </div>
                
                {propData.remarks && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-500 mb-2">Remarks / Notes</h3>
                    <p className="text-gray-700">{propData.remarks}</p>
                  </div>
                )}
              </div>
            )}

            {/* Utilities */}
            {activeUtilities.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Utilities Available</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {activeUtilities.map(({ icon: Icon, label }, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                      <Icon className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-900">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {activeAmenities.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities & Facilities</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {activeAmenities.map(({ icon: Icon, label }, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                      <Icon className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-gray-900">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Landmarks */}
            {propData.nearbyLandmarks && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Nearby Landmarks</h2>
                <p className="text-gray-700 leading-relaxed">{propData.nearbyLandmarks}</p>
              </div>
            )}
          </div>

          {/* Right Column - Price and Contact */}
          <div className="space-y-6">
            
            {/* Price Card */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-8 shadow-2xl text-white sticky top-6">
              <div className="mb-6">
                <p className="text-red-100 text-sm font-medium mb-2">
                  {propData.transactionType === 'Rent' ? 'Monthly Rent' : 
                   propData.transactionType === 'Installment' ? 'Total Price' : 'Price'}
                </p>
                <p className="text-5xl font-bold mb-2">
                  Rs {(propData.transactionType === 'Rent' ? propData.monthlyRent : propData.price)?.toLocaleString() || '0'}
                </p>
                {propData.transactionType === 'Rent' && (
                  <p className="text-red-100 text-sm">per month</p>
                )}
              </div>

              {/* Rent Details */}
              {propData.transactionType === 'Rent' && (
                <div className="pt-6 border-t border-red-500 space-y-3">
                  {propData.advanceAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-100">Advance Amount:</span>
                      <span className="font-semibold">Rs {propData.advanceAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {propData.contractDuration && (
                    <div className="flex justify-between">
                      <span className="text-red-100">Contract Duration:</span>
                      <span className="font-semibold">{propData.contractDuration}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Installment Details */}
              {propData.transactionType === 'Installment' && (
                <div className="pt-6 border-t border-red-500 space-y-3">
                  {propData.bookingAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-100">Booking Amount:</span>
                      <span className="font-semibold">Rs {propData.bookingAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {propData.downPayment > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-100">Down Payment:</span>
                      <span className="font-semibold">Rs {propData.downPayment.toLocaleString()}</span>
                    </div>
                  )}
                  {propData.monthlyInstallment > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-100">Monthly Installment:</span>
                      <span className="font-semibold">Rs {propData.monthlyInstallment.toLocaleString()}</span>
                    </div>
                  )}
                  {propData.tenure && (
                    <div className="flex justify-between">
                      <span className="text-red-100">Tenure:</span>
                      <span className="font-semibold">{propData.tenure}</span>
                    </div>
                  )}
                  {propData.totalPayable > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-100">Total Payable:</span>
                      <span className="font-semibold">Rs {propData.totalPayable.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {propData.additionalInfo && (
                <div className="mt-6 pt-6 border-t border-red-500">
                  <p className="text-red-100 text-sm mb-2">Additional Info:</p>
                  <p className="text-white text-sm">{propData.additionalInfo}</p>
                </div>
              )}
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-3">
                {propData.contact.name && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Name</p>
                    <p className="font-semibold text-gray-900">{propData.contact.name}</p>
                  </div>
                )}
                {propData.contact.number && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="font-semibold text-gray-900">{propData.contact.number}</p>
                  </div>
                )}
                {propData.contact.whatsapp && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">WhatsApp</p>
                    <p className="font-semibold text-gray-900">{propData.contact.whatsapp}</p>
                  </div>
                )}
                {propData.contact.email && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">{propData.contact.email}</p>
                  </div>
                )}
                {propData.contact.cnic && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">CNIC</p>
                    <p className="font-semibold text-gray-900">{propData.contact.cnic}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Property ID Card */}
            {propData.contact.propertyId && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Property ID</h3>
                <p className="text-2xl font-mono font-bold text-red-600">{propData.contact.propertyId}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-semibold text-gray-900">{value || 'N/A'}</p>
  </div>
);

export default PropertyDetail;
