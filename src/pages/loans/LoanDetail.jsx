import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, DollarSign, User, Briefcase, MapPin, Calendar, Mail, Phone, FileText, CheckCircle, XCircle, Clock, Building2, Home, Car, GraduationCap, TrendingUp } from 'lucide-react';
import apiUrl from '../../constants/apiUrl';
import Navbar from '../../components/Navbar';

const LoanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoanDetail();
  }, [id]);

  const fetchLoanDetail = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${apiUrl}/getAllLoans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const foundLoan = data.loans?.find(l => l._id === id);
        if (foundLoan) {
          setLoan(foundLoan);
        }
      }
    } catch (error) {
      console.error('Error fetching loan:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLoanIcon = (type) => {
    switch(type) {
      case 'Personal Loan': return DollarSign;
      case 'Business Loan': return Briefcase;
      case 'Home Loan': return Home;
      case 'Car Loan': return Car;
      case 'Education Loan': return GraduationCap;
      case 'Startup Loan': return TrendingUp;
      default: return DollarSign;
    }
  };

  const InfoCard = ({ icon: Icon, label, value, className = "" }) => (
    value ? (
      <div className={`flex items-start gap-3 ${className}`}>
        <div className="p-2 bg-purple-100 rounded-lg">
          <Icon className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-base font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    ) : null
  );

  const Section = ({ title, children }) => (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b-2 border-purple-200">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-semibold">Loading loan details...</p>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loan Not Found</h3>
            <p className="text-gray-600 mb-6">The requested loan plan could not be found</p>
            <button
              onClick={() => navigate('/loans')}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
            >
              Back to Loans
            </button>
          </div>
        </div>
      </div>
    );
  }

  const LoanIcon = getLoanIcon(loan.loanType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/loans')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to List
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/loans/edit/${loan._id}`)}
                className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-all shadow-lg"
              >
                Edit Loan
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl">
              <LoanIcon className="w-12 h-12 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{loan.loanType || 'Loan Plan'}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  loan.isVerified 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {loan.isVerified ? <CheckCircle className="w-4 h-4 inline mr-1" /> : <Clock className="w-4 h-4 inline mr-1" />}
                  {loan.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
              <p className="text-gray-600">
                <span className="font-semibold text-purple-600">{loan.employmentType}</span>
                {loan.loanPlanId && <span className="mx-2">•</span>}
                {loan.loanPlanId && <span className="text-sm">ID: {loan.loanPlanId}</span>}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-purple-100 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-600" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loan.date && (
                  <InfoCard
                    icon={Calendar}
                    label="Application Date"
                    value={new Date(loan.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  />
                )}
                <InfoCard icon={Briefcase} label="Employment Type" value={loan.employmentType} />
                <InfoCard icon={DollarSign} label="Loan Type" value={loan.loanType} />
              </div>
            </div>

            {/* Personal Information */}
            {(loan.name || loan.email || loan.phone || loan.city) && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-purple-100 flex items-center gap-2">
                  <User className="w-6 h-6 text-purple-600" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoCard icon={User} label="Full Name" value={loan.name} />
                  <InfoCard icon={Mail} label="Email Address" value={loan.email} />
                  <InfoCard icon={Phone} label="Phone Number" value={loan.phone} />
                  <InfoCard icon={MapPin} label="City" value={loan.city} />
                  <InfoCard icon={User} label="Age" value={loan.age} />
                  <InfoCard icon={GraduationCap} label="Qualification" value={loan.qualification} />
                  <InfoCard icon={User} label="Marital Status" value={loan.materialStatus} />
                  <InfoCard icon={User} label="Dependents" value={loan.noOfDependents} />
                </div>
              </div>
            )}

            {/* Financial Information */}
            {(loan.netSalary || loan.otherSrcOfIncome) && (
              <Section title="Financial Information">
                <InfoCard icon={DollarSign} label="Net Salary / Monthly Income" value={loan.netSalary ? `PKR ${loan.netSalary}` : null} />
                <InfoCard icon={TrendingUp} label="Other Income Sources" value={loan.otherSrcOfIncome} />
                <InfoCard icon={DollarSign} label="Monthly Income (Other Sources)" value={loan.monthlyIncomeFromOtherSrc ? `PKR ${loan.monthlyIncomeFromOtherSrc}` : null} />
                <InfoCard icon={Briefcase} label="Relevant Experience" value={loan.relevantExperience} />
                <InfoCard icon={Calendar} label="Length of Current Employment" value={loan.lenOfCurrentEmpOrBusiness} />
                <InfoCard icon={Home} label="Residence Type" value={loan.residenceType} />
                <InfoCard icon={Home} label="Residence Information" value={loan.residenceInfo} />
                <InfoCard icon={Car} label="Vehicle Ownership" value={loan.vehicleOwnershipStatus} />
                <InfoCard icon={DollarSign} label="Current Consumer Loans" value={loan.noOfConsumersLoanCurrAvailed} />
              </Section>
            )}

            {/* Loan History */}
            {(loan.appliedLoanBefore || loan.previousLoanHistory) && (
              <Section title="Loan History & Collateral">
                <InfoCard icon={FileText} label="Applied for Loan Before" value={loan.appliedLoanBefore} />
                <InfoCard icon={FileText} label="Previous Loan History" value={loan.previousLoanHistory} />
                <InfoCard icon={Building2} label="Tangible Asset Offered" value={loan.offerAnyTangibleAsset} />
                <InfoCard icon={TrendingUp} label="Equity Contribution %" value={loan.equityContributionPer} />
                <InfoCard icon={User} label="Guarantors" value={loan.guarantorsForLoanRepayment} />
                <InfoCard icon={FileText} label="Equity Status" value={loan.equityStatusOfAvalOwnership} />
              </Section>
            )}

            {/* Startup Information */}
            {loan.employmentType === 'Startup' && (
              <Section title="Startup-Specific Information">
                <InfoCard icon={GraduationCap} label="Educational Background" value={loan.eduBackground} />
                <InfoCard icon={Building2} label="Business Structure" value={loan.businessStructure} />
                <InfoCard icon={DollarSign} label="Income Bracket" value={loan.incomeBracket} />
                <InfoCard icon={TrendingUp} label="Composition of Income" value={loan.compositionOfIncome} />
                <InfoCard icon={DollarSign} label="Net Worth / Available Capital" value={loan.netWorthAvailCapital} />
                <InfoCard icon={Building2} label="Owner of Collateral" value={loan.ownerOfAvailableCollateral} />
                <InfoCard icon={DollarSign} label="Equity Investment" value={loan.equityInvestment} />
                <InfoCard icon={TrendingUp} label="Equity Ownership %" value={loan.equityOwnerShip} />
                <InfoCard icon={Building2} label="Bank Financing" value={loan.anyBankFinancing} />
                <InfoCard icon={FileText} label="Feasibility Report" value={loan.haveOrHasfeasibilityReportForIdea} />
                <InfoCard icon={User} label="Persons in Business" value={loan.personInvolvedInBusiness} />
                <InfoCard icon={DollarSign} label="Remuneration (Owners/Partners)" value={loan.remunerationOwnersPartnersDirectors} />
              </Section>
            )}

            {/* Documents */}
            {loan.loanImages && loan.loanImages.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-purple-100 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-purple-600" />
                  Documents & Images
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {loan.loanImages.map((image, index) => (
                    <a
                      key={index}
                      href={image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-all cursor-pointer"
                    >
                      <img
                        src={image}
                        alt={`Document ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 font-semibold">View</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            
            {/* Status Card */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 shadow-2xl text-white sticky top-6">
              <div className="mb-6">
                <p className="text-purple-100 text-sm font-medium mb-2">Loan Plan ID</p>
                <p className="text-3xl font-bold mb-4">{loan.loanPlanId || 'N/A'}</p>
                
                <div className="pt-6 border-t border-purple-500">
                  <p className="text-purple-100 text-sm font-medium mb-2">Status</p>
                  <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold ${
                    loan.isVerified 
                      ? 'bg-green-500 text-white' 
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {loan.isVerified ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Pending Verification
                      </>
                    )}
                  </span>
                </div>
              </div>

              {loan.createdAt && (
                <div className="pt-6 border-t border-purple-500">
                  <p className="text-purple-100 text-sm font-medium mb-2">Created On</p>
                  <p className="font-semibold">
                    {new Date(loan.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              )}

              {loan.updatedAt && loan.updatedAt !== loan.createdAt && (
                <div className="pt-6 border-t border-purple-500">
                  <p className="text-purple-100 text-sm font-medium mb-2">Last Updated</p>
                  <p className="font-semibold">
                    {new Date(loan.updatedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Creator Info */}
            {loan.createdBy && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b-2 border-purple-200">
                  Creator Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Created By</p>
                    <p className="font-semibold text-gray-900">{loan.createdBy}</p>
                  </div>
                  {loan.updatedBy && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Updated By</p>
                      <p className="font-semibold text-gray-900">{loan.updatedBy}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDetail;

