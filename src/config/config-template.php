<?php
declare(strict_types=1);

// ----------------------------------------------------------------------
// Notes:
// - When this script is run it can expect that a configuration object
//   is present in the $config variable.
// - You don't need to explicitly configure everything. Only configure
//   those options where you are not happy with the default values.
// - To override a default value, simply uncomment the relevant line
//   and set your own value.
// ----------------------------------------------------------------------


// ----------------------------------------------------------------------
// Database server configuration
// ----------------------------------------------------------------------

// Specify a different driver if you don't want the default MySQL
// $config->pdoDriverName = "mysql";

// Specify a suitable connection string to establish the connection to your
// database server, either via TCP/IP or via socket. The default is
// TCP/IP.
// $config->pdoConnectionString = "host=127.0.0.1; port=3306";
// $config->pdoConnectionString = "unix_socket=/path/to/socket";

// Specify the credentials to log in to your database. The default is
// root and an empty password. Usually you will want to specify at least
// a password.
// $config->dbUsername = "root";
// $config->dbPassword = "secret";

// Specify the name of the database if it differs from the default "tictactoe".
// $config->dbName = "littlego-web";

// ----------------------------------------------------------------------
// WebSocket server configuration
// ----------------------------------------------------------------------
// $config->webSocketHost = "localhost";
// $config->webSocketPort = "8001";

?>
