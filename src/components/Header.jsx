export default function Header({ page, setPage, cartCount, user, logout }) {
  return (
    <header className="header">
      <button className="logo" onClick={() => setPage('catalog')}>Beauty Studio</button>
      <nav>
        <button className={page === 'catalog' ? 'active' : ''} onClick={() => setPage('catalog')}>Услуги</button>
        <button className={page === 'cart' ? 'active' : ''} onClick={() => setPage('cart')}>Корзина ({cartCount})</button>
        {user?.role === 'admin' && <button className={page === 'admin' ? 'active' : ''} onClick={() => setPage('admin')}>Админ</button>}
        {user ? <button onClick={logout}>Выйти</button> : <button className={page === 'login' ? 'active' : ''} onClick={() => setPage('login')}>Войти</button>}
      </nav>
    </header>
  )
}
