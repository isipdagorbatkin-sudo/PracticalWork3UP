import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = process.env.PORT || 3001
const pool = new pg.Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: Number(process.env.PG_PORT)
})

app.use(cors())
app.use(express.json())

async function initDatabase() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(sql)
  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('123123', 10)
  await pool.query(
    `INSERT INTO users (name, email, password, role_id)
     SELECT $1, $2, $3, id FROM roles WHERE name = 'admin'
     ON CONFLICT (email) DO NOTHING`,
    ['Администратор', 'admin@mail.ru', adminPassword]
  )
  const userResult = await pool.query(
    `INSERT INTO users (name, email, password, role_id)
     SELECT $1, $2, $3, id FROM roles WHERE name = 'user'
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    ['Обычный пользователь', 'user@mail.ru', userPassword]
  )
  const userId = userResult.rows[0].id
  await pool.query(
    `INSERT INTO user_coupons (user_id, coupon_id)
     SELECT $1, id FROM coupons WHERE name = 'Постоянный клиент'
     ON CONFLICT (user_id, coupon_id) DO NOTHING`,
    [userId]
  )
}

function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Нужно войти в аккаунт' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Сессия закончилась' })
  }
}

function admin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Нет доступа' })
  next()
}

app.get('/', (req, res) => {
  res.json({
    message: 'API Beauty Studio работает',
    endpoints: ['/api/test', '/api/services', '/api/categories']
  })
})

app.get('/api/test', (req, res) => {
  res.json({ message: 'API работает' })
})

app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name')
    res.json(result.rows)
  } catch {
    res.status(500).json({ error: 'Не удалось загрузить категории' })
  }
})

app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, c.name AS category,
       ROUND(s.price * (100 - s.discount_percent) / 100, 2) AS final_price
       FROM services s
       JOIN categories c ON c.id = s.category_id
       ORDER BY s.id`
    )
    res.json(result.rows)
  } catch {
    res.status(500).json({ error: 'Не удалось загрузить услуги' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Заполните email и пароль' })
  try {
    const result = await pool.query(
      `SELECT u.*, r.name AS role FROM users u
       JOIN roles r ON r.id = u.role_id WHERE u.email = $1`,
      [email]
    )
    const user = result.rows[0]
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Неверный email или пароль' })
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch {
    res.status(500).json({ error: 'Ошибка авторизации' })
  }
})

app.get('/api/profile/coupons', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.name, c.discount_percent FROM user_coupons uc
       JOIN coupons c ON c.id = uc.coupon_id WHERE uc.user_id = $1`,
      [req.user.id]
    )
    res.json(result.rows)
  } catch {
    res.status(500).json({ error: 'Не удалось загрузить скидки' })
  }
})

app.post('/api/orders', auth, async (req, res) => {
  const { items, date, time, total } = req.body
  if (!items?.length || !date || !time) return res.status(400).json({ error: 'Заполните данные записи' })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const item of items) {
      for (let i = 0; i < item.quantity; i += 1) {
        await client.query(
          `INSERT INTO appointments (user_id, service_id, appointment_date, appointment_time)
           VALUES ($1, $2, $3, $4)`,
          [req.user.id, item.id, date, time]
        )
      }
    }
    await client.query(
      'INSERT INTO payments (user_id, amount) VALUES ($1, $2)',
      [req.user.id, total]
    )
    await client.query('COMMIT')
    res.status(201).json({ message: 'Запись создана' })
  } catch {
    await client.query('ROLLBACK')
    res.status(500).json({ error: 'Не удалось оформить запись' })
  } finally {
    client.release()
  }
})

app.post('/api/admin/categories', auth, admin, async (req, res) => {
  if (!req.body.name?.trim()) return res.status(400).json({ error: 'Введите название категории' })
  try {
    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [req.body.name.trim()]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(400).json({ error: error.code === '23505' ? 'Такая категория уже есть' : 'Ошибка добавления' })
  }
})

app.patch('/api/admin/services/:id/discount', auth, admin, async (req, res) => {
  const discount = Number(req.body.discount)
  if (discount < 0 || discount > 100) return res.status(400).json({ error: 'Скидка должна быть от 0 до 100' })
  try {
    const result = await pool.query(
      'UPDATE services SET discount_percent = $1 WHERE id = $2 RETURNING *',
      [discount, req.params.id]
    )
    res.json(result.rows[0])
  } catch {
    res.status(500).json({ error: 'Не удалось изменить скидку' })
  }
})

app.post('/api/admin/coupons', auth, admin, async (req, res) => {
  const { email, name, discount } = req.body
  if (!email || !name || discount < 1 || discount > 100) {
    return res.status(400).json({ error: 'Проверьте данные купона' })
  }
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const user = await client.query('SELECT id FROM users WHERE email = $1', [email])
    if (!user.rows[0]) throw new Error('USER_NOT_FOUND')
    const coupon = await client.query(
      'INSERT INTO coupons (name, discount_percent) VALUES ($1, $2) RETURNING id',
      [name, discount]
    )
    await client.query(
      'INSERT INTO user_coupons (user_id, coupon_id) VALUES ($1, $2)',
      [user.rows[0].id, coupon.rows[0].id]
    )
    await client.query('COMMIT')
    res.status(201).json({ message: 'Купон выдан' })
  } catch (error) {
    await client.query('ROLLBACK')
    res.status(400).json({ error: error.message === 'USER_NOT_FOUND' ? 'Пользователь не найден' : 'Не удалось выдать купон' })
  } finally {
    client.release()
  }
})

initDatabase()
  .then(() => {
    app.listen(port, () => console.log(`API запущен: http://localhost:${port}`))
  })
  .catch((error) => {
    console.error('Ошибка подключения к PostgreSQL:', error.message)
    process.exit(1)
  })
