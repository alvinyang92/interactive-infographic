let _breathEls = []
let _isRunning = false

export function startBreathSteps ({
  root = document,
  selector = '#stageInner .step-tile img',
  amp = 4,
  baseDur = 2.8,
  stagger = 0.08
} = {}) {
  const hasGSAP = typeof window !== 'undefined' && !!window.gsap
  if (!hasGSAP) return

  const gsap = window.gsap

  // ✅ stop previous run FIRST (before re-select)
  stopBreathSteps({ reset: false })

  // ✅ now select fresh elements
  _breathEls = Array.from(root.querySelectorAll(selector))
  if (!_breathEls.length) return

  _isRunning = true

  _breathEls.forEach((el, i) => {
    gsap.set(el, { transformOrigin: '50% 50%' })

    gsap.to(el, {
      y: -amp,
      rotation: i % 2 === 0 ? 0.35 : -0.35,
      duration: baseDur + (i % 3) * 0.18,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: i * stagger,
      overwrite: 'auto'
    })
  })
}

export function stopBreathSteps ({ reset = true } = {}) {
  const hasGSAP = typeof window !== 'undefined' && !!window.gsap
  if (!hasGSAP) return

  const gsap = window.gsap
  if (!_breathEls.length) {
    _isRunning = false
    return
  }

  gsap.killTweensOf(_breathEls)

  if (reset) {
    gsap.set(_breathEls, { clearProps: 'transform' })
  }

  _breathEls = []
  _isRunning = false
}

export function isBreathRunning () {
  return _isRunning
}