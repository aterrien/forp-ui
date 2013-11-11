(function(forp, $) {

    forp.plugins.duration = {
        'nav': {
            'label': "top @PHP-VAR-topCpu@ duration",
            'display': true,
            'enabled': false,
            'open': function(e) {
                var controller = forp.getController(),
                    datas = controller.getStack().getTopCpu(),
                    $table = $.table(["function", "self cost ms", "total cost ms", "calls"]);

                controller.getConsole().empty();

                (controller.getStack().leaves.length > 100)
                    && controller
                            .getCpuHistogram()
                            .appendTo(controller.getConsole());

                for(var i in datas) {
                    var id = controller.getStack().getEntryId(datas[i]);
                    $table
                        .line([
                            $('<span>').class('strong').text(datas[i].id).append(
                                $('<span>').text("(" + datas[i].filelineno + ")")
                            ).append(
                                datas[i].caption ?
                                    $("<div>").text(datas[i].caption) : null
                            ),
                            $.roundDiv(datas[i].usec, 1000).toFixed(3) + '',
                            $.roundDiv(controller.getStack().getFunctions()[id].getDuration(), 1000).toFixed(3) + '',
                            controller.getStack().getFunctions()[id].calls
                        ])
                        .attr('data-ref', datas[i].i)
                        .bind(
                            'click',
                            function() {
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
                        ).bind(
                            'mouseover',
                            function(){
                                controller
                                    .getCpuHistogram()
                                    .highlight(
                                        controller
                                            .getStack()
                                            .stack[$(this).attr('data-ref')].leaf);
                            }
                        ).bind(
                            'mouseout',
                            function(){
                                controller.getCpuHistogram()
                                    .restore();
                            }
                        );
                }

                $table.appendTo(controller.getConsole().$);
            },
            'close': function() {
                forp.getController().getLayout().reduce();
            }
        }
    };

})(forp, jMicro);