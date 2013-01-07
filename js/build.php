<?php
require 'ext/jsmin/jsmin.php';
require 'ext/cssmin/src/CssMin.php';

$target = fopen(dirname(__FILE__) . '/forp.min.js', 'w+');
try {
    fwrite(
        $target,
        str_replace(
            '%forp.css%',
            CssMin::minify(file_get_contents(dirname(__FILE__) . '/src/forp/forp.css')),
            JSMin::minify(
                file_get_contents(dirname(__FILE__) . '/src/forp/forp.js')
            )
        )
    );
} catch(Exception $ex ) {
    echo "Fatal error : " . $ex->getMessage() . "\n\n";
    echo $ex->getTraceAsString();

}
fclose($target);