// client/src/api/http.js

// Use the Render variable if available, otherwise fall back to your local server
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export async function request(path, options = {}) {
  const token = localStorage.getItem('student_nexus_token');
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  
  const headers = { ...authHeader, ...(options.headers || {}) };
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Debugging line: remove this after you confirm it works
  console.log(`Sending request to: ${baseUrl}${path}`);

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (options.responseType === 'blob') {
      if (!res.ok) throw new Error('File download failed');
      return res.blob();
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = isJson ? data?.message || 'Request failed' : 'Request failed';
    // Include the URL in the error for debugging
    // Use the Render URL if available, otherwise fall back to local server
    throw new Error(`${message} (URL: ${res.url || 'http://localhost:5001/api'})`);
  }
  return data;
}
