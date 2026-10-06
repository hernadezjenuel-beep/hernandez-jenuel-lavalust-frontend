const BASE = import.meta.env.VITE_API_URL

async function request(path, method = 'GET', body) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) localStorage.removeItem('token')
    throw new Error(data.message || 'Request failed')
  }
  return data
}

export const api = {
  login: (email, password) => request('/api/login', 'POST', { email, password }),
  list: () => request('/api/products'),
  create: (p) => request('/api/products', 'POST', p),
  update: (id, p) => request(`/api/products/${id}`, 'PUT', p),
  remove: (id) => request(`/api/products/${id}`, 'DELETE'),
}
