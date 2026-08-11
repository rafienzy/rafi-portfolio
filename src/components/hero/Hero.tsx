'use client'

import { useEffect, useRef } from 'react'
import { selectionStore } from '@/lib/selection-store'
import { transformStore, correctionBus, CorrectionReason } from '@/lib/transform-store'
import { navigateWithTransition } from '@/lib/page-transition'
import HeroIcons3D from './HeroIcons3D'
import { HandRaisedIcon } from '@heroicons/react/24/solid'

type Msg = { msg: string; emoji: string }

function pick(arr: Msg[]): Msg {
  return arr[Math.floor(Math.random() * arr.length)]
}

const DRAG_MESSAGES: Record<string, Msg[]> = {
  'el-eyebrow': [
    { msg: "Bro, that's my page title.",             emoji: '😑' },
    { msg: "Where are you even taking it?",          emoji: '🤨' },
    { msg: "That's not where that goes bro.",        emoji: '😒' },
    { msg: "Come on, put it back.",                  emoji: '😤' },
  ],
  'el-headline': [
    { msg: "Bro. That's literally my name.",         emoji: '🙄' },
    { msg: "Stop moving my name around.",            emoji: '😤' },
    { msg: "Why would you do that.",                 emoji: '😑' },
    { msg: "Put my name back bro.",                  emoji: '😒' },
  ],
  'el-subtext': [
    { msg: "Now no one knows what I do.",            emoji: '😤' },
    { msg: "Bro, that's my description.",            emoji: '😑' },
    { msg: "How are they gonna know who I am?",      emoji: '🤨' },
    { msg: "Put it back where you found it.",        emoji: '😒' },
  ],
  'el-hint': [
    { msg: "HOW DARE YOU",                           emoji: '😤' },
    { msg: "You really said 'i dare you' huh.",      emoji: '🙄' },
    { msg: "I literally told you not to.",           emoji: '😑' },
    { msg: "Really bro, really?",                    emoji: '😒' },
  ],
  'fi-ai':    [{ msg: "Don't move my Illustrator bro.",      emoji: '😑' }, { msg: "Bro, that's my tool not a toy.",   emoji: '😒' }, { msg: "Put Illustrator back.",            emoji: '😤' }],
  'fi-ps':    [{ msg: "Photoshop goes where I put it.",      emoji: '😑' }, { msg: "Don't touch my PS bro.",           emoji: '😒' }, { msg: "Why are you moving Photoshop.",    emoji: '🤨' }],
  'fi-ae':    [{ msg: "After Effects is not a toy.",         emoji: '😑' }, { msg: "Put AE back bro.",                 emoji: '😒' }, { msg: "That's my motion tool, hands off.",emoji: '😤' }],
  'fi-figma': [{ msg: "Don't move Figma, I need that.",      emoji: '😑' }, { msg: "Figma stays where it is bro.",     emoji: '😒' }, { msg: "Why are you like this.",           emoji: '🤨' }],
  'fi-html':  [{ msg: "Even HTML5 didn't deserve this.",     emoji: '😑' }, { msg: "Stop moving my tools around.",     emoji: '😒' }, { msg: "Put HTML back bro.",               emoji: '😤' }],
}

const SCALE_MESSAGES: Record<string, { tooBig: Msg[]; tooSmall: Msg[] }> = {
  'el-eyebrow': {
    tooBig: [
      { msg: "Aight bro, what the flip.",            emoji: '😤' },
      { msg: "I'm working so hard for this.",        emoji: '😩' },
      { msg: "Why so big?",                          emoji: '🤨' },
      { msg: "You messed up my design.",             emoji: '😤' },
    ],
    tooSmall: [
      { msg: "Can you even read it?",                emoji: '😑' },
      { msg: "Bro, even ants complaining about this.",emoji: '😒' },
      { msg: "You think you are funny huh?",         emoji: '🙄' },
      { msg: "haha, smoll like your pp.",            emoji: '😭' },
    ],
  },
  'el-headline': {
    tooBig: [
      { msg: "Way too big my dude.",                 emoji: '🤨' },
      { msg: "Stop it!",                             emoji: '😤' },
      { msg: "That's enough man.",                   emoji: '😑' },
      { msg: "Yeah, no!",                            emoji: '😒' },
    ],
    tooSmall: [
      { msg: "haha, smoll like your pp.",            emoji: '😭' },
      { msg: "This is a headline, supposed to be big.", emoji: '😤' },
      { msg: "Antman not approving this.",           emoji: '😑' },
      { msg: "Can you even read it?",                emoji: '🙄' },
    ],
  },
  'el-subtext': {
    tooBig: [
      { msg: "Nope, too big!",                       emoji: '😑' },
      { msg: "This is meant to be small!",           emoji: '😤' },
      { msg: "What are you doing??",                 emoji: '🤨' },
      { msg: "nooo….",                               emoji: '😩' },
    ],
    tooSmall: [
      { msg: "This text is already small bro.",      emoji: '😤' },
      { msg: "This ain't your pp.",                  emoji: '😭' },
      { msg: "Why so smoll.",                        emoji: '😒' },
      { msg: "Way too small buddy.",                 emoji: '🙄' },
    ],
  },
  'el-hint': {
    tooBig: [
      { msg: "nope, just nope…",                     emoji: '😑' },
      { msg: "Too much!",                            emoji: '😤' },
      { msg: "This is meant to be small.",           emoji: '🤨' },
      { msg: "Bro. Really?",                         emoji: '😒' },
    ],
    tooSmall: [
      { msg: "I can't even read it on normal size.", emoji: '😑' },
      { msg: "What are you doing?",                  emoji: '🤨' },
      { msg: "How dare you…",                        emoji: '😤' },
      { msg: "STOP BRO..",                           emoji: '😤' },
    ],
  },
  'fi-ai': {
    tooBig:   [{ msg: "Illustrator icon is not a billboard.",  emoji: '😑' }, { msg: "Way too big bro.",                 emoji: '🤨' }, { msg: "Calm down with the scaling.",      emoji: '😒' }],
    tooSmall: [{ msg: "Can you even see that?",                emoji: '😑' }, { msg: "AI icon is not your pp bro.",      emoji: '😭' }, { msg: "Too small man.",                   emoji: '😒' }],
  },
  'fi-ps': {
    tooBig:   [{ msg: "Photoshop icon is not a poster bro.",   emoji: '😑' }, { msg: "That's way too big man.",          emoji: '🤨' }, { msg: "Stop stretching my tools.",        emoji: '😒' }],
    tooSmall: [{ msg: "PS icon is not your pp bro.",           emoji: '😭' }, { msg: "Too small, I can barely see it.", emoji: '😑' }, { msg: "Why so smoll.",                    emoji: '😒' }],
  },
  'fi-ae': {
    tooBig:   [{ msg: "After Effects is not a banner.",        emoji: '😑' }, { msg: "AE icon is not that big bro.",    emoji: '🤨' }, { msg: "Way too much man.",                emoji: '😒' }],
    tooSmall: [{ msg: "Can you even see AE anymore?",          emoji: '😑' }, { msg: "AE icon is not your pp bro.",     emoji: '😭' }, { msg: "Too small bro.",                   emoji: '😒' }],
  },
  'fi-figma': {
    tooBig:   [{ msg: "Figma icon is not a billboard.",        emoji: '😑' }, { msg: "That's too big man.",             emoji: '🤨' }, { msg: "Stop it with the scaling bro.",    emoji: '😒' }],
    tooSmall: [{ msg: "Figma icon is not your pp.",            emoji: '😭' }, { msg: "I can barely see it.",            emoji: '😑' }, { msg: "Why so tiny bro.",                 emoji: '😒' }],
  },
  'fi-html': {
    tooBig:   [{ msg: "HTML5 is not a banner bro.",            emoji: '😑' }, { msg: "That's way too big.",             emoji: '🤨' }, { msg: "Calm down.",                       emoji: '😒' }],
    tooSmall: [{ msg: "HTML5 is not your pp bro.",             emoji: '😭' }, { msg: "Too small man.",                  emoji: '😑' }, { msg: "Why are you like this.",           emoji: '😒' }],
  },
}

const ROTATE_MESSAGES: Record<string, { tilted: Msg[]; sideways: Msg[]; upsideDown: Msg[] }> = {
  'el-eyebrow': {
    tilted: [
      { msg: "Are you sideways right now?",          emoji: '😒' },
      { msg: "Can you even read it by doing this?",  emoji: '🙄' },
      { msg: "What are you even doing bro?",         emoji: '😑' },
      { msg: "Come on, really?",                     emoji: '😤' },
    ],
    sideways: [
      { msg: "Are you sideways right now?",          emoji: '😒' },
      { msg: "Can you even read it by doing this?",  emoji: '🙄' },
      { msg: "What are you even doing bro?",         emoji: '😑' },
      { msg: "Come on, really?",                     emoji: '😤' },
    ],
    upsideDown: [
      { msg: "huh?",                                 emoji: '😶' },
      { msg: "Are you a demogorgon?",                emoji: '😮' },
      { msg: "Even Eleven doesn't like this.",       emoji: '😑' },
      { msg: "Stop it!",                             emoji: '😤' },
    ],
  },
  'el-headline': {
    tilted: [
      { msg: "Yeah bro, no.",                        emoji: '😑' },
      { msg: "Nope, undo!",                          emoji: '😤' },
      { msg: "Maybe rotate your screen instead.",    emoji: '🙄' },
      { msg: "So funny bro, I laugh.",               emoji: '😒' },
    ],
    sideways: [
      { msg: "Yeah bro, no.",                        emoji: '😑' },
      { msg: "Nope, undo!",                          emoji: '😤' },
      { msg: "Maybe rotate your screen instead.",    emoji: '🙄' },
      { msg: "So funny bro, I laugh.",               emoji: '😒' },
    ],
    upsideDown: [
      { msg: "What? You think I'm Australian?",      emoji: '🙄' },
      { msg: "Even Vecna hates this.",               emoji: '😤' },
      { msg: "What, you think this is Stranger Things?", emoji: '😒' },
      { msg: "You think you are funny huh?",         emoji: '😑' },
    ],
  },
  'el-subtext': {
    tilted: [
      { msg: "I can't even read it this way.",       emoji: '😑' },
      { msg: "What do you mean???",                  emoji: '🤨' },
      { msg: "Aight bro, stop.",                     emoji: '😤' },
      { msg: "Nope, undo!",                          emoji: '😒' },
    ],
    sideways: [
      { msg: "I can't even read it this way.",       emoji: '😑' },
      { msg: "What do you mean???",                  emoji: '🤨' },
      { msg: "Aight bro, stop.",                     emoji: '😤' },
      { msg: "Nope, undo!",                          emoji: '😒' },
    ],
    upsideDown: [
      { msg: "What is this?",                        emoji: '😶' },
      { msg: "But why?",                             emoji: '🤨' },
      { msg: "Are you Australian?",                  emoji: '🙄' },
      { msg: "People from Sydney approve this, but I don't.", emoji: '😒' },
    ],
  },
  'el-hint': {
    tilted: [
      { msg: "How dare you…",                        emoji: '😤' },
      { msg: "Really bro…",                          emoji: '😑' },
      { msg: "Aight, what the flip.",                emoji: '😒' },
      { msg: "You are so funny…",                    emoji: '🙄' },
    ],
    sideways: [
      { msg: "How dare you…",                        emoji: '😤' },
      { msg: "Really bro…",                          emoji: '😑' },
      { msg: "Aight, what the flip.",                emoji: '😒' },
      { msg: "You are so funny…",                    emoji: '🙄' },
    ],
    upsideDown: [
      { msg: "You are really something.",            emoji: '😒' },
      { msg: "How dare you…",                        emoji: '😤' },
      { msg: "Really?",                              emoji: '🙄' },
      { msg: "Nope, nope, nope.",                    emoji: '😑' },
    ],
  },
  'fi-ai': {
    tilted:     [{ msg: "Illustrator doesn't lean bro.",       emoji: '😑' }, { msg: "Rotate your head not my tools.", emoji: '😒' }, { msg: "Come on bro.",                     emoji: '😤' }],
    sideways:   [{ msg: "Why is Illustrator sideways.",        emoji: '🤨' }, { msg: "Rotate your screen not my icon.",emoji: '😒' }, { msg: "Bro, seriously.",                  emoji: '😑' }],
    upsideDown: [{ msg: "Even Adobe didn't expect this.",      emoji: '😮' }, { msg: "Upside down Illustrator, really?",emoji: '🙄' }, { msg: "What is wrong with you bro.",      emoji: '😒' }],
  },
  'fi-ps': {
    tilted:     [{ msg: "Photoshop doesn't tilt bro.",         emoji: '😑' }, { msg: "Stop tilting my tools.",         emoji: '😒' }, { msg: "Come on man.",                     emoji: '😤' }],
    sideways:   [{ msg: "Why is Photoshop sideways.",          emoji: '🤨' }, { msg: "PS goes horizontal bro.",        emoji: '😒' }, { msg: "Aight bro, no.",                   emoji: '😑' }],
    upsideDown: [{ msg: "Upside down Photoshop. Really.",      emoji: '🙄' }, { msg: "Adobe is crying right now.",     emoji: '😒' }, { msg: "Why bro, just why.",               emoji: '🤨' }],
  },
  'fi-ae': {
    tilted:     [{ msg: "After Effects doesn't lean.",         emoji: '😑' }, { msg: "Stop tilting AE bro.",           emoji: '😒' }, { msg: "Really man.",                      emoji: '😤' }],
    sideways:   [{ msg: "AE sideways? Come on.",               emoji: '🤨' }, { msg: "That's not how motion works bro.",emoji: '😒' }, { msg: "Nope, undo.",                      emoji: '😑' }],
    upsideDown: [{ msg: "AE upside down. You wild.",           emoji: '🙄' }, { msg: "Adobe After Effects is crying.", emoji: '😒' }, { msg: "What are you doing bro.",          emoji: '🤨' }],
  },
  'fi-figma': {
    tilted:     [{ msg: "Figma doesn't tilt bro.",             emoji: '😑' }, { msg: "Stop tilting my design tool.",   emoji: '😒' }, { msg: "Come on man.",                     emoji: '😤' }],
    sideways:   [{ msg: "Figma sideways? Really bro.",         emoji: '🤨' }, { msg: "Design tools go horizontal.",    emoji: '😒' }, { msg: "Nope.",                            emoji: '😑' }],
    upsideDown: [{ msg: "Figma upside down. You good?",        emoji: '🙄' }, { msg: "Even designers hate you now.",   emoji: '😒' }, { msg: "Why would you do this.",           emoji: '🤨' }],
  },
  'fi-html': {
    tilted:     [{ msg: "HTML5 doesn't lean bro.",             emoji: '😑' }, { msg: "Stop tilting my tools.",         emoji: '😒' }, { msg: "Aight man, no.",                   emoji: '😤' }],
    sideways:   [{ msg: "HTML5 sideways. Classic.",            emoji: '🤨' }, { msg: "The internet is crying bro.",    emoji: '😒' }, { msg: "Nope, undo.",                      emoji: '😑' }],
    upsideDown: [{ msg: "HTML upside down. You wild bro.",     emoji: '🙄' }, { msg: "Tim Berners-Lee is crying.",     emoji: '😒' }, { msg: "What is wrong with you.",          emoji: '🤨' }],
  },
}

function getScaleMsg(id: string, scale: number): Msg {
  const entry = SCALE_MESSAGES[id]
  if (!entry) return { msg: "Please don't do that.", emoji: '😐' }
  const pool = scale > 1 ? entry.tooBig : entry.tooSmall
  return pick(pool)
}

function getRotateMsg(id: string, rotation: number): Msg {
  const entry = ROTATE_MESSAGES[id]
  if (!entry) return { msg: "Please don't do that.", emoji: '😐' }
  const norm = ((rotation % 360) + 360) % 360
  if (norm >= 150 && norm <= 210) return pick(entry.upsideDown)
  if ((norm >= 60 && norm <= 120) || (norm >= 240 && norm <= 300)) return pick(entry.sideways)
  return pick(entry.tilted)
}

function CtaButton() {
  const btnRef   = useRef<HTMLButtonElement>(null)
  const target   = useRef({ x: 50, y: 50 })
  const current  = useRef({ x: 50, y: 50 })
  const rafRef   = useRef<number>(0)
  const hovering = useRef(false)

  useEffect(() => {
    const EASE = 0.072

    function tick() {
      const btn = btnRef.current
      if (!btn) return

      current.current.x += (target.current.x - current.current.x) * EASE
      current.current.y += (target.current.y - current.current.y) * EASE

      btn.style.setProperty('--mx', `${current.current.x.toFixed(2)}%`)
      btn.style.setProperty('--my', `${current.current.y.toFixed(2)}%`)

      // Stop loop once close enough to target (idle)
      const dx = Math.abs(target.current.x - current.current.x)
      const dy = Math.abs(target.current.y - current.current.y)
      if (dx < 0.05 && dy < 0.05) {
        btn.style.setProperty('--mx', `${target.current.x}%`)
        btn.style.setProperty('--my', `${target.current.y}%`)
        rafRef.current = 0
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    function startLoop() {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick)
    }

    // Expose startLoop so event handlers can kick it off
    ;(btnRef.current as HTMLButtonElement & { _startLoop?: () => void })!._startLoop = startLoop

    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  function onMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = btnRef.current as (HTMLButtonElement & { _startLoop?: () => void }) | null
    if (!btn) return
    hovering.current = true
    const r = btn.getBoundingClientRect()
    target.current.x = ((e.clientX - r.left) / r.width)  * 100
    target.current.y = ((e.clientY - r.top)  / r.height) * 100
    btn._startLoop?.()
  }

  function onMouseLeave() {
    hovering.current = false
    target.current = { x: 50, y: 50 };
    (btnRef.current as HTMLButtonElement & { _startLoop?: () => void })?._startLoop?.()
  }

  return (
    <button
      ref={btnRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={() => navigateWithTransition('/work')}
      className="cta-btn"
      style={{
        '--mx': '50%', '--my': '50%',
        color: '#000000',
        fontSize: 'clamp(15px, 2vw, 20px)', fontWeight: 700, letterSpacing: '-0.04em',
        padding: 'clamp(12px, 1.5vw, 16px) clamp(28px, 4vw, 50px)', borderRadius: '37px',
        border: 'none', fontFamily: 'inherit', whiteSpace: 'nowrap',
        cursor: 'pointer',
      } as React.CSSProperties}
    >
      See My Work
    </button>
  )
}

function getDragMsg(id: string): Msg {
  const pool = DRAG_MESSAGES[id]
  if (!pool) return { msg: "Please don't do that.", emoji: '😐' }
  return pick(pool)
}

function runSpring(
  getPos: () => { x: number; y: number },
  setPos: (x: number, y: number) => void,
  tx: number, ty: number,
  k: number, d: number,
  onDone?: () => void
) {
  let { x, y } = getPos()
  let vx = 0, vy = 0
  function step() {
    vx = (vx + (tx - x) * k) * d
    vy = (vy + (ty - y) * k) * d
    x += vx; y += vy
    setPos(x, y)
    if (Math.abs(tx - x) < 0.5 && Math.abs(ty - y) < 0.5 && Math.abs(vx) < 0.1) {
      setPos(tx, ty); onDone?.(); return
    }
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

export default function Hero() {
  const heroRef     = useRef<HTMLDivElement>(null)
  const cursorRef   = useRef<HTMLDivElement>(null)
  const cursorLabel = useRef<HTMLDivElement>(null)
  const toastRef    = useRef<HTMLDivElement>(null)
  const toastEmoji  = useRef<HTMLSpanElement>(null)
  const toastMsg    = useRef<HTMLSpanElement>(null)

  const origPos      = useRef<Record<string, { left: number; top: number }>>({})
  const isCorrecting = useRef(false)
  const activeDrag   = useRef<HTMLElement | null>(null)
  const dOff         = useRef({ x: 0, y: 0 })
  const dragMoved    = useRef(false)
  const cursorPos    = useRef({ x: -300, y: -300 })

  useEffect(() => {
    // Drag interaction is desktop-only — touch devices keep CSS percentage positions
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) return

    const hero = heroRef.current!
    const draggables = Array.from(hero.querySelectorAll<HTMLElement>('.draggable'))

    function initPos() {
      const hr = hero.getBoundingClientRect()
      draggables.forEach(el => {
        const t = transformStore.get(el.id)
        const hasTransform = t.scale !== 1 || t.rotation !== 0

        if (hasTransform) {
          // Temporarily clear transform to measure true layout position
          el.style.transform = 'none'
          const r = el.getBoundingClientRect()
          origPos.current[el.id] = { left: r.left - hr.left, top: r.top - hr.top }
          el.style.left   = origPos.current[el.id].left + 'px'
          el.style.top    = origPos.current[el.id].top  + 'px'
          el.style.bottom = 'auto'; el.style.right = 'auto'; el.style.margin = '0'
          // Restore scale/rotation
          el.style.transform = `scale(${t.scale}) rotate(${t.rotation}deg)`
        } else {
          // Measure with existing transform (translateX(-50%) on first load)
          const r = el.getBoundingClientRect()
          origPos.current[el.id] = { left: r.left - hr.left, top: r.top - hr.top }
          el.style.left      = origPos.current[el.id].left + 'px'
          el.style.top       = origPos.current[el.id].top  + 'px'
          el.style.transform = 'none'
          el.style.bottom    = 'auto'; el.style.right = 'auto'; el.style.margin = '0'
        }
      })
    }
    document.fonts.ready.then(initPos)
    setTimeout(initPos, 250)
    window.addEventListener('resize', initPos)

    function triggerCorrection(el: HTMLElement) {
      if (isCorrecting.current) return
      isCorrecting.current = true
      selectionStore.set(null)
      el.classList.add('correcting')
      window.dispatchEvent(new CustomEvent('rafi-correct'))

      const cfg  = getDragMsg(el.id)
      const orig = origPos.current[el.id]
      const hr   = hero.getBoundingClientRect()
      const cur  = cursorRef.current!
      const lbl  = cursorLabel.current!
      const tst  = toastRef.current!

      const elVX = hr.left + parseFloat(el.style.left)
      const elVY = hr.top  + parseFloat(el.style.top)

      toastEmoji.current!.textContent = cfg.emoji
      toastMsg.current!.textContent   = cfg.msg
      tst.style.left      = Math.min(Math.max(elVX, 12), window.innerWidth - 290) + 'px'
      tst.style.top       = Math.max(elVY - 58, 90) + 'px'
      tst.style.opacity   = '1'
      tst.style.transform = 'translateY(0)'

      cursorPos.current = { x: window.innerWidth + 60, y: window.innerHeight * 0.4 }
      cur.style.left    = cursorPos.current.x + 'px'
      cur.style.top     = cursorPos.current.y + 'px'
      lbl.textContent   = 'Rafi · fixing this...'

      setTimeout(() => {
        cur.style.opacity = '1'

        runSpring(
          () => cursorPos.current,
          (x, y) => { cursorPos.current = { x, y }; cur.style.left = x + 'px'; cur.style.top = y + 'px' },
          elVX - 14, elVY - 10, 0.014, 0.86,
          () => {
            lbl.textContent = 'Rafi · dragging...'
            const r0 = el.getBoundingClientRect()
            selectionStore.set({ x: r0.left, y: r0.top, w: r0.width, h: r0.height, id: el.id })
            setTimeout(() => {
              const destVX = hr.left + orig.left - 14
              const destVY = hr.top  + orig.top  - 10

              runSpring(
                () => ({ x: parseFloat(el.style.left), y: parseFloat(el.style.top) }),
                (x, y) => {
                  el.style.left = x + 'px'; el.style.top = y + 'px'
                  const r1 = el.getBoundingClientRect()
                  selectionStore.set({ x: r1.left, y: r1.top, w: r1.width, h: r1.height, id: el.id })
                },
                orig.left, orig.top, 0.06, 0.78
              )

              runSpring(
                () => cursorPos.current,
                (x, y) => { cursorPos.current = { x, y }; cur.style.left = x + 'px'; cur.style.top = y + 'px' },
                destVX, destVY, 0.022, 0.84,
                () => {
                  lbl.textContent = 'Rafi · done ✓'
                  const baseX = parseFloat(cur.style.left)
                  const wseq  = [3, -4, 3, -2, 1, 0]
                  let wi = 0
                  function wiggle() {
                    if (wi >= wseq.length) {
                      setTimeout(() => {
                        runSpring(
                          () => cursorPos.current,
                          (x, y) => { cursorPos.current = { x, y }; cur.style.left = x + 'px'; cur.style.top = y + 'px' },
                          window.innerWidth + 90, parseFloat(cur.style.top), 0.042, 0.84,
                          () => { cur.style.opacity = '0' }
                        )
                      }, 400)
                      return
                    }
                    cur.style.left = (baseX + wseq[wi]) + 'px'
                    wi++; setTimeout(wiggle, 65)
                  }
                  wiggle()

                  setTimeout(() => {
                    tst.style.opacity   = '0'
                    tst.style.transform = 'translateY(8px)'
                    el.classList.remove('correcting')
                    selectionStore.set(null)
                    isCorrecting.current = false
                  }, 1200)
                }
              )
            }, 450)
          }
        )
      }, 220)
    }

    function triggerTransformCorrection(el: HTMLElement, reason: CorrectionReason) {
      if (isCorrecting.current) return
      isCorrecting.current = true
      selectionStore.set(null)
      el.classList.add('correcting')
      window.dispatchEvent(new CustomEvent('rafi-correct'))

      const { scale, rotation } = transformStore.get(el.id)
      const cfg = reason === 'scale'
        ? getScaleMsg(el.id, scale)
        : getRotateMsg(el.id, rotation)
      const cur  = cursorRef.current!
      const lbl  = cursorLabel.current!
      const tst  = toastRef.current!

      // Use getBoundingClientRect so the cursor targets the actual visual
      // top-left corner of the element after scale/rotation is applied
      const rect = el.getBoundingClientRect()
      const elVX = rect.left
      const elVY = rect.top

      toastEmoji.current!.textContent = cfg.emoji
      toastMsg.current!.textContent   = cfg.msg
      tst.style.left      = Math.min(Math.max(elVX, 12), window.innerWidth - 290) + 'px'
      tst.style.top       = Math.max(elVY - 58, 90) + 'px'
      tst.style.opacity   = '1'
      tst.style.transform = 'translateY(0)'

      cursorPos.current = { x: window.innerWidth + 60, y: window.innerHeight * 0.4 }
      cur.style.left    = cursorPos.current.x + 'px'
      cur.style.top     = cursorPos.current.y + 'px'
      lbl.textContent   = 'Rafi · fixing this...'

      setTimeout(() => {
        cur.style.opacity = '1'

        runSpring(
          () => cursorPos.current,
          (x, y) => { cursorPos.current = { x, y }; cur.style.left = x + 'px'; cur.style.top = y + 'px' },
          elVX - 14, elVY - 10, 0.014, 0.86,
          () => {
            lbl.textContent = 'Rafi · resetting...'
            const r0 = el.getBoundingClientRect()
            selectionStore.set({ x: r0.left, y: r0.top, w: r0.width, h: r0.height, id: el.id })

            let { scale: sv, rotation: rv } = transformStore.get(el.id)
            function tweenTransform() {
              sv += (1 - sv) * 0.06
              rv += (0 - rv) * 0.06
              if (Math.abs(1 - sv) < 0.001 && Math.abs(rv) < 0.1) {
                sv = 1; rv = 0
                el.style.transform = 'none'
                transformStore.set(el.id, { scale: 1, rotation: 0 })
                const r1 = el.getBoundingClientRect()
                selectionStore.set({ x: r1.left, y: r1.top, w: r1.width, h: r1.height, id: el.id })

                lbl.textContent = 'Rafi · done ✓'
                const baseX = parseFloat(cur.style.left)
                const wseq  = [3, -4, 3, -2, 1, 0]
                let wi = 0
                function wiggle() {
                  if (wi >= wseq.length) {
                    setTimeout(() => {
                      runSpring(
                        () => cursorPos.current,
                        (x, y) => { cursorPos.current = { x, y }; cur.style.left = x + 'px'; cur.style.top = y + 'px' },
                        window.innerWidth + 90, parseFloat(cur.style.top), 0.042, 0.84,
                        () => { cur.style.opacity = '0' }
                      )
                    }, 400)
                    return
                  }
                  cur.style.left = (baseX + wseq[wi]) + 'px'
                  wi++; setTimeout(wiggle, 65)
                }
                wiggle()

                setTimeout(() => {
                  tst.style.opacity   = '0'
                  tst.style.transform = 'translateY(8px)'
                  el.classList.remove('correcting')
                  selectionStore.set(null)
                  isCorrecting.current = false
                }, 1200)
                return
              }
              el.style.transform = `scale(${sv}) rotate(${rv}deg)`
              transformStore.set(el.id, { scale: sv, rotation: rv })
              const r2 = el.getBoundingClientRect()
              selectionStore.set({ x: r2.left, y: r2.top, w: r2.width, h: r2.height, id: el.id })
              // Cursor follows the actual top-left corner as element restores
              cursorPos.current = { x: r2.left - 14, y: r2.top - 10 }
              cur.style.left = (r2.left - 14) + 'px'
              cur.style.top  = (r2.top  - 10) + 'px'
              requestAnimationFrame(tweenTransform)
            }
            tweenTransform()
          }
        )
      }, 180)
    }

    const unsubCorrection = correctionBus.onRequest((id, reason) => {
      const el = hero.querySelector<HTMLElement>(`#${id}`)
      if (el) triggerTransformCorrection(el, reason)
    })

    draggables.forEach(el => {
      el.addEventListener('mousedown', (e) => {
        if (isCorrecting.current) return
        e.preventDefault()

        if (!origPos.current[el.id]) {
          const hr = hero.getBoundingClientRect()
          const r  = el.getBoundingClientRect()
          origPos.current[el.id] = { left: r.left - hr.left, top: r.top - hr.top }
          el.style.left   = origPos.current[el.id].left + 'px'
          el.style.top    = origPos.current[el.id].top  + 'px'
          el.style.bottom = 'auto'
          el.style.right  = 'auto'
        }

        // Preserve scale/rotation, only clear translateX from initial layout
        transformStore.applyStyle(el)

        activeDrag.current = el
        dragMoved.current  = false
        el.classList.add('is-grabbed')
        window.dispatchEvent(new CustomEvent('element-drag'))
        const r = el.getBoundingClientRect()
        dOff.current = { x: (e as MouseEvent).clientX - r.left, y: (e as MouseEvent).clientY - r.top }

        // Select immediately on mousedown
        selectionStore.set({ x: r.left, y: r.top, w: r.width, h: r.height, id: el.id })
      })
    })

    // Click on empty hero background = deselect
    const heroDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.draggable')) {
        selectionStore.set(null)
      }
    }
    hero.addEventListener('mousedown', heroDown)

    const onMove = (e: MouseEvent) => {
      if (!activeDrag.current) return
      const hr = hero.getBoundingClientRect()
      const nx = e.clientX - hr.left - dOff.current.x
      const ny = e.clientY - hr.top  - dOff.current.y
      activeDrag.current.style.left = nx + 'px'
      activeDrag.current.style.top  = ny + 'px'
      const o = origPos.current[activeDrag.current.id]
      if (o && Math.sqrt((nx - o.left) ** 2 + (ny - o.top) ** 2) > 48) dragMoved.current = true

      // Live update selection overlay
      const r = activeDrag.current.getBoundingClientRect()
      selectionStore.set({ x: r.left, y: r.top, w: r.width, h: r.height, id: activeDrag.current.id })
    }

    const onUp = () => {
      if (!activeDrag.current) return
      const el = activeDrag.current
      activeDrag.current = null
      el.classList.remove('is-grabbed')
      if (dragMoved.current) {
        triggerCorrection(el)
      } else {
        // Click without drag — keep selection on element
        const r = el.getBoundingClientRect()
        selectionStore.set({ x: r.left, y: r.top, w: r.width, h: r.height, id: el.id })
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)

    return () => {
      window.removeEventListener('resize', initPos)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      hero.removeEventListener('mousedown', heroDown)
      unsubCorrection()
    }
  }, [])

  return (
    <>
      <section ref={heroRef} className="relative h-screen w-full z-10 overflow-hidden select-none">

        <HeroIcons3D sectionRef={heroRef} />

        <div id="el-eyebrow" className="draggable" style={{
          position: 'absolute', left: '50%', top: 'calc(50% - 148px)',
          transform: 'translateX(-50%)',
        }}>
          <p style={{
            fontSize: 'clamp(10px, 2.5vw, 13px)', fontWeight: 700,
            letterSpacing: 'clamp(4px, 2vw, 9.28px)',
            color: '#ffffff', textAlign: 'center', whiteSpace: 'nowrap',
          }}>PORTFOLIO</p>
        </div>

        <div id="el-headline" className="draggable" style={{
          position: 'absolute', left: '50%', top: 'calc(50% - 120px)',
          transform: 'translateX(-50%)',
        }}>
          <h1 style={{
            fontSize: 'clamp(36px, 10vw, 126px)', fontWeight: 700,
            letterSpacing: '-0.04em', color: '#ffffff',
            lineHeight: 1, textAlign: 'center', whiteSpace: 'nowrap',
          }}>RAFI ABDILLAH</h1>
        </div>

        <div id="el-subtext" className="draggable" style={{
          position: 'absolute', left: '50%', top: 'calc(50% + 30px)',
          transform: 'translateX(-50%)',
        }}>
          <p style={{
            fontSize: 'clamp(13px, 1.8vw, 16px)', fontWeight: 400, color: '#a8c4ae',
            letterSpacing: '-0.04em', lineHeight: 1.25,
            maxWidth: 'min(550px, 85vw)', textAlign: 'center',
          }}>
            Graphic & Motion Designer from Jakarta. Figma Enthusiast,<br />and your go-to design problem solver.
          </p>
        </div>

        <div id="el-cta" style={{
          position: 'absolute', left: '50%', top: 'calc(50% + 110px)',
          transform: 'translateX(-50%)',
        }}>
          <CtaButton />
        </div>

        {/* Hint — desktop only, draggable */}
        <div id="el-hint" className="draggable hidden md:flex" style={{
          position: 'absolute', bottom: '3%', left: '50%', transform: 'translateX(-50%)',
          fontSize: '0.66rem', letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.55)', zIndex: 10,
          whiteSpace: 'nowrap', animation: 'hpulse 3s ease-in-out infinite',
          alignItems: 'center', gap: 6,
        }}>
          <HandRaisedIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
          drag anything &nbsp;·&nbsp; i dare you
        </div>

        {/* Mobile static layout */}
        <div className="md:hidden absolute inset-0 flex flex-col items-center justify-center px-6 gap-4">
          <p style={{
            fontSize: '11px', fontWeight: 700,
            letterSpacing: '7px', color: '#ffffff', textAlign: 'center', whiteSpace: 'nowrap',
          }}>PORTFOLIO</p>
          <h1 style={{
            fontSize: 'clamp(36px, 12vw, 52px)', fontWeight: 700,
            letterSpacing: '-0.04em', color: '#ffffff',
            lineHeight: 1, textAlign: 'center', whiteSpace: 'nowrap',
          }}>RAFI ABDILLAH</h1>
          <p style={{
            fontSize: '14px', fontWeight: 400, color: '#a8c4ae',
            letterSpacing: '-0.02em', lineHeight: 1.45,
            maxWidth: '320px', textAlign: 'center',
          }}>
            Graphic & Motion Designer from Jakarta. Figma Enthusiast,<br />and your go-to design problem solver.
          </p>
          <button style={{
            backgroundColor: '#5CFF85', color: '#000000',
            fontSize: '17px', fontWeight: 700, letterSpacing: '-0.04em',
            padding: '14px 40px', borderRadius: '37px',
            border: 'none', fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}>
            See My Work
          </button>
        </div>
      </section>

      {/* Rafi Correction Cursor */}
      <div ref={cursorRef} style={{
        position: 'fixed', zIndex: 9998, pointerEvents: 'none',
        opacity: 0, transition: 'opacity 0.22s',
        display: 'flex', alignItems: 'flex-start', gap: 5,
        left: '-300px', top: '-300px',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cursor-rafi.png" alt="" width={22} height={22} draggable={false} />
        <div ref={cursorLabel} style={{
          marginTop: 18, background: '#5CFF85', color: '#000',
          fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
          padding: '5px 10px', borderRadius: 3,
          whiteSpace: 'nowrap', letterSpacing: '0.01em',
          boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
        }}>Rafi · fixing this...</div>
      </div>

      {/* Toast */}
      <div ref={toastRef} style={{
        position: 'fixed', zIndex: 9997, pointerEvents: 'none',
        background: 'rgba(1,25,16,0.96)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12, padding: '14px 20px', fontSize: '1rem', color: '#fff', fontWeight: 500,
        whiteSpace: 'nowrap', opacity: 0, transform: 'translateY(8px)',
        transition: 'opacity 0.22s, transform 0.22s', backdropFilter: 'blur(16px)',
        left: 0, top: 0,
      }}>
        <span ref={toastEmoji} />&nbsp;<span ref={toastMsg} />
      </div>

      <style>{`
        .draggable { position: absolute; cursor: grab; z-index: 10; user-select: none; will-change: left, top; }
        .draggable.is-grabbed { cursor: grabbing; z-index: 50; filter: drop-shadow(0 14px 30px rgba(0,0,0,0.5)); }
        .draggable.correcting { pointer-events: none; }
        @keyframes hpulse { 0%,100%{opacity:0.55} 50%{opacity:1} }
        @media (max-width: 767px) { .draggable { display: none !important; } #el-cta { display: none !important; } }

        .cta-btn {
          background: #5CFF85;
          transition: box-shadow 0.2s;
        }
        .cta-btn:hover {
          background: radial-gradient(circle at var(--mx) var(--my), #a8ffbe 0%, #5CFF85 45%, #2ecc5e 100%);
          box-shadow: 0 0 32px rgba(92,255,133,0.45);
        }
      `}</style>
    </>
  )
}
