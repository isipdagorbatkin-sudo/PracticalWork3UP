import { useState } from 'react'
import { createOrder } from '../api.js'

export default function Cart({ cart, setCart, user, coupons, clearCart, setPage }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const subtotal = cart.reduce((sum, item) => sum + Number(item.final_price) * item.quantity, 0)
  const coupon = coupons.reduce((best, item) => item.discount_percent > best.discount_percent ? item : best, { discount_percent: 0 })
  const total = subtotal * (100 - coupon.discount_percent) / 100

  const changeQuantity = (id, value) => {
    setCart(cart.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + value) } : item))
  }

  const remove = (id) => setCart(cart.filter((item) => item.id !== id))

  const order = async () => {
    setError('')
    setMessage('')
    if (!user) {
      setError('Сначала войдите в аккаунт')
      return
    }
    if (!date || !time) {
      setError('Выберите дату и время')
      return
    }
    try {
      setSending(true)
      await createOrder({ items: cart, date, time, total: total.toFixed(2) })
      clearCart()
      setMessage('Запись успешно создана')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (!cart.length && !message) {
    return (
      <div className="empty">
        <h1>Корзина пустая</h1>
        <p>Добавьте услуги из каталога</p>
        <button className="primary" onClick={() => setPage('catalog')}>Перейти в каталог</button>
      </div>
    )
  }

  return (
    <section className="cart-page">
      <h1>Корзина</h1>
      {message && <div className="success">{message}</div>}
      {cart.map((item) => (
        <div className="cart-item" key={item.id}>
          <div>
            <h3>{item.name}</h3>
            <span>{Number(item.final_price).toLocaleString()} ₽</span>
          </div>
          <div className="quantity">
            <button onClick={() => changeQuantity(item.id, -1)}>−</button>
            <b>{item.quantity}</b>
            <button onClick={() => changeQuantity(item.id, 1)}>+</button>
          </div>
          <strong>{(Number(item.final_price) * item.quantity).toLocaleString()} ₽</strong>
          <button className="remove" onClick={() => remove(item.id)}>Удалить</button>
        </div>
      ))}
      {!!cart.length && (
        <div className="order-box">
          <h2>Оформление записи</h2>
          <div className="form-row">
            <label>Дата<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
            <label>Время<input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label>
          </div>
          {coupon.discount_percent > 0 && <p className="coupon">Персональная скидка: {coupon.discount_percent}%</p>}
          <div className="total"><span>Итого</span><strong>{total.toLocaleString()} ₽</strong></div>
          {error && <div className="form-error">{error}</div>}
          <button className="primary wide" disabled={sending} onClick={order}>{sending ? 'Оформляем...' : 'Оформить запись'}</button>
        </div>
      )}
    </section>
  )
}
