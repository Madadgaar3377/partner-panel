import React from 'react';
import { getApprovalBadge, getStockBadge } from '../../utils/installmentStatus';

const Badge = ({ config, size = 'sm' }) => {
  const sizeClass =
    size === 'lg'
      ? 'px-3 py-1.5 text-xs'
      : 'px-2.5 py-1 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap ${sizeClass} ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
};

const InstallmentStatusBadges = ({
  item,
  size = 'sm',
  showStock = true,
  showApproval = true,
  className = '',
}) => {
  const stockBadge = getStockBadge(item);
  const approvalBadge = getApprovalBadge(item);

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {showStock && <Badge config={stockBadge} size={size} />}
      {showApproval && <Badge config={approvalBadge} size={size} />}
    </div>
  );
};

export default InstallmentStatusBadges;
