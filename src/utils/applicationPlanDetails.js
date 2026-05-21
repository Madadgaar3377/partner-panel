const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export function getStoredPlanInfo(application) {
  const arr = application?.PlanInfo;
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const a = arr[0] || {};
  const b = arr[1] || {};
  return {
    planType: a.planType || b.planType || a.planName,
    planPrice: a.planPrice ?? b.planPrice,
    planpic: a.planpic || b.planpic,
    downPayment: a.downPayment ?? b.downPayment,
    monthlyInstallment: a.monthlyInstallment ?? b.monthlyInstallment,
    tenureMonths: a.tenureMonths ?? b.tenureMonths,
    interestRatePercent: a.interestRatePercent ?? b.interestRatePercent,
    interestType: a.interestType ?? b.interestType,
    cashPrice: a.cashPrice ?? b.cashPrice,
    markup: a.markup ?? b.markup,
    installmentPrice: a.installmentPrice ?? b.installmentPrice,
  };
}

const norm = (s) => String(s || '').trim().toLowerCase();

export function findMatchingPaymentPlan(catalog, storedPlan, variantInfo) {
  if (!catalog || !storedPlan?.planType) return null;
  const name = norm(storedPlan.planType);
  const variantName = norm(variantInfo?.variantName);

  const matchInList = (plans) =>
    (plans || []).find((p) => norm(p.planName) === name) || null;

  if (variantName && Array.isArray(catalog.variants)) {
    const variant = catalog.variants.find((v) => norm(v.variantName) === variantName);
    const fromVariant = matchInList(variant?.paymentPlans);
    if (fromVariant) return { plan: fromVariant, variant };
  }

  const root = matchInList(catalog.paymentPlans);
  if (root) return { plan: root, variant: null };

  for (const v of catalog.variants || []) {
    const found = matchInList(v.paymentPlans);
    if (found) return { plan: found, variant: v };
  }

  return null;
}

export function resolveAppliedPlanDisplay(application, catalog) {
  const stored = getStoredPlanInfo(application);
  const variantInfo = application?.variantInfo;
  const matched = findMatchingPaymentPlan(catalog, stored, variantInfo);
  const p = matched?.plan || {};

  return {
    planName: stored?.planType || p.planName || 'N/A',
    installmentPrice: num(stored?.planPrice) ?? num(p.installmentPrice) ?? num(stored?.installmentPrice),
    cashPrice: num(stored?.cashPrice) ?? num(p.cashPrice),
    downPayment: num(stored?.downPayment) ?? num(p.downPayment),
    monthlyInstallment: num(stored?.monthlyInstallment) ?? num(p.monthlyInstallment),
    tenureMonths: num(stored?.tenureMonths) ?? num(p.tenureMonths),
    interestRatePercent: num(stored?.interestRatePercent) ?? num(p.interestRatePercent),
    interestType: stored?.interestType || p.interestType || null,
    markup: num(stored?.markup) ?? num(p.markup),
    productName: catalog?.productName || null,
    variantName: variantInfo?.variantName || matched?.variant?.variantName || null,
    companyName:
      p.companyName ||
      catalog?.companyName ||
      catalog?.companyNameOther ||
      null,
    installmentPlanId: application?.installmentPlanId || catalog?.installmentPlanId || null,
  };
}
