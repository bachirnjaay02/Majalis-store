import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import multer from "multer";
import pg from "pg";
import dotenv from "dotenv";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(rootDir, ".env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL est obligatoire. Ajoutez la chaîne de connexion Neon dans .env.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const sessions = new Map();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, file.mimetype.startsWith("image/")),
});

async function query(text, values = []) {
  return pool.query(text, values);
}

async function initDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL CHECK (price >= 0),
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      sku TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      image_data BYTEA,
      image_mime TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE products ADD COLUMN IF NOT EXISTS image_data BYTEA;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS image_mime TEXT NOT NULL DEFAULT '';
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      phone TEXT NOT NULL,
      payment TEXT NOT NULL,
      total INTEGER NOT NULL CHECK (total >= 0),
      status TEXT NOT NULL DEFAULT 'en attente' CHECK (status IN ('en attente', 'en cours', 'livré', 'annulé')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      name TEXT NOT NULL,
      price INTEGER NOT NULL CHECK (price >= 0),
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      image TEXT NOT NULL DEFAULT ''
    );
  `);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, expected] = stored.split(":");
  const actual = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, joined: user.created_at };
}

function publicProduct(product, req) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    sku: product.sku,
    image: product.image_data ? `${req.protocol}://${req.get("host")}/api/products/${product.id}/image` : product.image,
  };
}

async function publicOrder(order) {
  const { rows } = await query("SELECT product_id AS \"productId\", name, price, quantity AS qty, image FROM order_items WHERE order_id = $1", [order.dbId]);
  return { dbId: order.dbId, id: `CMD-${String(order.dbId).padStart(4, "0")}`, date: order.created_at, client: order.client, clientId: order.user_id, phone: order.phone, payment: order.payment, total: order.total, status: order.status, items: rows };
}

async function findUserByToken(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const userId = token && sessions.get(token);
  if (!userId) return null;
  const { rows } = await query("SELECT * FROM users WHERE id = $1", [userId]);
  return rows[0] || null;
}

async function requireAuth(req, res, next) {
  try {
    const user = await findUserByToken(req);
    if (!user) return res.status(401).json({ message: "Session invalide ou expirée" });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Accès réservé à l'administrateur" });
  next();
}

function issueSession(user) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, user.id);
  return token;
}

function validateProduct(body) {
  const price = Number(body.price);
  const stock = Number(body.stock);
  if (!body.name?.trim() || !Number.isInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0) return "Nom, prix entier positif et stock entier positif sont requis";
  return null;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.post("/api/register", async (req, res, next) => {
  const { name, email, password, phone = "" } = req.body;
  if (!name?.trim() || !email?.trim() || !password || password.length < 6) return res.status(422).json({ message: "Nom, email et mot de passe de 6 caractères minimum requis" });
  try {
    const { rows } = await query("INSERT INTO users (name, email, password_hash, phone) VALUES ($1, $2, $3, $4) RETURNING *", [name.trim(), email.trim().toLowerCase(), hashPassword(password), phone.trim()]);
    res.status(201).json({ token: issueSession(rows[0]), user: publicUser(rows[0]) });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ message: "Cet email est déjà utilisé" });
    next(error);
  }
});

app.post("/api/login", async (req, res, next) => {
  try {
    const { rows } = await query("SELECT * FROM users WHERE email = $1", [req.body.email?.trim().toLowerCase()]);
    const user = rows[0];
    if (!user || !req.body.password || !verifyPassword(req.body.password, user.password_hash)) return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    res.json({ token: issueSession(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/logout", requireAuth, (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  sessions.delete(token);
  res.json({ message: "Déconnexion réussie" });
});

app.get("/api/me", requireAuth, (req, res) => res.json(publicUser(req.user)));

app.get("/api/products", async (_req, res, next) => {
  try {
    const { rows } = await query("SELECT id, name, category, price, stock, sku, image, image_data FROM products ORDER BY id DESC");
    res.json(rows.map((product) => publicProduct(product, _req)));
  } catch (error) {
    next(error);
  }
});

app.get("/api/products/:id/image", async (req, res, next) => {
  try {
    const { rows } = await query("SELECT image_data, image_mime FROM products WHERE id = $1", [req.params.id]);
    if (!rows[0]?.image_data) return res.status(404).end();
    res.type(rows[0].image_mime || "application/octet-stream").send(rows[0].image_data);
  } catch (error) {
    next(error);
  }
});

app.post("/api/products", requireAuth, requireAdmin, upload.single("image"), async (req, res, next) => {
  const error = validateProduct(req.body);
  if (error) return res.status(422).json({ message: error });
  try {
    const image = req.file ? "" : (req.body.image || "");
    const { rows } = await query("INSERT INTO products (name, category, price, stock, sku, image, image_data, image_mime) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, category, price, stock, sku, image, image_data", [req.body.name.trim(), req.body.category?.trim() || "", Number(req.body.price), Number(req.body.stock), req.body.sku?.trim() || "", image, req.file?.buffer || null, req.file?.mimetype || ""]);
    res.status(201).json(publicProduct(rows[0], req));
  } catch (error) {
    next(error);
  }
});

async function updateProduct(req, res, next) {
  const error = validateProduct(req.body);
  if (error) return res.status(422).json({ message: error });
  try {
    const existing = await query("SELECT * FROM products WHERE id = $1", [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ message: "Produit introuvable" });
    const product = existing.rows[0];
    const image = req.file ? "" : (req.body.image ?? product.image);
    const imageData = req.file ? req.file.buffer : product.image_data;
    const imageMime = req.file ? req.file.mimetype : product.image_mime;
    const { rows } = await query("UPDATE products SET name = $1, category = $2, price = $3, stock = $4, sku = $5, image = $6, image_data = $7, image_mime = $8 WHERE id = $9 RETURNING id, name, category, price, stock, sku, image, image_data", [req.body.name.trim(), req.body.category?.trim() || "", Number(req.body.price), Number(req.body.stock), req.body.sku?.trim() || "", image, imageData, imageMime, req.params.id]);
    res.json(publicProduct(rows[0], req));
  } catch (error) {
    next(error);
  }
}

app.put("/api/products/:id", requireAuth, requireAdmin, updateProduct);
app.post("/api/products/:id", requireAuth, requireAdmin, upload.single("image"), updateProduct);

app.delete("/api/products/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const result = await query("DELETE FROM products WHERE id = $1", [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ message: "Produit introuvable" });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/orders", requireAuth, async (req, res, next) => {
  try {
    const sql = req.user.role === "admin" ? "SELECT orders.id AS \"dbId\", orders.*, users.name AS client FROM orders JOIN users ON users.id = orders.user_id ORDER BY orders.id DESC" : "SELECT orders.id AS \"dbId\", orders.*, users.name AS client FROM orders JOIN users ON users.id = orders.user_id WHERE user_id = $1 ORDER BY orders.id DESC";
    const { rows } = await query(sql, req.user.role === "admin" ? [] : [req.user.id]);
    res.json(await Promise.all(rows.map(publicOrder)));
  } catch (error) {
    next(error);
  }
});

app.post("/api/orders", requireAuth, async (req, res) => {
  const { items, payment, phone } = req.body;
  if (!Array.isArray(items) || !items.length || !payment || !phone?.trim()) return res.status(422).json({ message: "Articles, paiement et téléphone sont requis" });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let total = 0;
    const normalized = [];
    for (const item of items) {
      const result = await client.query("SELECT * FROM products WHERE id = $1 FOR UPDATE", [item.productId]);
      const product = result.rows[0];
      const qty = Number(item.qty);
      if (!product || !Number.isInteger(qty) || qty < 1 || product.stock < qty) throw new Error(`Stock insuffisant pour ${item.name || "un produit"}`);
      total += product.price * qty;
      normalized.push({ product, qty });
    }
    const order = await client.query("INSERT INTO orders (user_id, phone, payment, total) VALUES ($1, $2, $3, $4) RETURNING id", [req.user.id, phone.trim(), payment, total]);
    for (const { product, qty } of normalized) {
      await client.query("INSERT INTO order_items (order_id, product_id, name, price, quantity, image) VALUES ($1, $2, $3, $4, $5, $6)", [order.rows[0].id, product.id, product.name, product.price, qty, product.image]);
      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [qty, product.id]);
    }
    await client.query("COMMIT");
    const result = await query("SELECT orders.id AS \"dbId\", orders.*, users.name AS client FROM orders JOIN users ON users.id = orders.user_id WHERE orders.id = $1", [order.rows[0].id]);
    res.status(201).json(await publicOrder(result.rows[0]));
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(409).json({ message: error.message });
  } finally {
    client.release();
  }
});

app.patch("/api/orders/:id/status", requireAuth, requireAdmin, async (req, res, next) => {
  const allowed = ["en attente", "en cours", "livré", "annulé"];
  if (!allowed.includes(req.body.status)) return res.status(422).json({ message: "Statut invalide" });
  try {
    const result = await query("UPDATE orders SET status = $1 WHERE id = $2", [req.body.status, req.params.id]);
    if (!result.rowCount) return res.status(404).json({ message: "Commande introuvable" });
    res.json({ status: req.body.status });
  } catch (error) {
    next(error);
  }
});

app.get("/api/users", requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const { rows } = await query("SELECT id, name, email, phone, role, created_at AS joined FROM users ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Erreur serveur" });
});

async function start() {
  await initDatabase();
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const result = await query("INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin') ON CONFLICT (email) DO NOTHING RETURNING id", ["Administrateur", adminEmail.toLowerCase(), hashPassword(adminPassword)]);
    if (result.rowCount) console.log(`Compte administrateur créé : ${adminEmail}`);
  }
  const port = Number(process.env.PORT || 8001);
  app.listen(port, () => console.log(`API Majalis Store connectée à Neon sur http://localhost:${port}/api`));
}

start().catch((error) => {
  console.error("Impossible de démarrer l'API :", error.message);
  process.exit(1);
});
