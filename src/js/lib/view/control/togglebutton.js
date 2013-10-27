(function(forp, $){
    /**
     * ToggleButton Class
     * @param string label
     * @param function on On callback
     * @param mixed off Off callback function or false if off disabled
     * @param boolean triggerOn Fire click event if true
     */
    forp.ToggleButton = function(label, on, off, triggerOn)
    {
        var self = this,
            $container = $("<div>");
        forp.Decorator.call(this, $container);

        this.$
            .text(typeof label == 'function' ? label() : label)
            .class("toggleOff")
            .bind(
                'click',
                function(e) {
                    if($(this).attr("data-state") == "on") {
                        off && (off(e) !== false)
                            && $(this)
                                   .class("toggleOff")
                                   .attr("data-state", "off");
                    } else {
                        $(this)
                            .parent()
                            .find("div.toggleOn")
                            .each(
                                function() {
                                    $(this).class("toggleOff").attr("data-state", "off")
                                }
                            );

                        //self.parent && self.parent.clear && self.parent.clear();
                        on && (on(e) !== false)
                            && $(this).class("toggleOn").attr("data-state", "on");
                    }
                }
            );

        triggerOn
            && triggerOn()
            && this.$.trigger("click");
    };
})(forp, jMicro);