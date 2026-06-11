import baseApi from '../constants/apiUrl';
import { getAuthHeaders } from './auth';

const KEYS_BASE = `${baseApi}/v1/partner/keys`;
const INTEGRATION_BASE = `${baseApi}/v1/partner`;

export const SCOPE_OPTIONS = [
  { id: 'installments:read', label: 'Installments  read', description: 'List and view your installment products' },
  { id: 'installments:write', label: 'Installments  write', description: 'Create, update, and delete products' },
  { id: 'applications:read', label: 'Applications  read', description: 'View incoming customer requests' },
  { id: 'applications:write', label: 'Applications  write', description: 'Approve, reject, or update request status' },
  { id: 'dashboard:read', label: 'Dashboard  read', description: 'Fetch dashboard statistics' },
  { id: 'profile:read', label: 'Profile  read', description: 'Verify API key and read partner profile' },
];

export const REQUIRED_SCOPES = ['profile:read'];

export const DEFAULT_SCOPES = SCOPE_OPTIONS.map((s) => s.id);

export function withRequiredScopes(scopes) {
  return [...new Set([...(scopes || []), ...REQUIRED_SCOPES])];
}

async function parseResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export async function listPartnerApiKeys() {
  const res = await fetch(KEYS_BASE, {
    headers: getAuthHeaders(),
  });
  return parseResponse(res);
}

export async function createPartnerApiKey({ name, scopes, expiresAt }) {
  const body = { name, scopes };
  if (expiresAt) body.expiresAt = expiresAt;

  const res = await fetch(KEYS_BASE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return parseResponse(res);
}

export async function revokePartnerApiKey(keyId) {
  const res = await fetch(`${KEYS_BASE}/${encodeURIComponent(keyId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return parseResponse(res);
}

export async function testPartnerApiKey(apiKey) {
  const res = await fetch(`${INTEGRATION_BASE}/me`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });
  return parseResponse(res);
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export function getIntegrationBaseUrl() {
  return INTEGRATION_BASE;
}

function apiKeyHeaders(apiKey) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
}

export async function integrationGet(apiKey, path) {
  const res = await fetch(`${INTEGRATION_BASE}${path}`, {
    headers: apiKeyHeaders(apiKey),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export async function integrationPost(apiKey, path, body) {
  const res = await fetch(`${INTEGRATION_BASE}${path}`, {
    method: 'POST',
    headers: apiKeyHeaders(apiKey),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}
