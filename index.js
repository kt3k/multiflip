
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

    var InfoPane = function ($dom, m, n, width, height, unitDur, bgcolor, chipClass) {
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


    var ipPt = InfoPane.prototype;

    ipPt.init = function () {
        this.$dom.width(this.w).height(this.h);

        this.$content.css({opacity: 0, transitionDuration: this.unitDur + 'ms'});

        this.chipGroups = [];

        for (var i = 0; i < this.m; i++) {
            for (var j = 0; j < this.n; j ++) {
                var chip = this.createChip(i * this.uw, j * this.uh, this.uw, this.uh)
                    .prependTo(this.$dom).addClass(this.chipClass);

                var group = i + j;

                (this.chipGroups[group] = this.chipGroups[group] || []).push(chip);
            }
        }

        return this;
    };

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
     * Creates info pane.
     *
     * @method infoPane
     * @param {Number} n The horizontal partition number
     * @param {Number} m The vertical partition number
     * @param {Object} opts The options
     * @param {Number} opts.width The pane's width (default: the dom's width)
     * @param {Number} opts.height The pane's height (default: the dom's height)
     * @param {Number} opts.unitDur The unit duration of flip of small chip inside the pane (default: 400)
     * @param {String} opts.bgcolor The background color of the pane (default: '#393F44')
     * @param {zIndex} opts.zIndex The z-index of the pane (default: undefined);
     * @return {InfoPane} InfoPane object
     *
     * @example
     *    $('.main').infoPane(8, 4, {unitDur: 400}).show().then(function (ip) {
     *        ip.$dom.click(function () {
     *            ip.hide();
     *        });
     *    });
     *
     */
    $.fn.infoPane = function (n, m, opts) {
        opts = opts || {};

        var ip = new InfoPane(this, n, m, opts.width, opts.height, opts.unitDur || defaultUnitDur, opts.bgcolor || defaultBgcolor, opts.zIndex);

        return ip;

    };

}(window.jQuery));
