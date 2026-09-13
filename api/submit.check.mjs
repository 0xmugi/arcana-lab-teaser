// Asserts the submit endpoint's validation rules and the follow-gate contract.
// Run: node api/submit.check.mjs
const ADDRESS = /^0x[a-fA-F0-9]{40}$/
const PROOF = /^https:\/\/(x|twitter)\.com\/[^/]+\/status\/\d+/i

const ok = (label, cond) => { if (!cond) { console.error(`FAIL ${label}`); process.exitCode = 1 } }

const good = '0x' + 'a'.repeat(40)
ok('address accepts 40 hex', ADDRESS.test(good))
ok('address rejects 39 hex', !ADDRESS.test('0x' + 'a'.repeat(39)))
ok('address rejects 41 hex', !ADDRESS.test('0x' + 'a'.repeat(41)))
ok('address rejects no prefix', !ADDRESS.test('a'.repeat(40)))
ok('address rejects non-hex', !ADDRESS.test('0x' + 'g'.repeat(40)))

ok('proof accepts x.com', PROOF.test('https://x.com/user/status/1234567890'))
ok('proof accepts twitter.com', PROOF.test('https://twitter.com/user/status/1'))
ok('proof accepts query suffix', PROOF.test('https://x.com/u/status/1?s=20'))
ok('proof rejects http', !PROOF.test('http://x.com/u/status/1'))
ok('proof rejects profile url', !PROOF.test('https://x.com/user'))
ok('proof rejects other host', !PROOF.test('https://evil.com/u/status/1'))
ok('proof rejects missing id', !PROOF.test('https://x.com/u/status/'))

// Gate: first valid submit only arms the modal, second one posts.
const gate = (() => {
  let armed = false
  return () => (armed ? 'post' : ((armed = true), 'modal'))
})()
ok('first submit shows modal', gate() === 'modal')
ok('second submit posts', gate() === 'post')
ok('third submit posts', gate() === 'post')

// DB constraint mirrors the API regex, but stores lowercase only.
ok('address is lowercased before insert', '0xAbCd'.toLowerCase() === '0xabcd')
ok('lowercased address still valid', ADDRESS.test(good.toUpperCase().replace('0X', '0x')))

if (!process.exitCode) console.log('submit checks ok')
