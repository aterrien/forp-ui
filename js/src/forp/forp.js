/**
 * forp-ui
 *
 * Profile dump viewer.
 *
 * https://github.com/aterrien/forp-ui
 *
 * forp-ui is the perfect tool to treat the
 * call stack built by forp PHP profiler (https://github.com/aterrien/forp).
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
 * Copyright (c) 2013 Anthony Terrien
 *
 * Under MIT and GPL licenses:
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 */
var forp = {};
(function(f) {

    "use strict";

    /**
    * DOM Element wrapper creator
    * @param DOM Element
    * @return forp.DOMElementWrapper
    */
    forp = f = {
        /**
         * Call stack array
         */
        stack : [],
        /**
         * Wrap function
         */
        wrap : function(element)
        {
            return new f.DOMElementWrapper(element);
        },
        /**
         * Shortcut function
         */
        create : function(tag, appendTo, inner, css)
        {
            var e = document.createElement(tag);
            if(inner) e.innerHTML = inner;
            if(appendTo) appendTo.append(f.wrap(e));
            if(css) {
                var classAttr = document.createAttribute("class");
                classAttr.nodeValue = css;
                e.setAttributeNode(classAttr);
            }
            return f.wrap(e);
        },
        /**
         * Find a DOM Element
         * @param mixed
         * @return forp.DOMElementWrapper|forp.DOMElementWrapperCollection
         */
        find : function(mixed)
        {
            if(typeof(mixed) == 'object') {
                return f.wrap(mixed);
            } else {
                return new f.DOMElementWrapperCollection(document.querySelectorAll(mixed));
            }
        },
        /**
         * DOM Ready function
         * @param callback
         */
        ready : function(callback) {
            /* Internet Explorer */
            /*@cc_on
            @if (@_win32 || @_win64)
                document.write('<script id="ieScriptLoad" defer src="//:"><\/script>');
                document.getElementById('ieScriptLoad').onreadystatechange = function() {
                    if (this.readyState == 'complete') {
                        callback();
                    }
                };
            @end @*/
            if (document.addEventListener) {
                /* Mozilla, Chrome, Opera */
                document.addEventListener('DOMContentLoaded', callback, false);
            } else if (/KHTML|WebKit|iCab/i.test(navigator.userAgent)) {
                /* Safari, iCab, Konqueror */
                var DOMLoadTimer = setInterval(function () {
                    if (/loaded|complete/i.test(document.readyState)) {
                        callback();
                        clearInterval(DOMLoadTimer);
                    }
                }, 10);
            } else {
                /* Other web browsers */
                window.onload = callback;
            }
        },
        /**
         * @param string v
         * @return int
         */
        round : function(v)
        {
            return (~~ (0.5 + (v * 1000))) / 1000;
        },
        /**
         * @param string v
         * @param int d
         * @return int
         */
        roundDiv : function(v, d)
        {
            return this.round(v / d);
        },
        /**
         * inArray
         * @param needle
         * @param haystack
         */
        inArray : function(needle, haystack) {
            var length = haystack.length;
            for(var i = 0; i < length; i++) {
                if(haystack[i] == needle) return true;
            }
            return false;
        },
        /**
         * Normalizr Class
         */
        Normalizr : {
            getEventTransitionEnd : function() {
                var t;
                var el = document.createElement('fakeelement');
                var transitions = {
                'transition':'transitionEnd',
                'OTransition':'oTransitionEnd',
                'MSTransition':'msTransitionEnd',
                'MozTransition':'transitionend',
                'WebkitTransition':'webkitTransitionEnd'
                }

                for(t in transitions){
                    if( el.style[t] !== undefined ){
                        return transitions[t];
                    }
                }
            }
        },
        /**
         * Utils, helpers
         */
        Utils : {
            /**
             * TODO depth
             * @param path File path
             */
            trimPath : function(path)
            {
                var pathSplit = path.split('/');
                if(pathSplit.length > 3) {
                    pathSplit = [pathSplit[pathSplit.length - 4], pathSplit[pathSplit.length - 3], pathSplit[pathSplit.length - 2], pathSplit[pathSplit.length - 1]];
                    path = pathSplit.join('/');
                }
                return path;
            }
        },
        /**
         * Sorted Fixed Array Class
         * @param callback compare
         * @param int size
         */
        SortedFixedArray : function(compare, size) {
            this.stack = [];
            this.size = size;
            /**
             * Internal method insert
             * @param mixed entry
             * @param int i
             */
            this.insert = function(entry, i) {
                for(var j = Math.min(this.size - 1, this.stack.length); j > i; j--) {
                    this.stack[j] = this.stack[j - 1];
                }
                this.stack[i] = entry;
            }
            /**
             * Evaluate and put a new entry in the stack
             * @param mixed entry
             */
            this.put = function(entry) {
                if(this.stack.length) {
                    for(var i = 0; i < this.stack.length; i++) {
                        if(compare(entry, this.stack[i])) {
                            this.insert(entry, i);
                            break;
                        }
                    }
                    if(
                        (i == this.stack.length)
                        && (this.stack.length < this.size)
                    ) {
                        this.insert(entry, i);
                    }
                } else {
                    this.insert(entry, 0);
                }
            };
        }
    };
})(forp);