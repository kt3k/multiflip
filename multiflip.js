(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = jQuery;

var DEFAULT_UNIT_DIR = 400;
var DEFAULT_CONTENT_SHOW_DUR = 400;

var DEFAULT_M = 4;
var DEFAULT_N = 4;

var DEFAULT_BGCOLOR = '#393F44';
var CHIP_CLASS = 'multiflip-chip';

var FLIP_TRANSFORM = 'rotate3d(1, -1, 0, -180deg)'; // Transformation for the flipping a chip

var wait = function wait(n) {
    return new Promise(function (resolve) {
        return setTimeout(resolve, n);
    });
};

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

var Multiflip = function () {
    /**
     * @param {jQuery} elem The jquery dom
     */

    function Multiflip(elem) {
        _classCallCheck(this, Multiflip);

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
    }

    /**
     * Initializes the multiflip.
     * @param {jQuery} elem The jquery dom
     * @private
     */


    _createClass(Multiflip, [{
        key: 'init',
        value: function init(elem) {
            this.content.css({
                opacity: 0, // sets the content invisible at first
                transitionDuration: this.contentShowDur + 'ms' // sets the content's transition duration
            });

            this.chipGroups = [];

            for (var i = 0; i < this.m; i++) {
                for (var j = 0; j < this.n; j++) {
                    var chip = this.createChip(i * this.uw, j * this.uh, this.uw, this.uh).prependTo(elem).addClass(CHIP_CLASS);

                    var group = i + j;

                    this.chipGroups[group] = this.chipGroups[group] || [];
                    this.chipGroups[group].push(chip);
                }
            }

            return this;
        }

        /**
         * Creates the pane's chip
         * @private
         * @param {Number} left The left offset
         * @param {Number} top The top offset
         * @param {Number} w The width
         * @param {Number} h The height
         */

    }, {
        key: 'createChip',
        value: function createChip(left, top, w, h) {
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
            });
        }

        /**
         * Performs multiflipping and shows the content.
         * @return {Promise}
         */

    }, {
        key: 'show',
        value: function show() {
            var _this = this;

            return this.chipGroups.map(function (group, i) {
                return wait(_this.diffDur * i).then(function () {
                    group.forEach(function (chip) {
                        return chip.css('transform', '');
                    });

                    return wait(_this.unitDur * 3 / 4);
                    // Ignore the last 25% of the flipping for the moment and
                    // starts showing the content.
                });
            }).pop().then(function () {
                return _this.showContents();
            });
        }

        /**
         * Shows the contents.
         * @private
         * @return {Promise}
         */

    }, {
        key: 'showContents',
        value: function showContents() {
            this.content.css('opacity', 1); // shows the content

            return wait(this.contentShowDur); // waits for the content showing
        }

        /**
         * Perfoms multiflipping and hides the content.
         * @return {Promise}
         */

    }, {
        key: 'hide',
        value: function hide() {
            var _this2 = this;

            return this.hideContents().then(function () {
                return _this2.chipGroups.map(function (group, i) {
                    return _this2.hideChipGroupWithDelay(group, _this2.diffDur * i);
                }).pop();
            });
        }

        /**
         * Hides the group of the chip with the given delay
         * @param {jQuery[]} group
         * @param {number} delay
         */

    }, {
        key: 'hideChipGroupWithDelay',
        value: function hideChipGroupWithDelay(group, delay) {
            var _this3 = this;

            return wait(delay).then(function () {
                group.forEach(function (chip) {
                    return chip.css('transform', FLIP_TRANSFORM);
                });

                return wait(_this3.unitDur / 2);
                // waits only the half of the unit dur
                // because when the chip is half flipped, then it's already invisible.
            });
        }

        /**
         * Hides the contents.
         * @private
         * @return {Promise}
         */

    }, {
        key: 'hideContents',
        value: function hideContents() {
            this.content.css('opacity', 0); // hides the content

            return wait(this.contentShowDur);
        }
    }]);

    return Multiflip;
}();

$.cc('multiflip', Multiflip);

},{}]},{},[1]);
