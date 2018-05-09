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
    <!-- Popper, as required by Bootstrap -->
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

    <!-- Raphaël library for drawing with SVG -->
    <script src="js/raphael-2.2.1.min.js"></script>

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
    <!--
        TODO: The PHP script that serves this page should read all local
        JS files, paste them together and serve everything as one huge
        inline script.
    -->

    <title>Little Go for the web</title>
</head>
<body>
    <div id="container-login-form" class="container-fluid">
        <div class="row justify-content-center">
            <form id="login-form" class="col-sm-10 col-md-8 col-lg-6">
                <div class="form-group">
                    <h1>Login</h1>
                </div>
                <div class="form-group">
                    <label for="login-email-address">Email address:</label>
                    <input id="login-email-address" class="form-control" name="email-address" type="email" placeholder="Enter your email address" required/>
                </div>
                <div class="form-group">
                    <label for="login-password">Password:</label>
                    <input id="login-password" class="form-control" name="password" type="password" placeholder="Enter your password" required/>
                </div>
                <div class="form-group">
                    <button id="button-login" class="btn btn-primary" type="submit">Login</button>
                </div>
                <div class="form-group">
                    <p>Not registered yet? <button id="button-goto-registration" class="btn btn-dark btn-sm" type="button">Register</button></p>
                </div>
                <div class="form-group">
                    <div id="alert-login" class="alert alert-danger" role="alert"></div>
                </div>
            </form>
        </div>
    </div>

    <div id="container-registration-form" class="container-fluid">
        <div class="row justify-content-center">
            <form id="registration-form" class="col-sm-10 col-md-8 col-lg-6">
                <div class="form-group">
                    <h1>Registration</h1>
                </div>
                <div class="form-group">
                    <label for="registration-email-address">Email address:</label>
                    <input id="registration-email-address" class="form-control" name="email-address" type="email" placeholder="Enter your email address" required/>
                    <p><small>When you register the system will send an email to the address you enter here, in order to verify that you are indeed the owner of the address.</small></p>
                </div>
                <div class="form-group">
                    <label for="registration-display-name">Display name:</label>
                    <input id="registration-display-name" class="form-control" name="display-name" type="text" placeholder="Enter a display name" required/>
                    <p><small>Other users will see the display name you enter here, never your email address. The system requires you to choose a unique display name so that other users won't mistake you for somebody else.</small></p>
                </div>
                <div class="form-group">
                    <label for="registration-password">Password:</label>
                    <input id="registration-password" class="form-control" name="password" type="password" placeholder="Enter your password" required/>
                </div>
                <div class="form-group">
                    <button id="button-register" class="btn btn-primary" type="submit">Register</button>
                    <button id="button-cancel-registration" class="btn btn-secondary" type="button">Cancel</button>
                    <!-- TODO: Remove when email address verification is implemented -->
                    <p><small>DEV MODE: Email address verification has not been implemented yet. You can enter any email address you like as long as the address format is correct. If the registration data you entered is acceptable (i.e. email address and display name are both unique), registration will immediately succeed and the system will log you in instantly.</small></p>
                </div>
                <div class="form-group">
                    <div id="alert-registration" class="alert alert-danger" role="alert"></div>
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
            <span class="navbar-text mr-5"><small id="session-display-name"></small></span>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar-items" aria-controls="navbar-items" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div id="navbar-items" class="collapse navbar-collapse nav-pills justify-content-end">
                <div class="navbar-nav">
                    <!-- No clunky list element necessary in Bootstrap -->
                    <a id="button-game-requests" class="nav-item nav-link" href="#">Game requests <span id="badge-game-request-pairings-found" class="badge badge-danger"></span></a>
                    <a id="button-games-in-progress" class="nav-item nav-link" href="#">Games in progress</a>
                    <a id="button-finished-games" class="nav-item nav-link" href="#">Finished games</a>
                    <a id="button-high-scores" class="nav-item nav-link" href="#">High Scores</a>
                    <a id="button-logout" class="nav-item nav-link" href="#">Logout</a>
                </div>
            </div>
        </nav>
        <div id="container-game-requests" class="container-fluid">
            <!-- md, lg and xl should have sufficient space to not need scrolling -->
            <table class="table table-striped table-bordered table-hover table-responsive-md">
                <caption>List of game requests</caption>
                <thead class="thead-dark">
                    <tr><th>Started</th><th>Request ID</th><th>Board size</th><th>Stone color</th><th>Handicap</th><th>Komi</th><th>Ko rule</th><th>Scoring system</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    <!-- Content is filled in dynamically -->
                </tbody>
            </table>
            <div class="row">
                <div class="col-6"><small>(*) = No preference</small></div>
                <div class="col-6 text-right"><button id="button-new-game-request" class="btn btn-success" data-toggle="modal" data-target="#new-game-request-modal">New game</button></div>
            </div>
        </div>
        <div id="container-games-in-progress" class="container-fluid">
            <!-- md, lg and xl should have sufficient space to not need scrolling -->
            <table class="table table-striped table-bordered table-hover table-responsive-md">
                <caption>List of games in progress</caption>
                <thead class="thead-dark">
                    <tr><th>Started</th><th>Game ID</th><th>Board size</th><th>Handicap</th><th>Komi</th><th>Ko rule</th><th>Scoring system</th><th>Moves played</th><th>Next move</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    <!-- Content is filled in dynamically -->
                </tbody>
            </table>
        </div>
        <div id="container-finished-games" class="container-fluid">
            <!-- md, lg and xl should have sufficient space to not need scrolling -->
            <table class="table table-striped table-bordered table-hover table-responsive-md">
                <caption>List of finished games</caption>
                <thead class="thead-dark">
                    <tr><th>End date</th><th>Game ID</th><th>Board size</th><th>Handicap</th><th>Komi</th><th>Ko rule</th><th>Scoring system</th><th>Result</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    <!-- Content is filled in dynamically -->
                </tbody>
            </table>
            <p><small>Result codes: B+n = Black wins by n points, B+Resign = Black wins by resignation, W+n = White wins by n points, W+Resign = White wins by resignation.</small></p>
        </div>
        <div id="container-high-scores" class="container-fluid">
            <p>High scores are not yet available.</p>
        </div>
        <div id="container-play-placeholder" class="container-fluid">
            <div class="row text-center">
                <div class="col-12">Retrieving game data ...</div>
            </div>
        </div>
        <div id="container-play" class="container-fluid">
            <div class="row">
                <!--
                    On xs and md we use all 12 columns, i.e. the entire width,
                    because the board and the right-hand-side elements are
                    vertically stacked (in this case "right-hand-side" is a
                    misnomer). On md, lg and xl we use only 8 columns because
                    the board must share the available horizontal space with
                    the right-hand-side elements.
                -->
                <div id="board-left-hand-side" class="col-12 col-md-8">
                    <div id="container-board" />
                        <!-- Content is filled in dynamically -->
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
                <div id="board-right-hand-side" class="col-12 col-md-4">
                    <div class="card board-right-hand-side-section">
                        <div class="card-body">
                            <div class="row">
                                <!--
                                    Regardless of how much horizontal space the
                                    right-hand-side elements take up, we distribute
                                    that space evenly among the black and white
                                    player information areas - both get 6 out of 12
                                    columns.
                                -->
                                <div class="col-6">
                                    <div id="board-player-info-black" class="board-player-info container-fluid">
                                        <div class="row">
                                            <div id="board-player-name-black" class="col-12"></div>
                                        </div>
                                        <div class="row">
                                            <div id="board-number-of-captures-black" class="col-12"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div id="board-player-info-white" class="board-player-info container-fluid">
                                        <div class="row">
                                            <div id="board-player-name-white" class="col-12"></div>
                                        </div>
                                        <div class="row">
                                            <div id="board-number-of-captures-white" class="col-8"></div>
                                            <div id="board-komi" class="col-4"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card board-right-hand-side-section">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-12">
                                    <div id="container-board-mode-navigation" class="board-right-hand-side-subsection">
                                        <ul class="nav nav-tabs">
                                            <li class="nav-item">
                                                <button id="button-board-mode-play" class="nav-link btn btn-link active">Play Mode</button>
                                            </li>
                                            <li class="nav-item">
                                                <button id="button-board-mode-analyze" class="nav-link btn btn-link">Analyze Mode</button>
                                            </li>
                                            <li class="nav-item">
                                                <button id="button-board-mode-scoring" class="nav-link btn btn-link">Scoring Mode</button>
                                            </li>
                                        </ul>
                                    </div>
                                    <div id="container-board-controls" class="board-right-hand-side-subsection">
                                        <div id="container-board-controls-play-mode">
                                            <button id="button-board-control-pass" class="btn btn-outline-dark">Pass</button>
                                        </div>
                                        <div id="container-board-controls-analyze-mode">
                                            <button id="button-board-control-rewindtostart" class="btn btn-outline-dark" title"Go to first board position" data-toggle="modal" data-target="#notYetImplemented">First</button>
                                            <button id="button-board-control-back" class="btn btn-outline-dark" title"Go to previousboard position" data-toggle="modal" data-target="#notYetImplemented">Previous</button>
                                            <button id="button-board-control-forward" class="btn btn-outline-dark" title"Go to next board position" data-toggle="modal" data-target="#notYetImplemented">Next</button>
                                            <button id="button-board-control-forwardtoend" class="btn btn-outline-dark" title"Go to lastboard position" data-toggle="modal" data-target="#notYetImplemented">Last</button>
                                        </div>
                                        <div id="container-board-controls-scoring-mode">
                                            <button id="button-board-control-calculate-score" class="btn btn-outline-dark" title"Calculate the new score" data-toggle="modal" data-target="#notYetImplemented">Calculate</button>
                                            <button id="button-board-control-toggle-mark-mode" class="btn btn-outline-dark" title"Start marking as seki" data-toggle="modal" data-target="#notYetImplemented">Seki</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card board-right-hand-side-section">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-12">
                                    <h5 class="card-title">Game Moves</h5>
                                    <table class="table table-striped table-bordered table-hover table-responsive-md">
                                    <thead class="thead-dark">
                                        <tr><th>#</th><th>Played by</th><th>Vertex</th><th>Captured</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>1</td><td>Black</td><td>C6</td><td></td></tr>
                                        <tr><td>2</td><td>White</td><td>G4</td><td></td></tr>
                                        <tr><td>3</td><td>Black</td><td>B3</td><td>2</td></tr>
                                        <!-- Content is filled in dynamically -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Modals -->
    <div id="notYetImplemented" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="notYetImplementedLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="notYetImplementedLabel">We are sorry!</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>This function has not been implemented yet.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <div id="new-game-request-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="new-game-request-modal-label" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="new-game-request-modal-label">New Game Request</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="new-game-request-modal-form">
                        <div class="form-group">
                            <label for="new-game-request-modal-board-size" class="col-form-label">Board size:</label>
                            <select size="1" class="form-control" id="new-game-request-modal-board-size">
                                <option value="-1">No preference</option>
                                <option value="7">7x7</option>
                                <option value="9">9x9</option>
                                <option value="11">11x11</option>
                                <option value="13">13x13</option>
                                <option value="15">15x15</option>
                                <option value="17">17x17</option>
                                <option value="19">19x19</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="new-game-request-modal-stone-color" class="col-form-label">Preferred color:</label>
                            <select size="1" class="form-control" id="new-game-request-modal-stone-color">
                                <option value="-1">No preference</option>
                                <option value="0">Black</option>
                                <option value="1">White</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="new-game-request-modal-handicap" class="col-form-label">Handicap:</label>
                            <select size="1" class="form-control" id="new-game-request-modal-handicap">
                                <option value="-1">No preference</option>
                                <option value="0">No handicap</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="new-game-request-modal-komi" class="col-form-label">Komi:</label>
                            <select size="1" class="form-control" id="new-game-request-modal-komi">
                                <option value="-1">No preference</option>
                                <option value="0">None</option>
                                <option value="0.5">½</option>
                                <option value="5">5</option>
                                <option value="5.5">5½</option>
                                <option value="6">6</option>
                                <option value="6.5">6½</option>
                                <option value="7">7</option>
                                <option value="7.5">7½</option>
                                <option value="8">8</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="new-game-request-modal-ko-rule" class="col-form-label">Ko rule:</label>
                            <select size="1" class="form-control" id="new-game-request-modal-ko-rule">
                                <option value="-1">No preference</option>
                                <option value="0">Simple ko</option>
                                <option value="1">Positional superko</option>
                                <option value="2">Situational superko</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="new-game-request-modal-scoring-system" class="col-form-label">Scoring system:</label>
                            <select size="1" class="form-control" id="new-game-request-modal-scoring-system">
                                <option value="-1">No preference</option>
                                <option value="0">Area scoring</option>
                                <option value="1">Territory scoring</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="button-new-game-request-modal-submit">Submit</button>
                </div>
            </div>
        </div>
    </div>

    <div id="confirm-game-request-pairing-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-game-request-pairing-modal-label" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="confirm-game-request-pairing-modal-label">Confirm New Game</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p id="confirm-game-request-pairing-modal-game-request-id">Hooray, a match for your game request has been found!</p>
                    <p>Your opponent for this game is <span id="confirm-game-request-pairing-modal-opponent-name"></span>.</p>
                    <p>You will play <span id="confirm-game-request-pairing-modal-stone-color"></span>.</p>
                    <p>The game has the following characteristics:</p>
                    <ul>
                        <li>Board size: <span id="confirm-game-request-pairing-modal-board-size"></span></li>
                        <li>Handicap: <span id="confirm-game-request-pairing-modal-handicap"></span></li>
                        <li>Komi: <span id="confirm-game-request-pairing-modal-komi"></span></li>
                        <li>Ko rule: <span id="confirm-game-request-pairing-modal-ko-rule"></span></li>
                        <li>Scoring system: <span id="confirm-game-request-pairing-modal-scoring-system"></span></li>
                    </ul>
                    <p>After you close this popup you will find the new game waiting for you on the "Games in progress" tab.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="button-confirm-game-request-pairing-modal-start-game">Start game</button>
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
                    new \LittleGoWeb\WebSocketServer($config)
                )
            ),
            $config->webSocketPort
        );

        $server->run();
    }
}
