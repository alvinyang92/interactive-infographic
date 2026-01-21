import { initLifecycleMobile } from './lifecycle-mobile.js'
import { initLifecycleDesktop } from './lifecycle-desktop.js'
import { bindStartJourneyTransition } from './transition/start-journey.js'

document.addEventListener('DOMContentLoaded', () => {
  // init logic (bind events) early
  if (window.matchMedia('(min-width: 768px)').matches) {
    initLifecycleDesktop()
  } else {
    initLifecycleMobile()
  }

  // bind the transition click
  bindStartJourneyTransition()
})