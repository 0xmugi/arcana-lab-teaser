import { useState } from 'react'

const X_URL = 'https://x.com/ArchemystLab'

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
  if (!opened) return 'Open the post on X first, then paste your link'
  if (!proof) return 'Retweet or comment link required'
  if (!/^https?:\/\/\S+$/.test(proof)) return 'Proof must be a full link starting with https://'
  return null
}

function Landing() {
  const [opened, setOpened] = useState(false)
  const [note, setNote] = useState(null)

  // ponytail: entries land in localStorage only; swap for the submission endpoint when the backend exists.
  const submitEntry = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const error = validate(form, opened)
    if (error) return setNote({ tone: 'alert', text: error })
    localStorage.setItem('archemyst-entry', JSON.stringify({
      address: form.address.value.trim(),
      proof: form.proof.value.trim(),
      at: new Date().toISOString(),
    }))
    form.reset()
    setNote({ tone: 'ok', text: 'Entry logged' })
  }

  return (
    <main className="landing">
      <img className="background" src="/art.gif" alt="" draggable="false" />
      <form className="mid" onSubmit={submitEntry} noValidate>
        <img className="box" src="/mid-box.png" alt="" draggable="false" />
        <input
          className="slot slot-address" name="address" type="text"
          spellCheck="false" autoComplete="off"
          placeholder="0x…" aria-label="Wallet address"
        />
        <input
          className="slot slot-proof" name="proof" type="url"
          spellCheck="false" autoComplete="off"
          placeholder="x.com/…/status/…"
          aria-label="Retweet or comment link"
        />
        <a
          className={`slot slot-x${opened ? ' is-open' : ''}`} href={X_URL}
          target="_blank" rel="noopener noreferrer"
          aria-label="Step 1 — open the post on X"
          onClick={() => { setOpened(true); setNote(null) }}
        >
          <img src="/x-logo.png" alt="" draggable="false" />
          <span className="slot-x-hint">{opened ? 'opened' : 'click me'}</span>
        </a>
        <button className="slot slot-submit" type="submit" aria-label="Submit entry" />
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

const sections = ['overview', 'channels', 'status', 'safety']

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
            {sections.map((section, index) => <a key={section} data-index={`0${index + 1}`} href={`#${section}`}>{section}</a>)}
          </nav>
          <p className="side-meta">File: ARC–001<br />Access: Public<br />Revision: 01</p>
        </aside>

        <main id="content" className="docs-main">
          <div className="hero">
            <div className="eyebrow">Project documentation</div>
            <h1>Archemyst<span>Laboratory archive</span></h1>
            <p className="lede">The canonical reference for the Archemyst Lab project, current release state, and verified public channels.</p>
          </div>

          <section id="overview">
            <h2>Overview</h2>
            <p>Archemyst Lab is currently presented through its public project gateway. The experience is in an early release state while protocol details are being prepared.</p>
            <div className="notice"><strong>NOTICE</strong><p>No network, token, contract address, mint, or access flow has been publicly announced on this website.</p></div>
            <p className="muted">Future technical documentation will be published here only when implementation details are ready for public verification.</p>
          </section>

          <section id="channels">
            <h2>Official channels</h2>
            <div className="cards">
              <a className="card" href="/"><small>LOCAL // 01</small><h3>Project gateway</h3><p>Return to the primary Archemyst Lab experience.</p></a>
              <a className="card" href={X_URL} target="_blank" rel="noopener noreferrer"><small>EXTERNAL // 02</small><h3>Archemyst on X</h3><p>Follow the verified project account for public updates.</p></a>
            </div>
          </section>

          <section id="status">
            <h2>Release status</h2>
            <div className="status" role="list" aria-label="Project release status">
              <div className="status-row" role="listitem"><span>Project gateway</span><span className="value live">Online</span></div>
              <div className="status-row" role="listitem"><span>Documentation</span><span className="value live">Public</span></div>
              <div className="status-row" role="listitem"><span>Network</span><span className="value">Not announced</span></div>
              <div className="status-row" role="listitem"><span>Contracts</span><span className="value">Not published</span></div>
            </div>
          </section>

          <section id="safety">
            <h2>Safety protocol</h2>
            <ul className="rules">
              <li>Use only links published on this website or the official <code>@ArchemystLab</code> account.</li>
              <li>Never share a seed phrase, private key, or wallet recovery phrase.</li>
              <li>Verify network and contract information against this documentation before interacting.</li>
              <li>Treat unannounced tokens, mints, and direct messages as unaffiliated.</li>
            </ul>
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
