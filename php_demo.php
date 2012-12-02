<?php
// first thing to do = enable forp profiler
forp_enable();

// our PHP script to profile
include('common.php');

// next code can be append to PHP scripts in dev mode
// buffering forp stack
$dump = forp_dump();

// giving stack to GUI Manager and render
include_once "php/forp/ForpGUI.php";
$gui = new ForpGUI(new ForpHTMLPrinter());
$gui->setStack($dump);
$gui->render();