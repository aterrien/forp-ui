(function(forp, $) {

    "use strict";

    /**
     * forp stack manager
     * @param array forp stack
     */
    forp.Controller = function(conf)
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

        forp.getController = function() {
            return self;
        };

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
            this.stack = new forp.Stack(stack);
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

                this.groupsBarChart = (new forp.BarChart(
                    {
                        xaxis : {min: 0, max: self.getStack().getMainEntry().usec},
                        yaxis : {length: 50, min: 0, max: 1},
                        val: function(i) {
                            return this.datas[i].value;
                        },
                        color: function(i) {
                            return forp.TagRandColor.provideFor(this.datas[i].label);
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
                this.cpuHistogram = (new forp.Histogram(
                    {
                        xaxis : {min: 0},
                        yaxis : {length: 50, min: 0, max: self.getStack().getTopCpu()[0].usec},
                        val: function(i) {
                            return this.datas[i].usec;
                        },
                        mousemove: function(e) {
                            var x = Math.floor((e.offsetX * this.$.width()) / this.$.width()),
                                y = this.conf.yaxis.length
                                    - ((e.offsetY * this.$.height()) / this.$.height());

                            for(var i = x - 10; i < x + 10; i++) {
                                if(!this.datas[i]) continue;

                                var entry = this.datas[i],
                                    amp = (entry.usec * 100) / this.conf.yaxis.max;
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
                this.memoryHistogram = (new forp.Histogram(
                    {
                        width : this.getConsole().$.width(),
                        xaxis : {min: 0},
                        yaxis : {length: 50, min: 0, max: self.getStack().getTopMemory()[0].bytes},
                        val: function(i) {
                            return this.datas[i].bytes;
                        },
                        mousemove: function(e) {
                            var x = Math.floor((e.offsetX * this.$.width()) / this.$.width()),
                                y = this.conf.yaxis.length
                                    - ((e.offsetY * this.$.height()) / this.$.height());

                            for(var i = x - 10; i < x + 10; i++) {
                                if(!this.datas[i]) continue;

                                var entry = this.datas[i],
                                    amp = (entry.bytes * 100) / this.conf.yaxis.max;
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
                this.layout = new forp.Layout($('<div>'), this.viewMode);
                this.parent.insertBefore(
                    this.layout.element,
                    this.parent.firstChild
                );
            }
            return this.layout;
        };

        /**
         * @return Grader
         */
        this.getGrader = function()
        {
            if(!this.grader) this.grader = new forp.Grader();
            return this.grader;
        };

        /**
         * Run layout manager
         * @return forp.Controller
         */
        this.run = function()
        {
            //try
            //{
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
                /*var styleTarget = (document.getElementsByTagName('head')[0]
                                || document.getElementsByTagName('body')[0]);

                if(!styleTarget) {
                    throw {
                        name: "RuntimeError",
                        message: "Can't find head or body."
                    }
                }*/

                $('head').append($('<style>').text('%forp.css%'));

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
            /*} catch(e)
            {
                // EvalError, RangeError, ReferenceError, SyntaxError,
                // TypeError, URIError and custom exception
                console.error("forp-ui > " + e.name + ": " + e.message);
            }*/
        };

        /**
         * onCompact callback
         */
        this.onCompact = function() {
            if(self.getStack().stack.length > 0) {

                var ms = $.roundDiv(self.getStack().getMainEntry().usec, 1000),
                    kb = $.roundDiv(self.getStack().getMainEntry().bytes, 1024),
                    grader = new forp.Grader();

                self.getLayout().$
                    .addClass(grader.getClass(grader.getGrade('time', ms)))
                    .bind(
                        "click",
                        self.openEventListener = function() {
                            self.getLayout().setViewMode('fixed');
                            self.open();
                        }
                    );

                $("<div>")
                    .class("summary")
                    .append(
                        $("<div>")
                            .attr("style", "margin-right: 10px")
                            .text(ms + ' ms ')
                    )
                    .append(
                        $("<div>")
                            .attr("style", "margin-right: 10px")
                            .text(kb + ' Kb')
                    )
                    .appendTo(self.getLayout().getNav().$);

            } else {
                $("<div>")
                    .text("Give me something to eat !")
                    .appendTo(self.getLayout().getNav());
            }
        };

        /**
         * Run on DOM ready
         */
        this.runOnReady = function()
        {
            $(document).ready(
                function() {
                    self.run();
                }
            );
        },

        /**
         * Show details table in a new line
         */
        this.toggleDetails = function()
        {
            var self = forp.getController(),
                target = $(this);

            if(target.attr("data-details") == 1) {
                target.next().remove();
                target.attr("data-details", 0);
                return;
            }

            target.attr("data-details", 1);

            var id = target.attr("data-ref"),
                line = $("<tr>"),
                td = $("<td>")
                        .attr("colspan", 4)
                        .appendTo(line),
                table = $.table(["called from", " ms", "Kb"]).appendTo(td),
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
                            $("<tr>")
                                .append(
                                    $("<td>")
                                        .attr("colspan", 3)
                                        .css("text-align", "center")
                                        .text(lastId + " : " +
                                            "too many items to display (>" +
                                            loopMaxIter + ")")
                                )
                        );
                        break calledFrom;
                    }


                    table
                        .line([
                            self.getStack().getFunctions()[id].entries[i].refs[j].filelineno +
                            (self.getStack().getFunctions()[id].entries[i].refs[j].caption ? "<br>" + self.getStack().getFunctions()[id].entries[i].refs[j].caption : ""),
                            $.Gauge(
                                self.getStack().getFunctions()[id].entries[i].refs[j].usec,
                                self.getStack().getFunctions()[id].getDuration(),
                                1000,
                                'ms'
                            ),
                            $.Gauge(
                                self.getStack().getFunctions()[id].entries[i].refs[j].bytes,
                                self.getStack().getFunctions()[id].getMemory(),
                                1024,
                                'Kb'
                            )
                        ])
                        .attr('data-ref', self.getStack().getFunctions()[id].entries[i].refs[j].i)
                        .bind(
                            'click',
                            function(e) {
                                forp.getController()
                                    .getConsole()
                                    .showInSidebar(
                                        (new forp.Backtrace(
                                            $(this).attr("data-ref"),
                                            forp.getController().getStack().stack
                                        )).$
                                    )
                                    .scrollBottom();
                            }
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
            $("<div>")
                .class("inset")
                .appendTo(this.getLayout().$);

            var $nav = $('<div>')
                            .class("toggleBar")
                            .appendTo(this.getLayout().getNav().$);

            // Plugins
            for(var plugin in forp.plugins) {

                // Nav integration
                if(
                    forp.plugins[plugin]['nav']
                    && (
                        (typeof forp.plugins[plugin]['nav']['display'] == 'function'
                        && forp.plugins[plugin]['nav']['display']())
                        || forp.plugins[plugin]['nav']['display'] === true
                    )
                ) {
                    $nav.append(
                        new forp.ToggleButton(
                            forp.plugins[plugin]['nav']['label'],
                            forp.plugins[plugin]['nav']['open'],
                            forp.plugins[plugin]['nav']['close'],
                            forp.plugins[plugin]['nav']['enabled']
                            ).$
                    );
                }

                // @TODO Compact integration
            }

            $nav.append(
                $("<input>")
                    .attr("type", "text")
                    .attr("name", "forpSearch")
                    .attr("placeholder", "Search ...")
                    .bind(
                        "click",
                        function(e) {
                            $(this)
                                .parent()
                                .find("div.toggleOn")
                                .each(
                                    function() {
                                        $(this).class("toggleOff").attr("data-state", "off")
                                    }
                                );
                        }
                    )
                    .bind(
                        "keyup",
                        function(e) {
                            var controller = forp.getController(),
                                $table = $.table(["function", "calls", "ms", "Kb"]),
                                datas = controller.getStack().search(
                                    $(this).val().replace(/\\/g,"\\\\")
                                );

                            for(var i in datas) {
                                $table
                                    .line([
                                        datas[i].id,
                                        datas[i].calls,
                                        $.roundDiv(datas[i].getDuration(), 1000).toFixed(3) + '',
                                        $.roundDiv(datas[i].getMemory(), 1024).toFixed(3) + ''
                                    ])
                                    .attr("data-ref", datas[i].id)
                                    .bind("click", controller.toggleDetails);
                            }

                            controller
                                .getConsole()
                                .show($table);
                        }
                    )
            );

            (this.viewMode == "fixed") &&
            $nav.append(
                $("<div>")
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
})(forp, jMicro);