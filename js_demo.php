<?php
// first thing to do = enable forp profiler
forp_enable();
?>
<!doctype html>
<html>
    <head>
        <style>
            body {margin : 0px}
        </style>
    </head>
    <body>
<?php
// this is our basic test
function test(){ echo 'Hello world !'; };
function test1(){test();};
class Foo {
    function bar() { test1(); }
}
$lambda = function() { sleep(1); };
test();
for($i=0;$i<5;$i++){ test1(); }
$lambda();
$foo = new Foo();
$foo->bar();
?>
    </body>
</html>
<?php
// next code can be append to PHP scripts in dev mode
// buffering forp stack
$dump = forp_dump();

// giving stack to GUI Manager and render
include_once "forp/ForpGUI.php";
$gui = new ForpGUI(new ForpHTMLPrinter());
$gui->setStack($dump);
$gui->render();
