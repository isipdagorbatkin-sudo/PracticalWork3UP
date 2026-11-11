import { useState } from 'react'
import { login } from '../api.js'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Заполните все поля')
      return
    }
    if (!email.includes('@')) {
      setError('Введите правильный email')
      return
    }
    try {
      setLoading(true)
      const data = await login({ email, password })
      onLogin(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={submit}>
        <h1>Вход</h1>
        <p>Войдите в личный кабинет</p>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="user@mail.ru" /></label>
        <label>Пароль<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Введите пароль" /></label>
        {error && <div className="form-error">{error}</div>}
        <button className="primary wide" disabled={loading}>{loading ? 'Вход...' : 'Войти'}</button>
        <div className="test-users">
          <b>Тестовые аккаунты</b>
          <span>user@mail.ru / 123123</span>
          <span>admin@mail.ru / admin123</span>
        </div>
      </form>
    </div>
  )
}
