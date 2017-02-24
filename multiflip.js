(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.multiflip = factory());
}(this, (function () { 'use strict';

var $ = jQuery;

var DEFAULT_UNIT_DIR = 400;
var DEFAULT_CONTENT_SHOW_DUR = 400;

var DEFAULT_M = 4;
var DEFAULT_N = 4;

var DEFAULT_BGCOLOR = '#393F44';
var CHIP_CLASS = 'multiflip-chip';

var FLIP_TRANSFORM = 'rotate3d(1, -1, 0, -180deg)'; // Transformation for the flipping a chip

var wait = function (n) { return new Promise(function (resolve) { return setTimeout(resolve, n); }); };

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
var Multiflip = function Multiflip () {};

Multiflip.prototype.__init__ = function __init__ () {
  var elem = this.$el;
  this.content = $('*', elem);
  this.w = elem.width();
  this.h = elem.height();

  this.m = +elem.attr('m') || DEFAULT_M;
  this.n = +elem.attr('n') || DEFAULT_N;
  this.uw = this.w / this.m;
  this.uh = this.h / this.n;

  this.unitDur = +elem.attr('unit-dur') || DEFAULT_UNIT_DIR;
  this.diffDur = this.unitDur / (this.m + this.n);

  this.contentShowDur = +elem.attr('content-show-dur') || DEFAULT_CONTENT_SHOW_DUR;

  this.bgcolor = elem.attr('bgcolor') || DEFAULT_BGCOLOR;

  this.init(elem);
};

/**
 * Initializes the multiflip.
 * @param {jQuery} elem The jquery dom
 * @private
 */
Multiflip.prototype.init = function init (elem) {
    var this$1 = this;

  this.content.css({
    opacity: 0, // sets the content invisible at first
    transitionDuration: this.contentShowDur + 'ms' // sets the content's transition duration
  });

  this.chipGroups = [];

  for (var i = 0; i < this.m; i++) {
    for (var j = 0; j < this.n; j++) {
      var chip = this$1.createChip(i * this$1.uw, j * this$1.uh, this$1.uw, this$1.uh)
                  .prependTo(elem).addClass(CHIP_CLASS);

      var group = i + j;

      this$1.chipGroups[group] = this$1.chipGroups[group] || [];
      this$1.chipGroups[group].push(chip);
    }
  }

  return this
};

/**
 * Creates the pane's chip
 * @private
 * @param {Number} left The left offset
 * @param {Number} top The top offset
 * @param {Number} w The width
 * @param {Number} h The height
 */
Multiflip.prototype.createChip = function createChip (left, top, w, h) {
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
};

/**
 * Performs multiflipping and shows the content.
 * @return {Promise}
 */
Multiflip.prototype.show = function show () {
    var this$1 = this;

  return this.chipGroups
      .map(function (group, i) { return wait(this$1.diffDur * i).then(function () {
        group.forEach(function (chip) { return chip.css('transform', ''); });

        return wait(this$1.unitDur * 3 / 4)
          // Ignore the last 25% of the flipping for the moment and
          // starts showing the content.
      }); })
      .pop()
      .then(function () { return this$1.showContents(); })
};

/**
 * Shows the contents.
 * @private
 * @return {Promise}
 */
Multiflip.prototype.showContents = function showContents () {
  this.content.css('opacity', 1); // shows the content

  return wait(this.contentShowDur) // waits for the content showing
};

/**
 * Perfoms multiflipping and hides the content.
 * @return {Promise}
 */
Multiflip.prototype.hide = function hide () {
    var this$1 = this;

  return this.hideContents()
      .then(function () { return this$1.chipGroups.map(function (group, i) { return this$1.hideChipGroupWithDelay(group, this$1.diffDur * i); }).pop(); })
};

/**
 * Hides the group of the chip with the given delay
 * @param {jQuery[]} group
 * @param {number} delay
 */
Multiflip.prototype.hideChipGroupWithDelay = function hideChipGroupWithDelay (group, delay) {
    var this$1 = this;

  return wait(delay).then(function () {
    group.forEach(function (chip) { return chip.css('transform', FLIP_TRANSFORM); });

    return wait(this$1.unitDur / 2)
          // waits only the half of the unit dur
          // because when the chip is half flipped, then it's already invisible.
  })
};

/**
 * Hides the contents.
 * @private
 * @return {Promise}
 */
Multiflip.prototype.hideContents = function hideContents () {
  this.content.css('opacity', 0); // hides the content

  return wait(this.contentShowDur)
};

return Multiflip;

})));
