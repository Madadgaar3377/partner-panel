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

export const mapVariantsForEditor = (variants, editorUserId, productOwnerUserId) =>
  (variants || []).map((v) => ({
    ...v,
    paymentPlans: filterPlansForEditor(
      v.paymentPlans,
      editorUserId,
      productOwnerUserId
    ),
  }));

export const processPlansForForm = (plans) =>
  (plans || []).map((pp) => ({
    ...pp,
    hasFinance: !!(pp.finance && (pp.finance.bankName || pp.finance.financeInfo)),
    finance: pp.finance || { bankName: "", financeInfo: "" },
  }));

export const buildInstallmentUpdateBody = ({
  form,
  editorUserId,
  isAttachedProduct,
  includeFullForm = false,
  getVariantEffectivePrice,
}) => {
  const rootPlans = (form.paymentPlans || [])
    .filter(
      (p) =>
        p.variantIndex === null ||
        p.variantIndex === undefined ||
        p.variantIndex === -1
    )
    .map((p) => ({
      ...p,
      partnerId: p.partnerId || editorUserId,
      cashPrice: Number(p.cashPrice) || 0,
      installmentPrice: Number(p.installmentPrice),
      downPayment: Number(p.downPayment),
      monthlyInstallment: Number(p.monthlyInstallment),
    }));

  const variantsPayload = (form.variants || []).map((v, vIdx) => ({
    ...v,
    price: Number(v.price),
    discountPercent: Number(v.discountPercent) || 0,
    paymentPlans: [
      ...(v.paymentPlans || []).map((p) => ({
        ...p,
        partnerId: p.partnerId || editorUserId,
        variantIndex: vIdx,
        cashPrice:
          Number(p.cashPrice) ||
          (getVariantEffectivePrice ? getVariantEffectivePrice(v) : Number(v.price)) ||
          0,
        installmentPrice: Number(p.installmentPrice),
        downPayment: Number(p.downPayment),
        monthlyInstallment: Number(p.monthlyInstallment),
      })),
      ...(form.paymentPlans || [])
        .filter((p) => Number(p.variantIndex) === vIdx)
        .map((p) => ({
          ...p,
          partnerId: p.partnerId || editorUserId,
          variantIndex: vIdx,
          cashPrice:
            Number(p.cashPrice) ||
            (getVariantEffectivePrice ? getVariantEffectivePrice(v) : 0),
          installmentPrice: Number(p.installmentPrice),
          downPayment: Number(p.downPayment),
          monthlyInstallment: Number(p.monthlyInstallment),
        })),
    ],
  }));

  if (isAttachedProduct) {
    return {
      userId: editorUserId,
      mergePartnerPlans: true,
      paymentPlans: rootPlans,
      variants: variantsPayload,
    };
  }

  const base = {
    userId: editorUserId || form.userId,
    category: form.category === "other" ? form.customCategory : form.category,
    price: Number(form.price),
    downpayment: Number(form.downpayment),
    variants: variantsPayload,
    paymentPlans: rootPlans,
  };

  if (includeFullForm) {
    return { ...form, ...base };
  }

  return base;
};
