const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const userHeaders: Record<string, string> = {};
  if (typeof window !== "undefined") {
    try {
      const savedUserStr = localStorage.getItem("anywherebnb_current_user");
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed?.id) {
          userHeaders["X-User-Id"] = String(parsed.id);
        }
      }
    } catch {
      // ignore json parse error
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...userHeaders,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'An unexpected error occurred' }));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}
