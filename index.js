(function ($) {
    'use strict';

    var defaultUnitDur = 400;

    var defaultBgcolor = '#393F44';
    var defaultChipClass = 'chipClass';

    var flipTransform = 'rotate3d(1, -1, 0, -180deg)';

    var wait = function (n) {

        return new Promise(function (resolve) {

            setTimeout(resolve, n);

        });

    };

    /**
     * MultiFlip class handles the behaviours of multi-flipping.
     *
     * @class MultiFlip
     */
    var MultiFlip = function ($dom, m, n, width, height, unitDur, bgcolor, chipClass) {
        this.$dom = $dom;
        this.$content = $('*', $dom);
        this.w = width || $dom.width();
        this.h = height || $dom.height();

        if (!this.w) {
            console.log('error: dom width unavailable');
            return null;
        }

        if (!this.h) {
            console.log('error: dom width unavailable');
            return null;
        }

        this.m = m;
        this.n = n;
        this.uw = this.w / m;
        this.uh = this.h / n;

        this.unitDur = unitDur;
        this.diffDur = unitDur / (m + n);

        this.bgcolor = bgcolor;

        this.chipClass = chipClass || defaultChipClass;
    };

    var ipPt = MultiFlip.prototype;

    /**
     * Initializes the info pane.
     *
     * @method init
     * @private
     */
    ipPt.init = function () {
        this.$dom.width(this.w).height(this.h);

        this.$content.css({opacity: 0, transitionDuration: this.unitDur + 'ms'});

        this.chipGroups = [];

        for (var i = 0; i < this.m; i++) {
            for (var j = 0; j < this.n; j++) {
                var chip = this.createChip(i * this.uw, j * this.uh, this.uw, this.uh)
                    .prependTo(this.$dom).addClass(this.chipClass);

                var group = i + j;

                (this.chipGroups[group] = this.chipGroups[group] || []).push(chip);
            }
        }

        return this;
    };

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
    ipPt.createChip = function (left, top, w, h) {
        return $('<div />').css({
            position: 'absolute',
            left: left + 'px',
            top: top + 'px',
            width: w + 'px',
            height: h + 'px',
            backgroundColor: this.bgcolor,
            transitionDuration: this.unitDur + 'ms',
            transform: flipTransform,
            backfaceVisibility: 'hidden'
        });
    };

    /**
     * Shows info pane.
     *
     * @method show
     * @return {Promise}
     */
    ipPt.show = function () {
        this.init();

        var that = this;
        var p = wait();

        this.chipGroups.forEach(function (group) {
            p = p.then(function () {

                group.forEach(function (chip) {
                    chip.css('transform', '');
                });

                return wait(that.diffDur);
            });
        });

        return p.then(function () {

            return wait(that.unitDur / 2);

        }).then(function () {
            that.$content.css('opacity', 1);

            return wait(that.unitDur);
        }).then(function () {

            return that;
        });
    };

    /**
     * Hides info pane.
     *
     * @method hide
     * @return {Promise}
     */
    ipPt.hide = function () {
        var that = this;

        this.$content.css('opacity', 0);
        var p = wait(that.unitDur);

        this.chipGroups.forEach(function (group) {
            p = p.then(function () {

                group.forEach(function (chip) {
                    chip.css('transform', flipTransform);
                });

                return wait(that.diffDur);
            });
        });

        return p.then(function () {

            wait(that.unitDur);

        }).then(function () {

            return that;
        });
    };

    /**
     * @class jQuery
     */

    /**
     * Perform multifliping on the element.
     *
     *     $('.main').multiflip(8, 4, {unitDur: 400}).show().then(function (mf) {
     *         mf.$dom.click(function () {
     *             mf.hide();
     *         });
     *     });
     *
     * @method multiflip
     * @param {Number} n The horizontal partition number
     * @param {Number} m The vertical partition number
     * @param {Object} [opts] The options
     * @param {Number} [opts.width=this.width()] The pane's width
     * @param {Number} [opts.height=this.height()] The pane's height
     * @param {Number} [opts.unitDur=400] The unit duration of flip of small chip inside the pane
     * @param {String} [opts.bgcolor='#393F44'] The background color of the pane
     * @param {Number} [opts.zIndex=undefined] The z-index of the pane
     * @return {InfoPane} InfoPane object
     *
     */
    $.fn.multiflip = function (n, m, opts) {

        opts = opts || {};

        var ip = new MultiFlip(this, n, m, opts.width, opts.height, opts.unitDur || defaultUnitDur, opts.bgcolor || defaultBgcolor, opts.zIndex);

        return ip;

    };

}(jQuery));
