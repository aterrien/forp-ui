/**
 * DOM Element wrapper creator
 * @param DOM Element
 * @return forp.DOMElementWrapper
 */
var forp = function(element)
{
    return new forp.DOMElementWrapper(element);
}
/**
 * DOM Ready function
 * @param callback
 */
forp.ready = function(callback) {
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
};
/**
 * DOM Element wrapper, makes it fluent
 * @param DOM Element
 */
forp.DOMElementWrapper = function(element)
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
        return this.attr("class", c);
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
};
/**
 * DOM Element Collection
 * @param DOM Element
 */
forp.DOMElementWrapperCollection = function(elements)
{
    this.elements = elements;
    this.each = function(fn)
    {
        for(var i=0; i<this.elements.length; i++) {
            fn(new forp.DOMElementWrapper(this.elements[i]));
        }
    }
};
/**
 * forp IIFE
 * @param forp f
 */
(function(f) {
    'use strict';
    /**
     * Sorted Fixed Array Class
     * @param callback filter
     * @param int size
     */
    f.SortedFixedArray = function(filter, size) {
        this.stack = [];
        this.size = size;
        this.insert = function(entry, i) {
            for(var j = Math.min(this.size - 1, this.stack.length); j > i; j--) {
                this.stack[j] = this.stack[j - 1];
            }
            this.stack[i] = entry;
        }
        this.put = function(entry) {
            if(this.stack.length) {
                for(var i = 0; i < this.stack.length; i++) {
                    if(filter(entry, this.stack[i])) {
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
    };

    /**
     * forp window manager
     * @param array forp stack
     */
    f.Manager = function(stack) {
        var self = this;

        this.window = null;
        this.stack = stack; // RAW stack
        this.hstack = null; // indexed stack
        this.includes = null; // included files
        this.includesCount = 0;
        this.groups = null; // groups
        this.groupsCount = 0;
        this.topCpu = null;
        this.topCalls = null;
        this.topMemory = null;
        this.console = null;
        this.found = {};
        this.maxNestedLevel = 0;

        this.f = function(mixed)
        {
            if(typeof(mixed) == 'object') {
                return f(mixed);
            } else {
                return new f.DOMElementWrapperCollection(document.querySelectorAll(mixed));
            }
        };

        this.c = function(tag, appendTo, inner, css)
        {
            var e = document.createElement(tag);
            if(inner) e.innerHTML = inner;
            if(appendTo) appendTo.append(f(e));
            if(css) {
                var classAttr = document.createAttribute("class");
                classAttr.nodeValue = css;
                e.setAttributeNode(classAttr);
            }
            return f(e);
        };

        this.gauge = function(percent, text, hcolor)
        {
            var bcolor = "#ccc";
            hcolor = hcolor ? hcolor : "#4D90FE";
            return self.c("div")
                .text(text)
                .attr(
                    "style",
                    "background: -moz-linear-gradient(left, " + hcolor + " 0%, " + hcolor + " " + percent + "%, " + bcolor + " " + percent + "%, " + bcolor + " 100%);background: -webkit-gradient(linear, left top, right top, color-stop(0%," + hcolor + "), color-stop(" + percent + "%," + hcolor + "), color-stop(" + percent + "%,#BBB), color-stop(100%," + bcolor + "));background: -webkit-linear-gradient(left, " + hcolor + " 0%," + hcolor + " " + percent + "%," + bcolor + " " + percent + "%," + bcolor + " 100%);background: -o-linear-gradient(left, " + hcolor + " 0%," + hcolor + " " + percent + "%," + bcolor + " " + percent + "%," + bcolor + " 100%);background: linear-gradient(left, " + hcolor + " 0%," + hcolor + " " + percent + "%," + bcolor + " " + percent + "%," + bcolor + " 100%);");
        };

        /**
         * @param string v
         * @param int d
         * @return int
         */
        this.round = function(v)
        {
            return (~~ (0.5 + (v * 1000))) / 1000;
        }

        /**
         * @param string v
         * @param int d
         * @return int
         */
        this.roundDiv = function(v, d)
        {
            return this.round(v / d);
        }

        /**
         * @param string id
         * @return bool
         */
        this.isRecursive = function(id)
        {
            var child = this.stack[id].id;
            while(this.stack[id].parent > 0) {
                id = this.stack[id].parent;
                if(this.stack[id].id == child) return true
            }
            return false;
        }

        /**
         * Aggregates stack entries
         * This is the main function
         * @return this
         */
        this.aggregate = function()
        {
            if(!this.hstack) {
                // hashing stack
                var id, filelineno, ms, kb;
                this.hstack = {};
                this.includes = {};
                this.groups = {};

                /*this.topCpu = new f.SortedFixedArray(
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
                );*/

                for(var entry in this.stack) {

                    id = this.getEntryId(this.stack[entry]);
                    filelineno = this.stack[entry].file + (this.stack[entry].lineno ? ':' + this.stack[entry].lineno : '');
                    ms = this.roundDiv(this.stack[entry].usec, 1000);
                    kb = this.roundDiv(this.stack[entry].bytes, 1024);

                    //this.topCpu.put(this.stack[entry]);
                    //this.topMemory.put(this.stack[entry]);

                    this.maxNestedLevel = (this.stack[entry].level > this.maxNestedLevel)
                        ? this.stack[entry].level : this.maxNestedLevel ;

                    this.stack[entry].id = id;

                    // Counts leafs
                    if(this.stack[this.stack[entry].parent]) {
                        if(!this.stack[this.stack[entry].parent].childrenRefs) {
                            this.stack[this.stack[entry].parent].childrenRefs = [];
                        }
                        this.stack[this.stack[entry].parent].childrenRefs.push(entry);
                    }

                    // Constructs hstack
                    if(this.hstack[id]) {
                        this.hstack[id].calls ++;

                        var makeSum = !this.isRecursive(entry);
                        if(makeSum) {
                            this.hstack[id].usec += ms;
                            this.hstack[id].bytes += kb;
                        }

                        //var el = this.hstack[id].entries.length;

                        if(this.hstack[id].entries[filelineno]) {
                            this.hstack[id].entries[filelineno].calls++;
                            if(makeSum) {
                                this.hstack[id].entries[filelineno].usec += ms;
                                this.hstack[id].entries[filelineno].bytes += kb;
                            }
                        } else {
                            this.hstack[id].entries[filelineno] = {};
                            this.hstack[id].entries[filelineno].calls = 1;
                            this.hstack[id].entries[filelineno].usec = ms;
                            this.hstack[id].entries[filelineno].bytes = kb;
                            this.hstack[id].entries[filelineno].file = this.stack[entry].file;
                            this.hstack[id].entries[filelineno].filelineno = filelineno;
                            this.hstack[id].entries[filelineno].stackRefs = [];
                        //    this.hstack[id].entries[filelineno].caption = this.stack[entry].caption ? this.stack[entry].caption : '';
                        }
                        this.hstack[id].entries[filelineno].stackRefs.push(entry);
                    } else {
                        this.hstack[id] = {};
                        this.hstack[id].id = id;
                        this.stack[entry].class && (this.hstack[id].class = this.stack[entry].class);
                        this.hstack[id].function = this.stack[entry].function;
                        this.hstack[id].level = this.stack[entry].level;
                        this.hstack[id].calls = 1;
                        this.hstack[id].usec = ms;
                        this.hstack[id].bytes = kb;

                        var filelineno = this.stack[entry].file
                            + (this.stack[entry].lineno ? ':' + this.stack[entry].lineno : '');
                        this.hstack[id].entries = [];
                        this.hstack[id].entries[filelineno] = {}
                        this.hstack[id].entries[filelineno].calls = 1;
                        this.hstack[id].entries[filelineno].usec = this.hstack[id].usec;
                        this.hstack[id].entries[filelineno].bytes = this.hstack[id].bytes;
                        this.hstack[id].entries[filelineno].file = this.stack[entry].file;
                        this.hstack[id].entries[filelineno].filelineno = filelineno;
                        this.hstack[id].entries[filelineno].stackRefs = [];
                        this.hstack[id].entries[filelineno].stackRefs.push(entry);

                        // Groups
                        if(this.stack[entry].groups) {
                            for(var g in this.stack[entry].groups) {
                                if(!this.groups[this.stack[entry].groups[g]]) {
                                    this.groups[this.stack[entry].groups[g]] = {};
                                    this.groups[this.stack[entry].groups[g]].calls = 0;
                                    this.groups[this.stack[entry].groups[g]].usec = 0;
                                    this.groups[this.stack[entry].groups[g]].bytes = 0;
                                    this.groups[this.stack[entry].groups[g]].refs = [];
                                }
                                this.groups[this.stack[entry].groups[g]].refs.push(id);
                            }
                        }
                    }

                    // Files
                    if(!this.includes[this.stack[entry].file]) {
                        this.includes[this.stack[entry].file] = {};
                        this.includes[this.stack[entry].file].usec = ms;
                        this.includes[this.stack[entry].file].bytes = kb;
                        this.includes[this.stack[entry].file].calls = 1;
                        this.includesCount++;
                    } else {
                        this.includes[this.stack[entry].file].usec += ms;
                        this.includes[this.stack[entry].file].bytes += kb;
                        this.includes[this.stack[entry].file].calls++;
                    }
                }

                // Finalize groups
                for(var group in this.groups) {
                    this.groupsCount++;
                    for(var i in this.groups[group].refs) {
                        this.groups[group].calls += this.hstack[this.groups[group].refs[i]].calls;
                        this.groups[group].usec += this.hstack[this.groups[group].refs[i]].usec;
                        this.groups[group].bytes += this.hstack[this.groups[group].refs[i]].bytes;
                    }
                }
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
        this.getHStack = function()
        {
            return this.aggregate().hstack;
        }

        /**
         * Regexp search in stack functions
         * @param string query
         * @return array founds
         */
        this.find = function(query)
        {
            if(!this.found[query]) {
                this.found[query] = [];
                for(var entry in this.getHStack()) {
                    var r = new RegExp(query, "i");
                    if(r.test(this.hstack[entry].id))
                    this.found[query].push(this.hstack[entry]);
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

                for(var entry in this.getHStack()) {
                    this.topCalls.put(this.hstack[entry]);
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
            if(!this.topCpu) {
                this.topCpu = new f.SortedFixedArray(
                    function(a, b) {
                        a.usecavg = self.round((a.usec / a.calls) * 100) / 100;
                        b.usecavg = self.round((b.usec / b.calls) * 100) / 100;
                        return (a.usecavg > b.usecavg);
                    },
                    20
                );

                for(var entry in this.getHStack()) {
                    this.topCpu.put(this.hstack[entry]);
                }
            }
            return this.topCpu.stack;
        };

        /**
         * Top X memory
         * @return array SortedFixedArray stack
         */
        this.getTopMemory = function()
        {
            if(!this.topMemory) {
                this.topMemory = new f.SortedFixedArray(
                    function(a, b) {
                        a.bytesavg = self.round((a.bytes / a.calls) * 100) / 100;
                        b.bytesavg = self.round((b.bytes / b.calls) * 100) / 100;
                        return (a.bytesavg > b.bytesavg);
                    },
                    20
                );

                for(var entry in this.getHStack()) {
                    this.topMemory.put(this.hstack[entry]);
                }
            }
            return this.topMemory.stack;
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
         * Clear UI
         * @return this
         */
        this.clear = function()
        {
            if(this.console) this.console.text("");
            return this;
        };

        /**
         * @return Object Console
         */
        this.getConsole = function()
        {
            if(!this.console) {

                this.console = this.c("div")
                                   .addClass("console")
                                   .appendTo(this.window)
                                   .attr("style", "max-height:" + (window.innerHeight - 100) + "px");

                //this.window.append(this.console);

                var aCollapse = this.c("a")
                    .text("^")
                    .attr("href", "javascript:void(0);")
                    .appendTo(this.window)
                    .class("btn close")
                    .bind(
                        'click',
                        function(e) {
                            self.console.remove();
                            self.console = null;
                            aCollapse.remove();
                        }
                    );
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
            this.getConsole().append(func(datas));
        };

        this.getDomTag = function(name)
        {
            return this.c("a")
                    .class("tag")
                    .text(name)
                    .bind(
                            "click",
                            function(){
                                //alert('yo');
                            }
                    );
        };

        /**
         * Run window manager
         */
        this.run = function()
        {
            // init
            this.window = this
                .c("div")
                .attr("id", "forp")
                .close();

            //document.body.appendChild(this.window.element);
            document.body.insertBefore(this.window.element, document.body.firstChild);

            this.nav = this.c("nav")
                            .appendTo(this.window);

            // infos button
            this.c("div")
                .class("i")
                .append(
                    this.c("a")
                        .attr("href", "https://github.com/aterrien/forpgui")
                        .attr("target", "_blank")
                        .text("i")
                        )
                .appendTo(this.window);


            if(this.stack) {

                this.window.bind(
                    "click",
                    function() { self.open(); }
                );

                //this.nav.append(this.c("span").text('User : 0000ms<br>System : 0000ms '));

                this.c("div")
                    .attr("style", "margin-right: 10px")
                    .text(self.roundDiv(this.stack[0].usec, 1000) + ' ms ')
                    .appendTo(this.nav);

                this.c("div")
                    .attr("style", "margin-right: 10px")
                    .text(self.roundDiv(this.stack[0].bytes, 1024) + ' Kb')
                    .appendTo(this.nav);
            } else {
                this.c("div")
                    .text("Give me something to eat !")
                    .appendTo(this.nav);
            }
        };

        /**
         * Generates a tree representation (UL) of the stack
         *
         * @param array entry Root entry
         * @param boolean recursive Says if we have to fetch it recursively
         * @return Object Wrapped UL
         */
        this.treeList = function(entry, recursive)
        {

            var ul = this
                        .c("ul")
                        .class("l" + entry.level)
                , ex = this
                        .c("div")
                        .text("&nbsp;")
                        .addClass("left expander")
                , gd = this
                        .gauge(
                            this.stack[entry.parent] ? this.round((entry.usec * 100) / this.stack[entry.parent].usec) : 100
                            , this.roundDiv(entry.usec, 1000) + 'ms')
                        .addClass("left gauge")
                , gb = this
                        .gauge(this.stack[entry.parent] ? this.round((entry.bytes * 100) / this.stack[entry.parent].bytes) : 100
                            , this.roundDiv(entry.bytes, 1024) + 'Kb')
                        .addClass("left gauge")
                , li = this
                        .c("li")
                        .text(entry.id);

            if(entry.groups) {
                for(var g in entry.groups) {
                    li.append(this.getDomTag(entry.groups[g]));
                }
            }
            if(entry.caption) li.append(this.c("span").text(entry.caption));

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
                        var h2 = (self.getConsole().height() / 2);

                        // scroll to middle
                        if(ex.top() > h2) self.getConsole().element.scrollTop = ex.top() - h2;

                        if(li.getClass() == "expanded") {
                            li.class("collapsed");
                        } else {
                            li.class("expanded");
                            if(!li.getAttr("data-tree")) {
                                for(var i in entry.childrenRefs) {
                                    self.treeList(self.stack[entry.childrenRefs[i]], true)
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
                            this.treeList(this.stack[entry.childrenRefs[i]])
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

        /**
         * Select a tab
         * @param string DOM Element target
         */
        this.tab = function(target)
        {
            self.window.find(".tbtn").each(function(o) {o.class("tbtn");});
            self.f(target).class("tbtn selected");
            return this;
        };

        /**
         * Expand main window
         */
        this.opened = false;
        this.open = function()
        {
            if(this.opened) return; // TODO unbind
            this.opened = true;

            this.window.open();

            // footer
            this.c("div")
                .class("footer")
                .appendTo(this.window);

            var container = this.c("div").attr("style", "margin-top: -5px");
            container.appendTo(this.nav);

            this.c("a")
                .text("stack (" + self.aggregate().stack.length + ")")
                .attr("href", "javascript:void(0);")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function() {
                        var tree = self.aggregate().treeList(self.stack[0], true);

                        self.tab(this)
                            .clear()
                            .c("div")
                            .attr("style", "margin-top: 10px;")
                            .append(
                                self.c("div")
                                    .attr("style", "position: absolute; margin: 5px; right: 20px")
                                    .append(
                                            self.c("a")
                                                .text("expand")
                                                .attr("href", "#")
                                                .class("btn")
                                                .bind(
                                                    "click",
                                                    function() {
                                                        self.f("li.collapsed[data-tree]")
                                                            .each(
                                                                function(e){
                                                                    e.attr("class", "expanded");
                                                                }
                                                            );
                                                    })
                                            )
                                    .append(
                                            self.c("a")
                                                .text("collapse")
                                                .attr("href", "#")
                                                .class("btn")
                                                .bind(
                                                    "click",
                                                    function() {
                                                        self.f("li.expanded")
                                                            .each(
                                                                function(e){
                                                                    e.attr("class", "collapsed");
                                                                }
                                                            );
                                                    })
                                            )
                            )
                            .append(
                                self.c("div").append(tree)
                            )
                            .appendTo(self.getConsole());
                    }
                );

            this.c("a")
                .text("top 20 duration")
                .attr("href", "#")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function() {
                        self.clear()
                            .tab(this)
                            .show(
                            self.getTopCpu()
                            , function(datas) {
                                var t = self.c("table")
                                    ,tr = self.c("tr", t);
                                self.c("th", tr, "function");
                                self.c("th", tr, "avg&nbsp;ms", "w100");
                                self.c("th", tr, "calls", "w100");
                                self.c("th", tr, "ms", "w100");
                                self.c("th", tr, "called from");
                                for(var i in datas) {
                                    tr = self.c("tr", t);
                                    self.c("td", tr, datas[i].id);
                                    self.c("td", tr, datas[i].usecavg.toFixed(3), "numeric");
                                    self.c("td", tr, datas[i].calls, "numeric");
                                    self.c("td", tr, datas[i].usec.toFixed(3) + '', "numeric");
                                    self.c("td", tr, datas[i].filelineno);

                                    for(var j in datas[i].entries) {
                                        tr = self.c("tr", t).class("sub");
                                        self.c("td", tr, "");
                                        self.c("td", tr, (self.round((100 * datas[i].entries[j].usec) / datas[i].entries[j].calls) / 100).toFixed(3), "numeric");
                                        self.c("td", tr, datas[i].entries[j].calls, "numeric");
                                        self.c("td", tr, datas[i].entries[j].usec.toFixed(3) + '', "numeric");
                                        self.c("td", tr, datas[i].entries[j].filelineno);
                                    }
                                }
                                return t;
                            }
                        );
                    }
                );

            this.c("a")
                .text("top 20 memory")
                .attr("href", "#")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function() {
                        self.clear()
                            .tab(this)
                            .show(
                            self.getTopMemory()
                            , function(datas) {
                                var t = self.c("table")
                                    ,tr = self.c("tr", t);
                                self.c("th", tr, "function");
                                self.c("th", tr, "avg&nbsp;Kb", "w100");
                                self.c("th", tr, "calls", "w100");
                                self.c("th", tr, "Kb", "w100");
                                self.c("th", tr, "called from");
                                for(var i in datas) {
                                    tr = self.c("tr", t);
                                    self.c("td", tr, datas[i].id);
                                    self.c("td", tr, datas[i].bytesavg.toFixed(3) + '', "numeric");
                                    self.c("td", tr, datas[i].calls + '', "numeric");
                                    self.c("td", tr, datas[i].bytes.toFixed(3) + '', "numeric");
                                    self.c("td", tr, datas[i].filelineno);

                                    for(var j in datas[i].entries) {
                                        tr = self.c("tr", t).class("sub");
                                        self.c("td", tr, "");
                                        self.c("td", tr, (self.round((100 * datas[i].entries[j].bytes) / datas[i].entries[j].calls) / 100).toFixed(3) + '', "numeric");
                                        self.c("td", tr, datas[i].entries[j].calls + '', "numeric");
                                        self.c("td", tr, datas[i].entries[j].bytes.toFixed(3) + '', "numeric");
                                        self.c("td", tr, datas[i].entries[j].filelineno);
                                    }
                                }
                                return t;
                            }
                        );
                    }
                );

            this.c("a")
                .text("top 20 calls")
                .attr("href", "#")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function(e) {
                        self.clear()
                            .tab(this)
                            .show(
                            self.getTopCalls()
                            , function(datas) {
                                var t = self.c("table")
                                    ,tr = self.c("tr", t);
                                self.c("th", tr, "function");
                                self.c("th", tr, "calls", "w100");
                                self.c("th", tr, "ms", "w100");
                                self.c("th", tr, "Kb", "w100");
                                self.c("th", tr, "called from");
                                for(var i in datas) {
                                    tr = self.c("tr", t);
                                    self.c("td", tr, datas[i].id);
                                    self.c("td", tr, datas[i].calls, "numeric");
                                    self.c("td", tr, datas[i].usec.toFixed(3) + '', "numeric");
                                    self.c("td", tr, datas[i].bytes.toFixed(3) + '', "numeric");
                                    self.c("td", tr, '');

                                    for(var j in datas[i].entries) {
                                        tr = self.c("tr", t).class("sub");
                                        self.c("td", tr, "");
                                        self.c("td", tr, datas[i].entries[j].calls, "numeric");
                                        self.c("td", tr, datas[i].entries[j].usec.toFixed(3) + '', "numeric");
                                        self.c("td", tr, datas[i].entries[j].bytes.toFixed(3) + '', "numeric");
                                        self.c("td", tr, datas[i].entries[j].filelineno);
                                    }
                                }
                                return t;
                            }
                        );
                    }
                );

            if(self.aggregate().includesCount > 0)
            this.c("a")
                .text("files (" + self.aggregate().includesCount + ")")
                .attr("href", "#")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function() {
                        self.clear()
                            .tab(this)
                            .show(
                            self.getIncludes()
                            , function(datas) {
                                var t = self.c("table").addClass("tree")
                                    ,tr = self.c("tr", t);

                                self.c("th", tr, "file");
                                self.c("th", tr, "calls from", "w100");
                                self.c("th", tr, "ms", "w100");
                                self.c("th", tr, "kb", "w100");

                                for(var i in datas) {
                                    var tr = self.c("tr", t);
                                    self.c("td", tr, i);
                                    self.c("td", tr, "", 'numeric')
                                        .append(
                                            self.gauge(
                                                    self.round((datas[i].calls * 100) / self.stack.length),
                                                    datas[i].calls)
                                                .addClass("gauge")
                                        );
                                    self.c("td", tr, datas[i].usec.toFixed(3), 'numeric');
                                    self.c("td", tr, datas[i].bytes.toFixed(3), 'numeric');
                                }
                                return t;
                            }
                        );
                    }
                );


            if(self.aggregate().groupsCount > 0)
            this.c("a")
                .text("groups (" + self.aggregate().groupsCount + ")")
                .attr("href", "#")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function() {
                        self.clear()
                            .tab(this)
                            .show(
                            self.getGroups()
                            , function(datas) {
                                var t = self.c("table")
                                    ,tr = self.c("tr", t);

                                self.c("th", tr, "group");
                                self.c("th", tr, "calls", "w100");
                                self.c("th", tr, "ms", "w100");
                                self.c("th", tr, "Kb", "w100");

                                for(var i in datas) {
                                    var tr = self.c("tr", t);
                                    self.c("td", tr)
                                        .append(self.getDomTag(i))
                                        .append(self.c("span").text(datas[i].refs.length + ' ' + (datas[i].refs.length>1 ? 'entries' : 'entry')));
                                    self.c("td", tr, datas[i].calls, 'numeric');
                                    self.c("td", tr, datas[i].usec.toFixed(3) + '', 'numeric');
                                    self.c("td", tr, datas[i].bytes.toFixed(3) + '', 'numeric');
                                    for(var j in datas[i].refs) {
                                        var trsub = self.c("tr", t).class("sub");
                                        self.c("td", trsub, datas[i].refs[j]);
                                        self.c("td", trsub, "", 'numeric')
                                            .append(
                                                self.gauge(
                                                        self.round((self.hstack[datas[i].refs[j]].calls * 100) / datas[i].calls)
                                                        , self.hstack[datas[i].refs[j]].calls)
                                                    .addClass("gauge")
                                            );
                                        self.c("td", trsub, "", 'numeric')
                                            .append(
                                                self.gauge(
                                                        self.round((self.hstack[datas[i].refs[j]].usec * 100) / datas[i].usec)
                                                        , self.hstack[datas[i].refs[j]].usec.toFixed(3))
                                                    .addClass("gauge")
                                            );
                                        self.c("td", trsub,  "", 'numeric')
                                            .append(
                                                self.gauge(
                                                        self.round((self.hstack[datas[i].refs[j]].bytes * 100) / datas[i].bytes)
                                                        , self.hstack[datas[i].refs[j]].bytes.toFixed(3))
                                                    .addClass("gauge")
                                            );

                                        for(var entry in self.hstack[datas[i].refs[j]].entries) {
                                            var stackRefs = self.hstack[datas[i].refs[j]].entries[entry].stackRefs;
                                            for(var k = 0; k < stackRefs.length; k++) {
                                                if(self.stack[stackRefs[k]].caption) {
                                                    var trsubsub = self.c("tr", t);
                                                    self.c("td", trsubsub, self.stack[stackRefs[k]].caption, "indent")
                                                        .attr("colspan","2");
                                                    self.c("td", trsubsub, self.roundDiv(self.stack[stackRefs[k]].usec, 1000).toFixed(3), 'numeric');
                                                    self.c("td", trsubsub, self.roundDiv(self.stack[stackRefs[k]].bytes, 1024).toFixed(3), 'numeric');
                                                }
                                            }
                                        }
                                    }
                                }
                                return t;
                            }
                        );
                    }
                );

            /*this.c("a")
                .text("statistics")
                .attr("href", "#")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function() {
                        self.clear()
                            .tab(this)
                            .c("div")
                            .text("\n\
                            calls: " + self.stack.length + "<br>\n\
                            max nested level: " + self.maxNestedLevel + "\n\
                            \n\
                            ")
                            .appendTo(self.getConsole());
                    }
                );*/

            this.c("input")
                //.class("right")
                .attr("type", "text")
                //.attr("autosave", "unique")
                //.attr("results", 5)
                .attr("name", "forpSearch")
                .attr("placeholder", "Search forp ...")
                //.attr("style", "margin: -2px 25px 5px 25px")
                .appendTo(container)
                .bind(
                    "click",
                    function() {
                        self.f(this).class("selected");
                        self.tab(this);
                    }
                )
                .bind(
                    "keyup",
                    function() {
                        self.window.open();
                        self.clear()
                            .show(
                            self.find(this.value)
                            , function(datas) {
                                var t = self.c("table")
                                    ,tr = self.c("tr", t);
                                self.c("th", tr, "function");
                                self.c("th", tr, "calls", "w100");
                                self.c("th", tr, "ms", "w100");
                                self.c("th", tr, "Kb", "w100");
                                self.c("th", tr, "called from");
                                for(var i in datas) {
                                    tr = self.c("tr", t);
                                    self.c("td", tr, datas[i].id);
                                    self.c("td", tr, datas[i].calls, "numeric");
                                    self.c("td", tr, datas[i].usec.toFixed(3) + '', "numeric");
                                    self.c("td", tr, datas[i].bytes.toFixed(3) + '', "numeric");
                                    self.c("td", tr, datas[i].filelineno);
                                    for(var j in datas[i].entries) {
                                        tr = self.c("tr", t).class("sub");
                                        self.c("td", tr, "");
                                        self.c("td", tr, '', "numeric")
                                            .append(
                                                self.gauge(
                                                    self.round((datas[i].entries[j].calls * 100) / datas[i].calls)
                                                    , datas[i].entries[j].calls
                                                ).addClass("gauge")
                                            );

                                        self.c("td", tr, '', "numeric")
                                            .append(
                                                self.gauge(
                                                    self.round((datas[i].entries[j].usec * 100) / datas[i].usec)
                                                    , datas[i].entries[j].usec.toFixed(3)
                                                ).addClass("gauge")
                                            );

                                        self.c("td", tr, '', "numeric")
                                            .append(
                                                self.gauge(
                                                    self.round((datas[i].entries[j].bytes * 100) / datas[i].bytes)
                                                    , datas[i].entries[j].bytes.toFixed(3)
                                                ).addClass("gauge")
                                            );

                                        self.c("td", tr, datas[i].entries[j].filelineno);
                                    }
                                }
                                return t;
                            }
                        );
                    }
                );
        };
    };
})(forp);

/**
 * forp starter
 */
forp.ready(
    function(){
        var s = document.createElement('style'),
            t = document.createTextNode('\n\
#forp {\n\
    position: relative;\n\
    color: #222;\n\
    z-index: 2147483647;\n\
    text-decoration: none;\n\
    font-family: "Helvetica Neue", Helvetica, Nimbus, Arial, sans-serif;\n\
    font-weight: 300;\n\
    text-rendering: optimizelegibility;\n\
    max-width: 300px;\n\
    font-size : 13px;\n\
    background-color: #eee;\n\
}\n\
#forp div.footer {\n\
    height: 10px; position: absolute;\n\
    bottom: 0px; left: 0px; right: 0px;\n\
    -webkit-box-shadow: inset 0 -3px 8px -2px #aaa;\n\
    -moz-box-shadow: inset 0 -3px 8px -2px #aaa;\n\
    box-shadow: inset 0 -3px 8px -2px #aaa;\n\
}\n\
#forp.closed {\n\
    margin: 15px;\n\
    border-radius: 8px;\n\
    position:fixed; \n\
    top:0px; \n\
    right:0px; \n\
    width: 200px;\n\
    opacity: .6;\n\
    cursor: pointer;\n\
}\n\
#forp.closed:hover {\n\
    opacity: 1;\n\
}\n\
#forp.opened{\n\
    max-width: 100%;\n\
    left:0px\n\
}\n\
#forp.opened a{\n\
    display: inline;\n\
}\n\
#forp nav{\n\
    border-radius: 8px;\n\
    padding: 14px 10px 10px 10px;\n\
}\n\
#forp.closed nav{\n\
    height: auto;\n\
}\n\
#forp.closed nav>div{\n\
    margin: 3px 0px;\n\
}\n\
#forp.opened nav{\n\
    height: 22px;\n\
}\n\
#forp.opened nav>div{\n\
    float: left;\n\
}\n\
#forp a{\n\
    white-space:nowrap;\n\
    text-decoration: none;\n\\n\
    color: #FFF;\n\
}\n\
#forp a.btn, a.tbtn{\n\
    color: #FFF;\n\
    margin: 0px 5px;\n\
    padding: 4px 5px 5px 5px;\n\
    background-color: #555;\n\
    text-decoration: none;\n\
}\n\
#forp a.close{\n\
    position: absolute; bottom: -13px; left: 40%; right: 40%; text-align: center;\n\
}\n\
#forp a.selected {\n\
    background-color: #4D90FE;\n\
}\n\
#forp a.tag{\n\
    background-color: #EE0;\n\
    color : #222;\n\
    font-size : 10px;\n\
    padding: 2px 5px;\n\
    margin: 0px 5px;\n\
}\n\
#forp a.tag, #forp a{\n\
    border-radius: 3px;\n\
}\n\
#forp table{\n\
    font-weight: 300;\n\
    font-size : 13px;\n\
    width: 100%;\n\
    border-collapse: collapse;\n\
}\n\
#forp div.console{\n\
    background-color: #fff;\n\
    overflow: auto;\n\
    padding-bottom: 15px;\n\
    border-top: 1px solid #aaa;\n\
}\n\
#forp th, #forp td{\n\
    padding: 5px\n\
}\n\
#forp th{\n\
    color: #fff;\n\
    background-color : #888\n\
}\n\
#forp .w100{\n\
    width: 120px;\n\
}\n\
#forp td{\n\
    text-align: left;\n\
    text-overflow: ellipsis;\n\
    word-space: nowrap;\n\
    overflow: hidden;\n\
    border: 1px solid #ddd;\n\
}\n\
#forp tr{\n\
    color: #333;\n\
    background-color: #fff;\n\
}\n\
#forp tr.sub{\n\
    background-color: #eee;\n\
}\n\
#forp tr:hover{ \n\
    background-color: #eeb; \n\
}\n\
#forp .numeric{\n\
    text-align: right;\n\
}\n\
#forp ul{\n\
    line-height: 1.8;\n\
    list-style: none;\n\
    padding-left: 20px;\n\
}\n\
#forp ul.l0{\n\
    padding-left: 10px;\n\
}\n\
#forp li > div.numeric{\n\
    min-width: 60px;\n\
    margin: 0px 10px\n\
}\n\
#forp div.expander{\n\
    text-align:center;\n\
    width: 20px;\n\
    cursor: pointer;\n\
}\n\
#forp li.expanded > div.expander:before{\n\
    content: "-";\n\
}\n\
#forp li.collapsed > div.expander:before {\n\
    content: "+";\n\
}\n\
#forp li.collapsed > ul{\n\
    display: none;\n\
}\n\
#forp .left{\n\
    float: left;\n\
}\n\
#forp .right{\n\
    float: right;\n\
}\n\
#forp div.gauge{\n\
    line-height: 1.8;\n\
    color: #fff;\n\
    margin: 4px 5px 0px 0px;\n\
    width: 100px;\n\
    text-align: right;\n\
    font-size: 0.8em;\n\
    padding: 0px 3px;\n\
}\n\
#forp div.i{\n\
    position: absolute;\n\
    top: 3px;\n\
    right: 3px;\n\
    font-weight: 900;\n\
    text-align: center;\n\
    background-color: #ccc;\n\
    width: 15px;\n\
    height: 15px;\n\
    border-radius: 10px;\n\
}\n\
#forp div.i>a{\n\
    font-family: Georgia;\n\
    color: #FFF;\n\
}\n\
#forp input[type=text]{\n\
    font-size: 11px;\n\
    padding: 5px;\n\
    border: 1px solid #777;\n\
    -moz-border-radius: 3px;\n\
    -webkit-border-radius: 3px;\n\
    border-radius: 3px;\n\
    background-color: #fff;\n\
    margin: 0px 5px\n\
}\n\
#forp .indent {\n\
    padding-left: 30px\n\
}\n\
');
        s.appendChild(t);
        (document.getElementsByTagName('head')[0]
            || document.getElementsByTagName('body')[0]).appendChild(s);

        // Runs forp
        var f = new forp.Manager();
        f.stack = forp.stack;
        f.run();
    }
);