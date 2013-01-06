A simple GUI for forp extension https://github.com/aterrien/forp.

forp extension gives us the full PHP stack with profiling informations.
forpgui JS helps you to refine it clientside.

        forp (PHP extension) > json encode (PHP) > forpgui (JavaScript)

forpgui features :

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