const base = process.env.BASE_URL || 'http://localhost:8080'
const assert = (cond, msg) => { if (!cond) throw new Error(msg) }

async function main() {
  const res = await fetch(`${base}/health`)
  assert(res.ok, 'health not ok')
  const data = await res.json()
  assert(data.status === 'ok', 'health status mismatch')
  console.log('ok')
}

main().catch((e) => {
  console.error('smoke failed:', e.message)
  process.exit(1)
})
