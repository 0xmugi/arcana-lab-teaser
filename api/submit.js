// POST /api/submit  { address, proof } -> { ok } | { error }
// Validation mirrors the DB constraints so bad input never reaches Postgres.
const URL = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_KEY
const REST = `${URL}/rest/v1/entries`
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

const ADDRESS = /^0x[a-fA-F0-9]{40}$/
const PROOF = /^https:\/\/(x|twitter)\.com\/[^/]+\/status\/\d+/i
const WINDOW_MIN = 10
const WINDOW_MAX = 5

const hash = async (value) => {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value + (KEY ?? '')))
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!URL || !KEY) return res.status(503).json({ error: 'Submissions are offline' })

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}
  const address = String(body.address ?? '').trim().toLowerCase()
  const proof = String(body.proof ?? '').trim()

  if (!ADDRESS.test(address)) return res.status(400).json({ error: 'Address must be 0x + 40 hex characters' })
  if (!PROOF.test(proof)) return res.status(400).json({ error: 'Proof must be an x.com post link' })

  // Trust only the first XFF hop; behind Vercel that is the real client.
  const ip = (req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || 'unknown'
  const ipHash = await hash(ip)

  try {
    const since = new Date(Date.now() - WINDOW_MIN * 60_000).toISOString()
    const recent = await fetch(`${REST}?select=id&ip_hash=eq.${ipHash}&created_at=gte.${since}&limit=${WINDOW_MAX}`, { headers: HEADERS })
    if (!recent.ok) throw new Error(`count ${recent.status}`)
    if ((await recent.json()).length >= WINDOW_MAX) {
      return res.status(429).json({ error: `Too many attempts. Retry in ${WINDOW_MIN} minutes` })
    }

    const insert = await fetch(REST, {
      method: 'POST',
      headers: { ...HEADERS, Prefer: 'return=minimal' },
      body: JSON.stringify({ address, proof, ip_hash: ipHash }),
    })
    if (insert.status === 409) {
      const detail = await insert.text()
      const dupe = detail.includes('entries_proof_key') ? 'That post link is already submitted' : 'That address is already submitted'
      return res.status(409).json({ error: dupe })
    }
    if (!insert.ok) throw new Error(`insert ${insert.status} ${await insert.text()}`)

    return res.status(201).json({ ok: true })
  } catch (err) {
    console.error('submit failed', err)
    return res.status(502).json({ error: 'Submission service unavailable. Try again' })
  }
}
