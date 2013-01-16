<?php
/**
 * TODO LZW-compress
 */
register_shutdown_function(
    function() {
        // next code can be append to PHP scripts in dev mode

        // buffering forp stack as JSON
        $jsonDump = json_encode(forp_dump());

        // If header X-Forp-Version detected then
        // forp client is a Chrome extension and
        // we send encoded stack in a scrip tag
        // or in headers.
        //
        // We can't only send it in headers
        // because of the Chrome limitations :
        //  total headers size < 256Kb
        //  each header < 10Kb
        if(isset($_SERVER['HTTP_X_FORP_VERSION'])) {
            $encodedStack = base64_encode(utf8_encode($jsonDump));
            if(strpos(strtolower($_SERVER['HTTP_ACCEPT']), 'json')) {

                /*$getHeader = function($bytes=300000) {
                    $headerValue = "";
                    for($i=0;$i<$bytes;$i++) {
                        $headerValue .= "1";
                    }
                    return $headerValue;
                };*/

                /*$setHeader = function($k, $v) {
                    header($k . ":" . $v);
                };*/

                /*$parts = explode("\n", chunk_split($msg = $getHeader((256 * 1000)), 5000, "\n"));
                foreach($parts as $i=>$part) {
                    header("X-Forp-Stack_" . $i . ":" . $part);
                    if ($i > 99999) {
                        throw Exception('Maximum number (99,999) of messages reached!');
                    }
                }*/
                header("Content-Type: application/json");
                $parts = explode("\n", chunk_split($encodedStack, 5000, "\n"));
                foreach($parts as $i=>$part) {
                    header("X-Forp-Stack_" . $i . ":" . $part);
                    if ($i > 99999) {
                        throw Exception('Can\t exceed 99 999 chunks.');
                    }
                }
            } else {
                // application/x-forp-stack
                echo "<script type='application/x-forp-stack' id=forpStack>$encodedStack</script>";
            }
        } else {
            // no extension then displays forpgui in page footer
            ?>
            <link rel="stylesheet" type="text/css" href="js/src/forp/forp.css">
            <script src="js/src/forp/forp.js"></script>
            <script>
                (new forp.Controller())
                    .setStack(<?php echo $jsonDump; ?>)
                    .runOnReady();
            </script>
            <?php
        }

    }
);


// start forp profiler
forp_start();

// our PHP script to profile
include('common.php');