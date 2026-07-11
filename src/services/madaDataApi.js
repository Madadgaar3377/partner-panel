import baseApi from '../constants/apiUrl';

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const downloadInstallmentTemplate = async (token, { category, uploadMode }) => {
  const params = new URLSearchParams({ category, uploadMode });
  const res = await fetch(`${baseApi}/mada-data/installments/template?${params}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Template download failed');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `madadgaar-${category}-${uploadMode}-template.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};

export const uploadInstallmentBulk = async (token, { file, category, uploadMode, partnerId }) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('category', category);
  fd.append('uploadMode', uploadMode);
  if (partnerId) fd.append('partnerId', partnerId);

  const res = await fetch(`${baseApi}/mada-data/installments/upload`, {
    method: 'POST',
    headers: authHeaders(token),
    body: fd,
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Upload failed');
  }
  return data;
};

export const getBulkJobStatus = async (token, jobId) => {
  const res = await fetch(`${baseApi}/mada-data/jobs/${jobId}`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch job status');
  }
  return data.data;
};

export const listBulkJobs = async (token, { partnerId } = {}) => {
  const params = partnerId ? `?partnerId=${encodeURIComponent(partnerId)}` : '';
  const res = await fetch(`${baseApi}/mada-data/jobs${params}`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to list jobs');
  }
  return data.data;
};

export const startExport = async (token, exportType, filters = {}) => {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${baseApi}/mada-data/export/${exportType}?${params}`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Export failed to start');
  }
  return data;
};

export const publishInstallments = async (token, { installmentPlanIds, requireImages = true, partnerId }) => {
  const res = await fetch(`${baseApi}/mada-data/installments/publish`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ installmentPlanIds, requireImages, partnerId }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Publish failed');
  }
  return data;
};

export const UPLOAD_MODES = [
  { value: 'cash', label: 'Cash only' },
  { value: 'cash_installments', label: 'Cash + Installments' },
  { value: 'installments_only', label: 'Installments only' },
];
