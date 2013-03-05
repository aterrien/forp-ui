(function(f) {

    "use strict";

    /**
     * Layout
     *
     * - Layout #forp
     *  - Navbar nav
     *  - MainPanel .mainpanel
     *   - Console .console
     *   - Sidebar .sidebar
     */
    f.Layout = function(viewMode)
    {
        var self = this;
        f.DOMElementWrapper.call(this);
        this.element = document.createElement("div");
        this.attr("id", "forp");

        this.mainpanel = null;
        this.nav = null;
        this.viewMode = viewMode; // fixed, embedded

        this.conf = {
            fixed : {
                size : function() {
                    self.attr("style", "");

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
            , embedded : {
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
                .class(this.viewMode + "Compact");
            this.nav = null;
            this.mainpanel = null;

            callback();

            return this;
        };
    };
    /**
     * Nav
     */
    f.Nav = function()
    {
        var self = this;
        f.DOMElementWrapper.call(this);
        this.element = document.createElement("nav");
    };
    /**
     * Panel
     * @param string id Panel ID
     */
    f.Panel = function(id)
    {
        var self = this;
        f.DOMElementWrapper.call(this);
        this.element = document.createElement("div");
        this.class(id + " panel");

        this.id = id;
    };
    /**
     * MainPanel
     * @param Layout layout
     */
    f.MainPanel = function(layout)
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
    };
    f.ToggleBar = function()
    {
        var self = this;
        f.DOMElementWrapper.call(this);
        this.element = document.createElement("div");
        this.class("toggleBar");

        this.clear = function() {
            this.find("div.toggleOn")
                .each(
                    function(o) {
                        o.class("toggleOff");
                        o.attr("data-state", "off")
                    }
                );
            return this;
        };
    };
    /**
     * ToggleButton Class
     * @param string label
     * @param function on On callback
     * @param mixed off Off callback function or false if off disabled
     * @param boolean triggerOn Fire click event if true
     */
    f.ToggleButton = function(label, on, off, triggerOn)
    {
        var self = this, click = null;
        f.DOMElementWrapper.call(this);
        this.element = document.createElement("div");

        this.text(label)
            .class("toggleOff")
            .bind(
                'click',
                click = function(e) {
                    if(self.getAttr("data-state") == "on") {
                        off && (off(e) !== false)
                            && self.class("toggleOff").attr("data-state", "off");
                    } else {
                        self.parent && self.parent.clear && self.parent.clear();
                        on && (on(e) !== false)
                            && self.class("toggleOn").attr("data-state", "on");
                    }
                }
            );

        triggerOn && this.trigger("click");
    };
    /**
     * Sidebar Class
     * @param DOMElementWrapper parent
     */
    f.Sidebar = function(parent)
    {
        var self = this;
        f.Panel.call(this, "sidebar");
        this.addClass("w1of3");
        this.parent = parent;
    };
    /**
     * Console Class
     * @param DOMElementWrapper parent
     */
    f.Console = function(parent)
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
    };
    /**
     * @param Object headers
     */
    f.Table = function(headers)
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
    };
    /**
     * @param Object cols
     */
    f.Line = function(cols)
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
    };
    /**
     * Stack Tree Class
     * @param Object stack Call stack array
     */
    f.Tree = function(stack)
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
    };
    /**
     * Backtrace Class
     * @param integer i Index
     * @param Object stack Callc stack array
     */
    f.Backtrace = function(i, stack)
    {
        f.DOMElementWrapper.call(this);
        this.element = document.createElement("div");
        this.class("backtrace");

        this.prependItem = function(entry, highlight) {
            return this.prepend(
                f.create("div")
                    .class("backtrace-item " + (highlight ? " highlight" : ""))
                    .text(
                        "<span class='strong'>" + entry.id + "</span><br>" +
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
                this.prepend(f.create("div").class("arrow").text("&#x25BC;"));
            }
        }
    };
    /**
     * LineEventListenerBacktrace Class
     * @param i Stack index
     * @param context
     */
    f.LineEventListenerBacktrace = function(i, context)
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
    };
    /**
     * LineEventListenerInspect Class
     * @param i Stack index
     * @param context
     */
    f.LineEventListenerInspect = function(v, context)
    {
        this.target = null;
        this.init = function()
        {
            this.target.attr("data-ref", "");
            this.target.bind(
                'click',
                function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    var line = f.wrap(this),
                        ul = f.create("ul").class("inspect");

                    var list = function(v, ul) {
                        for(var entry in v) {
                            var el = f.create("li");
                            if(typeof(v[entry]) == 'object') {
                                ul.append(
                                    el.text(entry + ":")
                                );
                                var sul = f.create("ul").appendTo(el);
                                list(v[entry], sul);
                            } else {
                                ul.append(
                                    el.text(entry + ": " + f.Utils.htmlEntities(v[entry]))
                                );
                            }
                        }
                    };

                    list(v, ul);

                    context.getConsole()
                        .getSidebar()
                        .empty()
                        .append(
                            ul
                        );
                }
            );
        }
    };
    /**
     * Gauge Class
     * @param integer value
     * @param integer max
     * @param integer divider
     * @param string unit
     */
    f.Gauge = function(value, max, divider, unit)
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
    };
    /**
     * TagRandColor Class
     * Provides predefined colors
     */
    f.TagRandColor = {
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
                        'background: ' + this.provideFor(name)
                    )
                    .text(name)
                    .bind(
                        "click",
                        function(){
                            //alert('to groups view');
                        }
                    );
        }
    };
})(forp);