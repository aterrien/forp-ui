(function(forp, $){

    /**
     * Backtrace Class
     * @param integer i Index
     * @param Object stack Callc stack array
     */
    forp.Backtrace = function(i, stack)
    {
        var self = this,
            $container = $("<div>").class("backtrace");
        forp.Decorator.call(this, $container);

        this.prependItem = function(entry, highlight) {
            return this.$.prepend(
                $("<div>")
                    .class("backtrace-item " + (highlight ? " highlight" : ""))
                    .append(
                        $('<span>')
                            .class('strong')
                            .text(entry.id)
                    )
                    .append($('<br>'))
                    .append($('<span>').text($.Utils.trimPath(entry.filelineno)))
                    .append($('<br>'))
                    .append($('<span>').text($.roundDiv(entry.usec, 1000).toFixed(3) + "ms "))
                    .append($('<span>').text($.roundDiv(entry.bytes, 1024).toFixed(3) + "Kb"))
                );
        };

        var child = i;
        while(i != null) {
            this.prependItem(stack[i], child == i);
            i = stack[i].parent;
            if(i != null) {
                this.$.prepend($("<div>").class("arrow").text("&#x25BC;"));
            }
        }
    };
})(forp, jMicro);