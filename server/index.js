import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import admin from 'firebase-admin'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import nodemailer from 'nodemailer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename) 
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// إعداد الـ CORS ليتوافق مع الدومين والـ localhost بجميع الصيغ
app.use(cors({ 
  origin: [
    "https://armanist.com", 
    "https://www.armanist.com", 
    "http://localhost:5173", 
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
  ],
  credentials: true
}))

let adminInitialized = false
const allowDev = (process.env.ALLOW_DEV_UNAUTH || 'false').toLowerCase() === 'true'
const adminUser = process.env.ADMIN_USERNAME || 'admin'
const adminPass = process.env.ADMIN_PASSWORD || '1'
let adminClients = []; // 👈 أضف هذا السطر هنا لتخزين اتصالات الأدمن
const cloudinaryName = process.env.CLOUDINARY_CLOUD_NAME || ''
const cloudinaryPreset = process.env.CLOUDINARY_UPLOAD_PRESET || ''
const mailHost = process.env.MAIL_HOST || ''
const mailPort = process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT, 10) : 587
const mailUser = process.env.MAIL_USER || ''
const mailPass = process.env.MAIL_PASS || ''
const mailFrom = process.env.MAIL_FROM || mailUser
const mailTo = process.env.MAIL_TO || ''

let memProducts = []
const devFile = path.join(__dirname, 'products-dev.json')
let memHeroSlides = []
const heroFile = path.join(__dirname, 'hero-slides-dev.json')
let memCategories = []
const categoriesFile = path.join(__dirname, 'categories-dev.json')
let adminUsers = []
const adminUsersFile = path.join(__dirname, 'admin-users.json')
const ordersFile = path.join(__dirname, 'orders-dev.json')

const mailer = mailHost && mailUser && mailPass && mailTo
  ? nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailPort === 465,
      auth: { user: mailUser, pass: mailPass }
    })
  : null

// ==========================================================
// 📁 دالات تحميل وحفظ ملفات التطوير المحلي (JSON)
// ==========================================================
const loadDevProducts = async () => {
  try { const txt = await fs.readFile(devFile, 'utf8'); memProducts = JSON.parse(txt); } catch {}
}
const saveDevProducts = async () => {
  try { await fs.writeFile(devFile, JSON.stringify(memProducts, null, 2)); } catch {}
}
const loadHeroSlides = async () => {
  try { const txt = await fs.readFile(heroFile, 'utf8'); memHeroSlides = JSON.parse(txt); } catch {}
}
const saveHeroSlides = async () => {
  try { await fs.writeFile(heroFile, JSON.stringify(memHeroSlides, null, 2)); } catch {}
}
const loadCategories = async () => {
  try { const txt = await fs.readFile(categoriesFile, 'utf8'); memCategories = JSON.parse(txt); } catch {}
}
const saveCategories = async () => {
  try { await fs.writeFile(categoriesFile, JSON.stringify(memCategories, null, 2)); } catch {}
}
const loadAdminUsers = async () => {
  try { const txt = await fs.readFile(adminUsersFile, 'utf8'); adminUsers = JSON.parse(txt); } catch {}
}
const saveAdminUsers = async () => {
  try { await fs.writeFile(adminUsersFile, JSON.stringify(adminUsers, null, 2)); } catch {}
}

const ensureAdminUsers = async () => {
  if (!Array.isArray(adminUsers) || adminUsers.length === 0) {
    adminUsers = [{ id: String(Date.now()), username: adminUser, password: adminPass }]
    await saveAdminUsers()
  }
}
const isAdminCredentials = (username, password) => {
  if (!username || !password) return false
  if (username === adminUser && password === adminPass) return true
  return adminUsers.some(u => u.username === username && u.password === password)
}

// تهيئة Firebase Admin
try {
  const svc = process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : null
  if (svc) {
    admin.initializeApp({ credential: admin.credential.cert(svc), storageBucket: process.env.FIREBASE_STORAGE_BUCKET })
  } else {
    admin.initializeApp({ credential: admin.credential.applicationDefault(), storageBucket: process.env.FIREBASE_STORAGE_BUCKET })
  }
  adminInitialized = true
} catch {
  adminInitialized = false
}

// ==========================================================
// 🛡️ دالة التحقق من الحماية (verifyToken)
// ==========================================================
const verifyToken = async (req, res, next) => {
  await loadAdminUsers()
  await ensureAdminUsers()
  const adminHeaderUser = req.headers['x-admin-user']
  const adminHeaderPass = req.headers['x-admin-pass']
  
  if (isAdminCredentials(adminHeaderUser, adminHeaderPass)) {
    req.user = { uid: 'admin-user' }
    return next()
  }
  if (allowDev) {
    req.user = { uid: 'dev-user' }
    return next()
  }
  
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  
  if (!token || !adminInitialized) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  try {
    const decoded = await admin.auth().verifyIdToken(token)
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ error: 'invalid_token' })
  }
}

// ==========================================================
// 🛒 دالات إدارة ومعالجة الطلبات وإرسال الإيميلات
// ==========================================================
const saveOrderDev = async (order) => {
  try {
    const txt = await fs.readFile(ordersFile, 'utf8').catch(() => '[]')
    const arr = JSON.parse(txt)
    const items = Array.isArray(arr) ? arr : []
    items.push(order)
    await fs.writeFile(ordersFile, JSON.stringify(items, null, 2))
  } catch {}
}

const sendOrderEmail = async (order) => {
  if (!mailer) return
  try {
    const itemsText = order.items.map(i => `- ${i.name} x${i.qty || 1} (${i.price})`).join('\n')
    const text = `New order ${order.id}\nName: ${order.name}\nPhone: ${order.phone}\nAddress: ${order.address}\nCountry: ${order.country}\nTotal: ${order.total}\nItems:\n${itemsText}`
    
    const htmlItems = order.items.map(i => `<li>${i.name} x${i.qty || 1} (${i.price})</li>`).join('')
    const html = `<h3>New order ${order.id}</h3><p>Name: ${order.name}</p><p>Phone: ${order.phone}</p><p>Address: ${order.address}</p><p>Country: ${order.country}</p><p>Total: ${order.total}</p><ul>${htmlItems}</ul>`
    
    await mailer.sendMail({
      from: mailFrom,
      to: mailTo,
      subject: `New order ${order.id}`,
      text,
      html
    })
  } catch (err) {
    console.error("Email send error:", err)
  }
}

// تهيئة الملفات في وضع التطوير المحلي
const store = () => admin.firestore()
if (allowDev) {
  await loadDevProducts()
  await loadHeroSlides()
  await loadCategories()
}
await loadAdminUsers()
await ensureAdminUsers()

// ==========================================================
// 🛣️ راوتس الـ Auth والـ Health الأساسية
// ==========================================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', adminInitialized, allowDev })
})

app.get('/me', verifyToken, (req, res) => {
  res.json({ uid: req.user.uid })
})

app.post('/admin-login', async (req, res) => {
  await loadAdminUsers()
  await ensureAdminUsers()
  const { username, password } = req.body || {}
  if (!username || !password) return res.status(400).json({ error: 'username_password_required' })
  if (!isAdminCredentials(username, password)) {
    return res.status(401).json({ error: 'invalid_credentials' })
  }
  res.json({ ok: true })
})

// ==========================================================
// ✨ راوتس استقبال وحفظ الطلبات
// ==========================================================
const handlePlaceOrder = async (req, res) => {
  try {
    const { items, phone, country, address, name, paymentMethod, total } = req.body || {}
    
    const newOrder = {
      id: "ORD-" + Date.now(),
      items: Array.isArray(items) ? items : [],
      phone,
      country,
      address,
      name,
      paymentMethod: paymentMethod || "cod",
      total,
      status: "pending",createdAt: new Date().toISOString()
    }

    await saveOrderDev(newOrder)
    await sendOrderEmail(newOrder)

    res.status(201).json({ ok: true, order: newOrder })
  } catch (error) {
    console.error("Order processing error:", error)
    res.status(500).json({ error: "failed_to_place_order", details: String(error.message) })
  }
}

// إرسال التحديث للأدمن فوراً لكي يظهر الطلب الجديد في الجدول بدون ريفريش
const currentOrdersTxt = await fs.readFile(ordersFile, 'utf8').catch(() => '[]');
adminClients.forEach(client => client.write(`data: ${currentOrdersTxt}\n\n`));

app.post('/api/orders', handlePlaceOrder)
app.post('/orders', handlePlaceOrder)

// ==========================================================
// 🖼️ راوت رفع الصور (مُعدل ومؤمن لـ Cloudinary بدون FormData متصفح)
// ==========================================================
app.post('/upload-image', verifyToken, async (req, res) => {
  const { dataUrl } = req.body || {}
  if (!dataUrl || !dataUrl.startsWith('data:')) {
    return res.status(400).json({ error: 'invalid_image' })
  }

  try {
    if (cloudinaryName && cloudinaryPreset) {
      // تعديل هندسي: رفع مباشر متوافق مع Node.js بدون استخدام FormData المتصفح المكسورة
      const resCloud = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryName}/image/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: dataUrl, upload_preset: cloudinaryPreset })
      })
      const payload = await resCloud.json()
      if (resCloud.ok) return res.status(201).json({ url: payload.secure_url })
    }

    if (!adminInitialized) return res.status(503).json({ error: 'storage_not_configured' })

    const match = `/^data:(.+?);base64,(.+)$/.exec(dataUrl)`
    if (!match) return res.status(400).json({ error: 'invalid_image' })

    const contentType = match[1]
    const buffer = Buffer.from(match[2], 'base64')
    const bucket = process.env.FIREBASE_STORAGE_BUCKET ? admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET) : admin.storage().bucket()
    const filename = products/`${Date.now()}-${Math.random().toString(36).slice(2)}`
    const file = bucket.file(filename)

    await file.save(buffer, { contentType, resumable: false })
    await file.makePublic()

    return res.status(201).json({ url: `https://storage.googleapis.com/${bucket.name}/${filename}` })
  } catch (e) {
    console.error('POST /upload-image error:', e)
    res.status(500).json({ error: 'upload_failed', details: String(e?.message || e) })
  }
})

// ==========================================================
// 📦 راوتس إدارة وعرض المنتجات (Products)
// ==========================================================
app.get('/products', verifyToken, async (req, res) => {
  if (allowDev) return res.json(memProducts.map(p => ({ ...p, category: p.category || 'Watches' })))
  try {
    const snap = await store().collection('products').get()
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  } catch (e) { res.status(500).json({ error: 'server_error' }) }
})

app.get('/public/products', async (req, res) => {
  try {
    if (allowDev) return res.json(memProducts.map(p => ({ ...p, category: p.category || 'Watches' })))
    const snap = await store().collection('products').get()
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  } catch (e) { res.status(500).json({ error: 'server_error' }) }
})

app.post('/products', verifyToken, async (req, res) => {
  const { name, price, image, description, descriptionAr, descriptionEn, category, salePrice, discountPercent, images } = req.body || {}
  if (!name) return res.status(400).json({ error: 'name_required' })
  
  if (allowDev) {
    const item = { id: String(Date.now()), name, price, image, description, descriptionAr, descriptionEn, category: category || 'Watches', salePrice, discountPercent, images: Array.isArray(images) ? images : [] }
    memProducts.push(item); await saveDevProducts(); return res.status(201).json(item)
  }
  try {
    const doc = await store().collection('products').add({ name, price, image, description, descriptionAr, descriptionEn, category, salePrice, discountPercent, images: Array.isArray(images) ? images : [] })
    const snap = await doc.get()
    res.status(201).json({ id: doc.id, ...snap.data() })
  } catch (e) {
    res.status(500).json({ error: 'server_error', details: String(e?.message || e) })
  }
})

app.put('/products/discount-all', verifyToken, async (req, res) => {
  const { salePrice, discountPercent } = req.body || {}
  if (allowDev) {
    memProducts = memProducts.map(p => ({ ...p, salePrice, discountPercent }))
    await saveDevProducts(); return res.json({ count: memProducts.length })
  }
  try {
    const snap = await store().collection('products').get()
    const batch = store().batch()
    snap.docs.forEach(doc => { batch.set(doc.ref, { salePrice, discountPercent }, { merge: true }) })
    await batch.commit(); res.json({ count: snap.size })
  } catch (e) { res.status(500).json({ error: 'server_error' }) }
})

app.put('/products/:id', verifyToken, async (req, res) => {
  const { id } = req.params; const data = req.body || {}
  if (allowDev) {
    const idx = memProducts.findIndex(p => p.id === id)
    if (idx === -1) return res.status(404).json({ error: 'not_found' })
    memProducts[idx] = { ...memProducts[idx], ...data, images: Array.isArray(data.images) ? data.images : memProducts[idx].images || [] }
    await saveDevProducts(); return res.json(memProducts[idx])
  }
  try {
    await store().collection('products').doc(id).set(data, { merge: true })
    const snap = await store().collection('products').doc(id).get()
    res.json({ id, ...snap.data() })
  } catch (e) { res.status(500).json({ error: 'server_error' }) }
})

app.delete('/products/:id', verifyToken, async (req, res) => {
  const { id } = req.params
  if (allowDev) {
    memProducts = memProducts.filter(p => p.id !== id); await saveDevProducts(); return res.status(204).end()
  }
  try {
    await store().collection('products').doc(id).delete(); res.status(204).end()
  } catch (e) { res.status(500).json({ error: 'server_error' }) }
})

// ==========================================================
// 📂 راوتس التصنيفات والـ Hero Slides
// ==========================================================
app.get('/public/hero-slides', async (req, res) => {
  try {
    if (allowDev) return res.json(memHeroSlides)
    const snap = await store().collection('heroSlides').orderBy('order', 'asc').get()
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  } catch (e) { res.status(500).json({ error: 'server_error' }) }
})

app.get('/hero-slides', verifyToken, async (req, res) => {
  try {
    if (allowDev) return res.json(memHeroSlides)
    const snap = await store().collection('heroSlides').orderBy('order', 'asc').get()
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  } catch (e) { res.status(500).json({ error: 'server_error' }) }
})

app.post('/hero-slides', verifyToken, async (req, res) => {
  const { title, subtitle, buttonText, buttonLink, image, order } = req.body || {}
  if (!image) return res.status(400).json({ error: 'image_required' })
  if (allowDev) {
    const item = { id: String(Date.now()), title: title || '', buttonText: buttonText || '#products-section', image, order: Number(order) || 0, createdAt: Date.now() }
    memHeroSlides.push(item); await saveHeroSlides(); return res.status(201).json(item)
  }
  try {
    const doc = await store().collection('heroSlides').add({ title: title || '', buttonText: buttonText || '#products-section', image, order: Number(order) || 0, createdAt: Date.now() })
    const snap = await doc.get(); res.status(201).json({ id: doc.id, ...snap.data() })
  } catch (e) { res.status(500).json({ error: 'server_error' }) }
})

app.put('/hero-slides/:id', verifyToken, async (req, res) => {
  const { id } = req.params; const data = req.body || {}
  if (allowDev) {
    const idx = memHeroSlides.findIndex(s => s.id === id); if (idx === -1) return res.status(404).json({ error: 'not_found' })
    memHeroSlides[idx] = { ...memHeroSlides[idx], ...data }; await saveHeroSlides(); return res.json(memHeroSlides[idx])
  }
  try {
    await store().collection('heroSlides').doc(id).set(data, { merge: true })
    const snap = await store().collection('heroSlides').doc(id).get(); res.json({ id, ...snap.data() })
  } catch (e) { res.status(500).json({ error: 'server_error' }) }
})

app.delete('/hero-slides/:id', verifyToken, async (req, res) => {
  const { id } = req.params
  if (allowDev) {
    memHeroSlides = memHeroSlides.filter(s => s.id !== id); await saveHeroSlides(); return res.status(204).end()
  }
  try { await store().collection('heroSlides').doc(id).delete(); res.status(204).end() } catch (e) { res.status(500).json({ error: 'server_error' }) }
})

app.get('/public/categories', async (req, res) => {
  try {
    if (allowDev) return res.json(memCategories)
    const snap = await store().collection('categories').get()
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  } catch (e) { res.status(500).json({ error: 'server_error' }) }
})

app.get('/categories', verifyToken, async (req, res) => {
  try {
    if (allowDev) return res.json(memCategories)
    const snap = await store().collection('categories').get()
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  } catch (e) { res.status(500).json({ error: 'server_error' }) }
})

app.post('/categories', verifyToken, async (req, res) => {
  const { name, slug } = req.body || {}
  if (!name) return res.status(400).json({ error: 'name_required' })
  const item = { id: allowDev ? String(Date.now()) : undefined, name, slug: slug || String(name).toLowerCase().replace(/\s+/g, '-') }
  try {
    if (allowDev) { memCategories.push(item); await saveCategories(); return res.status(201).json(item); }
    const doc = await store().collection('categories').add(item)
    const snap = await doc.get()
    res.status(201).json({ id: doc.id, ...snap.data() })
  } catch (e) { res.status(500).json({ error: 'server_error' }) }
})

app.put('/categories/:id', verifyToken, async (req, res) => {
  const { id } = req.params; const { name, slug } = req.body || {}
  try {
    if (allowDev) {
      const idx = memCategories.findIndex(c => c.id === id); if (idx === -1) return res.status(404).json({ error: 'not_found' })
      memCategories[idx] = { ...memCategories[idx], ...(name ? { name } : {}), ...(slug ? { slug } : {}) }
      await saveCategories(); return res.json(memCategories[idx])
    }
    await store().collection('categories').doc(id).set({ ...(name ? { name } : {}), ...(slug ? { slug } : {}) }, { merge: true })
    const snap = await store().collection('categories').doc(id).get()
    res.json({ id, ...snap.data() })
  } catch (e) { res.status(500).json({ error: 'server_error' }) }
})

app.delete('/categories/:id', verifyToken, async (req, res) => {
  const { id } = req.params
  try {
    if (allowDev) {
      memCategories = memCategories.filter(c => c.id !== id); await saveCategories(); return res.status(204).end()
    }
    await store().collection('categories').doc(id).delete()
    res.status(204).end()
  } catch (e) { res.status(500).json({ error: 'server_error' }) }
})

app.get('/admin-users', verifyToken, (req, res) => {
  res.json(adminUsers)
})

// ==========================================================
// 🚀 تقديم ملفات الـ React Frontend (dist)
// ==========================================================
app.use(express.static(path.join(__dirname, "../dist"), {
  setHeaders(res, filePath) {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-store')
    } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    }
  }
}))

app.get("*", (req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  res.sendFile(path.join(__dirname, "../dist/index.html"))
})

const port = parseInt(process.env.PORT || '8080', 10)

// الراوت  لجلب الطلبات وعرضها في لوحة التحكم للأدمن
app.get('/api/orders', verifyToken, async (req, res) => {
  try {
    const txt = await fs.readFile(ordersFile, 'utf8').catch(() => '[]')
    const arr = JSON.parse(txt)
    res.json(Array.isArray(arr) ? arr : [])
  } catch (e) {
    res.status(500).json({ error: 'failed_to_fetch_orders' })
  }
})
// راوت الـ Stream الخاص بالأدمن لجلب الطلبات وتحديثها تلقائياً
app.get('/api/admin/notifications/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // إرسال الطلبات المخزنة فور فتح الأدمن للصفحة
  fs.readFile(ordersFile, 'utf8')
    .then(txt => {
      const arr = JSON.parse(txt || '[]');
      res.write(`data: ${JSON.stringify(arr)}\n\n`);
    })
    .catch(() => res.write(`data: []\n\n`));

  // حفظ هذا الاتصال لنتحدث معه عند وصول أي طلب جديد
  adminClients.push(res);

  req.on('close', () => {
    adminClients = adminClients.filter(client => client !== res);
  });
});

// راوت احتياطي بنفس الاسم القديم بدون /api لو كان الفرونت إند يطلبه مباشرة
app.get('/admin/notifications/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  fs.readFile(ordersFile, 'utf8')
    .then(txt => {
      const arr = JSON.parse(txt || '[]');
      res.write(`data: ${JSON.stringify(arr)}\n\n`);
    })
    .catch(() => res.write(`data: []\n\n`));

  adminClients.push(res);
  req.on('close', () => { adminClients = adminClients.filter(client => client !== res); });
});
// نسخة احتياطية بدون الـ /api لو كان الادمن يطلبها مباشرة
app.get('/orders', verifyToken, async (req, res) => {
  try {
    const txt = await fs.readFile(ordersFile, 'utf8').catch(() => '[]')
    const arr = JSON.parse(txt)
    res.json(Array.isArray(arr) ? arr : [])
  } catch (e) {
    res.status(500).json({ error: 'failed_to_fetch_orders' })
  }
})
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})