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

    this.stack = stack; // RAW stack
    this.hstack = null; // hashed stack
    this.topCpu = null;
    this.topCalls = null;
    this.topMemory = null;
    this.console = null;
    this.found = {};

    // DOM Element wrapper
    var o = function(element)
    {
        //console.log(element);
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
        this.append = function(o) {
            this.element.appendChild(o.element);
            return this;
        };
        this.appendTo = function(o) {
            o.append(this);
            return this;
        };
        this.addClass = function(c) {
            return this.attr("class", c)
        };
        this.text = function(t) {
            this.element.innerHTML = t;
            return this;
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
    };

    this.f = function(mixed)
    {
        if(typeof(mixed) == 'object') {
            return new o(mixed);
        } else {
            return new o(document.getElementById(id));
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

    this.getHStack = function()
    {
        if(!this.hstack) {
            // hashing stack
            var id;
            this.hstack = {};
            for(var entry in this.stack) {
                id = (this.stack[entry].class) ? this.stack[entry].class + '::' : '';
                id += this.stack[entry].function;
                if(this.hstack[id]) {
                    this.hstack[id].calls ++;
                    this.hstack[id].usec =
                        parseInt(this.hstack[id].usec) +
                        (parseInt(this.stack[entry].usec) / 1000);
                    this.hstack[id].bytes += (Math.round((parseInt(this.stack[entry].bytes) / 1024)));// * 100) / 100);
                } else {
                    this.hstack[id] = {};
                    this.hstack[id].id = id;
                    this.stack[entry].class &&
                        (this.hstack[id].class = this.stack[entry].class);
                    this.hstack[id].function = this.stack[entry].function;
                    this.hstack[id].file = this.stack[entry].file;
                    this.hstack[id].filelineno = this.stack[entry].file
                        + (this.stack[entry].lineno ? ':' + this.stack[entry].lineno : '');
                    this.hstack[id].level = this.stack[entry].level;
                    this.hstack[id].calls = 1;
                    this.hstack[id].usec = (parseInt(this.stack[entry].usec) / 1000);
                    this.hstack[id].bytes = (Math.round((parseInt(this.stack[entry].bytes) / 1024)));// * 100) / 100);
                }
            }
        }
        return this.hstack;
    };

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

    this.getTopCpu = function()
    {
        if(!this.topCpu) {
            this.topCpu = new SortedFixedArray(
                function(a, b) {
                    a.usecavg = Math.round((a.usec / a.calls) * 1000) / 1000;
                    b.usecavg = Math.round((b.usec / b.calls) * 1000) / 1000;
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

    this.getTopMemory = function()
    {
        if(!this.topMemory) {
            this.topMemory = new SortedFixedArray(
                function(a, b) {
                    a.bytesavg = Math.round((a.bytes / a.calls) * 100) / 100;
                    b.bytesavg = Math.round((b.bytes / b.calls) * 100) / 100;
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

    this.clear = function()
    {
        if(this.console) this.console.text("");
    };

    this.show = function(datas, func)
    {
        if(!this.console) {
            this.console = this.c("div").addClass("console");
            this.window.append(this.console);
            var aCollapse = this.c("a")
                .text("^")
                .attr("href", "#")
                .appendTo(this.nav)
                .bind(
                    'click',
                    function(e) {
                        self.console.remove();
                        self.console = null;
                        aCollapse.remove();
                    }
                );
        }
        this.console.append(func(datas));
    };

    // Init
    this.window = this
        .c("div")
        .attr("id", "forp");

    document.body.appendChild(this.window.element);

    this.nav = this
        .c("nav")
        .appendTo(this.window);

    var iSearch = this.c("input")
        , aFull = this.c("a")
        , aTopCpu = this.c("a")
        , aTopMemory = this.c("a")
        , aTopCalls = this.c("a");

    this.nav.append(new o(document.createTextNode(
        Math.round((this.stack[0].usec / 1000) * 100) / 100 + 'ms ')
    ));
    this.nav.append(new o(document.createTextNode(
        Math.round((this.stack[0].bytes / 1024) * 100) / 100 + 'kb')
    ));

    aFull
        .text("Full stack")
        .attr("href", "#")
        .appendTo(this.nav)
        .bind(
            'click',
            function() {
                self.clear();
                self.show(
                    self.stack
                    , function(datas) {
                        var d = self.c("div")
                                    .addClass("tree");

                        for(var i in datas) {
                            var id = '';
                            for (var j = 0; j < datas[i].level; ++j) {
                                if (j == datas[i].level - 1) id += "&nbsp;&nbsp;|----&nbsp;&nbsp;";
                                else id += "&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;";
                            }
                            id += (datas[i].class) ? datas[i].class + '::' : '';
                            id += datas[i].function;
                            self.c("div", d, id);
                        }
                        return d;
                    }
                );
            }
        );

    aTopCalls
        .text("Calls")
        .attr("href", "#")
        .appendTo(this.nav)
        .bind(
            'click',
            function() {
                self.clear();
                self.show(
                    self.getTopCalls()
                    , function(datas) {
                        var t = self.c("table")
                            ,tr = self.c("tr", t);
                        self.c("th", tr, "function");
                        self.c("th", tr, "calls");
                        self.c("th", tr, "duration<br>(ms)");
                        self.c("th", tr, "memory<br>(kb)");
                        self.c("th", tr, "file");
                        for(var i in datas) {
                            tr = self.c("tr", t);
                            self.c("td", tr, datas[i].id);
                            self.c("td", tr, datas[i].calls, "numeric");
                            self.c("td", tr, datas[i].usec, "numeric");
                            self.c("td", tr, datas[i].bytes + '', "numeric");
                            self.c("td", tr, datas[i].filelineno);
                        }
                        return t;
                    }
                );
            }
        );

    aTopCpu
        .text("CPU")
        .attr("href", "#")
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
                        self.c("th", tr, "avg&nbsp;duration<br>(ms)");
                        self.c("th", tr, "calls");
                        self.c("th", tr, "duration<br>(ms)");
                        self.c("th", tr, "file");
                        for(var i in datas) {
                            tr = self.c("tr", t);
                            self.c("td", tr, datas[i].id);
                            self.c("td", tr, datas[i].usecavg, "numeric");
                            self.c("td", tr, datas[i].calls, "numeric");
                            self.c("td", tr, datas[i].usec, "numeric");
                            self.c("td", tr, datas[i].filelineno);
                        }
                        return t;
                    }
                );
            }
        );

    aTopMemory
        .text("Memory")
        .attr("href", "#")
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
                        self.c("th", tr, "avg&nbsp;memory<br>(kb)");
                        self.c("th", tr, "calls");
                        self.c("th", tr, "memory<br>(kb)");
                        self.c("th", tr, "file");
                        for(var i in datas) {
                            tr = self.c("tr", t);
                            self.c("td", tr, datas[i].id);
                            self.c("td", tr, datas[i].bytesavg, "numeric");
                            self.c("td", tr, datas[i].calls, "numeric");
                            self.c("td", tr, datas[i].bytes, "numeric");
                            self.c("td", tr, datas[i].filelineno);
                        }
                        return t;
                    }
                );
            }
        );


    iSearch
        .attr("type", "search")
        .attr("autosave", "forp")
        .attr("results", 5)
        .attr("name", "forpSearch")
        .attr("placeholder", "Search forp")
        .appendTo(this.nav)
        .bind(
            'keyup',
            function() {
                self.clear();
                self.show(
                    self.find(this.value)
                    , function(datas) {
                        var t = self.c("table")
                            ,tr = self.c("tr", t);
                        self.c("th", tr, "function");
                        self.c("th", tr, "calls");
                        self.c("th", tr, "duration<br>(ms)");
                        self.c("th", tr, "memory<br>(kb)");
                        self.c("th", tr, "file");
                        for(var i in datas) {
                            tr = self.c("tr", t);
                            self.c("td", tr, datas[i].id);
                            self.c("td", tr, datas[i].calls, "numeric");
                            self.c("td", tr, datas[i].usec, "numeric");
                            self.c("td", tr, datas[i].bytes + '', "numeric");
                            self.c("td", tr, datas[i].filelineno);
                        }
                        return t;
                    }
                );
            }
        );
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
    function(){new forp(forp.stack)}
);