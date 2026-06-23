import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Calculator, ChevronLeft, ChevronRight, Pencil, Search, Trash2 } from 'lucide-react';
import {
  DEFAULT_INSTALLMENT_PLAN,
  deletePartnerPaymentPlanApi,
  deriveProductPrice,
  getVariantEffectivePrice,
  recalculatePaymentPlan,
} from '../../utils/installmentPartnerPlans';
import { PlanFinanceSection } from './InstallmentFinanceUI';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const freshDraft = (variants) => ({
  ...DEFAULT_INSTALLMENT_PLAN,
  variantIndex: variants?.length > 0 ? 0 : null,
});

function formatMoney(value) {
  return `₨ ${Number(value || 0).toLocaleString()}`;
}

function interestTypeShort(type) {
  if (type === 'Profit-Based (Islamic/Shariah)') return 'Islamic';
  if (type === 'Reducing Balance') return 'Reducing';
  return 'Flat';
}

function PlanInputField({ label, value, onChange, type = 'text', placeholder = '', readOnly = false }) {
  return (
    <div className="space-y-1.5">
      {label ? <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label> : null}
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none transition-all text-sm ${
          readOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'
        }`}
      />
    </div>
  );
}

function PlanComposerForm({ plan, form, onUpdate, editingIndex }) {
  const setDraftForm = useCallback(
    (updater) => {
      if (typeof updater === 'function') {
        const fake = { paymentPlans: [{ ...plan }] };
        const next = updater(fake);
        onUpdate(next.paymentPlans[0]);
      }
    },
    [plan, onUpdate]
  );

  const financedAmount = Math.max(
    0,
    (plan.variantIndex !== null &&
    plan.variantIndex !== undefined &&
    form.variants?.[plan.variantIndex]
      ? getVariantEffectivePrice(form.variants[plan.variantIndex])
      : deriveProductPrice(form.variants, form.price, form)) - (Number(plan.downPayment) || 0)
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {form.variants?.length > 0 ? (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Applies To Variant</label>
            <select
              value={plan.variantIndex ?? ''}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!Number.isNaN(v)) onUpdate({ ...plan, variantIndex: v });
              }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none bg-white text-sm"
            >
              {form.variants.map((v, vIdx) => (
                <option key={vIdx} value={vIdx}>
                  {v.variantName || `Variant ${vIdx + 1}`} ({formatMoney(getVariantEffectivePrice(v))})
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <PlanInputField
          label="Plan Name *"
          value={plan.planName}
          onChange={(v) => onUpdate({ ...plan, planName: v })}
          placeholder="e.g. 12-Month Plan"
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Interest Type</label>
          <select
            value={plan.interestType}
            onChange={(e) => onUpdate({ ...plan, interestType: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none text-sm bg-white"
          >
            <option>Flat Rate</option>
            <option>Reducing Balance</option>
            <option>Profit-Based (Islamic/Shariah)</option>
          </select>
        </div>

        <PlanInputField
          label="Tenure (Months) *"
          type="number"
          value={plan.tenureMonths}
          onChange={(v) => onUpdate({ ...plan, tenureMonths: v })}
        />

        <PlanInputField
          label="Down Payment"
          type="number"
          value={plan.downPayment}
          onChange={(v) => onUpdate({ ...plan, downPayment: v })}
        />

        {plan.interestType === 'Profit-Based (Islamic/Shariah)' ? (
          <>
            <PlanInputField
              label="Total Markup"
              type="number"
              value={plan.markup}
              onChange={(v) => onUpdate({ ...plan, markup: v })}
            />
            <PlanInputField
              label="Markup Rate % (auto)"
              type="number"
              value={plan.interestRatePercent}
              readOnly
            />
          </>
        ) : (
          <>
            <PlanInputField
              label="Interest Rate %"
              type="number"
              value={plan.interestRatePercent}
              onChange={(v) => onUpdate({ ...plan, interestRatePercent: v })}
            />
            <PlanInputField
              label="Total Markup (auto)"
              type="number"
              value={plan.markup}
              readOnly
            />
          </>
        )}
      </div>

      <PlanFinanceSection plan={plan} index={0} setForm={setDraftForm} />

      {/* Compact live preview strip */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {editingIndex !== null ? `Preview — plan #${editingIndex + 1}` : 'Calculation preview'}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Monthly EMI', value: plan.monthlyInstallment, accent: true },
            { label: 'Total Markup', value: plan.markup },
            { label: 'Total Payable', value: plan.installmentPrice },
            { label: 'Customer Cost', value: plan.totalCostToCustomer, accent: true },
            { label: 'Financed', value: financedAmount },
          ].map(({ label, value, accent }) => (
            <div key={label}>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
              <p className={`text-sm font-bold tabular-nums mt-0.5 ${accent ? 'text-red-600' : 'text-gray-800'}`}>
                {formatMoney(value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlansTable({ plans, form, editingIndex, onEdit, onRemove }) {
  const hasVariants = form.variants?.length > 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/80">
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-10">#</th>
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
            {hasVariants ? (
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Variant</th>
            ) : null}
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tenure</th>
            <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Down</th>
            <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
            <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Monthly</th>
            <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-20">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {plans.map(({ plan, index }) => {
            const variantName =
              plan.variantIndex != null && form.variants?.[plan.variantIndex]
                ? form.variants[plan.variantIndex].variantName
                : '—';
            const rateLabel =
              plan.interestType === 'Profit-Based (Islamic/Shariah)'
                ? `${Number(plan.interestRatePercent || 0).toFixed(1)}%`
                : `${Number(plan.interestRatePercent || 0).toFixed(1)}%`;
            const isEditing = editingIndex === index;

            return (
              <tr
                key={plan._id || `plan-${index}`}
                className={`transition-colors ${isEditing ? 'bg-red-50' : 'hover:bg-gray-50/60'}`}
              >
                <td className="px-3 py-3 text-gray-400 font-medium tabular-nums">{index + 1}</td>
                <td className="px-3 py-3 font-medium text-gray-900 max-w-[160px]">
                  <span className="block truncate">{plan.planName || `Plan ${index + 1}`}</span>
                </td>
                {hasVariants ? (
                  <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{variantName}</td>
                ) : null}
                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{interestTypeShort(plan.interestType)}</td>
                <td className="px-3 py-3 text-right text-gray-700 tabular-nums whitespace-nowrap">{plan.tenureMonths || 0} mo</td>
                <td className="px-3 py-3 text-right text-gray-700 tabular-nums whitespace-nowrap">{formatMoney(plan.downPayment)}</td>
                <td className="px-3 py-3 text-right text-gray-600 tabular-nums whitespace-nowrap">{rateLabel}</td>
                <td className="px-3 py-3 text-right font-semibold text-red-600 tabular-nums whitespace-nowrap">
                  {formatMoney(plan.monthlyInstallment)}
                </td>
                <td className="px-3 py-3 text-right font-medium text-gray-800 tabular-nums whitespace-nowrap">
                  {formatMoney(plan.installmentPrice)}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(index)}
                      className={`p-1.5 rounded-md transition-colors ${
                        isEditing
                          ? 'bg-red-100 text-red-700'
                          : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(index)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ExistingPlanReadOnly({ plan, index }) {
  return (
    <tr className="bg-gray-50/50 text-sm text-gray-500">
      <td className="px-3 py-2 tabular-nums">{index + 1}</td>
      <td className="px-3 py-2 font-medium text-gray-700">{plan.planName || `Plan ${index + 1}`}</td>
      <td className="px-3 py-2 text-right tabular-nums">{plan.tenureMonths} mo</td>
      <td className="px-3 py-2 text-right tabular-nums">{formatMoney(plan.downPayment)}</td>
      <td className="px-3 py-2 text-right font-medium text-gray-700 tabular-nums">{formatMoney(plan.monthlyInstallment)}</td>
      <td className="px-3 py-2 text-right tabular-nums">{formatMoney(plan.installmentPrice)}</td>
      <td className="px-3 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
          Read-only
        </span>
      </td>
    </tr>
  );
}

/**
 * Step 4 payment plans: sticky composer at top, professional table list below.
 */
export function Step4PlansBuilder({
  form,
  setForm,
  productId,
  selectedProductId,
  existingPlans = [],
  showVariantHint = false,
}) {
  const [draftPlan, setDraftPlan] = useState(() => freshDraft(form.variants));
  const [editingIndex, setEditingIndex] = useState(null);
  const [planSearch, setPlanSearch] = useState('');
  const [variantFilter, setVariantFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const composerRef = useRef(null);
  const listEndRef = useRef(null);
  const prevPlanCountRef = useRef(0);

  const updateDraft = useCallback(
    (nextPlan) => {
      setDraftPlan(recalculatePaymentPlan(nextPlan, form));
    },
    [form]
  );

  useEffect(() => {
    setDraftPlan((prev) => recalculatePaymentPlan(prev, form));
  }, [form.price, form.variants, form.discountedPrice, form.discountPercent]);

  useEffect(() => {
    if (!form.paymentPlans?.length) return;
    setForm((f) => {
      const pp = (f.paymentPlans || []).map((p) => recalculatePaymentPlan(p, f));
      const unchanged = pp.every((p, i) => {
        const prev = f.paymentPlans[i];
        return (
          prev.monthlyInstallment === p.monthlyInstallment &&
          prev.installmentPrice === p.installmentPrice &&
          prev.markup === p.markup
        );
      });
      return unchanged ? f : { ...f, paymentPlans: pp };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.price, form.variants, form.discountedPrice, form.discountPercent]);

  useEffect(() => {
    const prev = prevPlanCountRef.current;
    const count = form.paymentPlans?.length || 0;
    if (count > prev) {
      setCurrentPage(Math.max(1, Math.ceil(count / pageSize)));
      requestAnimationFrame(() => {
        listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
    prevPlanCountRef.current = count;
  }, [form.paymentPlans?.length, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [planSearch, variantFilter, pageSize]);

  const validateDraft = () => {
    if (!String(draftPlan.planName || '').trim()) {
      alert('Please enter a plan name.');
      return false;
    }
    if (!Number(draftPlan.tenureMonths) || Number(draftPlan.tenureMonths) <= 0) {
      alert('Please enter tenure (months).');
      return false;
    }
    if (form.variants?.length > 0) {
      const vIdx = draftPlan.variantIndex;
      if (vIdx === null || vIdx === undefined || vIdx === '' || Number.isNaN(Number(vIdx))) {
        alert('Please select a variant for this plan.');
        return false;
      }
    }
    const calculated = recalculatePaymentPlan(draftPlan, form);
    if (!Number(calculated.installmentPrice) && !Number(calculated.monthlyInstallment)) {
      alert('Enter down payment, rate/markup, and tenure so the plan can be calculated.');
      return false;
    }
    return true;
  };

  const handleAddOrUpdate = () => {
    if (!validateDraft()) return;
    const planToSave = recalculatePaymentPlan(draftPlan, form);

    setForm((f) => {
      const pp = [...(f.paymentPlans || [])];
      if (editingIndex !== null && editingIndex >= 0 && editingIndex < pp.length) {
        pp[editingIndex] = { ...pp[editingIndex], ...planToSave };
      } else {
        pp.push(planToSave);
      }
      return { ...f, paymentPlans: pp };
    });

    setDraftPlan(freshDraft(form.variants));
    setEditingIndex(null);
  };

  const handleEdit = (index) => {
    const p = form.paymentPlans[index];
    if (!p) return;
    setDraftPlan(recalculatePaymentPlan({ ...p }, form));
    setEditingIndex(index);
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCancelEdit = () => {
    setDraftPlan(freshDraft(form.variants));
    setEditingIndex(null);
  };

  const handleRemove = async (index) => {
    if (!window.confirm('Remove this payment plan from the list?')) return;
    const plan = form.paymentPlans[index];
    const deleteId = productId || selectedProductId;
    if (plan?._id && deleteId) {
      try {
        await deletePartnerPaymentPlanApi(deleteId, plan._id);
      } catch (e) {
        alert(e.message || 'Failed to delete plan');
        return;
      }
    }
    setForm((f) => ({
      ...f,
      paymentPlans: f.paymentPlans.filter((_, i) => i !== index),
    }));
    if (editingIndex === index) {
      setDraftPlan(freshDraft(form.variants));
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const planCount = form.paymentPlans?.length || 0;
  const existingCount = existingPlans?.length || 0;

  const filteredPlans = useMemo(() => {
    const q = planSearch.trim().toLowerCase();
    return (form.paymentPlans || [])
      .map((plan, index) => ({ plan, index }))
      .filter(({ plan }) => {
        if (variantFilter !== 'all' && String(plan.variantIndex) !== variantFilter) return false;
        if (!q) return true;
        const variantName =
          plan.variantIndex != null && form.variants?.[plan.variantIndex]?.variantName;
        const haystack = [plan.planName, plan.interestType, variantName, String(plan.tenureMonths)]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
  }, [form.paymentPlans, form.variants, planSearch, variantFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPlans = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredPlans.slice(start, start + pageSize);
  }, [filteredPlans, safePage, pageSize]);

  const variantOptions = useMemo(() => {
    if (!form.variants?.length) return [];
    return form.variants.map((v, idx) => ({
      value: String(idx),
      label: v.variantName || `Variant ${idx + 1}`,
    }));
  }, [form.variants]);

  return (
    <div className="space-y-5">
      {showVariantHint && form.variants?.length > 0 ? (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg px-4 py-2.5">
          Choose <strong>Applies To Variant</strong> for each plan so pricing uses the correct cash price.
        </p>
      ) : null}

      {/* Composer — clean panel, stays fixed while scrolling list */}
      <section
        ref={composerRef}
        className="sticky top-0 z-20 scroll-mt-4 rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {editingIndex !== null ? `Edit plan #${editingIndex + 1}` : 'Add payment plan'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter details below, then click Add plan — the form stays here while your list grows.
            </p>
          </div>
          {editingIndex !== null ? (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>
          ) : null}
        </div>

        <div className="px-5 py-5">
          <PlanComposerForm
            plan={draftPlan}
            form={form}
            onUpdate={updateDraft}
            editingIndex={editingIndex}
          />
        </div>

        <div className="flex justify-end px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
          <button
            type="button"
            onClick={handleAddOrUpdate}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
          >
            {editingIndex !== null ? 'Update plan' : '+ Add plan to list'}
          </button>
        </div>
      </section>

      {/* Plans table */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div>
            <h4 className="text-base font-semibold text-gray-900">
              Your payment plans
              <span className="ml-2 inline-flex items-center justify-center min-w-[1.75rem] h-6 px-2 rounded-full bg-gray-900 text-white text-xs font-bold tabular-nums">
                {planCount}
              </span>
            </h4>
            {planCount > 0 ? (
              <p className="text-xs text-gray-500 mt-0.5">
                {filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''}
                {planSearch || variantFilter !== 'all' ? ` (filtered from ${planCount})` : ''}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-0.5">No plans added yet</p>
            )}
          </div>

          {planCount > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  value={planSearch}
                  onChange={(e) => setPlanSearch(e.target.value)}
                  placeholder="Search…"
                  className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-40 sm:w-48 focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none"
                />
              </div>
              {variantOptions.length > 1 ? (
                <select
                  value={variantFilter}
                  onChange={(e) => setVariantFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                >
                  <option value="all">All variants</option>
                  {variantOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : null}
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n} / page</option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        {/* Table body */}
        {planCount > 0 ? (
          filteredPlans.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-12">No plans match your search.</p>
          ) : (
            <PlansTable
              plans={paginatedPlans}
              form={form}
              editingIndex={editingIndex}
              onEdit={handleEdit}
              onRemove={handleRemove}
            />
          )
        ) : existingCount === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm text-gray-500">Plans you add will appear in the table above.</p>
          </div>
        ) : null}

        {existingCount > 0 ? (
          <div className="border-t border-gray-100">
            <p className="px-5 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
              Other partners ({existingCount})
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Plan</th>
                    <th className="px-3 py-2 text-right">Tenure</th>
                    <th className="px-3 py-2 text-right">Down</th>
                    <th className="px-3 py-2 text-right">Monthly</th>
                    <th className="px-3 py-2 text-right">Total</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {existingPlans.map((p, idx) => (
                    <ExistingPlanReadOnly key={`ext-${idx}`} plan={p} index={idx} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <div ref={listEndRef} aria-hidden className="h-px" />

        {/* Pagination footer */}
        {planCount > 0 && filteredPlans.length > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50/50 text-sm text-gray-600">
            <span className="tabular-nums">
              {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filteredPlans.length)} of {filteredPlans.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <span className="px-2 tabular-nums text-xs font-medium">
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default Step4PlansBuilder;
