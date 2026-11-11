const request = async (url, options = {}) => {
  const token = localStorage.getItem('token')
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Ошибка запроса')
  return data
}

export const getServices = () => request('/api/services')
export const getCategories = () => request('/api/categories')
export const login = (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) })
export const getCoupons = () => request('/api/profile/coupons')
export const createOrder = (data) => request('/api/orders', { method: 'POST', body: JSON.stringify(data) })
export const addCategory = (name) => request('/api/admin/categories', { method: 'POST', body: JSON.stringify({ name }) })
export const changeDiscount = (id, discount) => request(`/api/admin/services/${id}/discount`, { method: 'PATCH', body: JSON.stringify({ discount }) })
export const giveCoupon = (data) => request('/api/admin/coupons', { method: 'POST', body: JSON.stringify(data) })
