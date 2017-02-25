const DEFAULT_UNIT_DIR = 400
const CONTENT_SHOW_DURATION_RATIO = 0.5

const DEFAULT_M = 4
const DEFAULT_N = 4

const DEFAULT_BGCOLOR = '#393F44'
const CHIP_CLASS = 'multiflip-chip'
const FLIPPED_CLASS = 'multiflip-flipped'

const FLIP_TRANSFORM = 'rotate3d(1, -1, 0, -180deg)' // Transformation for the flipping a chip

const wait = n => new Promise(resolve => setTimeout(resolve, n))

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
    this.w = this.el.clientWidth
    this.h = this.el.clientHeight

    this.m = +this.el.getAttribute('m') || DEFAULT_M
    this.n = +this.el.getAttribute('n') || DEFAULT_N
    this.uw = this.w / this.m
    this.uh = this.h / this.n

    this.unitDur = +this.el.getAttribute('unit-dur') || DEFAULT_UNIT_DIR
    this.diffDur = this.unitDur / (this.m + this.n)

    this.bgcolor = this.el.getAttribute('bgcolor') || DEFAULT_BGCOLOR

    Multiflip.insertGlobalStyle()

    Array.prototype.forEach.call(this.el.children, child => {
      const transition = `${this.unitDur * CONTENT_SHOW_DURATION_RATIO}ms`
      const delay = `${this.unitDur * (2 - CONTENT_SHOW_DURATION_RATIO)}ms`

      child.style.transitionDuration = transition
      child.style.transitionDelay = delay
      child.addEventListener('transitionend', () => {
        if (this.el.classList.contains(FLIPPED_CLASS)) {
          child.style.transitionDelay = '0ms'
        } else {
          child.style.transitionDelay = delay
        }
      })
    })

    Array(this.n * this.m).fill().forEach((_, c) => {
      const i = c % this.m
      const j = Math.floor(c / this.m)

      const div = document.createElement('div')
      const style = div.style

      div.classList.add(CHIP_CLASS)

      style.left = i * this.uw + 'px'
      style.top = j * this.uh + 'px'
      style.width = this.uw + 'px'
      style.height = this.uh + 'px'
      style.backgroundColor = this.bgcolor
      style.transitionDuration = this.unitDur + 'ms'
      style.transitionDelay = this.diffDur * (i + j) + 'ms'

      this.el.insertBefore(div, this.el.firstChild)
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

    return wait(this.unitDur * 2)
  }

  /**
   * Perfoms multiflipping and hides the content.
   * @return {Promise}
   */
  hide () {
    this.el.classList.remove(FLIPPED_CLASS)

    return wait(this.unitDur * 2)
  }
}
