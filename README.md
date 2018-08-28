# Introduction #

forp-ui is a GUI utility that allows you to view and explore profiles dump.

It is very easy to integrate forp-ui into an HTML page, it is written in JavaScript.

# Basic features #

- search engine
- tree representation of the stack
- top 20 duration
- top 20 memory
- top 20 calls
- grouping of functions
- metrics and quality grades
- "called from" view
- "backtrace" view
- inspector

# Integration into an HTML page and example #

Download the minified version from the release branch of forp-ui on Github.
Put it in the js directory of your project, then run forp-ui as in the example below.


```
<script src="src/built/forp.min.js"></script>
<script>
(function($) {
    $("body").forp({
        stack :
        {
            "utime" : 0,
            "stime" : 0,
            "stack" :
            [
                {
                "file":"\/var\/www\/forp-ui\/js_demo.php",
                "function":"{main}",
                "usec":618,
                "pusec":5,
                "bytes":14516,
                "level":0
                },
                {
                "file":"\/var\/www\/forp-ui\/common.php",
                "function":"include",
                "lineno":6,
                "usec":347,
                "pusec":6,
                "bytes":7364,
                "level":1,
                "parent":0
                }
            ]
        },
        mode : "fixed"
    });
})(jMicro);
</script>
```

# Build #

Use src/build.php to build src/built/forp.min.js file.

```
$ git submodule init
$ git submodule update
$ cd src
$ php build.php
```

Options:

--skin name : gstyle, consolas (default)


# Communication with forp PHP profiler #

forp-ui is the perfect tool to treat the forp PHP profiles dump (https://github.com/aterrien/forp).
forp extension gives us PHP profiling datas, forp-ui helps you to refine it clientside.

# Screenshots (example : Yii PHP framework) #

### tree representation of the stack ###

![tree](https://raw.github.com/aterrien/forp-ui/master/doc/ui-tree.png)

### top 20 duration ###

![duration](https://raw.github.com/aterrien/forp-ui/master/doc/ui-duration.png)

Click on a stack entry displays backtrace in sidebar :

![duration details](https://raw.github.com/aterrien/forp-ui/master/doc/ui-duration-details.png)

### top 20 memory ###

![memory](https://raw.github.com/aterrien/forp-ui/master/doc/ui-memory.png)

### top 20 Calls ###

![calls](https://raw.github.com/aterrien/forp-ui/master/doc/ui-calls.png)

### grouping of functions ###

This is the result of forp @ProfileGroup annotation.

![groups](https://raw.github.com/aterrien/forp-ui/master/doc/ui-groups.png)

Click on a group entry displays "called from" block :

![groups details](https://raw.github.com/aterrien/forp-ui/master/doc/ui-groups-details.png)

### search engine ###

![search](https://raw.github.com/aterrien/forp-ui/master/doc/ui-search.png)


### metrics and quality grades

# Samples #

Samples are in the "samples" directory :
- "free" : simple example free of programming language.
- php : simple example of PHP profiling with forp PHP profiler.
