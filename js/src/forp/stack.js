(function(f) {

    "use strict";

    /**
     * Stack Class
     * @param Object stack Call stack array
     */
    f.Stack = function(stack)
    {
        var self = this;

        this.stack = (stack.stack != null) ? stack.stack : []; // RAW stack
        this.utime = (stack.utime != null) ? stack.utime : null;
        this.stime = (stack.stime != null) ? stack.stime : null;
        this.inspect = stack.inspect;
        this.functions = null; // indexed stack
        this.includes = null; // included files
        this.includesCount = 0;
        this.groups = null; // groups
        this.groupsCount = 0;
        this.leaves = null;
        this.topCpu = null;
        this.topCalls = null;
        this.topMemory = null;
        this.found = {};
        this.maxNestedLevel = 0;
        this.avgLevel = 0;

        /**
         * Function struct
         * Internal Class of Stack
         */
        var Function = function(conf)
        {
            this.stack = conf.stack;
            this.id = conf.id;
            this.class = conf.class;
            this.function = conf.function;
            this.refs = [];
            this.entries = [];
            this.calls = 1;
            this.duration = null;
            this.memory = null;

            /**
             * @param string filelineno
             * @param Object entry
             * @return Function
             */
            this.setEntry = function(filelineno, entry)
            {
                this.entries[filelineno] = entry;
                return this;
            };
            /**
             * @return Function
             */
            this.incrCalls = function()
            {
                this.calls ++;
                return this;
            };
            /**
             * @return integer
             */
            this.getDuration = function() {
                if(this.duration !== null) return this.duration;
                this.duration = 0;
                for(var i in this.refs) {
                    if(this.isRecursive(this.refs[i])) continue;
                    this.duration += this.refs[i].usec;
                }
                return this.duration;
            };
            /**
             * @return integer
             */
            this.getMemory = function() {
                if(this.memory !== null) return this.memory;
                this.memory = 0;
                for(var i in this.refs) {
                    if(this.isRecursive(this.refs[i])) continue;
                    this.memory += this.refs[i].bytes;
                }
                return this.memory;
            };
            /**
             * @param Object stack entry
             * @return bool
             */
            this.isRecursive = function(entry)
            {
                var i = entry.i;
                while(this.stack[i].parent > 0) {
                    i = this.stack[i].parent;
                    if(this.stack[i].id == entry.id) return true;
                }
                return false;
            };
        }

        /**
         * Refines ancestors metrics
         * @param object Descendant stack entry
         * @return forp.Controller
         */
        this.refineParents = function(descendant, value)
        {
            if(descendant.parent == undefined) return;
            this.stack[descendant.parent].usec -= value;
            this.refineParents(this.stack[descendant.parent], value);
            return this;
        };
        /**
         * Aggregates stack entries
         * This is the core function
         *
         * One loop to compute :
         * - top duration
         * - top memory
         * - groups
         * - included files
         *
         * @return forp.Controller
         */
        this.aggregate = function()
        {
            if(!this.functions) {
                // hashing stack
                var id, filelineno, ms, kb, lastEntry;
                this.functions = {};
                this.includes = {};
                this.groups = {};
                this.leaves = [];

                this.topCpu = new f.SortedFixedArray(
                    function(a, b) {
                        return (a.usec > b.usec);
                    },
                    @PHP-VAR-topCpu@
                );

                this.topMemory = new f.SortedFixedArray(
                    function(a, b) {
                        return (a.bytes > b.bytes);
                    },
                    @PHP-VAR-topMemory@
                );

                for(var entry in this.stack) {

                    id = this.getEntryId(this.stack[entry]);
                    filelineno = this.stack[entry].file + (this.stack[entry].lineno ? ':' + this.stack[entry].lineno : '');
                    ms = f.roundDiv(this.stack[entry].usec, 1000);
                    kb = f.roundDiv(this.stack[entry].bytes, 1024);

                    // entry
                    this.stack[entry].i = entry;
                    this.stack[entry].filelineno = filelineno;

                    // unit cost
                    if(lastEntry && (lastEntry.level >= this.stack[entry].level)) {
                        this.leaves.push(lastEntry);
                        this.topCpu.put(lastEntry);
                        this.topMemory.put(lastEntry);
                    }

                    // max nested level
                    this.maxNestedLevel = (this.stack[entry].level > this.maxNestedLevel)
                        ? this.stack[entry].level : this.maxNestedLevel ;

                    this.avgLevel += this.stack[entry].level;

                    this.stack[entry].id = id;

                    // Counts leafs
                    if(this.stack[this.stack[entry].parent]) {
                        if(!this.stack[this.stack[entry].parent].childrenRefs) {
                            this.stack[this.stack[entry].parent].childrenRefs = [];
                        }
                        this.stack[this.stack[entry].parent].childrenRefs.push(entry);
                    }

                    // Constructs functions
                    if(this.functions[id]) {
                        this.functions[id].incrCalls();

                        // Linking between functions and stack entries
                        if(this.functions[id].entries[filelineno]) {
                            this.functions[id].entries[filelineno].calls++;
                        } else {
                            this.functions[id].setEntry(
                                filelineno,
                                {
                                    calls : 1
                                    , file : this.stack[entry].file
                                    , filelineno : filelineno
                                    , refs : []
                                }
                            );
                        }

                    } else {

                        // indexing by function id
                        this.functions[id] = new Function({
                            stack : this.stack,
                            id : id,
                            class : this.stack[entry].class ? this.stack[entry].class : null,
                            function : this.stack[entry].function
                        }).setEntry(
                            filelineno,
                            {
                                calls : 1
                                , file : this.stack[entry].file
                                , filelineno : filelineno
                                , refs : []
                            }
                        );

                        // Groups
                        if(this.stack[entry].groups) {
                            for(var g in this.stack[entry].groups) {
                                if(!this.groups[this.stack[entry].groups[g]]) {
                                    this.groups[this.stack[entry].groups[g]] = {
                                        calls : 0
                                        , usec : 0
                                        , bytes : 0
                                        , refs : []
                                    };
                                }
                                this.groups[this.stack[entry].groups[g]].refs.push(this.stack[entry]);
                            }
                        }
                    }

                    // Linking between functions and stack entries
                    this.functions[id].refs.push(this.stack[entry]);
                    this.functions[id].entries[filelineno].refs.push(this.stack[entry]);

                    // Refines ancestors
                    this.stack[entry].pusec &&
                    this.refineParents(this.stack[entry], this.stack[entry].pusec);

                    // Files
                    if(!this.includes[this.stack[entry].file]) {
                        this.includes[this.stack[entry].file] = {
                            usec : ms
                            , bytes : kb
                            , calls : 1
                        };
                        this.includesCount++;
                    } else {
                        this.includes[this.stack[entry].file].usec += ms;
                        this.includes[this.stack[entry].file].bytes += kb;
                        this.includes[this.stack[entry].file].calls++;
                    }

                    lastEntry = this.stack[entry];
                } // end foreach stack

                // unit cost / last entry
                this.leaves.push(lastEntry);
                this.topCpu.put(lastEntry);
                this.topMemory.put(lastEntry);

                // Finalize groups
                for(var group in this.groups) {
                    this.groupsCount++;
                    for(var i in this.groups[group].refs) {
                        this.groups[group].calls += this.functions[this.groups[group].refs[i].id].calls;
                        this.groups[group].usec += this.functions[this.groups[group].refs[i].id].getDuration();
                        this.groups[group].bytes += this.functions[this.groups[group].refs[i].id].getMemory();
                    }
                }

                this.avgLevel = this.avgLevel / this.stack.length;
            }

            return this;
        };

        /**
         * @return array Main entry
         */
        this.getMainEntry = function()
        {
            return this.stack[0];
        };

        /**
         * @param array Stack entry
         * @return string
         */
        this.getEntryId = function(entry)
        {
            return ((entry.class) ? entry.class + '::' : '') + entry.function;
        };

        /**
         * @return array
         */
        this.getFunctions = function()
        {
            return this.aggregate().functions;
        };

        /**
         * Regexp search in stack functions
         * @param string query
         * @return array founds
         */
        this.search = function(query)
        {
            if(!this.found[query]) {
                this.found[query] = [];
                for(var entry in this.getFunctions()) {

                    // max 100 results
                    if(this.found[query].length == 100) return this.found[query];

                    var r = new RegExp(query, "i");
                    if(r.test(this.functions[entry].id))
                    this.found[query].push(this.functions[entry]);
                }
            }
            return this.found[query];
        };

        /**
         * Top X calls
         * @return array SortedFixedArray stack
         */
        this.getTopCalls = function()
        {
            if(!this.topCalls) {
                this.topCalls = new f.SortedFixedArray(
                    function(a, b) {return (a.calls > b.calls);},
                    @PHP-VAR-topCalls@
                );

                for(var entry in this.getFunctions()) {
                    this.topCalls.put(this.functions[entry]);
                }
            }
            return this.topCalls.stack;
        };

        /**
         * Top X CPU
         * @return array SortedFixedArray stack
         */
        this.getTopCpu = function()
        {
            return this.aggregate().topCpu.stack;
        };

        /**
         * Top X memory
         * @return array SortedFixedArray stack
         */
        this.getTopMemory = function()
        {
            return this.aggregate().topMemory.stack;
        };

        /**
         * Distinct included files
         * @return array Files
         */
        this.getIncludes = function()
        {
            return this.aggregate().includes;
        };

        /**
         * Groups
         * @return array Files
         */
        this.getGroups = function()
        {
            return this.aggregate().groups;
        };
    };
})(forp);
