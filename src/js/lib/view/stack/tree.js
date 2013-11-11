(function(forp, $){

    /**
     * Stack Tree Class
     * @param Object stack Call stack array
     */
    $.tree = function(stack)
    {
        var self = this;

        /**
        * Generates a tree representation (UL) of the stack
        *
        * @param array entry Root entry
        * @param boolean recursive Says if we have to fetch it recursively
        * @return Object Wrapped UL
        */
        this.treeList = function(entry, recursive)
        {
            var ul = $("<ul>").addClass("l" + entry.level)
                , ex = $("<div>")
                        .html("<span>&nbsp;</span>")
                        .addClass("left expander")
                , gd = ($.Gauge(
                            entry.usec,
                            stack[entry.parent] ? stack[entry.parent].usec : entry.usec,
                            1000,
                            'ms'
                        )).addClass("left")
                , gb = ($.Gauge(
                            entry.bytes,
                            stack[entry.parent] ? stack[entry.parent].bytes : entry.bytes,
                            1024,
                            'Kb'
                        )).addClass("left")
                , li = $("<li>").text(entry.id);


            if(entry.groups) {
                for(var g in entry.groups) {
                    li.append(forp.TagRandColor.provideElementFor(entry.groups[g]));
                }
            }
            if(entry.caption) li.append($("<span>").text(entry.caption));

            li.append(ex).append(gd).append(gb).appendTo(ul);

            if(entry.childrenRefs) {

                li.removeClass("expanded").addClass("collapsed");

                ex.bind(
                    'click'
                    , function() {
                        if(li.hasClass("expanded")) {
                            li.removeClass("expanded").addClass("collapsed");
                        } else {
                            li.removeClass("collapsed").addClass("expanded");
                            if(!li.attr("data-tree")) {
                                for(var i in entry.childrenRefs) {
                                    self
                                        .treeList(stack[entry.childrenRefs[i]], true)
                                        .appendTo(li);
                                }
                                li.attr("data-tree", 1);
                            }
                        }
                    }
                );

                if(parseInt(entry.level) < 2) {
                    li.removeClass("collapsed").addClass("expanded");
                    if(!li.attr("data-tree")) {
                        li.attr("data-tree", 1);
                        var loopCounter,
                            lastId,
                            loopMaxIter = 100;

                        for(var i in entry.childrenRefs) {

                            if(stack[entry.childrenRefs[i]].id == lastId) {
                                loopCounter++;
                            } else {
                                loopCounter = 0;
                            }
                            lastId = stack[entry.childrenRefs[i]].id;

                            // loop detected, max item reached
                            if(loopCounter == loopMaxIter) {
                                $("<ul>")
                                    .append(
                                        $("<li>")
                                            .append(ex)
                                            .append(
                                                $("<div>")
                                                    .text(lastId + " : too many items to display (>" + loopMaxIter + ")")
                                            )
                                    )
                                    .appendTo(li);
                                continue;
                            }

                            if(loopCounter < loopMaxIter) {
                                this.treeList(stack[entry.childrenRefs[i]])
                                    .appendTo(li);
                            }
                        }
                    }
                } else {
                    li.removeClass("expanded").addClass("collapsed");
                }
            }

            return ul;
        };

        return this.treeList(stack[0], true);
    };
})(forp, jMicro);