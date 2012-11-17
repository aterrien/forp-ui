/**
 * Sorted Fixed Array Class
 */
var SortedFixedArray = function(filter, size) {
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

var forp = function(stack) {
    var self = this;

    this.window = null;
    this.stack = stack; // RAW stack
    this.hstack = null; // hashed stack
    this.includes = null; // included files
    this.groups = null; // groups
    this.topCpu = null;
    this.topCalls = null;
    this.topMemory = null;
    this.console = null;
    this.found = {};

    // DOM Element wrapper
    var o = function(element)
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
            return new oColl(this.element.querySelectorAll(s));
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

    var oColl = function(elements)
    {
        this.elements = elements;
        this.each = function(fn)
        {
            for(var i=0; i<this.elements.length; i++) {
                fn(new o(this.elements[i]));
            }
        }
    }

    this.f = function(mixed)
    {
        if(typeof(mixed) == 'object') {
            return new o(mixed);
        } else {
            return new oColl(document.querySelectorAll(mixed));
        }
    };

    this.c = function(tag, appendTo, inner, css)
    {
        var e = document.createElement(tag);
        if(inner) e.innerHTML = inner;
        if(appendTo) appendTo.append(new o(e));
        if(css) {
            var classAttr = document.createAttribute("class");
            classAttr.nodeValue = css;
            e.setAttributeNode(classAttr);
        }
        return new o(e);
    };

    this.gauge = function(percent, text, hcolor)
    {
        hcolor = hcolor ? hcolor : "#CCC";
        return self.c("div")
            .text(text)
            .attr(
                "style",
                "background: -moz-linear-gradient(left, " + hcolor + " 0%, " + hcolor + " " + percent + "%, #eee " + percent + "%, #eee 100%);\n\
                background: -webkit-gradient(linear, left top, right top, color-stop(0%," + hcolor + "), color-stop(" + percent + "%," + hcolor + "), color-stop(" + percent + "%,#eee), color-stop(100%,#eee));\n\
                background: -webkit-linear-gradient(left, " + hcolor + " 0%," + hcolor + " " + percent + "%,#eee " + percent + "%,#eee 100%);\n\
                background: -o-linear-gradient(left, " + hcolor + " 0%," + hcolor + " " + percent + "%,#eee " + percent + "%,#eee 100%);\n\
                background: linear-gradient(left, " + hcolor + " 0%," + hcolor + " " + percent + "%,#eee " + percent + "%,#eee 100%);\n\
                ");
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
            var id;
            this.hstack = {};
            this.includes = {};
            this.groups = {};
            for(var entry in this.stack) {
                id = this.getEntryId(this.stack[entry]);

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
                        this.hstack[id].usec += this.roundDiv(this.stack[entry].usec, 1000);
                        this.hstack[id].bytes += this.roundDiv(this.stack[entry].bytes, 1024);
                    }

                    var el = this.hstack[id].entries.length
                        ,filelineno = this.stack[entry].file
                        + (this.stack[entry].lineno ? ':' + this.stack[entry].lineno : '');

                    if(this.hstack[id].entries[filelineno]) {
                        this.hstack[id].entries[filelineno].calls++;
                        if(makeSum) {
                            this.hstack[id].entries[filelineno].usec += this.roundDiv(this.stack[entry].usec, 1000);
                            this.hstack[id].entries[filelineno].bytes += this.roundDiv(this.stack[entry].bytes, 1024);
                        }
                    } else {
                        this.hstack[id].entries[filelineno] = {};
                        this.hstack[id].entries[filelineno].calls = 1;
                        this.hstack[id].entries[filelineno].usec = this.roundDiv(this.stack[entry].usec, 1000);
                        this.hstack[id].entries[filelineno].bytes = this.roundDiv(this.stack[entry].bytes, 1024);
                        this.hstack[id].entries[filelineno].file = this.stack[entry].file;
                        this.hstack[id].entries[filelineno].filelineno = filelineno;
                        this.hstack[id].entries[filelineno].caption = this.stack[entry].caption ? this.stack[entry].caption : '';
                    }
                } else {
                    this.hstack[id] = {};
                    this.hstack[id].id = id;
                    this.stack[entry].class &&
                        (this.hstack[id].class = this.stack[entry].class);
                    this.hstack[id].function = this.stack[entry].function;
                    this.hstack[id].level = this.stack[entry].level;

                    this.hstack[id].calls = 1;
                    this.hstack[id].usec = this.roundDiv(this.stack[entry].usec, 1000);
                    this.hstack[id].bytes = this.roundDiv(this.stack[entry].bytes, 1024);

                    var filelineno = this.stack[entry].file
                        + (this.stack[entry].lineno ? ':' + this.stack[entry].lineno : '');
                    this.hstack[id].entries = [];
                    this.hstack[id].entries[filelineno] = {}
                    this.hstack[id].entries[filelineno].calls = 1;
                    this.hstack[id].entries[filelineno].usec = this.hstack[id].usec;
                    this.hstack[id].entries[filelineno].bytes = this.hstack[id].bytes;
                    this.hstack[id].entries[filelineno].file = this.stack[entry].file;
                    this.hstack[id].entries[filelineno].filelineno = filelineno;
                    this.hstack[id].entries[filelineno].caption = this.stack[entry].caption ? this.stack[entry].caption : '';

                    // Groups
                    if(this.stack[entry].groups) {
                        for(g in this.stack[entry].groups) {
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
                    this.includes[this.stack[entry].file] = 1;
                } else {
                    this.includes[this.stack[entry].file]++;
                }
            }

            // Finalize groups
            for(var group in this.groups) {
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
            this.topCalls = new SortedFixedArray(
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
            this.topCpu = new SortedFixedArray(
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
            this.topMemory = new SortedFixedArray(
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

    this.getConsole = function()
    {
        if(!this.console) {

            this.console = this.c("div").addClass("console").attr("style", "max-height:" + (window.innerHeight - 100) + "px");
            this.window.append(this.console);
            var aCollapse = this.c("a")
                .text("^")
                .attr("href", "javascript:void(0);")
                .appendTo(this.nav)
                .class("btn")
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
        // Init
        this.window = this
            .c("div")
            .attr("id", "forp")
            .close();

        this.window.bind(
            "click",
            function() { self.open(); }
        );
        document.body.appendChild(this.window.element);

        this.nav = this
            .c("nav")
            .appendTo(this.window);

        //this.nav.append(this.c("span").text('User : 0000ms<br>System : 0000ms '));

        this.c("div")
            .class("i")
            .append(
                this.c("a")
                    .attr("href", "https://github.com/aterrien/forp")
                    .attr("target", "_blank")
                    .text("i")
                    )
            .appendTo(this.window);

        this.c("div")
            .text(self.roundDiv(this.stack[0].usec, 1000) + ' ms ')
            .appendTo(this.nav);

        this.c("div")
            .text(self.roundDiv(this.stack[0].bytes, 1024) + ' Kb')
            .appendTo(this.nav);

        this.c("div")
            .text('&nbsp;')
            .appendTo(this.nav);

        this.c("input")
            .attr("type", "search")
            .attr("autosave", "forp")
            .attr("results", 5)
            .attr("name", "forpSearch")
            .attr("placeholder", "Search forp")
            .appendTo(this.nav)
            .bind(
                'keyup',
                function() {
                    self.window.open();
                    self.clear();
                    self.show(
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
                                            )
                                        );

                                    self.c("td", tr, '', "numeric")
                                        .append(
                                            self.gauge(
                                                self.round((datas[i].entries[j].usec * 100) / datas[i].usec)
                                                , datas[i].entries[j].usec.toFixed(3)
                                            )
                                        );

                                    self.c("td", tr, '', "numeric")
                                        .append(
                                            self.gauge(
                                                self.round((datas[i].entries[j].bytes * 100) / datas[i].bytes)
                                                , datas[i].entries[j].bytes.toFixed(3)
                                            )
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
            for(g in entry.groups) {
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
     * Expand main window
     */
    this.opened = false;
    this.open = function()
    {
        if(this.opened) return; // TODO unbind
        this.opened = true;

        this.window.open();

        this.c("a")
            .text("Full stack")
            .attr("href", "javascript:void(0);")
            .class("btn")
            .appendTo(this.nav)
            .bind(
                'click',
                function() {
                    self.clear();

                    var tree = self.aggregate().treeList(self.stack[0], true);

                    self.c("div")
                        .attr("style", "margin-top: 10px")
                        .append(
                                self.c("a")
                                    .text("Expand all")
                                    .attr("href", "#")
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
                                    .text("Collapse all")
                                    .attr("href", "#")
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
                        .append(tree)
                        .appendTo(self.getConsole());
                }
            );

        this.c("a")
            .text("Duration")
            .attr("href", "#")
            .class("btn")
            .appendTo(this.nav)
            .bind(
                'click',
                function() {
                    self.clear();
                    self.show(
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
                                    self.c("td", tr, (self.round((100 * datas[i].entries[j].usec) / datas[i].entries[j].calls) / 100).toFixed(2), "numeric");
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
            .text("Memory")
            .attr("href", "#")
            .class("btn")
            .appendTo(this.nav)
            .bind(
                'click',
                function() {
                    self.clear();
                    self.show(
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
                                    self.c("td", tr, (self.round((100 * datas[i].entries[j].bytes) / datas[i].entries[j].calls) / 100).toFixed(2) + '', "numeric");
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
            .text("Calls")
            .attr("href", "#")
            .class("btn")
            .appendTo(this.nav)
            .bind(
                'click',
                function(e) {
                    self.clear();
                    self.show(
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

        this.c("a")
            .text("Files")
            .attr("href", "#")
            .class("btn")
            .appendTo(this.nav)
            .bind(
                'click',
                function() {
                    self.clear();
                    self.show(
                        self.getIncludes()
                        , function(datas) {
                            var t = self.c("table").addClass("tree")
                                ,tr = self.c("tr", t);

                            self.c("th", tr, "usage");
                            self.c("th", tr, "path");

                            for(var i in datas) {
                                var tr = self.c("tr", t);
                                self.c("td", tr, datas[i], 'numeric');
                                self.c("td", tr, i);
                            }
                            return t;
                        }
                    );
                }
            );

        this.c("a")
            .text("Groups")
            .attr("href", "#")
            .class("btn")
            .appendTo(this.nav)
            .bind(
                'click',
                function() {
                    self.clear();
                    self.show(
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
                                        );
                                    self.c("td", trsub, "", 'numeric')
                                        .append(
                                            self.gauge(
                                                    self.round((self.hstack[datas[i].refs[j]].usec * 100) / datas[i].usec)
                                                    , self.hstack[datas[i].refs[j]].usec.toFixed(3))
                                        );
                                    self.c("td", trsub,  "", 'numeric')
                                        .append(
                                            self.gauge(
                                                    self.round((self.hstack[datas[i].refs[j]].bytes * 100) / datas[i].bytes)
                                                    , self.hstack[datas[i].refs[j]].bytes.toFixed(3))
                                        );
                                }
                            }
                            return t;
                        }
                    );
                }
            );
    };

    this.run();


};

// static functions
var dom = {};
dom.ready = function(callback) {
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

dom.ready(
    function(){
        var s = document.createElement('style'),
            t = document.createTextNode('\n\
#forp {\n\
    z-index: 2147483647;\n\
    text-decoration: none;\n\
    margin: 15px;\n\
    font-family: "Helvetica Neue", Helvetica, Nimbus, Arial, sans-serif;\n\
    font-weight: 300;\n\
    text-rendering: optimizelegibility;\n\
    position:fixed; \n\
    top:0px; \n\
    right:0px; \n\
    max-width: 300px;\n\
    font-size : 13px;\n\
    border-radius: 8px;\n\
    color: #222;\n\
    border: 3px solid #333;\n\
    background-color: #fff;\n\
}\n\
#forp.opened {\n\
    opacity: 1;\n\
}\n\
#forp.closed {\n\
    width: 150px;\n\
    opacity: .5;\n\
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
    padding: 10px;\n\
}\n\
#forp.closed nav>div{\n\
    margin: 3px 0px;\n\
}\n\
#forp.opened nav>div{\n\
    float: left;\n\
    margin: 0px 5px;\n\
}\n\
#forp a{\n\
    white-space:nowrap;\n\
    text-decoration: none;\n\
}\n\
#forp nav>a.btn, #forp div.console a{\n\
    color: #FFF;\n\
    margin: 0px 5px;\n\
    padding: 5px;\n\
    background-color: #777;\n\
    background-image: linear-gradient(top,#777,#666);\n\
    background-image: -webkit-linear-gradient(top,#777,#666);\n\
    background-image: -moz-linear-gradient(top,#777,#666);\n\
    background-image: -ms-linear-gradient(top,#777,#666);\n\
    background-image: -o-linear-gradient(top,#777,#666);\n\
    color: #FFF;\n\
    text-decoration: none;\n\
}\n\
#forp a.tag{\n\
    background-color: #EE0;\n\
    color : #222;\n\
    font-size : 10px;\n\
    padding: 2px 5px;\n\
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
    overflow: auto;\n\
    padding-bottom: 15px;\n\
    border-top: 1px solid #999;\n\
}\n\
#forp th, #forp td{\n\
    padding: 5px\n\
}\n\
#forp th{\n\
    color: #fff;\n\
    background-color : #777\n\
}\n\
#forp .w100{\n\
   width: 120px;\n\
}\n\
#forp td{\n\
    //width: 250px;\n\
    text-align: left;\n\
    text-overflow: ellipsis;\n\
    word-space: nowrap;\n\
    overflow: hidden;\n\
    border: 1px solid #DDD;\n\
}\n\
#forp tr.sub{\n\
    background-color:#eee;\n\
}\n\
#forp tr:hover{ \n\
    background-color:#EEB; \n\
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
#forp li{\n\
    //padding: 3px 0px;\n\
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
    //border: 1px solid #00F\n\
}\n\
#forp div.gauge{\n\
    margin: 4px 5px 0px 0px;\n\
    //height: 10px;\n\
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
    background-color: #DDD;\n\
    width: 15px;\n\
    height: 15px;\n\
    border-radius: 10px;\n\
}\n\
#forp div.i>a{\n\
    font-family: Georgia;\n\
    color: #FFF;\n\
}');
        s.appendChild(t);
        (document.getElementsByTagName('head')[0]
            || document.getElementsByTagName('body')[0]).appendChild(s);

        new forp(forp.stack);
    }
);