import { PredictionResponse, ModelMetricsResponse, FeatureMeta } from '../types';

// Direct backend URL — browser calls FastAPI directly (bypasses Vite proxy)
const API_BASE = 'http://localhost:8000/api/v1';

function formatApiError(errData: any, defaultText: string): string {
  if (!errData || !errData.detail) return defaultText;
  if (typeof errData.detail === 'string') return errData.detail;
  if (Array.isArray(errData.detail)) {
    return errData.detail.map((e: any) => {
      const loc = e.loc ? e.loc.filter((l: any) => l !== 'body').join('.') : '';
      return `${loc ? loc + ': ' : ''}${e.msg || JSON.stringify(e)}`;
    }).join(' | ');
  }
  if (typeof errData.detail === 'object') {
    return JSON.stringify(errData.detail);
  }
  return String(errData.detail);
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(formatApiError(err, `Health check failed: ${res.statusText}`));
  }
  return res.json();
}

export async function fetchModelInfo() {
  const res = await fetch(`${API_BASE}/model-info`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(formatApiError(err, `Model info fetch failed: ${res.statusText}`));
  }
  return res.json();
}

export async function fetchFeatures(): Promise<{ total_features: number; features: FeatureMeta[] }> {
  const res = await fetch(`${API_BASE}/features`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(formatApiError(err, `Features fetch failed: ${res.statusText}`));
  }
  return res.json();
}

export async function fetchMetrics(): Promise<ModelMetricsResponse> {
  const res = await fetch(`${API_BASE}/metrics`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(formatApiError(err, `Metrics fetch failed: ${res.statusText}`));
  }
  return res.json();
}

export async function postPredict(payload: Record<string, any>): Promise<PredictionResponse> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(formatApiError(errData, `Prediction request failed: ${res.statusText}`));
  }
  return res.json();
}

export async function postChat(message: string): Promise<{ answer: string; sources: string[]; disclaimer: string }> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(formatApiError(err, `Chat assistant request failed: ${res.statusText}`));
  }
  return res.json();
}
