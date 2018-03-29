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
<html lang="en">
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
    <!-- jQuery, as required by Bootstrap -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <!-- Bootstrap JS -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
    <!-- Minimal dynamic JS of our own, to establish server connection -->
    <script>
      var websocketConfig = {
          "hostname" : "$config->webSocketHost",
          "port" : "$config->webSocketPort"
      };
    </script>
    <!-- Main application JS -->
    <script src="js/littlego-web.js"></script>
    <!-- TODO: Add more scripts, e.g. Go class library -->
    <script src="js/littlego-web-session.js"></script>

    <title>Little Go for the web</title>
</head>
<body>
    <div id="container-login-form" class="container-fluid">
        <div class="row justify-content-center">
            <form id="login-form">
                <h1>Little Go for the web</h1>
                <div class="form-group">
                    <label for="email-address">Email address:</label>
                    <input id="email-address" class="form-control" name="email-address" type="email" placeholder="Enter your email address" required/>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input id="password" class="form-control" name="password" type="password" placeholder="Enter your password" required/>
                </div>
                <div class="form-group">
                    <button id="login-button" class="btn btn-primary">Login</button>
                    <!-- TODO: Remove when form is implemented -->
                    <p><small>DEV MODE: This login form currently does nothing. Enter any values you like.</small></p>
                </div>
            </form>
        </div>
    </div>

    <div id="container-main-app">
        <!--
            Navigation is expanded in medium and larger breakpoints. Also important:
            Toggler requires a color scheme class, otherwise it's not shown.
        -->
        <nav class="navbar navbar-expand-md navbar-dark bg-dark">
            <span class="navbar-brand">Little Go for the web</span>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar-items" aria-controls="navbar-items" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div id="navbar-items" class="collapse navbar-collapse nav-pills justify-content-end">
                <div class="navbar-nav">
                    <!-- No clunky list element necessary in Bootstrap -->
                    <a class="nav-item nav-link" href="#">Game requests</a>
                    <a class="nav-item nav-link active" href="#">Games in progress</a>
                    <a class="nav-item nav-link" href="#">Finished games</a>
                    <a id="logout-button" class="nav-item nav-link" href="#">Logout</a>
                </div>
            </div>
        </nav>
        <div class="container-fluid">
            <div class="row">
                <!--
                    On xs and md we use all 12 columns, i.e. the entire width,
                    because the board and the right-hand-side elements are
                    vertically stacked (in this case "right-hand-side" is a
                    misnomer). On md, lg and xl we use only 8 columns because
                    the board must share the available horizontal space with
                    the right-hand-side elements.
                -->
                <div id="left-hand-side" class="col-12 col-md-8">
                    <div id="container-board">
                        <canvas id="board" class="placeholder" />
                    </div>
                </div>
                <!--
                    The next div causes a line break when it is in effect.
                    d-md-none hides the div on md, lg and xl, which means
                    that on those breakpoints it has no effect - the board
                    and the right-hand-side elements therefore co-exist on the
                    same row without line break. Conversely, the div takes
                    effect on xs and sm - the board and the right-hand-side
                    elements therefore are vertically stacked (in this case
                    "right-hand-side" is a misnomer).
                -->
                <div class="w-100 d-md-none"></div>
                <!--
                    On xs and md we use all 12 columns, i.e. the entire width,
                    because the board and the right-hand-side elements are
                    vertically stacked (in this case "right-hand-side" is a
                    misnomer). On md, lg and xl we use only 4 columns because
                    the right-hand-side elements must share the available
                    horizontal space with the board.
                -->
                <div id="right-hand-side" class="col-12 col-md-4">
                    <div class="row">
                        <!--
                            Regardless of how much horizontal space the
                            right-hand-side elements take up, we distribute
                            that space evenly among the black and white
                            player information areas - both get 6 out of 12
                            columns.
                        -->
                        <div class="col-6">
                           <div id="player-black" class="placeholder">
                                <small>Player black placeholder</small>
                            </div>
                        </div>
                        <div class="col-6">
                           <div id="player-white" class="placeholder">
                                <small>Player white placeholder</small>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                           <div id="controls" class="placeholder">
                                <small>Controls placeholder</small>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                           <div id="status-area" class="placeholder">
                                <small>Status area placeholder</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
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
                    new \LittleGoWeb\WebSocketServer()
                )
            ),
            $config->webSocketPort
        );

        $server->run();
    }
}
