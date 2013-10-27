<?php
// Starting forp
($forpIsLoaded = extension_loaded("forp"))
    && define('FORP_UI_SRC', '../../../src/built/forp.min.js')
    && forp_start();

if(strpos($_SERVER['HTTP_ACCEPT'], 'json')) {
    var_dump("XHR result");
} else {
?>
<html>
    <head>
    <script type="text/javascript">
        <!--
        function ajax(callback) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
                    callback(xhr.responseText);
                }
            };
            xhr.open("GET", "index.php", true);
            xhr.setRequestHeader("Accept","application/json");
            xhr.send(null);
        }

        function xhrCallback(data) {
            document.getElementById("output").innerHTML = data;
        }
        //-->
    </script>
    </head>
    <body style="text-align:center">
        <div id="output">
        <?php
        var_dump("Hello world!");
        ?>
        </div>
        <button onclick="ajax(xhrCallback);">Test Chrome XHR</button>
    </body>
</html>
<?php
}

// Ending forp
if($forpIsLoaded) {
    forp_end();
    include dirname(__FILE__) . "/vendor/forp/forp/Forp.php";
    $forpResponse = new forp\Response();
    $forpResponse->send();
}