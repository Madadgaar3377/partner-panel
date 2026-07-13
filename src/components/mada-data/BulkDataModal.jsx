import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, History } from 'lucide-react';
import { getGroupedCategories } from '../../constants/productCategories';
import {
  downloadInstallmentTemplate,
  uploadInstallmentBulk,
  getBulkJobStatus,
  listBulkJobs,
  UPLOAD_MODES,
} from '../../services/madaDataApi';

const BulkDataModal = ({ onClose, onImportComplete, token: tokenProp, partnerId }) => {
  const [step, setStep] = useState(1);
  const [action, setAction] = useState('download');
  const [category, setCategory] = useState('');
  const [uploadMode, setUploadMode] = useState('cash_installments');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [job, setJob] = useState(null);
  const [polling, setPolling] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const token = tokenProp || localStorage.getItem('userToken');
  const grouped = getGroupedCategories();

  const pollJob = useCallback((jobId) => {
    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const status = await getBulkJobStatus(token, jobId);
        setJob(status);
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
          setPolling(false);
        }
      } catch (err) {
        clearInterval(interval);
        setPolling(false);
        setError(err.message);
      }
    }, 2000);
    return () => {
      clearInterval(interval);
      setPolling(false);
    };
  }, [token]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const jobs = await listBulkJobs(token, { jobType: 'import' });
      setHistory(jobs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (action === 'history') loadHistory();
  }, [action, loadHistory]);

  useEffect(() => {
    if (!job?.jobId || polling) return undefined;
    if (job.status === 'queued' || job.status === 'processing') {
      return pollJob(job.jobId);
    }
    return undefined;
  }, [job?.jobId, job?.status, pollJob, polling]);

  const handleDownload = async () => {
    if (!category) {
      setError('Select a category');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await downloadInstallmentTemplate(token, { category, uploadMode });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!category || !file) {
      setError('Category and xlsx file are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await uploadInstallmentBulk(token, {
        file,
        category,
        uploadMode,
        partnerId,
      });
      const initial = await getBulkJobStatus(token, result.jobId);
      setJob(initial);
      setStep(3);
      if (initial.status === 'queued' || initial.status === 'processing') {
        pollJob(result.jobId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-red-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-red-100">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-gray-900">Bulk Data</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-red-50 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {step === 1 && (
            <>
              <p className="text-sm text-gray-600">Choose an action for installment listings.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => { setAction('download'); setStep(2); }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${action === 'download' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}
                >
                  <Download className="w-6 h-6 text-red-600 mb-2" />
                  <p className="font-semibold text-gray-900">Download template</p>
                  <p className="text-xs text-gray-500 mt-1">Category-specific xlsx with example row</p>
                </button>
                <button
                  type="button"
                  onClick={() => { setAction('upload'); setStep(2); }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${action === 'upload' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}
                >
                  <Upload className="w-6 h-6 text-red-600 mb-2" />
                  <p className="font-semibold text-gray-900">Upload file</p>
                  <p className="text-xs text-gray-500 mt-1">Import products as drafts</p>
                </button>
                <button
                  type="button"
                  onClick={() => { setAction('history'); setStep(4); }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${action === 'history' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}
                >
                  <History className="w-6 h-6 text-red-600 mb-2" />
                  <p className="font-semibold text-gray-900">Import history</p>
                  <p className="text-xs text-gray-500 mt-1">Past uploads & result reports</p>
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="select-brand w-full"
                >
                  <option value="">Select category</option>
                  {Object.entries(grouped).map(([group, cats]) => (
                    <optgroup key={group} label={group}>
                      {cats.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Upload mode *</label>
                <select
                  value={uploadMode}
                  onChange={(e) => setUploadMode(e.target.value)}
                  className="select-brand w-full"
                >
                  {UPLOAD_MODES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              {action === 'upload' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Excel file (.xlsx) *</label>
                  <input
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-50 file:text-red-700"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Max 5 MB · up to 2000 rows. Imports are saved as <strong>drafted</strong>. Add images in the panel, then set status to Approved to publish.
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-brand-outline flex-1">
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={action === 'download' ? handleDownload : handleUpload}
                  className="btn-brand flex-1"
                >
                  {loading ? 'Working…' : action === 'download' ? 'Download' : 'Upload & import'}
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Recent import jobs</p>
                <button type="button" onClick={loadHistory} className="text-xs text-red-600 font-medium hover:underline">
                  Refresh
                </button>
              </div>
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No import jobs yet.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.map((item) => (
                    <div key={item.jobId} className="p-3 border border-gray-100 rounded-xl text-sm">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{item.status}</p>
                          <p className="text-xs text-gray-500">
                            {item.category || '—'} · {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.successCount ?? 0} ok · {item.failCount ?? 0} failed
                          </p>
                        </div>
                        {item.resultFileUrl && (
                          <a
                            href={item.resultFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-red-600 font-medium shrink-0"
                          >
                            Report
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => setStep(1)} className="btn-brand-outline w-full">
                Back
              </button>
            </div>
          )}

          {step === 3 && job && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {job.status === 'completed' ? (
                  <CheckCircle className="w-8 h-8 text-red-600" />
                ) : job.status === 'failed' ? (
                  <AlertCircle className="w-8 h-8 text-red-600" />
                ) : (
                  <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                )}
                <div>
                  <p className="font-semibold text-gray-900 capitalize">{job.status}</p>
                  <p className="text-sm text-gray-600">
                    {job.successCount ?? 0} succeeded · {job.failCount ?? 0} failed
                  </p>
                </div>
              </div>

              {job.progress != null && job.status !== 'completed' && (
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              )}

              {job.errorMessage && (
                <p className="text-sm text-red-600">{job.errorMessage}</p>
              )}

              {job.resultFileUrl && (
                <a
                  href={job.resultFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800"
                >
                  <Download className="w-4 h-4" />
                  Download result report
                </a>
              )}

              {job.status === 'completed' && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800">
                  Drafts imported. Open each listing to add images, then change status to <strong>Approved</strong> to publish on the website.
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (job.status === 'completed' && onImportComplete) onImportComplete();
                  else onClose();
                }}
                className="btn-brand w-full"
              >
                {job.status === 'completed' ? 'View imported drafts' : 'Close'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkDataModal;
