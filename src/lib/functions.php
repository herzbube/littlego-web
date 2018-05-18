<?php
declare(strict_types=1);

namespace LittleGoWeb
{
    // Must appear outside of any function definition so that we can
    // use the class Config to declare parameter and return types in
    // function definitions.
    require_once(dirname(__FILE__) . "/config_defaults.php");

    // ----------------------------------------------------------------------
    // Sets up everything required to run the application. This includes - but
    // is not limited to - loading and processing the config file.
    //
    // Returns the Config object.
    // ----------------------------------------------------------------------
    function startupApplication() : Config
    {
        define('CONFIG_DIR', dirname(__FILE__) . "/../config");

        # Set up configuration defaults by constructing a Config object that
        # contains the defaults as hard-coded values.
        # The variable MUST be named "$config" - the user configuration works
        # on that assumption.
        $config = new Config();

        // User configuration overrides the defaults by changing property
        // values in the Config object. The user configuration expects that
        // a variable named "$config" exists which references the Config
        // object.
        require_once(CONFIG_DIR . '/config.php');

        return $config;
    }

    // ----------------------------------------------------------------------
    // Prints the initial login form.
    //
    // You typically obtain the Config object parameter by executing the
    // function startupApplication().
    //
    // TODO: Add session handling. Don't print the login form if the user is
    // already logged in.
    // ----------------------------------------------------------------------
    function printLoginForm(Config $config) : void
    {
        $output = <<<"ENDOFOUTPUT"
<!DOCTYPE html>
<html lang="en" ng-app="lg4wApp">
<head>
    <meta charset="UTF-8"/>
    <!-- As recommended by Bootstrap -->
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <!-- App-specific CSS -->
    <link rel="stylesheet" href="css/littlego-web.css" />

    <!-- jQuery, as required by Bootstrap (but we also use it ourselves) -->
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <!-- Popper, as required by Bootstrap -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <!-- Bootstrap JS -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>

    <!-- Minimal dynamic JS of our own, to establish server connection -->
    <script>
      var webSocketConfig = {
          hostname : "$config->webSocketHost",
          port : "$config->webSocketPort"
      };
    </script>

    <!-- Raphaël library for drawing with SVG -->
    <script src="js/raphael-2.2.1.min.js"></script>

    <!-- AngularJS -->
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-route.js"></script>

    <!-- Library scripts -->
    <script src="js/littlego-web-constants.js"></script>
    <script src="js/littlego-web-functions.js"></script>
    <script src="js/littlego-web-data-generator.js"></script>
    <script src="js/littlego-web-viewmodel.js"></script>
    <script src="js/littlego-web-session.js"></script>
    <script src="js/littlego-web-go.js"></script>
    <script src="js/littlego-web-drawing.js"></script>
    <script src="js/littlego-web-board.js"></script>

    <!-- Main script that starts the application -->
    <script src="js/littlego-web.js"></script>
    <script src="js/lg4w-main.js"></script>

    <!-- AngularJS services, directives and controllers -->
    <script src="js/lg4w-websocket-service.js"></script>
    <script src="js/lg4w-session-service.js"></script>
    <script src="js/lg4w-login-form.js"></script>
    <script src="js/lg4w-registration-form.js"></script>
    <script src="js/lg4w-navigation.js"></script>
    <script src="js/lg4w-logout.js"></script>
    <script src="js/lg4w-games-in-progress.js"></script>
    <script src="js/lg4w-finished-games.js"></script>

    <!--
        TODO: The PHP script that serves this page should read all local
        JS files, paste them together and serve everything as one huge
        inline script.
    -->

    <title>Little Go for the web</title>
    <!-- Required for HTML5 mode of AngularJS' locationProvider -->    
    <base href="/">
</head>
<body ng-controller="lg4wMainController">
    <lg4w-navigation ng-show="isNavigationShown()"></lg4w-navigation>
    <ng-view ng-show="isApplicationContentShown()"></ng-view>
    <lg4w-modals></lg4w-modals>
</body>
</html>
ENDOFOUTPUT;

        echo $output;
    }

    // ----------------------------------------------------------------------
    // Starts the Ratchet web socket server.
    //
    // You typically obtain the Config object parameter by executing the
    // function startupApplication().
    //
    // Notes:
    // - An autoloader must be in place before this function is called.
    // - This is a blocking function never returns control to the caller.
    // ----------------------------------------------------------------------
    function startWebSocketServer(Config $config) : void
    {
        $server = \Ratchet\Server\IoServer::factory(
            new \Ratchet\Http\HttpServer(
                new \Ratchet\WebSocket\WsServer(
                    new \LittleGoWeb\WebSocketServer($config)
                )
            ),
            $config->webSocketPort
        );

        $server->run();
    }
}
