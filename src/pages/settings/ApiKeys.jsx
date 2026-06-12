import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Key,
  Plus,
  Copy,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Zap,
  X,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { DOCS_SITE } from '../../constants/siteUrls';
import { PageLoader } from '../../components/Loader';
import {
  listPartnerApiKeys,
  createPartnerApiKey,
  revokePartnerApiKey,
  testPartnerApiKey,
  SCOPE_OPTIONS,
  DEFAULT_SCOPES,
  REQUIRED_SCOPES,
  withRequiredScopes,
  formatRelativeTime,
  getIntegrationBaseUrl,
} from '../../utils/partnerApiKeys';

const statusStyles = {
  active: 'bg-green-100 text-green-800',
  revoked: 'bg-gray-100 text-gray-600',
  expired: 'bg-amber-100 text-amber-800',
};

const ApiKeys = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(null);
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: '',
    scopes: [...DEFAULT_SCOPES],
    expiresAt: '',
  });

  const loadKeys = useCallback(async () => {
    try {
      setError('');
      const data = await listPartnerApiKeys();
      setKeys(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const toggleScope = (scopeId) => {
    if (REQUIRED_SCOPES.includes(scopeId)) return;
    setForm((prev) => {
      const has = prev.scopes.includes(scopeId);
      const scopes = has
        ? prev.scopes.filter((s) => s !== scopeId)
        : [...prev.scopes, scopeId];
      return { ...prev, scopes: withRequiredScopes(scopes) };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      setCreating(true);
      setError('');
      const payload = {
        name: form.name.trim(),
        scopes: withRequiredScopes(form.scopes),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };
      const data = await createPartnerApiKey(payload);
      setShowCreateModal(false);
      setShowSecretModal(data.data);
      setTestResult(null);
      setForm({ name: '', scopes: [...DEFAULT_SCOPES], expiresAt: '' });
      await loadKeys();
    } catch (err) {
      setError(err.message || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (keyId, name) => {
    if (!window.confirm(`Revoke API key "${name}"? This cannot be undone.`)) return;
    try {
      setRevokingId(keyId);
      await revokePartnerApiKey(keyId);
      await loadKeys();
    } catch (err) {
      alert(err.message || 'Failed to revoke key');
    } finally {
      setRevokingId(null);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Copy failed  please select and copy manually');
    }
  };

  const handleTestKey = async () => {
    if (!showSecretModal?.apiKey) return;
    try {
      setTesting(true);
      setTestResult(null);
      const data = await testPartnerApiKey(showSecretModal.apiKey);
      setTestResult({ success: true, message: data.message, partner: data.data });
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return <PageLoader text="Loading API keys..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Key className="w-7 h-7 text-red-600" />
              API Keys
            </h1>
            <p className="text-gray-600 mt-1 max-w-2xl">
              Connect your website, ERP, or custom panel to Madadgaar. Keys are shown in full only once when created.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={DOCS_SITE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-md transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              API Documentation
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
            <Link
              to="/settings/api-keys/docs"
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Quick test
            </Link>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-md transition-colors"
            >
              <Plus className="w-5 h-5" />
              Generate Key
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">
            Copy your key when created, or find it in the confirmation email sent to your partner address. Save for lifetime use in your server environment (e.g. <code className="bg-amber-100 px-1 rounded">MADADGAAR_API_KEY</code>).
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {keys.length === 0 ? (
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-10 text-center">
            <Key className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No API keys yet. Generate one to connect your systems.</p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="text-red-600 font-semibold hover:underline"
            >
              Generate your first key
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Prefix</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Scopes</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Last used</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {keys.map((key) => (
                    <tr key={key.keyId} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-900">{key.name}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">
                        {key.keyPrefixMasked || `${key.keyPrefix}…`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(key.scopes || []).slice(0, 3).map((s) => (
                            <span key={s} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                              {s.split(':')[1] || s}
                            </span>
                          ))}
                          {(key.scopes || []).length > 3 && (
                            <span className="text-xs text-gray-500">+{key.scopes.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[key.status] || statusStyles.active}`}>
                          {key.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatRelativeTime(key.lastUsedAt)}</td>
                      <td className="px-4 py-3 text-right">
                        {key.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => handleRevoke(key.keyId, key.name)}
                            disabled={revokingId === key.keyId}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            {revokingId === key.keyId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Generate API Key</h2>
              <button type="button" onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Key name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Production Website"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Permissions (scopes)</label>
                <div className="space-y-2">
                  {SCOPE_OPTIONS.map((scope) => {
                    const isRequired = REQUIRED_SCOPES.includes(scope.id);
                    return (
                      <label
                        key={scope.id}
                        className={`flex items-start gap-3 p-3 border border-gray-100 rounded-xl ${
                          isRequired ? 'bg-gray-50 cursor-default' : 'hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.scopes.includes(scope.id) || isRequired}
                          onChange={() => toggleScope(scope.id)}
                          disabled={isRequired}
                          className="mt-1 accent-red-600 disabled:opacity-70"
                        />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {scope.label}
                            {isRequired && (
                              <span className="ml-2 text-xs font-normal text-gray-500">(always on)</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">{scope.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Expiry date <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !form.name.trim()}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secret shown once modal */}
      {showSecretModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                API key created
              </h2>
              <p className="text-sm text-amber-700 mt-1">Copy this key now or check your email  the full key is included for lifetime reference.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Your API key</p>
                <div className="flex gap-2">
                  <code className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono break-all">
                    {showSecretModal.apiKey}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(showSecretModal.apiKey)}
                    className="shrink-0 px-3 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 flex items-center gap-1"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 text-xs font-mono text-gray-600 break-all">
                MADADGAAR_API_BASE={getIntegrationBaseUrl()}
              </div>

              <button
                type="button"
                onClick={handleTestKey}
                disabled={testing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-200 text-red-700 rounded-xl hover:bg-red-50 disabled:opacity-50"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Test connection (GET /me)
              </button>

              {testResult && (
                <div className={`rounded-xl px-4 py-3 text-sm ${testResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {testResult.success ? (
                    <>
                      <p className="font-semibold">{testResult.message}</p>
                      {testResult.partner?.partnerId && (
                        <p className="mt-1">Partner ID: {testResult.partner.partnerId}</p>
                      )}
                      {testResult.partner?.companyName && (
                        <p className="mt-0.5">Company: {testResult.partner.companyName}</p>
                      )}
                    </>
                  ) : (
                    <p>{testResult.message}</p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowSecretModal(null);
                  setTestResult(null);
                }}
                className="w-full px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700"
              >
                Done  I saved my key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeys;
