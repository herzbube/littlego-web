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
        // Why do we need a base path? The problem is that in the initial
        // request that causes this function to execute the user can
        // specify any URL path she likes.
        //
        // Some examples:
        //
        //   /login          Legal. Shows login form if not logged in, redirects to /gamesinprogress if logged in.
        //   /gamerequests   Legal. Retrieves game requests if logged in, redirects to /login if not logged in.
        //   /board/42       Legal. Shows board for game with ID 42 if logged in, redirects to /login if not logged in.
        //   /               Legal. Redirects to /login if not logged in, redirects to /gamesinprogress if logged in.
        //   /board          Illegal. Redirects to /login if not logged in, redirects to /gamesinprogress if logged in.
        //   /board/         Illegal. Ditto.
        //   /foo            Illegal. Ditto.
        //   /foo/bar/baz    Illegal. Ditto.
        //
        // More important here than the distinction between legal and illegal
        // paths is the fact that the user can specify URL paths of any depth.
        // If the document is output with "script" and "link" elements that use
        // a relative path then the browser will try to load those scripts and
        // CSS stylesheets  relative to the URL path specified by the user. For
        // instance, if the document is output with "js/lg4w-main.js" then the
        // browser tries to load that script from these URLs (taken from the
        // example list above):
        //
        //   /login         /js/lg4-main.js
        //   /board/42      /board/js/lg4-main.js
        //   /foo/bar/baz   /foo/bar/js/lg4-main.js
        //
        // This does not work, of course. If we have a full-featured web server
        // we can try to mitigate some of the issues (notably illegal paths) by
        // redirecting the browser or rewriting the URL. These measures take
        // effect before this function is executed, so we don't have to deal
        // with the cases handled there. The remaining issues are with legal
        // paths of varying depth, specifically
        //
        //   /login         Path with depth 1
        //   /board/42      Path with depth 2
        //
        // This function could try to recognize the initial path depth and
        // output the document with relative links amended accordingly.
        // Examples:
        //
        //   /login         js/lg4-main.js
        //   /board/42      ../js/lg4-main.js
        //
        // This is much too complicated, though. Instead we want to output
        // absolute paths. To achieve this we need an absolute base path,
        // and we delegate the responsibility to specify that path to the
        // configuration level and the server admin.

        $urlBasePath = $config->urlBasePath;
        $urlBasePath = preg_replace("/\/$/", "", $urlBasePath);

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
    <link rel="stylesheet" href="${urlBasePath}/css/littlego-web.css" />

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
          port : $config->webSocketPort,
          messageReceiveDelayInMilliseconds: $config->webSocketMessageReceiveDelayInMilliseconds
      };

      var urlBasePath = "$urlBasePath";
    </script>

    <!-- Raphaël library for drawing with SVG -->
    <script src="${urlBasePath}/js/raphael-2.2.1.min.js"></script>

    <!-- AngularJS -->
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-route.js"></script>

    <!-- Library scripts -->
    <script src="${urlBasePath}/js/littlego-web-constants.js"></script>
    <script src="${urlBasePath}/js/littlego-web-functions.js"></script>
    <script src="${urlBasePath}/js/littlego-web-data-generator.js"></script>
    <script src="${urlBasePath}/js/littlego-web-viewmodel.js"></script>
    <script src="${urlBasePath}/js/littlego-web-go.js"></script>

    <!-- Main script that starts the application -->
    <script src="${urlBasePath}/js/lg4w-main.js"></script>

    <!-- AngularJS services, directives and controllers -->
    <script src="${urlBasePath}/js/lg4w-websocket-service.js"></script>
    <script src="${urlBasePath}/js/lg4w-session-service.js"></script>
    <script src="${urlBasePath}/js/lg4w-error-handling-service.js"></script>
    <script src="${urlBasePath}/js/lg4w-login-form.js"></script>
    <script src="${urlBasePath}/js/lg4w-registration-form.js"></script>
    <script src="${urlBasePath}/js/lg4w-navigation.js"></script>
    <script src="${urlBasePath}/js/lg4w-logout.js"></script>
    <script src="${urlBasePath}/js/lg4w-game-requests.js"></script>
    <script src="${urlBasePath}/js/lg4w-games-in-progress.js"></script>
    <script src="${urlBasePath}/js/lg4w-finished-games.js"></script>
    <script src="${urlBasePath}/js/lg4w-new-game-request.js"></script>
    <script src="${urlBasePath}/js/lg4w-confirm-game-request-pairing.js"></script>
    <script src="${urlBasePath}/js/lg4w-board.js"></script>
    <script src="${urlBasePath}/js/lg4w-drawing-library.js"></script>
    <script src="${urlBasePath}/js/lg4w-drawing-service.js"></script>

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
