(function(forp, $) {

    forp.plugins.groups = {
        'nav': {
            'label': function() {
                return "groups (" + forp.getController().getStack().groupsCount + ")";
            },
            'display': function() {
                return forp.getController().getStack().groupsCount > 0;
            },
            'enabled': false,
            'open': function(e) {
                var self = forp.getController(),
                    datas = self.getStack()
                                .getGroups();

                self.getConsole().empty().open();

                self.getGroupsBarChart()
                    .appendTo(self.getConsole());

                var $table = $.table(
                    ["group", "calls", "ms", "Kb"], 
                    ["group", "calls", "ms", "Kb"]
                );

                for(var i in datas) {
                    $table
                        .append(
                            $("<tr>")
                                .append(
                                    $("<td>")
                                        .attr("colspan", 4)
                                        .attr("style", "padding: 0px; height: 4px; background:"
                                            + forp.TagRandColor.provideFor(i))
                                )
                        )
                        .line([

                            datas[i].calls,
                            $.roundDiv(datas[i].usec, 1000).toFixed(3) + '',
                            $.roundDiv(datas[i].bytes, 1024).toFixed(3) + ''
                        ])
                        .prepend(
                            $("<td>")
                                .append(
                                    forp.TagRandColor.provideElementFor(i)
                                )
                                .append(
                                    $("<span>")
                                        .append(
                                            $("<span>").class('strong').text(i)
                                        )
                                        .append(
                                            $("<span>").text(' (' + datas[i].refs.length + ' ' + (datas[i].refs.length>1 ? "entries" : "entry") + ')')
                                        )
                                )
                        );

                    for(var j in datas[i].refs) {
                        $table.line([
                            datas[i].refs[j].id,
                            $.Gauge(
                                self.getStack().getFunctions()[datas[i].refs[j].id].calls,
                                datas[i].calls
                            ),
                            $.Gauge(
                                self.getStack().getFunctions()[datas[i].refs[j].id].getDuration(),
                                datas[i].usec,
                                1000,
                                'ms'
                            ),
                            $.Gauge(
                                self.getStack().getFunctions()[datas[i].refs[j].id].getMemory(),
                                datas[i].bytes,
                                1024,
                                'Kb'
                            )
                        ])
                        .attr("data-ref", datas[i].refs[j].id)
                        .bind("click", self.toggleDetails);
                    }
                }

                self.getConsole().show($table);
            },
            'close': function() {
                forp.getController().getLayout().reduce();
            }
        }
    };

})(forp, jMicro);