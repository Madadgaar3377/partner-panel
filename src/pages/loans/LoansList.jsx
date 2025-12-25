import React from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const LoansList = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Loans</h1>
            <p className="text-gray-600 mt-1">Manage loan offerings</p>
          </div>
          <button
            onClick={() => navigate('/loans/create')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create Loan
          </button>
        </div>

        <div className="glass-red rounded-xl shadow-lg p-8 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Loans Available</h3>
          <p className="text-gray-600 mb-6">Create your first loan offering</p>
          <button
            onClick={() => navigate('/loans/create')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
          >
            Create First Loan
          </button>
        </div>
      </main>
    </div>
  );
};

export default LoansList;

