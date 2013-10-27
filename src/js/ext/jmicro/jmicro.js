/**
 * Released under the WTFPL License
 * Copyright (c) 2013
 *   Ioan Chiriac
 *   Anthony Terrien
 * @link https://github.com/ichiriac/jmicro.js
 */
if ( typeof jMicro == 'undefined') {
    (function(w) {
        "use strict"
        // commodity declaration
        var undef = 'undefined',
        // taken from jQuery : don't automatically add "px" to these possibly-unitless properties
        cssNumber = {
            "columnCount": true,
            "fillOpacity": true,
            "fontWeight": true,
            "lineHeight": true,
            "opacity": true,
            "order": true,
            "orphans": true,
            "widows": true,
            "zIndex": true,
            "zoom": true
        };
        /**
         * Constructor
         */
        w.jMicro = function(selector, attr) {
            return new $(selector, attr);
        };
        /**
         * jMicro main class
         */
        w.jMicro.fn = w.jMicro.prototype = {
            // list of current selected nodes
            selector: null, length: 0,
            // Constructor
            construct: function(selector, attr) {
                var nodes = [];
                if ( !selector ) selector = [];
                if ( selector instanceof $ ) return selector;
                if ( typeof(selector) == 'string' ) {
                    var strim = selector.trim(),
                        striml = strim.length;
                    if (strim.charAt(0) == '<' && strim.charAt(striml - 1) == '>') {

                        var pnode = 'DIV';

                        if(strim.indexOf("<t") == 0) {
                            if(
                                strim.indexOf("<tr>") == 0
                                || strim.indexOf("<thead>") == 0
                                || strim.indexOf("<tbody>") == 0
                            ) {
                                pnode = 'TABLE';
                            } else if(
                                strim.indexOf("<td>") == 0
                                || strim.indexOf("<th>") == 0
                            ) {
                                pnode = 'TR';
                            }
                            var fragment = document.createDocumentFragment(),
                            snode = strim.substring(1, striml - 1);
                            fragment.appendChild(w.document.createElement(snode));
                            nodes = fragment.childNodes;
                        } else {
                            var parent = w.document.createElement(pnode);
                            parent.innerHTML = strim;
                            nodes = parent.childNodes;
                        }
                    } else if(selector) {
                        this.selector = selector;
                        try {
                            nodes = document.querySelectorAll(selector);
                        } catch(error) { }
                    }
                } else if( selector.nodeType || selector == w ) {
                    nodes = [selector];
                } else {
                    nodes = selector;
                }
                // reacts as an array
                for(var i=0; i<nodes.length; i++) {
                    var node = nodes[i];
                    if ( node instanceof $ ) node = node[0];
                    this[this.length++] = node;
                }
                // populate childs with attributes
                if ( attr ) {
                    for(var fn in attr) this[fn](attr[fn]);
                }
                return this;
            },
            // check states
            is: function(state) {
                if ( state == ':visible' ) {
                    return this[0].style.display != 'none';
                } // @todo switch other states : selected ...etc...
            },
            // searching in current first node
            find: function(selector) {
                return new $(this[0].querySelectorAll(selector)); // @todo : handle each node ?
            },
            // gets a DOM node
            get: function(index) { return this[index]; },
            // update current array with the specified index
            eq: function(index) {
                this.length = 1;
                this[0] = this.get(index);
                return this;
            },
            clone: function() {
                var nodes = [];
                this.each(function() {
                    nodes.push(this.cloneNode(true));
                });
                return new $(nodes);
            },
            replaceWith: function(content) {
                this.prepend(content);
                return this.each(function() {
                    this.parentNode.removeChild(this);
                });
            },
            // *** events ***
            on: function(event, fn) {
                return this.bind(event, fn);
            },
            live: function() {
                // @todo
                return this.bind(event, fn);
            },
            bind: function(event, fn) {
                var self = this;
                return this.each(function() {
                    if(!this.events) this.events = {};
                    if(!this.events[event]) this.events[event] = [];
                    this.events[event].push(fn);
                    if (this.addEventListener) {
                        this.addEventListener(
                            event,
                            function(e) { self.trigger(e); },
                            false
                        );
                    } else if (this.attachEvent) {
                        this.attachEvent(
                            "on" + event,
                            function(e) { self.trigger(e); }
                        );
                    }
                });
            },
            // events : removes the specified event
            unbind: function(event, fn) {
                return this.each(function() {
                    if(this.events && this.events[event]) {
                        if (this.removeEventListener) {
                            this.removeEventListener(event, fn, false);
                        } else if (this.detachEvent) {
                            this.detachEvent("on" + event, fn);
                        }
                        for(var i in this.events[event]) {
                            if(this.events[event][i] == fn) {
                                this.events[event].splice(i, 1);
                                return this;
                            };
                        }
                    }
                });
            },
            // events : triggers the specified event
            trigger: function(event) {
                var name = event.type ? event.type : event;
                return this.each(function() {
                    if(this.events && this.events[name]) {
                        for(var fn in this.events[name]) {
                            this.events[name][fn].apply(this, [event]);
                        }
                    }
                });
            },
            // events helpers
            blur: function(fn) { return this.bind('blur', fn); },
            change: function(fn) { return this.bind('change', fn); },
            click: function(fn) { return this.bind('click', fn); },
            dblclick: function(fn) { return this.bind('dblclick', fn); },
            focus: function(fn) { return this.bind('focus', fn); },
            keydown: function(fn) { return this.bind('keydown', fn); },
            keyup: function(fn) { return this.bind('keyup', fn); },
            keypress: function(fn) { return this.bind('keypress', fn); },
            mousedown: function(fn) { return this.bind('mousedown', fn); },
            mouseenter: function(fn) { return this.bind('mouseenter', fn); },
            mouseleave: function(fn) { return this.bind('mouseleave', fn); },
            mousemove: function(fn) { return this.bind('mousemove', fn); },
            mouseout: function(fn) { return this.bind('mouseout', fn); },
            mouseover: function(fn) { return this.bind('mouseover', fn); },
            mouseup: function(fn) { return this.bind('mouseup', fn); },
            resize: function(fn) { return this.bind('resize', fn); },
            scroll: function(fn) { return this.bind('scroll', fn); },
            select: function(fn) { return this.bind('select', fn); },
            submit: function(fn) { return this.bind('submit', fn); },
            focusin: function(fn) { return this.bind('focusin', fn); },
            focusout: function(fn) { return this.bind('focusout', fn); },
            load: function(fn) { return this.bind('load', fn); },
            unload: function(fn) { return this.bind('unload', fn); },
            ready: function(fn) {
                /* Internet Explorer */
                /*@cc_on
                @if (@_win32 || @_win64)
                document.write('<script id="ieScriptLoad" defer src="//:"><\/script>');
                document.getElementById('ieScriptLoad').onreadystatechange = function() {
                    if (this.readyState == 'complete') {
                        fn();
                    }
                };
                @end @*/
                if (document.addEventListener) {
                    /* Mozilla, Chrome, Opera */
                    document.addEventListener('DOMContentLoaded', fn, false);
                } else if (/KHTML|WebKit|iCab/i.test(navigator.userAgent)) {
                    /* Safari, iCab, Konqueror */
                    var DOMLoadTimer = setInterval(function () {
                        if (/loaded|complete/i.test(document.readyState)) {
                            fn();
                            clearInterval(DOMLoadTimer);
                        }
                    }, 10);
                } else {
                    /* Other web browsers */
                    window.onload = fn;
                }
            },
            // dom manipulation
            html: function(value) {
                return this.each(function() {
                    this.innerHTML = value;
                });
            },
            text: function(value) {
                return this.each(function() {
                    this.innerHTML = value
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                    ;
                });
            },
            prepend: function(nodes) {
                if (!(nodes instanceof $)) nodes = new $(nodes);
                return this.each(function() {
                    var self = this;
                    nodes.each(function() {
                        self.insertBefore(this, self.firstChild);
                    });
                });
            },
            append: function(nodes) {
                if (!(nodes instanceof $)) nodes = new $(nodes);
                return this.each(function() {
                    var self = this;
                    nodes.each(function() {
                        self.appendChild(this);
                    });
                });
            },
            appendTo: function(nodes) {
                if (!(nodes instanceof $)) nodes = new $(nodes);
                return this.each(function() {
                    var self = this;
                    nodes.each(function() {
                        this.appendChild(self);
                    });
                });
            },
            remove: function() {
                return this.each(function() {
                    this.parentNode.removeChild(this);
                });
            },
            empty: function() {
                return this.html('');
            },
            insertAfter: function(element) {
                this[0].parentNode.insertBefore( element[0], this[0].nextSibling );
                return this;
            },
            // attributes
            attr: function(attr, val) {
                if ( typeof val == undef ) {
                    if ( typeof attr == 'object') {
                        for(var key in attr) this.attr(key, attr[key]);
                        return this;
                    } else {
                        return typeof this[0][attr] == undef ?
                            this[0].getAttribute(attr) :
                            this[0][attr]
                        ;
                    }
                }

                return this.each(function() {
                    this.setAttribute(attr, val);
                });
            },
            /** attributes helpers **/
            id: function(val) { return this.attr('id', val); },
            class: function(val) { return this.attr('class', val); },
            val: function(val) { return this.attr('value', val); },
            data: function(attr, val) {
                if ( typeof val == undef ) {
                    return this[0]['$' + attr];
                }
                return this.each(function() {
                    this['$' + attr] = val;
                });
            },
            removeData: function(attr) { return this.data(attr, null); },
            /** css handlers **/
            css: function(name, val) {
                if ( typeof val == undef ) {
                    if ( typeof name == 'object') {
                        for(var key in name) this.css(key, name[key]);
                        return this;
                    } else {
                        return this[0].style[name];
                    }
                }
                if (!isNaN(val) && !cssNumber[name]) val += 'px';
                return this.each(function() {
                    this.style[name] = val;
                });
            },
            show: function() {
                return this.css({ display: 'block' });
            },
            hide: function() {
                return this.css({ display: 'none' });
            },
            height: function(val) {
                return (typeof val != undef) ?
                     this.css('height', val) :
                     this[0].offsetHeight
                ;
            },
            width: function(val) {
                return (typeof val != undef) ?
                     this.css('width', val) :
                     this[0].offsetWidth
                ;
            },
            outerWidth: function(val) { return this.width(val); },
            /** Classes handlers **/
            addClass: function(c) {
                var cArr = c.split(' '), l = cArr.length;
                return this.each(function() {
                    for (var i=0; i<l; i++) {
                        this.classList.add(cArr[i]);
                    }
                });
                return this;
            },
            hasClass: function(c) {
                return this[0].classList.contains(c);
            },
            removeClass: function(c) {
                return this.each(function() {
                    for (var k in this.classList) {
                        if (this.classList[k] == c) {
                            this.classList.remove(c);
                        }
                    }
                });
            },
            top: function() {
                return this.offset().top;
            },
            left: function() {
                return this.offset().left;
            },
            position: function(value) {
                if ( typeof value != undef ) {
                    // @todo calculate the real position (now just center)
                    return this.css({
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        marginLeft: -(this.width() / 2),
                        marginTop: -(this.height() / 2)
                    });
                }
                if ( this.length > 0 ) {
                    return {left: this[0].offsetLeft, top: this[0].offsetTop};
                } else {
                    return { left: 0, top: 0 };
                }
            },
            offset: function() {
                if ( this.length == 0 ) return {
                    left: 0, top: 0
                };
                var result = this.position(), e = this[0];
                while(e = e.offsetParent) {
                    result.left += e.offsetLeft;
                    result.top += e.offsetTop;
                }
                return result;
            },
            parent: function() {
                return new $(this[0].parentNode);
            }
        };
        // Gives the context to the constructor
        w.jMicro.fn.construct.prototype = w.jMicro.fn;
        // extends an object with another
        w.jMicro.extend = w.jMicro.fn.extend = function() {
            var len = arguments.length, target, start = 0;
            var deep = false;
            if ( len == 1) {
                for(var entry in arguments[0]) {
                    var obj = arguments[0][entry];
                    if(typeof obj != 'function' && obj instanceof Object) {
                        w.jMicro[entry] = w.jMicro.extend(w.jMicro.fn[entry], obj);
                    } else {
                        w.jMicro[entry] = w.jMicro.fn[entry] = obj;
                    }
                }
                return w.jMicro;
            } else {
                if ( arguments[0] === true ) {
                    deep = true;
                    start++;
                }
                target = arguments[start];
                if (!target) target = {};
            }
            if ( arguments[len - 1] === true ) {
                deep = true;
                len--;
            }
            for(var i = start + 1; i < len; i++) {
                var obj = arguments[i];
                for(var entry in obj) {
                    if(deep && typeof obj[entry] != 'function' && obj[entry] instanceof Object && !(obj[entry] instanceof Document)) {
                        target[entry] = this.extend(target[entry], obj[entry]);
                    } else {
                        target[entry] = obj[entry];
                    }
                }
            }
            return target;
        };
        // static functions
        w.jMicro.extend({
            each: function(scope, fn) {
                if ( typeof fn == undef ) {
                    fn = scope;
                    scope = this;
                }
                for(var i=0; i<scope.length; i++) {
                    var node = scope[i];
                    fn.apply(node, [i, node]);
                }
                return scope;
            }
        });
        // Make it more easy for new or instanceof statements
        var $ = w.jMicro.fn.construct;
        w.jMicro.support = {};
    })(this);
}