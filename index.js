(function ($) {
    'use strict'

    var DEFAULT_UNIT_DIR = 400
    var DEFAULT_CONTENT_SHOW_DUR = 400

    var DEFAULT_M = 4
    var DEFAULT_N = 4

    var DEFAULT_BGCOLOR = '#393F44'
    var CHIP_CLASS = 'multiflip-chip'

    var FLIP_TRANSFORM = 'rotate3d(1, -1, 0, -180deg)' // Transformation for the flipping a chip

    var wait = function (n) {

        return new Promise(function (resolve) {

            setTimeout(resolve, n)

        })

    }

    /**
     * Multiflip class handles the behaviours of multi-flipping.
     *
     * <div class="multiflip" m="6" n="4" unit-dur="400" bgcolor="#4588aa"></div>
     *
     * - param {number} m The horizontal partition number
     * - param {number} n The vertical partition number
     * - param {number} unit-dur The unit duration of multiflipping
     * - param {number} content-show-dur The duration of showing and hiding the content
     * - param {string} bgcolor The background color of the flipping chips
     */
    var Multiflip = $.cc.subclass($.cc.Coelement, function (pt, parent) {

        pt.constructor = function (elem) {

            parent.constructor.call(this, elem)

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

            this.init()

        }

        /**
         * Initializes the multiflip.
         *
         * @method init
         * @private
         */
        pt.init = function () {

            this.content.css({
                opacity: 0, // sets the content invisible at first
                transitionDuration: this.contentShowDur + 'ms' // sets the content's transition duration
            })

            this.chipGroups = []

            for (var i = 0; i < this.m; i++) {

                for (var j = 0; j < this.n; j++) {

                    var chip = this.createChip(i * this.uw, j * this.uh, this.uw, this.uh)
                        .prependTo(this.elem).addClass(CHIP_CLASS)

                    var group = i + j

                    this.chipGroups[group] = this.chipGroups[group] || []
                    this.chipGroups[group].push(chip)

                }

            }

            return this

        }

        /**
         * Creates the pane's chip
         *
         * @method createChip
         * @param {Number} left The left offset
         * @param {Number} top The top offset
         * @param {Number} w The width
         * @param {Number} h The height
         * @private
         */
        pt.createChip = function (left, top, w, h) {

            return $('<div />').css({
                position: 'absolute',
                left: left + 'px',
                top: top + 'px',
                width: w + 'px',
                height: h + 'px',
                backgroundColor: this.bgcolor,
                transitionDuration: this.unitDur + 'ms',
                transform: FLIP_TRANSFORM,
                backfaceVisibility: 'hidden'
            })

        }

        /**
         * Performs multiflipping and shows the content.
         *
         * @method show
         * @return {Promise}
         */
        pt.show = function () {

            var that = this
            var p = wait()

            return this.chipGroups.map(function (group, i) {

                return p.then(function () {

                    return wait(that.diffDur * i)

                }).then(function () {

                    group.forEach(function (chip) {

                        chip.css('transform', '')

                    })

                    return wait(that.unitDur * 3 / 4) // Ignore the last 25% of the flipping for the moment and starts showing the content.

                })

            }).pop().then(function () {

                that.content.css('opacity', 1) // shows the content
                return wait(that.contentShowDur) // waits for the content showing

            })

        }

        /**
         * Perfoms multiflipping and hides the content.
         *
         * @method hide
         * @return {Promise}
         */
        pt.hide = function () {

            var that = this

            this.content.css('opacity', 0) // hides the content
            var p = wait(that.contentShowDur) // waits the content hiding

            return this.chipGroups.map(function (group, i) {

                return p.then(function () {

                    return wait(that.diffDur * i)

                }).then(function () {

                    group.forEach(function (chip) {

                        chip.css('transform', FLIP_TRANSFORM)

                    })

                    return wait(that.unitDur / 2) // waits only the half of the unit dur because when the chip is half flipped, then it's already invisible.

                })

            }).pop()

        }

    })

    $.cc.component('multiflip')(Multiflip)

}(jQuery))
