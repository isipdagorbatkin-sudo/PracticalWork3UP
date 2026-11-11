import { useState } from 'react'
import { addCategory, changeDiscount, giveCoupon } from '../api.js'

export default function Admin({ services, reload }) {
  const [category, setCategory] = useState('')
  const [serviceId, setServiceId] = useState(services[0]?.id || '')
  const [discount, setDiscount] = useState(0)
  const [email, setEmail] = useState('')
  const [couponName, setCouponName] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(10)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const run = async (action) => {
    setMessage('')
    setError('')
    try {
      const result = await action()
      setMessage(result.message || 'Данные сохранены')
      await reload()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="admin-page">
      <h1>Панель администратора</h1>
      {message && <div className="success">{message}</div>}
      {error && <div className="form-error">{error}</div>}
      <div className="admin-grid">
        <form onSubmit={(event) => { event.preventDefault(); run(() => addCategory(category)); setCategory('') }}>
          <h2>Новая категория</h2>
          <label>Название<input value={category} onChange={(event) => setCategory(event.target.value)} /></label>
          <button className="primary">Добавить</button>
        </form>
        <form onSubmit={(event) => { event.preventDefault(); run(() => changeDiscount(serviceId, discount)) }}>
          <h2>Скидка на услугу</h2>
          <label>Услуга<select value={serviceId} onChange={(event) => setServiceId(event.target.value)}>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label>
          <label>Скидка, %<input type="number" min="0" max="100" value={discount} onChange={(event) => setDiscount(event.target.value)} /></label>
          <button className="primary">Сохранить</button>
        </form>
        <form onSubmit={(event) => { event.preventDefault(); run(() => giveCoupon({ email, name: couponName, discount: Number(couponDiscount) })) }}>
          <h2>Персональный купон</h2>
          <label>Email пользователя<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Название купона<input value={couponName} onChange={(event) => setCouponName(event.target.value)} /></label>
          <label>Скидка, %<input type="number" min="1" max="100" value={couponDiscount} onChange={(event) => setCouponDiscount(event.target.value)} /></label>
          <button className="primary">Выдать купон</button>
        </form>
      </div>
    </section>
  )
}
