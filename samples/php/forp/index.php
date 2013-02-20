<?php
register_shutdown_function(
    function() {
        // next code can be append to PHP scripts in dev mode
        ?>
        <script src="../../../js/forp.min.js"></script>
        <script>
        (function(f) {
            f.find(".forp")
             .forp({
                stack : <?php echo json_encode(forp_dump()); ?>,
                //mode : "fixed"
             });
        })(forp);
        </script>
        <?php
    }
);

// start forp
forp_start();

// our PHP script to profile
include('common.php');

// stop forp
forp_end();