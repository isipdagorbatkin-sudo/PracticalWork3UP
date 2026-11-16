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

UPDATE categories SET name = 'Овощи и фрукты' WHERE name = 'Волосы';
UPDATE categories SET name = 'Молочные продукты' WHERE name = 'Ногти';
UPDATE categories SET name = 'Выпечка' WHERE name = 'Лицо';
UPDATE categories SET name = 'Напитки' WHERE name = 'Массаж';

INSERT INTO categories (name) VALUES
  ('Овощи и фрукты'),
  ('Молочные продукты'),
  ('Выпечка'),
  ('Напитки'),
  ('Бакалея')
ON CONFLICT (name) DO NOTHING;

UPDATE services SET name = 'Яблоки фермерские', description = 'Сочные яблоки нового урожая', duration = 30, price = 189, category_id = (SELECT id FROM categories WHERE name = 'Овощи и фрукты'), discount_percent = 15 WHERE name = 'Женская стрижка';
UPDATE services SET name = 'Томаты сливовидные', description = 'Спелые томаты из местной теплицы', duration = 14, price = 249, category_id = (SELECT id FROM categories WHERE name = 'Овощи и фрукты'), discount_percent = 0 WHERE name = 'Мужская стрижка';
UPDATE services SET name = 'Бананы', description = 'Сладкие бананы, цена за килограмм', duration = 10, price = 159, category_id = (SELECT id FROM categories WHERE name = 'Овощи и фрукты'), discount_percent = 0 WHERE name = 'Окрашивание волос';
UPDATE services SET name = 'Молоко 3,2%', description = 'Пастеризованное молоко, 1 литр', duration = 10, price = 99, category_id = (SELECT id FROM categories WHERE name = 'Молочные продукты'), discount_percent = 10 WHERE name = 'Маникюр';
UPDATE services SET name = 'Творог 5%', description = 'Натуральный творог, упаковка 200 г', duration = 7, price = 169, category_id = (SELECT id FROM categories WHERE name = 'Молочные продукты'), discount_percent = 0 WHERE name = 'Маникюр с покрытием';
UPDATE services SET name = 'Хлеб деревенский', description = 'Свежий пшенично-ржаной хлеб', duration = 3, price = 89, category_id = (SELECT id FROM categories WHERE name = 'Выпечка'), discount_percent = 20 WHERE name = 'Педикюр';
UPDATE services SET name = 'Круассан с шоколадом', description = 'Слоёный круассан с шоколадной начинкой', duration = 2, price = 119, category_id = (SELECT id FROM categories WHERE name = 'Выпечка'), discount_percent = 0 WHERE name = 'Чистка лица';
UPDATE services SET name = 'Сок апельсиновый', description = 'Апельсиновый сок без добавления сахара, 1 л', duration = 180, price = 179, category_id = (SELECT id FROM categories WHERE name = 'Напитки'), discount_percent = 0 WHERE name = 'Уход за лицом';
UPDATE services SET name = 'Вода минеральная', description = 'Негазированная минеральная вода, 1,5 л', duration = 365, price = 69, category_id = (SELECT id FROM categories WHERE name = 'Напитки'), discount_percent = 0 WHERE name = 'Массаж спины';
UPDATE services SET name = 'Кофе зерновой', description = 'Кофе средней обжарки, упаковка 250 г', duration = 365, price = 599, category_id = (SELECT id FROM categories WHERE name = 'Бакалея'), discount_percent = 0 WHERE name = 'Общий массаж';

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Яблоки фермерские', 'Сочные яблоки нового урожая', 30, 189, id, 15 FROM categories WHERE name = 'Овощи и фрукты'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Яблоки фермерские');

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Томаты сливовидные', 'Спелые томаты из местной теплицы', 14, 249, id, 0 FROM categories WHERE name = 'Овощи и фрукты'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Томаты сливовидные');

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Бананы', 'Сладкие бананы, цена за килограмм', 10, 159, id, 0 FROM categories WHERE name = 'Овощи и фрукты'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Бананы');

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Молоко 3,2%', 'Пастеризованное молоко, 1 литр', 10, 99, id, 10 FROM categories WHERE name = 'Молочные продукты'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Молоко 3,2%');

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Творог 5%', 'Натуральный творог, упаковка 200 г', 7, 169, id, 0 FROM categories WHERE name = 'Молочные продукты'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Творог 5%');

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Хлеб деревенский', 'Свежий пшенично-ржаной хлеб', 3, 89, id, 20 FROM categories WHERE name = 'Выпечка'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Хлеб деревенский');

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Круассан с шоколадом', 'Слоёный круассан с шоколадной начинкой', 2, 119, id, 0 FROM categories WHERE name = 'Выпечка'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Круассан с шоколадом');

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Сок апельсиновый', 'Апельсиновый сок без добавления сахара, 1 л', 180, 179, id, 0 FROM categories WHERE name = 'Напитки'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Сок апельсиновый');

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Вода минеральная', 'Негазированная минеральная вода, 1,5 л', 365, 69, id, 0 FROM categories WHERE name = 'Напитки'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Вода минеральная');

INSERT INTO services (name, description, duration, price, category_id, discount_percent)
SELECT 'Кофе зерновой', 'Кофе средней обжарки, упаковка 250 г', 365, 599, id, 0 FROM categories WHERE name = 'Бакалея'
AND NOT EXISTS (SELECT 1 FROM services WHERE name = 'Кофе зерновой');

UPDATE coupons SET name = 'Постоянный покупатель' WHERE name = 'Постоянный клиент';

INSERT INTO coupons (name, discount_percent)
SELECT 'Постоянный покупатель', 10
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE name = 'Постоянный покупатель');
