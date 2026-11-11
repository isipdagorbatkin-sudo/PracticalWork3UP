CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role_id INTEGER REFERENCES roles(id) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  category_id INTEGER REFERENCES categories(id) NOT NULL,
  discount_percent INTEGER DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent BETWEEN 1 AND 100)
);

CREATE TABLE IF NOT EXISTS user_coupons (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  coupon_id INTEGER REFERENCES coupons(id) ON DELETE CASCADE,
  UNIQUE(user_id, coupon_id)
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  service_id INTEGER REFERENCES services(id) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR(30) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name) VALUES ('admin'), ('user') ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name) VALUES
  ('Волосы'),
  ('Ногти'),
  ('Лицо'),
  ('Массаж')
ON CONFLICT (name) DO NOTHING;

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Женская стрижка', 'Стрижка и простая укладка', 60, 1800, id, 20 FROM categories WHERE name = 'Волосы'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Женская стрижка');

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Мужская стрижка', 'Классическая мужская стрижка', 40, 1000, id, 0 FROM categories WHERE name = 'Волосы'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Мужская стрижка');

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Окрашивание волос', 'Окрашивание в один тон', 120, 3500, id, 0 FROM categories WHERE name = 'Волосы'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Окрашивание волос');

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Маникюр', 'Классический маникюр без покрытия', 50, 1200, id, 15 FROM categories WHERE name = 'Ногти'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Маникюр');

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Маникюр с покрытием', 'Маникюр и покрытие гель-лаком', 90, 1900, id, 0 FROM categories WHERE name = 'Ногти'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Маникюр с покрытием');

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Педикюр', 'Обработка стоп и ногтей', 80, 2200, id, 0 FROM categories WHERE name = 'Ногти'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Педикюр');

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Чистка лица', 'Базовая комбинированная чистка', 75, 2500, id, 10 FROM categories WHERE name = 'Лицо'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Чистка лица');

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Уход за лицом', 'Очищение, маска и увлажнение', 60, 2100, id, 0 FROM categories WHERE name = 'Лицо'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Уход за лицом');

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Массаж спины', 'Расслабляющий массаж спины', 40, 1600, id, 0 FROM categories WHERE name = 'Массаж'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Массаж спины');

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Общий массаж', 'Массаж всего тела', 90, 3200, id, 0 FROM categories WHERE name = 'Массаж'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Общий массаж');

INSERT INTO coupons (name, discount_percent)
SELECT 'Постоянный клиент', 10
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE name = 'Постоянный клиент');
