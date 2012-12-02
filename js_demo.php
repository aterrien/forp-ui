<?php
// first thing to do = enable forp profiler
forp_enable();

// our PHP script to profile
include('common.php');

register_shutdown_function(
    function() {
        // next code can be append to PHP scripts in dev mode
        // buffering forp stack
        $json_dump = json_encode($dump = forp_dump());
        echo 'Stack size : ' . count($dump) . ' entries<br>';
        //var_dump($dump);

        //echo '<pre>';
        //forp_print();
        //echo '</pre>';
        ?>
        <script src="js/src/forp/forp.js"></script>
        <script>
            forp.stack = <?php echo $json_dump; ?>;
        </script>
        <?php
    }
);