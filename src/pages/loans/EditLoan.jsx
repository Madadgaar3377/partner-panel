import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, DollarSign, Briefcase, User, FileText, Upload } from 'lucide-react';
import apiUrl from '../../constants/apiUrl';
import Navbar from '../../components/Navbar';

const EditLoan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    date: '',
    loanType: '',
    employmentType: '',
    loanImages: [],
    name: '',
    email: '',
    phone: '',
    city: '',
    netSalary: '',
    otherSrcOfIncome: '',
    monthlyIncomeFromOtherSrc: '',
    relevantExperience: '',
    lenOfCurrentEmpOrBusiness: '',
    age: '',
    qualification: '',
    residenceInfo: '',
    residenceType: '',
    materialStatus: '',
    noOfDependents: '',
    vehicleOwnershipStatus: '',
    noOfConsumersLoanCurrAvailed: '',
    appliedLoanBefore: '',
    previousLoanHistory: '',
    offerAnyTangibleAsset: '',
    equityContributionPer: '',
    guarantorsForLoanRepayment: '',
    equityStatusOfAvalOwnership: '',
    eduBackground: '',
    businessStructure: '',
    incomeBracket: '',
    compositionOfIncome: '',
    netWorthAvailCapital: '',
    ownerOfAvailableCollateral: '',
    equityInvestment: '',
    equityOwnerShip: '',
    anyBankFinancing: '',
    haveOrHasfeasibilityReportForIdea: '',
    personInvolvedInBusiness: '',
    remunerationOwnersPartnersDirectors: ''
  });

  useEffect(() => {
    fetchLoanData();
  }, [id]);

  const fetchLoanData = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${apiUrl}/getAllLoans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const loan = data.loans?.find(l => l._id === id);
        if (loan) {
          setForm({
            ...loan,
            date: loan.date ? new Date(loan.date).toISOString().split('T')[0] : ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching loan:', error);
      setError('Failed to load loan data');
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('userToken');
        const response = await fetch(`${apiUrl}/upload-image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        const data = await response.json();
        if (data.success && data.imageUrl) {
          uploadedUrls.push(data.imageUrl);
        }
      }

      setForm(prev => ({
        ...prev,
        loanImages: [...(prev.loanImages || []), ...uploadedUrls]
      }));
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Failed to upload images');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      loanImages: (prev.loanImages || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${apiUrl}/updateLoan/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage('Loan plan updated successfully!');
        setTimeout(() => {
          navigate('/loans');
        }, 2000);
      } else {
        setError(result.message || 'Failed to update loan plan');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    setError(null);
    setStep(prev => Math.min(prev + 1, getTotalSteps()));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const getTotalSteps = () => {
    if (form.employmentType === 'Startup') return 5;
    return 4;
  };

  // Reusable Components
  const StepHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-purple-100">
      <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
  );

  const InputField = ({ label, name, type = "text", value, onChange, placeholder, className = "", options }) => (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      {options ? (
        <select
          name={name}
          value={value || ''}
          onChange={onChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        >
          <option value="">Select {label}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      )}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <StepHeader icon={DollarSign} title="Basic Loan Information" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleInput}
              />
              <InputField
                label="Loan Type"
                name="loanType"
                value={form.loanType}
                onChange={handleInput}
                options={['Personal Loan', 'Business Loan', 'Home Loan', 'Car Loan', 'Education Loan', 'Startup Loan']}
              />
              <InputField
                label="Employment Type"
                name="employmentType"
                value={form.employmentType}
                onChange={handleInput}
                options={['Salaried', 'Self-Employed', 'Startup', 'Business Owner']}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <StepHeader icon={User} title="Personal Information" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Full Name" name="name" value={form.name} onChange={handleInput} />
              <InputField label="Email Address" name="email" type="email" value={form.email} onChange={handleInput} />
              <InputField label="Phone Number" name="phone" value={form.phone} onChange={handleInput} />
              <InputField label="City" name="city" value={form.city} onChange={handleInput} />
              <InputField label="Age" name="age" type="number" value={form.age} onChange={handleInput} />
              <InputField label="Qualification" name="qualification" value={form.qualification} onChange={handleInput} />
              <InputField
                label="Marital Status"
                name="materialStatus"
                value={form.materialStatus}
                onChange={handleInput}
                options={['Single', 'Married', 'Divorced', 'Widowed']}
              />
              <InputField
                label="Number of Dependents"
                name="noOfDependents"
                type="number"
                value={form.noOfDependents}
                onChange={handleInput}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <StepHeader icon={Briefcase} title="Employment & Financial Details" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(form.employmentType === 'Salaried' || form.employmentType === 'Self-Employed') && (
                <>
                  <InputField
                    label="Net Salary / Monthly Income"
                    name="netSalary"
                    value={form.netSalary}
                    onChange={handleInput}
                  />
                  <InputField
                    label="Relevant Experience (Years)"
                    name="relevantExperience"
                    value={form.relevantExperience}
                    onChange={handleInput}
                  />
                  <InputField
                    label="Length of Current Employment"
                    name="lenOfCurrentEmpOrBusiness"
                    value={form.lenOfCurrentEmpOrBusiness}
                    onChange={handleInput}
                  />
                </>
              )}
              
              <InputField
                label="Other Sources of Income"
                name="otherSrcOfIncome"
                value={form.otherSrcOfIncome}
                onChange={handleInput}
              />
              <InputField
                label="Monthly Income from Other Sources"
                name="monthlyIncomeFromOtherSrc"
                value={form.monthlyIncomeFromOtherSrc}
                onChange={handleInput}
              />
              <InputField
                label="Residence Type"
                name="residenceType"
                value={form.residenceType}
                onChange={handleInput}
                options={['Owned', 'Rented', 'Family Owned', 'Company Provided']}
              />
              <InputField
                label="Residence Information"
                name="residenceInfo"
                value={form.residenceInfo}
                onChange={handleInput}
              />
              <InputField
                label="Vehicle Ownership Status"
                name="vehicleOwnershipStatus"
                value={form.vehicleOwnershipStatus}
                onChange={handleInput}
                options={['Own', 'Leased', 'None']}
              />
              <InputField
                label="Number of Consumer Loans Currently Availed"
                name="noOfConsumersLoanCurrAvailed"
                type="number"
                value={form.noOfConsumersLoanCurrAvailed}
                onChange={handleInput}
              />
            </div>
          </div>
        );

      case 4:
        if (form.employmentType === 'Startup') {
          return (
            <div className="space-y-6 animate-in slide-in-from-right duration-500">
              <StepHeader icon={FileText} title="Startup-Specific Information" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Educational Background" name="eduBackground" value={form.eduBackground} onChange={handleInput} />
                <InputField
                  label="Business Structure"
                  name="businessStructure"
                  value={form.businessStructure}
                  onChange={handleInput}
                  options={['Sole Proprietorship', 'Partnership', 'Private Limited', 'Public Limited']}
                />
                <InputField label="Income Bracket" name="incomeBracket" value={form.incomeBracket} onChange={handleInput} />
                <InputField label="Composition of Income" name="compositionOfIncome" value={form.compositionOfIncome} onChange={handleInput} />
                <InputField label="Net Worth / Available Capital" name="netWorthAvailCapital" value={form.netWorthAvailCapital} onChange={handleInput} />
                <InputField
                  label="Owner of Available Collateral"
                  name="ownerOfAvailableCollateral"
                  value={form.ownerOfAvailableCollateral}
                  onChange={handleInput}
                  options={['Yes', 'No']}
                />
                <InputField label="Equity Investment" name="equityInvestment" value={form.equityInvestment} onChange={handleInput} />
                <InputField label="Equity Ownership %" name="equityOwnerShip" value={form.equityOwnerShip} onChange={handleInput} />
                <InputField
                  label="Any Bank Financing"
                  name="anyBankFinancing"
                  value={form.anyBankFinancing}
                  onChange={handleInput}
                  options={['Yes', 'No']}
                />
                <InputField
                  label="Have Feasibility Report"
                  name="haveOrHasfeasibilityReportForIdea"
                  value={form.haveOrHasfeasibilityReportForIdea}
                  onChange={handleInput}
                  options={['Yes', 'No']}
                />
                <InputField
                  label="Persons Involved in Business"
                  name="personInvolvedInBusiness"
                  type="number"
                  value={form.personInvolvedInBusiness}
                  onChange={handleInput}
                />
                <InputField
                  label="Remuneration for Owners/Partners/Directors"
                  name="remunerationOwnersPartnersDirectors"
                  value={form.remunerationOwnersPartnersDirectors}
                  onChange={handleInput}
                />
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-6 animate-in slide-in-from-right duration-500">
              <StepHeader icon={FileText} title="Additional Information & Documents" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Applied for Loan Before?"
                  name="appliedLoanBefore"
                  value={form.appliedLoanBefore}
                  onChange={handleInput}
                  options={['Yes', 'No']}
                />
                <InputField
                  label="Previous Loan History"
                  name="previousLoanHistory"
                  value={form.previousLoanHistory}
                  onChange={handleInput}
                  className="md:col-span-2"
                />
                <InputField
                  label="Offer Any Tangible Asset as Collateral?"
                  name="offerAnyTangibleAsset"
                  value={form.offerAnyTangibleAsset}
                  onChange={handleInput}
                  options={['Yes', 'No']}
                />
                <InputField
                  label="Equity Contribution %"
                  name="equityContributionPer"
                  value={form.equityContributionPer}
                  onChange={handleInput}
                />
                <InputField
                  label="Guarantors for Loan Repayment"
                  name="guarantorsForLoanRepayment"
                  value={form.guarantorsForLoanRepayment}
                  onChange={handleInput}
                />
                <InputField
                  label="Equity Status of Available Ownership"
                  name="equityStatusOfAvalOwnership"
                  value={form.equityStatusOfAvalOwnership}
                  onChange={handleInput}
                />
              </div>

              {/* Image Upload */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Upload Documents / Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-all">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="loanImageUpload"
                  />
                  <label htmlFor="loanImageUpload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700">
                      {uploadingImage ? 'Uploading...' : 'Click to upload images'}
                    </p>
                  </label>
                </div>

                {/* Image Preview */}
                {form.loanImages && form.loanImages.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-4">
                    {form.loanImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img src={url} alt={`Document ${index + 1}`} className="w-full h-24 object-cover rounded-lg border-2 border-gray-200" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }

      case 5:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <StepHeader icon={Upload} title="Documents & Final Details" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Applied for Loan Before?"
                name="appliedLoanBefore"
                value={form.appliedLoanBefore}
                onChange={handleInput}
                options={['Yes', 'No']}
              />
              <InputField label="Previous Loan History" name="previousLoanHistory" value={form.previousLoanHistory} onChange={handleInput} />
              <InputField
                label="Offer Any Tangible Asset?"
                name="offerAnyTangibleAsset"
                value={form.offerAnyTangibleAsset}
                onChange={handleInput}
                options={['Yes', 'No']}
              />
              <InputField label="Guarantors for Loan Repayment" name="guarantorsForLoanRepayment" value={form.guarantorsForLoanRepayment} onChange={handleInput} />
            </div>

            {/* Image Upload */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Upload Documents / Images</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-all">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="loanImageUpload" />
                <label htmlFor="loanImageUpload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">{uploadingImage ? 'Uploading...' : 'Click to upload images'}</p>
                </label>
              </div>

              {form.loanImages && form.loanImages.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-4">
                  {form.loanImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img src={url} alt={`Document ${index + 1}`} className="w-full h-24 object-cover rounded-lg border-2 border-gray-200" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-semibold">Loading loan data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-purple-100 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Edit Loan Plan</h1>
              <p className="text-gray-600">Update loan details</p>
            </div>
            <button
              onClick={() => navigate('/loans')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to List
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            {[...Array(getTotalSteps())].map((_, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                  step > index + 1 ? 'bg-green-500 text-white' :
                  step === index + 1 ? 'bg-purple-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > index + 1 ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                {index < getTotalSteps() - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${step > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">{error}</div>}
        {message && <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-6">{message}</div>}

        {/* Form */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>

            {step < getTotalSteps() ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {submitting ? 'Updating...' : 'Update Loan Plan'}
                <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLoan;

