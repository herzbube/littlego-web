<?php
declare(strict_types=1);

namespace LittleGoWeb
{
    define("LIB_DIR", dirname(__FILE__) . "/../lib");

    require_once(LIB_DIR . "/functions.php");

    $config = startupApplication();
    printLoginForm($config);
}
