import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Bed, Bath, DollarSign, Eye, Edit, Trash2, Plus, Search, Filter, TrendingUp } from 'lucide-react';
import apiUrl from '../../constants/apiUrl';
import Navbar from '../../components/Navbar';
import { PageLoader } from '../../components/Loader';

const PropertyList = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterPurpose, setFilterPurpose] = useState('All');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${apiUrl}/getPropertiesByUserId`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${apiUrl}/deleteProperty/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProperties(properties.filter(prop => prop._id !== id));
      }
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  // Helper function to get property data
  const getPropertyData = (property) => {
    if (property.type === 'Project' && property.project) {
      return {
        name: property.project.projectName || 'Unnamed Project',
        city: property.project.city || '',
        type: 'Project',
        transactionType: property.project.transaction?.type || '',
        price: property.project.transaction?.price || 0,
        monthlyRent: property.project.transaction?.monthlyRent || 0,
        monthlyInstallment: property.project.transaction?.monthlyInstallment || 0,
        images: property.project.images || [],
        propertyType: property.project.projectType || 'Project'
      };
    } else if (property.type === 'Individual' && property.individualProperty) {
      return {
        name: property.individualProperty.title || 'Unnamed Property',
        city: property.individualProperty.city || '',
        type: 'Individual',
        transactionType: property.individualProperty.transaction?.type || '',
        price: property.individualProperty.transaction?.price || 0,
        monthlyRent: property.individualProperty.transaction?.monthlyRent || 0,
        monthlyInstallment: property.individualProperty.transaction?.monthlyInstallment || 0,
        images: property.individualProperty.images || [],
        propertyType: property.individualProperty.propertyType || 'Individual Property',
        bedrooms: property.individualProperty.bedrooms || 0,
        bathrooms: property.individualProperty.bathrooms || 0,
        areaSize: property.individualProperty.areaSize || '',
        areaUnit: property.individualProperty.areaUnit || ''
      };
    }
    return null;
  };

  const filteredProperties = properties.filter(property => {
    const propData = getPropertyData(property);
    if (!propData) return false;
    
    const matchesSearch = propData.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         propData.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || property.type === filterType;
    const matchesPurpose = filterPurpose === 'All' || propData.transactionType === filterPurpose;
    return matchesSearch && matchesType && matchesPurpose;
  });

  const stats = {
    total: properties.length,
    forSale: properties.filter(p => {
      const propData = getPropertyData(p);
      return propData?.transactionType === 'Sale';
    }).length,
    forRent: properties.filter(p => {
      const propData = getPropertyData(p);
      return propData?.transactionType === 'Rent';
    }).length,
    onInstallment: properties.filter(p => {
      const propData = getPropertyData(p);
      return propData?.transactionType === 'Installment';
    }).length,
  };

  if (loading) {
    return <PageLoader text="Loading properties..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-red-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Properties</h1>
              <p className="text-gray-600">View and manage your property listings - Total: {stats.total}</p>
            </div>
            <button
              onClick={() => navigate('/property/create')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add New Property
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Properties</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">For Sale</p>
                <p className="text-3xl font-bold">{stats.forSale}</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">For Rent</p>
                <p className="text-3xl font-bold">{stats.forRent}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">On Installment</p>
                <p className="text-3xl font-bold">{stats.onInstallment}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by property name or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
              >
                <option value="All">All Types</option>
                <option value="Project">🏗️ Project</option>
                <option value="Individual">🏠 Individual Property</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterPurpose}
                onChange={(e) => setFilterPurpose(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
              >
                <option value="All">All Transaction Types</option>
                <option value="Sale">For Sale</option>
                <option value="Rent">For Rent</option>
                <option value="Installment">On Installment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-600 mb-6">Start by adding your first property listing</p>
            <button
              onClick={() => navigate('/property/create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Property
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => {
              const propData = getPropertyData(property);
              if (!propData) return null;

              return (
                <div
                  key={property._id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    {propData.images && propData.images.length > 0 ? (
                      <img
                        src={propData.images[0]}
                        alt={propData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white">
                        {property.type === 'Project' ? '🏗️ Project' : '🏠 Individual'}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        propData.transactionType === 'Sale' ? 'bg-green-500 text-white' :
                        propData.transactionType === 'Rent' ? 'bg-blue-500 text-white' :
                        'bg-orange-500 text-white'
                      }`}>
                        {propData.transactionType === 'Sale' ? 'For Sale' :
                         propData.transactionType === 'Rent' ? 'For Rent' :
                         'On Installment'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                        {propData.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        {propData.propertyType}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 text-red-600" />
                      <span className="text-sm line-clamp-1">
                        {propData.city || 'Location not specified'}
                      </span>
                    </div>

                    {propData.type === 'Individual' && (
                      <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-100">
                        {propData.bedrooms > 0 && (
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-semibold">{propData.bedrooms}</span>
                          </div>
                        )}
                        {propData.bathrooms > 0 && (
                          <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-semibold">{propData.bathrooms}</span>
                          </div>
                        )}
                        {propData.areaSize && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-semibold text-gray-700">
                              {propData.areaSize} {propData.areaUnit}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mb-4">
                      {propData.transactionType === 'Sale' && propData.price > 0 && (
                        <p className="text-2xl font-bold text-red-600">
                          Rs {propData.price.toLocaleString()}
                        </p>
                      )}
                      {propData.transactionType === 'Rent' && (
                        <>
                          <p className="text-2xl font-bold text-red-600">
                            Rs {propData.monthlyRent.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">per month</p>
                        </>
                      )}
                      {propData.transactionType === 'Installment' && (
                        <>
                          <p className="text-2xl font-bold text-red-600">
                            Rs {propData.price.toLocaleString()}
                          </p>
                          {propData.monthlyInstallment > 0 && (
                            <p className="text-sm text-gray-600">
                              Rs {propData.monthlyInstallment.toLocaleString()}/month
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => navigate(`/property/view/${property._id}`)}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-xs font-semibold">View</span>
                      </button>
                      <button
                        onClick={() => navigate(`/property/edit/${property._id}`)}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-xs font-semibold">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(property._id)}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs font-semibold">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyList;
