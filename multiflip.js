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

var MultiflipContent = function MultiflipContent () {};

MultiflipContent.__init__ = function __init__ (ref) {
    var on = ref.on;

  on('transitionend')(this.prototype, 'onTransitionEnd');
  console.log('Hey');
};

MultiflipContent.prototype.__init__ = function __init__ () {
  var el = this.el;
  var transition = +el.getAttribute('transition');

  this.delay = +el.getAttribute('delay');

  el.style.transitionDuration = transition + "ms";
  el.style.transitionDelay = (this.delay) + "ms";
};

MultiflipContent.prototype.onTransitionEnd = function onTransitionEnd () {
  if (this.el.parentElement.classList.contains(FLIPPED_CLASS)) {
    this.el.style.transitionDelay = '0ms';
  } else {
    this.el.style.transitionDelay = (this.delay) + "ms";
  }
};

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
  var el = this.el;
  var ref = this.capsid;
    var initComponent = ref.initComponent;

  var width = el.clientWidth;
  var height = el.clientHeight;

  var m = +el.getAttribute('m') || DEFAULT_M;
  var n = +el.getAttribute('n') || DEFAULT_N;
  var unitW = width / m;
  var unitH = height / n;

  var unitDur = +el.getAttribute('unit-dur') || DEFAULT_UNIT_DIR;
  var diffDur = unitDur / (m + n);

  var bgcolor = el.getAttribute('bgcolor') || DEFAULT_BGCOLOR;

  this.flipDur = unitDur * 2;

  Multiflip.insertGlobalStyle();

  Array.prototype.forEach.call(el.children, function (child) {
    var transition = unitDur * CONTENT_SHOW_DURATION_RATIO;
    var delay = unitDur * (2 - CONTENT_SHOW_DURATION_RATIO);

    child.setAttribute('transition', transition);
    child.setAttribute('delay', delay);

    initComponent(MultiflipContent, child);
  });

  Array(n * m).fill().forEach(function (_, c) {
    var i = c % m;
    var j = Math.floor(c / m);

    var div = document.createElement('div');
    var style = div.style;

    div.classList.add(CHIP_CLASS);

    style.left = i * unitW + 'px';
    style.top = j * unitH + 'px';
    style.width = unitW + 'px';
    style.height = unitH + 'px';
    style.backgroundColor = bgcolor;
    style.transitionDuration = unitDur + 'ms';
    style.transitionDelay = diffDur * (i + j) + 'ms';

    el.insertBefore(div, el.firstChild);
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

  return wait(this.flipDur)
};

/**
 * Perfoms multiflipping and hides the content.
 * @return {Promise}
 */
Multiflip.prototype.hide = function hide () {
  this.el.classList.remove(FLIPPED_CLASS);

  return wait(this.flipDur)
};

return Multiflip;

})));
