import React from 'react';
import { Package } from 'lucide-react';

/**
 * Read-only list of payment plans from other vendors on a shared product.
 * @param {{ entries: Array<{ plan: object, variantName?: string }> }} props
 */
const OtherPartnersPlansSection = ({ entries = [] }) => {
  if (!entries.length) return null;

  return (
    <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-2xl">
      <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
        <Package className="w-5 h-5 text-gray-500" />
        Other Companies&apos; Plans ({entries.length})
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Read-only — you cannot edit or delete these. Remove only your own plans below.
      </p>
      <div className="space-y-4">
        {entries.map((entry) => {
          const { plan, variantName } = entry;
          const key = `${plan._id || plan.planName}-${entry.location || variantName || 'root'}`;
          return (
            <div
              key={key}
              className="p-5 bg-white rounded-xl border border-gray-200 opacity-90"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="font-semibold text-gray-800">
                  {plan.planName || 'Payment Plan'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {variantName && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                      {variantName}
                    </span>
                  )}
                  {plan.companyName && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      {plan.companyName}
                    </span>
                  )}
                  {plan.tenureMonths > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {plan.tenureMonths} mo
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {plan.monthlyInstallment > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">Monthly</p>
                    <p className="font-bold text-green-700">
                      ₨ {Number(plan.monthlyInstallment).toLocaleString()}
                    </p>
                  </div>
                )}
                {plan.downPayment > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">Down payment</p>
                    <p className="font-bold text-gray-800">
                      ₨ {Number(plan.downPayment).toLocaleString()}
                    </p>
                  </div>
                )}
                {plan.installmentPrice > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">Total payable</p>
                    <p className="font-bold text-gray-800">
                      ₨ {Number(plan.installmentPrice).toLocaleString()}
                    </p>
                  </div>
                )}
                {plan.interestType && (
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="font-medium text-gray-700 truncate">{plan.interestType}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OtherPartnersPlansSection;
