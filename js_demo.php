<?php
// first thing to do = enable forp profiler
forp_enable();

// our PHP script to profile
include('common.php');

// next code can be append to PHP scripts in dev mode
// buffering forp stack
$json_dump = json_encode(forp_dump());
?>
<script src="js/src/forp/forp.js"></script>
<script>
    forp.stack = <?php echo $json_dump; ?>
</script>