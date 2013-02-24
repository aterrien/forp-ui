<?php
/**
 * forp-ui builder
 */
require 'ext/jsmin/jsmin.php';
require 'ext/cssmin/src/CssMin.php';

// Default opts
$skin = 'gstyle';
$nomin = false;

$opts = array(
    'skin' => array(
        's:', 'skin:'
    ),
    'nomin' => array(
        'n', 'nomin'
    )
);

$shortOpts = '';
$longOpts = array();
foreach($opts as $opt) {
    $shortOpts .= $opt[0];
    $longOpts[] = $opt[1];
}
$options = getopt($shortOpts, $longOpts);
foreach($options as $k=>$v) {
    switch($k) {
        case 's' : case 'skin' :
            $skin = $v;
            break;
        case 'n' : case 'nomin' :
            $nomin = true;
            break;
        default :
            $skin = 'gstyle';
            $nomin = false;
    }
}

// Files
$files = array(
    'js' => array(
        'forp',
        'dom',
        'main',
        'grader',
        'ui',
        'stack'
    ),
    'css' => array(
        'default',
        $skin
    )
);


$target = fopen(dirname(__FILE__) . '/forp.min.js', 'w+');
try {
    $js = $css = '';

    foreach($files['js'] as $file) {
        $js .= file_get_contents(dirname(__FILE__) . '/src/forp/' . $file . '.js');
    }

    foreach($files['css'] as $file) {
        $css .= file_get_contents(dirname(__FILE__) . '/src/forp/css/' . $file . '.css');
    }

    // Inject CSS
    fwrite(
        $target,
        str_replace(
            '%forp.css%',
            CssMin::minify($css),
            '/** forp-ui (c) 2013 Anthony Terrien **/' .
            ($nomin ? $js : JSMin::minify($js))
        )
    );
} catch(Exception $ex ) {
    echo "Fatal error : " . $ex->getMessage() . "\n\n";
    echo $ex->getTraceAsString();

}
fclose($target);