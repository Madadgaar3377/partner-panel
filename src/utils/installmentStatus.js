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
    className: 'bg-red-600 text-white border-red-600',
    dot: 'bg-white',
  },
  pending: {
    label: 'Pending',
    className: 'bg-red-100 text-red-800 border-red-200',
    dot: 'bg-red-500',
  },
  drafted: {
    label: 'Drafted',
    className: 'bg-white text-gray-600 border-gray-300',
    dot: 'bg-gray-400',
  },
};

const STOCK_BADGES = {
  in_stock: {
    label: 'In Stock',
    className: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
  out_of_stock: {
    label: 'Out of Stock',
    className: 'bg-white text-red-600 border-red-300',
    dot: 'bg-red-300',
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
