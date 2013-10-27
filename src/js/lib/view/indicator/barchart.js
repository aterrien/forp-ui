(function(forp, $){

    /**
     * BarChart Class
     */
    forp.BarChart = function(conf) {
        forp.Graph.call(this, conf);
        this.tmp = null;

        this.restore = function() {
            if(this.tmp) {
                this.ctx.clearRect(0, 0, this.element.width, this.element.height);
                this.ctx.drawImage(this.tmp, 0, 0);
            }
        };

        this.highlight = function(idx) {

            if(!this.tmp) {
                this.tmp = document.createElement('canvas');
                this.tmp.width = this.element.width;
                this.tmp.height = this.element.height;
                this.tmp.style.width = '100%';
                this.tmp.style.height = '100px';

                var context = this.tmp.getContext('2d');
                context.drawImage(this.element, 0, 0);
            }

            this.ctx.beginPath();
            this.ctx.strokeStyle = '#4D90FE';
            this.ctx.lineWidth = 60;
            this.ctx.moveTo(idx, this.conf.yaxis.length);
            this.ctx.lineTo(
                idx,
                this.conf.yaxis.length -
                (
                    (this.conf.val.call(this, idx) * 100) /
                    this.conf.yaxis.max
                )
            );
            this.ctx.closePath();
            this.ctx.stroke();
        };

        this.draw = function() {
            if(!this.drawn) {
                this.drawn = true;

                var len = this.datas.length;
                this.element.width  = document.body.clientWidth*2;
                this.element.height = this.conf.yaxis.length;
                this.element.style.width = '100%';
                this.element.style.height = this.conf.yaxis.length + 'px';
                this.element.style.marginBottom = '-3px';
                this.element.style.backgroundColor = '#333';

                var x = 0;
                for(var i = 0; i < len; i++) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = this.conf.color.call(this, i);
                    this.ctx.lineWidth = 50;
                    this.ctx.moveTo(
                        x, 25
                    );
                    this.ctx.lineTo(
                        x += (
                            (this.conf.val.call(this, i) * this.element.width) /
                            this.conf.xaxis.max
                        ) +2,
                        25
                    );
                    this.ctx.closePath();
                    this.ctx.stroke();
                }

                if(this.conf.mousemove) {
                    var self = this;
                    this.bind(
                        'mousemove',
                        function(e) {
                            self.conf.mousemove.call(self,e);
                        }
                    )
                }
            }
            return this;
        };
    };
})(forp, jMicro);