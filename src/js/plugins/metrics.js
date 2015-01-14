(function(forp, $) {

    forp.plugins.metrics = {
        'nav': {
            'label': 'metrics',
            'display': true,
            'enabled': function() {
                return (forp.getController().getStack().inspect == null);
            },
            'open': function(e) {

                // TODO Metrics API
                // @see http://www.sdmetrics.com/LoM.html
                //   Cyclomatic complexity
                //   Excessive class complexity
                //   N-path complexity
                //   Too many fields
                //   Too many methods
                // x Ease of change

                var controller = forp.getController(),
                    $table = $.table(
                        ["metric", "type", "value", "grade"], 
                        ["metric", "type", "value", "grade"]
                    ),
                    duration = $.roundDiv(controller.getStack().getMainEntry().usec, 1000),
                    memory = $.roundDiv(controller.getStack().getMainEntry().bytes, 1024);

                $table.line([
                    $('<span>').class('strong').text('Real time (ms)'),
                    "Performance",
                    duration + '',
                    controller.getGrader().getGradeWithTip("time", duration)
                ]);

                if(controller.getStack().utime != null) {
                    var time = (controller.getStack().utime + controller.getStack().stime) / 1000;
                    $table.line(["<span class='strong'>CPU time (ms)</span>", "Performance",
                        time + '',
                        controller.getGrader().getGradeWithTip("time", time)
                    ]);
                }

                $table.line(["<span class='strong'>Memory usage (Kb)</span>", "Performance",
                    memory + '',
                    controller.getGrader().getGradeWithTip("memory", memory)]);
                $table.line(["<span class='strong'>Total includes</span>", "Performance",
                    controller.getStack().includesCount + '',
                    controller.getGrader().getGradeWithTip("includes", controller.getStack().includesCount)]);
                $table.line(["<span class='strong'>Total calls</span>", "Performance",
                    controller.getStack().stack.length + '',
                    controller.getGrader().getGradeWithTip("calls", controller.getStack().stack.length)]);
                $table.line(["<span class='strong'>Max nested level</span>", "Nesting",
                    controller.getStack().maxNestedLevel + '',
                    controller.getGrader().getGradeWithTip("nesting", controller.getStack().maxNestedLevel)]);
                $table.line(["<span class='strong'>Avg nested level</span>", "Nesting",
                    controller.getStack().avgLevel.toFixed(2) + '',
                    controller.getGrader().getGradeWithTip("nesting", controller.getStack().avgLevel)]);

                controller.getConsole().show($table);
            },
            'close': function() {
                return forp.getController().getLayout().reduce;
            }
        }
    };
})(forp, jMicro);