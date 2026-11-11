import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Catalog from './components/Catalog.jsx'
import Cart from './components/Cart.jsx'
import Login from './components/Login.jsx'
import Admin from './components/Admin.jsx'
import { getCategories, getCoupons, getServices } from './api.js'

export default function App() {
  const [page, setPage] = useState('catalog')
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [selected, setSelected] = useState([])
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'))
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      setError('')
      const [serviceData, categoryData] = await Promise.all([getServices(), getCategories()])
      setServices(serviceData)
      setCategories(categoryData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => {
    if (user) getCoupons().then(setCoupons).catch(() => setCoupons([]))
    else setCoupons([])
  }, [user])

  const addToCart = (service) => {
    const found = cart.find((item) => item.id === service.id)
    setCart(found
      ? cart.map((item) => item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...service, quantity: 1 }])
  }

  const onLogin = (data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    setPage(data.user.role === 'admin' ? 'admin' : 'catalog')
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setPage('catalog')
  }

  return (
    <>
      <Header page={page} setPage={setPage} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} user={user} logout={logout} />
      <main>
        {user && <div className="hello">Здравствуйте, {user.name}</div>}
        {page === 'catalog' && <Catalog services={services} categories={categories} selected={selected} setSelected={setSelected} addToCart={addToCart} loading={loading} error={error} />}
        {page === 'cart' && <Cart cart={cart} setCart={setCart} user={user} coupons={coupons} clearCart={() => setCart([])} setPage={setPage} />}
        {page === 'login' && <Login onLogin={onLogin} />}
        {page === 'admin' && user?.role === 'admin' && <Admin services={services} reload={loadData} />}
      </main>
      <footer>Beauty Studio · Учебный проект</footer>
    </>
  )
}
