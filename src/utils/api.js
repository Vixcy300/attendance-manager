/**
 * Centralized API configuration for backend communication.
 * Uses VITE_API_URL env variable in production (Render), falls back to localhost for dev.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Makes a fetch request to the backend API with timeout and error handling.
 * @param {string} endpoint - API endpoint path (e.g., '/api/sync')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @param {number} timeoutMs - Request timeout in milliseconds (default: 30s)
 * @returns {Promise<Response>}
 */
export async function apiFetch(endpoint, options = {}, timeoutMs = 30000) {
  const url = `${API_BASE}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The backend server may be starting up — please try again in 30 seconds.');
    }
    // Network error (backend unreachable)
    throw new Error('Cannot connect to the sync server. Please check if the backend is online.');
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Checks if the backend server is reachable.
 * @returns {Promise<{online: boolean, latency: number|null}>}
 */
export async function checkBackendHealth() {
  const start = Date.now();
  try {
    const response = await apiFetch('/api/health', {}, 8000);
    if (response.ok) {
      return { online: true, latency: Date.now() - start };
    }
    return { online: false, latency: null };
  } catch {
    return { online: false, latency: null };
  }
}

export { API_BASE };
