export const APPROVAL_STATUS_OPTIONS = [
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'drafted', label: 'Drafted' },
];

export const STOCK_STATUS_OPTIONS = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

export const LIST_STATUS_FILTER_OPTIONS = [
  { value: 'All', label: 'All statuses' },
  ...STOCK_STATUS_OPTIONS,
  ...APPROVAL_STATUS_OPTIONS,
];

const APPROVAL_BADGES = {
  approved: {
    label: 'Approved',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  drafted: {
    label: 'Drafted',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
  },
};

const STOCK_BADGES = {
  in_stock: {
    label: 'In Stock',
    className: 'bg-sky-100 text-sky-800 border-sky-200',
    dot: 'bg-sky-500',
  },
  out_of_stock: {
    label: 'Out of Stock',
    className: 'bg-rose-100 text-rose-800 border-rose-200',
    dot: 'bg-rose-500',
  },
};

export const normalizeApprovalStatus = (raw) => {
  const value = String(raw || 'pending').trim().toLowerCase();
  if (value === 'active' || value === 'approved') return 'approved';
  if (value === 'draft' || value === 'drafted') return 'drafted';
  if (value === 'pending') return 'pending';
  return 'pending';
};

export const normalizeStockStatus = (raw) => {
  const value = String(raw || 'in_stock').trim().toLowerCase().replace(/\s+/g, '_');
  if (value === 'out_of_stock' || value === 'outofstock') return 'out_of_stock';
  return 'in_stock';
};

export const getApprovalBadge = (item) =>
  APPROVAL_BADGES[normalizeApprovalStatus(item?.status)] || APPROVAL_BADGES.pending;

export const getStockBadge = (item) =>
  STOCK_BADGES[normalizeStockStatus(item?.stockStatus)] || STOCK_BADGES.in_stock;

export const matchesInstallmentStatusFilter = (item, filterValue) => {
  if (!filterValue || filterValue === 'All') return true;
  if (filterValue === 'in_stock' || filterValue === 'out_of_stock') {
    return normalizeStockStatus(item?.stockStatus) === filterValue;
  }
  return normalizeApprovalStatus(item?.status) === filterValue;
};

export const countByStatusFilter = (items, filterValue) =>
  (items || []).filter((item) => matchesInstallmentStatusFilter(item, filterValue)).length;
