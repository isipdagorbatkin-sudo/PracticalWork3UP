export default function Catalog({ services, categories, selected, setSelected, addToCart, loading, error }) {
  const filtered = selected.length
    ? services.filter((service) => selected.includes(service.category_id))
    : services

  const toggleCategory = (id) => {
    setSelected(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id])
  }

  if (loading) return <div className="message">Загрузка услуг...</div>
  if (error) return <div className="message error">{error}</div>

  return (
    <div className="catalog-layout">
      <aside className="filters">
        <h3>Категории</h3>
        {categories.map((category) => (
          <label key={category.id}>
            <input type="checkbox" checked={selected.includes(category.id)} onChange={() => toggleCategory(category.id)} />
            {category.name}
          </label>
        ))}
      </aside>
      <section>
        <div className="page-title">
          <div>
            <h1>Каталог услуг</h1>
            <p>Выберите подходящую процедуру</p>
          </div>
          <span>{filtered.length} услуг</span>
        </div>
        <div className="service-grid">
          {filtered.map((service) => (
            <article className="service-card" key={service.id}>
              <div className="card-top">
                <span className="category">{service.category}</span>
                {service.discount_percent > 0 && <span className="discount">−{service.discount_percent}%</span>}
              </div>
              <h2>{service.name}</h2>
              <p>{service.description}</p>
              <div className="duration">Время: {service.duration} мин.</div>
              <div className="card-bottom">
                <div className="price">
                  {service.discount_percent > 0 && <del>{Number(service.price).toLocaleString()} ₽</del>}
                  <strong>{Number(service.final_price).toLocaleString()} ₽</strong>
                </div>
                <button className="primary" onClick={() => addToCart(service)}>В корзину</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
