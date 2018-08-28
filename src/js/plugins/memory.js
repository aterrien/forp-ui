(function(forp, $) {

    forp.plugins.memory = {
        'nav': {
            'label': 'top @PHP-VAR-topMemory@ memory',
            'display': true,
            'enabled': false,
            'open': function(e) {
                var controller = forp.getController(),
                    datas = controller
                                .getStack()
                                .getTopMemory();

                controller.getConsole().empty();

                (controller.getStack().leaves.length > 100)
                    && controller
                            .getMemoryHistogram()
                            .appendTo(controller.getConsole());

                var $table = $.table(
                    ["function", "self cost Kb", "total cost Kb", "calls"], 
                    ["function", "self cost Kb", "total cost Kb", "calls"]
                );
                for(var i in datas) {
                    var id = controller.getStack().getEntryId(datas[i]);
                    $table.line([
                            $('<span>').class('strong').text(datas[i].id).append(
                                $('<span>').text("(" + datas[i].filelineno + ")")
                            ).append(
                                datas[i].caption ?
                                    $("<div>").text(datas[i].caption) : null
                            ),
                            $.roundDiv(datas[i].bytes, 1024).toFixed(3) + '',
                            $.roundDiv(controller.getStack().getFunctions()[id].getMemory(), 1024).toFixed(3) + '',
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
                                    .getMemoryHistogram()
                                    .highlight(
                                        controller
                                            .getStack()
                                            .stack[$(this).attr('data-ref')].leaf
                                    );
                            }
                        ).bind(
                            'mouseout',
                            function(){
                                controller.memoryHistogram.restore();
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