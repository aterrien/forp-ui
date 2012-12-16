'use strict';

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
     * DOM Element wrapper, makes it fluent
     * @param DOM Element
     */
    DOMElementWrapper : function(element)
    {
        var self = this;
        this.element = element;

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
        this.append = function(o) {
            this.element.appendChild(o.element);
            return this;
        };
        this.appendTo = function(o) {
            o.append(this);
            return this;
        };
        this.addClass = function(c) {
            return this.attr("class", this.getAttr("class") + " " + c);
        };
        this.class = function(c) {
            return this.attr("class", c);
        };
        this.getClass = function(c) {
            return this.getAttr("class");
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
        }
        this.nextSibling = function() {
            return forp.wrap(this.element.nextSibling);
        }
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
     * Console Class
     */
    Console : function()
    {
        var self = this;
        forp.DOMElementWrapper.call(this);
        this.element = document.createElement("div");

        this.open = function() {

            this.attr("style", "height: " + (window.innerHeight / 1.5) + "px")
                .class("console opened");

            forp.create("a")
                .text("v")
                .attr("href", "javascript:void(0);")
                .appendTo(this)
                .class("btn close")
                .bind(
                    'click',
                    function(e) {
                        self.close();
                    }
                );

            return this;
        };

        this.log = function(content) {
            this.open()
                .append(content);

            return this;
        };

        this.close = function() {
            this.css("height: 0px", function() {self.empty();});
            return this;
        };

        this.open();
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
                    li.append(forp.TagRandColor.provideFor(entry.groups[g]));
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
     * Gauge Class
     */
    Gauge : function(percent, text, hcolor)
    {
        forp.DOMElementWrapper.call(this);
        this.element = document.createElement("div");

        var bcolor = "#bbb";
        hcolor = hcolor ? hcolor : "#4D90FE";

        this.class("gauge")
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
        tagsColor : {},
        provideFor : function(name)
        {
            if(!this.tagsColor[name]) {
                this.tagsColor[name] = 'rgb(' +
                    Math.round(Math.random() * 100 + 155) + ',' +
                    Math.round(Math.random() * 100 + 155) + ',' +
                    Math.round(Math.random() * 100 + 155)
                    + ')';
            }

            return forp.create("a")
                    .class("tag")
                    .attr(
                        'style',
                        'background-color: ' + this.tagsColor[name]
                    )
                    .text(name)
                    .bind(
                        "click",
                        function(){
                            //alert('to groups view');
                        }
                    );
        }
    }
};
/**
 * forp IIFE
 * @param forp f
 */
(function(f) {

    /**
     * forp window manager
     * @param array forp stack
     */
    f.Manager = function(stack)
    {
        var self = this;

        this.window = null;
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
        this.console = null;
        this.found = {};
        this.maxNestedLevel = 0;
        this.avgLevel = 0;
        this.opened = false;
        this.tree = null;

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
         * @param array Stack entry
         * @return string
         */
        this.getEntryId = function(entry)
        {
            return ((entry.class) ? entry.class + '::' : '') + entry.function;
        }

        /**
         * @return array
         */
        this.getFunctions = function()
        {
            return this.aggregate().functions;
        }

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

        /**
         * @return Object Console
         */
        this.getConsole = function()
        {
            if(!this.console) {
                this.console = (new f.Console()).appendTo(this.window);
                this.console.appendTo(this.window);
            }
            return this.console;
        };

        /**
         * Display datas
         *
         * @param array datas
         * @return Object
         */
        this.show = function(datas, func)
        {
            this.getConsole()
                .empty()
                .log(func(datas));
        };

        /**
         * Run window manager
         * @return forp.Manager
         */
        this.run = function()
        {
            // init
            this.window = f.create("div")
                           .attr("id", "forp")
                           .close();

            document.body.insertBefore(this.window.element, document.body.firstChild);

            this.nav = f.create("nav")
                        .appendTo(this.window);

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
             .appendTo(this.window);


            if(this.stack) {

                this.window.bind(
                    "click",
                    function() {self.open();}
                );

                f.create("div")
                    .attr("style", "margin-right: 10px")
                    .text(f.roundDiv(this.stack[0].usec, 1000) + ' ms ')
                    .appendTo(this.nav);

                f.create("div")
                    .attr("style", "margin-right: 10px")
                    .text(f.roundDiv(this.stack[0].bytes, 1024) + ' Kb')
                    .appendTo(this.nav);
            } else {
                f.create("div")
                    .text("Give me something to eat !")
                    .appendTo(this.nav);
            }

            return this;
        };

        /**
         * Select a tab
         * @param string DOM Element target
         * @return forp.Manager
         */
        this.selectTab = function(target)
        {
            self.window.find(".tbtn").each(function(o) {o.class("tbtn");});
            f.find(target).class("tbtn selected");
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
                            f.round((self.functions[id].entries[i].refs[j].usec * 100) / self.sumDuration(self.functions[id].refs))
                            , f.roundDiv(self.functions[id].entries[i].refs[j].usec, 1000).toFixed(3)
                        ),
                        new f.Gauge(
                            f.round((self.functions[id].entries[i].refs[j].bytes * 100) / self.sumMemory(self.functions[id].refs))
                            , f.roundDiv(self.functions[id].entries[i].refs[j].bytes, 1000).toFixed(3)
                        ),
                    ]);
                }
                /*table.line([
                    self.functions[id].entries[i].filelineno,
                    self.gauge(
                        f.round((self.functions[id].entries[i].calls * 100) / self.functions[id].calls)
                        , self.functions[id].entries[i].calls
                    ),
                    self.gauge(
                        f.round((self.sumDuration(self.functions[id].entries[i].refs) * 100) / self.sumDuration(self.functions[id].refs))
                        , f.roundDiv(self.sumDuration(self.functions[id].entries[i].refs), 1000).toFixed(3)
                    ),
                    self.gauge(
                            f.round((self.sumMemory(self.functions[id].entries[i].refs) * 100) / self.sumMemory(self.functions[id].refs))
                            , f.roundDiv(self.sumMemory(self.functions[id].entries[i].refs), 1024).toFixed(3)
                        )
                ]);*/
            }
            target.insertAfter(line);
        };

        /**
         * Expand main window
         * @return forp.Manager
         */
        this.open = function()
        {
            if(this.opened) return; // TODO unbind
            this.opened = true;

            this.window.open();

            // footer
            f.create("div")
                .class("footer")
                .appendTo(this.window);

            var container = f.create("div").attr("style", "margin-top: -2px");
            container.appendTo(this.nav);

            self.aggregate();

            f.create("a")
                .text("stack (" + self.stack.length + ")")
                .attr("href", "javascript:void(0);")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function() {

                        if(!self.tree) self.tree = new f.Tree(self.stack);

                        self.selectTab(this)
                            .getConsole()
                            .empty()
                            .log(
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
                            }
                        );

            f.create("a")
                .text("top 20 duration")
                .attr("href", "#")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function() {
                        var lines = [],
                            datas = self.getTopCpu();

                        self.selectTab(this);

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
                            var id = self.getEntryId(datas[i]);
                            table.line([
                                    "<strong>" + datas[i].id + "</strong> (" + datas[i].filelineno + ")"
                                    + (datas[i].caption ? "<br>" + datas[i].caption : ""),
                                    f.roundDiv(datas[i].usec, 1000).toFixed(3) + '',
                                    f.roundDiv(self.sumDuration(self.functions[id].refs), 1000).toFixed(3) + '',
                                    self.functions[id].calls
                                ]);
                        }
                    }
                );

            f.create("a")
                .text("top 20 memory")
                .attr("href", "#")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function() {
                        var lines = [],
                            datas = self.getTopMemory();

                        self.selectTab(this);

                        var table = self.getConsole()
                                        .empty()
                                        .open()
                                        .table(["function", "self cost Kb", "total cost Kb", "calls"]);
                        for(var i in datas) {
                            var id = self.getEntryId(datas[i]);
                            table.line([
                                "<strong>" + datas[i].id + "</strong> (" + datas[i].filelineno + ")"
                                + (datas[i].caption ? "<br>" + datas[i].caption : ""),
                                f.roundDiv(datas[i].bytes, 1024).toFixed(3) + '',
                                f.roundDiv(self.sumMemory(self.functions[id].refs), 1024).toFixed(3) + '',
                                self.functions[id].calls
                            ]);
                        }
                    }
                );

            f.create("a")
                .text("top 20 calls")
                .attr("href", "#")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function(e) {
                        var lines = [],
                            datas = self.getTopCalls();

                        self.selectTab(this);

                        var table = self.getConsole()
                                        .empty()
                                        .open()
                                        .table(["function", "calls", "ms", "Kb"]);
                        for(var i in datas) {
                            table.line([
                                    datas[i].id,
                                    datas[i].calls,
                                    f.roundDiv(self.sumDuration(datas[i].refs), 1000).toFixed(3) + '',
                                    f.roundDiv(self.sumMemory(datas[i].refs), 1000).toFixed(3) + ''
                                ])
                                .attr("data-ref", datas[i].id)
                                .bind(
                                    "click",
                                    self.toggleDetails
                                );
                        }
                    }
                );

            if(self.includesCount > 0)
            f.create("a")
                .text("files (" + self.includesCount + ")")
                .attr("href", "#")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function() {
                        var lines = [],
                            datas = self.getIncludes();

                        self.selectTab(this);

                        /*for(var i in datas) {
                            lines.push(
                                {
                                    "file" : i,
                                    "calls from" : self.gauge(
                                        f.round((datas[i].calls * 100) / self.stack.length),
                                        datas[i].calls
                                    )
                                }
                            );
                        }*/
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
                    }
                );

            if(self.groupsCount > 0)
            f.create("a")
                .text("groups (" + self.groupsCount + ")")
                .attr("href", "#")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function() {
                        self.selectTab(this)
                            .show(
                            self.getGroups()
                            , function(datas) {
                                var t = f.create("table")
                                    ,tr = f.create("tr", t);

                                f.create("th", tr, "group");
                                f.create("th", tr, "calls", "w100");
                                f.create("th", tr, "ms", "w100");
                                f.create("th", tr, "Kb", "w100");

                                for(var i in datas) {
                                    var tr = f.create("tr", t);
                                    f.create("td", tr)
                                        .append(f.TagRandColor.provideFor(i))
                                        .append(f.create("span").text(datas[i].refs.length + ' ' + (datas[i].refs.length>1 ? 'entries' : 'entry')));
                                    f.create("td", tr, datas[i].calls, 'numeric');
                                    f.create("td", tr, f.roundDiv(datas[i].usec, 1000).toFixed(3) + '', 'numeric');
                                    f.create("td", tr, f.roundDiv(datas[i].bytes, 1024).toFixed(3) + '', 'numeric');
                                    for(var j in datas[i].refs) {
                                        var trsub = f.create("tr", t);
                                        trsub.attr("data-ref", datas[i].refs[j].id);
                                        trsub.bind("click", self.toggleDetails);
                                        f.create("td", trsub, datas[i].refs[j].id);
                                        f.create("td", trsub, "", 'numeric')
                                            .append(
                                                new f.Gauge(
                                                    f.round((self.functions[datas[i].refs[j].id].calls * 100) / datas[i].calls)
                                                    , self.functions[datas[i].refs[j].id].calls
                                                )
                                            );
                                        f.create("td", trsub, "", 'numeric')
                                            .append(
                                                new f.Gauge(
                                                    f.round(self.sumDuration(self.functions[datas[i].refs[j].id].refs) * 100) / self.sumDuration(datas[i].refs)
                                                    , f.roundDiv(self.sumDuration(self.functions[datas[i].refs[j].id].refs), 1000).toFixed(3)
                                                )
                                            );
                                        f.create("td", trsub, "", 'numeric')
                                            .append(
                                                new f.Gauge(
                                                    f.round(self.sumMemory(self.functions[datas[i].refs[j].id].refs) * 100) / self.sumDuration(datas[i].refs)
                                                    , f.roundDiv(self.sumMemory(self.functions[datas[i].refs[j].id].refs), 1024).toFixed(3)
                                                )
                                            );
                                    }
                                }
                                return t;
                            }
                        );
                    }
                );

            f.create("a")
                .text("metrics")
                .attr("href", "#")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function() {
                        var table = self.selectTab(this)
                            .getConsole()
                            .empty()
                            .open()
                            .table(["key", "value"]);

                        table.line(["total calls", self.stack.length]);
                        table.line(["max nested level", self.maxNestedLevel]);
                        table.line(["avg nested level", self.avgLevel.toFixed(2)]);
                    }
                );

            f.create("input")
                .attr("type", "text")
                .attr("name", "forpSearch")
                .attr("placeholder", "Search forp ...")
                .appendTo(container)
                .bind(
                    "click",
                    function() {
                        f.find(this).class("selected");
                        self.selectTab(this);
                    }
                )
                .bind(
                    "keyup",
                    function() {
                        self.window.open();
                        self.show(
                            self.search(this.value)
                            , function(datas) {
                                var t = f.create("table")
                                    ,tr = f.create("tr", t);
                                f.create("th", tr, "function");
                                f.create("th", tr, "calls", "w100");
                                f.create("th", tr, "ms", "w100");
                                f.create("th", tr, "Kb", "w100");
                                //f.create("th", tr, "called from");
                                for(var i in datas) {
                                    tr = f.create("tr", t);
                                    tr.attr("data-ref", datas[i].id);
                                    tr.bind("click", self.toggleDetails);
                                    f.create("td", tr, datas[i].id);
                                    f.create("td", tr, datas[i].calls, "numeric");
                                    f.create("td", tr, f.roundDiv(self.sumDuration(datas[i].refs), 1000).toFixed(3) + '', "numeric");
                                    f.create("td", tr, f.roundDiv(self.sumMemory(datas[i].refs), 1024).toFixed(3) + '', "numeric");
                                }
                                return t;
                            }
                        );
                    }
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
        var f = new forp.Manager();
        f.stack = forp.stack;
        f.run();
    }
);