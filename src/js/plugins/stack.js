(function(forp, $) {

    forp.plugins.stack = {
        'nav': {
            'label': function() {
                return "stack (" + forp.getController().getStack().stack.length + ")";
            },
            'display': true,
            'enabled': false,
            'open': function(e) {

                var controller = forp.getController();

                if(!controller.tree)
                    controller.tree = $.tree(controller.getStack().stack);

                controller
                    .getConsole()
                    .show(
                        $("<div>")
                            .attr("style", "margin-top: 10px;")
                            .append(
                                (new forp.ToggleButton(
                                    "collapse"
                                    ,function(e) {
                                        $("li.expanded")
                                            .each(
                                            function(e){
                                                e.attr("class", "collapsed");
                                            }
                                        );
                                    }
                                    ,function(e) {
                                        $("li.collapsed[data-tree]")
                                            .each(
                                            function(e){
                                                e.attr("class", "expanded");
                                            }
                                        );
                                        return true;
                                    }
                                )).$.attr("style", "position: absolute; margin: 5px; right: 20px")
                            )
                            .append(
                                $("<div>").append(controller.tree)
                            )
                        );
            },
            'close': function() {
                forp.getController().getLayout().reduce();
            }
        }
    };

})(forp, jMicro);