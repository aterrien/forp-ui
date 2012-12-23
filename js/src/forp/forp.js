"use strict";
/**
 * DOM Element wrapper creator
 * @param DOM Element
 * @return forp.DOMElementWrapper
 */
var forp = {
    /**
     * Wrap function
     */
    wrap : function(element)
    {
        return new forp.DOMElementWrapper(element);
    },
    /**
     * Shortcut function
     */
    create : function(tag, appendTo, inner, css)
    {
        var e = document.createElement(tag);
        if(inner) e.innerHTML = inner;
        if(appendTo) appendTo.append(forp.wrap(e));
        if(css) {
            var classAttr = document.createAttribute("class");
            classAttr.nodeValue = css;
            e.setAttributeNode(classAttr);
        }
        return forp.wrap(e);
    },
    /**
     * Find a DOM Element
     * @param mixed
     * @return forp.DOMElementWrapper|forp.DOMElementWrapperCollection
     */
    find : function(mixed)
    {
        if(typeof(mixed) == 'object') {
            return forp.wrap(mixed);
        } else {
            return new forp.DOMElementWrapperCollection(document.querySelectorAll(mixed));
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
     * @param int d
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
        this.find = function(s) {
            return new forp.DOMElementWrapperCollection(this.element.querySelectorAll(s));
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
                if(forp.inArray(cArr[i], this.classes)) return this;
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
        this.open = function()
        {
            self.class('opened')
                .unbind('click', self.open);
            return self;
        };
        this.close = function()
        {
            self.class('closed')
                .unbind('click', self.close);
            return self;
        };
        this.css = function(p, complete)
        {
            var transitionEnd = forp.Normalizr.getEventTransitionEnd();
            var _c = function() {
                complete();
                document.removeEventListener(transitionEnd, _c);
            };
            document.addEventListener(transitionEnd, _c);
            this.attr("style", p);
        };
        this.table = function(headers) {
            return (new forp.Table(headers)).appendTo(this);
        };
        this.insertAfter = function(element) {
            this.element.parentNode.insertBefore( element.element, this.element.nextSibling );
        };
        this.nextSibling = function() {
            return forp.wrap(this.element.nextSibling);
        };
        this.addEventListener = function(listener) {
            listener.target = this;
            listener.init();
        };
        this.scrollBottom = function() {
            this.element.scrollTop = forp.wrap(this.element.firstChild).height();
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
                fn(new forp.DOMElementWrapper(this.elements[i]));
            }
        }
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
     * forp Layout
     *
     * - Layout #forp
     *  - Navbar nav
     *  - MainPanel .mainpanel
     *   - Console .console
     *   - Sidebar .sidebar
     */
    Layout : function()
    {
        var self = this;
        forp.DOMElementWrapper.call(this);
        this.element = document.createElement("div");
        this.attr("id", "forp");

        this.mainpanel = null;

        this.getMainPanel = function()
        {
            if(!this.mainpanel) {
                this.mainpanel = (new forp.MainPanel(this)).appendTo(this);
            }
            return this.mainpanel;
        };

        this.getConsole = function()
        {
            return this.getMainPanel()
                       .getConsole();
        };

        document.body.insertBefore(this.element, document.body.firstChild);
    },
    /**
     * Panel
     */
    Panel : function(id)
    {
        var self = this;
        forp.DOMElementWrapper.call(this);
        this.element = document.createElement("div");
        this.class(id + " panel");

        this.id = id;
    },
    /**
     * Panel
     */
    MainPanel : function(id)
    {
        var self = this;
        forp.Panel.call(this, "mainpanel");

        this.console = null;

        this.getConsole = function()
        {
            if(!this.console) {
                this.console = (new forp.Console(this)).appendTo(this);
            }
            return this.console;
        };

        this.open = function() {
            this.attr("style", "height: " + Math.round(window.innerHeight / 1.5) + "px");
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
     */
    ToggleButton : function(label, on, off)
    {
        var self = this;
        forp.DOMElementWrapper.call(this);
        this.element = document.createElement("a");

        this.text(label)
            .attr("href", "#")
            .class("tbtn")
            .bind(
                'click',
                function(e) {
                    if(self.getAttr("data-state") == "on") {
                        off && off(e);
                        self.removeClass("highlight")
                            .attr("data-state", "off");
                    } else {
                        on && on(e);
                        self.addClass("highlight")
                            .attr("data-state", "on");
                    }
                }
            );
    },
    /**
     * Sidebar Class
     */
    Sidebar : function()
    {
        var self = this;
        forp.Panel.call(this, "sidebar");
        this.addClass("w1of3");
        this.attr("style", "height: " + Math.round(window.innerHeight / 1.5) + "px");
    },
    /**
     * Console Class
     * @param Window w
     */
    Console : function(parent)
    {
        var self = this;
        forp.Panel.call(this, "console");

        this.parent = parent;

        this.open = function() {

            this.closeSidebar();
            this.parent.open();
            this.attr("style", "height: " + Math.round(window.innerHeight / 1.5) + "px")
                .addClass("opened");

            return this;
        };

        this.getSidebar = function() {
            if(!this.sidebar) {
                this.addClass("w2of3");
                this.sidebar = new forp.Sidebar();
                this.parent
                    .append(this.sidebar);
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

        //this.open();
    },
    /**
     * @param Object headers
     */
    Table : function(headers)
    {
        forp.DOMElementWrapper.call(this);
        this.element = document.createElement("table");

        if(headers) {
            var header = forp.create("tr", this);
            for(var i in headers) {
                forp.create("th", header, headers[i]);
            }
        }

        this.line = function(cols) {
            return (new forp.Line(cols)).appendTo(this);
        }
    },
    /**
     * @param Object cols
     */
    Line : function(cols)
    {
        forp.DOMElementWrapper.call(this);
        this.element = document.createElement("tr");

        for(var i in cols) {
            if(typeof cols[i] === "object") {
                forp.create("td", this, "", "numeric w100").append(cols[i]);
            } else if(isNaN(cols[i])) {
                forp.create("td", this, cols[i]);
            } else {
                forp.create("td", this, cols[i], "numeric w100");
            }
        }
    },
    /**
     * Stack Tree Class
     */
    Tree : function(stack)
    {
        var self = this;
        forp.DOMElementWrapper.call(this);
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
            var ul = forp.create("ul").class("l" + entry.level)
                , ex = forp.create("div")
                           .text("&nbsp;")
                           .addClass("left expander")
                , gd = new forp.Gauge(
                            stack[entry.parent] ? forp.round(
                                (entry.usec * 100) / stack[entry.parent].usec
                            ) : 100
                            , forp.roundDiv(entry.usec, 1000) + 'ms'
                       ).addClass("left")
                , gb = new forp.Gauge(
                            stack[entry.parent] ? forp.round(
                                (entry.bytes * 100) / stack[entry.parent].bytes
                            ) : 100
                            , forp.roundDiv(entry.bytes, 1024) + 'Kb'
                       ).addClass("left")
                , li = forp.create("li").text(entry.id);


            if(entry.groups) {
                for(var g in entry.groups) {
                    li.append(forp.TagRandColor.provideElementFor(entry.groups[g]));
                }
            }
            if(entry.caption) li.append(forp.create("span").text(entry.caption));

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
                        for(var i in entry.childrenRefs) {
                            this.treeList(stack[entry.childrenRefs[i]])
                                .appendTo(li);
                        }
                        li.attr("data-tree", 1);
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
     */
    Backtrace : function(i, stack)
    {
        forp.DOMElementWrapper.call(this);
        this.element = document.createElement("div");
        this.attr("style", "text-align: center");

        this.prependItem = function(entry, highlight) {
            return this.prepend(
                forp.create("div")
                    .class("backtrace-item shadow" + (highlight ? " highlight" : ""))
                    .text(
                        "<strong>" + entry.id + "</strong><br>" +
                        entry.filelineno + "<br>" +
                        forp.roundDiv(entry.usec, 1000).toFixed(3) + "ms " +
                        forp.roundDiv(entry.bytes, 1024).toFixed(3) + "Kb"
                    )
            );
        };

        var child = i;
        while(i != null) {
            this.prependItem(stack[i], child == i);
            i = stack[i].parent;
            if(i != null) {
                this.prepend(forp.create("div").text("\\/"));
            }
        }

        this.prepend(forp.create("br"))
            .prepend(forp.create("br"))
            .append(forp.create("br"))
            .append(forp.create("br"));
    },
    /**
     * LineEventListenerBacktrace Class
     *
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

                        var line = forp.wrap(this);
                        context.getConsole()
                               .getSidebar()
                               .empty()
                               .append(
                                   new forp.Backtrace(
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
     */
    Gauge : function(percent, text, hcolor)
    {
        forp.DOMElementWrapper.call(this);
        this.element = document.createElement("div");

        var bcolor = "#bbb";
        hcolor = hcolor ? hcolor : "#4D90FE";

        this.addClass("gauge")
            .text(text)
            .attr(
                "style",
                "background: -moz-linear-gradient(left, " +
                    hcolor + " 0%, " + hcolor + " " + percent + "%, " +
                    bcolor + " " + percent + "%, " + bcolor +
                    " 100%);background: -webkit-gradient(linear, left top, right top, color-stop(0%," + hcolor + "), color-stop(" + percent + "%," + hcolor + "), color-stop(" + percent + "%,#BBB), color-stop(100%," + bcolor + "));background: -webkit-linear-gradient(left, " + hcolor + " 0%," + hcolor + " " + percent + "%," + bcolor + " " + percent + "%," + bcolor + " 100%);background: -o-linear-gradient(left, " + hcolor + " 0%," + hcolor + " " + percent + "%," + bcolor + " " + percent + "%," + bcolor + " 100%);background: linear-gradient(left, " + hcolor + " 0%," + hcolor + " " + percent + "%," + bcolor + " " + percent + "%," + bcolor + " 100%);");
    },
    /**
     * Tag Class
     */
    TagRandColor : {
        i : 0,
        pocket : ["#ea5", "#e5a", "#5ae", "#5ea", "#ae6", "#a5e",
                  "#e55", "#ee6", "#e6e", "#5e5", "#5ee", "#55e"],
        //pocket : ["#ffa0ff", "#ffa000", "#c0a0ff", "#c0e000", "#e06040",
        //          "#80a0ff", "#80e000", "#6080ff", "#a060c0", "#00a060"],
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
            return forp.create("a")
                    .class("tag")
                    .attr(
                        'style',
                        'color: #fff; background-color: ' + this.provideFor(name)
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
     */
    Stack : function(stack)
    {
        var self = this;

        this.stack = stack; // RAW stack
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

        /**
         * Sum duration of an array of entries
         * @return int Sum
         */
        this.sumDuration = function(entries)
        {
            var sum = 0;
            for(var i in entries) {
                if(this.isRecursive(entries[i])) continue;
                sum += entries[i].usec;
            }
            return sum;
        };

        /**
         * Sum memory of an array of entries
         * @return int Sum
         */
        this.sumMemory = function(entries)
        {
            var sum = 0;
            for(var i in entries) {
                if(this.isRecursive(entries[i])) continue;
                sum += entries[i].bytes;
            }
            return sum;
        };

        /**
         * Refines ancestors metrics
         * @param object Descendant stack entry
         * @return forp
         */
        this.refineParents = function(descendant)
        {
            if(descendant.parent > 0 && descendant.pusec) {
                this.stack[descendant.parent].usec -= descendant.pusec;
                this.refineParents(this.stack[descendant.parent]);
            }
            return this;
        };

        /**
         * Aggregates stack entries
         * This is the core function
         *
         * One loop to :
         * - compute top duration
         * - compute top memory
         * - groups
         * - included files
         *
         * @return forp.Manager
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

                this.topCpu = new forp.SortedFixedArray(
                    function(a, b) {
                        return (a.usec > b.usec);
                    },
                    20
                );

                this.topMemory = new forp.SortedFixedArray(
                    function(a, b) {
                        return (a.bytes > b.bytes);
                    },
                    20
                );

                for(var entry in this.stack) {

                    id = this.getEntryId(this.stack[entry]);
                    filelineno = this.stack[entry].file + (this.stack[entry].lineno ? ':' + this.stack[entry].lineno : '');
                    ms = forp.roundDiv(this.stack[entry].usec, 1000);
                    kb = forp.roundDiv(this.stack[entry].bytes, 1024);

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
                        this.functions[id].calls ++;

                        // Linking between functions and stack entries
                        if(this.functions[id].entries[filelineno]) {
                            this.functions[id].entries[filelineno].calls++;
                        } else {
                            this.functions[id].entries[filelineno] = {
                                  calls : 1
                                , file : this.stack[entry].file
                                , filelineno : filelineno
                                , refs : []
                            };
                        }

                    } else {

                        // indexing by function id
                        this.functions[id] = {
                              id : id
                            , level : this.stack[entry].level
                            , calls : 1
                            , class : this.stack[entry].class ? this.stack[entry].class : null
                            , function : this.stack[entry].function
                            , refs : []
                        };
                        this.functions[id].entries = [];
                        this.functions[id].entries[filelineno] = {
                              calls : 1
                            , file : this.stack[entry].file
                            , filelineno : filelineno
                            , refs : []
                        };

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
//this.refineParents(this.stack[entry]);

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
                        this.groups[group].usec += self.sumDuration(this.functions[this.groups[group].refs[i].id].refs);
                        this.groups[group].bytes += self.sumMemory(this.functions[this.groups[group].refs[i].id].refs);
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
                this.topCalls = new forp.SortedFixedArray(
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
            /*if(!this.topCpu) {
                this.topCpu = new f.SortedFixedArray(
                    function(a, b) {
                        a.usecavg = f.round((a.usec / a.calls) * 100) / 100;
                        b.usecavg = f.round((b.usec / b.calls) * 100) / 100;
                        return (a.usecavg > b.usecavg);
                    },
                    20
                );

                for(var entry in this.getFunctions()) {
                    this.topCpu.put(this.functions[entry]);
                }
            }*/
            return this.aggregate().topCpu.stack;
        };

        /**
         * Top X memory
         * @return array SortedFixedArray stack
         */
        this.getTopMemory = function()
        {
            /*if(!this.topMemory) {
                this.topMemory = new f.SortedFixedArray(
                    function(a, b) {
                        a.bytesavg = f.round((a.bytes / a.calls) * 100) / 100;
                        b.bytesavg = f.round((b.bytes / b.calls) * 100) / 100;
                        return (a.bytesavg > b.bytesavg);
                    },
                    20
                );

                for(var entry in this.getFunctions()) {
                    this.topMemory.put(this.functions[entry]);
                }
            }*/
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
    }
};
/**
 * forp IIFE
 * @param forp f
 */
(function(f) {

    /**
     * forp stack manager
     * @param array forp stack
     */
    f.Controller = function(stack)
    {
        var self = this;

        this.layout = null;
        this.console = null;
        this.opened = false;
        this.tree = null;

        this.stack = null;
        this.functions = null;
        this.groups = null;

        /**
         *
         */
        this.setStack = function(stack)
        {
            this.stack = new f.Stack(stack);
            return this;
        };

        /**
         *
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
         * Run layout manager
         * @return forp.Controller
         */
        this.run = function()
        {
            // layout
            this.layout = (new f.Layout())
                            .close()
                            .addClass("shadow");

            // toolbar
            this.nav = f.create("nav")
                        .appendTo(this.layout);

            // infos button
            f.create("div")
             .class("i")
             .append(
                f.create("a")
                 .attr("href", "https://github.com/aterrien/forp")
                 .attr("target", "_blank")
                 .attr("alt", "forp documentation")
                 .attr("title", "forp documentation")
                 .text("i")
             )
             .appendTo(this.layout);

            if(this.getStack()) {

                this.layout.bind(
                    "click",
                    function() {self.open();}
                );

                f.create("div")
                    .attr("style", "margin-right: 10px")
                    .text(f.roundDiv(this.getStack().getMainEntry().usec, 1000) + ' ms ')
                    .appendTo(this.nav);

                f.create("div")
                    .attr("style", "margin-right: 10px")
                    .text(f.roundDiv(this.getStack().getMainEntry().bytes, 1024) + ' Kb')
                    .appendTo(this.nav);
            } else {
                f.create("div")
                    .text("Give me something to eat !")
                    .appendTo(this.nav);
            }

            return this;
        };

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
                      .appendTo(line);

            var table = td.table(["called from", " ms", "Kb"]); //"calls",
            for(var i in self.functions[id].entries) {
                for(var j in self.functions[id].entries[i].refs) {
                    if(!self.functions[id].entries[i].refs[j]) continue;

                    table.line([
                        self.functions[id].entries[i].refs[j].filelineno +
                        (self.functions[id].entries[i].refs[j].caption ? "<br>" + self.functions[id].entries[i].refs[j].caption : ""),
                        new f.Gauge(
                            f.round((self.functions[id].entries[i].refs[j].usec * 100) / self.getStack().sumDuration(self.functions[id].refs))
                            , f.roundDiv(self.functions[id].entries[i].refs[j].usec, 1000).toFixed(3)
                        ),
                        new f.Gauge(
                            f.round((self.functions[id].entries[i].refs[j].bytes * 100) / self.getStack().sumMemory(self.functions[id].refs))
                            , f.roundDiv(self.functions[id].entries[i].refs[j].bytes, 1024).toFixed(3)
                        ),
                    ]).addEventListener(
                        new forp.LineEventListenerBacktrace(
                            self.functions[id].entries[i].refs[j].i,
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
            if(this.opened) return; // TODO unbind
            this.opened = true;

            this.layout.open();

            // footer
            f.create("div")
                .class("footer")
                .appendTo(this.layout);

            var container = f.create("div").attr("style", "margin-top: -2px");
            container.appendTo(this.nav);

            self.getStack().aggregate();
            //this.stack = self.getStack().stack;
            self.functions = self.getStack().functions;
            self    .groups = self.getStack().groups;

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
                                                    .attr("href", "#")
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
                                                    .attr("href", "#")
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
                    self.layout.getMainPanel().close
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
                                .attr("style", "margin: 1px; width: 1px; height: " + h + "px; background-color: #4D90FE;")
                                .appendTo(d);
                        }*/

                        var table = self.getConsole()
                                        .empty()
                                        .open()
                                        .table(["function", "self cost ms", "total cost ms", "calls"]);

                        for(var i in datas) {
                            var id = self.getStack().getEntryId(datas[i]);
                            table.line([
                                    "<strong>" + datas[i].id + "</strong> (" + datas[i].filelineno + ")"
                                    + (datas[i].caption ? "<br>" + datas[i].caption : ""),
                                    f.roundDiv(datas[i].usec, 1000).toFixed(3) + '',
                                    f.roundDiv(self.getStack().sumDuration(self.functions[id].refs), 1000).toFixed(3) + '',
                                    self.functions[id].calls
                                ])
                                .addEventListener(
                                    new forp.LineEventListenerBacktrace(
                                        datas[i].i,
                                        self
                                    )
                                );
                        }
                    },
                    self.layout.getMainPanel().close
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
                                    "<strong>" + datas[i].id + "</strong> (" + datas[i].filelineno + ")"
                                    + (datas[i].caption ? "<br>" + datas[i].caption : ""),
                                    f.roundDiv(datas[i].bytes, 1024).toFixed(3) + '',
                                    f.roundDiv(self.getStack().sumMemory(self.functions[id].refs), 1024).toFixed(3) + '',
                                    self.functions[id].calls
                                ])
                                .addEventListener(
                                    new forp.LineEventListenerBacktrace(
                                        datas[i].i,
                                        self
                                    )
                                );
                        }
                    },
                    self.layout.getMainPanel().close
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
                                    f.roundDiv(self.getStack().sumDuration(datas[i].refs), 1000).toFixed(3) + '',
                                    f.roundDiv(self.getStack().sumMemory(datas[i].refs), 1000).toFixed(3) + ''
                                ])
                                .attr("data-ref", datas[i].id)
                                .bind(
                                    "click",
                                    self.toggleDetails
                                );
                        }
                    },
                    self.layout.getMainPanel().close
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
                                    f.round((datas[i].calls * 100) / self.stack.length),
                                    datas[i].calls
                                )
                            ]);
                        }
                    },
                    self.layout.getMainPanel().close
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
                                         .attr("style", "padding: 0px; height: 4px; background-color:" + f.TagRandColor.provideFor(i))
                                     )
                                )
                                .line([
                                    "<strong>" + i + "</strong> " +
                                    datas[i].refs.length + " " +
                                    (datas[i].refs.length>1 ? "entries" : "entry"),
                                    datas[i].calls,
                                    f.roundDiv(datas[i].usec, 1000).toFixed(3) + '',
                                    f.roundDiv(datas[i].bytes, 1024).toFixed(3) + ''
                                ]);
                                
                            for(var j in datas[i].refs) {
                                table.line([
                                    datas[i].refs[j].id,
                                    new f.Gauge(
                                        f.round((self.functions[datas[i].refs[j].id].calls * 100) / datas[i].calls)
                                        , self.functions[datas[i].refs[j].id].calls
                                    ),
                                    new f.Gauge(
                                        f.round(self.getStack().sumDuration(self.functions[datas[i].refs[j].id].refs) * 100) / self.getStack().sumDuration(datas[i].refs)
                                        , f.roundDiv(self.getStack().sumDuration(self.functions[datas[i].refs[j].id].refs), 1000).toFixed(3)
                                    ),
                                    new f.Gauge(
                                        f.round(self.getStack().sumMemory(self.functions[datas[i].refs[j].id].refs) * 100) / self.getStack().sumDuration(datas[i].refs)
                                        , f.roundDiv(self.getStack().sumMemory(self.functions[datas[i].refs[j].id].refs), 1024).toFixed(3)
                                    )
                                ])
                                .attr("data-ref", datas[i].refs[j].id)
                                .bind("click", self.toggleDetails);
                            }
                        }
                    },
                    self.layout.getMainPanel().close
                )
            );

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
                                        .table(["metric", "type", "value", "tip"]);

                        self.selectTab(e.target);

                        table.line(["<strong>Total includes</strong>", "Performance", self.getStack().includesCount, ""]);
                        table.line(["<strong>Total calls</strong>", "Performance", self.getStack().stack.length, ""]);
                        table.line(["<strong>Max nested level</strong>", "Nesting", self.getStack().maxNestedLevel, ""]);
                        table.line(["<strong>Avg nested level</strong>", "Nesting", self.getStack().avgLevel.toFixed(2), ""]);
                    },
                    self.layout.getMainPanel().close
                )
            );

            container.append(
               f.create("input")
                .attr("type", "text")
                .attr("name", "forpSearch")
                .attr("placeholder", "Search forp ...")
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
                                f.roundDiv(self.getStack().sumDuration(datas[i].refs), 1000).toFixed(3) + '',
                                f.roundDiv(self.getStack().sumMemory(datas[i].refs), 1024).toFixed(3) + ''
                            ])
                            .attr("data-ref", datas[i].id)
                            .bind("click", self.toggleDetails);
                        }
                    }
                )
            );
            return this;
        };
    };
})(forp);

/**
 * forp starter
 */
forp.ready(
    function(){
        var s = document.createElement('style'),
            t = document.createTextNode('%forp.css%');
        s.appendChild(t);
        (document.getElementsByTagName('head')[0]
            || document.getElementsByTagName('body')[0]).appendChild(s);

        // Runs forp
        var f = new forp.Controller();
        (new forp.Controller())
            .setStack(forp.stack)
            .run();
    }
);