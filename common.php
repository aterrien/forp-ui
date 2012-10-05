<!doctype html>
<html>
    <head>
        <style>
            body {margin : 0px}
        </style>
    </head>
    <body>
<?php
// this is our basic test
//
// internal functions
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
        Quam quidem partem accusationis admiratus sum et';
mysql_query("SELECT * FROM world WHERE 1=1;");

// user function
function test(){ echo 'Hello world !'; };
// user function that call another one
function test1(){test();};
// user class
class Foo {
    function bar() { test1(); }
}
// closure
$lambda = function() { sleep(1); };
//
// calls
test();
for($i=0;$i<5;$i++){ test1(); }
$lambda();
$foo = new Foo();
$foo->bar();
?>
    </body>
</html>