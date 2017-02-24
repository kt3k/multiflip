const $ = jQuery

const DEFAULT_UNIT_DIR = 400
const DEFAULT_CONTENT_SHOW_DUR = 400

const DEFAULT_M = 4
const DEFAULT_N = 4

const DEFAULT_BGCOLOR = '#393F44'
const CHIP_CLASS = 'multiflip-chip'

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
 * - attr {number} content-show-dur The duration of showing and hiding the content
 * - attr {string} bgcolor The background color of the flipping chips
 */
export default class Multiflip {

  /**
   * Initializes the multiflip.
   */
  __init__ () {
    const elem = $(this.el)

    this.w = elem.width()
    this.h = elem.height()

    this.m = +this.el.getAttribute('m') || DEFAULT_M
    this.n = +this.el.getAttribute('n') || DEFAULT_N
    this.uw = this.w / this.m
    this.uh = this.h / this.n

    this.unitDur = +this.el.getAttribute('unit-dur') || DEFAULT_UNIT_DIR
    this.diffDur = this.unitDur / (this.m + this.n)

    this.contentShowDur = +this.el.getAttribute('content-show-dur') || DEFAULT_CONTENT_SHOW_DUR

    this.bgcolor = this.el.getAttribute('bgcolor') || DEFAULT_BGCOLOR

    this.forEachChild(child => {
      child.style.opacity = '0'
      child.style.transitionDuration = this.contentShowDur + 'ms'
    })

    this.chips = Array(this.n * this.m).fill().map((_, c) => {
      const i = c % this.m
      const j = Math.floor(c / this.m)
      const chip = Multiflip.createChip(
        i * this.uw,
        j * this.uh,
        this.uw,
        this.uh,
        this.diffDur * (i + j),
        this.bgcolor,
        this.unitDur
      )

      this.el.insertBefore(chip, this.el.firstChild)
      chip.classList.add(CHIP_CLASS)

      return chip
    })
  }

  /**
   * Creates the pane's chip
   * @private
   * @param {Number} left The left offset
   * @param {Number} top The top offset
   * @param {Number} w The width
   * @param {Number} h The height
   */
  static createChip (left, top, w, h, delay, bgcolor, unitDur) {
    const div = document.createElement('div')
    const style = div.style

    style.position = 'absolute'
    style.left = left + 'px'
    style.top = top + 'px'
    style.width = w + 'px'
    style.height = h + 'px'
    style.backgroundColor = bgcolor
    style.transitionDuration = unitDur + 'ms'
    style.transitionDelay = delay + 'ms'
    style.transform = FLIP_TRANSFORM
    style.backfaceVisibility = 'hidden'
    style.transformStyle = 'preserve-3d'

    return div
  }

  /**
   * Performs multiflipping and shows the content.
   * @return {Promise}
   */
  show () {
    this.chips.forEach(chip => { chip.style.transform = '' })

    return wait(this.unitDur * 2 - this.contentShowDur).then(() => this.showContents())
  }

  /**
   * Shows the contents.
   * @private
   * @return {Promise}
   */
  showContents () {
    this.forEachChild(child => { child.style.opacity = '1' })

    return wait(this.contentShowDur) // waits for the content showing
  }

  /**
   * Perfoms multiflipping and hides the content.
   * @return {Promise}
   */
  hide () {
    return this.hideContents()
      .then(() => {
        this.chips.forEach(chip => { chip.style.transform = FLIP_TRANSFORM })

        return wait(this.unitDur * 2)
      })
  }

  /**
   * Hides the contents.
   * @private
   * @return {Promise}
   */
  hideContents () {
    this.forEachChild(child => { child.style.opacity = '0' })

    return wait(this.contentShowDur)
  }

  /**
   * Calls the given func on each child.
   * @param {Function} func The function
   */
  forEachChild (func) {
    Array.prototype.forEach.call(this.el.querySelectorAll(`:not(.${CHIP_CLASS})`), func)
  }
}
