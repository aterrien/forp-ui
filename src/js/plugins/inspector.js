(function(forp, $) {

    forp.plugins.inspector = {
        'nav': {
            'label': 'inspector',
            'display': function() {
                return (forp.getController().getStack().inspect != null);
            },
            'enabled': function() {
                return (forp.getController().getStack().inspect != null);
            },
            'open': function(e) {

                var self = forp.getController(),
                    $table = $.table(["var", "type"]),
                    ivars = self.getStack().inspect;

                for(var ivar in ivars) {
                    var info;
                    if(
                        typeof(ivars[ivar]) === "object"
                        && ivars[ivar].properties
                    ) {
                        info = $('<div>');
                        for(var prop in ivars[ivar].properties) {
                            info.append($('<span>').text(prop));
                        }
                    } else {
                        info = $.Utils.htmlEntities(ivars[ivar].value);
                    }

                    $table
                        .line(
                            [
                                ivar,
                                ivars[ivar].type
                            ]
                        )
                        .attr('data-ref', ivar)
                        .bind(
                            'click',
                            function() {

                                var $ul = $("<ul>").class("inspect"),
                                    ivar = $(this).attr('data-ref'),
                                    list = function(v, ul) {
                                    for(var entry in v) {
                                        var el = $("<li>");
                                        if(typeof(v[entry]) == 'object') {
                                            ul.append(
                                                el.text(entry + ":")
                                            );
                                            var sul = $("<ul>").appendTo(el);

                                            if(v[entry].type) {
                                                switch(v[entry].type) {
                                                    case "string" :
                                                    case "int" :
                                                    case "bool" :
                                                        ul.append(
                                                            el.text(
                                                                entry + ": ("
                                                                + v[entry].type
                                                                + ") "
                                                                + $.Utils.htmlEntities(v[entry].value)
                                                            )
                                                        );
                                                        break;
                                                    default:
                                                        list(v[entry], sul);
                                                }

                                            } else {
                                                list(v[entry], sul);
                                            }
                                        } else {
                                            ul.append(
                                                el.text(entry + ": " + $.Utils.htmlEntities(v[entry]))
                                            );
                                        }
                                    }
                                };

                                list(
                                    forp.getController().getStack().inspect[ivar],
                                    $ul
                                );

                                forp.getController()
                                    .getConsole()
                                    .showInSidebar($ul);
                            }
                        );
                }

                self.getConsole().show($table);
            },
            'close': function() {
                forp.getController().getLayout().reduce();
            }
        }
    };

})(forp, jMicro);