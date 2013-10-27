(function(forp, $){

    /**
     * Layout
     *
     * - Layout #forp
     *  - Navbar nav
     *  - MainPanel .mainpanel
     *   - Console .console
     *   - Sidebar .sidebar
     */
    forp.Layout = function($container, viewMode)
    {
        var self = this;
        forp.Decorator.call(this, $container);
        $container.attr("id", "forp");

        this.mainpanel = null;
        this.nav = null;
        this.viewMode = viewMode; // fixed, embedded

        this.conf = {
            fixed : {
                size : function() {
                    self.$.attr("style", "");
                    self.getConsole().$
                        .attr(
                            "style",
                            "height: " + (self.$.height()-45) + "px"
                        );

                    if( self.getConsole()
                            .hasSidebar()
                    ) {
                        self.getConsole()
                            .getSidebar().$
                            .attr(
                                "style",
                                "height: " + (self.$.height()-45) + "px"
                                );
                    }
                    if(window.onresize == null) {
                        window.onresize = function(e) {
                            self.size();
                        }
                    }
                },
                reduce : function() {
                    self.$.attr(
                        "style",
                        "height: 45px"
                    );
                }
            }
            , embedded : {
                size : function() {
                    self.$.attr(
                        "style",
                        "height: 100%"
                    );
                    self.getConsole().$
                        .attr(
                            "style",
                            "height: " + (self.$.height()-45) + "px"
                        );
                    if( self.getConsole()
                            .hasSidebar()
                    ) {
                        self.getConsole()
                            .getSidebar().$
                            .attr(
                                "style",
                                "height: " + (self.$.height()-45) + "px"
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
                this.mainpanel = (new forp.MainPanel(this)).appendTo(this);
            }
            return this.mainpanel;
        };

        this.getNav = function()
        {
            if(!this.nav) {
                this.nav = (new forp.Nav()).appendTo(this);
            }
            return this.nav;
        };

        this.getConsole = function()
        {
            return this.getMainPanel().getConsole();
        };

        this.open = function()
        {
            this.$.class("forp-" + this.viewMode);
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
            this.$
                .attr("style", "")
                .empty()
                .class("forp-" + this.viewMode + "-compact");

            this.nav = null;
            this.mainpanel = null;

            callback();

            return this;
        };
    };
})(forp, jMicro);