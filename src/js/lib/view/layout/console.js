(function(forp, $){
    /**
     * Console Class
     * @param DOMElementWrapper parent
     */
    forp.Console = function(parent)
    {
        var self = this;
        forp.Panel.call(this, "console");

        this.sidebar = null;
        this.parent = parent;

        this.open = function() {
            this.closeSidebar();
            this.parent.open();

            return this;
        };

        this.show = function($content) {
            return this.open().$
                    .empty()
                    .append($content);
        };

        this.hasSidebar = function() {
            return (this.sidebar != null);
        };


        this.showInSidebar = function($content) {
            return this.openSidebar().$
                    .empty()
                    .append($content);
        };

        this.getSidebar = function() {
            if(!this.sidebar) {
                this.sidebar = new forp.Sidebar(this.parent);
                this.parent
                    .append(this.sidebar)
                    .layout
                    .size();
            }
            return this.sidebar;
        };

        this.openSidebar = function() {
            this.$.addClass("w2of3");
            return this.getSidebar().open();
        };

        this.closeSidebar = function() {
            this.$.removeClass("w2of3");
            if(this.sidebar) {
                this.sidebar.close();
            }
            return this;
        };
    };
})(forp, jMicro);