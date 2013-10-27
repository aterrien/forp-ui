(function(forp, $){

    /**
     * Gauge Class
     * @param integer value
     * @param integer max
     * @param integer divider
     * @param string unit
     */
    $.Gauge = function(value, max, divider, unit)
    {
        var percent = 0, text, displayedValue;

        displayedValue = $.roundDiv(value, (divider ? divider : 1));

        if(value < 0) {
            displayedValue = Math.abs(displayedValue);
        }

        if(displayedValue % 1 !== 0) {
            displayedValue = displayedValue.toFixed(3);
        }
        displayedValue += (unit ? unit : '');

        if(value > max) {
            text = "reached " + displayedValue;
        } else if(value < 0) {
            text = "won " + displayedValue;
        } else {
            text = displayedValue;
            percent = $.round(value * 100 / max);
        }

        return $('<div>')
                .addClass("gauge")
                .append(
                    $("<div>")
                        .class("text")
                        .text(text)
                )
                .append(
                    $("<div>")
                        .addClass("bar")
                        .attr(
                            "style",
                            "width: " + percent.toFixed(0) + "%"
                            )
                );
    };
})(forp, jMicro);