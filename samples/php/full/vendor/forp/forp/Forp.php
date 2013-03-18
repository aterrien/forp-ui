<?php
namespace forp;

!defined('FORP_UI_SRC') && define('FORP_UI_SRC', 'js/forp.min.js');

/**
 * Exception
 */
class Exception extends \Exception {}

/**
 * Response
 */
class Response
{
    /**
     * @var array $conf
     */
    private $conf = array('async'=>false);

    /**
     * @param type $opts
     * @return \forp\Response
     */
    public function setConf($opts)
    {
        $this->conf = array_merge($this->conf, $opts);
        return $this;
    }

    /**
     * @return \forp\ResponseCli|\forp\ResponseHttpHeaders|\forp\ResponseInlineXForpStack|\forp\ResponseInlineAsync|\forp\ResponseInline
     */
    public function getResponse()
    {
        if(php_sapi_name() === "cli") {
            return new ResponseCli();
        }

        // priority to send forp datas in HTTP headers
        // forp client is a browser extension
        if(isset($_SERVER)
           && isset($_SERVER['HTTP_X_FORP_VERSION'])
        ) {
            if(!empty($_SERVER['HTTP_ACCEPT'])
               && strpos(strtolower($_SERVER['HTTP_ACCEPT']), 'json')
            ) {
                // send forp datas in HTTP headers
                // XHR communication case
                return new ResponseHttpHeaders();
            } else {
                // headers size limitation on Chrome
                return new ResponseInlineXForpStack();
            }
        }

        // asynchrone JavaScript loading + inline JavaScript
        if($this->conf['async']) {
            return new ResponseInlineAsync();
        }

        // JavaScript loading + inline JavaScript
        return new ResponseInline();
    }

    /**
     * @return \forp\Response
     */
    public function send()
    {
        $this->getResponse()
             ->send(forp_dump());

        return $this;
    }
}

/**
 * IResponse
 */
interface IResponse
{
    public function send(array $datas);
}

/**
 * ResponseCli
 */
class ResponseCli
implements IResponse
{
    /**
     * @param array $datas
     */
    public function send(array $datas)
    {
        forp_print();
    }
}

/**
 * ResponseInline
 */
class ResponseInline
implements IResponse
{
    /**
     * @param array $datas
     */
    public function send(array $datas)
    {
        ?>
        <div class="forp"></div>
        <script src="<?php echo FORP_UI_SRC; ?>"></script>
        <script>
            (function(f) {
               f.find(".forp")
                .forp({
                    stack : <?php echo json_encode($datas); ?>,
                    mode : "fixed"
                })
            })(forp);
        </script>
        <?php
    }
}

/**
 * ResponseInlineAsync
 */
class ResponseInlineAsync
implements IResponse
{
    /**
     * @param array $datas
     */
    public function send(array $datas)
    {
        ?>
<i/>
<div class="forp"></div>
<script type="text/javascript">
    var _forpguiStack = <?php echo json_encode($datas); ?>,
        _forpguiSrc = "<?php echo FORP_UI_SRC;?>";
</script>
<script type="text/javascript">
(function() {
    var fg = document.createElement('script');
    fg.type = 'text/javascript';
    fg.async = true;
    fg.src = _forpguiSrc;
    fg.onload = (function(f) {
       f.find(".forp")
        .forp({
            stack : _forpguiStack,
            mode : "fixed"
        })
    })(forp);
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(fg);
})();
</script>
        <?php
    }
}

/**
 * ResponseInlineXForpStack
 */
class ResponseInlineXForpStack
implements IResponse
{
    /**
     * @param array $datas
     */
    public function send(array $datas)
    {
        echo    "<i/>
<script type='application/x-forp-stack' id=forpStack>" .
json_encode($datas) .
"</script>";
    }
}

/**
 * ResponseHttpHeaders
 */
class ResponseHttpHeaders
implements IResponse
{
    /**
     * @param array $datas
     * @throws \Exception
     */
    public function send(array $datas)
    {
        $parts = explode(
            "\n",
            chunk_split(json_encode($datas), 5000, "\n")
        );
        foreach($parts as $i=>$part) {
            header("X-Forp-Stack_" . $i . ":" . $part);
            if ($i > 99999) {
                throw new \Exception('Can\t exceed 99999 chunks.');
            }
        }
    }
}