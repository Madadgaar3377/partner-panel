import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Copy, CheckCircle2, ArrowLeft, Key, Zap, Loader2, ExternalLink } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { getIntegrationBaseUrl, integrationGet } from '../../utils/partnerApiKeys';
import { DOCS_SITE } from '../../constants/siteUrls';

const INTEGRATION_BASE = getIntegrationBaseUrl();

const installmentEndpoints = [
  { method: 'GET', path: '/installments', scope: 'installments:read', desc: 'List your products (paginated)' },
  { method: 'POST', path: '/installments', scope: 'installments:write', desc: 'Create new product (same as partner panel)' },
  { method: 'GET', path: '/installments/:id', scope: 'installments:read', desc: 'Get one product with your plans only' },
  { method: 'PUT', path: '/installments/:id', scope: 'installments:write', desc: 'Update product / your payment plans' },
  { method: 'DELETE', path: '/installments/:id', scope: 'installments:write', desc: 'Delete product (owner) or your plans' },
  { method: 'POST', path: '/installments/:id/plans', scope: 'installments:write', desc: 'Add payment plan to existing product' },
  { method: 'DELETE', path: '/installments/:id/plans/:planId', scope: 'installments:write', desc: 'Remove your payment plan' },
];

const loanEndpoints = [
  { method: 'GET', path: '/loans', scope: 'loans:read', desc: 'List your loan plans (paginated)' },
  { method: 'POST', path: '/loans', scope: 'loans:write', desc: 'Create loan plan (same as partner panel)' },
  { method: 'GET', path: '/loans/:id', scope: 'loans:read', desc: 'Get one loan plan (planId or _id)' },
  { method: 'PUT', path: '/loans/:id', scope: 'loans:write', desc: 'Update loan plan fields' },
  { method: 'DELETE', path: '/loans/:id', scope: 'loans:write', desc: 'Delete loan plan you own' },
];

const loanApplicationEndpoints = [
  { method: 'GET', path: '/loan-applications', scope: 'loan-applications:read', desc: 'List applications on your loan plans' },
  { method: 'GET', path: '/loan-applications/:id', scope: 'loan-applications:read', desc: 'Get loan application detail' },
  { method: 'PATCH', path: '/loan-applications/:id/status', scope: 'loan-applications:write', desc: 'Approve / reject / update status' },
  { method: 'DELETE', path: '/loan-applications/:id', scope: 'loan-applications:write', desc: 'Delete pending/rejected/cancelled' },
];

const createLoanExample = `{
  "productName": "Personal Loan - Salaried",
  "bankName": "Partner Bank Ltd",
  "majorCategory": "Personal Financing",
  "subCategory": "Emergency / Personal Needs",
  "minFinancingAmount": 50000,
  "maxFinancingAmount": 2000000,
  "minTenure": 12,
  "maxTenure": 60,
  "tenureUnit": "Months",
  "financingType": "Islamic",
  "indicativeRate": "12% - 18%",
  "rateType": "Floating",
  "description": "Fast approval for salaried individuals",
  "targetAudience": ["Salaried Individuals"],
  "eligibility": {
    "minAge": 21,
    "maxAge": 60,
    "minIncome": 50000,
    "employmentType": ["Salaried"]
  }
}`;

const applyLoanCustomerExample = `POST https://api.madadgaar.com.pk/api/applyLoan
Authorization: Bearer <customer_jwt>   # NOT the partner API key

{
  "planId": "123456",
  "applicantInfo": { "fullName": "...", "cnicNumber": "..." },
  "contactInfo": { "mobileNumber": "...", "city": "Karachi" },
  "loanRequirement": { "loanAmount": 500000, "loanType": "Personal Loan" }
}`;

const otherEndpoints = [
  { method: 'GET', path: '/me', scope: 'any valid key', desc: 'Verify API key & partner profile' },
  { method: 'GET', path: '/dashboard', scope: 'dashboard:read', desc: 'Dashboard stats (same as partner panel)' },
];

const createExample = `{
  "productName": "Samsung Galaxy A55",
  "category": "smartphones",
  "city": "Karachi",
  "price": 85000,
  "description": "Latest model with warranty",
  "productImages": ["https://example.com/image.jpg"],
  "postedBy": "Partner",
  "paymentPlans": [
    {
      "planName": "12 Month Plan",
      "installmentPrice": 85000,
      "downPayment": 10000,
      "monthlyInstallment": 7500,
      "tenureMonths": 12
    }
  ],
  "variants": [],
  "finance": {}
}`;

const ApiKeysDocs = () => {
  const [copied, setCopied] = useState(null);
  const [testKey, setTestKey] = useState('');
  const [testing, setTesting] = useState(null);
  const [testOutput, setTestOutput] = useState(null);

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

  const curlList = `curl -s "${INTEGRATION_BASE}/installments?page=1&limit=20" \\
  -H "Authorization: Bearer $MADADGAAR_API_KEY"`;

  const curlCreate = `curl -s -X POST "${INTEGRATION_BASE}/installments" \\
  -H "Authorization: Bearer $MADADGAAR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${createExample.replace(/\n/g, '')}'`;

  const curlCreateLoan = `curl -s -X POST "${INTEGRATION_BASE}/loans" \\
  -H "Authorization: Bearer $MADADGAAR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${createLoanExample.replace(/\n/g, '')}'`;

  const curlListLoans = `curl -s "${INTEGRATION_BASE}/loans?page=1&limit=20" \\
  -H "Authorization: Bearer $MADADGAAR_API_KEY"`;

  const envExample = `MADADGAAR_API_KEY=mg_live_your_secret_here
MADADGAAR_API_BASE=${INTEGRATION_BASE}`;

  const runTest = async (action) => {
    if (!testKey.trim()) {
      alert('Paste your API key first');
      return;
    }
    setTesting(action);
    setTestOutput(null);
    try {
      let data;
      if (action === 'me') data = await integrationGet(testKey.trim(), '/me');
      else if (action === 'installments') data = await integrationGet(testKey.trim(), '/installments?page=1&limit=5');
      else if (action === 'loans') data = await integrationGet(testKey.trim(), '/loans?page=1&limit=5');
      else if (action === 'loan-applications') data = await integrationGet(testKey.trim(), '/loan-applications?page=1&limit=5');
      else if (action === 'dashboard') data = await integrationGet(testKey.trim(), '/dashboard');
      setTestOutput({ ok: true, data });
    } catch (err) {
      setTestOutput({ ok: false, message: err.message });
    } finally {
      setTesting(null);
    }
  };

  const CodeBlock = ({ text, id }) => (
    <div className="relative mt-2">
      <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap">{text}</pre>
      <button
        type="button"
        onClick={() => copyText(text, id)}
        className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
      >
        {copied === id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );

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

        <div className="mb-6 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-red-800 mb-1">Full documentation</p>
            <p className="text-sm text-gray-600">
              Complete API reference, code examples, field tables, and Test now buttons live at{' '}
              <span className="font-mono text-red-700">{DOCS_SITE.replace('https://', '')}</span>
            </p>
          </div>
          <a
            href={DOCS_SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-md transition-colors shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            Open docs site
            <ExternalLink className="w-4 h-4 opacity-80" />
          </a>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <Zap className="w-7 h-7 text-red-600" />
          Quick reference & live test
        </h1>
        <p className="text-gray-600 mb-8">
          In-panel summary for fast testing. For complete guides (variants, finance, applications), use the docs site above.
        </p>

        <section id="create-key" className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Key className="w-5 h-5 text-red-600" />
            1. Setup
          </h2>
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs overflow-x-auto">{envExample}</pre>
            <button type="button" onClick={() => copyText(envExample, 'env')} className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
              {copied === 'env' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </section>

        <section id="installments" className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">2. Installments API</h2>
          <p className="text-sm text-gray-600 mb-4">
            Base: <code className="bg-gray-100 px-1 rounded">{INTEGRATION_BASE}/installments</code>
             partnerId is auto-filled from your API key (never send another partner&apos;s userId).
          </p>

          <div className="overflow-x-auto mb-6">
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
                {installmentEndpoints.map((ep) => (
                  <tr key={ep.path + ep.method}>
                    <td className="py-2">
                      <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                        ep.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                        ep.method === 'POST' ? 'bg-green-100 text-green-800' :
                        ep.method === 'PUT' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>{ep.method}</span>
                    </td>
                    <td className="py-2 font-mono text-xs text-gray-800">{INTEGRATION_BASE}{ep.path}</td>
                    <td className="py-2 text-xs text-gray-600">{ep.scope}</td>
                    <td className="py-2 text-gray-600">{ep.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="font-semibold text-gray-900 text-sm mb-1">List products</h3>
          <CodeBlock text={curlList} id="curl-list" />

          <h3 className="font-semibold text-gray-900 text-sm mb-1 mt-6">Create product</h3>
          <p className="text-xs text-gray-500 mb-2">Payload matches partner panel create form. Status defaults to pending until admin approves.</p>
          <CodeBlock text={curlCreate} id="curl-create" />

          <h3 className="font-semibold text-gray-900 text-sm mb-1 mt-6">Create example body</h3>
          <CodeBlock text={createExample} id="create-body" />
        </section>

        <section id="loans" className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">3. Loans API</h2>
          <p className="text-sm text-gray-600 mb-4">
            Base: <code className="bg-gray-100 px-1 rounded">{INTEGRATION_BASE}/loans</code>
            {' '} full CRUD for loan plans you own. <code>createdBy</code> is auto-filled from your API key.
          </p>
          <div className="overflow-x-auto mb-6">
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
                {loanEndpoints.map((ep) => (
                  <tr key={ep.path + ep.method}>
                    <td className="py-2">
                      <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                        ep.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                        ep.method === 'POST' ? 'bg-green-100 text-green-800' :
                        ep.method === 'PUT' ? 'bg-amber-100 text-amber-800' :
                        ep.method === 'PATCH' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>{ep.method}</span>
                    </td>
                    <td className="py-2 font-mono text-xs text-gray-800">{INTEGRATION_BASE}{ep.path}</td>
                    <td className="py-2 text-xs text-gray-600">{ep.scope}</td>
                    <td className="py-2 text-gray-600">{ep.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm mb-1">List loan plans</h3>
          <CodeBlock text={curlListLoans} id="curl-loans-list" />
          <h3 className="font-semibold text-gray-900 text-sm mb-1 mt-6">Create loan plan</h3>
          <CodeBlock text={curlCreateLoan} id="curl-loan-create" />
          <h3 className="font-semibold text-gray-900 text-sm mb-1 mt-6">Create example body</h3>
          <CodeBlock text={createLoanExample} id="create-loan-body" />
        </section>

        <section id="loan-applications" className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">4. Loan applications API</h2>
          <p className="text-sm text-gray-600 mb-4">
            Base: <code className="bg-gray-100 px-1 rounded">{INTEGRATION_BASE}/loan-applications</code>
            {' '} manage customer applications on your loan plans (same leads as partner panel).
          </p>
          <div className="overflow-x-auto mb-4">
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
                {loanApplicationEndpoints.map((ep) => (
                  <tr key={ep.path + ep.method}>
                    <td className="py-2">
                      <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                        ep.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                        ep.method === 'PATCH' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>{ep.method}</span>
                    </td>
                    <td className="py-2 font-mono text-xs text-gray-800">{INTEGRATION_BASE}{ep.path}</td>
                    <td className="py-2 text-xs text-gray-600">{ep.scope}</td>
                    <td className="py-2 text-gray-600">{ep.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm mb-1">How customers apply</h3>
          <p className="text-xs text-gray-500 mb-2">
            Customers use their Madadgaar account JWT on the public API  not your partner API key. After they apply, poll loan-applications.
          </p>
          <CodeBlock text={applyLoanCustomerExample} id="apply-loan-customer" />
        </section>

        <section id="other" className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">5. Profile & dashboard</h2>
          <table className="w-full text-sm mb-4">
            <tbody className="divide-y divide-gray-50">
              {otherEndpoints.map((ep) => (
                <tr key={ep.path}>
                  <td className="py-2 w-16"><span className="font-mono text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{ep.method}</span></td>
                  <td className="py-2 font-mono text-xs">{INTEGRATION_BASE}{ep.path}</td>
                  <td className="py-2 text-xs text-gray-600">{ep.scope}</td>
                  <td className="py-2 text-gray-600">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <CodeBlock text={curlMe} id="curl-me" />
        </section>

        <section id="live-test" className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-red-600" />
            6. Live test (development only)
          </h2>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
            For quick testing only. Do not embed API keys in production frontends.
          </p>
          <input
            type="password"
            value={testKey}
            onChange={(e) => setTestKey(e.target.value)}
            placeholder="Paste mg_live_... key"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono mb-3"
          />
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { id: 'me', label: 'GET /me' },
              { id: 'installments', label: 'GET /installments' },
              { id: 'loans', label: 'GET /loans' },
              { id: 'loan-applications', label: 'GET /loan-applications' },
              { id: 'dashboard', label: 'GET /dashboard' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => runTest(btn.id)}
                disabled={testing === btn.id}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
              >
                {testing === btn.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {btn.label}
              </button>
            ))}
          </div>
          {testOutput && (
            <pre className={`text-xs rounded-xl p-4 overflow-x-auto ${
              testOutput.ok ? 'bg-green-50 text-green-900 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {testOutput.ok ? JSON.stringify(testOutput.data, null, 2) : testOutput.message}
            </pre>
          )}
        </section>
      </div>
    </div>
  );
};

export default ApiKeysDocs;
