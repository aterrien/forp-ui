(function(forp, $) {

    forp.plugins.calls = {
        'nav': {
            'label': "top @PHP-VAR-topCalls@ calls",
            'display': true,
            'enabled': false,
            'open': function(e) {
                var controller = forp.getController(),
                    datas = controller.getStack().getTopCalls(),
                    $table = $.table(["function", "calls", "ms", "Kb"]);

                for(var i in datas) {
                    $table.line([
                            datas[i].id,
                            datas[i].calls,
                            $.roundDiv(datas[i].getDuration(), 1000).toFixed(3) + '',
                            $.roundDiv(datas[i].getMemory(), 1024).toFixed(3) + ''
                        ])
                        .attr("data-ref", datas[i].id)
                        .bind(
                            "click",
                            forp.getController().toggleDetails
                        );
                }
                
                controller.getConsole().show($table);
            },
            'close': function() {
                forp.getController().getLayout().reduce();
            }
        }
    };

})(forp, jMicro);