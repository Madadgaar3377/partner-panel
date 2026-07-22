import { CATEGORY_SPECIFICATIONS } from '../constants/productCategories';
import baseApi from '../constants/apiUrl';
import { parseInstallmentCities } from '../constants/cites';
import { normalizeApprovalStatus, normalizeStockStatus } from './installmentStatus';

/** Whole PKR amounts  avoids 39999 → 39997 float drift */
export const roundPKR = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
};

export const planHasFinanceDetails = (plan) => {
  if (!plan) return false;
  const finance = plan.finance || {};
  return Boolean(
    String(finance.bankName || "").trim() ||
      stripHtmlText(finance.financeInfo)
  );
};

/** Keep only plans the partner actually configured (not empty template rows) */
export const filterValidPaymentPlans = (plans = []) =>
  (plans || []).filter((plan) => {
    if (!String(plan?.planName || "").trim()) return false;
    if (planHasFinanceDetails(plan) || plan.hasFinance) return true;
    return roundPKR(plan.installmentPrice) > 0 || roundPKR(plan.monthlyInstallment) > 0;
  });

export const DEFAULT_INSTALLMENT_PLAN = {
  planName: "",
  installmentPrice: 0,
  downPayment: 0,
  monthlyInstallment: 0,
  tenureMonths: 12,
  interestRatePercent: 0,
  interestType: "Flat Rate",
  markup: 0,
  otherChargesNote: "",
  finance: { bankName: "", financeInfo: "" },
  hasFinance: false,
};

/** Auto discount % from cash price and discounted price: ((cash - discounted) / cash) * 100 */
export const calcDiscountPercentFromPrices = (cashPrice, discountedPrice) => {
  const cash = Number(cashPrice) || 0;
  const discounted = Number(discountedPrice);
  if (cash <= 0 || !Number.isFinite(discounted) || discounted < 0) return 0;
  const pct = ((cash - discounted) / cash) * 100;
  return Math.round(Math.min(100, Math.max(0, pct)) * 100) / 100;
};

export const calcDiscountedPriceFromPercent = (cashPrice, discountPercent) => {
  const cash = roundPKR(cashPrice);
  const disc = Math.min(100, Math.max(0, Number(discountPercent) || 0));
  if (cash <= 0) return 0;
  if (disc <= 0) return cash;
  return roundPKR(cash * (1 - disc / 100));
};

/** Step 4 save modes on create installment */
export const STEP4_SAVE_MODES = {
  CASH: "cash",
  CASH_INSTALLMENTS: "cash_installments",
  INSTALLMENTS_ONLY: "installments_only",
  FINANCE_ONLY: "finance_only",
};

export const stripHtmlText = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export const hasProductFinance = (finance) => {
  if (!finance || typeof finance !== "object") return false;
  const bankName = String(finance.bankName || "").trim();
  const financeInfo = stripHtmlText(finance.financeInfo);
  return Boolean(bankName || financeInfo);
};

export const isFinanceOnlyStep = (step4Tab) => step4Tab === "finance";

/** Sync variant cash / discounted price and auto-calc discount % */
export const applyVariantPricingUpdate = (variant, field, value) => {
  const next = { ...variant, [field]: field === "price" || field === "discountedPrice" ? roundPKR(value) : value };
  const cash = roundPKR(next.price);

  if (field === "price") {
    const discounted = Number(next.discountedPrice);
    if (!next.discountedPrice && next.discountedPrice !== 0) {
      next.discountedPrice = value;
    } else if (discounted > cash && cash > 0) {
      next.discountedPrice = value;
    }
    next.discountPercent = calcDiscountPercentFromPrices(
      cash,
      Number(next.discountedPrice) ?? cash
    );
  } else if (field === "discountedPrice") {
    const discounted = Number(value);
    if (cash > 0 && Number.isFinite(discounted)) {
      next.discountedPrice = discounted > cash ? cash : discounted;
      next.discountPercent = calcDiscountPercentFromPrices(cash, next.discountedPrice);
    }
  }

  return next;
};

/** Sync base product price fields (no variants) */
export const applyBasePricingUpdate = (form, field, value) => {
  const next = {
    ...form,
    [field]: field === "price" || field === "discountedPrice" ? roundPKR(value) : value,
  };
  const cash = roundPKR(next.price);

  if (field === "price") {
    const prevDiscounted = roundPKR(next.discountedPrice);
    if (prevDiscounted <= 0 || prevDiscounted >= cash - 1) {
      next.discountedPrice = "";
      next.discountPercent = 0;
    } else {
      next.discountPercent = calcDiscountPercentFromPrices(cash, prevDiscounted);
    }
  } else if (field === "discountedPrice") {
    const discounted = Number(value);
    if (cash > 0 && Number.isFinite(discounted)) {
      next.discountedPrice = discounted > cash ? cash : discounted;
      next.discountPercent = calcDiscountPercentFromPrices(cash, next.discountedPrice);
    }
  }

  return next;
};

export const getVariantEffectivePrice = (variant) => {
  if (!variant) return 0;
  const discounted = roundPKR(variant.discountedPrice);
  if (discounted > 0) return discounted;
  const base = roundPKR(variant.price);
  const disc = Math.min(100, Math.max(0, Number(variant.discountPercent) || 0));
  if (base <= 0) return 0;
  if (disc <= 0) return base;
  return roundPKR(base * (1 - disc / 100));
};

/** Effective price when product has no variant rows */
export const getBaseEffectivePrice = (form) => {
  const discounted = roundPKR(form?.discountedPrice);
  if (discounted > 0) return discounted;
  const cash = roundPKR(form?.price);
  const disc = Math.min(100, Math.max(0, Number(form?.discountPercent) || 0));
  if (cash <= 0) return 0;
  if (disc <= 0) return cash;
  return roundPKR(cash * (1 - disc / 100));
};

export const amortizedMonthlyPayment = (principal, annualInterestPercent, months) => {
  if (!months || months <= 0) return 0;
  const r = Number(annualInterestPercent) / 100 / 12;
  if (!r) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
};

/** Normalize UI draft variant index (defaults to 0 when product has variants) */
export const normalizeComposerVariantIndex = (plan, form) => {
  const variants = form?.variants || [];
  if (!variants.length) return null;
  const raw = plan?.variantIndex;
  if (raw === null || raw === undefined || raw === "") return 0;
  const idx = Number(raw);
  if (!Number.isFinite(idx) || idx < 0 || idx >= variants.length) return 0;
  return idx;
};

/** Recalculate EMI, markup, totals for one payment plan row (canonical partner-panel formulas) */
export function recalculatePaymentPlan(plan, form) {
  const p = { ...plan };
  const variants = form?.variants || [];
  const variantIndex = normalizeComposerVariantIndex(p, form);
  p.variantIndex = variantIndex;

  let cashPrice = 0;
  if (variantIndex !== null && variants[variantIndex]) {
    cashPrice = getVariantEffectivePrice(variants[variantIndex]);
  } else if (variants.length > 0) {
    // Installments-only products often leave base form.price empty — use variant pricing
    cashPrice = deriveProductPrice(variants, 0, form);
  } else {
    cashPrice = getBaseEffectivePrice(form);
    if (cashPrice <= 0) cashPrice = roundPKR(form?.price);
  }

  const downPayment = roundPKR(p.downPayment);
  const financedAmount = Math.max(0, cashPrice - downPayment);
  const months = parseInt(p.tenureMonths, 10) || 0;
  const isIslamic = p.interestType === "Profit-Based (Islamic/Shariah)";
  const isReducing = p.interestType === "Reducing Balance";

  let monthly = 0;
  let totalPayable = 0;
  let totalMarkup = 0;
  let rate = Number(p.interestRatePercent) || 0;

  if (isIslamic) {
    // Partner enters total markup; EMI on (financed + markup)
    totalMarkup = roundPKR(p.markup);
    rate = cashPrice > 0 ? (totalMarkup / cashPrice) * 100 : 0;
    totalPayable = financedAmount + totalMarkup;
    monthly = months > 0 ? totalPayable / months : 0;
  } else if (isReducing) {
    monthly = amortizedMonthlyPayment(financedAmount, rate, months);
    totalPayable = monthly * months;
    totalMarkup = Math.max(0, totalPayable - financedAmount);
  } else {
    // Flat: markup on financed amount for the tenure years
    totalMarkup = financedAmount * (rate / 100) * (months / 12);
    totalPayable = financedAmount + totalMarkup;
    monthly = months > 0 ? totalPayable / months : 0;
  }

  // Full customer outlay = cash/effective price + markup (includes down payment)
  const totalCostToCustomer = cashPrice + totalMarkup;

  return {
    ...p,
    cashPrice: roundPKR(cashPrice),
    financedAmount: roundPKR(financedAmount),
    interestRatePercent: Number(rate.toFixed(2)),
    markup: roundPKR(totalMarkup),
    monthlyInstallment: roundPKR(monthly),
    installmentPrice: roundPKR(totalPayable),
    totalInterest: roundPKR(totalMarkup),
    totalCostToCustomer: roundPKR(totalCostToCustomer),
  };
}

export const deriveProductPrice = (variants, fallback = 0, formForBase = null) => {
  if (variants?.length) {
    const prices = variants.map(getVariantEffectivePrice).filter((p) => p > 0);
    if (prices.length) return Math.min(...prices);
  }
  if (formForBase && (formForBase.discountedPrice != null || formForBase.discountPercent != null)) {
    const baseEff = getBaseEffectivePrice(formForBase);
    if (baseEff > 0) return baseEff;
  }
  return roundPKR(Number(fallback) || 0);
};

/** Variants payload for create  strips cash prices when saving installments only */
export const mapVariantsForCreatePayload = (variants, activePlans, options = {}) => {
  const { installmentsOnly, planPayloadWithFinance, getVariantCashForPlan } = options;

  return (variants || []).map((v, vIdx) => {
    const variantPlans = (activePlans || [])
      .filter((p) => Number(p?.variantIndex) === vIdx)
      .map((p) => ({
        ...planPayloadWithFinance(p),
        cashPrice: getVariantCashForPlan(p, v),
        installmentPrice: Number(p.installmentPrice),
        downPayment: Number(p.downPayment),
        monthlyInstallment: Number(p.monthlyInstallment),
      }));

    if (installmentsOnly) {
      return {
        variantName: v.variantName,
        price: 0,
        discountPercent: 0,
        status: v.status || "active",
        paymentPlans: variantPlans,
      };
    }

    return {
      variantName: v.variantName,
      price: Number(v.price),
      discountPercent: Number(v.discountPercent) || 0,
      status: v.status || "active",
      paymentPlans: variantPlans,
    };
  });
};

export const getProductOwnerUserId = (product) =>
  product?.createdBy?.[0]?.userId || product?.userId || product?.user || "";

export const isProductOwnerForPartner = (product, partnerId) => {
  const ownerId = getProductOwnerUserId(product);
  if (partnerId && ownerId && String(ownerId) === String(partnerId)) return true;
  const createdBy = product?.createdBy;
  if (Array.isArray(createdBy)) {
    return createdBy.some(
      (c) => c?.userId && String(c.userId) === String(partnerId)
    );
  }
  return Boolean(product?.isProductOwner);
};

export const flattenAllPlansWithMeta = (product) => {
  const root = (product?.paymentPlans || []).map((p, planIndex) => ({
    plan: p,
    variantIndex: null,
    variantName: null,
    planIndex,
    location: "root",
  }));
  const fromVariants = (product?.variants || []).flatMap((v, variantIndex) =>
    (v.paymentPlans || []).map((p, planIndex) => ({
      plan: p,
      variantIndex,
      variantName: v.variantName,
      planIndex,
      location: `variant-${variantIndex}`,
    }))
  );
  return [...root, ...fromVariants];
};

export const getOtherPartnersPlans = (product, partnerId) => {
  const owner = isProductOwnerForPartner(product, partnerId);
  return flattenAllPlansWithMeta(product).filter(({ plan }) => {
    if (plan?.partnerId && String(plan.partnerId) === String(partnerId)) {
      return false;
    }
    if (!plan?.partnerId && owner) return false;
    return true;
  });
};

export const deletePartnerPaymentPlanApi = async (productId, planMongoId) => {
  const token = localStorage.getItem("userToken");
  const res = await fetch(
    `${baseApi}/installment/${encodeURIComponent(productId)}/payment-plan/${encodeURIComponent(planMongoId)}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to delete payment plan");
  }
  return data;
};

export const collectPartnerPlans = (product, partnerId) => {
  if (!product || !partnerId) return [];
  const match = (p) => p?.partnerId && String(p.partnerId) === String(partnerId);
  const root = (product.paymentPlans || []).filter(match);
  const fromVariants = (product.variants || []).flatMap((v) =>
    (v.paymentPlans || []).filter(match)
  );
  return [...root, ...fromVariants];
};

export const isAttachedMultiVendor = (editorUserId, productOwnerUserId) =>
  Boolean(
    editorUserId &&
      productOwnerUserId &&
      String(editorUserId) !== String(productOwnerUserId)
  );

export const filterPlansForEditor = (plans, editorUserId, productOwnerUserId) => {
  if (!editorUserId) return plans || [];
  return (plans || []).filter((p) => {
    if (p?.partnerId) return String(p.partnerId) === String(editorUserId);
    return String(productOwnerUserId) === String(editorUserId);
  });
};

export const mergeProductSpecifications = (plan) => {
  const category =
    plan?.productSpecifications?.category || plan?.category || "";
  const template = CATEGORY_SPECIFICATIONS[category] || [];
  const saved = plan?.productSpecifications?.specifications || [];
  const savedMap = Object.fromEntries(
    saved.map((s) => [s.field, s.value ?? ""])
  );

  if (template.length) {
    return {
      category,
      subCategory: plan?.productSpecifications?.subCategory || "",
      specifications: template.map((spec) => ({
        field: spec.field,
        value: savedMap[spec.field] ?? "",
      })),
    };
  }

  if (saved.length) {
    return {
      category,
      subCategory: plan?.productSpecifications?.subCategory || "",
      specifications: saved,
    };
  }

  return { category, subCategory: "", specifications: [] };
};

/** Map API variantIndex to index in the editor variants array */
export const remapPlanVariantIndexForEditor = (plan, variants) => {
  const raw = plan.variantIndex;
  if (raw === null || raw === undefined || raw === "" || raw === -1 || raw === "-1") {
    return null;
  }
  const num = Number(raw);
  const bySource = variants.findIndex(
    (v) => v.isCatalogVariant && Number(v.sourceVariantIndex) === num
  );
  if (bySource >= 0) return bySource;
  if (variants[num] !== undefined) return num;
  return num;
};

export const flattenEditorPaymentPlans = (product, editorUserId, productOwnerUserId) => {
  const root = filterPlansForEditor(product?.paymentPlans, editorUserId, productOwnerUserId).map(
    (p) => ({
      ...p,
      variantIndex:
        p.variantIndex === null || p.variantIndex === undefined || p.variantIndex === ""
          ? null
          : Number(p.variantIndex),
    })
  );

  const fromVariants = (product?.variants || []).flatMap((v, vIdx) =>
    filterPlansForEditor(v.paymentPlans, editorUserId, productOwnerUserId).map((p) => ({
      ...p,
      variantIndex: vIdx,
    }))
  );

  return [...root, ...fromVariants];
};

export const normalizePlansForForm = (plans, variants) =>
  (plans || []).map((p) => {
    const finance = p.finance || { bankName: "", financeInfo: "" };
    let variantIndex = remapPlanVariantIndexForEditor(p, variants);
    if (
      variants?.length > 0 &&
      (variantIndex === null || variantIndex === undefined)
    ) {
      variantIndex = 0;
    }
    return {
      ...DEFAULT_INSTALLMENT_PLAN,
      ...p,
      variantIndex,
      finance,
      hasFinance: !!(finance.bankName || finance.financeInfo),
      otherChargesNote: p.otherChargesNote || "",
    };
  });

const enrichVariantWithDiscountedPrice = (v) => {
  const price = Number(v?.price) || 0;
  const discounted =
    v?.discountedPrice !== undefined && v?.discountedPrice !== ""
      ? v.discountedPrice
      : price > 0
      ? calcDiscountedPriceFromPercent(price, v?.discountPercent)
      : "";
  return {
    ...v,
    discountedPrice: discounted,
    discountPercent: v?.discountPercent ?? 0,
  };
};

export const mapProductVariantsForPartner = (product, partnerId) => {
  const partnerEntry = (product?.partnerPricing || []).find(
    (p) => p?.partnerId && String(p.partnerId) === String(partnerId)
  );
  const overrides = partnerEntry?.variantOverrides || [];
  const rows = [];

  (product?.variants || []).forEach((v, i) => {
    const vPartnerId = v?.partnerId ? String(v.partnerId) : "";
    if (vPartnerId && vPartnerId !== String(partnerId)) return;

    if (vPartnerId === String(partnerId)) {
      rows.push({
        variantName: v.variantName || `Your variant ${rows.length + 1}`,
        listingPrice: null,
        price: v.price ?? "",
        discountPercent: v.discountPercent ?? 0,
        isCatalogVariant: false,
        isPartnerOwned: true,
        sourceVariantIndex: i,
        dbVariantIndex: i,
        status: v.status || "active",
      });
      return;
    }

    const ov = overrides.find((o) => Number(o.variantIndex) === i);
    rows.push({
      variantName: v.variantName || `Variant ${i + 1}`,
      listingPrice: v.price,
      price: ov?.cashPrice ?? "",
      discountPercent: ov?.discountPercent ?? 0,
      isCatalogVariant: true,
      isPartnerOwned: false,
      sourceVariantIndex: i,
      dbVariantIndex: i,
      status: v.status || "active",
    });
  });

  return rows.map(enrichVariantWithDiscountedPrice);
};

export const mapVariantsForOwnerEditor = (variants) =>
  (variants || []).map((v, i) =>
    enrichVariantWithDiscountedPrice({
      variantName: v.variantName || `Variant ${i + 1}`,
      price: v.price ?? "",
      discountPercent: v.discountPercent ?? 0,
      status: v.status || "active",
      isCatalogVariant: false,
      sourceVariantIndex: i,
    })
  );

export const getPartnerPricingEntry = (product, partnerId) =>
  (product?.partnerPricing || []).find(
    (p) => p?.partnerId && String(p.partnerId) === String(partnerId)
  );

/** Load API installment document into form state (same fields as create) */
export const mapInstallmentPlanToForm = (plan, partnerUserId) => {
  const ownerId = getProductOwnerUserId(plan);
  const attached = isAttachedMultiVendor(partnerUserId, ownerId);
  const partnerEntry = getPartnerPricingEntry(plan, partnerUserId);

  const variants = attached
    ? mapProductVariantsForPartner(plan, partnerUserId)
    : mapVariantsForOwnerEditor(plan.variants);

  const rawPlans = flattenEditorPaymentPlans(plan, partnerUserId, ownerId);
  const paymentPlans = normalizePlansForForm(rawPlans, variants);

  let category = plan.category || "";
  let customCategory = plan.customCategory || "";
  if (customCategory && !category) {
    category = "other";
  }

  const price =
    attached && partnerEntry?.basePrice
      ? partnerEntry.basePrice
      : plan.price ?? "";
  const discountPercent = attached
    ? 0
    : Number(plan.discountPercent) || 0;
  const discountedPrice =
    Number(price) > 0
      ? discountPercent > 0
        ? calcDiscountedPriceFromPercent(price, discountPercent)
        : roundPKR(price)
      : "";

  const cityFields = parseInstallmentCities(plan);

  return {
    userId: partnerUserId || "",
    productName: plan.productName || "",
    city: cityFields.display,
    cityScope: cityFields.cityScope,
    cities: cityFields.cities,
    status: normalizeApprovalStatus(plan.status),
    stockStatus: normalizeStockStatus(plan.stockStatus),
    price,
    discountedPrice,
    discountPercent,
    partnerBasePrice: partnerEntry?.basePrice ?? "",
    downpayment: plan.downpayment ?? "",
    installment: plan.installment ?? "",
    tenure: plan.tenure || "",
    customTenure: plan.customTenure || "",
    postedBy: plan.postedBy || "Partner",
    videoUrl: plan.videoUrl || "",
    description: plan.description || "",
    companyName: plan.companyName || "",
    companyNameOther: plan.companyNameOther || "",
    category,
    customCategory,
    status: plan.status || "pending",
    productImages: plan.productImages || [],
    paymentPlans,
    productSpecifications: mergeProductSpecifications(plan),
    variants,
    finance: plan.finance || { bankName: "", financeInfo: "" },
    _meta: { ownerId, attached },
  };
};

export const resolvePlanVariantIndex = (plan, variants) => {
  const vIdx = plan.variantIndex;
  if (vIdx === null || vIdx === undefined || vIdx === "" || vIdx === -1 || vIdx === "-1") {
    return null;
  }
  const variant = variants?.[Number(vIdx)];
  if (variant?.dbVariantIndex != null && Number.isFinite(Number(variant.dbVariantIndex))) {
    return Number(variant.dbVariantIndex);
  }
  if (variant?.isCatalogVariant && variant.sourceVariantIndex != null) {
    return Number(variant.sourceVariantIndex);
  }
  return Number(vIdx);
};

export const buildPartnerVariantPricing = (variants) =>
  (variants || [])
    .filter((v) => v.isCatalogVariant && Number.isFinite(Number(v.sourceVariantIndex)))
    .map((v) => ({
      variantIndex: Number(v.sourceVariantIndex),
      cashPrice: Number(v.price) || 0,
      discountPercent: Number(v.discountPercent) || 0,
    }))
    .filter((v) => v.cashPrice > 0);

export const buildPartnerOwnedVariantsPayload = (variants) =>
  (variants || [])
    .filter((v) => v.isPartnerOwned && String(v.variantName || "").trim())
    .map((v) => ({
      variantName: String(v.variantName).trim(),
      cashPrice: Number(v.price) || 0,
      discountPercent: Number(v.discountPercent) || 0,
      status: v.status || "active",
    }));

export const buildPartnerCatalogPricingPatch = (form, editorUserId) => {
  const productPrice = deriveProductPrice(form.variants, form.price);
  return {
    userId: editorUserId,
    mergePartnerPlans: true,
    partnerBasePrice: Number(form.partnerBasePrice || form.price) || productPrice,
    partnerVariantPricing: buildPartnerVariantPricing(form.variants),
    partnerOwnedVariants: buildPartnerOwnedVariantsPayload(form.variants),
  };
};

/** Save cash prices (and optional partner-only variants) on a shared catalog product  no payment plans required. */
export const submitPartnerCatalogPricing = async ({
  installmentId,
  form,
  editorUserId,
  baseApi,
  token,
}) => {
  const profile = getPartnerProfileFromStorage();
  const uid = editorUserId || profile.userId;
  const patch = buildPartnerCatalogPricingPatch(form, uid);

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const putRes = await fetch(`${baseApi}/updateInstallment/${installmentId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(patch),
  });
  const putData = await putRes.json();
  if (!putData.success) {
    throw new Error(putData.message || putData.error || "Failed to save your pricing.");
  }
  return putData;
};

export const cashPriceForPlan = (plan, form) => {
  const vIdx = plan.variantIndex;
  if (vIdx !== undefined && vIdx !== null && vIdx !== -1 && form.variants?.[vIdx]) {
    return getVariantEffectivePrice(form.variants[vIdx]);
  }
  return deriveProductPrice(form.variants, form.price, form);
};

export const isExistingStoredPlan = (plan) => {
  const id = plan?._id;
  if (!id) return false;
  const s = String(id);
  return s.length >= 12 && s !== "undefined";
};

export const getPartnerProfileFromStorage = () => {
  try {
    const d = JSON.parse(localStorage.getItem("userData") || "{}");
    return {
      userId: d.userId || "",
      companyName:
        d.companyDetails?.companyName || d.companyName || d.name || "Partner",
      companyLogo: d.profilePic || d.profileImage || "",
    };
  } catch {
    return { userId: "", companyName: "Partner", companyLogo: "" };
  }
};

const stripPlanForApi = (plan) => {
  const { _id, __v, createdAt, updatedAt, hasFinance, ...rest } = plan;
  return rest;
};

export const mapPlanForApi = (plan, form, cashPriceOverride) => {
  const variantIndex = resolvePlanVariantIndex(plan, form.variants);
  const cashPrice =
    cashPriceOverride ??
    cashPriceForPlan({ ...plan, variantIndex: plan.variantIndex }, form);
  const mapped = {
    ...stripPlanForApi(plan),
    variantIndex,
    cashPrice: roundPKR(cashPrice),
    installmentPrice: roundPKR(plan.installmentPrice),
    downPayment: roundPKR(plan.downPayment),
    monthlyInstallment: roundPKR(plan.monthlyInstallment),
    tenureMonths: Number(plan.tenureMonths) || 0,
    interestRatePercent: Number(plan.interestRatePercent) || 0,
    markup: roundPKR(plan.markup),
    finance:
      plan.hasFinance && (plan.finance?.bankName || plan.finance?.financeInfo)
        ? plan.finance
        : { bankName: "", financeInfo: "" },
  };
  if (plan._id) mapped._id = plan._id;
  return mapped;
};

const attachPartnerMetaToPlan = (plan, profile, editorUserId, isNew) => {
  const out = { ...plan };
  if (isNew || !out.partnerId) {
    out.partnerId = editorUserId || profile.userId;
  }
  if (!out.companyName) out.companyName = profile.companyName;
  if (!out.companyLogo) out.companyLogo = profile.companyLogo;
  return out;
};

export const enrichUpdatePayloadWithPartnerMeta = (patch, profile, editorUserId) => {
  if (patch.paymentPlans) {
    patch.paymentPlans = patch.paymentPlans.map((p) =>
      attachPartnerMetaToPlan(p, profile, editorUserId, false)
    );
  }
  if (patch.variants) {
    patch.variants = patch.variants.map((v) => ({
      ...v,
      paymentPlans: (v.paymentPlans || []).map((p) =>
        attachPartnerMetaToPlan(p, profile, editorUserId, false)
      ),
    }));
  }
  return patch;
};

export const buildAddPlanPayload = (plan, form, profile, editorUserId) => {
  const productPrice = deriveProductPrice(form.variants, form.price);
  const variantIdx = resolvePlanVariantIndex(plan, form.variants);
  const base = mapPlanForApi(plan, form, cashPriceForPlan(plan, form));
  return attachPartnerMetaToPlan(
    {
      ...base,
      variantIndex: variantIdx,
      userId: editorUserId || profile.userId,
      partnerBasePrice: productPrice,
      partnerVariantPricing: buildPartnerVariantPricing(form.variants),
    },
    profile,
    editorUserId,
    true
  );
};

/** Clear stale variant discounts when saving plain cash price */
export const shouldClearProductDiscounts = (form, { cashOnly = false } = {}) => {
  if (cashOnly) return true;
  const cash = roundPKR(form?.price);
  const pct = Number(form?.discountPercent) || 0;
  const discounted = roundPKR(form?.discountedPrice);
  if (pct > 0 && discounted > 0 && discounted < cash - 1) return false;
  if (pct > 0 && cash > 0) return false;
  return true;
};

export const normalizeVariantsForCashSave = (variants, rootPrice, options = {}) => {
  const { cashOnly = false, clearDiscounts = false } = options;
  const list = variants || [];
  if (!list.length) return list;
  const root = roundPKR(rootPrice);
  const syncSingle = (clearDiscounts || cashOnly) && root > 0 && list.length === 1;

  return list.map((v) => {
    const next = { ...v };
    if (clearDiscounts || cashOnly) {
      next.discountPercent = 0;
      next.discountedPrice = "";
    }
    if (syncSingle) {
      next.price = root;
    }
    return next;
  });
};

/** PUT body aligned with createInstallmentPlan POST shape */
export const buildInstallmentUpdateBody = ({
  form,
  editorUserId,
  isAttachedProduct,
  plansForUpdate,
  installmentsOnly = false,
  cashOnly = false,
}) => {
  const rawPlans = cashOnly ? [] : plansForUpdate ?? form.paymentPlans ?? [];
  const plansSource = cashOnly ? [] : filterValidPaymentPlans(rawPlans);
  const explicitPrice = roundPKR(form.price);
  const calcProductPrice = deriveProductPrice(form.variants, form.price, form);
  const productPrice = installmentsOnly
    ? 0
    : explicitPrice > 0 && !(form.variants || []).length
      ? explicitPrice
      : roundPKR(calcProductPrice);
  const profile = getPartnerProfileFromStorage();
  const clearDiscounts = shouldClearProductDiscounts(form, { cashOnly });
  const variantsForSave = normalizeVariantsForCashSave(form.variants, explicitPrice, {
    cashOnly,
    clearDiscounts,
  });

  const withPartnerId = (p, cashPrice) => {
    const mapped = mapPlanForApi(p, form, cashPrice);
    const isNew = !isExistingStoredPlan(p);
    return attachPartnerMetaToPlan(mapped, profile, editorUserId, isNew);
  };

  const variantIndexMatchesEditor = (plan, vIdx) => {
    const raw = plan.variantIndex;
    if (raw === null || raw === undefined || raw === "" || raw === -1 || raw === "-1") {
      return false;
    }
    return Number(raw) === vIdx;
  };

  const catalogVariantsForPayload = (variantsForSave || [])
    .map((v, vIdx) => ({ v, vIdx }))
    .filter(({ v }) => v.isCatalogVariant);

  const variantsPayload = catalogVariantsForPayload.map(({ v, vIdx }) => {
    const variantPlans = plansSource
      .filter((p) => variantIndexMatchesEditor(p, vIdx))
      .map((p) => withPartnerId(p, getVariantEffectivePrice(v)));

    if (isAttachedProduct) {
      return {
        variantName: v.variantName,
        paymentPlans: variantPlans,
      };
    }

    if (installmentsOnly) {
      return {
        variantName: v.variantName,
        price: 0,
        discountPercent: 0,
        status: v.status || "active",
        paymentPlans: variantPlans,
      };
    }

    return {
      variantName: v.variantName,
      price: roundPKR(v.price),
      discountPercent: clearDiscounts || cashOnly ? 0 : Number(v.discountPercent) || 0,
      status: v.status || "active",
      paymentPlans: variantPlans,
    };
  });

  const ownerVariantsPayload = (variantsForSave || []).map((v, vIdx) => {
    const variantPlans = plansSource
      .filter((p) => variantIndexMatchesEditor(p, vIdx))
      .map((p) => withPartnerId(p, getVariantEffectivePrice(v)));

    if (installmentsOnly) {
      return {
        variantName: v.variantName,
        price: 0,
        discountPercent: 0,
        status: v.status || "active",
        paymentPlans: variantPlans,
      };
    }

    return {
      variantName: v.variantName,
      price: roundPKR(v.price),
      discountPercent: clearDiscounts || cashOnly ? 0 : Number(v.discountPercent) || 0,
      status: v.status || "active",
      paymentPlans: variantPlans,
    };
  });

  const rootPlans = plansSource
    .filter((p) => {
      const raw = p.variantIndex;
      return (
        raw === null ||
        raw === undefined ||
        raw === -1 ||
        raw === "-1" ||
        raw === ""
      );
    })
    .map((p) => withPartnerId(p, installmentsOnly ? calcProductPrice : productPrice));

  if (isAttachedProduct) {
    const body = {
      userId: editorUserId,
      mergePartnerPlans: true,
      paymentPlans: rootPlans,
      variants: variantsPayload,
    };

    const variantPricing = buildPartnerVariantPricing(variantsForSave);
    const basePrice = roundPKR(form.partnerBasePrice || form.price);

    if (variantPricing.length > 0) {
      body.partnerVariantPricing = variantPricing;
    }
    if (basePrice > 0) {
      body.partnerBasePrice = basePrice;
    }
    if (!installmentsOnly) {
      body.partnerOwnedVariants = buildPartnerOwnedVariantsPayload(variantsForSave);
    }

    return body;
  }

  const category =
    form.category === "other" ? form.customCategory || form.category : form.category;
  const cityFields = parseInstallmentCities(form);

  return {
    userId: editorUserId || form.userId,
    mergePartnerPlans: true,
    productName: form.productName,
    city: cityFields.display,
    cities: cityFields.cities,
    cityScope: cityFields.cityScope,
    price: productPrice,
    downpayment: Number(form.downpayment) || 0,
    installment: form.installment !== "" && form.installment != null ? Number(form.installment) : undefined,
    tenure: form.tenure || "",
    customTenure: form.customTenure || "",
    postedBy: form.postedBy || "Partner",
    videoUrl: form.videoUrl || "",
    description: form.description || "",
    companyName: form.companyName || "",
    companyNameOther: form.companyNameOther || "",
    category,
    customCategory: form.customCategory || "",
    status: form.status || "pending",
    stockStatus: form.stockStatus || "in_stock",
    productImages: form.productImages || [],
    productSpecifications: form.productSpecifications || {},
    finance: form.finance || {},
    variants: ownerVariantsPayload.length ? ownerVariantsPayload : variantsPayload,
    paymentPlans: rootPlans,
  };
};

/**
 * Save installment edit: single PUT with full paymentPlans list (backend merges by partner).
 */
export const submitInstallmentPlanUpdate = async ({
  installmentId,
  form,
  editorUserId,
  isAttachedProduct,
  baseApi,
  token,
  savePricingOnly = false,
  step4SaveMode,
  step4Tab,
}) => {
  const profile = getPartnerProfileFromStorage();
  const uid = editorUserId || profile.userId;
  const isFinanceOnly = isFinanceOnlyStep(step4Tab) || step4SaveMode === STEP4_SAVE_MODES.FINANCE_ONLY;

  if (isFinanceOnly) {
    if (!hasProductFinance(form.finance)) {
      throw new Error("Add bank name or finance information before saving.");
    }

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const patch = {
      userId: uid,
      mergePartnerPlans: true,
      finance: form.finance || {},
    };

    if (!isAttachedProduct) {
      const category =
        form.category === "other" ? form.customCategory || form.category : form.category;
      const cityFields = parseInstallmentCities(form);
      Object.assign(patch, {
        productName: form.productName,
        city: cityFields.display,
        cities: cityFields.cities,
        cityScope: cityFields.cityScope,
        description: form.description || "",
        companyName: form.companyName || "",
        companyNameOther: form.companyNameOther || "",
        category,
        customCategory: form.customCategory || "",
        videoUrl: form.videoUrl || "",
        productImages: form.productImages || [],
        productSpecifications: form.productSpecifications || {},
        status: form.status || "pending",
        stockStatus: form.stockStatus || "in_stock",
      });
    }

    const putRes = await fetch(`${baseApi}/updateInstallment/${installmentId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(patch),
    });
    const putData = await putRes.json();
    if (!putData.success) {
      throw new Error(putData.message || putData.error || "Failed to save finance information.");
    }
    return putData;
  }

  const mode = step4SaveMode
    || (savePricingOnly ? STEP4_SAVE_MODES.CASH : STEP4_SAVE_MODES.CASH_INSTALLMENTS);
  const isCashOnly = mode === STEP4_SAVE_MODES.CASH;
  const isInstallmentsOnly = mode === STEP4_SAVE_MODES.INSTALLMENTS_ONLY;

  if (!isCashOnly) {
    const plansToValidate = filterValidPaymentPlans(form.paymentPlans || []);
    for (const plan of plansToValidate) {
      const hasPlanFinance =
        plan.hasFinance && hasProductFinance(plan.finance);
      if (!plan.planName || (!Number(plan.installmentPrice) && !hasPlanFinance)) {
        throw new Error(
          `Plan "${plan.planName || "New plan"}" needs a name and either total payable or bank finance details before saving.`
        );
      }
    }
  }

  if (isCashOnly && isAttachedProduct) {
    return submitPartnerCatalogPricing({
      installmentId,
      form,
      editorUserId: uid,
      baseApi,
      token,
    });
  }

  const patch = buildInstallmentUpdateBody({
    form,
    editorUserId: uid,
    isAttachedProduct,
    plansForUpdate: isCashOnly ? [] : form.paymentPlans,
    installmentsOnly: isInstallmentsOnly,
    cashOnly: isCashOnly,
  });

  enrichUpdatePayloadWithPartnerMeta(patch, profile, uid);

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const putRes = await fetch(`${baseApi}/updateInstallment/${installmentId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(patch),
  });
  const putData = await putRes.json();
  if (!putData.success) {
    throw new Error(putData.message || putData.error || "Failed to update installment plan.");
  }

  return putData;
};
