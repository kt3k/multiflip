(function ($) {
    'use strict'

    var DEFAULT_UNIT_DIR = 400

    var DEFAULT_BGCOLOR = '#393F44'
    var DEFAULT_CHIP_CLASS = 'chipClass'

    var FLIP_TRANSFORM = 'rotate3d(1, -1, 0, -180deg)'

    var wait = function (n) {

        return new Promise(function (resolve) {

            setTimeout(resolve, n)

        })

    }

    /**
     * Multiflip class handles the behaviours of multi-flipping.
     *
     * @class Multiflip
     */
    var Multiflip = $.cc.subclass(function (pt) {

        pt.constructor = function ($dom, m, n, width, height, unitDur, bgcolor, chipClass) {

            this.$dom = $dom
            this.$content = $('*', $dom)
            this.w = width || $dom.width()
            this.h = height || $dom.height()

            if (!this.w) {

                console.log('error: dom width unavailable')
                return null

            }

            if (!this.h) {

                console.log('error: dom height unavailable')
                return null

            }

            this.m = m
            this.n = n
            this.uw = this.w / m
            this.uh = this.h / n

            this.unitDur = unitDur
            this.diffDur = unitDur / (m + n)

            this.bgcolor = bgcolor

            this.chipClass = chipClass || DEFAULT_CHIP_CLASS

        }

        /**
         * Initializes the multiflip.
         *
         * @method init
         * @private
         */
        pt.init = function () {

            this.$dom.width(this.w).height(this.h)

            this.$content.css({opacity: 0, transitionDuration: this.unitDur + 'ms'})

            this.chipGroups = []

            for (var i = 0; i < this.m; i++) {

                for (var j = 0; j < this.n; j++) {

                    var chip = this.createChip(i * this.uw, j * this.uh, this.uw, this.uh)
                        .prependTo(this.$dom).addClass(this.chipClass)

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

            this.init()

            var that = this
            var p = wait()

            this.chipGroups.forEach(function (group) {

                p = p.then(function () {

                    group.forEach(function (chip) {

                        chip.css('transform', '')

                    })

                    return wait(that.diffDur)

                })

            })

            return p.then(function () {

                return wait(that.unitDur / 2)

            }).then(function () {

                that.$content.css('opacity', 1)

                return wait(that.unitDur)

            }).then(function () {

                return that

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

            this.$content.css('opacity', 0)
            var p = wait(that.unitDur)

            this.chipGroups.forEach(function (group) {

                p = p.then(function () {

                    group.forEach(function (chip) {

                        chip.css('transform', FLIP_TRANSFORM)

                    })

                    return wait(that.diffDur)

                })

            })

            return p.then(function () {

                wait(that.unitDur)

            }).then(function () {

                return that

            })

        }

    })

    /**
     * Perform multifliping on the element.
     *
     * @example
     *     $('.main').multiflip(8, 4, {unitDur: 400}).show().then(function (mf) {
     *         mf.$dom.click(function () {
     *             mf.hide();
     *         });
     *     });
     *
     * @param {Number} n The horizontal partition number
     * @param {Number} m The vertical partition number
     * @param {Object} [opts] The options
     * @param {Number} [opts.width=this.width()] The pane's width
     * @param {Number} [opts.height=this.height()] The pane's height
     * @param {Number} [opts.unitDur=400] The unit duration of flip of small chip inside the pane
     * @param {String} [opts.bgcolor='#393F44'] The background color of the pane
     * @param {Number} [opts.zIndex=undefined] The z-index of the pane
     * @return {Multiflip}
     *
     */
    $.fn.multiflip = function (n, m, opts) {

        opts = opts || {}

        var ip = new Multiflip(this, n, m, opts.width, opts.height, opts.unitDur || DEFAULT_UNIT_DIR, opts.bgcolor || DEFAULT_BGCOLOR, opts.zIndex)

        return ip

    }

}(jQuery))
