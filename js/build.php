<?php

    require 'ext/jsmin/jsmin.php';
    require 'ext/cssmin/src/CssMin.php';
    
    $target = fopen('forp.min.js', 'w+');
    fwrite(
        $target,
        str_replace(
            '%forp.css%', 
            CssMin::minify(file_get_contents('src/forp/forp.css')), 
            JSMin::minify(file_get_contents('src/forp/forp.js'))
        )
    );
    fclose($target);