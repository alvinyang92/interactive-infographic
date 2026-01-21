import { STEP_ORDER, STEP_DATA } from './data/steps-data.js'
import { escapeHtml } from './utils/escapeHtml.js'

export function initLifecycleMobile () {
  // mobile only
  if (window.matchMedia('(min-width: 768px)').matches) return

  const root = document.getElementById('lifecycleUI-mobile')
  if (!root) return

  // Prevent multiple init (transition can call twice)
  if (root.dataset.initedMobile === '1') return
  root.dataset.initedMobile = '1'

  /* =========================================================
     DOM refs
     ========================================================= */
  const dom = {
    root,

    // pills
    pillScroll: document.getElementById('mPillScroll'),
    stepPills: [...document.querySelectorAll('.mStepPill')],

    // card
    card: document.getElementById('mCard'),
    stepTitle: document.getElementById('mStepTitle'),
    stepSubtitle: document.getElementById('mStepSubtitle'),
    stepCounter: document.getElementById('mStepCounter'),
    stepImage: document.getElementById('mStepImage'),
    imageSwipeZone: document.getElementById('mImageSwipeZone'),
    exploreHint: document.getElementById('mExploreHint'),
    openDetails: document.getElementById('mOpenDetails'),

    // 3 facts strip
    factWhatValue: document.getElementById('mFactWhatValue'),
    factStatusValue: document.getElementById('mFactStatusValue'),
    factKeyLabel: document.getElementById('mFactKeyLabel'),
    factKeyValue: document.getElementById('mFactKeyValue'),

    // 2 more facts (NEW)
    fact3Label: document.getElementById('mFact3Label'),
    fact3Value: document.getElementById('mFact3Value'),
    fact4Label: document.getElementById('mFact4Label'),
    fact4Value: document.getElementById('mFact4Value'),

    // drawer
    drawer: document.getElementById('mDrawer'),
    drawerBackdrop: document.getElementById('mDrawerBackdrop'),
    drawerSheet: document.getElementById('mDrawerSheet'),
    drawerGrab: document.getElementById('mDrawerGrab'),
    drawerHeader: document.getElementById('mDrawerHeader'),
    drawerClose: document.getElementById('mDrawerClose'),
    drawerTitle: document.getElementById('mDrawerTitle'),
    drawerSummary: document.getElementById('mDrawerSummary'),
    drawerBody: document.getElementById('mDrawerBody'),
    btnPrev: document.getElementById('mBtnPrev'),
    btnNext: document.getElementById('mBtnNext')
  }

  // Guard: markup not present
  if (dom.stepPills.length === 0 || !dom.stepTitle || !dom.stepImage) return

  /* =========================================================
     State
     ========================================================= */
  const state = {
    mode: 'explore', // explore | walkthrough
    activeStepKey: getFirstStepKey()
  }

  /* =========================================================
     Helpers
     ========================================================= */
  function getFirstStepKey () {
    const fromPill = dom.stepPills[0]?.dataset?.step
    if (fromPill && STEP_DATA[fromPill]) return fromPill
    if (STEP_DATA.origin) return 'origin'
    return Object.keys(STEP_DATA)[0]
  }

  function clampKey (key) {
    if (key && STEP_DATA[key]) return key
    return getFirstStepKey()
  }

  function idxOf (key) {
    const idx = STEP_ORDER.indexOf(key)
    return idx >= 0 ? idx : 0
  }

  function dirBetween (fromKey, toKey) {
    const a = idxOf(fromKey)
    const b = idxOf(toKey)
    if (a === b) return 0
    // same direction rule you use elsewhere:
    // dir = -1 means forward (slide left), dir = 1 means back (slide right)
    return b > a ? -1 : 1
  }

  function keyByOffset (offset) {
    const nextIdx = idxOf(state.activeStepKey) + offset
    if (nextIdx < 0 || nextIdx >= STEP_ORDER.length) return null
    return STEP_ORDER[nextIdx]
  }

  function norm (s) {
    return String(s || '')
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
  }

  function findSection (d, includesAny = []) {
    const sections = d?.sections || []
    const targets = includesAny.map(norm)
    return (
      sections.find(sec => {
        const h = norm(sec.heading)
        return targets.some(t => h.includes(t))
      }) || null
    )
  }

  function firstItem (sec) {
    return sec?.items && sec.items[0] ? String(sec.items[0]) : ''
  }

  function setPillActive (stepKey) {
    dom.stepPills.forEach(pill => {
      const isActive = pill.dataset.step === stepKey
      pill.classList.toggle('bg-white/10', isActive)
      pill.classList.toggle('text-white/85', isActive)
      pill.classList.toggle('bg-white/5', !isActive)
      pill.classList.toggle('text-white/60', !isActive)
    })
  }

  function ensurePillVisible (stepKey) {
    const pill = dom.stepPills.find(p => p.dataset.step === stepKey)
    if (!pill) return
    try {
      pill.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      })
    } catch (_) {}
  }

  function setExploreHintVisible (visible) {
    if (!dom.exploreHint) return
    dom.exploreHint.classList.toggle('hidden', !visible)
  }

  /* =========================================================
     2 facts strategy
     ========================================================= */
  function pickSubtitle (d) {
    // summary is best for mobile
    if (d.summary) return d.summary
    const what = findSection(d, ['what happens', 'what'])
    return firstItem(what) || ''
  }

  function pickThreeFacts (stepKey, d) {
    // 1) What happens (always)
    const whatSec = findSection(d, ['what happens', 'what'])
    const whatValue = firstItem(whatSec) || '—'

    // 2) Key specs (label is ALWAYS "Key specs", but value can come from different headings)
    const keyHeadingByStep = {
      origin: ['origin', 'harvest', 'farm'],
      processing: ['key specs', 'spec', 'processing', 'method'],
      export: ['shipment', 'export', 'logistics'],
      roasting: ['roast', 'roasting', 'profile'],
      packaging: ['pack', 'packaging', 'qc', 'quality'],
      retail: ['brew', 'serve', 'retail', 'recipe']
    }

    const keySec = findSection(
      d,
      keyHeadingByStep[stepKey] || ['key specs', 'spec', 'details']
    )
    const keyValue = firstItem(keySec) || '—'

    // 3) Status (always)
    const statusSec = findSection(d, ['status'])
    const statusValue = firstItem(statusSec) || '—'

    return { whatValue, keyValue, statusValue }
  }

  /* =========================================================
     Render
     ========================================================= */
  function preloadImg (src) {
    return new Promise(resolve => {
      if (!src) return resolve(false)
      const im = new Image()
      im.onload = () => resolve(true)
      im.onerror = () => resolve(false)
      im.src = src
    })
  }

  function renderPreview (stepKey) {
    const key = clampKey(stepKey)
    const d = STEP_DATA[key]
    if (!d) return

    dom.stepTitle.innerHTML = escapeHtml(d.title)

    if (dom.stepSubtitle) {
      dom.stepSubtitle.innerHTML = escapeHtml(pickSubtitle(d))
    }

    if (d.img) dom.stepImage.src = d.img
    dom.stepImage.alt = d.title

    // ✅ step counter (Step 02 / 06)
    if (dom.stepCounter) {
      const current = idxOf(key) + 1
      const total = STEP_ORDER.length
      const pad2 = n => String(n).padStart(2, '0')
      dom.stepCounter.textContent = `Step ${pad2(current)} / ${pad2(total)}`
    }

    // ✅ unified 3-facts mapping
    const facts = pickThreeFacts(key, d)

    // 1) What happens
    if (dom.factWhatValue) dom.factWhatValue.textContent = facts.whatValue

    // 2) Key specs (fixed label, dynamic value)
    if (dom.factKeyLabel) dom.factKeyLabel.textContent = 'Key specs'
    if (dom.factKeyValue) dom.factKeyValue.textContent = facts.keyValue

    // 3) Status
    if (dom.factStatusValue) dom.factStatusValue.textContent = facts.statusValue

    setPillActive(key)
    ensurePillVisible(key)
    setExploreHintVisible(state.mode === 'explore')
  }

  function renderDrawer (stepKey) {
    const key = clampKey(stepKey)
    const d = STEP_DATA[key]
    if (!d) return

    if (dom.drawerTitle) dom.drawerTitle.textContent = d.title
    if (dom.drawerSummary) dom.drawerSummary.textContent = d.summary || ''

    const idx = idxOf(key)
    const isFirst = idx === 0
    const isLast = idx === STEP_ORDER.length - 1

    // Button labels
    if (dom.btnNext) dom.btnNext.textContent = isLast ? 'Complete' : 'Next step'

    // Step 01: hide Previous + make Next full width
    if (isFirst) {
      if (dom.btnPrev) dom.btnPrev.classList.add('hidden')

      if (dom.btnNext) {
        dom.btnNext.classList.remove('col-span-1')
        dom.btnNext.classList.add('col-span-2')
      }
    } else {
      // other steps: show Previous + 2 columns layout
      if (dom.btnPrev) dom.btnPrev.classList.remove('hidden')

      if (dom.btnNext) {
        dom.btnNext.classList.remove('col-span-2')
        dom.btnNext.classList.add('col-span-1')
      }
    }

    if (dom.drawerBody) {
      dom.drawerBody.innerHTML = `
        ${(d.sections || [])
          .map(sec => {
            const heading = escapeHtml(sec.heading || '')
            const items = (sec.items || []).slice(0, 4) // drawer can show more
            return `
              <div class="mt-4">
                <div class="text-sm font-semibold text-white/90">${heading}</div>
                <div class="mt-2 h-px bg-white/10"></div>
                <ul class="mt-3 space-y-2 text-sm text-white/70">
                  ${items
                    .map(
                      it => `
                        <li class="flex gap-2">
                          <span class="mt-[7px] h-[6px] w-[6px] rounded-full bg-white/25"></span>
                          <span>${escapeHtml(it)}</span>
                        </li>
                      `
                    )
                    .join('')}
                </ul>
              </div>
            `
          })
          .join('')}
      `
    }
  }

  /* =========================================================
     Drawer controls
     ========================================================= */
  function lockBodyScroll () {
    document.body.classList.add('overflow-hidden', 'touch-none')
  }

  function unlockBodyScroll () {
    document.body.classList.remove('overflow-hidden', 'touch-none')
  }

  function drawerOpen () {
    if (!dom.drawer) return
    lockBodyScroll()

    dom.drawer.classList.remove(
      'translate-y-full',
      'opacity-0',
      'pointer-events-none'
    )
    dom.drawer.classList.add(
      'translate-y-0',
      'opacity-100',
      'pointer-events-auto'
    )

    if (dom.drawerSheet) {
      dom.drawerSheet.style.transition = ''
      dom.drawerSheet.style.transform = 'translateY(0px)'
    }
  }

  function drawerClose () {
    if (!dom.drawer) return
    unlockBodyScroll()

    dom.drawer.classList.add(
      'translate-y-full',
      'opacity-0',
      'pointer-events-none'
    )
    dom.drawer.classList.remove(
      'translate-y-0',
      'opacity-100',
      'pointer-events-auto'
    )

    if (dom.drawerSheet) {
      dom.drawerSheet.style.transition = ''
      dom.drawerSheet.style.transform = 'translateY(0px)'
    }
  }

  function enterWalkthrough () {
    state.mode = 'walkthrough'
    renderDrawer(state.activeStepKey)
    drawerOpen()
    setExploreHintVisible(false)
  }

  function exitWalkthrough () {
    state.mode = 'explore'
    drawerClose()
    setExploreHintVisible(true)
  }

  /* =========================================================
     Main action
     ========================================================= */
  function openStep (stepKey, { keepDrawer = false } = {}) {
    const key = clampKey(stepKey)
    state.activeStepKey = key

    renderPreview(key)

    // Keep drawer behaviour consistent:
    // - If currently in walkthrough OR keepDrawer requested -> update drawer
    if (state.mode === 'walkthrough' || keepDrawer) {
      state.mode = 'walkthrough'
      renderDrawer(key)
      drawerOpen()
      setExploreHintVisible(false)
    }
  }

  function go (offset) {
    const nextKey = keyByOffset(offset)
    if (!nextKey) return
    openStep(nextKey, { keepDrawer: true })
  }

  function animateToStep (nextKey, dir, { keepDrawer = false } = {}) {
    const zone = dom.imageSwipeZone || dom.stepImage
    const img = dom.stepImage

    if (!nextKey || !img || !zone) {
      openStep(nextKey, { keepDrawer })
      return
    }

    if (img.dataset.animating === '1') return
    img.dataset.animating = '1'

    const OUT_MS = 180
    const IN_MS = 180
    const w = Math.max(1, zone.clientWidth || 320)

    // slide out
    img.style.transition = `transform ${OUT_MS}ms ease, opacity ${OUT_MS}ms ease`
    img.style.transform = `translateX(${dir * (w + 40)}px) rotate(${
      dir * 6
    }deg)`
    img.style.opacity = '0'

    const onOutEnd = async e => {
      // ✅ only react to ONE property, so we don't fire too early
      if (e && e.propertyName !== 'transform') return
      img.removeEventListener('transitionend', onOutEnd)

      // ✅ preload next image first (prevents flashing old frame)
      const nextData = STEP_DATA[clampKey(nextKey)]
      const nextSrc = nextData?.img
      await preloadImg(nextSrc)

      // ✅ update content while hidden
      openStep(nextKey, { keepDrawer })

      // jump to opposite side (instant)
      img.style.transition = 'none'
      img.style.transform = `translateX(${-dir * (w + 40)}px) rotate(${
        -dir * 6
      }deg)`
      img.style.opacity = '0'

      // animate in next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          img.style.transition = `transform ${IN_MS}ms ease, opacity ${IN_MS}ms ease`
          img.style.transform = 'translateX(0px) rotate(0deg)'
          img.style.opacity = '1'

          const onInEnd = ev => {
            if (ev && ev.propertyName !== 'transform') return
            img.removeEventListener('transitionend', onInEnd)
            img.dataset.animating = '0'
          }
          img.addEventListener('transitionend', onInEnd)
        })
      })
    }

    img.addEventListener('transitionend', onOutEnd)
  }

  /* =========================================================
     Swipe: image
     ========================================================= */
  function bindImageSwipe () {
    const zone = dom.imageSwipeZone || dom.stepImage
    const img = dom.stepImage
    if (!zone || !img) return

    let startX = 0
    let startY = 0
    let lastX = 0
    let dragging = false
    let swiping = false
    let animating = false

    const SWIPE_START = 10 // how soon we treat it as horizontal
    const SWIPE_TRIGGER = 70 // release threshold to change step
    const MAX_Y = 60 // if too vertical, let page scroll
    const OUT_MS = 180
    const IN_MS = 180

    function setInstant () {
      img.style.transition = 'none'
    }

    function setAnimate (ms) {
      img.style.transition = `transform ${ms}ms ease, opacity ${ms}ms ease`
    }

    function setDragStyle (dx) {
      // small rotate + fade, feels nice
      const w = Math.max(1, zone.clientWidth || 320)
      const p = Math.min(1, Math.abs(dx) / (w * 0.9))
      const rot = (dx / w) * 6 // degrees
      img.style.transform = `translateX(${dx}px) rotate(${rot}deg)`
      img.style.opacity = String(1 - p * 0.35)
    }

    function resetToCenter (ms = 160) {
      setAnimate(ms)
      img.style.transform = 'translateX(0px) rotate(0deg)'
      img.style.opacity = '1'
    }

    function slideOutThenIn (dir, nextKey) {
      if (animating) return
      animating = true

      // slide out
      setAnimate(OUT_MS)
      const w = Math.max(1, zone.clientWidth || 320)
      img.style.transform = `translateX(${dir * (w + 40)}px) rotate(${
        dir * 6
      }deg)`
      img.style.opacity = '0'

      const onOutEnd = () => {
        img.removeEventListener('transitionend', onOutEnd)

        // update content while hidden (prevents flicker)
        openStep(nextKey, { keepDrawer: state.mode === 'walkthrough' })

        // jump to opposite side (instant), then slide in
        setInstant()
        img.style.transform = `translateX(${-dir * (w + 40)}px) rotate(${
          -dir * 6
        }deg)`
        img.style.opacity = '0'

        // next frame -> animate in
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimate(IN_MS)
            img.style.transform = 'translateX(0px) rotate(0deg)'
            img.style.opacity = '1'

            const onInEnd = () => {
              img.removeEventListener('transitionend', onInEnd)
              animating = false
            }
            img.addEventListener('transitionend', onInEnd, { once: true })
          })
        })
      }

      img.addEventListener('transitionend', onOutEnd, { once: true })
    }

    function endSwipe (dx, dy) {
      if (!dragging) return
      dragging = false

      // if mostly vertical, just snap back
      if (Math.abs(dy) > MAX_Y) {
        resetToCenter()
        return
      }

      // decide if we change step
      if (Math.abs(dx) < SWIPE_TRIGGER) {
        resetToCenter()
        return
      }

      const dir = dx < 0 ? -1 : 1
      const nextKey = dir === -1 ? keyByOffset(1) : keyByOffset(-1)

      if (!nextKey) {
        resetToCenter()
        return
      }

      animateToStep(nextKey, dir, { keepDrawer: state.mode === 'walkthrough' })
    }

    // pointer events
    zone.addEventListener('pointerdown', e => {
      if (animating) return
      dragging = true
      swiping = false
      startX = e.clientX
      startY = e.clientY
      lastX = startX
      setInstant()
    })

    zone.addEventListener(
      'pointermove',
      e => {
        if (!dragging || animating) return

        const dx = e.clientX - startX
        const dy = e.clientY - startY
        lastX = e.clientX

        // decide if we are swiping horizontally
        if (!swiping) {
          if (Math.abs(dx) > SWIPE_START && Math.abs(dx) > Math.abs(dy)) {
            swiping = true
          } else {
            return // let vertical scroll happen naturally
          }
        }

        // horizontal drag visual
        setDragStyle(dx)

        // prevent page from scrolling while swiping
        e.preventDefault()
      },
      { passive: false }
    )

    zone.addEventListener('pointerup', e => {
      if (!dragging || animating) return
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      endSwipe(dx, dy)
    })

    zone.addEventListener('pointercancel', () => {
      if (!dragging || animating) return
      dragging = false
      resetToCenter()
    })

    // touch fallback (older iOS)
    zone.addEventListener(
      'touchstart',
      e => {
        if (animating) return
        const t = e.touches?.[0]
        if (!t) return
        dragging = true
        swiping = false
        startX = t.clientX
        startY = t.clientY
        setInstant()
      },
      { passive: true }
    )

    zone.addEventListener(
      'touchmove',
      e => {
        if (!dragging || animating) return
        const t = e.touches?.[0]
        if (!t) return
        const dx = t.clientX - startX
        const dy = t.clientY - startY

        if (!swiping) {
          if (Math.abs(dx) > SWIPE_START && Math.abs(dx) > Math.abs(dy)) {
            swiping = true
          } else {
            return
          }
        }

        setDragStyle(dx)
        e.preventDefault()
      },
      { passive: false }
    )

    zone.addEventListener(
      'touchend',
      e => {
        if (!dragging || animating) return
        const t = e.changedTouches?.[0]
        if (!t) return
        const dx = t.clientX - startX
        const dy = t.clientY - startY
        endSwipe(dx, dy)
      },
      { passive: true }
    )
  }

  /* =========================================================
     Swipe: drawer
     ========================================================= */
  function bindDrawerSwipe () {
    const sheet = dom.drawerSheet
    const grab = dom.drawerGrab
    if (!sheet || !grab) return

    let startY = 0
    let currentY = 0
    let dragging = false

    const CLOSE_TRIGGER = 90 // swipe distance to close
    const MAX_PULL = 420 // limit drag distance

    function setInstant () {
      sheet.style.transition = 'none'
    }

    function setAnimate (ms) {
      sheet.style.transition = `transform ${ms}ms ease`
    }

    function setTranslate (dy) {
      const y = Math.max(0, Math.min(MAX_PULL, dy))
      sheet.style.transform = `translateY(${y}px)`
      currentY = y
    }

    function snapBack () {
      setAnimate(180)
      sheet.style.transform = 'translateY(0px)'
      currentY = 0
    }

    function closeBySwipe () {
      // animate down then close the drawer
      setAnimate(160)
      sheet.style.transform = `translateY(${MAX_PULL}px)`

      const onEnd = () => {
        sheet.removeEventListener('transitionend', onEnd)
        exitWalkthrough() // uses your existing close flow
        // reset for next open
        sheet.style.transition = ''
        sheet.style.transform = 'translateY(0px)'
        currentY = 0
      }

      sheet.addEventListener('transitionend', onEnd, { once: true })
    }

    // Use POINTER events first (works on most devices)
    grab.addEventListener('pointerdown', e => {
      if (state.mode !== 'walkthrough') return
      dragging = true
      startY = e.clientY
      setInstant()
    })

    grab.addEventListener(
      'pointermove',
      e => {
        if (!dragging) return
        const dy = e.clientY - startY
        if (dy <= 0) {
          setTranslate(0)
          return
        }
        setTranslate(dy)
        e.preventDefault()
      },
      { passive: false }
    )

    grab.addEventListener('pointerup', e => {
      if (!dragging) return
      dragging = false

      const dy = e.clientY - startY
      if (dy > CLOSE_TRIGGER) {
        closeBySwipe()
      } else {
        snapBack()
      }
    })

    grab.addEventListener('pointercancel', () => {
      if (!dragging) return
      dragging = false
      snapBack()
    })

    // Touch fallback (older iOS)
    grab.addEventListener(
      'touchstart',
      e => {
        if (state.mode !== 'walkthrough') return
        const t = e.touches?.[0]
        if (!t) return
        dragging = true
        startY = t.clientY
        setInstant()
      },
      { passive: true }
    )

    grab.addEventListener(
      'touchmove',
      e => {
        if (!dragging) return
        const t = e.touches?.[0]
        if (!t) return
        const dy = t.clientY - startY
        if (dy <= 0) {
          setTranslate(0)
          return
        }
        setTranslate(dy)
        e.preventDefault()
      },
      { passive: false }
    )

    grab.addEventListener(
      'touchend',
      e => {
        if (!dragging) return
        dragging = false
        const t = e.changedTouches?.[0]
        if (!t) return
        const dy = t.clientY - startY
        if (dy > CLOSE_TRIGGER) {
          closeBySwipe()
        } else {
          snapBack()
        }
      },
      { passive: true }
    )
  }

  /* =========================================================
     Events
     ========================================================= */
  dom.stepPills.forEach(pill => {
    pill.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()

      const key = pill.dataset.step
      if (!key) return

      const nextKey = clampKey(key)
      const currentKey = state.activeStepKey
      if (nextKey === currentKey) return

      const dir = dirBetween(currentKey, nextKey)

      // if something weird (same index), fallback
      if (dir === 0) {
        openStep(nextKey, { keepDrawer: state.mode === 'walkthrough' })
        return
      }

      // ✅ same swipe animation as next/prev + keep drawer if currently open
      animateToStep(nextKey, dir, { keepDrawer: state.mode === 'walkthrough' })
    })
  })

  // Card tap opens drawer (optional, but nice)
  // if (dom.card) {
  //   dom.card.addEventListener('click', e => {
  //     const t = e.target
  //     if (t && t.closest && t.closest('button,a,input,textarea,select')) return
  //     e.preventDefault()
  //     enterWalkthrough()
  //   })
  // }

  // ✅ ONLY button opens drawer
  if (dom.openDetails) {
    dom.openDetails.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()
      enterWalkthrough()
    })
  }

  if (dom.drawerClose) {
    dom.drawerClose.addEventListener('click', e => {
      e.preventDefault()
      exitWalkthrough()
    })
  }

  if (dom.drawerBackdrop) {
    dom.drawerBackdrop.addEventListener('click', e => {
      e.preventDefault()
      exitWalkthrough()
    })
  }

  if (dom.btnPrev) {
    dom.btnPrev.addEventListener('click', e => {
      e.preventDefault()
      if (state.mode !== 'walkthrough') return

      const prevKey = keyByOffset(-1)
      if (!prevKey) return
      animateToStep(prevKey, 1, { keepDrawer: true })
    })
  }

  if (dom.btnNext) {
    dom.btnNext.addEventListener('click', e => {
      e.preventDefault()
      if (state.mode !== 'walkthrough') return

      const isLast = idxOf(state.activeStepKey) === STEP_ORDER.length - 1
      if (isLast) {
        exitWalkthrough()
        return
      }

      const nextKey = keyByOffset(1)
      if (!nextKey) return
      animateToStep(nextKey, -1, { keepDrawer: true })
    })
  }

  /* =========================================================
     Init
     ========================================================= */
  bindImageSwipe()
  bindDrawerSwipe()

  drawerClose()
  state.mode = 'explore'
  openStep(state.activeStepKey, { keepDrawer: false })
}