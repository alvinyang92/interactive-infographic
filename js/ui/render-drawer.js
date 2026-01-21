import { escapeHtml } from '../utils/escapeHtml.js'

export function renderDrawerHtml ({ d, idx, total }) {
  const isFirst = idx <= 0
  const isLast = idx >= total - 1

  const whatHappens = (d.sections?.[0]?.items || []).slice(0, 3)
  const keySpecs = d.sections?.[1]?.items || []
  const status = (d.sections?.[2]?.items || []).slice(0, 2)

  return `
    <div class="text-white/70 text-sm leading-relaxed">
      ${escapeHtml(d.summary)}
    </div>

    <div class="mt-5">
      <div class="text-white/90 font-semibold">What happens</div>
      <div class="mt-2 h-px bg-white/10"></div>
      <ul class="mt-3 space-y-2 text-white/70 text-sm">
        ${whatHappens
          .map(
            it => `
            <li class="flex gap-2">
              <span class="mt-[6px] h-[6px] w-[6px] rounded-full bg-white/25"></span>
              <span>${escapeHtml(it)}</span>
            </li>
          `
          )
          .join('')}
      </ul>
    </div>

    <div class="mt-5">
      <div class="text-white/90 font-semibold">Key specs</div>
      <div class="mt-2 h-px bg-white/10"></div>
      <div class="mt-3 text-sm text-white/70">
        ${escapeHtml(keySpecs.join(' · '))}
      </div>
    </div>

    <div class="mt-5 pb-5">
      <div class="text-white/90 font-semibold">Status</div>
      <div class="mt-2 h-px bg-white/10"></div>
      <div class="mt-3 text-sm text-white/70">
        ${escapeHtml(status.join(' · '))}
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-3">
      <button id="btnPrev" type="button"
        class="${
          isFirst ? 'hidden' : ''
        } cursor-pointer rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition">
        Previous
      </button>

      <button id="btnNext" type="button"
        class="${
          isFirst ? 'col-span-2' : ''
        } cursor-pointer rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 transition">
        ${isLast ? 'Complete' : 'Next step'}
      </button>
    </div>
  `
}
