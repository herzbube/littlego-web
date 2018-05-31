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

// ----------------------------------------------------------------------
// Web server configuration
// ----------------------------------------------------------------------

// Specify the URL base path that matches the location from where you want
// browsers to access the application. The default assumes that the
// application has its own virtual host. The default also works, for instance,
// if you use the PHP built-in web server in a dev or test environment.
// $config->urlBasePath = "/";

// ----------------------------------------------------------------------
// Session configuration
// ----------------------------------------------------------------------
// Specify the number of seconds that a persistent session should be valid.
// Validity is checked on every request, and renewed on success.
// $config->sessionValidityDuration = 86400 * 30;

// ----------------------------------------------------------------------
// App configuration
// ----------------------------------------------------------------------

// Specify how many highscore entries should be displayed on the
// "highscores" tab.
// $config->highscoreLimit = 10;

// ----------------------------------------------------------------------
// PHPMailer configuration
// ----------------------------------------------------------------------

// Specify the settings to use for sending mails via PHPMailer. Usually you
// will want to specify at least the SMTP server, a username and a password.
// Typically you also need to specify a valid from address that matches your
// SMTP login.
//
// Note: The settings are passed directly to PHPMailer, so refer to
// PHPMailer's documentation if you are unsure what to specify here.

// $config->phpMailerHost = "smtp1.example.com;smtp2.example.com";     // Specify main and backup SMTP servers
// $config->phpMailerSMTPAuth = true;                                  // Enable SMTP authentication
// $config->phpMailerUsername = "user@example.com";                    // SMTP username
// $config->phpMailerPassword = "secret";                              // SMTP password
// $config->phpMailerSMTPSecure = "tls";                               // Enable TLS encryption, "ssl" also accepted
// $config->phpMailerPort = 25;                                        // TCP port to connect to
// $config->phpMailerFromAddress = "noreply@example.com";              // Specify sender address
// $config->phpMailerFromName = "Do not reply to this e-mail (Little Go for Web Mailer)";     // Specify sender name
// $config->phpMailerReplyToAddress = "noreply@example.com";           // Specify reply-to address
// $config->phpMailerReplyToName = "Do not reply to this e-mail (Little Go for Web Mailer)";  // Specify reply-to name
// $config->phpMailerSubject = "Little Go for Web highscores";         // Specify email subject line
// $config->phpMailerSMTPDebug = 0;                                    // Debug output verbosity level 0-4 (0 = no output)

// ----------------------------------------------------------------------
// Debugging/development configuration
// ----------------------------------------------------------------------

// A value in milliseconds. If >0 the WebSocket server artificially delays
// sending every message by waiting the specified amount of time before it
// actually sends the message. The delay is useful for testing the
// client/server interaction when communication between the two is not
// instantaneous. The delay can be used simply to simulate a slow network
// connection, or to add an artifical bottleneck on the server side (e.g.
// if the WebSocket server has to process too many messages, or the server
// machine is generally under heavy load).
// $config->webSocketMessageSendDelayInMilliseconds = 0;

// A value in milliseconds. If >0 the WebSocket client artificially delays
// receiving every message by waiting the specified amount of time after it
// receives the message before it actually notifies listeners. This
// configuration option serves a very similar purpose as the configuration
// option webSocketMessageSendDelayInMilliseconds (see description above),
// but with this option you can add a bottleneck on the client side. This
// may or may not be
// $config->webSocketMessageReceiveDelayInMilliseconds = 0;

?>
