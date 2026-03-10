const base = process.env.BASE_URL || 'http://localhost:8080'
const product = {
  name: process.env.NAME || 'Demo Product',
  price: Number(process.env.PRICE || '49.99'),
  image: process.env.IMAGE || '',
  description: process.env.DESC || 'Added via script',
  category: process.env.CAT || 'Watches'
}

async function main() {
  try {
    const res = await fetch(`${base}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    })
    const ct = res.headers.get('content-type') || ''
    const data = ct.includes('application/json') ? await res.json() : await res.text()
    console.log(JSON.stringify({ status: res.status, data }, null, 2))
    if (!res.ok) process.exit(1)
  } catch (e) {
    console.error('Error:', e.message)
    process.exit(1)
  }
}

main()
