import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2, MapPin, Bed, Bath, Home, DollarSign, Calendar, Eye, Edit, ArrowLeft,
  Maximize, Car, Zap, CheckCircle, TreeDeciduous, Dumbbell, Users, Baby, Church,
  School, Hospital, ShoppingBag, Bus, ChevronLeft, ChevronRight
} from 'lucide-react';
import apiUrl from '../../constants/apiUrl';
import Navbar from '../../components/Navbar';

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
      
      if (data.success && data.property) {
        setProperty(data.property);
      }
    } catch (error) {
      console.error('Error fetching property details:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-semibold">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
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

  const amenities = [
    { key: 'communityLawn', label: 'Community Lawn', icon: TreeDeciduous },
    { key: 'communityPool', label: 'Swimming Pool', icon: Eye },
    { key: 'communityGym', label: 'Gym', icon: Dumbbell },
    { key: 'mosque', label: 'Mosque', icon: Church },
    { key: 'kidsPlayArea', label: 'Kids Play Area', icon: Baby },
    { key: 'medicalCentre', label: 'Medical Centre', icon: Hospital },
    { key: 'dayCare', label: 'Day Care', icon: Users },
    { key: 'bbqArea', label: 'BBQ Area', icon: Home },
    { key: 'communityCentre', label: 'Community Centre', icon: Building2 },
  ];

  const activeAmenities = amenities.filter(amenity => property[amenity.key] === 'Yes');

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

        {/* Image Gallery */}
        {property.images && property.images.length > 0 && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
            <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-gray-100 to-gray-200">
              <img
                src={property.images[currentImageIndex]}
                alt={property.name}
                className="w-full h-full object-cover"
              />
              
              {property.images.length > 1 && (
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
                    {property.images.map((_, index) => (
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
                  property.purpose === 'For Sale' ? 'bg-green-500 text-white' :
                  property.purpose === 'For Rent' ? 'bg-blue-500 text-white' :
                  'bg-orange-500 text-white'
                }`}>
                  {property.purpose}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {property.images.length > 1 && (
              <div className="p-4 bg-gray-50 flex gap-2 overflow-x-auto">
                {property.images.map((img, index) => (
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
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{property.name}</h1>
              
              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <MapPin className="w-5 h-5 text-red-600" />
                <span className="text-lg">{property.address}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {property.bedRooms && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <Bed className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{property.bedRooms}</p>
                      <p className="text-xs text-gray-600">Bedrooms</p>
                    </div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                    <Bath className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                      <p className="text-xs text-gray-600">Bathrooms</p>
                    </div>
                  </div>
                )}
                {property.areaSize && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                    <Maximize className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-lg font-bold text-gray-900">{property.areaSize}</p>
                      <p className="text-xs text-gray-600">Area</p>
                    </div>
                  </div>
                )}
                {property.floors && (
                  <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
                    <Building2 className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{property.floors}</p>
                      <p className="text-xs text-gray-600">Floors</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {property.adDescription || property.otherDetails || 'No description available'}
                </p>
              </div>
            </div>

            {/* Property Features */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Features</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <DetailItem label="Property Type" value={property.typeOfProperty} />
                <DetailItem label="Project Type" value={property.typeOfProject} />
                <DetailItem label="Plot Stage" value={property.plotStage} />
                <DetailItem label="Possession" value={property.possessionType} />
                <DetailItem label="Flooring" value={property.flooring} />
                <DetailItem label="Furnished" value={property.furnished} />
                {property.parkingSpace && <DetailItem label="Parking" value={property.parkingSpace} />}
                {property.electricityBackup && <DetailItem label="Backup" value={property.electricityBackup} />}
                {property.wasteDisposal && <DetailItem label="Waste Disposal" value={property.wasteDisposal} />}
                {property.view && <DetailItem label="View" value={property.view} />}
                {property.builtInYear && <DetailItem label="Built Year" value={property.builtInYear} />}
              </div>
            </div>

            {/* Room Details */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Room Details</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.kitchens && <RoomBadge label="Kitchens" count={property.kitchens} />}
                {property.drawingRooms && <RoomBadge label="Drawing Rooms" count={property.drawingRooms} />}
                {property.diningRooms && <RoomBadge label="Dining Rooms" count={property.diningRooms} />}
                {property.storeRooms && <RoomBadge label="Store Rooms" count={property.storeRooms} />}
                {property.studyRooms && <RoomBadge label="Study Rooms" count={property.studyRooms} />}
                {property.prayerRooms && <RoomBadge label="Prayer Rooms" count={property.prayerRooms} />}
                {property.servantQuarters && <RoomBadge label="Servant Quarters" count={property.servantQuarters} />}
                {property.sittingRooms && <RoomBadge label="Sitting Rooms" count={property.sittingRooms} />}
              </div>
            </div>

            {/* Amenities */}
            {activeAmenities.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Amenities</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {activeAmenities.map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                      <Icon className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-gray-900">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Facilities */}
            {(property.nearBySchools || property.nearByHospitals || property.nearByShoppingMalls || property.nearByPublicTransport) && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Nearby Facilities</h2>
                
                <div className="space-y-4">
                  {property.nearBySchools && (
                    <NearbyItem icon={School} label="Schools" value={property.nearBySchools} />
                  )}
                  {property.nearByHospitals && (
                    <NearbyItem icon={Hospital} label="Hospitals" value={property.nearByHospitals} />
                  )}
                  {property.nearByShoppingMalls && (
                    <NearbyItem icon={ShoppingBag} label="Shopping Malls" value={property.nearByShoppingMalls} />
                  )}
                  {property.nearByPublicTransport && (
                    <NearbyItem icon={Bus} label="Public Transport" value={property.nearByPublicTransport} />
                  )}
                  {property.nearByColleges && (
                    <NearbyItem icon={School} label="Colleges" value={property.nearByColleges} />
                  )}
                  {property.nearByUniversity && (
                    <NearbyItem icon={School} label="University" value={property.nearByUniversity} />
                  )}
                  {property.nearByRestaurants && (
                    <NearbyItem icon={Home} label="Restaurants" value={property.nearByRestaurants} />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Price and Contact */}
          <div className="space-y-6">
            
            {/* Price Card */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-8 shadow-2xl text-white sticky top-6">
              <div className="mb-6">
                <p className="text-red-100 text-sm font-medium mb-2">
                  {property.purpose === 'For Rent' ? 'Monthly Rent' : 
                   property.purpose === 'On Installment' ? 'Total Price' : 'Price'}
                </p>
                <p className="text-5xl font-bold mb-2">
                  Rs {property.price?.toLocaleString() || '0'}
                </p>
                {property.purpose === 'For Rent' && (
                  <p className="text-red-100 text-sm">per month</p>
                )}
              </div>

              {/* Show installment details only for "On Installment" purpose */}
              {property.purpose === 'On Installment' && (property.advanceAmount || property.noOfInstallment > 0 || property.monthlyInstallment > 0) && (
                <div className="pt-6 border-t border-red-500 space-y-3">
                  {property.advanceAmount && (
                    <div className="flex justify-between">
                      <span className="text-red-100">Down Payment:</span>
                      <span className="font-semibold">{property.advanceAmount}</span>
                    </div>
                  )}
                  {property.noOfInstallment > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-100">No. of Installments:</span>
                      <span className="font-semibold">{property.noOfInstallment}</span>
                    </div>
                  )}
                  {property.monthlyInstallment > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-100">Monthly Installment:</span>
                      <span className="font-semibold">Rs {property.monthlyInstallment.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Show security deposit for rent */}
              {property.purpose === 'For Rent' && property.advanceAmount && (
                <div className="pt-6 border-t border-red-500">
                  <div className="flex justify-between">
                    <span className="text-red-100">Security Deposit:</span>
                    <span className="font-semibold">{property.advanceAmount}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-3">
                {property.fullName && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Name</p>
                    <p className="font-semibold text-gray-900">{property.fullName}</p>
                  </div>
                )}
                {property.mobile && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Mobile</p>
                    <p className="font-semibold text-gray-900">{property.mobile}</p>
                  </div>
                )}
                {property.email && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">{property.email}</p>
                  </div>
                )}
                {property.landLine && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Landline</p>
                    <p className="font-semibold text-gray-900">{property.landLine}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Property Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Property Info</h3>
              
              <div className="space-y-3">
                {property.duration && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-gray-900">{property.duration}</span>
                  </div>
                )}
                {property.plotSize && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plot Size:</span>
                    <span className="font-semibold text-gray-900">{property.plotSize}</span>
                  </div>
                )}
                {property.readyForPossession && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ready:</span>
                    <span className="font-semibold text-gray-900">{property.readyForPossession}</span>
                  </div>
                )}
              </div>
            </div>
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

const RoomBadge = ({ label, count }) => (
  <div className="p-3 bg-gray-50 rounded-xl text-center">
    <p className="text-2xl font-bold text-gray-900">{count}</p>
    <p className="text-xs text-gray-600">{label}</p>
  </div>
);

const NearbyItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
    <Icon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
      <p className="text-sm text-gray-600">{value}</p>
    </div>
  </div>
);

export default PropertyDetail;

