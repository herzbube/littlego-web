<?php
declare(strict_types=1);

namespace LittleGoWeb
{
    require_once(dirname(__FILE__) . "/constants.php");

    class Config
    {
        public $webSocketHost = WEBSOCKET_HOST_DEFAULT;
        public $webSocketPort = WEBSOCKET_PORT_DEFAULT;
    }
}

?>