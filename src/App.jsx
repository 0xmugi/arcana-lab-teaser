import { useState } from 'react'

const X_URL = 'https://x.com/ArchemystLab'
const POST_URL = 'https://x.com/ArchemystLab/status/2099499587304387071'

const IconLink = ({ href, label, src }) => (
  <a href={href} aria-label={label}>
    <img src={src} alt="" draggable="false" />
  </a>
)

// Site-styled validation replaces the browser's native "Please fill out this field" bubbles.
const validate = (form, opened) => {
  const address = form.address.value.trim()
  const proof = form.proof.value.trim()
  if (!address) return 'Wallet address required'
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return 'Address must be 0x + 40 hex characters'
  if (!proof) return 'Retweet or comment link required'
  if (!/^https?:\/\/(x\.com|twitter\.com)\/\S+\/status\/\d+/.test(proof)) return 'Proof must be an x.com post link'
  if (!opened) return 'Open the post on X first, then paste your link'
  return null
}

const FOLLOW_KEY = 'archemyst-follow-gate'

function Landing() {
  const [opened, setOpened] = useState(false)
  const [note, setNote] = useState(null)
  const [gate, setGate] = useState(false)
  const [sending, setSending] = useState(false)

  const submitEntry = async (event) => {
    event.preventDefault()
    if (sending) return
    const form = event.currentTarget
    const error = validate(form, opened)
    if (error) return setNote({ tone: 'alert', text: error })

    // First valid submit is held back behind the follow gate; the next one goes through.
    if (!localStorage.getItem(FOLLOW_KEY)) {
      localStorage.setItem(FOLLOW_KEY, '1')
      setNote(null)
      return setGate(true)
    }

    setSending(true)
    setNote({ tone: 'ok', text: 'Submitting…' })
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: form.address.value.trim(), proof: form.proof.value.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return setNote({ tone: 'alert', text: data.error ?? 'Submission failed. Try again' })
      form.reset()
      setOpened(false)
      setNote({ tone: 'ok', text: 'Entry submitted' })
    } catch {
      setNote({ tone: 'alert', text: 'Network error. Check your connection' })
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="landing">
      <img className="background" src="/art.gif" alt="" draggable="false" />
      {gate && (
        <div className="gate" role="dialog" aria-modal="true" aria-labelledby="gate-text">
          <div className="gate-panel">
            <span className="gate-tag">Archemyst // verification</span>
            <p className="gate-text" id="gate-text">Please follow first</p>
            <a
              className="gate-link" href={X_URL} target="_blank" rel="noopener noreferrer"
              onClick={() => setGate(false)}
            >{X_URL.replace('https://', '')}</a>
          </div>
        </div>
      )}
      <form className="mid" onSubmit={submitEntry} noValidate>
        <img className="box" src="/mid-box.png" alt="" draggable="false" />
        <input
          className="slot slot-address" name="address" type="text"
          spellCheck="false" autoComplete="off"
          placeholder="Enter your EVM address" aria-label="Wallet address"
        />
        <input
          className="slot slot-proof" name="proof" type="url"
          spellCheck="false" autoComplete="off"
          placeholder="x.com/…/status/…"
          aria-label="Retweet or comment link"
        />
        <a
          className={`slot slot-x${opened ? ' is-open' : ''}`} href={POST_URL}
          target="_blank" rel="noopener noreferrer"
          aria-label="Step 1 — open the post on X"
          onClick={() => { setOpened(true); setNote(null) }}
        >
          <img src="/x-logo.png" alt="" draggable="false" />
          <span className="slot-x-hint">{opened ? 'opened' : 'click me'}</span>
        </a>
        <button className="slot slot-submit" type="submit" disabled={sending} aria-label="Submit entry" />
        <p className={`mid-note${note ? ` is-${note.tone}` : ''}`} role="status" aria-live="polite">{note?.text ?? ''}</p>
      </form>
      <nav className="landing-links" aria-label="Project links">
        <IconLink href={X_URL} label="Archemyst Lab on X" src="/x-logo.png" />
        <IconLink href="/docs" label="Docs" src="/docs-logo.png" />
      </nav>
      <img className="trademark" src="/archemyst-tm.png" alt="Archemyst™" draggable="false" />
    </main>
  )
}

const sections = [
  ['enter', 'Enter the lab'],
  ['incident', 'The incident'],
  ['subjects', 'The subjects'],
  ['why', 'Why Archemyst'],
  ['collection', 'The collection'],
  ['community', 'The community'],
  ['status', 'Lab status'],
  ['transmissions', 'Transmissions'],
  ['faq', 'FAQ'],
  ['notice', 'Notice'],
]

const faq = [
  ['What is Archemyst Lab?', 'A mad-science-themed PFP NFT collection built on ARC. Each NFT represents a scientist, researcher, or experimental subject transformed by the fictional Archemyst Protocol.'],
  ['What is an Archemyst?', 'A surviving subject from the laboratory. Every Archemyst has a unique appearance shaped by mutations, machinery, chemicals, and failed experiments.'],
  ['Which network is the collection built on?', 'Archemyst Lab is being built on ARC.'],
  ['What is the total supply?', 'Classified. It will be announced when collection details are finalized.'],
  ['When is the mint?', 'Mint date, time, price, and phases are TBA.'],
  ['Is it only a PFP collection?', 'It begins as a PFP collection focused on artwork, identity, storytelling, and community. Any future development will be announced only after it has been confirmed.'],
  ['Will there be a token?', 'Token-related information is TBA. No token has been officially announced.'],
  ['Is there a roadmap?', 'Focus right now is the collection, its identity, and the ARC community. Confirmed plans will be documented as the experiment progresses.'],
  ['Where can I follow the project?', 'This archive and the official @ArchemystLab account on X.'],
]

function Docs() {
  return (
    <div className="docs-page">
      <a className="skip" href="#content">Skip to documentation</a>
      <header className="docs-header">
        <img className="mark" src="/docs-logo.png" alt="" draggable="false" />
        <div className="crumb"><a href="/">Archemyst Lab</a><span>//</span>Documentation</div>
        <nav className="header-links" aria-label="Project links">
          <a className="button x-link" href={X_URL} target="_blank" rel="noopener noreferrer">Official X ↗</a>
          <a className="button" href="/">Exit docs</a>
        </nav>
      </header>

      <div className="docs-layout">
        <aside className="side">
          <p className="side-label">Archive online</p>
          <nav aria-label="Documentation sections">
            {sections.map(([id, label], index) => <a key={id} data-index={`0${index + 1}`.slice(-2)} href={`#${id}`}>{label}</a>)}
          </nav>
          <p className="side-meta">File: ARC–001<br />Access: Public<br />Revision: 02</p>
        </aside>

        <main id="content" className="docs-main">
          <div className="hero">
            <div className="eyebrow">Public archive // recovered records</div>
            <h1>Archemyst<span>Laboratory archive</span></h1>
            <p className="lede">Some experiments should never leave the lab. Unfortunately, they already did.</p>
          </div>

          <section id="enter">
            <h2>Enter the lab</h2>
            <p>You were not supposed to find this archive. Hidden somewhere within ARC is a laboratory erased from every official record. Inside, a group of scientists attempted to push biology, machinery, and human intelligence beyond their natural limits.</p>
            <p>Then the facility went silent. The researchers disappeared. The containment chambers were found empty.</p>
            <p className="muted">Now, fragments of the Archemyst Protocol are beginning to surface across ARC. The doors are open. The subjects are missing.</p>
          </section>

          <section id="incident">
            <h2>The incident</h2>
            <p>The original purpose of Archemyst Lab remains classified. Recovered records suggest its researchers were working on an experimental formula capable of rewriting living matter. What began as scientific discovery quickly became an obsession.</p>
            <ul className="rules">
              <li>Safety protocols were ignored.</li>
              <li>Unstable substances were combined.</li>
              <li>Machines were pushed beyond their limits.</li>
            </ul>
            <p>The experiments continued until a containment failure spread through the entire facility. Emergency systems sealed the laboratory, communications were terminated, and every researcher inside was presumed lost.</p>
            <p>Years later, its systems unexpectedly reactivated. Corrupted files began transmitting across ARC, revealing distorted images of the scientists who had once worked there. They had survived. Just not as themselves.</p>
            <div className="notice"><strong>RECORD</strong><p>They entered the laboratory as scientists. They emerged as experiments.</p></div>
          </section>

          <section id="subjects">
            <h2>The subjects</h2>
            <p>Archemyst Lab is a PFP collection of mad scientists, corrupted researchers, and unstable experiments emerging from the darkest corners of ARC. Every subject carries evidence of what happened inside the facility.</p>
            <ul className="rules">
              <li>Chemical mutations</li>
              <li>Mechanical modifications</li>
              <li>Failed procedures</li>
              <li>Contaminated equipment</li>
              <li>Unstable formulas</li>
              <li>Scientific obsession</li>
              <li>Unknown anomalies</li>
            </ul>
            <p>No two subjects left the laboratory in the same condition. Their clothing, equipment, expressions, mutations, and abnormalities reveal fragments of their individual experiments. Some retained their intelligence. Some lost themselves completely. Others may still be changing.</p>
            <p className="muted">Each Archemyst is more than a profile picture. It is a classified identity recovered from a laboratory that was never meant to be reopened.</p>
          </section>

          <section id="why">
            <h2>Why Archemyst</h2>
            <p>Archemyst Lab was created to bring a distinctive mad-science identity into the ARC ecosystem. The collection is built around three elements.</p>
            <div className="cards">
              <div className="card is-static"><small>ELEMENT // 01</small><h3>Identity</h3><p>A recognizable PFP designed for collectors who want to represent themselves differently across ARC and Web3.</p></div>
              <div className="card is-static"><small>ELEMENT // 02</small><h3>Story</h3><p>A mysterious laboratory universe that can expand through characters, experiments, recovered records, and community stories.</p></div>
              <div className="card is-static"><small>ELEMENT // 03</small><h3>Culture</h3><p>A place for collectors, creators, builders, and curious minds exploring the early days of ARC.</p></div>
            </div>
            <p className="muted">Archemyst Lab is not built around complicated promises. It begins with strong artwork, a recognizable identity, and a community gathering around one shared experiment. Everything else will be revealed when it is ready.</p>
          </section>

          <section id="collection">
            <h2>The collection</h2>
            <p>Every NFT represents a unique subject produced by the Archemyst Protocol. Together, they form a living archive of the experiments that escaped the facility.</p>
            <div className="status" role="list" aria-label="Public record">
              <div className="status-row" role="listitem"><span>Project</span><span className="value live">Archemyst Lab</span></div>
              <div className="status-row" role="listitem"><span>Collection</span><span className="value live">PFP NFT</span></div>
              <div className="status-row" role="listitem"><span>Network</span><span className="value live">ARC</span></div>
              <div className="status-row" role="listitem"><span>Status</span><span className="value live">Experiment active</span></div>
            </div>
            <div className="notice"><strong>SEALED</strong><p>Total supply, mint price, maximum mint per wallet, mint date and time, and mint phases remain classified until final laboratory clearance is granted.</p></div>
            <p className="muted">No speculation. No fabricated promises. Only verified records.</p>
          </section>

          <section id="community">
            <h2>The community</h2>
            <p>The laboratory may have created the subjects, but the community will determine what they become. Archemyst Lab is being developed for the growing ARC community, a gathering point for collectors, creators, builders, and anyone curious enough to enter the experiment.</p>
            <p>Every adopted PFP, shared creation, theory, meme, and conversation adds another record to the archive.</p>
            <ul className="rules">
              <li>Choose a subject.</li>
              <li>Create an identity.</li>
              <li>Add your own story.</li>
            </ul>
            <p className="muted">The experiment is no longer controlled by the laboratory alone.</p>
          </section>

          <section id="status">
            <h2>Lab status</h2>
            <p>Archemyst Lab is currently in its early experimental stage. The first transmissions are online, the archive is open, and further records are being prepared for release.</p>
            <div className="status" role="list" aria-label="Laboratory systems">
              <div className="status-row" role="listitem"><span>Project gateway</span><span className="value live">Online</span></div>
              <div className="status-row" role="listitem"><span>Public archive</span><span className="value live">Online</span></div>
              <div className="status-row" role="listitem"><span>Official X</span><span className="value live">Online</span></div>
              <div className="status-row" role="listitem"><span>Collection details</span><span className="value">Classified</span></div>
              <div className="status-row" role="listitem"><span>Mint information</span><span className="value">Classified</span></div>
              <div className="status-row" role="listitem"><span>Contract record</span><span className="value">Not published</span></div>
              <div className="status-row" role="listitem"><span>Experiment</span><span className="value live">Active</span></div>
            </div>
            <p className="muted">This archive will evolve as confirmed information becomes available. Until then, some records must remain sealed.</p>
          </section>

          <section id="transmissions">
            <h2>Official transmissions</h2>
            <div className="cards">
              <a className="card" href="/"><small>LOCAL // 01</small><h3>Project gateway</h3><p>Enter the official Archemyst Lab experience and access currently available project records.</p></a>
              <a className="card" href={X_URL} target="_blank" rel="noopener noreferrer"><small>EXTERNAL // 02</small><h3>X / Twitter</h3><p>Follow ongoing transmissions, experiment reveals, and official project updates.</p></a>
            </div>
            <p className="muted">Additional channels will be documented if they are introduced. Treat any link not published here as unaffiliated, and never share a seed phrase or private key.</p>
          </section>

          <section id="faq">
            <h2>Frequently asked questions</h2>
            <div className="faq">
              {faq.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
            </div>
          </section>

          <section id="notice">
            <h2>Experimental notice</h2>
            <p>Archemyst Lab is a digital collectible project created for artistic, entertainment, identity, and community purposes.</p>
            <p>Information marked TBA, classified, or in development has not yet been finalized and should not be considered a confirmed commitment. Ownership of an Archemyst Lab NFT does not guarantee financial returns, rewards, future utilities, or an increase in value.</p>
            <div className="notice"><strong>FINAL WARNING</strong><p>The facility was sealed for a reason. The formulas were destroyed for a reason. The subjects were never supposed to escape. But the laboratory is active again, and somewhere inside ARC, the experiment continues.</p></div>
            <p className="muted">File ARC–001 // Access public // Status experiment active // Revision 02. End of recovered records.</p>
          </section>

          <footer><span>Archemyst Lab // Public archive</span><img className="wordmark" src="/archemyst-tm.png" alt="Archemyst™" draggable="false" /></footer>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return location.pathname.replace(/\/$/, '') === '/docs' ? <Docs /> : <Landing />
}
