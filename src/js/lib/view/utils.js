(function(forp, $) {

    "use strict";

    /**
     * ScrollBottom jMicro Plugin
     */
    $.fn.scrollBottom = function() {
        return this.each(function() {
            this.scrollTop = $(this.firstChild).height();
        });
    };

    /**
     * jMicro table() helper
     */
    $.table = function(headers, reorder) {
        var $table = $('<table>');
        if(headers) {
            var $header = $("<tr>");
            for(var i in headers) {
                if (reorder && ~reorder.indexOf(headers[i])) {
                    $("<th>").text(headers[i])
                        .addClass("reorder")
                        .on("click", $.fn.tableOrder)
                        .appendTo($header);
                } else {
                    $("<th>").text(headers[i]).appendTo($header);
                }
            }
            $header.appendTo($table);
        }
        return $table;
    };
    
    /**
     * jMicro tableOrder callback
     */
    $.fn.tableOrder = function(e) {
        $(e.srcElement).data("order", $(e.srcElement).data("order") ? 0 : 1);
        var $tbl = $(e.srcElement).parent().parent(),
            index = e.srcElement.cellIndex,
            trs = [],
            order = $(e.srcElement).data("order");

        for (var i = 1; i < $tbl[0].childNodes.length; i++) {
            trs.push($tbl[0].childNodes[i]);
        }
        
        trs.sort(function(a, b) {
            var aval = a.childNodes[index].innerHTML.replace(/<.*?>/g, ''),
            bval = b.childNodes[index].innerHTML.replace(/<.*?>/g, '');

            if (aval < bval) {
                return order ? -1 : 1;
            } else if (aval > bval) {
                return order ? 1 : -1;
            }
            return 0;
        });

        for (var i = 0; i < trs.length; i++) {
          $tbl.append(trs[i]);
        }
    };

    /**
     * jMicro line() helper
     */
    $.fn.line = function(cols) {
        var $tr = $('<tr>');
        for(var i in cols) {
            if(typeof cols[i] === "object") {
                $tr.append(
                    $("<td>")
                        .append(cols[i])
                );
            } else if(isNaN(cols[i])) {
                $tr.append(
                    $("<td>")
                        .html(cols[i])
                );
            } else {
                $tr.append(
                    $("<td>")
                        .addClass("numeric w100")
                        .html(cols[i])
                );
            }
        }
        $(this).append($tr);
        return $tr;
    };

    /**
     * Utils, helpers
     */
    $.Utils = {
        /**
            * TODO depth
            * @param path File path
            */
        trimPath : function(path)
        {
            var pathSplit = path.split('/');
            if(pathSplit.length > 3) {
                pathSplit = [pathSplit[pathSplit.length - 4], pathSplit[pathSplit.length - 3], pathSplit[pathSplit.length - 2], pathSplit[pathSplit.length - 1]];
                path = pathSplit.join('/');
            }
            return path;
        },
        htmlEntities : function(str) {
            return String(str)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');
        }
    };

    /**
     * Sorted Fixed Array Class
     * @param callback compare
     * @param int size
     */
    $.SortedFixedArray = function(compare, size) {
        this.stack = [];
        this.size = size;
        /**
            * Internal method insert
            * @param mixed entry
            * @param int i
            */
        this.insert = function(entry, i) {
            for(var j = Math.min(this.size - 1, this.stack.length); j > i; j--) {
                this.stack[j] = this.stack[j - 1];
            }
            this.stack[i] = entry;
        }
        /**
        * Evaluate and put a new entry in the stack
        * @param mixed entry
        */
        this.put = function(entry) {
            if(this.stack.length) {
                // break if end entry is greatest
                if(this.stack.length == this.size) {
                    if(!compare.call(this, entry, this.stack[this.size-1])) {
                        return;
                    }
                }
                // insert entry at the right place
                for(var i = 0; i < this.stack.length; i++) {
                    if(compare.call(this, entry, this.stack[i])) {
                        this.insert(entry, i);
                        break;
                    }
                }
                if(
                    (i == this.stack.length)
                    && (this.stack.length < this.size)
                ) {
                    this.insert(entry, i);
                }
            } else {
                this.insert(entry, 0);
            }
        };
    };

    /**
     * @param string v
     * @return int
     */
    $.round = function(v)
    {
        return (~~ (0.5 + (v * 1000))) / 1000;
    };

    /**
     * @param string v
     * @param int d
     * @return int
     */
    $.roundDiv = function(v, d)
    {
        return this.round(v / d);
    };

    /**
     * inArray
     * @param needle
     * @param haystack
     */
    $.inArray = function(needle, haystack) {
        var length = haystack.length;
        for(var i = 0; i < length; i++) {
            if(haystack[i] == needle) return true;
        }
        return false;
    };

    /**
     * Helper for old jMicro portability
     */
    forp.Decorator = function($container)
    {
        var self = this;
        this.$ = $container;
        this.element = $container[0];

        this.unbind = function(event, fn)
        {
            self.$.unbind(event, fn);
            return this;
        };

        this.appendTo = function(container)
        {
            this.$.appendTo(container.$);
            return this;
        };


        this.append = function(element)
        {
            this.$.append(element.$);
            return this;
        };

        this.empty = function()
        {
            this.$.empty();
            return this;
        };

        this.attr = function(k, v)
        {
            this.$.attr(k, v);
            return this;
        };

        /*this.table = function(headers) {
            return (new forp.Table(headers)).appendTo(this);
        };*/
    };

    /**
     * Nav
     */
    forp.Nav = function()
    {
        forp.Decorator.call(this, $("<nav>"));
    };

    /**
     * Panel
     * @param string id Panel ID
     */
    forp.Panel = function(id)
    {
        forp.Decorator.call(this, $("<div>"));

        this.$.class(id + " panel");
        this.id = id;
    };

})(forp, jMicro);