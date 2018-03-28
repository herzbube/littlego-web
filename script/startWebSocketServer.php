<?php
declare(strict_types=1);

namespace LittleGoWeb
{
    // Required so that the Ratchet classes are automatically loaded on demand.
    require_once(dirname(__FILE__) . "/../vendor/autoload.php");

    define("LIB_DIR", dirname(__FILE__) . "/../src/lib");
    require_once(LIB_DIR . "/functions.php");

    $config = startupApplication();
    startWebSocketServer($config);
}

