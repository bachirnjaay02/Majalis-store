const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
let sessionToken = null;

function getToken() {
  return sessionToken;
}

function setToken(token) {
  sessionToken = token || null;
}

async function request(method, path, body = null) {
  const headers = { 'Accept': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };

  if (body instanceof FormData) {
    options.body = body;
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  options.signal = controller.signal;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, options);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Le serveur est indisponible ou trop lent. Vérifiez VITE_API_URL sur Vercel.');
    }
    throw new Error('Impossible de joindre le serveur. Vérifiez VITE_API_URL sur Vercel.');
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erreur réseau' }));
    throw new Error(err.message || err.errors?.email?.[0] || 'Erreur serveur');
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Auth
  login: (email, password) => request('POST', '/login', { email, password }),
  register: (name, email, password, phone) => request('POST', '/register', { name, email, password, phone }),
  logout: () => request('POST', '/logout'),
  me: () => request('GET', '/me'),

  // Products
  getProducts: () => request('GET', '/products'),
  createProduct: (data) => request('POST', '/products', data),
  updateProduct: (id, data) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return request('POST', `/products/${id}`, data);
    }
    return request('PUT', `/products/${id}`, data);
  },
  deleteProduct: (id) => request('DELETE', `/products/${id}`),

  // Orders
  getOrders: () => request('GET', '/orders'),
  createOrder: (data) => request('POST', '/orders', data),
  updateOrderStatus: (dbId, status) => request('PATCH', `/orders/${dbId}/status`, { status }),

  // Users
  getUsers: () => request('GET', '/users'),

  // Token management
  setToken,
  getToken,
};