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
                return true;
            } else if (this.element.attachEvent) {
                var r = this.element.attachEvent("on"+evType, fn);
                return r;
            } else {
                return false;
            }
        }
    };

    this.f = function(mixed)
    {
        if(typeof(mixed) == 'object') {
            return new o(mixed);
        } else {
            return new o(document.getElementById(id));
        }
    };

    this.c = function(tag, appendTo, inner)
    {
        var e = document.createElement(tag);
        if(inner) e.innerHTML = inner;
        if(appendTo) appendTo.appendChild(e);
        return e;
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
                var r = new RegExp(query);
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
        if(this.console) this.console.innerHTML = "";
    };

    this.show = function(datas, func)
    {
        if(!this.console) {
            this.console = document.createElement("div");
            var classAttr = document.createAttribute("class");
            classAttr.nodeValue = "console";
            this.console.setAttributeNode(classAttr);
            this.window.appendChild(this.console);
        }
        this.console.appendChild(func(datas));
    };

    // Init
    this.window = document.createElement("div");
    this.window.id = "forp";
    document.body.appendChild(this.window);

    var nav = document.createElement("nav")
        ,iSearch = document.createElement("input")
        , aFull = document.createElement("a")
        , aTopCpu = document.createElement("a")
        , aTopMemory = document.createElement("a")
        , aTopCalls = document.createElement("a")
        ;

    this.window.appendChild(nav);

    //nav.appendChild(document.createTextNode("forp"));

    aFull.innerHTML = "full";
    nav.appendChild(aFull);

    aTopCpu.innerHTML = "CPU";
    aTopCpu.href = "#";
    nav.appendChild(aTopCpu);

    aTopMemory.innerHTML = "memory";
    aTopMemory.href = "#";
    nav.appendChild(aTopMemory);

    aTopCalls.innerHTML = "calls";
    nav.appendChild(aTopCalls);

    iSearch.type = "search";
    iSearch.autosave = "forp";
    var results = document.createAttribute("results");
    results.nodeValue = 5;
    iSearch.setAttributeNode(results);
    iSearch.name = "s";
    iSearch.placeholder = "Search forp";
    nav.appendChild(iSearch);

    this.f(aFull)
        .bind(
            'click',
            function() {
                self.clear();
                self.show(
                    self.stack
                    , function(datas) {
                        var t = self.c("table")
                            ,tr = self.c("tr", t);

                        //self.c("th", tr, "function");
                        //self.c("th", tr, "calls");
                        //self.c("th", tr, "duration&nbsp;(ms)");
                        //self.c("th", tr, "memory&nbsp;(kb)");
                        //self.c("th", tr, "file");
                        for(var i in datas) {
                            tr = self.c("div", t);
                            var id = '';
                            for (var j = 0; j < datas[i].level; ++j) {
                                if (j == datas[i].level - 1) id += "&nbsp;&nbsp;|----&nbsp;&nbsp;";
                                else id += "&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;";
                            }
                            id += (datas[i].class) ? datas[i].class + '::' : '';
                            id += datas[i].function;
                            self.c("td", tr, id);
                            //self.c("td", tr, datas[i].calls);
                            //self.c("td", tr, datas[i].usec);
                            //self.c("td", tr, datas[i].bytes + '');
                            //self.c("td", tr, datas[i].file);
                        }
                        return t;
                    }
                );
            }
        );
    this.f(aTopCalls)
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
                        self.c("th", tr, "duration&nbsp;(ms)");
                        self.c("th", tr, "memory&nbsp;(kb)");
                        self.c("th", tr, "file");
                        for(var i in datas) {
                            tr = self.c("tr", t);
                            self.c("td", tr, datas[i].id);
                            self.c("td", tr, datas[i].calls);
                            self.c("td", tr, datas[i].usec);
                            self.c("td", tr, datas[i].bytes + '');
                            self.c("td", tr, datas[i].filelineno);
                        }
                        return t;
                    }
                );
            }
        );
    this.f(aTopCpu)
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
                        self.c("th", tr, "avg&nbsp;duration&nbsp;(ms)");
                        self.c("th", tr, "calls");
                        self.c("th", tr, "duration&nbsp;(ms)");
                        self.c("th", tr, "file");
                        for(var i in datas) {
                            tr = self.c("tr", t);
                            self.c("td", tr, datas[i].id);
                            self.c("td", tr, datas[i].usecavg);
                            self.c("td", tr, datas[i].calls);
                            self.c("td", tr, datas[i].usec);
                            self.c("td", tr, datas[i].filelineno);
                        }
                        return t;
                    }
                );
            }
        );
    this.f(aTopMemory)
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
                        self.c("th", tr, "avg&nbsp;memory&nbsp;(kb)");
                        self.c("th", tr, "calls");
                        self.c("th", tr, "memory&nbsp;(kb)");
                        self.c("th", tr, "file");
                        for(var i in datas) {
                            tr = self.c("tr", t);
                            self.c("td", tr, datas[i].id);
                            self.c("td", tr, datas[i].bytesavg);
                            self.c("td", tr, datas[i].calls);
                            self.c("td", tr, datas[i].bytes);
                            self.c("td", tr, datas[i].filelineno);
                        }
                        return t;
                    }
                );
            }
        );
    this.f(iSearch)
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
                        self.c("th", tr, "duration (ms)");
                        self.c("th", tr, "memory (kb)");
                        self.c("th", tr, "file");
                        for(var i in datas) {
                            tr = self.c("tr", t);
                            self.c("td", tr, datas[i].id);
                            self.c("td", tr, datas[i].calls);
                            self.c("td", tr, datas[i].usec);
                            self.c("td", tr, datas[i].bytes + '');
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