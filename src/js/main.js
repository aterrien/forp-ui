/**
 * forp-ui
 *
 * Profile dump explorer.
 *
 * https://github.com/aterrien/forp-ui
 *
 * forp-ui is the perfect tool to treat the
 * call stack built by forp PHP profiler
 * (https://github.com/aterrien/forp-PHP-profiler).
 *
 * Example :
 * <code>
 *  <script src="js/forp.min.js"></script>
 *  <script>
 *  (new forp.Controller())
 *  .setStack([
 *      "utime" : 0,
 *      "stime" : 0,
 *      "stack" : [
 *          {
 *          "file":"\/var\/www\/forp-ui\/js_demo.php",
 *          "function":"{main}",
 *          "usec":618,
 *          "pusec":5,
 *          "bytes":14516,
 *          "level":0
 *          },
 *          {
 *          "file":"\/var\/www\/forp-ui\/common.php",
 *          "function":"include",
 *          "lineno":6,
 *          "usec":347,
 *          "pusec":6,
 *          "bytes":7364,
 *          "level":1,
 *          "parent":0
 *          }
 *      ]
 *  ]).run();
 *  </script>
 * </code>
 *
 * Copyright (c) 2013 @aterrien, @ichiriac
 *
 * Under MIT and GPL licenses:
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 */
if(typeof forp == "undefined") {var forp = {};}
if(typeof forp.plugins == "undefined") {forp.plugins = {};}

/**
 * Main
 *
 * This is the forp-ui Facade.
 *
 * Adds some plugins for jMicro.
 */
(function(forp, $) {

    "use strict";

    $.fn.forp = function(options) {
        options = $.extend(
            {
                stack: [],
                mode: "embedded"
            },
            options
        );

        (new forp.Controller({parent: this[0], mode: options.mode}))
            .setStack(options.stack)
            .run();

    };

})(forp, jMicro);