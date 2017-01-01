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
class Multiflip {
  /**
   * @param {jQuery} elem The jquery dom
   */
  constructor (elem) {
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

    this.init(elem)
  }

  /**
   * Initializes the multiflip.
   * @param {jQuery} elem The jquery dom
   * @private
   */
  init (elem) {
    this.content.css({
      opacity: 0, // sets the content invisible at first
      transitionDuration: this.contentShowDur + 'ms' // sets the content's transition duration
    })

    this.chipGroups = []

    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        let chip = this.createChip(i * this.uw, j * this.uh, this.uw, this.uh)
                    .prependTo(elem).addClass(CHIP_CLASS)

        let group = i + j

        this.chipGroups[group] = this.chipGroups[group] || []
        this.chipGroups[group].push(chip)
      }
    }

    return this
  }

  /**
   * Creates the pane's chip
   * @private
   * @param {Number} left The left offset
   * @param {Number} top The top offset
   * @param {Number} w The width
   * @param {Number} h The height
   */
  createChip (left, top, w, h) {
    return $('<div />').css({
      position: 'absolute',
      left: left + 'px',
      top: top + 'px',
      width: w + 'px',
      height: h + 'px',
      backgroundColor: this.bgcolor,
      transitionDuration: this.unitDur + 'ms',
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
    return this.chipGroups
        .map((group, i) => wait(this.diffDur * i).then(() => {
          group.forEach(chip => chip.css('transform', ''))

          return wait(this.unitDur * 3 / 4)
            // Ignore the last 25% of the flipping for the moment and
            // starts showing the content.
        }))
        .pop()
        .then(() => this.showContents())
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
        .then(() => this.chipGroups.map((group, i) => this.hideChipGroupWithDelay(group, this.diffDur * i)).pop())
  }

  /**
   * Hides the group of the chip with the given delay
   * @param {jQuery[]} group
   * @param {number} delay
   */
  hideChipGroupWithDelay (group, delay) {
    return wait(delay).then(() => {
      group.forEach(chip => chip.css('transform', FLIP_TRANSFORM))

      return wait(this.unitDur / 2)
            // waits only the half of the unit dur
            // because when the chip is half flipped, then it's already invisible.
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

$.cc('multiflip', Multiflip)
