import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Upload, 
  X,
  Package,
  Image as ImageIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import baseApi from '../../constants/apiUrl';
import { CATEGORY_SPECIFICATIONS, getGroupedCategories } from '../../constants/productCategories';
import SearchableProductSelect from '../../components/SearchableProductSelect';
import {
  PartnerStep4Tabs,
  ProductFinancePanel,
  planPayloadWithFinance,
} from '../../components/installment/InstallmentFinanceUI';
import Step4PlansBuilder from '../../components/installment/Step4PlansBuilder';
import {
  STEP4_SAVE_MODES,
  getVariantEffectivePrice,
  getBaseEffectivePrice,
  deriveProductPrice,
  collectPartnerPlans,
  mapProductVariantsForPartner,
  getPartnerPricingEntry,
  resolvePlanVariantIndex,
  buildPartnerVariantPricing,
  submitPartnerCatalogPricing,
  applyVariantPricingUpdate,
  applyBasePricingUpdate,
  mapVariantsForCreatePayload,
  recalculatePaymentPlan,
} from '../../utils/installmentPartnerPlans';

const planMatchesVariantIndex = (plan, vIdx) => Number(plan?.variantIndex) === Number(vIdx);

const hasStandardVariant = (variants) =>
    (variants || []).some((v) => String(v.variantName || "").trim().toLowerCase() === "standard");

const getActivePaymentPlans = (plans) =>
    (plans || []).filter(
        (p) => String(p.planName || "").trim() && Number(p.installmentPrice) > 0
    );

const CreateInstallmentPlan = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [localImages, setLocalImages] = useState([]);

    // Multi-vendor logic state
    const [existingProducts, setExistingProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [existingPlans, setExistingPlans] = useState([]);
    const [step4Tab, setStep4Tab] = useState('installments');
    /** cash | cash_installments | installments_only */
    const [step4SaveMode, setStep4SaveMode] = useState(STEP4_SAVE_MODES.CASH_INSTALLMENTS);

    const [form, setForm] = useState({
        userId: "",
        productName: "",
        city: "",
        price: "",
        discountedPrice: "",
        discountPercent: 0,
        partnerBasePrice: "",
        downpayment: "",
        installment: "",
        tenure: "",
        customTenure: "",
        postedBy: "Partner",
        videoUrl: "",
        description: "",
        companyName: "",
        companyNameOther: "",
        category: "",
        customCategory: "",
        status: "approved",
        productImages: [],
        paymentPlans: [],

        // New dynamic product specifications
        productSpecifications: {
            category: "",
            subCategory: "",
            specifications: []
        },
        variants: [],
        finance: { bankName: "", financeInfo: "" },
    });

    // Load userId from localStorage on component mount
    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                const parsedData = JSON.parse(userData);
                if (parsedData.userId) {
                    setForm(prev => ({ ...prev, userId: parsedData.userId }));
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    // Fetch all existing installment products on mount
    useEffect(() => {
        const fetchExistingProducts = async () => {
            try {
                const res = await fetch(`${baseApi}/getAllInstallments`);
                const data = await res.json();
                if (data.success) {
                    setExistingProducts((data.data || []).filter((p) => p.status !== 'deleted'));
                }
            } catch (err) {
                console.error("Error fetching existing products:", err);
            }
        };
        fetchExistingProducts();
    }, []);

    const handleSelectExistingProduct = (productId) => {
        setSelectedProductId(productId);
        
        if (!productId) {
            setExistingPlans([]);
            setForm(prev => ({
                ...prev,
                productName: "",
                city: "",
                price: "",
                partnerBasePrice: "",
                downpayment: "",
                installment: "",
                tenure: "",
                description: "",
                companyName: "",
                category: "",
                productImages: [],
                paymentPlans: [],
                productSpecifications: { category: "", subCategory: "", specifications: [] },
                variants: [],
            }));
            return;
        }

        const product = existingProducts.find(
            (p) => (p.installmentPlanId || p._id) === productId
        );
        if (product) {
            setForm(prev => {
            setExistingPlans(collectPartnerPlans(product, prev.userId));
            const partnerEntry = getPartnerPricingEntry(product, prev.userId);
            const partnerPrice = partnerEntry?.basePrice ?? "";
            return {
                ...prev,
                productName: product.productName || "",
                city: product.city || "",
                price: partnerPrice || "",
                partnerBasePrice: partnerPrice || "",
                downpayment: product.downpayment || "",
                installment: product.installment || "",
                tenure: product.tenure || "",
                description: product.description || "",
                companyName: product.companyName || "",
                category: product.category || "",
                productImages: product.productImages || [],
                paymentPlans: [],
                productSpecifications: product.productSpecifications || { category: "", subCategory: "", specifications: [] },
                variants: mapProductVariantsForPartner(product, prev.userId),
            };
            });
        }
    };

    // Helper to update nested path safely
    const updateForm = (path, value) => {
        if (!path.includes('.')) {
            setForm(prev => ({ ...prev, [path]: value }));
            return;
        }
        const parts = path.split('.');
        setForm(prev => {
            const copy = JSON.parse(JSON.stringify(prev));
            let cur = copy;
            for (let i = 0; i < parts.length - 1; i++) {
                if (cur[parts[i]] === undefined) cur[parts[i]] = {};
                cur = cur[parts[i]];
            }
            cur[parts[parts.length - 1]] = value;
            return copy;
        });
    };

    // Handle category change and initialize specifications
    const handleCategoryChange = (category) => {
        const specs = CATEGORY_SPECIFICATIONS[category] || [];
        const initializedSpecs = specs.map(spec => ({
            field: spec.field,
            value: ''
        }));

        setForm(prev => ({
            ...prev,
            category: category,
            productSpecifications: {
                category: category,
                subCategory: "",
                specifications: initializedSpecs
            }
        }));
    };

    // Update a specific specification value
    const updateSpecification = (fieldName, value) => {
        setForm(prev => {
            const updatedSpecs = prev.productSpecifications.specifications.map(spec =>
                spec.field === fieldName ? { ...spec, value } : spec
            );
            return {
                ...prev,
                productSpecifications: {
                    ...prev.productSpecifications,
                    specifications: updatedSpecs
                }
            };
        });
    };

    // Get specification value
    const getSpecValue = (fieldName) => {
        const spec = form.productSpecifications.specifications.find(s => s.field === fieldName);
        return spec ? spec.value : '';
    };

    // --- Calculation Logic ---
    const recalcPlan = (index) => {
        setForm(f => {
            if (!f.paymentPlans || !f.paymentPlans[index]) return f;
            const pp = [...f.paymentPlans];
            pp[index] = recalculatePaymentPlan(pp[index], f);
            return { ...f, paymentPlans: pp };
        });
    };

    useEffect(() => {
        if (form.paymentPlans.length) {
            form.paymentPlans.forEach((_, idx) => recalcPlan(idx));
        }
        // eslint-disable-next-line
    }, [form.price, form.variants, form.discountedPrice, form.discountPercent]);

    // --- Image Handling ---
    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files || []);
        setLocalImages(prev => [...prev, ...files]);
    };

    const uploadSingleFile = async (file) => {
        const token = localStorage.getItem('userToken');
        const fd = new FormData();
        fd.append("image", file);
        const res = await fetch(`${baseApi}/upload-image`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: fd,
        });
        const body = await res.json();
        return body.imageUrl || body.url || body.data?.url || body.data;
    };

    const handleUploadAll = async () => {
        if (!localImages.length) return;
        setUploading(true);
        try {
            const urls = [];
            for (const file of localImages) {
                const u = await uploadSingleFile(file);
                urls.push(u);
            }
            setForm(f => ({ ...f, productImages: [...f.productImages, ...urls] }));
            setLocalImages([]);
            setMessage("Images uploaded successfully!");
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('userToken');

            const isCashOnly = step4SaveMode === STEP4_SAVE_MODES.CASH;
            const isInstallmentsOnly = step4SaveMode === STEP4_SAVE_MODES.INSTALLMENTS_ONLY;
            const activePlans = isCashOnly ? [] : getActivePaymentPlans(form.paymentPlans);

            if (selectedProductId) {
                const partnerUserId =
                    form.userId || JSON.parse(localStorage.getItem("userData") || "{}")?.userId;
                const productPrice = deriveProductPrice(form.variants, form.price, form);

                if (isCashOnly || (!isInstallmentsOnly && !activePlans.length)) {
                    if (!productPrice) {
                        setError("Set your cash price on at least one variant or the base price before saving.");
                        setLoading(false);
                        return;
                    }
                    await submitPartnerCatalogPricing({
                        installmentId: selectedProductId,
                        form,
                        editorUserId: partnerUserId,
                        baseApi,
                        token,
                    });
                    setMessage(
                        isCashOnly
                            ? "Your cash prices and variants saved on this product."
                            : "Your pricing saved on this product. You can add installment plans anytime."
                    );
                    setTimeout(() => navigate("/installments"), 2000);
                    return;
                }

                const partnerBasePrice = isInstallmentsOnly ? undefined : productPrice;
                const partnerVariantPricing = isInstallmentsOnly
                    ? undefined
                    : buildPartnerVariantPricing(form.variants);

                for (const plan of activePlans) {
                    const variantIdx = resolvePlanVariantIndex(plan, form.variants);
                    const planData = {
                        ...planPayloadWithFinance(plan),
                        variantIndex: variantIdx,
                        cashPrice: cashPriceForPlan(plan),
                        ...(partnerBasePrice != null ? { partnerBasePrice } : {}),
                        ...(partnerVariantPricing ? { partnerVariantPricing } : {}),
                        userId: form.userId,
                        installmentPrice: Number(plan.installmentPrice),
                        downPayment: Number(plan.downPayment),
                        monthlyInstallment: Number(plan.monthlyInstallment),
                        tenureMonths: Number(plan.tenureMonths),
                        interestRatePercent: Number(plan.interestRatePercent),
                        markup: Number(plan.markup),
                        partnerId: form.userId,
                        companyName: "Partner"
                    };

                    const res = await fetch(`${baseApi}/installment/${selectedProductId}/add-plan`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify(planData),
                    });
                    
                    const data = await res.json();
                    if (!data.success) {
                        throw new Error(data.message || "Failed to append a payment plan.");
                    }
                }
                setMessage("Payment plans attached successfully!");
                setTimeout(() => navigate('/installments'), 2000);
                return;
            }

            const productPrice = isInstallmentsOnly
                ? 0
                : deriveProductPrice(form.variants, form.price, form);
            const calcProductPrice = deriveProductPrice(form.variants, form.price, form);

            const res = await fetch(`${baseApi}/createInstallmentPlan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    ...form,
                    category: form.category === "other" ? form.customCategory : form.category,
                    price: productPrice,
                    downpayment: Number(form.downpayment),
                    postedBy: "Partner",
                    variants: mapVariantsForCreatePayload(form.variants, activePlans, {
                        installmentsOnly: isInstallmentsOnly,
                        planPayloadWithFinance,
                        getVariantCashForPlan: (_, v) => getVariantEffectivePrice(v),
                    }),
                    paymentPlans: activePlans
                        .filter(p => p.variantIndex === null || p.variantIndex === undefined || p.variantIndex === -1)
                        .map(p => ({
                            ...planPayloadWithFinance(p),
                            cashPrice: calcProductPrice,
                            installmentPrice: Number(p.installmentPrice),
                            downPayment: Number(p.downPayment),
                            monthlyInstallment: Number(p.monthlyInstallment)
                        })),
                    finance: form.finance || {},
                }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage(
                    isInstallmentsOnly
                        ? "Installment plans created successfully (cash prices not stored)."
                        : activePlans.length
                        ? "Installment plan created successfully!"
                        : "Product saved with variant cash prices. You can add installment plans later from the installments list."
                );
                setTimeout(() => navigate('/installments'), 2000);
            } else {
                setError(data.message || "Failed to create plan.");
            }
        } catch (err) {
            setError("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const showVariantSection = Boolean(form.category);

    const cashPriceForPlan = (plan) => {
        const vIdx = plan.variantIndex;
        if (vIdx !== undefined && vIdx !== null && vIdx !== -1 && form.variants?.[vIdx]) {
            return getVariantEffectivePrice(form.variants[vIdx]);
        }
        return deriveProductPrice(form.variants, form.price, form);
    };

    const isCashOnlyMode = step4SaveMode === STEP4_SAVE_MODES.CASH;
    const isInstallmentsOnlyMode = step4SaveMode === STEP4_SAVE_MODES.INSTALLMENTS_ONLY;
    const showPaymentPlans = !isCashOnlyMode;

    const updateVariantPricing = (vIdx, field, value) => {
        setForm((f) => {
            const nv = [...f.variants];
            nv[vIdx] = applyVariantPricingUpdate(nv[vIdx], field, value);
            return { ...f, variants: nv };
        });
    };

    const updateBasePricing = (field, value) => {
        setForm((f) => applyBasePricingUpdate(f, field, value));
    };

    const variantHasCalcPrice = (v) => {
        const cash = Number(v?.price) || 0;
        const effective = getVariantEffectivePrice(v);
        return cash > 0 && effective > 0;
    };

    const isStepValid = () => {
        if (step === 1) return form.productName && form.city && form.category;
        if (step === 3 && !selectedProductId) return form.productImages.length > 0;
        if (step === 4) {
            const productPrice = deriveProductPrice(form.variants, form.price, form);
            const calcPrice = productPrice;

            if (isCashOnlyMode) {
                if (!calcPrice) return false;
                if (showVariantSection && form.variants.length > 0) {
                    return !form.variants.some((v) => {
                        if (!Number(v.price)) return true;
                        if (!v.isCatalogVariant && !String(v.variantName || "").trim()) return true;
                        return false;
                    });
                }
                return Number(form.price) > 0;
            }

            if (isInstallmentsOnlyMode) {
                const activePlans = getActivePaymentPlans(form.paymentPlans);
                if (!activePlans.length) return false;
                if (showVariantSection) {
                    if (!form.variants.length) return false;
                    const namesOk = form.variants.every((v) =>
                        v.isCatalogVariant || String(v.variantName || "").trim()
                    );
                    if (!namesOk) return false;
                    return activePlans.every((p) => {
                        const vIdx = p.variantIndex;
                        const missingVariant =
                            vIdx === null || vIdx === undefined || vIdx === "" || vIdx === -1 || vIdx === "-1";
                        if (missingVariant) return false;
                        return variantHasCalcPrice(form.variants[Number(vIdx)]);
                    });
                }
                return getBaseEffectivePrice(form) > 0;
            }

            if (!calcPrice) return false;

            if (showVariantSection && form.variants.length > 0) {
                const variantPricingInvalid = form.variants.some((v) => {
                    if (!Number(v.price)) return true;
                    if (!v.isCatalogVariant && !String(v.variantName || "").trim()) return true;
                    return false;
                });
                if (variantPricingInvalid) return false;
                if (selectedProductId && !getActivePaymentPlans(form.paymentPlans).length) {
                    return true;
                }
            } else if (!showVariantSection && !Number(form.price)) {
                return false;
            }

            const activePlans = getActivePaymentPlans(form.paymentPlans);
            if (activePlans.length === 0) {
                if (selectedProductId) return calcPrice > 0;
                return showVariantSection && form.variants.length > 0;
            }

            const plansTargetOk = activePlans.every((p) => {
                const vIdx = p.variantIndex;
                const missingVariant =
                    vIdx === null || vIdx === undefined || vIdx === "" || vIdx === -1 || vIdx === "-1";
                if (showVariantSection && form.variants.length > 0) {
                    if (missingVariant) return false;
                    return variantHasCalcPrice(form.variants[Number(vIdx)]);
                }
                if (missingVariant) return calcPrice > 0;
                return variantHasCalcPrice(form.variants[Number(vIdx)]);
            });
            return plansTargetOk;
        }
        return true;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/installments')}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 mb-4 font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Installments
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Create Installment Plan</h1>
                    <p className="text-gray-600 mt-1">Add a new product with installment options</p>
                </div>

                {/* Progress Steps */}
                <div className="glass-red rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between">
                        {[
                            { num: 1, label: 'Basic Info' },
                            { num: 2, label: 'Specifications' },
                            { num: 3, label: 'Images' },
                            { num: 4, label: 'Payment Plans' }
                        ].map((s, idx) => (
                            <React.Fragment key={s.num}>
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                                        step === s.num
                                            ? 'bg-red-600 text-white shadow-lg scale-110'
                                            : step > s.num
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                    }`}>
                                        {step > s.num ? <Check className="w-6 h-6" /> : s.num}
                                    </div>
                                    <span className={`text-xs font-semibold ${
                                        step === s.num ? 'text-red-600' : 'text-gray-500'
                                    }`}>
                                        {s.label}
                                    </span>
                                </div>
                                {idx < 3 && (
                                    <div className={`flex-1 h-1 mx-4 rounded ${
                                        step > s.num ? 'bg-green-500' : 'bg-gray-200'
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Messages */}
                {message && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium animate-in fade-in">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 font-medium animate-in fade-in">
                        {error}
                    </div>
                )}

                {/* Form Content */}
                <div className="glass-red rounded-xl shadow-lg p-8 mb-8">
                    {/* Step 1: Basic Details */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-red-600 pl-4">
                                Basic Product Details
                            </h2>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                                <h3 className="text-lg font-bold text-blue-800 mb-2">Multi-Vendor: Attach to Existing Product</h3>
                                <p className="text-sm text-blue-600 mb-4">Select an existing product to attach your own payment plans. This will lock the product details.</p>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Find existing product (optional)</label>
                                    <SearchableProductSelect
                                        products={existingProducts}
                                        value={selectedProductId}
                                        onChange={handleSelectExistingProduct}
                                        placeholder="Type to search  e.g. Samsung, Lahore..."
                                        createNewLabel="-- Create new product from scratch --"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="Partner ID"
                                    value={form.userId}
                                    onChange={() => {}}
                                    placeholder="Loading..."
                                    readOnly={true}
                                />

                                <InputField
                                    label="Product Name *"
                                    value={form.productName}
                                    onChange={v => updateForm('productName', v)}
                                    placeholder="Enter product name"
                                    readOnly={!!selectedProductId}
                                />
                                
                                <InputField
                                    label="City *"
                                    value={form.city}
                                    onChange={v => updateForm('city', v)}
                                    placeholder="e.g., Lahore"
                                    readOnly={!!selectedProductId}
                                />

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Category *
                                    </label>
                                    <select
                                        value={form.category}
                                        onChange={e => handleCategoryChange(e.target.value)}
                                        disabled={!!selectedProductId}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                    >
                                        <option value="">Select Category</option>
                                        {Object.entries(getGroupedCategories()).map(([group, categories]) => (
                                            <optgroup key={group} label={group}>
                                                {categories.map(cat => (
                                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>

                                <InputField
                                    label="Company / Brand"
                                    value={form.companyName}
                                    onChange={v => updateForm('companyName', v)}
                                    placeholder="e.g., Samsung"
                                    readOnly={!!selectedProductId}
                                />

                                <InputField
                                    label="Video URL"
                                    value={form.videoUrl}
                                    onChange={v => updateForm('videoUrl', v)}
                                    placeholder="https://..."
                                    readOnly={!!selectedProductId}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={e => updateForm('description', e.target.value)}
                                    rows={4}
                                    disabled={!!selectedProductId}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none disabled:bg-gray-100 disabled:text-gray-500"
                                    placeholder="Describe the product..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Technical Specifications */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-red-600 pl-4">
                                Technical Specifications
                            </h2>

                            {!form.category || !CATEGORY_SPECIFICATIONS[form.category] ? (
                                <div className="py-20 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 font-medium">
                                        {!form.category ? 'Please select a category in Step 1' : 'No specific technical specifications required for this category'}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        {!form.category ? 'Go back to Step 1 and select a product category' : 'Skip to the next step to continue'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {CATEGORY_SPECIFICATIONS[form.category]?.map((spec, index) => (
                                        <div key={index} className={spec.type === 'textarea' ? 'md:col-span-2 lg:col-span-3' : ''}>
                                            {spec.type === 'text' || !spec.type ? (
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        {spec.field} {spec.required && <span className="text-red-500">*</span>}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={getSpecValue(spec.field)}
                                                        onChange={e => updateSpecification(spec.field, e.target.value)}
                                                        placeholder={spec.placeholder || `Enter ${spec.field.toLowerCase()}`}
                                                        required={spec.required}
                                                        disabled={!!selectedProductId}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                                    />
                                                </div>
                                            ) : spec.type === 'select' ? (
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        {spec.field} {spec.required && <span className="text-red-500">*</span>}
                                                    </label>
                                                    <select
                                                        value={getSpecValue(spec.field)}
                                                        onChange={e => updateSpecification(spec.field, e.target.value)}
                                                        required={spec.required}
                                                        disabled={!!selectedProductId}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                                    >
                                                        <option value="">Select {spec.field}</option>
                                                        {spec.options?.map((option, i) => (
                                                            <option key={i} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : spec.type === 'textarea' ? (
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        {spec.field} {spec.required && <span className="text-red-500">*</span>}
                                                    </label>
                                                    <textarea
                                                        value={getSpecValue(spec.field)}
                                                        onChange={e => updateSpecification(spec.field, e.target.value)}
                                                        placeholder={spec.placeholder || `Enter ${spec.field.toLowerCase()}`}
                                                        required={spec.required}
                                                        rows={3}
                                                        disabled={!!selectedProductId}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none disabled:bg-gray-100 disabled:text-gray-500"
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Product Variants Section */}
                            {false && form.category && ['smartphones', 'tablets', 'laptops', 'gaming_consoles'].includes(form.category) && (
                                <div className="mt-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-gray-800">Product Variants</h3>
                                        <button 
                                            type="button"
                                            onClick={() => setForm(f => ({
                                                ...f,
                                                variants: [...f.variants, { 
                                                    variantName: "", 
                                                    price: f.price || 0, 
                                                    paymentPlans: [],
                                                    status: "active" 
                                                }]
                                            }))}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            + Add Variant
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {form.variants.map((variant, vIdx) => (
                                            <div key={vIdx} className="p-6 bg-white border border-gray-200 rounded-xl relative shadow-sm">
                                                <button 
                                                    type="button"
                                                    onClick={() => setForm(f => ({
                                                        ...f,
                                                        variants: f.variants.filter((_, i) => i !== vIdx)
                                                    }))}
                                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-600"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <InputField 
                                                        label="Variant Name" 
                                                        value={variant.variantName} 
                                                        onChange={v => {
                                                            const newVariants = [...form.variants];
                                                            newVariants[vIdx].variantName = v;
                                                            setForm(f => ({ ...f, variants: newVariants }));
                                                        }}
                                                        placeholder="e.g. 12/256GB"
                                                    />
                                                    <InputField 
                                                        label="Cash Price (₨)" 
                                                        type="number"
                                                        value={variant.price} 
                                                        onChange={v => {
                                                            const newVariants = [...form.variants];
                                                            newVariants[vIdx].price = v;
                                                            setForm(f => ({ ...f, variants: newVariants }));
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Images */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-red-600 pl-4">
                                Product Images
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Image Gallery */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Uploaded Images ({form.productImages.length})
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {form.productImages.map((url, i) => (
                                            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                                                <img src={url} className="w-full h-full object-cover" alt="" />
                                                {(!selectedProductId) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => updateForm('productImages', form.productImages.filter((_, idx) => idx !== i))}
                                                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        
                                        {/* Local images preview */}
                                        {localImages.map((file, i) => (
                                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-blue-300 bg-blue-50">
                                                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-50" alt="" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                                </div>
                                            </div>
                                        ))}

                                        {(!selectedProductId) && (
                                            <label className="aspect-square rounded-lg border-4 border-dashed border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all flex flex-col items-center justify-center cursor-pointer group">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleFilesChange}
                                                />
                                                <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-red-600 transition-colors" />
                                                <span className="text-xs font-medium text-gray-500 group-hover:text-red-600 mt-2">
                                                    Add Images
                                                </span>
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Upload Panel */}
                                {(!selectedProductId) && (
                                    <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-8 flex flex-col justify-center items-center text-center space-y-6 text-white">
                                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold">Upload Images</h3>
                                        <p className="text-red-100 text-sm">
                                            {localImages.length > 0
                                                ? `${localImages.length} image${localImages.length > 1 ? 's' : ''} ready to upload`
                                                : 'Select images to upload'}
                                        </p>
                                        <button
                                            type="button"
                                            disabled={!localImages.length || uploading}
                                            onClick={handleUploadAll}
                                            className="w-full py-3 bg-white text-red-600 rounded-lg font-bold hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {uploading ? 'Uploading...' : `Upload ${localImages.length || ''} Image${localImages.length !== 1 ? 's' : ''}`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Payment Plans */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-red-600 pl-4">
                                    Variants & Payment Plans
                                </h2>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Reference cash price</p>
                                    <p className="text-xl font-bold text-red-600">
                                        ₨ {deriveProductPrice(form.variants, form.price, form).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <PartnerStep4Tabs active={step4Tab} onChange={setStep4Tab} />

                            {(step4Tab === 'finance' || step4Tab === 'both') && (
                                <ProductFinancePanel
                                    finance={form.finance}
                                    onUpdate={(field, value) => updateForm(`finance.${field}`, value)}
                                />
                            )}

                            {(step4Tab === 'installments' || step4Tab === 'both') && (
                            <>
                            <div className="p-4 bg-white border-2 border-dashed border-blue-300 rounded-xl space-y-3">
                                <p className="text-sm font-bold text-gray-800">What do you want to save?</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep4SaveMode(STEP4_SAVE_MODES.CASH)}
                                        className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${
                                            isCashOnlyMode
                                                ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                                                : "bg-white border-gray-200 text-gray-700 hover:border-emerald-400"
                                        }`}
                                    >
                                        Cash price
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep4SaveMode(STEP4_SAVE_MODES.CASH_INSTALLMENTS)}
                                        className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${
                                            step4SaveMode === STEP4_SAVE_MODES.CASH_INSTALLMENTS
                                                ? "bg-red-600 border-red-600 text-white shadow-md"
                                                : "bg-white border-gray-200 text-gray-700 hover:border-red-300"
                                        }`}
                                    >
                                        Cash + installments
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep4SaveMode(STEP4_SAVE_MODES.INSTALLMENTS_ONLY)}
                                        className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${
                                            isInstallmentsOnlyMode
                                                ? "bg-violet-600 border-violet-600 text-white shadow-md"
                                                : "bg-white border-gray-200 text-gray-700 hover:border-violet-400"
                                        }`}
                                    >
                                        Only installments
                                    </button>
                                </div>
                                <p className="text-xs text-gray-600">
                                    {isCashOnlyMode
                                        ? selectedProductId
                                            ? "Set your cash price on catalog variants or add your own variant  no payment plans required."
                                            : "Save variant cash prices now; add installment plans later from the list."
                                        : isInstallmentsOnlyMode
                                        ? "Enter cash price for installment calculations only  cash prices will not be stored on the product."
                                        : "Save cash prices and include payment plans in this submission."}
                                </p>
                            </div>

                            {showVariantSection && (
                                <div className="space-y-4 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                                    <div className="flex items-center justify-between gap-4 flex-wrap">
                                        <div>
                                            {selectedProductId ? (
                                                <>
                                                    <h3 className="text-lg font-bold text-gray-800">Your pricing on this product</h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {isInstallmentsOnlyMode
                                                            ? "Enter cash & discounted price for calculations  not saved unless you choose Cash price or Cash + installments."
                                                            : "Set your cash price on catalog variants, or add your own variant."}
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <h3 className="text-lg font-bold text-gray-800">Create Product Variants</h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {isInstallmentsOnlyMode
                                                            ? "Add variants for plan targeting. Cash & discounted prices are for calculation only."
                                                            : "Cash price + discounted price → discount % is calculated automatically."}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        {selectedProductId ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        variants: [
                                                            ...f.variants,
                                                            {
                                                                variantName: "",
                                                                price: "",
                                                                discountedPrice: "",
                                                                discountPercent: 0,
                                                                status: "active",
                                                                isCatalogVariant: false,
                                                                isPartnerOwned: true,
                                                            },
                                                        ],
                                                    }))
                                                }
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                                            >
                                                + Add your variant
                                            </button>
                                        ) : (
                                        <div className="flex flex-wrap gap-2">
                                            <button type="button" onClick={() => setForm(f => ({ ...f, variants: [...f.variants, { variantName: "", price: "", discountedPrice: "", discountPercent: 0, paymentPlans: [], status: "active" }] }))} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ Add Variant</button>
                                            {!hasStandardVariant(form.variants) && Number(form.price) > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setForm(f => ({
                                                        ...f,
                                                        variants: [
                                                            {
                                                                variantName: "Standard",
                                                                price: f.price,
                                                                discountedPrice: f.discountedPrice || f.price,
                                                                discountPercent: f.discountPercent || 0,
                                                                paymentPlans: [],
                                                                status: "active",
                                                            },
                                                            ...f.variants,
                                                        ],
                                                    }))}
                                                    className="px-4 py-2 bg-white border border-blue-300 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-100"
                                                >
                                                    + Add Standard (base cash price)
                                                </button>
                                            )}
                                        </div>
                                        )}
                                    </div>
                                    {form.variants.length === 0 ? (
                                        <p className="text-sm text-gray-500 py-4 text-center">
                                            {selectedProductId
                                                ? "Add your cash price below, or add a variant option for your company."
                                                : "Add at least one variant (e.g. Standard or storage option), then link each payment plan to that variant."}
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {form.variants.map((variant, vIdx) => (
                                                <div key={vIdx} className="p-4 bg-white border border-gray-200 rounded-xl relative">
                                                    {(!selectedProductId || variant.isPartnerOwned) && (
                                                    <button type="button" onClick={() => setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== vIdx) }))} className="absolute top-3 right-3 text-gray-400 hover:text-red-600"><X className="w-5 h-5" /></button>
                                                    )}
                                                    {selectedProductId && variant.isCatalogVariant ? (
                                                        <div className="space-y-4">
                                                            <div className="space-y-1">
                                                                <span className="text-xs font-medium text-gray-500">Catalog variant (listing  name not editable)</span>
                                                                <p className="text-base font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 cursor-default">
                                                                    {variant.variantName || `Variant ${vIdx + 1}`}
                                                                    {variant.listingPrice != null && (
                                                                        <span className="block text-xs font-normal text-gray-500 mt-1">
                                                                            Listed at ₨ {Number(variant.listingPrice).toLocaleString()}
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <VariantPricingFields
                                                                variant={variant}
                                                                onUpdate={(field, value) => updateVariantPricing(vIdx, field, value)}
                                                                calcOnly={isInstallmentsOnlyMode}
                                                            />
                                                        </div>
                                                    ) : selectedProductId && variant.isPartnerOwned ? (
                                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 pr-8">
                                                            <InputField label="Your variant name *" value={variant.variantName} onChange={v => { const nv = [...form.variants]; nv[vIdx].variantName = v; setForm(f => ({ ...f, variants: nv })); }} placeholder="e.g. 12GB / 256GB  your offer" />
                                                            <VariantPricingFields
                                                                variant={variant}
                                                                onUpdate={(field, value) => updateVariantPricing(vIdx, field, value)}
                                                                calcOnly={isInstallmentsOnlyMode}
                                                                compact
                                                            />
                                                        </div>
                                                    ) : (
                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5 pr-8">
                                                        <InputField label="Variant Name *" value={variant.variantName} onChange={v => { const nv = [...form.variants]; nv[vIdx].variantName = v; setForm(f => ({ ...f, variants: nv })); }} placeholder="e.g. 12GB / 256GB" />
                                                        <VariantPricingFields
                                                            variant={variant}
                                                            onUpdate={(field, value) => updateVariantPricing(vIdx, field, value)}
                                                            calcOnly={isInstallmentsOnlyMode}
                                                            compact
                                                        />
                                                    </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {!showVariantSection && (
                                <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-4">
                                    <p className="text-sm font-medium text-gray-700">
                                        {isInstallmentsOnlyMode
                                            ? "Pricing for installment calculations (not stored on product)"
                                            : "Product pricing"}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <InputField
                                            label="Cash Price (₨) *"
                                            type="number"
                                            value={form.price}
                                            onChange={(v) => updateBasePricing("price", v)}
                                            placeholder="Original cash price"
                                        />
                                        <InputField
                                            label="Discounted Price (₨)"
                                            type="number"
                                            value={form.discountedPrice ?? ""}
                                            onChange={(v) => updateBasePricing("discountedPrice", v)}
                                            placeholder="Sale / offer price"
                                        />
                                        <InputField
                                            label="Discount % (auto)"
                                            type="number"
                                            value={form.discountPercent ?? 0}
                                            readOnly
                                        />
                                        <div className="flex flex-col justify-end">
                                            <span className="text-xs text-gray-500">Effective price for plans</span>
                                            <span className="text-lg font-bold text-red-600">
                                                ₨ {getBaseEffectivePrice(form).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedProductId && existingPlans.length === 0 && showPaymentPlans && (
                                <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                                    No payment plans from your company on this product yet. Save your cash prices above, or add your first installment plan below.
                                </p>
                            )}

                            {showPaymentPlans && (
                            <Step4PlansBuilder
                                form={form}
                                setForm={setForm}
                                selectedProductId={selectedProductId}
                                existingPlans={existingPlans}
                                showVariantHint={showVariantSection && form.variants.length > 0}
                            />
                            )}

                            {isCashOnlyMode && (
                                <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                                    Ready to save: {form.variants.length} variant(s) with cash prices. Installment plans are optional and can be added later.
                                </p>
                            )}
                            {isInstallmentsOnlyMode && (
                                <p className="text-sm text-violet-800 bg-violet-50 border border-violet-200 rounded-lg px-4 py-3">
                                    Only installment plans will be saved. Cash prices entered above are used for calculations only.
                                </p>
                            )}
                            </>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                    <button
                        type="button"
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        disabled={step === 1}
                        className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-0 disabled:cursor-not-allowed transition-all"
                    >
                        Previous
                    </button>
                    
                    <div className="flex gap-4">
                        {step < 4 ? (
                            <button
                                type="button"
                                onClick={() => setStep(s => s + 1)}
                                disabled={!isStepValid()}
                                className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next Step
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || !isStepValid()}
                                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading
                                    ? 'Saving...'
                                    : isInstallmentsOnlyMode
                                      ? 'Save installment plans only'
                                      : selectedProductId && (isCashOnlyMode || !getActivePaymentPlans(form.paymentPlans).length)
                                      ? 'Save your pricing'
                                      : isCashOnlyMode
                                        ? 'Save Product (cash price)'
                                        : 'Create Installment Plan'}
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

// Input Field Component
const InputField = ({ label, value, onChange, type = "text", placeholder = "", readOnly = false }) => (
    <div className="space-y-2">
        {label && (
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>
        )}
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${
                readOnly ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'bg-white'
            }`}
        />
    </div>
);

/** Cash price + discounted price → auto discount % */
const VariantPricingFields = ({ variant, onUpdate, calcOnly = false, compact = false }) => {
    const cashLabel = calcOnly ? "Cash Price (calc) *" : "Cash Price (₨) *";
    const discLabel = calcOnly ? "Discounted Price (calc)" : "Discounted Price (₨)";

    if (compact) {
        return (
            <>
                <InputField label={cashLabel} type="number" value={variant.price} onChange={(v) => onUpdate("price", v)} />
                <InputField label={discLabel} type="number" value={variant.discountedPrice ?? ""} onChange={(v) => onUpdate("discountedPrice", v)} placeholder="Same as cash if no discount" />
                <InputField label="Discount % (auto)" type="number" value={variant.discountPercent ?? 0} readOnly />
                <div className="flex flex-col justify-end">
                    <span className="text-xs text-gray-500">Effective price</span>
                    <span className="text-lg font-bold text-red-600">₨ {getVariantEffectivePrice(variant).toLocaleString()}</span>
                </div>
            </>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <InputField label={cashLabel} type="number" value={variant.price} onChange={(v) => onUpdate("price", v)} />
            <InputField label={discLabel} type="number" value={variant.discountedPrice ?? ""} onChange={(v) => onUpdate("discountedPrice", v)} placeholder="Same as cash if no discount" />
            <InputField label="Discount % (auto)" type="number" value={variant.discountPercent ?? 0} readOnly />
            <div className="flex flex-col justify-end">
                <span className="text-xs text-gray-500">Effective price for plans</span>
                <span className="text-lg font-bold text-red-600">₨ {getVariantEffectivePrice(variant).toLocaleString()}</span>
            </div>
        </div>
    );
};

export default CreateInstallmentPlan;
