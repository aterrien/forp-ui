<!doctype html>
<html>
    <head>
        <style>
            body {margin : 0px}
        </style>
    </head>
    <body>
        <div class="forp"></div>
<?php
// This is a basic demo
//
// internal function
echo   'Nisi mihi Phaedrum, inquam, tu mentitum aut
        Post hanc adclinis Libano monti Phoenice, regio
        Ut enim quisque sibi plurimum confidit et ut
        Ob haec et huius modi multa, quae cernebantur in
        Haec igitur Epicuri non probo, inquam. De cetero
        Illud tamen te esse admonitum volo, primum ut
        Circa hos dies Lollianus primae lanuginis
        Illud tamen te esse admonitum volo, primum ut
        Hac ex causa conlaticia stipe Valerius humatur
        Quibus occurrere bene pertinax miles explicatis
        Iam virtutem ex consuetudine vitae sermonisque
        Incenderat autem audaces usque ad insaniam homines
        Quare talis improborum consensio non modo
        Novo denique perniciosoque exemplo idem Gallus
        Nihil est enim virtute amabilius, nihil quod magis
        Quod si rectum statuerimus vel concedere amicis,
        Quid enim tam absurdum quam delectari multis
        Illud autem non dubitatur quod cum esset aliquando
        Etenim si attendere diligenter, existimare vere de
        Quam quidem partem accusationis admiratus sum et ...<br>';

/**
 * @ProfileGroup("Test")
 * @ProfileCaption("Hello #1 !")
 */
function test($i = 0){ echo 'User function with "Hello ' . $i . ' !" profile caption.<br>'; };
/**
 * @ProfileGroup("Foo Group")
 * @ProfileCaption("User function that calls another one")
 */
function test1(){test();};
// user class
class Foo {

    public $myintvar = 27;

    public $mystringvar = "test";

    /**
     * @ProfileGroup("Foo","data")
     * @ProfileCaption("Caption of bar.")
     */
    function bar() { test1(); }

    /**
     * @ProfileGroup("Foo Group")
     * @ProfileCaption("Caption of bar2 #1 #2.")
     */
    function bar2($lambda, $object) { return test1(); }
}
// closure
$lambda =
/**
 * @ProfileGroup("Foo group")
 * @ProfileCaption("Closure")
 * @ProfileHighlight("1")
 * @ProfileAlias("HighlightTestClosure")
 */
function() {
    echo 'User function with "Foo group" group, HighlightTestClosure" alias, "Closure" caption and highlight.<br>';
    test();
};

// calls
for($i = 0; $i<5000; $i++) {
    test($i);
}
for($i=0;$i<5;$i++){ test1(); }
$lambda();
$lambda();
$foo = new Foo();
//sleep(1);
$foo->bar();
$foo->bar2($lambda, $foo);

// inspect
forp_inspect('foo', $foo);

// alloc, dealloc
/**
 * @ProfileAlias("Alloc")
 */
$alloc = function(){
    $stdObject = new stdClass();
    $stdObject->arr = array();
    for($i = 0; $i<100; $i++) {
        $stdObject->arr[$i] = "test";
    }
    return $stdObject;
};
/**
 * @ProfileAlias("test alloc")
 */
$allocTest = function(){
    global $alloc;
    $o = $alloc();
    //$o = null;
    //gc_collect_cycles();
};
$allocTest();

// fibo
$br = (php_sapi_name() == "cli")? "\n":"<br>\n";

/**
 * @ProfileGroup("Fibo Group")
 * @ProfileCaption("Caption of fibo, value #1 #1 #1 #1")
 * @param type $x
 * @return int
 */
function fibo( $x ) {
    if ( $x < 2) {
        return 1;
    } else {
        return fibo($x - 1) + fibo($x - 2);
    }
}

for( $i = 1; $i < 10; $i++) {
    printf(
        'fibo(%1$s) = %2$s'.$br,
        $i, fibo($i)
    );
}
?>
    </body>
</html>