(function(forp, $){
    /**
     * Graph abstraction
     */
    forp.Graph = function(conf) {

        forp.Decorator.call(this, $("<canvas>"));
        this.ctx = this.$[0].getContext('2d');
        this.drawn = false;

        this.conf = $.extend({
            xaxis: {length: 100, min: 0, max: 0},
            yaxis: {length: 100, min: 0, max: 0},
            mousemouve: null,
            val: function(i) {
                return this.datas[i];
            },
            color: function(i) {
                return '#999999';
            }
        }, conf);

        this.datas = null;

        this.setDatas = function(datas) {
            this.datas = datas;
            return this;
        };
    };
})(forp, jMicro);