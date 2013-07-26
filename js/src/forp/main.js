(function(f) {

    "use strict";

    /**
     * Extends DOMElementWrapperCollection
     * @param array conf Config Object
     */
    f.DOMElementWrapperCollection.prototype.forp = function(conf) {
        this.each(
            function(el){
                conf.parent = el.element;
                (new f.Controller(conf))
                      .setStack(conf.stack)
                      .run();
            }
        );
        return this;
    };

    /**
     * forp stack manager
     * @param array forp stack
     */
    f.Controller = function(conf)
    {
        var self = this;

        var conf = conf || {};
        this.layout = null;
        this.console = null;
        this.grader = null;
        this.tree = null;
        this.stack = null;
        this.openEventListener = null;
        this.viewMode = conf.parent ? conf.mode || "embedded" : "fixed";
        this.parent = conf.parent;
        this.cpuHistogram = null;
        this.memoryHistogram = null;
        this.groupsBarChart = null;

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
         * @return BarChart
         */
        this.getGroupsBarChart = function()
        {
            if(!this.groupsBarChart) {
                var groups = self.getStack().groups, datas = [];
                for(var group in self.getStack().groups) {
                    datas.push(
                        {
                            label: group,
                            value: groups[group].usec
                        }
                    );
                }

                this.groupsBarChart = (new f.BarChart(
                    {
                        xaxis : {min: 0, max: self.getStack().getMainEntry().usec},
                        yaxis : {length: 50, min: 0, max: 1},
                        val: function(i) {
                            return this.datas[i].value;
                        },
                        color: function(i) {
                            return f.TagRandColor.provideFor(this.datas[i].label);
                        }
                    }
                ))
                .setDatas(datas)
                .draw();
            }
            return this.groupsBarChart;
        }

        /**
         * @return Histogram
         */
        this.getCpuHistogram = function()
        {
            if(!this.cpuHistogram) {
                this.cpuHistogram = (new f.Histogram(
                    {
                        xaxis : {min: 0},
                        yaxis : {length: 50, min: 0, max: self.getStack().getTopCpu()[0].usec},
                        val: function(i) {
                            return this.datas[i].usec;
                        },
                        mousemove: function(e) {
                            var x = Math.floor((e.offsetX * this.element.width) / this.width()),
                                y = this.conf.yaxis.length - ((e.offsetY * this.element.height) / this.height());

                            for(var i = x - 10; i < x + 10; i++) {
                                var entry = this.datas[i];
                                var amp = (entry.usec * 100) / this.conf.yaxis.max;

                                if(y <= amp) {
                                    this.highlight(i);
                                    return;
                                }
                            }

                            this.restore();
                        }
                    }
                ))
                .setDatas(self.getStack().leaves)
                .draw();
            }
            return this.cpuHistogram;
        }

        /**
         * @return Histogram
         */
        this.getMemoryHistogram = function()
        {
            if(!this.memoryHistogram) {
                this.memoryHistogram = (new f.Histogram(
                    {
                        xaxis : {min: 0},
                        yaxis : {length: 50, min: 0, max: self.getStack().getTopMemory()[0].bytes},
                        val: function(i) {
                            return this.datas[i].bytes;
                        },
                        mousemove: function(e) {
                            var x = Math.floor((e.offsetX * this.element.width) / this.width()),
                                y = this.conf.yaxis.length - ((e.offsetY * this.element.height) / this.height());

                            for(var i = x - 10; i < x + 10; i++) {
                                var entry = this.datas[i];
                                var amp = (entry.bytes * 100) / this.conf.yaxis.max;

                                if(y <= amp) {
                                    this.highlight(i);
                                    return;
                                }
                            }

                            this.restore();
                        }
                    }
                ))
                .setDatas(self.getStack().leaves)
                .draw();
            }
            return this.memoryHistogram;
        }

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
            if(!this.layout) {
                this.layout = new f.Layout(this.viewMode);
                this.parent.insertBefore(this.layout.element, this.parent.firstChild);
            }
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

                if(self.getStack().stack.length > @PHP-VAR-maxStack@) {
                    throw new RangeError("More than @PHP-VAR-maxStack@ entries in the stack (" + self.getStack().stack.length + ").");
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

                // retrieve parent
                this.parent = this.parent || document.body;

                // proceeds and aggregates stack datas
                self.getStack()
                    .aggregate();

                if(this.viewMode == "fixed") {
                    // compacted view mode
                    this.getLayout()
                        .compact(this.onCompact);
                } else if(this.viewMode == "embedded") {
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
         * onCompact callback
         */
        this.onCompact = function() {
            if(self.getStack().stack.length > 0) {

                var ms = f.roundDiv(self.getStack().getMainEntry().usec, 1000),
                    kb = f.roundDiv(self.getStack().getMainEntry().bytes, 1024),
                    grader = new f.Grader();

                self.layout
                    .addClass(
                        grader.getClass(grader.getGrade('time', ms))
                    )
                    .bind(
                        "click",
                        self.openEventListener = function() {
                            self.getLayout().setViewMode('fixed');
                            self.open();
                        }
                    );

                f.create("div")
                 .class("summary")
                 .append(
                    f.create("div")
                     .attr("style", "margin-right: 10px")
                     .text(ms + ' ms ')
                 )
                 .append(
                    f.create("div")
                     .attr("style", "margin-right: 10px")
                     .text(kb + ' Kb')
                 )
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
         * Show details table in a new line
         */
        this.toggleDetails = function()
        {
            var target = this;

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
                .class("inset")
                .appendTo(this.layout);

            var toggleBar = (new f.ToggleBar());
            toggleBar.appendTo(this.getLayout().getNav());

            if(self.getStack().inspect)
            toggleBar.append(
                new f.ToggleButton(
                    "inspector",
                    function(e) {

                        var table = self.getConsole()
                                        .empty()
                                        .open()
                                        .table(["var", "type",
                                            //"info"
                                        ]),
                            ivars = self.getStack().inspect;


                        for(ivar in ivars) {
                            var info;
                            if(
                                typeof(ivars[ivar]) === "object"
                                && ivars[ivar].properties
                            ) {
                                info = f.create('div');
                                for(var prop in ivars[ivar].properties) {
                                    info.append(f.create('span').text(prop));
                                }
                            } else {
                                info = f.Utils.htmlEntities(ivars[ivar].value);
                            }
                            table.line(
                                [
                                    ivar,
                                    ivars[ivar].type,
                                    //info
                                ]
                            ).addEventListener(
                                new f.LineEventListenerInspect(
                                    ivars[ivar],
                                    self
                                )
                            );
                        }
                    },
                    self.getLayout().reduce,
                    true
                )
            );

            toggleBar.append(
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

                        var duration = f.roundDiv(self.getStack().getMainEntry().usec, 1000),
                            memory = f.roundDiv(self.getStack().getMainEntry().bytes, 1024);

                        table.line(["<span class='strong'>Real time (ms)</span>", "Performance",
                            duration + '',
                            self.getGrader().getGradeWithTip("time", duration)
                        ]);

                        if(self.getStack().utime != null) {
                            var time = (self.getStack().utime + self.getStack().stime) / 1000;
                            table.line(["<span class='strong'>CPU time (ms)</span>", "Performance",
                                time + '',
                                self.getGrader().getGradeWithTip("time", time)
                            ]);
                        }

                        table.line(["<span class='strong'>Memory usage (Kb)</span>", "Performance",
                            memory + '',
                            self.getGrader().getGradeWithTip("memory", memory)]);
                        table.line(["<span class='strong'>Total includes</span>", "Performance",
                            self.getStack().includesCount + '',
                            self.getGrader().getGradeWithTip("includes", self.getStack().includesCount)]);
                        table.line(["<span class='strong'>Total calls</span>", "Performance",
                            self.getStack().stack.length + '',
                            self.getGrader().getGradeWithTip("calls", self.getStack().stack.length)]);
                        table.line(["<span class='strong'>Max nested level</span>", "Nesting",
                            self.getStack().maxNestedLevel + '',
                            self.getGrader().getGradeWithTip("nesting", self.getStack().maxNestedLevel)]);
                        table.line(["<span class='strong'>Avg nested level</span>", "Nesting",
                            self.getStack().avgLevel.toFixed(2) + '',
                            self.getGrader().getGradeWithTip("nesting", self.getStack().avgLevel)]);
                        },
                    self.getLayout().reduce,
                    self.getStack().inspect == null
                )
            );

            toggleBar.append(
                new f.ToggleButton(
                    "stack (" + self.getStack().stack.length + ")",
                    function(e) {

                        if(!self.tree) self.tree = new f.Tree(self.getStack().stack);
                        self.getConsole()
                            .empty()
                            .open()
                            .append(
                                f.create("div")
                                    .attr("style", "margin-top: 10px;")
                                    .append(
                                        (new f.ToggleButton(
                                            "collapse"
                                            ,function(e) {
                                                f.find("li.expanded")
                                                    .each(
                                                    function(e){
                                                        e.attr("class", "collapsed");
                                                    }
                                                );
                                            }
                                            ,function(e) {
                                                f.find("li.collapsed[data-tree]")
                                                    .each(
                                                    function(e){
                                                        e.attr("class", "expanded");
                                                    }
                                                );
                                                return true;
                                            }
                                        )).attr("style", "position: absolute; margin: 5px; right: 20px")
                                    )
                                    .append(
                                        f.create("div").append(self.tree)
                                    )
                                );
                    },
                    self.getLayout().reduce
                )
            );

            toggleBar.append(
                new f.ToggleButton(
                    "top @PHP-VAR-topCpu@ duration",
                    function(e) {
                        var datas = self.getStack().getTopCpu();

                        self.getConsole().empty().open();

                        self.getCpuHistogram()
                            .appendTo(self.getConsole());

                        var table = self.getConsole()
                                        .table(["function", "self cost ms", "total cost ms", "calls"]);

                        for(var i in datas) {
                            var id = self.getStack().getEntryId(datas[i]);
                            table.line([
                                    "<span class='strong'>" + datas[i].id + "</span> (" + datas[i].filelineno + ")"
                                    + (datas[i].caption ? "<br>" + datas[i].caption : ""),
                                    f.roundDiv(datas[i].usec, 1000).toFixed(3) + '',
                                    f.roundDiv(self.getStack().getFunctions()[id].getDuration(), 1000).toFixed(3) + '',
                                    self.getStack().getFunctions()[id].calls
                                ]).addEventListener(
                                    new f.LineEventListenerBacktrace(
                                        datas[i].i,
                                        self
                                    )
                                ).bind(
                                    'mouseover',
                                    function(){
                                        self.cpuHistogram.highlight(self.getStack().stack[this.getAttr('data-ref')].leaf);
                                    }
                                ).bind(
                                    'mouseout',
                                    function(){
                                        self.cpuHistogram.restore();
                                    }
                                );
                        }
                    },
                    self.getLayout().reduce
                )
            );

            toggleBar.append(
                new f.ToggleButton(
                    "top @PHP-VAR-topMemory@ memory",
                    function(e) {
                        var datas = self.getStack()
                                        .getTopMemory();

                        self.getConsole().empty().open();

                        self.getMemoryHistogram()
                            .appendTo(self.getConsole());

                        var table = self.getConsole()
                                        .table(["function", "self cost Kb", "total cost Kb", "calls"]);
                        for(var i in datas) {
                            var id = self.getStack().getEntryId(datas[i]);
                            table.line([
                                    "<span class='strong'>" + datas[i].id + "</span> (" + datas[i].filelineno + ")"
                                    + (datas[i].caption ? "<br>" + datas[i].caption : ""),
                                    f.roundDiv(datas[i].bytes, 1024).toFixed(3) + '',
                                    f.roundDiv(self.getStack().getFunctions()[id].getMemory(), 1024).toFixed(3) + '',
                                    self.getStack().getFunctions()[id].calls
                                ]).addEventListener(
                                    new f.LineEventListenerBacktrace(
                                        datas[i].i,
                                        self
                                    )
                                ).bind(
                                    'mouseover',
                                    function(){
                                        self.memoryHistogram.highlight(self.getStack().stack[this.getAttr('data-ref')].leaf);
                                    }
                                ).bind(
                                    'mouseout',
                                    function(){
                                        self.memoryHistogram.restore();
                                    }
                                );
                        }
                    },
                    self.getLayout().reduce
                )
            );

            toggleBar.append(
                new f.ToggleButton(
                    "top @PHP-VAR-topCalls@ calls",
                    function(e) {
                        var datas = self.getStack()
                                        .getTopCalls();

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
            toggleBar.append(
                new f.ToggleButton(
                    "files (" + self.getStack().includesCount + ")",
                    function(e) {
                        var datas = self.getStack()
                                        .getIncludes();

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
            toggleBar.append(
                new f.ToggleButton(
                    "groups (" + self.getStack().groupsCount + ")",
                    function(e) {
                        var datas = self.getStack()
                                        .getGroups();

                        self.getConsole().empty().open();

self.getGroupsBarChart()
    .appendTo(self.getConsole());

                        var table = self.getConsole()
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
                                                "<span class='strong'>" + i + "</span> " +
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

            toggleBar.append(
            f.create("input")
                .attr("type", "text")
                .attr("name", "forpSearch")
                .attr("placeholder", "Search ...")
                .bind(
                    "click",
                    function() {
                        f.find(this);
                        toggleBar.clear();
                    }
                )
                .bind(
                    "keyup",
                    function() {
                        var table = self.getConsole()
                                        .empty()
                                        .open()
                                        .table(["function", "calls", "ms", "Kb"]),
                            datas = self.getStack().search(
                                this.element.value.replace(/\\/g,"\\\\")
                            );

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

            (this.viewMode == "fixed") &&
            toggleBar.append(
                f.create("div")
                .class("close")
                .bind(
                    "click",
                    function(e) {
                        e.stopPropagation();
                        self.getLayout()
                            .compact(self.onCompact);
                    }
                )
            );

            return this;
        };
    };
})(forp);