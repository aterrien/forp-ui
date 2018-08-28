(function(forp, $) {

    forp.plugins.files = {
        'nav': {
            'label': 'files',
            'display': function() {
                return forp.getController().getStack().includesCount > 0;
            },
            'enabled': false,
            'open': function(e) {
                var controller = forp.getController(),
                    datas = controller
                                .getStack()
                                .getIncludes();

                var $table = $.table(
                    ["file", "calls from"], ["file", "calls from"]
                );
                for(var i in datas) {
                    $table.line([
                        i,
                        $.Gauge(
                            datas[i].calls,
                            controller.getStack().stack.length
                        )
                    ]);
                }
                
                controller.getConsole().show($table);
            },
            'close': function() {
                forp.getController().getLayout().reduce();
            }
        }
    };

})(forp, jMicro);