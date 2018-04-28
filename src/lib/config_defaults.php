<?php
declare(strict_types=1);

namespace LittleGoWeb
{
    require_once(dirname(__FILE__) . "/constants.php");

    class Config
    {
        // Database server configuration
        public $pdoDriverName = PDO_DRIVER_NAME_DEFAULT;
        public $pdoConnectionString = PDO_CONNECTION_STRING_DEFAULT;
        public $dbUsername = DB_USER_NAME_DEFAULT;
        public $dbPassword = DB_PASSWORD_DEFAULT;
        public $dbName = DB_DATABASE_NAME_DEFAULT;

        // WebSocket server configuration
        public $webSocketHost = WEBSOCKET_HOST_DEFAULT;
        public $webSocketPort = WEBSOCKET_PORT_DEFAULT;

        // Session configuration
        public $sessionValidityDuration = SESSION_VALIDITIY_DURATION_DEFAULT;
    }
}

?>