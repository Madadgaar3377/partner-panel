import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Copy, CheckCircle2, ArrowLeft, Key } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { getIntegrationBaseUrl } from '../../utils/partnerApiKeys';

const INTEGRATION_BASE = getIntegrationBaseUrl();

const endpoints = [
  { method: 'GET', path: '/me', scope: 'profile:read', desc: 'Verify API key & partner profile' },
  { method: 'GET', path: '/installments', scope: 'installments:read', desc: 'List installment products (Phase 2)' },
  { method: 'POST', path: '/installments', scope: 'installments:write', desc: 'Create product (Phase 2)' },
  { method: 'GET', path: '/applications', scope: 'applications:read', desc: 'List applications (Phase 2)' },
  { method: 'PATCH', path: '/applications/:id/status', scope: 'applications:write', desc: 'Update status (Phase 2)' },
  { method: 'GET', path: '/dashboard', scope: 'dashboard:read', desc: 'Dashboard stats (Phase 2)' },
];

const ApiKeysDocs = () => {
  const [copied, setCopied] = useState(null);

  const copyText = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      alert('Copy failed');
    }
  };

  const curlMe = `curl -s "${INTEGRATION_BASE}/me" \\
  -H "Authorization: Bearer $MADADGAAR_API_KEY"`;

  const envExample = `MADADGAAR_API_KEY=mg_live_your_secret_here
MADADGAAR_API_BASE=${INTEGRATION_BASE}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/settings/api-keys"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to API Keys
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <BookOpen className="w-7 h-7 text-red-600" />
          Partner API Documentation
        </h1>
        <p className="text-gray-600 mb-8">
          Use your API key from server-side code only. Never expose it in browser JavaScript or mobile apps.
        </p>

        <section id="create-key" className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Key className="w-5 h-5 text-red-600" />
            1. Create & store your key
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
            <li>Go to <Link to="/settings/api-keys" className="text-red-600 hover:underline">Settings → API Keys</Link> and click <strong>Generate Key</strong>.</li>
            <li>Copy the secret immediately — it is shown only once.</li>
            <li>Store in your server environment variables:</li>
          </ol>
          <div className="mt-3 relative">
            <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs overflow-x-auto">{envExample}</pre>
            <button
              type="button"
              onClick={() => copyText(envExample, 'env')}
              className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
            >
              {copied === 'env' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </section>

        <section id="auth" className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">2. Authentication</h2>
          <p className="text-sm text-gray-600 mb-3">Base URL for integration:</p>
          <code className="block bg-gray-100 rounded-xl px-4 py-2 text-sm font-mono mb-4 break-all">{INTEGRATION_BASE}</code>
          <p className="text-sm text-gray-600 mb-2">Send your key using either header:</p>
          <pre className="bg-gray-100 rounded-xl p-4 text-xs overflow-x-auto">{`Authorization: Bearer mg_live_...
# or
X-API-Key: mg_live_...`}</pre>
        </section>

        <section id="test" className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">3. Test your key</h2>
          <div className="relative">
            <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs overflow-x-auto">{curlMe}</pre>
            <button
              type="button"
              onClick={() => copyText(curlMe, 'curl')}
              className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
            >
              {copied === 'curl' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </section>

        <section id="endpoints" className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">4. Endpoints</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 font-semibold text-gray-700">Method</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Path</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Scope</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {endpoints.map((ep) => (
                  <tr key={ep.path + ep.method}>
                    <td className="py-2">
                      <span className="font-mono text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{ep.method}</span>
                    </td>
                    <td className="py-2 font-mono text-xs text-gray-800">{INTEGRATION_BASE}{ep.path}</td>
                    <td className="py-2 text-xs text-gray-600">{ep.scope}</td>
                    <td className="py-2 text-gray-600">{ep.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ApiKeysDocs;
