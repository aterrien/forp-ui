<?php
register_shutdown_function(
    function() {
        // next code can be append to PHP scripts in dev mode
        ?>
        <script src="../../../js/forp.min.js"></script>
        <script>
        (function(f) {
            f.find(".forp")
             .each(
                function(el) {
                    el.css('margin:50px;height:300px;border:1px solid #333');
                }
             )
             .forp({
                stack : <?php echo json_encode(forp_dump()); ?>,
                //mode : "fixed"
             })
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