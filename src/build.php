<?php
/**
 * forp-ui builder
 */
require 'tools/jsmin/jsmin.php';
require 'tools/cssmin/src/CssMin.php';

// Default opts
$skin = 'consolas'; //dark theme
//$skin = 'gstyle'; //light theme
$nomin = 1;//false;

$opts = array(
    'skin' => array(
        's:', 'skin:'
    ),
    'nomin' => array(
        'n', 'nomin'
    )
   );
$php_var = array(
    '@PHP-VAR-topCalls@' => 20,
    '@PHP-VAR-topMemory@' => 20,
    '@PHP-VAR-topCpu@' => 20,
    '@PHP-VAR-maxStack@' => 30000 /*the max number of elements in the forp stack that forp ui will allow before displaying an error.*/
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
        'js/submodules/jmicro/jmicro', //'dom',
        'js/main',
        'js/lib/view/utils',

        // Contoller
        'js/lib/controller/controller',

        // Datas
        'js/lib/model/stack',

        // Helpers
        'js/lib/helpers/grader',
        'js/lib/helpers/tagrandcolor',

        // UI
        'js/lib/view/control/togglebutton',
        'js/lib/view/indicator/graph',
        'js/lib/view/indicator/gauge',
        'js/lib/view/indicator/barchart',
        'js/lib/view/indicator/histogram',
        'js/lib/view/layout/layout',
        'js/lib/view/layout/mainpanel',
        'js/lib/view/layout/console',
        'js/lib/view/layout/sidebar',
        'js/lib/view/stack/backtrace',
        'js/lib/view/stack/tree',

        // Plugins
        'js/plugins/inspector',
        'js/plugins/metrics',
        'js/plugins/stack',
        'js/plugins/duration',
        'js/plugins/memory',
        'js/plugins/calls',
        'js/plugins/groups',
        'js/plugins/files',
        'js/plugins/searchengine',
    ),
    'css' => array(
        'css/default',
        'css/' . $skin
    )
);


$path = dirname(__FILE__) . '/built/forp.min.js';
$target = fopen($path, 'w+');
try {
    $js = $css = '';

    foreach($files['js'] as $file) {
        $js .= file_get_contents(dirname(__FILE__) . '/' . $file . '.js');
    }

    foreach($files['css'] as $file) {
        $css .= file_get_contents(dirname(__FILE__) . '/' . $file . '.css');
    }

    $js = str_replace(array_keys($php_var), array_values($php_var), $js );
    $css = str_replace(array_keys($php_var), array_values($php_var), $css );

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

    echo "File " . $path . " built\n";
} catch(Exception $ex ) {
    echo "Fatal error : " . $ex->getMessage() . "\n\n";
    echo $ex->getTraceAsString();

}
fclose($target);
