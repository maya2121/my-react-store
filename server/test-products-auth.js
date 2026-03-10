import dotenv from 'dotenv'

dotenv.config()

const base = process.env.BASE_URL || 'http://localhost:8080'
const token = process.env.ID_TOKEN || ''
const adminUser = process.env.ADMIN_USERNAME || ''
const adminPass = process.env.ADMIN_PASSWORD || ''
const assert = (cond, msg) => { if (!cond) throw new Error(msg) }

async function main() {
  const headers = token
    ? { Authorization: `Bearer ${token}` }
    : adminUser && adminPass
      ? { 'x-admin-user': adminUser, 'x-admin-pass': adminPass }
      : {}
  const res = await fetch(`${base}/products`, {
    headers
  })
  assert(res.ok, 'products not ok')
  const data = await res.json()
  assert(Array.isArray(data), 'products not array')
  console.log('ok')
}

main().catch((e) => {
  console.error('products test failed:', e.message)
  process.exit(1)
})
