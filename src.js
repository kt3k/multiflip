const DEFAULT_UNIT_DIR = 400
const CONTENT_SHOW_DURATION_RATIO = 0.5

const DEFAULT_M = 4
const DEFAULT_N = 4

const DEFAULT_BGCOLOR = '#393F44'
const CHIP_CLASS = 'multiflip-chip'
const FLIPPED_CLASS = 'multiflip-flipped'

const FLIP_TRANSFORM = 'rotate3d(1, -1, 0, -180deg)' // Transformation for the flipping a chip

const wait = n => new Promise(resolve => setTimeout(resolve, n))

class MultiflipContent {

  __init__ () {
    const el = this.el
    const delay = +el.getAttribute('delay')
    const transition = +el.getAttribute('transition')

    el.style.transitionDuration = `${transition}ms`
    el.style.transitionDelay = `${delay}ms`

    el.addEventListener('transitionend', () => {
      if (this.el.parentElement.classList.contains(FLIPPED_CLASS)) {
        el.style.transitionDelay = '0ms'
      } else {
        el.style.transitionDelay = `${delay}ms`
      }
    })
  }

}

/**
 * Multiflip class handles the behaviours of multi-flipping.
 *
 * <div class="multiflip" m="6" n="4" unit-dur="400" bgcolor="#4588aa"></div>
 *
 * - attr {number} m The horizontal partition number
 * - attr {number} n The vertical partition number
 * - attr {number} unit-dur The unit duration of multiflipping
 * - attr {string} bgcolor The background color of the flipping chips
 */
export default class Multiflip {

  /**
   * Initializes the multiflip.
   */
  __init__ () {
    const el = this.el
    const { initComponent } = this.capsid

    const width = el.clientWidth
    const height = el.clientHeight

    const m = +el.getAttribute('m') || DEFAULT_M
    const n = +el.getAttribute('n') || DEFAULT_N
    const unitW = width / m
    const unitH = height / n

    const unitDur = +el.getAttribute('unit-dur') || DEFAULT_UNIT_DIR
    const diffDur = unitDur / (m + n)

    const bgcolor = el.getAttribute('bgcolor') || DEFAULT_BGCOLOR

    this.flipDur = unitDur * 2

    Multiflip.insertGlobalStyle()

    Array.prototype.forEach.call(el.children, child => {
      const transition = unitDur * CONTENT_SHOW_DURATION_RATIO
      const delay = unitDur * (2 - CONTENT_SHOW_DURATION_RATIO)

      child.setAttribute('transition', transition)
      child.setAttribute('delay', delay)

      initComponent(MultiflipContent, child)
    })

    Array(n * m).fill().forEach((_, c) => {
      const i = c % m
      const j = Math.floor(c / m)

      const div = document.createElement('div')
      const style = div.style

      div.classList.add(CHIP_CLASS)

      style.left = i * unitW + 'px'
      style.top = j * unitH + 'px'
      style.width = unitW + 'px'
      style.height = unitH + 'px'
      style.backgroundColor = bgcolor
      style.transitionDuration = unitDur + 'ms'
      style.transitionDelay = diffDur * (i + j) + 'ms'

      el.insertBefore(div, el.firstChild)
    })
  }

  static insertGlobalStyle () {
    if (document.getElementById('multiflip-global-style')) {
      return
    }

    const style = document.createElement('style')
    style.setAttribute('id', 'multiflip-global-style')

    style.textContent = `
      .multiflip .${CHIP_CLASS} {
        position: absolute;
        transform: ${FLIP_TRANSFORM};
        backface-visibility: hidden;
        transform-style: preserve-3d;
      }
      .multiflip.${FLIPPED_CLASS} .${CHIP_CLASS} {
        transform: none;
      }
      .multiflip > :not(.${CHIP_CLASS}) {
        opacity: 0;
        transition-property: opacity;
      }
      .multiflip.${FLIPPED_CLASS} > :not(.${CHIP_CLASS}) {
        opacity: 1;
      }
    `

    document.body.appendChild(style)
  }

  /**
   * Performs multiflipping and shows the content.
   * @return {Promise}
   */
  show () {
    this.el.classList.add(FLIPPED_CLASS)

    return wait(this.flipDur)
  }

  /**
   * Perfoms multiflipping and hides the content.
   * @return {Promise}
   */
  hide () {
    this.el.classList.remove(FLIPPED_CLASS)

    return wait(this.flipDur)
  }
}
