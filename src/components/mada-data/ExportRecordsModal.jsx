import React, { useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { startExport, getBulkJobStatus, downloadJobFile } from '../../services/madaDataApi';

const EXPORT_TYPES = [
  { value: 'installments', label: 'Installment listings', hasCategory: true, categoryType: 'product' },
  { value: 'agents', label: 'Linked agents', hasCategory: false },
  { value: 'finance', label: 'Finance & commissions', hasCategory: true, categoryType: 'case' },
  { value: 'cases', label: 'Cases & track record', hasCategory: true, categoryType: 'case' },
];

const CASE_CATEGORY_OPTIONS = [
  { value: '', label: 'All categories' },
  { value: 'Installment', label: 'Installment' },
  { value: 'Property', label: 'Property' },
  { value: 'Loan', label: 'Loan' },
  { value: 'Insurance', label: 'Insurance' },
];

const PRODUCT_CATEGORY_OPTIONS = [
  { value: '', label: 'All product categories' },
  { value: 'laptops', label: 'Laptops' },
  { value: 'smartphones', label: 'Smartphones' },
  { value: 'air_conditioners', label: 'Air Conditioners' },
  { value: 'cars', label: 'Cars' },
];

const ExportRecordsModal = ({ onClose, token: tokenProp, defaultExportType = 'installments' }) => {
  const [exportType, setExportType] = useState(defaultExportType);
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const token = tokenProp || localStorage.getItem('userToken');
  const selected = EXPORT_TYPES.find((t) => t.value === exportType) || EXPORT_TYPES[0];
  const categoryOptions = selected.categoryType === 'product' ? PRODUCT_CATEGORY_OPTIONS : CASE_CATEGORY_OPTIONS;

  const handleExport = async () => {
    if (!startDate || !endDate) {
      setError('Start and end dates are required');
      return;
    }
    setLoading(true);
    setError('');
    setStatus('Starting export…');
    try {
      const filters = { startDate, endDate };
      if (category) filters.category = category;
      const { jobId } = await startExport(token, exportType, filters);
      setStatus('Generating file…');
      const interval = setInterval(async () => {
        const job = await getBulkJobStatus(token, jobId);
        if (job.status === 'completed') {
          clearInterval(interval);
          setLoading(false);
          setStatus('Export ready — downloading…');
          if (job.hasDownload) {
            await downloadJobFile(token, jobId, `madadgaar-${exportType}-export.xlsx`);
            setStatus('Download complete (file removed from server storage)');
          }
        } else if (job.status === 'failed') {
          clearInterval(interval);
          setLoading(false);
          setError(job.errorMessage || 'Export failed');
          setStatus('');
        }
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError(err.message);
      setStatus('');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-red-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Download records</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-red-50 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Record type</label>
            <select
              value={exportType}
              onChange={(e) => { setExportType(e.target.value); setCategory(''); }}
              className="select-brand w-full"
            >
              {EXPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {selected.hasCategory && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category (optional)</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="select-brand w-full">
                {categoryOptions.map((c) => (
                  <option key={c.value || 'all'} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Start date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-brand w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">End date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-brand w-full" />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {status && (
            <p className="text-sm text-gray-600 flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin text-red-600" />}
              {status}
            </p>
          )}

          <button type="button" disabled={loading} onClick={handleExport} className="btn-brand w-full">
            <Download className="w-4 h-4" />
            Export xlsx
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportRecordsModal;
