import React from 'react';
import RichTextEditor from '../RichTextEditor';

/** Partner-styled step 4 tabs */
export const PartnerStep4Tabs = ({ active, onChange }) => (
  <div className="flex flex-wrap gap-2 bg-white rounded-xl p-2 border border-gray-200 shadow-sm">
    {[
      { id: 'installments', label: 'Installment Plans', icon: '📊' },
      { id: 'finance', label: 'Finance', icon: '💰' },
      { id: 'both', label: 'Both', icon: '🔄' },
    ].map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onChange(tab.id)}
        className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
          active === tab.id
            ? 'bg-red-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {tab.icon} {tab.label}
      </button>
    ))}
  </div>
);

/** Product-level finance (step 4 finance / both tab) */
export const ProductFinancePanel = ({ finance, onUpdate }) => (
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
      <span>💰</span> Finance Information
    </h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
        <input
          type="text"
          value={finance?.bankName || ''}
          onChange={(e) => onUpdate('bankName', e.target.value)}
          placeholder="e.g. HBL, UBL, Meezan Bank..."
          className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Finance Information</label>
        <div className="bg-white rounded-lg border border-blue-100">
          <RichTextEditor
            value={finance?.financeInfo || ''}
            onChange={(html) => onUpdate('financeInfo', html)}
            placeholder="Terms, eligibility, conditions..."
          />
        </div>
      </div>
    </div>
  </div>
);

/** Per payment plan finance toggle + fields */
export const PlanFinanceSection = ({ plan, index, setForm }) => {
  const toggleFinance = () => {
    setForm((f) => {
      const pp = [...f.paymentPlans];
      if (!pp[index].hasFinance) {
        pp[index].hasFinance = true;
        if (!pp[index].finance) pp[index].finance = { bankName: '', financeInfo: '' };
      } else {
        pp[index].hasFinance = false;
      }
      return { ...f, paymentPlans: pp };
    });
  };

  const updateFinance = (field, value) => {
    setForm((f) => {
      const pp = [...f.paymentPlans];
      if (!pp[index].finance) pp[index].finance = { bankName: '', financeInfo: '' };
      pp[index].finance[field] = value;
      return { ...f, paymentPlans: pp };
    });
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">Finance / Bank Information</label>
        <button
          type="button"
          onClick={toggleFinance}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            plan.hasFinance
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {plan.hasFinance ? '✓ Finance Enabled' : '+ Add Finance'}
        </button>
      </div>
      {plan.hasFinance && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50/80 rounded-lg border border-blue-100">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bank Name</label>
            <input
              type="text"
              value={plan.finance?.bankName || ''}
              onChange={(e) => updateFinance('bankName', e.target.value)}
              placeholder="e.g. HBL, Meezan Bank"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Finance Information</label>
            <div className="bg-white rounded-lg border border-gray-200">
              <RichTextEditor
                value={plan.finance?.financeInfo || ''}
                onChange={(html) => updateFinance('financeInfo', html)}
                placeholder="Plan-specific finance details..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AddPlanButton = ({ onClick, className = '' }) => (
  <div className={`flex justify-end ${className}`}>
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm"
    >
      + Add Plan
    </button>
  </div>
);

export const planPayloadWithFinance = (plan) => {
  const { hasFinance, ...rest } = plan;
  return {
    ...rest,
    finance:
      hasFinance && (plan.finance?.bankName || plan.finance?.financeInfo)
        ? plan.finance
        : { bankName: '', financeInfo: '' },
  };
};
