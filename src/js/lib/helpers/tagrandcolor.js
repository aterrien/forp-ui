(function(forp, $){

    /**
     * TagRandColor Class
     * Provides predefined colors
     */
    forp.TagRandColor = {
        i : 0,
        pocket : ["#f95", "#f59", "#59f", "#5e9", "#9e6", "#95f",
                "#e55", "#fe6", "#f6f", "#5e5", "#5ef", "#55f"],
        tagsColor : {},
        provideFor : function(name)
        {
            if(!this.tagsColor[name]) {
                if(this.i < this.pocket.length) {
                    this.tagsColor[name] = this.pocket[this.i];
                    this.i++;
                } else {
                    this.tagsColor[name] = 'rgb(' +
                        Math.round(Math.random() * 100 + 155) + ',' +
                        Math.round(Math.random() * 100 + 155) + ',' +
                        Math.round(Math.random() * 100 + 155)
                        + ')';
                }
            }
            return this.tagsColor[name];
        },
        provideElementFor : function(name)
        {
            return $("<a>")
                    .class("tag")
                    .attr(
                        'style',
                        'background: ' + this.provideFor(name)
                    )
                    .text(name)
                    .bind(
                        "click",
                        function(){
                            //alert('to groups view');
                        }
                    );
        }
    };

})(forp, jMicro);