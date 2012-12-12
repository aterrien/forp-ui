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
 * Normalizr
 */
forp.Normalizr = {
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
}
/**
 * Shortcut
 */
forp.c = function(tag, appendTo, inner, css)
{
    var e = document.createElement(tag);
    if(inner) e.innerHTML = inner;
    if(appendTo) appendTo.append(forp(e));
    if(css) {
        var classAttr = document.createAttribute("class");
        classAttr.nodeValue = css;
        e.setAttributeNode(classAttr);
    }
    return forp(e);
};
/**
 * Find a DOM Element
 * @param mixed
 * @return forp.DOMElementWrapper|forp.DOMElementWrapperCollection
 */
forp.find = function(mixed)
{
    if(typeof(mixed) == 'object') {
        return forp(mixed);
    } else {
        return new forp.DOMElementWrapperCollection(document.querySelectorAll(mixed));
    }
};
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
        return forp(this.element.nextSibling);
    }
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
forp.Table = function(headers)
{
    forp.DOMElementWrapper.call(this);
    this.element = document.createElement("table");

    if(headers) {
        var header = forp.c("tr", this);
        for(var i in headers) {
            forp.c("th", header, headers[i]);
        }
    }

    this.line = function(cols) {
        return (new forp.Line(cols)).appendTo(this);
    }
};

forp.Line = function(cols)
{
    forp.DOMElementWrapper.call(this);
    this.element = document.createElement("tr");

    for(var i in cols) {
        if(typeof cols[i] === "object") {
            forp.c("td", this, "", "numeric w100").append(cols[i]);
        } else if(isNaN(cols[i])) {
            forp.c("td", this, cols[i]);
        } else {
            forp.c("td", this, cols[i], "numeric w100");
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
     * @param callback compare
     * @param int size
     */
    f.SortedFixedArray = function(compare, size) {
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
         * Exposed put
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
    };

    /**
     * forp Console
     * console API https://developer.mozilla.org/en-US/docs/DOM/console
     */
    f.Console = function()
    {
        var self = this;
        f.DOMElementWrapper.call(this);
        this.element = document.createElement("div");

        this.open = function() {

            this.attr("style", "height: " + (window.innerHeight / 2) + "px")
                .class("console opened");

            f.c("a")
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
    };

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

        this.gauge = function(percent, text, hcolor)
        {
            var bcolor = "#ccc";
            hcolor = hcolor ? hcolor : "#4D90FE";
            return f.c("div")
                .class("gauge")
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
                    ms = this.roundDiv(this.stack[entry].usec, 1000);
                    kb = this.roundDiv(this.stack[entry].bytes, 1024);

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
                    this.refineParents(this.stack[entry]);

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
                        a.usecavg = self.round((a.usec / a.calls) * 100) / 100;
                        b.usecavg = self.round((b.usec / b.calls) * 100) / 100;
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
                        a.bytesavg = self.round((a.bytes / a.calls) * 100) / 100;
                        b.bytesavg = self.round((b.bytes / b.calls) * 100) / 100;
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
                this.console = new f.Console();
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
         *
         */
        this.getDomTag = function(name)
        {
            console.log(this.groups[name].element);
            if(!this.groups[name].element) {
                this.groups[name].element = f.c("a")
                                     .class("tag")
                                     .attr('style', 'background-color: rgb('+Math.round(Math.random()*100+155)+','+Math.round(Math.random()*100+155)+','+Math.round(Math.random()*100+155)+')'
                                        )
                                     .text(name)
                                     .bind(
                                        "click",
                                        function(){
                                            //alert('to groups view');
                                        }
                                     );

            }
            return this.groups[name].element;
        };

        /**
         * Run window manager
         * @return forp.Manager
         */
        this.run = function()
        {
            // init
            this.window = f.c("div")
                           .attr("id", "forp")
                           .close();

            document.body.insertBefore(this.window.element, document.body.firstChild);

            this.nav = f.c("nav")
                        .appendTo(this.window);

            // infos button
            f.c("div")
             .class("i")
             .append(
                f.c("a")
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

                f.c("div")
                    .attr("style", "margin-right: 10px")
                    .text(self.roundDiv(this.stack[0].usec, 1000) + ' ms ')
                    .appendTo(this.nav);

                f.c("div")
                    .attr("style", "margin-right: 10px")
                    .text(self.roundDiv(this.stack[0].bytes, 1024) + ' Kb')
                    .appendTo(this.nav);
            } else {
                f.c("div")
                    .text("Give me something to eat !")
                    .appendTo(this.nav);
            }

            return this;
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

            var ul =   f.c("ul")
                        .class("l" + entry.level)
                , ex = f.c("div")
                        .text("&nbsp;")
                        .addClass("left expander")
                , gd = this
                        .gauge(
                            this.stack[entry.parent] ? this.round((entry.usec * 100) / this.stack[entry.parent].usec) : 100
                            , this.roundDiv(entry.usec, 1000) + 'ms')
                        .addClass("left")
                , gb = this
                        .gauge(this.stack[entry.parent] ? this.round((entry.bytes * 100) / this.stack[entry.parent].bytes) : 100
                            , this.roundDiv(entry.bytes, 1024) + 'Kb')
                        .addClass("left")
                , li = f.c("li")
                        .text(entry.id);

            if(entry.groups) {
                for(var g in entry.groups) {
                    li.append(this.getDomTag(entry.groups[g]));
                }
            }
            if(entry.caption) li.append(f.c("span").text(entry.caption));

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
                        //if(ex.top() > h2) self.getConsole().element.scrollTop = ex.top() - h2;

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
         * @return forp.Manager
         */
        this.tab = function(target)
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
                line = f.c("tr"),
                td = f.c("td")
                      .attr("colspan", 4)
                      .appendTo(line);

            var table = td.table(["called from", " ms", "Kb"]); //"calls",
            for(var i in self.functions[id].entries) {
                for(var j in self.functions[id].entries[i].refs) {
                    if(!self.functions[id].entries[i].refs[j]) continue;
                    table.line([
                        self.functions[id].entries[i].refs[j].filelineno +
                        (self.functions[id].entries[i].refs[j].caption ? "<br>" + self.functions[id].entries[i].refs[j].caption : ""),
                        self.gauge(
                            self.round((self.functions[id].entries[i].refs[j].usec * 100) / self.sumDuration(self.functions[id].refs))
                            , self.roundDiv(self.functions[id].entries[i].refs[j].usec, 1000).toFixed(3)
                        ),
                        self.gauge(
                            self.round((self.functions[id].entries[i].refs[j].bytes * 100) / self.sumMemory(self.functions[id].refs))
                            , self.roundDiv(self.functions[id].entries[i].refs[j].bytes, 1000).toFixed(3)
                        ),
                    ]);
                }
                /*table.line([
                    self.functions[id].entries[i].filelineno,
                    self.gauge(
                        self.round((self.functions[id].entries[i].calls * 100) / self.functions[id].calls)
                        , self.functions[id].entries[i].calls
                    ),
                    self.gauge(
                        self.round((self.sumDuration(self.functions[id].entries[i].refs) * 100) / self.sumDuration(self.functions[id].refs))
                        , self.roundDiv(self.sumDuration(self.functions[id].entries[i].refs), 1000).toFixed(3)
                    ),
                    self.gauge(
                            self.round((self.sumMemory(self.functions[id].entries[i].refs) * 100) / self.sumMemory(self.functions[id].refs))
                            , self.roundDiv(self.sumMemory(self.functions[id].entries[i].refs), 1024).toFixed(3)
                        )
                ]);*/
            }
            target.insertAfter(line);
        };

        /**
         * Expand main window
         * @return forp.Manager
         */
        this.opened = false;
        this.open = function()
        {
            if(this.opened) return; // TODO unbind
            this.opened = true;

            this.window.open();

            // footer
            f.c("div")
                .class("footer")
                .appendTo(this.window);

            var container = f.c("div").attr("style", "margin-top: -2px");
            container.appendTo(this.nav);

            self.aggregate();

            f.c("a")
                .text("stack (" + self.stack.length + ")")
                .attr("href", "javascript:void(0);")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function() {
                        var tree = self.treeList(self.stack[0], true);

                        self.tab(this)
                            .getConsole()
                            .empty()
                            .log(
                                f.c("div")
                                    .attr("style", "margin-top: 10px;")
                                    .append(
                                        f.c("div")
                                            .attr("style", "position: absolute; margin: 5px; right: 20px")
                                            .append(
                                                    f.c("a")
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
                                                    f.c("a")
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
                                        f.c("div").append(tree)
                                    )
                                );
                    }
                );

            f.c("a")
                .text("top 20 duration")
                .attr("href", "#")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function() {
                        var lines = [],
                            datas = self.getTopCpu();

                        self.tab(this);

                        /*for(var i = 0; i < self.leaves.length; i++) {
                            var h = (self.leaves[i].usec * 50) / datas[0].usec;
                            f.c("div")
                                .attr("style", "height: 50px;")
                                .class("left")
                                .attr("style", "margin: 1px; width: 1px; height: " + h + "px; background-color: #4D90FE;")
                                .appendTo(d);
                        }*/

                        var table = self.getConsole()
                                        .open()
                                        .empty()
                                        .table(["function", "self cost ms", "total cost ms", "calls"]);

                        for(var i in datas) {
                            var id = self.getEntryId(datas[i]);
                            table.line([
                                    "<strong>" + datas[i].id + "</strong> (" + datas[i].filelineno + ")"
                                    + (datas[i].caption ? "<br>" + datas[i].caption : ""),
                                    self.roundDiv(datas[i].usec, 1000).toFixed(3) + '',
                                    self.roundDiv(self.sumDuration(self.functions[id].refs), 1000).toFixed(3) + '',
                                    self.functions[id].calls
                                ]);
                        }
                    }
                );

            f.c("a")
                .text("top 20 memory")
                .attr("href", "#")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function() {
                        var lines = [],
                            datas = self.getTopMemory();

                        self.tab(this);

                        var table = self.getConsole()
                                        .empty()
                                        .open()
                                        .table(["function", "self cost Kb", "total cost Kb", "calls"]);
                        for(var i in datas) {
                            var id = self.getEntryId(datas[i]);
                            table.line([
                                "<strong>" + datas[i].id + "</strong> (" + datas[i].filelineno + ")"
                                + (datas[i].caption ? "<br>" + datas[i].caption : ""),
                                self.roundDiv(datas[i].bytes, 1024).toFixed(3) + '',
                                self.roundDiv(self.sumMemory(self.functions[id].refs), 1024).toFixed(3) + '',
                                self.functions[id].calls
                            ]);
                        }
                    }
                );

            f.c("a")
                .text("top 20 calls")
                .attr("href", "#")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function(e) {
                        var lines = [],
                            datas = self.getTopCalls();

                        self.tab(this);

                        var table = self.getConsole()
                                        .empty()
                                        .open()
                                        .table(["function", "calls", "ms", "Kb"]);
                        for(var i in datas) {
                            table.line([
                                    datas[i].id,
                                    datas[i].calls,
                                    self.roundDiv(self.sumDuration(datas[i].refs), 1000).toFixed(3) + '',
                                    self.roundDiv(self.sumMemory(datas[i].refs), 1000).toFixed(3) + ''
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
            f.c("a")
                .text("files (" + self.includesCount + ")")
                .attr("href", "#")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function() {
                        var lines = [],
                            datas = self.getIncludes();

                        self.tab(this);

                        /*for(var i in datas) {
                            lines.push(
                                {
                                    "file" : i,
                                    "calls from" : self.gauge(
                                        self.round((datas[i].calls * 100) / self.stack.length),
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
                                self.gauge(
                                    self.round((datas[i].calls * 100) / self.stack.length),
                                    datas[i].calls
                                )
                            ]);
                        }
                    }
                );

            if(self.groupsCount > 0)
            f.c("a")
                .text("groups (" + self.groupsCount + ")")
                .attr("href", "#")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function() {
                        self.tab(this)
                            .show(
                            self.getGroups()
                            , function(datas) {
                                var t = f.c("table")
                                    ,tr = f.c("tr", t);

                                f.c("th", tr, "group");
                                f.c("th", tr, "calls", "w100");
                                f.c("th", tr, "ms", "w100");
                                f.c("th", tr, "Kb", "w100");

                                for(var i in datas) {
                                    var tr = f.c("tr", t);
                                    f.c("td", tr)
                                        .append(self.getDomTag(i))
                                        .append(f.c("span").text(datas[i].refs.length + ' ' + (datas[i].refs.length>1 ? 'entries' : 'entry')));
                                    f.c("td", tr, datas[i].calls, 'numeric');
                                    f.c("td", tr, self.roundDiv(datas[i].usec, 1000).toFixed(3) + '', 'numeric');
                                    f.c("td", tr, self.roundDiv(datas[i].bytes, 1024).toFixed(3) + '', 'numeric');
                                    for(var j in datas[i].refs) {
                                        var trsub = f.c("tr", t);
                                        trsub.attr("data-ref", datas[i].refs[j].id);
                                        trsub.bind("click", self.toggleDetails);
                                        f.c("td", trsub, datas[i].refs[j].id);
                                        f.c("td", trsub, "", 'numeric')
                                            .append(
                                                self.gauge(
                                                        self.round((self.functions[datas[i].refs[j].id].calls * 100) / datas[i].calls)
                                                        , self.functions[datas[i].refs[j].id].calls)
                                            );
                                        f.c("td", trsub, "", 'numeric')
                                            .append(
                                                self.gauge(
                                                        self.round(self.sumDuration(self.functions[datas[i].refs[j].id].refs) * 100) / self.sumDuration(datas[i].refs)
                                                        , self.roundDiv(self.sumDuration(self.functions[datas[i].refs[j].id].refs), 1000).toFixed(3)
                                                        )
                                            );
                                        f.c("td", trsub, "", 'numeric')
                                            .append(
                                                self.gauge(
                                                        self.round(self.sumMemory(self.functions[datas[i].refs[j].id].refs) * 100) / self.sumDuration(datas[i].refs)
                                                        , self.roundDiv(self.sumMemory(self.functions[datas[i].refs[j].id].refs), 1024).toFixed(3)
                                                        )
                                            );
                                    }
                                }
                                return t;
                            }
                        );
                    }
                );

            f.c("a")
                .text("metrics")
                .attr("href", "#")
                .class("tbtn")
                .appendTo(container)
                .bind(
                    'click',
                    function() {
                        var table = self.tab(this)
                            .getConsole()
                            .empty()
                            .open()
                            .table(["key", "value"]);

                        table.line(["total calls", self.stack.length]);
                        table.line(["max nested level", self.maxNestedLevel]);
                        table.line(["avg nested level", self.avgLevel.toFixed(2)]);
                    }
                );

            f.c("input")
                .attr("type", "text")
                .attr("name", "forpSearch")
                .attr("placeholder", "Search forp ...")
                .appendTo(container)
                .bind(
                    "click",
                    function() {
                        f.find(this).class("selected");
                        self.tab(this);
                    }
                )
                .bind(
                    "keyup",
                    function() {
                        self.window.open();
                        self.show(
                            self.search(this.value)
                            , function(datas) {
                                var t = f.c("table")
                                    ,tr = f.c("tr", t);
                                f.c("th", tr, "function");
                                f.c("th", tr, "calls", "w100");
                                f.c("th", tr, "ms", "w100");
                                f.c("th", tr, "Kb", "w100");
                                //f.c("th", tr, "called from");
                                for(var i in datas) {
                                    tr = f.c("tr", t);
                                    tr.attr("data-ref", datas[i].id);
                                    tr.bind("click", self.toggleDetails);
                                    f.c("td", tr, datas[i].id);
                                    f.c("td", tr, datas[i].calls, "numeric");
                                    f.c("td", tr, self.roundDiv(self.sumDuration(datas[i].refs), 1000).toFixed(3) + '', "numeric");
                                    f.c("td", tr, self.roundDiv(self.sumMemory(datas[i].refs), 1024).toFixed(3) + '', "numeric");
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
            t = document.createTextNode('\n\
#forp {\n\
    position: fixed;\n\
    bottom: 0px;\n\
    right: 0px;\n\
    color: #222;\n\
    z-index: 2147483647;\n\
    text-decoration: none;\n\
    font-family: "Helvetica Neue", Helvetica, Nimbus, Arial, sans-serif;\n\
    font-weight: 300;\n\
    text-rendering: optimizelegibility;\n\
    max-width: 300px;\n\
    font-size : 13px;\n\
    background-color: #fff;\n\
    line-height: 1.3;\n\
}\n\
#forp div.footer {\n\
    //border-top: 1px solid #888; \n\
    height: 10px; position: absolute;\n\
    top: 0px; left: 0px; right: 0px;\n\
    -webkit-box-shadow: inset 0 3px 8px -2px #aaa;\n\
    -moz-box-shadow: inset 0 3px 8px -2px #aaa;\n\
    box-shadow: inset 0 3px 8px -2px #aaa;\n\
}\n\
#forp.closed {\n\
    margin: 15px;\n\
    border-radius: 8px;\n\
    width: 200px;\n\
    opacity: .6;\n\
    cursor: pointer;\n\
   -moz-box-shadow: 0 0 8px #aaa;\n\
   -webkit-box-shadow: 0 0 8px #aaa;\n\
   box-shadow: 0 0 8px #aaa;\n\
}\n\
#forp.closed:hover {\n\
    opacity: 1;\n\
}\n\
#forp.opened{\n\
    max-width: 100%;\n\
    left: 0px;\n\
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
    border-bottom-left-radius: 0px;\n\
    border-bottom-right-radius: 0px;\n\
    padding: 5px 10px;\n\
    position: absolute; \n\
    top: 21px; \n\
    right: 30px; \n\
    text-align: center;\n\
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
    overflow-x: hidden;\n\
    border-top: 1px solid #888;\n\
    transition: height .1s;\n\
    -moz-transition: height .1s;\n\
    -webkit-transition: height .1s;\n\
    -o-transition: height .1s;\n\
    transition-timing-function: ease-in;\n\
    -moz-transition-timing-function: ease-in;\n\
    -webkit-transition-timing-function: ease-in;\n\
    -o-transition-timing-function: ease-in;\n\
}\n\
#forp th, #forp td{\n\
    padding: 5px;\n\
    border: 1px solid #ddd;\n\
}\n\
#forp th{\n\
    text-align: center;\n\
    font-weight: bold;\n\
    color: #333;\n\
    border: 1px solid #ddd;\n\
    background-color : #eee;\n\
}\n\
#forp .w100{\n\
    width: 120px;\n\
}\n\
#forp td{\n\
    text-align: left;\n\
    text-overflow: ellipsis;\n\
    word-space: nowrap;\n\
    overflow: hidden;\n\
    vertical-align: top;\n\
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
#forp tr[data-ref]{\n\
    cursor: pointer;\n\
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
    width: 110px;\n\
    text-align: right;\n\
    font-size: 0.8em;\n\
    padding: 0px 3px;\n\
}\n\
#forp td>div.gauge{\n\
    margin: 0px;\n\
}\n\
#forp div.i{\n\
    position: absolute;\n\
    top: 5px;\n\
    right: 5px;\n\
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