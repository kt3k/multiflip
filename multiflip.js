(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.multiflip = factory());
}(this, (function () { 'use strict';

var DEFAULT_UNIT_DIR = 400;
var CONTENT_SHOW_DURATION_RATIO = 0.5;

var DEFAULT_M = 4;
var DEFAULT_N = 4;

var DEFAULT_BGCOLOR = '#393F44';
var CHIP_CLASS = 'multiflip-chip';
var FLIPPED_CLASS = 'multiflip-flipped';

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
 * - attr {string} bgcolor The background color of the flipping chips
 */
var Multiflip = function Multiflip () {};

Multiflip.prototype.__init__ = function __init__ () {
    var this$1 = this;

  this.w = this.el.clientWidth;
  this.h = this.el.clientHeight;

  this.m = +this.el.getAttribute('m') || DEFAULT_M;
  this.n = +this.el.getAttribute('n') || DEFAULT_N;
  this.uw = this.w / this.m;
  this.uh = this.h / this.n;

  this.unitDur = +this.el.getAttribute('unit-dur') || DEFAULT_UNIT_DIR;
  this.diffDur = this.unitDur / (this.m + this.n);

  this.bgcolor = this.el.getAttribute('bgcolor') || DEFAULT_BGCOLOR;

  Multiflip.insertGlobalStyle();

  Array.prototype.forEach.call(this.el.children, function (child) {
    var transition = (this$1.unitDur * CONTENT_SHOW_DURATION_RATIO) + "ms";
    var delay = (this$1.unitDur * (2 - CONTENT_SHOW_DURATION_RATIO)) + "ms";

    child.style.transitionDuration = transition;
    child.style.transitionDelay = delay;
    child.addEventListener('transitionend', function () {
      if (this$1.el.classList.contains(FLIPPED_CLASS)) {
        child.style.transitionDelay = '0ms';
      } else {
        child.style.transitionDelay = delay;
      }
    });
  });

  Array(this.n * this.m).fill().forEach(function (_, c) {
    var i = c % this$1.m;
    var j = Math.floor(c / this$1.m);

    var div = document.createElement('div');
    var style = div.style;

    div.classList.add(CHIP_CLASS);

    style.left = i * this$1.uw + 'px';
    style.top = j * this$1.uh + 'px';
    style.width = this$1.uw + 'px';
    style.height = this$1.uh + 'px';
    style.backgroundColor = this$1.bgcolor;
    style.transitionDuration = this$1.unitDur + 'ms';
    style.transitionDelay = this$1.diffDur * (i + j) + 'ms';

    this$1.el.insertBefore(div, this$1.el.firstChild);
  });
};

Multiflip.insertGlobalStyle = function insertGlobalStyle () {
  if (document.getElementById('multiflip-global-style')) {
    return
  }

  var style = document.createElement('style');
  style.setAttribute('id', 'multiflip-global-style');

  style.textContent = "\n      .multiflip ." + CHIP_CLASS + " {\n        position: absolute;\n        transform: " + FLIP_TRANSFORM + ";\n        backface-visibility: hidden;\n        transform-style: preserve-3d;\n      }\n      .multiflip." + FLIPPED_CLASS + " ." + CHIP_CLASS + " {\n        transform: none;\n      }\n      .multiflip > :not(." + CHIP_CLASS + ") {\n        opacity: 0;\n        transition-property: opacity;\n      }\n      .multiflip." + FLIPPED_CLASS + " > :not(." + CHIP_CLASS + ") {\n        opacity: 1;\n      }\n    ";

  document.body.appendChild(style);
};

/**
 * Performs multiflipping and shows the content.
 * @return {Promise}
 */
Multiflip.prototype.show = function show () {
  this.el.classList.add(FLIPPED_CLASS);

  return wait(this.unitDur * 2)
};

/**
 * Perfoms multiflipping and hides the content.
 * @return {Promise}
 */
Multiflip.prototype.hide = function hide () {
  this.el.classList.remove(FLIPPED_CLASS);

  return wait(this.unitDur * 2)
};

return Multiflip;

})));
