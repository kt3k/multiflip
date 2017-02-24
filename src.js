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
    const elem = this.$el

    this.content = $('*', elem)
    this.w = elem.width()
    this.h = elem.height()

    this.m = +elem.attr('m') || DEFAULT_M
    this.n = +elem.attr('n') || DEFAULT_N
    this.uw = this.w / this.m
    this.uh = this.h / this.n

    this.unitDur = +elem.attr('unit-dur') || DEFAULT_UNIT_DIR
    this.diffDur = this.unitDur / (this.m + this.n)

    this.contentShowDur = +elem.attr('content-show-dur') || DEFAULT_CONTENT_SHOW_DUR

    this.bgcolor = elem.attr('bgcolor') || DEFAULT_BGCOLOR

    this.content.css({
      opacity: 0, // sets the content invisible at first
      transitionDuration: this.contentShowDur + 'ms' // sets the content's transition duration
    })

    this.chips = []

    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        const chip = this.createChip(i * this.uw, j * this.uh, this.uw, this.uh, this.diffDur * (i + j))
          .prependTo(elem)
          .addClass(CHIP_CLASS)

        this.chips.push(chip)
      }
    }

    this.lastChip = this.chips.slice(-1)
  }

  /**
   * Creates the pane's chip
   * @private
   * @param {Number} left The left offset
   * @param {Number} top The top offset
   * @param {Number} w The width
   * @param {Number} h The height
   */
  createChip (left, top, w, h, delay) {
    return $('<div />').css({
      position: 'absolute',
      left: left + 'px',
      top: top + 'px',
      width: w + 'px',
      height: h + 'px',
      backgroundColor: this.bgcolor,
      transitionDuration: this.unitDur + 'ms',
      transitionDelay: delay + 'ms',
      transform: FLIP_TRANSFORM,
      backfaceVisibility: 'hidden',
      transformStyle: 'preserve-3d'
    })
  }

  /**
   * Performs multiflipping and shows the content.
   * @return {Promise}
   */
  show () {
    this.chips.forEach(chip => chip.css('transform', ''))

    return wait(this.unitDur * 2 - this.contentShowDur).then(() => this.showContents())
  }

  /**
   * Shows the contents.
   * @private
   * @return {Promise}
   */
  showContents () {
    this.content.css('opacity', 1) // shows the content

    return wait(this.contentShowDur) // waits for the content showing
  }

  /**
   * Perfoms multiflipping and hides the content.
   * @return {Promise}
   */
  hide () {
    return this.hideContents()
      .then(() => {
        this.chips.forEach(chip => chip.css('transform', FLIP_TRANSFORM))

        return wait(this.unitDur * 2)
      })
  }

  /**
   * Hides the contents.
   * @private
   * @return {Promise}
   */
  hideContents () {
    this.content.css('opacity', 0) // hides the content

    return wait(this.contentShowDur)
  }
}
