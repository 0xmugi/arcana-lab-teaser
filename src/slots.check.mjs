// Asserts the overlay slots still land inside their mid-box.png panels.
// Run: node src/slots.check.mjs
import { readFileSync } from 'node:fs'

const SRC = { w: 160, h: 98 }
// Panel inner areas measured from public/mid-box.png pixel map.
const PANELS = {
  'slot-address': { x1: 23, x2: 133, y1: 23, y2: 33 },
  'slot-proof': { x1: 50, x2: 116, y1: 44, y2: 56 },
  'slot-submit': { x1: 69, x2: 87, y1: 68, y2: 81 },
}
const TOL = 1.5

const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8')
const num = (rule, prop) => {
  const m = rule.match(new RegExp(`${prop}:([\\d.]+)%`))
  if (!m) throw new Error(`${prop} missing`)
  return Number(m[1])
}

let failed = 0
for (const [cls, panel] of Object.entries(PANELS)) {
  const rule = css.match(new RegExp(`\\.${cls}\\{([^}]+)\\}`))?.[1]
  if (!rule) { console.error(`FAIL ${cls}: rule not found`); failed++; continue }
  const got = {
    x1: num(rule, 'left') / 100 * SRC.w,
    y1: num(rule, 'top') / 100 * SRC.h,
  }
  got.x2 = got.x1 + num(rule, 'width') / 100 * SRC.w
  got.y2 = got.y1 + num(rule, 'height') / 100 * SRC.h

  const off = Object.entries(panel)
    .filter(([k, v]) => Math.abs(got[k] - v) > TOL)
    .map(([k, v]) => `${k} ${got[k].toFixed(1)} vs ${v}`)

  if (off.length) { console.error(`FAIL ${cls}: ${off.join(', ')}`); failed++ }
}

// The X icon must sit to the right of the proof panel, still on canvas.
const xRule = css.match(/\.slot-x\{([^}]+)\}/)?.[1] ?? ''
const xLeft = num(xRule, 'left') / 100 * SRC.w
const xRight = xLeft + num(xRule, 'width') / 100 * SRC.w
if (xLeft < PANELS['slot-proof'].x2 || xRight > SRC.w) {
  console.error(`FAIL slot-x: ${xLeft.toFixed(1)}-${xRight.toFixed(1)} must be right of ${PANELS['slot-proof'].x2} and within ${SRC.w}`)
  failed++
}

if (failed) process.exit(1)
console.log('slots ok')
