import React from 'react';
import { Plus, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const PropertyList = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Properties</h1>
            <p className="text-gray-600 mt-1">Manage your property listings</p>
          </div>
          <button
            onClick={() => navigate('/property/create')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Property
          </button>
        </div>

        <div className="glass-red rounded-xl shadow-lg p-8 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Properties Listed</h3>
          <p className="text-gray-600 mb-6">Add your first property to get started</p>
          <button
            onClick={() => navigate('/property/create')}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
          >
            Add First Property
          </button>
        </div>
      </main>
    </div>
  );
};

export default PropertyList;

