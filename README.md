forpgui is a call stack visualizer.

forpgui is the perfect tool to treat the call stack built by forp PHP profiler (https://github.com/aterrien/forp).

forp extension gives us the full PHP call stack with profiling informations.
forpgui JS helps you to refine it clientside.

        forp (PHP extension) > json_encode($forpStack) (PHP) > forpgui (JavaScript)

Call stack example :
<code>
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
</code>


forpgui features (example : Yii PHP framework) :

- Stack tree
![tree](https://raw.github.com/aterrien/forpgui/master/doc/ui-tree.png)

- top 20 duration
![duration](https://raw.github.com/aterrien/forpgui/master/doc/ui-duration.png)

Click on a stack entry displays backtrace in sidebar :

![duration details](https://raw.github.com/aterrien/forpgui/master/doc/ui-duration-details.png)

- top 20 Memory
![memory](https://raw.github.com/aterrien/forpgui/master/doc/ui-memory.png)

- top 20 Calls
![calls](https://raw.github.com/aterrien/forpgui/master/doc/ui-calls.png)

- groups

This is the result of forp @ProfileGroup annotation.

![groups](https://raw.github.com/aterrien/forpgui/master/doc/ui-groups.png)

Click on a group entry displays "called from" block :

![groups details](https://raw.github.com/aterrien/forpgui/master/doc/ui-groups-details.png)

- search engine
![search](https://raw.github.com/aterrien/forpgui/master/doc/ui-search.png)


- quality metrics