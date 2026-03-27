export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  if (!BASE_URL) {
    console.error("API BASE_URL not found");
    throw new Error("API BASE_URL not found");
  }

  const url = `${BASE_URL}${endpoint}`;

  // 1. Token kiolvasása a localStorage-ból
  const token = localStorage.getItem('kozitabor_token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // 2. Ha van token, csatoljuk Bearer-ként
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Ha a token lejárt vagy érvénytelen, töröljük és irány a login
    localStorage.removeItem('kozitabor_token');
    throw new Error('Session expired');
  }

  if (!response.ok) { 
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Hiba történt a kérés során');
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  
  return null;
};

export const adminApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  return apiRequest(`/admin${endpoint}`, options);
};

export const coreApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  return apiRequest(endpoint, options);
};

export const authApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  return apiRequest(`/auth${endpoint}`, options);
};