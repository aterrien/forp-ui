! wait for release branch before using it !

## Introduction ##

forpgui is a GUI utility that allows you to view and explore profiles dump.

It is very easy to integrate forgui into an HTML page because is is written in JavaSCript.

## Basic features ##

- search engine
- tree representation of the stack
- top 20 duration
- top 20 memory
- top 20 calls
- grouping of functions
- metrics and quality grades
- "called from" view
- "backtrace" view

## Integration into an HTML page and example ##

Download the minified version from the release branch of forpgui on Github.
Put it in the js directory of your project, then run forgui as in the example below.


```
<script src="js/forp.min.js"></script>
<script>
forp.stack =
[
    {
    "file":"\/var\/www\/forpgui\/js_demo.php",
    "function":"{main}",
    "usec":618,
    "pusec":5,
    "bytes":14516,
    "level":0
    },
    {
    "file":"\/var\/www\/forpgui\/common.php",
    "function":"include",
    "lineno":6,
    "usec":347,
    "pusec":6,
    "bytes":7364,
    "level":1,
    "parent":0
    }
];
</script>
```

## Build ##

forpgui builder generates the forp.min.js file from files in src/.

```
$ php build.php
```

## Communication with forp PHP profiler ##

forpgui is the perfect tool to treat the forp PHP profiles dump (https://github.com/aterrien/forp).
forp extension gives us PHP profiling datas, forpgui helps you to refine it clientside.

## Screenshots (example : Yii PHP framework) ##

### tree representation of the stack ###

![tree](https://raw.github.com/aterrien/forpgui/master/doc/ui-tree.png)

### top 20 duration ###

![duration](https://raw.github.com/aterrien/forpgui/master/doc/ui-duration.png)

Click on a stack entry displays backtrace in sidebar :

![duration details](https://raw.github.com/aterrien/forpgui/master/doc/ui-duration-details.png)

### top 20 memory ###

![memory](https://raw.github.com/aterrien/forpgui/master/doc/ui-memory.png)

### top 20 Calls ###

![calls](https://raw.github.com/aterrien/forpgui/master/doc/ui-calls.png)

### grouping of functions ###

This is the result of forp @ProfileGroup annotation.

![groups](https://raw.github.com/aterrien/forpgui/master/doc/ui-groups.png)

Click on a group entry displays "called from" block :

![groups details](https://raw.github.com/aterrien/forpgui/master/doc/ui-groups-details.png)

### search engine ###

![search](https://raw.github.com/aterrien/forpgui/master/doc/ui-search.png)


### metrics and quality grades