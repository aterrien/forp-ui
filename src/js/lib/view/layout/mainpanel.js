(function(forp, $){

    /**
     * MainPanel
     * @param Layout layout
     */
    forp.MainPanel = function(layout)
    {
        var self = this;
        forp.Panel.call(this, "mainpanel");

        this.console = null;
        this.layout = layout;

        this.getConsole = function()
        {
            if(!this.console) {
                this.console = (new forp.Console(this)).appendTo(this);
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
})(forp, jMicro);