(function(forp, $){
    /**
     * Sidebar Class
     * @param DOMElementWrapper parent
     */
    forp.Sidebar = function(parent)
    {
        forp.Panel.call(this, "sidebar");
        this.parent = parent;

        this.open = function() {
            this.$.addClass("w1of3");
            return this;
        }

        this.close = function() {
            this.$.empty().removeClass("w1of3");
            return this;
        }
    };
})(forp, jMicro);