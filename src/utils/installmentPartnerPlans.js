import { CATEGORY_SPECIFICATIONS } from '../constants/productCategories';

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
};

export const getVariantEffectivePrice = (variant) => {
  if (!variant) return 0;
  const base = Number(variant.price) || 0;
  const disc = Math.min(100, Math.max(0, Number(variant.discountPercent) || 0));
  return Math.round(base * (1 - disc / 100));
};

export const deriveProductPrice = (variants, fallback = 0) => {
  if (variants?.length) {
    const prices = variants.map(getVariantEffectivePrice).filter((p) => p > 0);
    if (prices.length) return Math.min(...prices);
  }
  return Number(fallback) || 0;
};

export const getProductOwnerUserId = (product) =>
  product?.createdBy?.[0]?.userId || product?.userId || product?.user || "";

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
      variantIndex:
        p.variantIndex !== null && p.variantIndex !== undefined && p.variantIndex !== ""
          ? Number(p.variantIndex)
          : vIdx,
    }))
  );

  return [...root, ...fromVariants];
};

export const normalizePlansForForm = (plans, variants) =>
  (plans || []).map((p) => ({
    ...DEFAULT_INSTALLMENT_PLAN,
    ...p,
    variantIndex: remapPlanVariantIndexForEditor(p, variants),
    finance: p.finance || { bankName: "", financeInfo: "" },
    otherChargesNote: p.otherChargesNote || "",
  }));

export const mapProductVariantsForPartner = (product, partnerId) => {
  const partnerEntry = (product?.partnerPricing || []).find(
    (p) => p?.partnerId && String(p.partnerId) === String(partnerId)
  );
  const overrides = partnerEntry?.variantOverrides || [];
  return (product?.variants || []).map((v, i) => {
    const ov = overrides.find((o) => Number(o.variantIndex) === i);
    return {
      variantName: v.variantName || `Variant ${i + 1}`,
      listingPrice: v.price,
      price: ov?.cashPrice ?? "",
      discountPercent: ov?.discountPercent ?? 0,
      isCatalogVariant: true,
      sourceVariantIndex: i,
      status: v.status || "active",
    };
  });
};

export const mapVariantsForOwnerEditor = (variants) =>
  (variants || []).map((v, i) => ({
    variantName: v.variantName || `Variant ${i + 1}`,
    price: v.price ?? "",
    discountPercent: v.discountPercent ?? 0,
    status: v.status || "active",
    isCatalogVariant: false,
    sourceVariantIndex: i,
  }));

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

  return {
    userId: partnerUserId || "",
    productName: plan.productName || "",
    city: plan.city || "",
    price,
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
    paymentPlans: paymentPlans.length ? paymentPlans : [{ ...DEFAULT_INSTALLMENT_PLAN }],
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

export const cashPriceForPlan = (plan, form) => {
  const vIdx = plan.variantIndex;
  if (vIdx !== undefined && vIdx !== null && vIdx !== -1 && form.variants?.[vIdx]) {
    return getVariantEffectivePrice(form.variants[vIdx]);
  }
  return deriveProductPrice(form.variants, form.price);
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
  const { _id, __v, createdAt, updatedAt, ...rest } = plan;
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
    cashPrice,
    installmentPrice: Number(plan.installmentPrice) || 0,
    downPayment: Number(plan.downPayment) || 0,
    monthlyInstallment: Number(plan.monthlyInstallment) || 0,
    tenureMonths: Number(plan.tenureMonths) || 0,
    interestRatePercent: Number(plan.interestRatePercent) || 0,
    markup: Number(plan.markup) || 0,
    finance: plan.finance || { bankName: "", financeInfo: "" },
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

/** PUT body aligned with createInstallmentPlan POST shape */
export const buildInstallmentUpdateBody = ({
  form,
  editorUserId,
  isAttachedProduct,
  plansForUpdate,
}) => {
  const plansSource = plansForUpdate ?? form.paymentPlans ?? [];
  const productPrice = deriveProductPrice(form.variants, form.price);
  const profile = getPartnerProfileFromStorage();

  const withPartnerId = (p, cashPrice) => {
    const mapped = mapPlanForApi(p, form, cashPrice);
    const isNew = !isExistingStoredPlan(p);
    return attachPartnerMetaToPlan(mapped, profile, editorUserId, isNew);
  };

  const variantsPayload = (form.variants || []).map((v, vIdx) => {
    const variantPlans = plansSource
      .filter((p) => Number(p.variantIndex) === vIdx)
      .map((p) => withPartnerId(p, getVariantEffectivePrice(v)));

    if (isAttachedProduct) {
      return {
        variantName: v.variantName,
        paymentPlans: variantPlans,
      };
    }

    return {
      variantName: v.variantName,
      price: Number(v.price) || 0,
      discountPercent: Number(v.discountPercent) || 0,
      status: v.status || "active",
      paymentPlans: variantPlans,
    };
  });

  const rootPlans = plansSource
    .filter(
      (p) =>
        p.variantIndex === null ||
        p.variantIndex === undefined ||
        p.variantIndex === -1 ||
        p.variantIndex === ""
    )
    .map((p) => withPartnerId(p, productPrice));

  if (isAttachedProduct) {
    const partnerBasePrice = Number(form.partnerBasePrice || form.price) || 0;
    return {
      userId: editorUserId,
      mergePartnerPlans: true,
      paymentPlans: rootPlans,
      variants: variantsPayload,
      partnerBasePrice,
      partnerVariantPricing: buildPartnerVariantPricing(form.variants),
    };
  }

  const category =
    form.category === "other" ? form.customCategory || form.category : form.category;

  return {
    userId: editorUserId || form.userId,
    mergePartnerPlans: true,
    productName: form.productName,
    city: form.city,
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
    productImages: form.productImages || [],
    productSpecifications: form.productSpecifications || {},
    finance: form.finance || {},
    variants: variantsPayload,
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
}) => {
  const profile = getPartnerProfileFromStorage();
  const uid = editorUserId || profile.userId;

  for (const plan of form.paymentPlans || []) {
    if (!plan.planName || !Number(plan.installmentPrice)) {
      throw new Error(
        `Plan "${plan.planName || "New plan"}" needs a name and valid total payable before saving.`
      );
    }
  }

  const patch = buildInstallmentUpdateBody({
    form,
    editorUserId: uid,
    isAttachedProduct,
    plansForUpdate: form.paymentPlans,
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
