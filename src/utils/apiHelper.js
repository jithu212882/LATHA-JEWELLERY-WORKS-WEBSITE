/**
 * Helper to safely handle fetch responses across serverless and static environments.
 * Prevents "Unexpected token 'T' ... is not valid JSON" syntax errors when server returns HTML error pages.
 */
export async function parseJsonResponse(res) {
  if (!res) return { ok: false, data: null, error: 'No response received' };

  const contentType = res.headers?.get?.('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (isJson) {
    try {
      const data = await res.json();
      return { ok: res.ok, data, error: !res.ok ? (data?.error || 'Request failed') : null };
    } catch (e) {
      return { ok: res.ok, data: null, error: null };
    }
  }

  // Response was not JSON (e.g. HTML 404/500 fallback)
  return {
    ok: false,
    data: null,
    error: res.ok ? null : `Server error (${res.status})`
  };
}
