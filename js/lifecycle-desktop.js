import { STEP_ORDER, STEP_DATA } from './data/steps-data.js'
import { renderDrawerHtml } from './ui/render-drawer.js'
import { startBreathSteps, stopBreathSteps } from './transition/breath-steps.js'

// ✅ Per-step camera tweaks (px are screen pixels BEFORE divide by zoom)
const STEP_CAMERA_TWEAKS = {
  processing: { dx: -120, dy: 0, zoom: 1.38 }, // start here, tweak dx
  export: { dx: -210, dy: 0, zoom: 1.38 },
  roasting: { dx: -220, dy: 0, zoom: 1.38 } // move LEFT a bit
}

export function initLifecycleDesktop () {
  // Only run on desktop layout
  if (!window.matchMedia('(min-width: 768px)').matches) return

  /* =========================================================
     Breath sync (explore vs focused)
     ========================================================= */
  function syncBreathByMode () {
    if (isFocused()) {
      stopBreathSteps({ reset: true })
      return
    }
    // explore mode
    startBreathSteps({ selector: '#stageInner .step-tile img', amp: 4 })
  }

  /* =========================================================
     DOM refs
     ========================================================= */
  const dom = {
    stage: document.getElementById('stage'),
    stageInner: document.getElementById('stageInner'),

    drawer: document.getElementById('drawer'),
    drawerClose: document.getElementById('drawerClose'),
    drawerTitle: document.getElementById('drawerTitle'),
    drawerBody: document.getElementById('drawerBody'),

    stepsPanel: document.getElementById('stepsPanel'),

    btnRecenter: document.getElementById('btnRecenter'),
    btnExitFlow: document.getElementById('btnExitFlow'),

    topStepChip: document.getElementById('topStepChip'),
    topStepLabel: document.getElementById('topStepLabel'),
    topStepCurrent: document.getElementById('topStepCurrent'),
    topStepSlash: document.getElementById('topStepSlash'),
    topStepTotal: document.getElementById('topStepTotal'),

    tiles: [...document.querySelectorAll('.step-tile')],
    navBtns: [...document.querySelectorAll('.step-nav')]
  }

  if (
    !dom.stage ||
    !dom.stageInner ||
    !dom.drawer ||
    !dom.drawerTitle ||
    !dom.drawerBody
  )
    return

  /* =========================================================
     State
     ========================================================= */
  const state = {
    mode: 'explore', // 'explore' | 'focused'
    activeStepKey: null,
    focusedPose: null,
    basePose: null
  }

  const hasGSAP = typeof window !== 'undefined' && !!window.gsap

  /* =========================================================
     Stage mode helpers
     ========================================================= */
  function syncStageMode () {
    dom.stage.dataset.mode = state.mode
  }

  function isFocused () {
    return state.mode === 'focused'
  }

  function syncInteractionLock () {
    // when focused: disable pointer events on tiles so no hover tooltip / lift
    dom.stage.dataset.locked = isFocused() ? '1' : '0'
  }

  /* =========================================================
     Camera helpers
     ========================================================= */
  function setCameraVars (vars) {
    if (!vars) return
    if (vars.s != null) dom.stageInner.style.setProperty('--s', String(vars.s))
    if (vars.tx != null)
      dom.stageInner.style.setProperty('--tx', String(vars.tx))
    if (vars.ty != null)
      dom.stageInner.style.setProperty('--ty', String(vars.ty))
  }

  function killCameraTweens () {
    window?.gsap?.killTweensOf?.(dom.stageInner)
    dom.stage.dataset.animating = '0'
  }

  function animateCameraTo ({ s, tx, ty }, opts = {}) {
    const { duration = 0.6, ease = 'power2.out', onComplete } = opts

    if (!hasGSAP) {
      setCameraVars({ s, tx, ty })
      onComplete?.()
      return
    }

    window.gsap.killTweensOf(dom.stageInner)
    dom.stage.dataset.animating = '1'

    if (!duration) {
      window.gsap.set(dom.stageInner, {
        '--s': String(s),
        '--tx': String(tx),
        '--ty': String(ty)
      })
      dom.stage.dataset.animating = '0'
      onComplete?.()
      return
    }

    window.gsap.to(dom.stageInner, {
      duration,
      ease,
      overwrite: 'auto',
      '--s': String(s),
      '--tx': String(tx),
      '--ty': String(ty),
      onComplete: () => {
        dom.stage.dataset.animating = '0'
        onComplete?.()
      }
    })
  }

  function getPose () {
    const cs = getComputedStyle(dom.stageInner)
    return {
      s: cs.getPropertyValue('--s').trim() || '1',
      tx: cs.getPropertyValue('--tx').trim() || '0px',
      ty: cs.getPropertyValue('--ty').trim() || '0px'
    }
  }

  function setPose (pose) {
    if (!pose) return
    dom.stageInner.style.setProperty('--s', pose.s)
    dom.stageInner.style.setProperty('--tx', pose.tx)
    dom.stageInner.style.setProperty('--ty', pose.ty)
  }

  /* =========================================================
     Steps panel transitions
     ========================================================= */
  function showStepsPanel () {
    if (!dom.stepsPanel) return

    if (!hasGSAP) {
      dom.stepsPanel.classList.remove('pointer-events-none')
      dom.stepsPanel.classList.remove('opacity-0', '-translate-x-3')
      dom.stepsPanel.classList.add('opacity-100', 'translate-x-0')
      return
    }

    window.gsap.killTweensOf(dom.stepsPanel)
    window.gsap.set(dom.stepsPanel, { pointerEvents: 'auto' })
    window.gsap.fromTo(
      dom.stepsPanel,
      { autoAlpha: 0, x: -12 },
      { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power2.out' }
    )
  }

  function hideStepsPanel () {
    if (!dom.stepsPanel) return

    if (!hasGSAP) {
      dom.stepsPanel.classList.add('pointer-events-none')
      dom.stepsPanel.classList.remove('opacity-100', 'translate-x-0')
      dom.stepsPanel.classList.add('opacity-0', '-translate-x-3')
      return
    }

    window.gsap.killTweensOf(dom.stepsPanel)
    window.gsap.to(dom.stepsPanel, {
      autoAlpha: 0,
      x: -12,
      duration: 0.25,
      ease: 'power2.inOut',
      onComplete: () =>
        window.gsap.set(dom.stepsPanel, { pointerEvents: 'none' })
    })
  }

  /* =========================================================
     Drawer transitions
     ========================================================= */
  function hideDrawerOnly () {
    if (!hasGSAP) {
      dom.drawer.classList.remove(
        'opacity-100',
        'translate-x-0',
        'pointer-events-auto'
      )
      dom.drawer.classList.add(
        'opacity-0',
        'translate-x-5',
        'pointer-events-none'
      )
      return
    }

    window.gsap.killTweensOf(dom.drawer)
    window.gsap.to(dom.drawer, {
      autoAlpha: 0,
      x: 14,
      duration: 0.25,
      ease: 'power2.inOut',
      onComplete: () => window.gsap.set(dom.drawer, { pointerEvents: 'none' })
    })
  }

  function openDrawer () {
    if (!hasGSAP) {
      dom.drawer.classList.remove(
        'opacity-0',
        'translate-x-5',
        'pointer-events-none'
      )
      dom.drawer.classList.add(
        'opacity-100',
        'translate-x-0',
        'pointer-events-auto'
      )
      return
    }

    window.gsap.killTweensOf(dom.drawer)
    window.gsap.set(dom.drawer, { pointerEvents: 'auto' })
    window.gsap.fromTo(
      dom.drawer,
      { autoAlpha: 0, x: 14 },
      { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power2.out' }
    )
  }

  /* =========================================================
     Top pagination chip
     ========================================================= */
  function setStepChipLabel () {
    if (!dom.topStepChip) return

    if (state.mode === 'explore') {
      dom.topStepChip.classList.add('hidden')
      return
    }

    dom.topStepChip.classList.remove('hidden')

    if (dom.topStepLabel) dom.topStepLabel.textContent = 'Step'

    const idx = Math.max(
      0,
      STEP_ORDER.indexOf(state.activeStepKey || STEP_ORDER[0])
    )

    if (dom.topStepCurrent)
      dom.topStepCurrent.textContent = String(idx + 1).padStart(2, '0')
    if (dom.topStepTotal)
      dom.topStepTotal.textContent = String(STEP_ORDER.length).padStart(2, '0')

    if (dom.topStepLabel) dom.topStepLabel.classList.remove('hidden')
    if (dom.topStepCurrent) dom.topStepCurrent.classList.remove('hidden')
    if (dom.topStepSlash) dom.topStepSlash.classList.remove('hidden')
    if (dom.topStepTotal) dom.topStepTotal.classList.remove('hidden')
  }

  /* =========================================================
     Top CTA
     ========================================================= */
  function syncTopCta () {
    if (!dom.btnExitFlow) return

    const focused = isFocused()

    if (!focused) {
      dom.btnExitFlow.classList.add('hidden')
      return
    }

    dom.btnExitFlow.classList.remove('hidden')
    dom.btnExitFlow.textContent = 'Exit mode'
    dom.btnExitFlow.setAttribute('aria-label', 'Exit focus mode')
    dom.btnExitFlow.setAttribute('title', 'Exit focus mode')

    dom.btnExitFlow.classList.add('is-focused') // your red style hook
  }

  /* =========================================================
     Focus target positioning
     ========================================================= */
  function getFocusTargetPoint (tileRect, zoom) {
    const stageRect = dom.stage.getBoundingClientRect()
    const rightRect = dom.drawer ? dom.drawer.getBoundingClientRect() : null

    const pad = 32

    // In focused mode your steps panel is hidden, so safeLeft can be stage left.
    const safeLeft = stageRect.left + pad

    // If drawer exists, don't let the target land under it
    const safeRight = rightRect ? rightRect.left - pad : stageRect.right - pad

    // default bias to the left side
    const ratio = 0.1
    let targetX =
      safeRight > safeLeft
        ? safeLeft + (safeRight - safeLeft) * ratio
        : stageRect.left + stageRect.width * 0.5

    const targetY = stageRect.top + stageRect.height * 0.5

    // --- IMPORTANT: clamp so the focused tile never goes under the drawer ---
    if (rightRect && tileRect) {
      const halfTile = (tileRect.width * zoom) / 2
      const maxCenterX = rightRect.left - pad - halfTile
      targetX = Math.min(targetX, maxCenterX)
    }

    return { x: targetX, y: targetY }
  }

  /* =========================================================
     Explore highlighting
     ========================================================= */
  function applyExploreHighlight (activeKey) {
    dom.tiles.forEach(t =>
      t.classList.toggle('is-active', t.dataset.step === activeKey)
    )
    dom.navBtns.forEach(b =>
      b.classList.toggle('is-active', b.dataset.step === activeKey)
    )
  }

  /* =========================================================
     Render drawer (focused mode only)
     ========================================================= */
  function renderDrawer (stepKey) {
    const d = STEP_DATA[stepKey]
    if (!d) return

    dom.drawerTitle.textContent = d.title

    const idx = STEP_ORDER.indexOf(stepKey)

    dom.drawerBody.innerHTML = renderDrawerHtml({
      d,
      idx,
      total: STEP_ORDER.length
    })

    const btnPrev = dom.drawerBody.querySelector('#btnPrev')
    const btnNext = dom.drawerBody.querySelector('#btnNext')

    if (btnPrev) {
      btnPrev.addEventListener('click', e => {
        e.preventDefault()
        e.stopPropagation()
        goToStepByOffset(-1)
      })
    }

    if (btnNext) {
      btnNext.addEventListener('click', e => {
        e.preventDefault()
        e.stopPropagation()

        const isLast = idx >= STEP_ORDER.length - 1

        if (isLast) {
          exitFocused() // ✅ this is your "Complete" action
          return
        }

        goToStepByOffset(1)
      })
    }
  }

  /* =========================================================
     Open step
     ========================================================= */
  function openStep (stepKey, { mode } = {}) {
    const tile = dom.tiles.find(t => t.dataset.step === stepKey)
    if (!tile) return

    if (mode) state.mode = mode
    state.activeStepKey = stepKey

    syncStageMode()
    syncInteractionLock()
    syncTopCta()
    setStepChipLabel()

    if (!isFocused()) {
      applyExploreHighlight(stepKey)
      hideDrawerOnly()
      showStepsPanel()
      return
    }

    // focused mode
    dom.tiles.forEach(t => {
      const isActive = t === tile
      t.classList.toggle('is-active', isActive)
      t.classList.toggle('is-dim', !isActive)
    })

    renderDrawer(stepKey)
    openDrawer()
    hideStepsPanel()

    requestAnimationFrame(() => {
      // 🔧 per-step tweak (optional)
      const tweak = STEP_CAMERA_TWEAKS[stepKey] || {}
      const zoom = tweak.zoom || 1.38

      const tr = tile.getBoundingClientRect()
      const target = getFocusTargetPoint(tr, zoom)

      const center = { x: tr.left + tr.width / 2, y: tr.top + tr.height / 2 }

      let dx = (target.x - center.x) / zoom
      let dy = (target.y - center.y) / zoom

      // 🔧 apply per-step offset AFTER base calculation
      if (typeof tweak.dx === 'number') dx += tweak.dx / zoom
      if (typeof tweak.dy === 'number') dy += tweak.dy / zoom

      const maxX = dom.stage.getBoundingClientRect().width * 0.7
      const maxY = dom.stage.getBoundingClientRect().height * 0.35
      dx = Math.max(-maxX, Math.min(maxX, dx))
      dy = Math.max(-maxY, Math.min(maxY, dy))

      animateCameraTo(
        { s: zoom, tx: `${dx}px`, ty: `${dy}px` },
        {
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            state.focusedPose = getPose()
          }
        }
      )
    })
  }

  /* =========================================================
     Base pose
     ========================================================= */
  function resetToBasePosition () {
    const stageRect = dom.stage.getBoundingClientRect()
    const baseX = getComputedStyle(dom.stage)
      .getPropertyValue('--base-x')
      .trim()
    const baseY = getComputedStyle(dom.stage)
      .getPropertyValue('--base-y')
      .trim()

    const targetX = stageRect.width * (parseFloat(baseX) / 100)
    const targetY = stageRect.height * (parseFloat(baseY) / 100)

    animateCameraTo(
      { s: 1, tx: `${targetX}px`, ty: `${targetY}px` },
      {
        duration: 0,
        onComplete: () => {
          state.basePose = getPose()
        }
      }
    )
  }

  function resetToBaseInstant () {
    killCameraTweens()

    if (state.basePose) {
      setPose(state.basePose)
      return
    }

    const stageRect = dom.stage.getBoundingClientRect()
    const baseX =
      getComputedStyle(dom.stage).getPropertyValue('--base-x').trim() || '0%'
    const baseY =
      getComputedStyle(dom.stage).getPropertyValue('--base-y').trim() || '0%'

    const targetX = stageRect.width * (parseFloat(baseX) / 100)
    const targetY = stageRect.height * (parseFloat(baseY) / 100)

    setCameraVars({ s: 1, tx: `${targetX}px`, ty: `${targetY}px` })
    state.basePose = getPose()
  }

  /* =========================================================
     Focus enter / exit
     ========================================================= */
  function enterFocused (stepKey) {
    stopBreathSteps({ reset: true }) // ✅ kill breathing immediately

    state.mode = 'focused'
    syncStageMode()
    syncInteractionLock()
    syncTopCta()
    setStepChipLabel()
    openStep(stepKey, { mode: 'focused' })
  }

  function exitFocused () {
    state.mode = 'explore'
    syncStageMode()
    syncInteractionLock()
    syncTopCta()
    setStepChipLabel()

    hideDrawerOnly()
    showStepsPanel()

    resetToBaseInstant()

    // REMOVE dim + active state from all tiles
    dom.tiles.forEach(t => {
      t.classList.remove('is-dim')
      t.classList.remove('is-active')
    })

    // keep highlight on last selected step
    if (state.activeStepKey) applyExploreHighlight(state.activeStepKey)

    syncBreathByMode() // ✅ resume breathing
  }

  function goToStepByOffset (offset) {
    if (!state.activeStepKey) return
    const idx = STEP_ORDER.indexOf(state.activeStepKey)
    const nextIdx = idx + offset
    if (nextIdx < 0 || nextIdx >= STEP_ORDER.length) return
    openStep(STEP_ORDER[nextIdx], { mode: 'focused' })
  }

  /* =========================================================
     Hover
     ========================================================= */
  function setHoverStep (stepKey) {
    if (isFocused()) return
    dom.tiles.forEach(t =>
      t.classList.toggle('is-hover', t.dataset.step === stepKey)
    )
    dom.navBtns.forEach(b =>
      b.classList.toggle('is-hover', b.dataset.step === stepKey)
    )
  }

  function clearHoverStep () {
    dom.tiles.forEach(t => t.classList.remove('is-hover'))
    dom.navBtns.forEach(b => b.classList.remove('is-hover'))
  }

  /* =========================================================
     Events
     ========================================================= */
  dom.navBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => setHoverStep(btn.dataset.step))
    btn.addEventListener('mouseleave', clearHoverStep)
    btn.addEventListener('focus', () => setHoverStep(btn.dataset.step))
    btn.addEventListener('blur', clearHoverStep)
  })

  dom.tiles.forEach(tile => {
    tile.addEventListener('mouseenter', () => setHoverStep(tile.dataset.step))
    tile.addEventListener('mouseleave', clearHoverStep)
  })

  // click tiles: explore -> enter focused, focused -> block
  dom.tiles.forEach(tile => {
    tile.addEventListener('click', e => {
      const key = tile.dataset.step
      if (!key) return

      if (isFocused()) {
        e.preventDefault()
        e.stopPropagation()
        return
      }

      e.preventDefault()
      e.stopPropagation()
      enterFocused(key)
    })
  })

  // click sidebar: explore -> enter focused, focused -> block
  dom.navBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      const key = btn.dataset.step
      if (!key) return

      if (isFocused()) {
        e.preventDefault()
        e.stopPropagation()
        return
      }

      e.preventDefault()
      e.stopPropagation()
      enterFocused(key)
    })
  })

  // close X
  if (dom.drawerClose) {
    dom.drawerClose.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()
      exitFocused()
    })
  }

  // top CTA: Close in focused, Reset in explore
  if (dom.btnExitFlow) {
    dom.btnExitFlow.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()
      if (isFocused()) exitFocused()
    })
  }

  // recenter
  if (dom.btnRecenter) {
    dom.btnRecenter.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()

      if (isFocused() && state.focusedPose) {
        animateCameraTo(state.focusedPose, {
          duration: 0.45,
          ease: 'power2.out'
        })
        return
      }

      resetToBaseInstant()
    })
  }

  // ESC to exit focused mode
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return
    if (!isFocused()) return

    // don't hijack Esc when user is typing in a form field
    const el = document.activeElement
    const typing =
      el &&
      (el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.isContentEditable)

    if (typing) return

    e.preventDefault()
    exitFocused()
  })

  /* =========================================================
     Init
     ========================================================= */
  syncStageMode()
  syncTopCta()
  setStepChipLabel()

  hideDrawerOnly()
  // showStepsPanel()

  const skipIntro =
    document.getElementById('lifecycleUI-desktop')?.dataset?.skipIntro === '1'

  if (skipIntro && window.gsap) {
    window.gsap.killTweensOf(dom.stepsPanel)
    window.gsap.set(dom.stepsPanel, {
      autoAlpha: 1,
      x: 0,
      pointerEvents: 'auto'
    })
  } else {
    showStepsPanel()
  }

  resetToBasePosition()
  syncBreathByMode()

  window.addEventListener('resize', () => {
    if (isFocused() && state.activeStepKey) {
      openStep(state.activeStepKey, { mode: 'focused' })
      return
    }
    resetToBasePosition()
    syncBreathByMode()
  })
}