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
         * DOM Element wrapper, makes it fluent
         * @param DOM Element
         */
        DOMElementWrapper : function(element)
        {
            var self = this;
            this.element = element;
            this.classes = [];

            this.bind = function(evType, fn) {
                if (this.element.addEventListener) {
                    this.element.addEventListener(evType, fn, false);
                } else if (this.element.attachEvent) {
                    var r = this.element.attachEvent("on"+evType, fn);
                    return r;
                }
                return this;
            };
            this.unbind = function(evType, fn) {
                if (this.element.removeEventListener) {
                    this.element.removeEventListener(evType, fn, false);
                } else if (this.element.detachEvent) {
                    var r = this.element.detachEvent("on"+evType, fn);
                    return r;
                }
                return this;
            };
            this.trigger = function(eventName) {
                var event;
                if (document.createEvent) {
                    event = document.createEvent("HTMLEvents");
                    event.initEvent(eventName, true, true);
                } else {
                    event = document.createEventObject();
                    event.eventType = eventName;
                }

                event.eventName = eventName;
                //event.memo = memo || { };

                if (document.createEvent) {
                    this.element.dispatchEvent(event);
                } else {
                    this.element.fireEvent("on" + event.eventType, event);
                }
            };
            this.find = function(s) {
                return new f.DOMElementWrapperCollection(this.element.querySelectorAll(s));
            };

            this.prepend = function(o) {
                this.element.insertBefore(o.element, this.element.firstChild);
                return this;
            };
            this.append = function(o) {
                this.element.appendChild(o.element);
                return this;
            };
            this.appendTo = function(o) {
                o.append(this);
                return this;
            };
            this.class = function(c) {
                this.classes = [];
                return this.addClass(c);
            };
            this.getClass = function(c) {
                return this.getAttr("class");
            };
            this.addClass = function(c) {
                var cArr = c.split(" ");
                for (var i=0; i<cArr.length; i++) {
                    if(f.inArray(cArr[i], this.classes)) return this;
                    this.classes.push(cArr[i]);
                }
                return this.attr("class", this.classes.join(" "));
            };
            this.removeClass = function(c) {
                for (var k in this.classes) {
                    if (this.classes[k] == c) {
                        this.classes.splice(k, 1);
                    }
                }
                return this.attr("class", this.classes.join(" "));
            };
            this.text = function(t) {
                this.element.innerHTML = t;
                return this;
            };
            this.getAttr = function(attr) {
                return this.element.getAttribute(attr);
            };
            this.attr = function(attr, val) {
                var attr = document.createAttribute(attr);
                attr.nodeValue = val;
                this.element.setAttributeNode(attr);
                return this;
            };
            this.remove = function() {
                this.element.parentNode.removeChild(this.element);
            };
            this.empty = function() {
                this.element.innerHTML = '';
                return this;
            };
            this.top = function() {
                return this.getPosition().y;
            };
            this.getPosition = function() {
                var x = 0, y = 0, e = this.element;
                while(e){
                    x += e.offsetLeft;
                    y += e.offsetTop;
                    e = e.offsetParent;
                }
                return {x: x, y: y};
            };
            this.height = function() {
                return this.element.offsetHeight;
            };
            this.width = function() {
                return this.element.offsetWidth;
            };
            this.css = function(p, complete)
            {
                var transitionEnd = f.Normalizr.getEventTransitionEnd();
                var _c = function() {
                    complete();
                    document.removeEventListener(transitionEnd, _c);
                };
                document.addEventListener(transitionEnd, _c);
                this.attr("style", p);
                return this;
            };
            this.table = function(headers) {
                return (new f.Table(headers)).appendTo(this);
            };
            this.insertAfter = function(element) {
                this.element.parentNode.insertBefore( element.element, this.element.nextSibling );
                return this;
            };
            this.nextSibling = function() {
                return f.wrap(this.element.nextSibling);
            };
            this.addEventListener = function(listener) {
                listener.target = this;
                listener.init();
                return this;
            };
            this.scrollBottom = function() {
                this.element.scrollTop = f.wrap(this.element.firstChild).height();
                return this;
            };
        },
        /**
         * DOM Element Collection Class
         * @param DOM Element
         */
        DOMElementWrapperCollection : function(elements)
        {
            this.elements = elements;
            this.each = function(fn)
            {
                for(var i=0; i<this.elements.length; i++) {
                    fn(new f.DOMElementWrapper(this.elements[i]));
                }
            };
            this.getElement = function(i)
            {
                return new f.DOMElementWrapper(this.elements[i]);
            };
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
        },
        /**
         * Layout
         *
         * - Layout #forp
         *  - Navbar nav
         *  - MainPanel .mainpanel
         *   - Console .console
         *   - Sidebar .sidebar
         */
        Layout : function(viewMode)
        {
            var self = this;
            f.DOMElementWrapper.call(this);
            this.element = document.createElement("div");
            this.attr("id", "forp");

            this.mainpanel = null;
            this.nav = null;
            this.viewMode = viewMode; // embeddedExpanded, embeddedCompacted, standalone

            this.conf = {
                embeddedExpanded : {
                    size : function() {
                        self.attr(
                                "style",
                                "height: 70%"
                            );

                        if( self.getConsole()
                                .attr(
                                    "style",
                                    "height: " + (self.height()-45) + "px"
                                )
                                .hasSidebar()
                        ) {
                            self.getConsole()
                                .getSidebar()
                                .attr(
                                    "style",
                                    "height: " + (self.height()-45) + "px"
                                    );
                        }
                        if(window.onresize == null) {
                            window.onresize = function(e) {
                                self.size();
                            }
                        }
                    },
                    reduce : function() {
                        self.attr(
                            "style",
                            "height: 45px"
                        );
                    }
                }
                , embeddedCompacted : {
                    size : function() { return false },
                    reduce : function() { return false }
                }
                , standalone : {
                    size : function() {
                        self.attr(
                            "style",
                            "height: 100%"
                        );

                        if( self.getConsole()
                                .attr(
                                    "style",
                                    "height: " + (self.height()-45) + "px"
                                )
                                .hasSidebar()
                        ) {
                            self.getConsole()
                                .getSidebar()
                                .attr(
                                    "style",
                                    "height: " + (self.height()-45) + "px"
                                    );
                        }
                    },
                    reduce : function() { return false }
                }
            };

            this.setViewMode = function(viewMode)
            {
                this.viewMode = viewMode;
                return this;
            };

            this.getMainPanel = function()
            {
                if(!this.mainpanel) {
                    this.mainpanel = (new f.MainPanel(this)).appendTo(this);
                }
                return this.mainpanel;
            };

            this.getNav = function()
            {
                if(!this.nav) {
                    this.nav = (new f.Nav()).appendTo(this);
                }
                return this.nav;
            };

            this.getConsole = function()
            {
                return this.getMainPanel().getConsole();
            };

            this.open = function()
            {
                this.class(this.viewMode);
                return this;
            };

            this.size = function() {
                return (this.conf[this.viewMode].size() !== false);
            };

            this.reduce = function() {
                return (self.conf[self.viewMode].reduce() !== false);
            };

            this.compact = function(callback)
            {
                this.attr("style", "")
                    .empty()
                    .class(this.viewMode + " shadow");
                this.nav = null;
                this.mainpanel = null;

                callback();

                return this;
            };

            document.body.insertBefore(this.element, document.body.firstChild);
        },
        /**
         * Nav
         */
        Nav : function()
        {
            var self = this;
            f.DOMElementWrapper.call(this);
            this.element = document.createElement("nav");
        },
        /**
         * Panel
         * @param string id Panel ID
         */
        Panel : function(id)
        {
            var self = this;
            f.DOMElementWrapper.call(this);
            this.element = document.createElement("div");
            this.class(id + " panel");

            this.id = id;
        },
        /**
         * MainPanel
         * @param Layout layout
         */
        MainPanel : function(layout)
        {
            var self = this;
            f.Panel.call(this, "mainpanel");

            this.console = null;
            this.layout = layout;

            this.getConsole = function()
            {
                if(!this.console) {
                    this.console = (new f.Console(this)).appendTo(this);
                }
                return this.console;
            };

            this.open = function() {
                this.layout.size();
                return this;
            };

            this.close = function() {
                self.css(
                    "height: 0px",
                    function() {
                        //self.closeButton.remove();
                    }
                );
                return this;
            };
        },
        /**
         * ToggleButton Class
         * @param string label
         * @param function on On callback
         * @param mixed off Off callback function or false if off disabled
         * @param boolean triggerOn Fire click event if true
         */
        ToggleButton : function(label, on, off, triggerOn)
        {
            var self = this, click = null;
            f.DOMElementWrapper.call(this);
            this.element = document.createElement("a");

            this.text(label)
                .attr("href", "javascript:void(0);")
                .class("tbtn")
                .bind(
                    'click',
                    click = function(e) {
                        if(self.getAttr("data-state") == "on") {
                            off && (off(e) !== false)
                                && self.removeClass("highlight")
                                       .attr("data-state", "off");
                        } else {
                            on && (on(e) !== false)
                               && self.addClass("highlight")
                                      .attr("data-state", "on");
                        }
                    }
                );

            triggerOn && this.trigger("click");
        },
        /**
         * Sidebar Class
         * @param DOMElementWrapper parent
         */
        Sidebar : function(parent)
        {
            var self = this;
            f.Panel.call(this, "sidebar");
            this.addClass("w1of3");
            this.parent = parent;
        },
        /**
         * Console Class
         * @param DOMElementWrapper parent
         */
        Console : function(parent)
        {
            var self = this;
            f.Panel.call(this, "console");

            this.sidebar = null;
            this.parent = parent;

            this.open = function() {

                this.closeSidebar();
                this.parent.open();

                return this;
            };

            this.hasSidebar = function() {
                return (this.sidebar != null);
            };

            this.getSidebar = function() {
                if(!this.sidebar) {
                    this.addClass("w2of3");
                    this.sidebar = new f.Sidebar(this.parent);
                    this.parent
                        .append(this.sidebar)
                        .layout
                        .size();
                }
                return this.sidebar;
            };

            this.closeSidebar = function() {
                if(this.sidebar) {
                    this.removeClass("w2of3");
                    this.sidebar.remove();
                    this.sidebar = null;
                }
                return this;
            };
        },
        /**
         * @param Object headers
         */
        Table : function(headers)
        {
            f.DOMElementWrapper.call(this);
            this.element = document.createElement("table");

            if(headers) {
                var header = f.create("tr", this);
                for(var i in headers) {
                    f.create("th", header, headers[i]);
                }
            }

            this.line = function(cols) {
                return (new f.Line(cols)).appendTo(this);
            }
        },
        /**
         * @param Object cols
         */
        Line : function(cols)
        {
            f.DOMElementWrapper.call(this);
            this.element = document.createElement("tr");

            for(var i in cols) {
                if(typeof cols[i] === "object") {
                    f.create("td", this, "", "numeric w100").append(cols[i]);
                } else if(isNaN(cols[i])) {
                    f.create("td", this, cols[i]);
                } else {
                    f.create("td", this, cols[i], "numeric w100");
                }
            }
        },
        /**
         * Stack Tree Class
         * @param Object stack Call stack array
         */
        Tree : function(stack)
        {
            var self = this;
            f.DOMElementWrapper.call(this);
            this.element = document.createElement("div");

            /**
             * Generates a tree representation (UL) of the stack
             *
             * @param array entry Root entry
             * @param boolean recursive Says if we have to fetch it recursively
             * @return Object Wrapped UL
             */
            this.treeList = function(entry, recursive)
            {
                var ul = f.create("ul").class("l" + entry.level)
                    , ex = f.create("div")
                            .text("&nbsp;")
                            .addClass("left expander")
                    , gd = new f.Gauge(
                                entry.usec,
                                stack[entry.parent] ? stack[entry.parent].usec : entry.usec,
                                1000,
                                'ms'
                            ).addClass("left")
                    , gb = new f.Gauge(
                                entry.bytes,
                                stack[entry.parent] ? stack[entry.parent].bytes : entry.bytes,
                                1024,
                                'Kb'
                            ).addClass("left")
                    , li = f.create("li").text(entry.id);


                if(entry.groups) {
                    for(var g in entry.groups) {
                        li.append(f.TagRandColor.provideElementFor(entry.groups[g]));
                    }
                }
                if(entry.caption) li.append(f.create("span").text(entry.caption));

                li.append(ex)
                  .append(gd)
                  .append(gb)
                  .appendTo(ul);

                if(entry.childrenRefs) {
                    //if(parseInt(entry.level) >= 2){
                        li.addClass("collapsed");
                    //} else {
                    //    li.addClass("expanded");
                    //}
                    ex.bind(
                        'click'
                        , function() {
                            //var h2 = (self.getConsole().height() / 2);
                            // scroll to middle
                            //if(ex.top() > h2) self.getConsole().element.scrollTop = ex.top() - h2;

                            if(li.getClass() == "expanded") {
                                li.class("collapsed");
                            } else {
                                li.class("expanded");
                                if(!li.getAttr("data-tree")) {
                                    for(var i in entry.childrenRefs) {
                                        self.treeList(stack[entry.childrenRefs[i]], true)
                                            .appendTo(li);
                                    }
                                    li.attr("data-tree", 1);
                                }
                            }
                        }
                    );

                    if(parseInt(entry.level) < 2) {
                        li.class("expanded");
                        if(!li.getAttr("data-tree")) {
                            li.attr("data-tree", 1);
                            var loopCounter,
                                lastId,
                                loopMaxIter = 100;

                            for(var i in entry.childrenRefs) {

                                if(stack[entry.childrenRefs[i]].id == lastId) {
                                    loopCounter++;
                                } else {
                                    loopCounter = 0;
                                }
                                lastId = stack[entry.childrenRefs[i]].id;

                                // loop detected, max item reached
                                if(loopCounter == loopMaxIter) {
                                    f.create("ul")
                                        .append(
                                            f.create("li")
                                             .append(ex)
                                             .append(
                                                f.create("div")
                                                    .text(lastId + " : too many items to display (>" + loopMaxIter + ")")
                                             )
                                        )
                                        .appendTo(li);
                                    continue;
                                }

                                if(loopCounter < loopMaxIter) {
                                    this.treeList(stack[entry.childrenRefs[i]])
                                        .appendTo(li);
                                }
                            }
                        }
                    } else {
                        li.addClass("collapsed");
                    }
                }

                return ul;
            };

            this.append(this.treeList(stack[0], true));
        },
        /**
         * Backtrace Class
         * @param integer i Index
         * @param Object stack Callc stack array
         */
        Backtrace : function(i, stack)
        {
            f.DOMElementWrapper.call(this);
            this.element = document.createElement("div");
            this.class("backtrace")
                .attr("style", "text-align: center");

            this.prependItem = function(entry, highlight) {
                return this.prepend(
                    f.create("div")
                        .class("backtrace-item " + (highlight ? " highlight" : ""))
                        .text(
                            "<span style='font-weight:bold'>" + entry.id + "</span><br>" +
                            f.Utils.trimPath(entry.filelineno) + "<br>" +
                            f.roundDiv(entry.usec, 1000).toFixed(3) + "ms " +
                            f.roundDiv(entry.bytes, 1024).toFixed(3) + "Kb"
                        )
                );
            };

            var child = i;
            while(i != null) {
                this.prependItem(stack[i], child == i);
                i = stack[i].parent;
                if(i != null) {
                    this.prepend(f.create("div").text("&#x25BC;"));
                }
            }

            this.prepend(f.create("br"))
                .prepend(f.create("br"))
                .append(f.create("br"))
                .append(f.create("br"));
        },
        /**
         * LineEventListenerBacktrace Class
         * @param i Stack index
         * @param context
         */
        LineEventListenerBacktrace : function(i, context)
        {
            this.target = null;
            this.init = function()
            {
                this.target.attr("data-ref", i)
                    .bind(
                        "click",
                        function(e) {
                            e.preventDefault();
                            e.stopPropagation();

                            var line = f.wrap(this);
                            context.getConsole()
                                .getSidebar()
                                .empty()
                                .append(
                                    new f.Backtrace(
                                        line.getAttr("data-ref"),
                                        context.getStack().stack
                                    )
                                )
                                .scrollBottom();
                        }
                    );
            }
        },
        /**
         * Gauge Class
         * @param integer value
         * @param integer max
         * @param integer divider
         * @param string unit
         */
        Gauge : function(value, max, divider, unit)
        {
            f.DOMElementWrapper.call(this);
            this.element = document.createElement("div");

            var percent = 0, text, displayedValue;

            displayedValue = f.roundDiv(value, (divider ? divider : 1));

            if(value < 0) {
                displayedValue = Math.abs(displayedValue);
            }
            if(displayedValue % 1 !== 0) {
                displayedValue = displayedValue.toFixed(3);
            }
            displayedValue += (unit ? unit : '');

            if(value > max) {
                text = "reached " + displayedValue;
            } else if(value < 0) {
                text = "won " + displayedValue;
            } else {
                text = displayedValue;
                percent = f.round(value * 100 / max);
            }


            this.addClass("gauge")
                .append(
                    f.create("div")
                        .class("text")
                        .text(text)
                )
                .append(
                    f.create("div")
                        .addClass("bar")
                        .attr(
                            "style",
                            "width: " + percent.toFixed(0) + "%"
                            )
                );
        },
        /**
         * TagRandColor Class
         * Provides predefined colors
         */
        TagRandColor : {
            i : 0,
            pocket : ["#f95", "#f59", "#59f", "#5e9", "#9e6", "#95f",
                    "#e55", "#fe6", "#f6f", "#5e5", "#5ef", "#55f"],
            tagsColor : {},
            provideFor : function(name)
            {
                if(!this.tagsColor[name]) {
                    if(this.i < this.pocket.length) {
                        this.tagsColor[name] = this.pocket[this.i];
                        this.i++;
                    } else {
                        this.tagsColor[name] = 'rgb(' +
                            Math.round(Math.random() * 100 + 155) + ',' +
                            Math.round(Math.random() * 100 + 155) + ',' +
                            Math.round(Math.random() * 100 + 155)
                            + ')';
                    }
                }
                return this.tagsColor[name];
            },
            provideElementFor : function(name)
            {
                return f.create("a")
                        .class("tag")
                        .attr(
                            'style',
                            'color: #fff; background: ' + this.provideFor(name)
                        )
                        .text(name)
                        .bind(
                            "click",
                            function(){
                                //alert('to groups view');
                            }
                        );
            }
        },
        /**
         * Stack Class
         * @param Object stack Call stack array
         */
        Stack : function(stack)
        {
            var self = this;

            this.stack = (stack.stack != null) ? stack.stack : []; // RAW stack
            this.utime = (stack.utime != null) ? stack.utime : null;
            this.stime = (stack.stime != null) ? stack.stime : null;
            this.functions = null; // indexed stack
            this.includes = null; // included files
            this.includesCount = 0;
            this.groups = null; // groups
            this.groupsCount = 0;
            this.leaves = null;
            this.topCpu = null;
            this.topCalls = null;
            this.topMemory = null;
            this.found = {};
            this.maxNestedLevel = 0;
            this.avgLevel = 0;

            /**
             * Function struct
             * Internal Class of Stack
             */
            var Function = function(conf)
            {
                this.stack = conf.stack;
                this.id = conf.id;
                this.class = conf.class;
                this.function = conf.function;
                this.refs = [];
                this.entries = [];
                this.calls = 1;
                this.duration = null;
                this.memory = null;

                /**
                 * @param string filelineno
                 * @param Object entry
                 * @return Function
                 */
                this.setEntry = function(filelineno, entry)
                {
                    this.entries[filelineno] = entry;
                    return this;
                };
                /**
                 * @return Function
                 */
                this.incrCalls = function()
                {
                    this.calls ++;
                    return this;
                };
                /**
                 * @return integer
                 */
                this.getDuration = function() {
                    if(this.duration !== null) return this.duration;
                    this.duration = 0;
                    for(var i in this.refs) {
                        if(this.isRecursive(this.refs[i])) continue;
                        this.duration += this.refs[i].usec;
                    }
                    return this.duration;
                };
                /**
                 * @return integer
                 */
                this.getMemory = function() {
                    if(this.memory !== null) return this.memory;
                    this.memory = 0;
                    for(var i in this.refs) {
                        if(this.isRecursive(this.refs[i])) continue;
                        this.memory += this.refs[i].bytes;
                    }
                    return this.memory;
                };
                /**
                 * @param Object stack entry
                 * @return bool
                 */
                this.isRecursive = function(entry)
                {
                    var i = entry.i;
                    while(this.stack[i].parent > 0) {
                        i = this.stack[i].parent;
                        if(this.stack[i].id == entry.id) return true;
                    }
                    return false;
                };
            }

            /**
             * Refines ancestors metrics
             * @param object Descendant stack entry
             * @return forp.Controller
             */
            this.refineParents = function(descendant, value)
            {
                if(descendant.parent == undefined) return;
                this.stack[descendant.parent].usec -= value;
                this.refineParents(this.stack[descendant.parent], value);
                return this;
            };
            /**
             * Aggregates stack entries
             * This is the core function
             *
             * One loop to compute :
             * - top duration
             * - top memory
             * - groups
             * - included files
             *
             * @return forp.Controller
             */
            this.aggregate = function()
            {
                if(!this.functions) {
                    // hashing stack
                    var id, filelineno, ms, kb, lastEntry;
                    this.functions = {};
                    this.includes = {};
                    this.groups = {};
                    this.leaves = [];

                    this.topCpu = new f.SortedFixedArray(
                        function(a, b) {
                            return (a.usec > b.usec);
                        },
                        20
                    );

                    this.topMemory = new f.SortedFixedArray(
                        function(a, b) {
                            return (a.bytes > b.bytes);
                        },
                        20
                    );

                    for(var entry in this.stack) {

                        id = this.getEntryId(this.stack[entry]);
                        filelineno = this.stack[entry].file + (this.stack[entry].lineno ? ':' + this.stack[entry].lineno : '');
                        ms = f.roundDiv(this.stack[entry].usec, 1000);
                        kb = f.roundDiv(this.stack[entry].bytes, 1024);

                        // entry
                        this.stack[entry].i = entry;
                        this.stack[entry].filelineno = filelineno;

                        // unit cost
                        if(lastEntry && (lastEntry.level >= this.stack[entry].level)) {
                            this.leaves.push(lastEntry);
                            this.topCpu.put(lastEntry);
                            this.topMemory.put(lastEntry);
                        }

                        // max nested level
                        this.maxNestedLevel = (this.stack[entry].level > this.maxNestedLevel)
                            ? this.stack[entry].level : this.maxNestedLevel ;

                        this.avgLevel += this.stack[entry].level;

                        this.stack[entry].id = id;

                        // Counts leafs
                        if(this.stack[this.stack[entry].parent]) {
                            if(!this.stack[this.stack[entry].parent].childrenRefs) {
                                this.stack[this.stack[entry].parent].childrenRefs = [];
                            }
                            this.stack[this.stack[entry].parent].childrenRefs.push(entry);
                        }

                        // Constructs functions
                        if(this.functions[id]) {
                            this.functions[id].incrCalls();

                            // Linking between functions and stack entries
                            if(this.functions[id].entries[filelineno]) {
                                this.functions[id].entries[filelineno].calls++;
                            } else {
                                this.functions[id].setEntry(
                                    filelineno,
                                    {
                                        calls : 1
                                        , file : this.stack[entry].file
                                        , filelineno : filelineno
                                        , refs : []
                                    }
                                );
                            }

                        } else {

                            // indexing by function id
                            this.functions[id] = new Function({
                                stack : this.stack,
                                id : id,
                                class : this.stack[entry].class ? this.stack[entry].class : null,
                                function : this.stack[entry].function
                            }).setEntry(
                                filelineno,
                                {
                                    calls : 1
                                    , file : this.stack[entry].file
                                    , filelineno : filelineno
                                    , refs : []
                                }
                            );

                            // Groups
                            if(this.stack[entry].groups) {
                                for(var g in this.stack[entry].groups) {
                                    if(!this.groups[this.stack[entry].groups[g]]) {
                                        this.groups[this.stack[entry].groups[g]] = {
                                            calls : 0
                                            , usec : 0
                                            , bytes : 0
                                            , refs : []
                                        };
                                    }
                                    this.groups[this.stack[entry].groups[g]].refs.push(this.stack[entry]);
                                }
                            }
                        }

                        // Linking between functions and stack entries
                        this.functions[id].refs.push(this.stack[entry]);
                        this.functions[id].entries[filelineno].refs.push(this.stack[entry]);

                        // Refines ancestors
                        this.stack[entry].pusec &&
                        this.refineParents(this.stack[entry], this.stack[entry].pusec);

                        // Files
                        if(!this.includes[this.stack[entry].file]) {
                            this.includes[this.stack[entry].file] = {
                                usec : ms
                                , bytes : kb
                                , calls : 1
                            };
                            this.includesCount++;
                        } else {
                            this.includes[this.stack[entry].file].usec += ms;
                            this.includes[this.stack[entry].file].bytes += kb;
                            this.includes[this.stack[entry].file].calls++;
                        }

                        lastEntry = this.stack[entry];
                    } // end foreach stack

                    // unit cost / last entry
                    this.leaves.push(lastEntry);
                    this.topCpu.put(lastEntry);
                    this.topMemory.put(lastEntry);

                    // Finalize groups
                    for(var group in this.groups) {
                        this.groupsCount++;
                        for(var i in this.groups[group].refs) {
                            this.groups[group].calls += this.functions[this.groups[group].refs[i].id].calls;
                            this.groups[group].usec += this.functions[this.groups[group].refs[i].id].getDuration();
                            this.groups[group].bytes += this.functions[this.groups[group].refs[i].id].getMemory();
                        }
                    }

                    this.avgLevel = this.avgLevel / this.stack.length;
                }

                return this;
            };

            /**
             * @return array Main entry
             */
            this.getMainEntry = function()
            {
                return this.stack[0];
            };

            /**
             * @param array Stack entry
             * @return string
             */
            this.getEntryId = function(entry)
            {
                return ((entry.class) ? entry.class + '::' : '') + entry.function;
            };

            /**
             * @return array
             */
            this.getFunctions = function()
            {
                return this.aggregate().functions;
            };

            /**
             * Regexp search in stack functions
             * @param string query
             * @return array founds
             */
            this.search = function(query)
            {
                if(!this.found[query]) {
                    this.found[query] = [];
                    for(var entry in this.getFunctions()) {

                        // max 100 results
                        if(this.found[query].length == 100) return this.found[query];

                        var r = new RegExp(query, "i");
                        if(r.test(this.functions[entry].id))
                        this.found[query].push(this.functions[entry]);
                    }
                }
                return this.found[query];
            };

            /**
             * Top X calls
             * @return array SortedFixedArray stack
             */
            this.getTopCalls = function()
            {
                if(!this.topCalls) {
                    this.topCalls = new f.SortedFixedArray(
                        function(a, b) {return (a.calls > b.calls);},
                        20
                    );

                    for(var entry in this.getFunctions()) {
                        this.topCalls.put(this.functions[entry]);
                    }
                }
                return this.topCalls.stack;
            };

            /**
             * Top X CPU
             * @return array SortedFixedArray stack
             */
            this.getTopCpu = function()
            {
                return this.aggregate().topCpu.stack;
            };

            /**
             * Top X memory
             * @return array SortedFixedArray stack
             */
            this.getTopMemory = function()
            {
                return this.aggregate().topMemory.stack;
            };

            /**
             * Distinct included files
             * @return array Files
             */
            this.getIncludes = function()
            {
                return this.aggregate().includes;
            };

            /**
             * Groups
             * @return array Files
             */
            this.getGroups = function()
            {
                return this.aggregate().groups;
            };
        },
        /**
         * Grader Class
         *
         * Provides grades, quality metrics
         */
        Grader : function()
        {
            this.grades = {
                time : {
                    A : {
                        min : 0, max : 100, tip : ["Very good job !", "The planet will reward you !", "You'll be the king at the coffee machine.", "Your servers thanks you."]
                    },
                    B : {
                        min : 100, max : 300, tip : ["Good job !"]
                    },
                    C : {
                        min : 300, max : 600, tip : ["You are close to job performance."]
                    },
                    D : {
                        min : 600, max : 1000, tip : ["You are under one second.", "Think cache."]
                    },
                    E : {
                        min : 1000, max : 2000, tip : ["At your own risk !"]
                    }
                },
                memory : {
                    A : {
                        min : 0, max : 2000, tip : ["Very good job !"]
                    },
                    B : {
                        min : 2000, max : 4000, tip : ["Good job !"]
                    },
                    C : {
                        min : 4000, max : 8000, tip : ["Respectable"]
                    },
                    D : {
                        min : 8000, max : 12000, tip : ["It seems that you load too much data."]
                    },
                    E : {
                        min : 12000, max : 20000, tip : ["It seems that you load too much data."]
                    }
                },
                includes : {
                    A : {
                        min : 0, max : 5, tip : ["Very good job !"]
                    },
                    B : {
                        min : 5, max : 20, tip : ["Good job !"]
                    },
                    C : {
                        min : 30, max : 60, tip : ["A builder script could do the rest."]
                    },
                    D : {
                        min : 60, max : 120, tip : ["A builder script could be your best friend on this."]
                    },
                    E : {
                        min : 120, max : 240, tip : ["At your own risk !", "A builder script could be your best friend on this."]
                    }
                },
                calls : {
                    A : {
                        min : 0, max : 2000, tip : ["Very good job !", "This is the 'Hello world' script ?"]
                    },
                    B : {
                        min : 2000, max : 4000, tip : ["Very good job !"]
                    },
                    C : {
                        min : 4000, max : 8000, tip : ["Respectable"]
                    },
                    D : {
                        min : 8000, max : 16000, tip : ["Has a bad impact on performance."]
                    },
                    E : {
                        min : 32000, max : 64000, tip : ["It's a joke ?", "At your own risk !", "Too many instructions."]
                    }
                },
                nesting : {
                    E : {
                        min : 0, max : 5, tip : ["This is the 'Hello world' script ?"]
                    },
                    A : {
                        min : 5, max : 10, tip : ["Good job !"]
                    },
                    B : {
                        min : 10, max : 15, tip : ["Respectable"]
                    },
                    C : {
                        min : 15, max : 20, tip : ["Respectable"]
                    },
                    D : {
                        min : 20, max : 30, tip : ["Perhaps, are you currently refactoring ?"]
                    }
                }
            };

            this.getGrade = function(gradeName, mesure) {
                for(var grade in this.grades[gradeName]) {
                    if( mesure >= this.grades[gradeName][grade]['min']
                        && mesure <= this.grades[gradeName][grade]['max']
                    ) {
                        return grade;
                    }
                }
                return grade;
            };

            this.getTip = function(gradeName, grade) {
                var i = Math.floor((Math.random() * this.grades[gradeName][grade]['tip'].length));
                return this.grades[gradeName][grade]['tip'][i];
            };

            this.getGradeWithTip = function(gradeName, mesure) {
                var grade = this.getGrade(gradeName, mesure);
                return "<div class=grade-" + grade + ">" + grade + "</div> " + this.getTip(gradeName, grade);
            };
        },
        /**
         * forp stack manager
         * @param array forp stack
         */
        Controller : function(stack)
        {
            var self = this;

            this.layout = null;
            this.console = null;
            this.grader = null;
            this.tree = null;
            this.stack = null;
            this.openEventListener = null;
            this.viewMode = "embeddedCompacted";

            /**
             * @param string viewMode
             */
            this.setViewMode = function(viewMode)
            {
                this.viewMode = viewMode;
                return this;
            };

            /**
             * @return boolean Has stack
             */
            this.hasStack = function()
            {
                return this.stack != null;
            };

            /**
             * @param Stack stack
             * @return Controller
             */
            this.setStack = function(stack)
            {
                this.stack = new f.Stack(stack);
                return this;
            };

            /**
             * @return Stack
             */
            this.getStack = function()
            {
                return this.stack;
            };

            /**
             * @return Object Console
             */
            this.getConsole = function()
            {
                return this.layout.getConsole();
            };

            /**
             * @return Layout
             */
            this.getLayout = function()
            {
                if(!this.layout) this.layout = new f.Layout(this.viewMode);
                return this.layout;
            };

            /**
             * @return Grader
             */
            this.getGrader = function()
            {
                if(!this.grader) this.grader = new f.Grader();
                return this.grader;
            };

            /**
             * Run layout manager
             * @return forp.Controller
             */
            this.run = function()
            {
                try
                {
                    if(!self.hasStack()) {
                        throw {
                            name: "RuntimeError",
                            message: "Stack undefined."
                        }
                    }

                    if(self.getStack().stack.length > 20000) {
                        throw new RangeError("More than 20000 entries in the stack (" + self.getStack().stack.length + ").");
                    }

                    // append style in footer
                    var styleTarget = (document.getElementsByTagName('head')[0]
                                 || document.getElementsByTagName('body')[0]);

                    if(!styleTarget) {
                        throw {
                            name: "RuntimeError",
                            message: "Can't find head or body."
                        }
                    }

                    f.create('style')
                     .text('%forp.css%')
                     .appendTo(new f.DOMElementWrapper(styleTarget));

                    // proceeds and aggregates stack datas
                    self.getStack()
                        .aggregate();

                    if(this.viewMode == "embeddedCompacted") {
                        // compacted view mode
                        this.getLayout()
                            .compact(this.onCompact);
                    } else if(this.viewMode == "standalone") {
                        // open at run
                        this.open();
                    }
                } catch(e)
                {
                    // EvalError, RangeError, ReferenceError, SyntaxError,
                    // TypeError, URIError and custom exception
                    console.error("forp-ui > " + e.name + ": " + e.message);
                }
            };

            /**
             *
             */
            this.onCompact = function() {
                if(self.getStack().stack.length > 0) {

                    self.layout
                        .bind(
                            "click",
                            self.openEventListener = function() {
                                self.getLayout()
                                    .setViewMode('embeddedExpanded');
                                self.open();
                            }

                        );

                    f.create("div")
                        .attr("style", "margin-right: 10px")
                        .text(f.roundDiv(self.getStack().getMainEntry().usec, 1000) + ' ms ')
                        .appendTo(self.getLayout().getNav());

                    f.create("div")
                        .attr("style", "margin-right: 10px")
                        .text(f.roundDiv(self.getStack().getMainEntry().bytes, 1024) + ' Kb')
                        .appendTo(self.getLayout().getNav());
                } else {
                    f.create("div")
                        .text("Give me something to eat !")
                        .appendTo(self.getLayout().getNav());
                }
            };

            /**
             * Run on DOM ready
             */
            this.runOnReady = function()
            {
                f.ready(
                    function(){
                        self.run();
                    }
                );
            },

            /**
             *
             */
            this.clearTabs = function()
            {
                self.layout
                    .find(".tbtn")
                    .each(
                        function(o) {
                            o.class("tbtn");
                            o.attr("data-state", "off")
                        }
                    );
                return this;
            };

            /**
             * Select a tab
             * @param string DOM Element target
             * @return forp.Controller
             */
            this.selectTab = function(target)
            {
                this.clearTabs();
                f.find(target).class("tbtn highlight");
                return this;
            };

            /**
             * Show details table in a new line
             */
            this.toggleDetails = function()
            {
                var target = f.find(this);
                if(target.getAttr("data-details") == 1) {
                    target.nextSibling().remove();
                    target.attr("data-details", 0);
                    return;
                }

                target.attr("data-details", 1);

                var id = target.getAttr("data-ref"),
                    line = f.create("tr"),
                    td = f.create("td")
                        .attr("colspan", 4)
                        .appendTo(line),
                    table = td.table(["called from", " ms", "Kb"]),
                    lastId, loopCount, loopMaxIter = 100;

                calledFrom:
                for(var i in self.getStack().getFunctions()[id].entries) {
                    for(var j in self.getStack().getFunctions()[id].entries[i].refs) {

                        if(!self.getStack().getFunctions()[id].entries[i].refs[j]) continue;

                        // detecting loop
                        if(self.getStack().getFunctions()[id].entries[i].refs[j].id == lastId) {
                            loopCount++;
                        } else {
                            loopCount = 0;
                        }
                        lastId = self.getStack().getFunctions()[id].entries[i].refs[j].id;

                        // loop detected and max reached
                        if(loopCount >= loopMaxIter) {
                            table.append(
                                f.create("tr")
                                .append(
                                    f.create("td")
                                        .attr("colspan", 3)
                                        .css("text-align: center")
                                        .text(lastId + " : " +
                                            "too many items to display (>" +
                                            loopMaxIter + ")")
                                    )
                            );
                            break calledFrom;
                        }

                        table.line([
                            self.getStack().getFunctions()[id].entries[i].refs[j].filelineno +
                            (self.getStack().getFunctions()[id].entries[i].refs[j].caption ? "<br>" + self.getStack().getFunctions()[id].entries[i].refs[j].caption : ""),
                            new f.Gauge(
                                self.getStack().getFunctions()[id].entries[i].refs[j].usec,
                                self.getStack().getFunctions()[id].getDuration(),
                                1000,
                                'ms'
                            ),
                            new f.Gauge(
                                self.getStack().getFunctions()[id].entries[i].refs[j].bytes,
                                self.getStack().getFunctions()[id].getMemory(),
                                1024,
                                'Kb'
                            ),
                        ]).addEventListener(
                            new f.LineEventListenerBacktrace(
                                self.getStack().getFunctions()[id].entries[i].refs[j].i,
                                self
                            )
                        );
                    }
                }
                target.insertAfter(line);
            };

            /**
             * Expand main layout
             * @return forp.Controller
             */
            this.open = function()
            {
                this.getLayout()
                    .unbind("click", this.openEventListener)
                    .open();

                // footer
                f.create("div")
                 .class("footer")
                 .appendTo(this.layout);

                var container = f.create("div").attr("style", "margin-top: -2px");
                container.appendTo(this.getLayout().getNav());

                container.append(
                    new f.ToggleButton(
                        "metrics",
                        function(e) {

                            // TODO Metrics API
                            // @see http://www.sdmetrics.com/LoM.html
                            //   Cyclomatic complexity
                            //   Excessive class complexity
                            //   N-path complexity
                            //   Too many fields
                            //   Too many methods
                            // x Ease of change
                            var table = self.getConsole()
                                            .empty()
                                            .open()
                                            .table(["metric", "type", "value", "grade"]);

                            self.selectTab(e.target);

                            var duration = f.roundDiv(self.getStack().getMainEntry().usec, 1000),
                                memory = f.roundDiv(self.getStack().getMainEntry().bytes, 1024);

                            table.line(["<span style='font-weight:bold'>Real time (ms)</span>", "Performance",
                                duration + '',
                                self.getGrader().getGradeWithTip("time", duration)
                            ]);

                            if(self.getStack().utime != null) {
                                var time = (self.getStack().utime + self.getStack().stime) / 1000;
                                table.line(["<span style='font-weight:bold'>CPU time (ms)</span>", "Performance",
                                    time + '',
                                    self.getGrader().getGradeWithTip("time", time)
                                ]);
                            }

                            table.line(["<span style='font-weight:bold'>Memory usage (Kb)</span>", "Performance",
                                memory + '',
                                self.getGrader().getGradeWithTip("memory", memory)]);
                            table.line(["<span style='font-weight:bold'>Total includes</span>", "Performance",
                                self.getStack().includesCount + '',
                                self.getGrader().getGradeWithTip("includes", self.getStack().includesCount)]);
                            table.line(["<span style='font-weight:bold'>Total calls</span>", "Performance",
                                self.getStack().stack.length + '',
                                self.getGrader().getGradeWithTip("calls", self.getStack().stack.length)]);
                            table.line(["<span style='font-weight:bold'>Max nested level</span>", "Nesting",
                                self.getStack().maxNestedLevel + '',
                                self.getGrader().getGradeWithTip("nesting", self.getStack().maxNestedLevel)]);
                            table.line(["<span style='font-weight:bold'>Avg nested level</span>", "Nesting",
                                self.getStack().avgLevel.toFixed(2) + '',
                                self.getGrader().getGradeWithTip("nesting", self.getStack().avgLevel)]);
                            },
                        self.getLayout().reduce,
                        true
                    )
                );

                container.append(
                    new f.ToggleButton(
                        "stack (" + self.getStack().stack.length + ")",
                        function(e) {

                            if(!self.tree) self.tree = new f.Tree(self.getStack().stack);
                            self.selectTab(e.target)
                                .getConsole()
                                .empty()
                                .open()
                                .append(
                                    f.create("div")
                                        .attr("style", "margin-top: 10px;")
                                        .append(
                                            f.create("div")
                                                .attr("style", "position: absolute; margin: 5px; right: 20px")
                                                .append(
                                                    f.create("a")
                                                        .text("expand")
                                                        .attr("href", "javascript:void(0);")
                                                        .class("btn")
                                                        .bind(
                                                            "click",
                                                            function() {
                                                                f.find("li.collapsed[data-tree]")
                                                                    .each(
                                                                        function(e){
                                                                            e.attr("class", "expanded");
                                                                        }
                                                                    );
                                                            })
                                                    )
                                                .append(
                                                    f.create("a")
                                                        .text("collapse")
                                                        .attr("href", "javascript:void(0);")
                                                        .class("btn")
                                                        .bind(
                                                            "click",
                                                            function() {
                                                                f.find("li.expanded")
                                                                    .each(
                                                                        function(e){
                                                                            e.attr("class", "collapsed");
                                                                        }
                                                                    );
                                                            })
                                                    )
                                        )
                                        .append(
                                            f.create("div").append(self.tree)
                                        )
                                    );
                        },
                        self.getLayout().reduce
                    )
                );

                container.append(
                    new f.ToggleButton(
                        "top 20 duration",
                        function(e) {
                            var datas = self.getStack().getTopCpu();

                            self.selectTab(e.target);

                            /*for(var i = 0; i < self.leaves.length; i++) {
                                var h = (self.leaves[i].usec * 50) / datas[0].usec;
                                f.create("div")
                                    .attr("style", "height: 50px;")
                                    .class("left")
                                    .attr("style", "margin: 1px; width: 1px; height: " + h + "px; background: #4D90FE;")
                                    .appendTo(d);
                            }*/

                            var table = self.getConsole()
                                            .empty()
                                            .open()
                                            .table(["function", "self cost ms", "total cost ms", "calls"]);

                            for(var i in datas) {
                                var id = self.getStack().getEntryId(datas[i]);
                                table.line([
                                        "<span style='font-weight:bold'>" + datas[i].id + "</span> (" + datas[i].filelineno + ")"
                                        + (datas[i].caption ? "<br>" + datas[i].caption : ""),
                                        f.roundDiv(datas[i].usec, 1000).toFixed(3) + '',
                                        f.roundDiv(self.getStack().getFunctions()[id].getDuration(), 1000).toFixed(3) + '',
                                        self.getStack().getFunctions()[id].calls
                                    ])
                                    .addEventListener(
                                        new f.LineEventListenerBacktrace(
                                            datas[i].i,
                                            self
                                        )
                                    );
                            }
                        },
                        self.getLayout().reduce
                    )
                );

                container.append(
                    new f.ToggleButton(
                        "top 20 memory",
                        function(e) {
                            var datas = self.getStack()
                                            .getTopMemory();

                            self.selectTab(e.target);

                            var table = self.getConsole()
                                            .empty()
                                            .open()
                                            .table(["function", "self cost Kb", "total cost Kb", "calls"]);
                            for(var i in datas) {
                                var id = self.getStack().getEntryId(datas[i]);
                                table.line([
                                        "<span style='font-weight:bold'>" + datas[i].id + "</span> (" + datas[i].filelineno + ")"
                                        + (datas[i].caption ? "<br>" + datas[i].caption : ""),
                                        f.roundDiv(datas[i].bytes, 1024).toFixed(3) + '',
                                        f.roundDiv(self.getStack().getFunctions()[id].getMemory(), 1024).toFixed(3) + '',
                                        self.getStack().getFunctions()[id].calls
                                    ])
                                    .addEventListener(
                                        new f.LineEventListenerBacktrace(
                                            datas[i].i,
                                            self
                                        )
                                    );
                            }
                        },
                        self.getLayout().reduce
                    )
                );


                container.append(
                    new f.ToggleButton(
                        "top 20 calls",
                        function(e) {
                            var datas = self.getStack()
                                            .getTopCalls();

                            self.selectTab(e.target);

                            var table = self.getConsole()
                                            .empty()
                                            .open()
                                            .table(["function", "calls", "ms", "Kb"]);
                            for(var i in datas) {
                                table.line([
                                        datas[i].id,
                                        datas[i].calls,
                                        f.roundDiv(datas[i].getDuration(), 1000).toFixed(3) + '',
                                        f.roundDiv(datas[i].getMemory(), 1024).toFixed(3) + ''
                                    ])
                                    .attr("data-ref", datas[i].id)
                                    .bind(
                                        "click",
                                        self.toggleDetails
                                    );
                            }
                        },
                        self.getLayout().reduce
                    )
                );

                if(self.getStack().includesCount > 0)
                container.append(
                    new f.ToggleButton(
                        "files (" + self.getStack().includesCount + ")",
                        function(e) {
                            var datas = self.getStack()
                                            .getIncludes();

                            self.selectTab(e.target);

                            var table = self.getConsole()
                                            .empty()
                                            .open()
                                            .table(["file", "calls from"]);

                            for(var i in datas) {
                                table.line([
                                    i,
                                    new f.Gauge(
                                        datas[i].calls,
                                        self.getStack().stack.length
                                    )
                                ]);
                            }
                        },
                        self.getLayout().reduce
                    )
                );

                if(self.getStack().groupsCount > 0)
                container.append(
                    new f.ToggleButton(
                        "groups (" + self.getStack().groupsCount + ")",
                        function(e) {
                            var datas = self.getStack()
                                            .getGroups();

                            self.selectTab(e.target);

                            var table = self.getConsole()
                                            .empty()
                                            .open()
                                            .table(["group", "calls", "ms", "Kb"]);

                            for(var i in datas) {
                                table
                                    .append(
                                        f.create("tr")
                                        .append(
                                            f.create("td")
                                            .attr("colspan", 4)
                                            .attr("style", "padding: 0px; height: 4px; background:" + f.TagRandColor.provideFor(i))
                                        )
                                    )
                                    .line([

                                        datas[i].calls,
                                        f.roundDiv(datas[i].usec, 1000).toFixed(3) + '',
                                        f.roundDiv(datas[i].bytes, 1024).toFixed(3) + ''
                                    ])
                                    .prepend(
                                        f.create("td")
                                         .append(
                                            f.TagRandColor.provideElementFor(i)
                                         )
                                         .append(
                                            f.create("span").text(
                                                "<span style='font-weight:bold'>" + i + "</span> " +
                                                datas[i].refs.length + " " +
                                                (datas[i].refs.length>1 ? "entries" : "entry")
                                            )
                                         )
                                    );

                                for(var j in datas[i].refs) {
                                    table.line([
                                        datas[i].refs[j].id,
                                        new f.Gauge(
                                                self.getStack().getFunctions()[datas[i].refs[j].id].calls,
                                                datas[i].calls
                                        ),
                                        new f.Gauge(
                                                self.getStack().getFunctions()[datas[i].refs[j].id].getDuration(),
                                                datas[i].usec,
                                                1000,
                                                'ms'
                                        ),
                                        new f.Gauge(
                                                self.getStack().getFunctions()[datas[i].refs[j].id].getMemory(),
                                                datas[i].bytes,
                                                1024,
                                                'Kb'
                                        )
                                    ])
                                    .attr("data-ref", datas[i].refs[j].id)
                                    .bind("click", self.toggleDetails);
                                }
                            }
                        },
                        self.getLayout().reduce
                    )
                );

                container.append(
                f.create("input")
                    .attr("type", "text")
                    .attr("name", "forpSearch")
                    .attr("placeholder", "Search ...")
                    .bind(
                        "click",
                        function() {
                            f.find(this);
                            self.clearTabs();
                        }
                    )
                    .bind(
                        "keyup",
                        function() {
                            var table = self.getConsole()
                                            .empty()
                                            .open()
                                            .table(["function", "calls", "ms", "Kb"]),
                                datas = self.getStack().search(this.value);

                            for(var i in datas) {
                                table.line([
                                    datas[i].id,
                                    datas[i].calls,
                                    f.roundDiv(datas[i].getDuration(), 1000).toFixed(3) + '',
                                    f.roundDiv(datas[i].getMemory(), 1024).toFixed(3) + ''
                                ])
                                .attr("data-ref", datas[i].id)
                                .bind("click", self.toggleDetails);
                            }
                        }
                    )
                );

                (this.viewMode == "embeddedCompacted") &&
                container.append(
                    f.create("div")
                    .text("&#x25BC;")
                    .class("close")
                    .bind(
                        "click",
                        function(e) {
                            e.stopPropagation();
                            self.getLayout()
                                .setViewMode('embeddedCompacted')
                                .compact(self.onCompact);
                        }
                    )
                );

                return this;
            };
        }
    };
})(forp);