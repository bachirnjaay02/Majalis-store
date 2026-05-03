const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

function getToken() {
  return localStorage.getItem('majalis_token');
}

function setToken(token) {
  if (token) localStorage.setItem('majalis_token', token);
  else localStorage.removeItem('majalis_token');
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

  const res = await fetch(`${API_BASE}${path}`, options);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erreur réseau' }));
    throw new Error(err.message || err.errors?.email?.[0] || 'Erreur serveur');
  }

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