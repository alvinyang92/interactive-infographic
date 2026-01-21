import { startBreathSteps, stopBreathSteps } from './breath-steps.js'

export function bindStartJourneyTransition () {
  const hasGSAP = typeof window !== 'undefined' && !!window.gsap
  if (!hasGSAP) return

  const gsap = window.gsap

  /* =========================================================
     DOM refs
     ========================================================= */
  const dom = {
    startBtn: document.getElementById('startJourneyBtn'),

    mainMenu: document.getElementById('mainMenu'),
    mainMenuHeader: document.getElementById('mainMenuHeader'),
    menuStageDesktop: document.getElementById('mainMenuStageDesktop'),
    menuStageMobile: document.getElementById('mainMenuStageMobile'),

    // desktop lifecycle
    lifecycleDesktop: document.getElementById('lifecycleUI-desktop'),
    topBar: document.getElementById('topBar'),
    stepsPanel: document.getElementById('stepsPanel'),
    stageInner: document.getElementById('stageInner'),

    // mobile lifecycle
    lifecycleMobile: document.getElementById('lifecycleUI-mobile'),
    mobileTopBar: document.getElementById('mTopBar'),
    mobileCard: document.getElementById('mCard')
  }

  if (!dom.startBtn || !dom.mainMenu) return

  /* =========================================================
     MENU BREATH (MAIN MENU ONLY)
     ========================================================= */
  function startMenuBreath () {
    // run only when main menu visible
    if (dom.mainMenu.classList.contains('hidden')) return

    stopBreathSteps({ reset: true })

    const isDesktop = window.matchMedia('(min-width: 768px)').matches
    const selector = isDesktop
      ? '#mainMenuStageDesktop .js-step img'
      : '#mainMenuStageMobile .js-step img'

    // if stage not present in DOM, bail
    const stageEl = document.querySelector(
      isDesktop ? '#mainMenuStageDesktop' : '#mainMenuStageMobile'
    )
    if (!stageEl) return

    startBreathSteps({
      root: document,
      selector,
      amp: isDesktop ? 4 : 5,
      baseDur: isDesktop ? 2.4 : 3.6,
      stagger: isDesktop ? 0.04 : 0.04
    })
  }

  function stopMenuBreath () {
    stopBreathSteps({ reset: true })
  }

  // start immediately
  startMenuBreath()

  // only one resize handler
  window.addEventListener('resize', () => {
    // if menu is hidden (already in steps UI), don't restart
    if (dom.mainMenu.classList.contains('hidden')) return
    startMenuBreath()
  })

  /* =========================================================
     Helpers
     ========================================================= */
  // pick the visible menu stage (desktop vs mobile)
  const getMenuStage = () =>
    window.matchMedia('(min-width: 768px)').matches
      ? dom.menuStageDesktop
      : dom.menuStageMobile

  /* =========================================================
     Desktop transition
     ========================================================= */
  function animateToStepsUI () {
    const menuStage = getMenuStage()

    dom.startBtn.disabled = true
    stopMenuBreath() // stop menu breathing before transition

    // 1) Show steps container
    dom.lifecycleDesktop.classList.remove('hidden')
    gsap.set(dom.lifecycleDesktop, { autoAlpha: 1, visibility: 'visible' })

    // PATCH: lock stage transitions during base pose
    const stage = document.getElementById('stage')
    if (stage) stage.dataset.animating = '1'
    requestAnimationFrame(() => {
      if (stage) stage.dataset.animating = '0'
    })

    // 2) Prep initial states 
    if (dom.topBar) gsap.set(dom.topBar, { autoAlpha: 0, y: -16 })
    if (dom.stepsPanel) gsap.set(dom.stepsPanel, { autoAlpha: 0, x: -12 })

    const stepTiles = dom.stageInner
      ? dom.stageInner.querySelectorAll('.step-tile')
      : []

    if (stepTiles.length) {
      gsap.set(stepTiles, { autoAlpha: 0, y: 10 })
    }

    // 3) Kill previous tweens
    gsap.killTweensOf([
      dom.mainMenu,
      dom.mainMenuHeader,
      menuStage,
      dom.topBar,
      dom.stepsPanel,
      stepTiles
    ])

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        dom.mainMenu.classList.add('hidden')
        dom.startBtn.disabled = false

        gsap.set(dom.mainMenu, {
          clearProps:
            'opacity,visibility,filter,transform,display,pointerEvents,zIndex'
        })
        if (menuStage) {
          gsap.set(menuStage, {
            clearProps:
              'opacity,visibility,filter,transform,display,pointerEvents,zIndex'
          })
        }
      }
    })

    // -------------------------
    // OUT (main menu → gone)
    // -------------------------
    if (dom.mainMenuHeader) {
      tl.to(dom.mainMenuHeader, { autoAlpha: 0, duration: 0.22 }, 0)
    }

    if (menuStage) {
      tl.to(
        menuStage,
        { opacity: 0.65, filter: 'blur(1.5px)', duration: 0.26 },
        0
      )
      tl.to(menuStage, { autoAlpha: 0, duration: 0.18 }, 0.18)
    }

    tl.to(dom.mainMenu, { autoAlpha: 0, duration: 0.18 }, 0.16)

    // -------------------------
    // SWAP LAYER
    // -------------------------
    tl.add('enter', 0.6)
    tl.set(dom.mainMenu, { display: 'none', pointerEvents: 'none' }, 'enter')
    if (menuStage) {
      tl.set(menuStage, { display: 'none', pointerEvents: 'none' }, 'enter')
    }

    // -------------------------
    // IN (cinematic sequence)
    // -------------------------

    // 1) Top bar (anchor)
    if (dom.topBar) {
      tl.to(dom.topBar, { autoAlpha: 1, y: 0, duration: 0.75 }, 'enter+=0.10')
    }

    // 2) Steps panel (overlapping)
    if (dom.stepsPanel) {
      tl.to(
        dom.stepsPanel,
        { autoAlpha: 1, x: 0, duration: 0.55 },
        'enter+=0.28'
      )
    }

    // 3) Step tiles (gentle cascade)
    if (stepTiles.length) {
      tl.to(
        stepTiles,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.06
        },
        'enter+=0.42'
      )
    }

    // start breathing ONLY after everything is visible (Explore mode default)
    tl.call(
      () => {
        startBreathSteps({ selector: '#stageInner .step-tile img', amp: 4 })
      },
      null,
      'enter+=1.05'
    )
  }

  /* =========================================================
     Mobile transition
     ========================================================= */
  function animateToStepsUIMobile () {
    dom.startBtn.disabled = true
    stopMenuBreath() // stop menu breathing before transition

    const menuStage = dom.menuStageMobile

    // show lifecycle container
    dom.lifecycleMobile.classList.remove('hidden')
    gsap.set(dom.lifecycleMobile, { autoAlpha: 1, visibility: 'visible' })

    // elements
    const pillWrap = document.getElementById('mPillWrap')
    const img = document.getElementById('mImageSwipeZone')
    const facts = dom.lifecycleMobile.querySelectorAll('.mFact')

    // -------------------------
    // PREP STATES (CRITICAL)
    // -------------------------
    gsap.set(dom.mobileTopBar, { autoAlpha: 0, y: -18 })
    if (pillWrap) gsap.set(pillWrap, { autoAlpha: 0, y: 12 })
    if (img) gsap.set(img, { autoAlpha: 0, y: 24 })
    if (dom.mobileCard) gsap.set(dom.mobileCard, { autoAlpha: 0, y: 28 })
    if (facts.length) gsap.set(facts, { autoAlpha: 0, y: 12 })

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => {
        dom.mainMenu.classList.add('hidden')
        dom.startBtn.disabled = false
        initLifecycleMobile()
      }
    })

    // -------------------------
    // OUT (menu)
    // -------------------------
    tl.to(dom.mainMenuHeader, { autoAlpha: 0, duration: 0.2 }, 0)
    if (menuStage) tl.to(menuStage, { autoAlpha: 0, duration: 0.25 }, 0.05)
    tl.to(dom.mainMenu, { autoAlpha: 0, duration: 0.25 }, 0.1)

    // -------------------------
    // SWAP LAYER
    // -------------------------
    tl.add('enter', 0.35)
    tl.set(dom.mainMenu, { display: 'none', pointerEvents: 'none' }, 'enter')
    if (menuStage) {
      tl.set(menuStage, { display: 'none', pointerEvents: 'none' }, 'enter')
    }

    // -------------------------
    // IN (STEPS UI)
    // -------------------------
    tl.to(
      dom.mobileTopBar,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.45
      },
      'enter+=0.15'
    )

    if (pillWrap) {
      tl.to(
        pillWrap,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.4
        },
        'enter+=0.28'
      )
    }

    if (img) {
      tl.to(
        img,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.45
        },
        'enter+=0.38'
      )
    }

    tl.to(
      dom.mobileCard,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.45
      },
      'enter+=0.48'
    )

    // -------------------------
    // FACTS STAGGER (FEELS PREMIUM)
    // -------------------------
    if (facts.length) {
      tl.to(
        facts,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.08
        },
        'enter+=0.65'
      )
    }
  }

  /* =========================================================
     Bind click
     ========================================================= */
  // prevent multiple binding if this gets called twice
  if (dom.startBtn.dataset.bound === '1') return
  dom.startBtn.dataset.bound = '1'

  dom.startBtn.addEventListener('click', e => {
    e.preventDefault()
    e.stopPropagation()

    if (window.matchMedia('(min-width: 768px)').matches) {
      animateToStepsUI()
    } else {
      animateToStepsUIMobile()
    }
  })
}