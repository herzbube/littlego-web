// ----------------------------------------------------------------------
// This file contains the controller that manages the game board (excluding
// drawing code).
// ----------------------------------------------------------------------

"use strict";

lg4wApp.controller("lg4wBoardController", ["$scope", "$routeParams", ANGULARNAME_SERVICE_WEBSOCKET, ANGULARNAME_SERVICE_SESSION, ANGULARNAME_SERVICE_DRAWING, ANGULARNAME_SERVICE_ERRORHANDLING, function($scope, $routeParams, webSocketService, sessionService, drawingService, errorHandlingService) {

    // ----------------------------------------------------------------------
    // Private data not available via the $scope
    // ----------------------------------------------------------------------
    var gameID = GAMEID_UNDEFINED;
    var thisPlayerColor = COLOR_NONE;
    var goGame = undefined;
    var boardViewMode = BOARDVIEW_MODE_PLAY;
    var isThisPlayersTurn = false;
    var isMoveSubmissionInProgress = false;
    var thisPlayerCanPlayMove = false;

    // ----------------------------------------------------------------------
    // Placeholder handling for the entire play area
    // ----------------------------------------------------------------------
    $scope.playPlaceHolderMessage = "Waiting for server connection ...";
    $scope.playPlaceHolderMessageIsErrorMessage = false;
    $scope.isPlayPlaceHolderMessageShown = function() {
        return (gameID === GAMEID_UNDEFINED);
    };
    $scope.isBoardShown = function() {
        return (! $scope.isPlayPlaceHolderMessageShown());
    };

    // ----------------------------------------------------------------------
    // Player data
    // ----------------------------------------------------------------------
    $scope.boardPlayerInfoBlack = undefined;
    $scope.boardPlayerInfoWhite = undefined;

    $scope.numberOfCapturedStones = function(numberOfCapturedStones) {
        if (numberOfCapturedStones !== undefined)
            return numberOfCapturedStonesToString(numberOfCapturedStones);
        else
            return "";  // while we are retrieving data
    };

    $scope.komi = function(komi) {
        if (komi !== undefined)
            return komiToString(komi);
        else
            return "";  // while we are retrieving data
    };

    // ----------------------------------------------------------------------
    // Game moves data
    // ----------------------------------------------------------------------
    $scope.gameMoves = [];
    $scope.gameMovesPlaceHolderMessage = "Waiting for server connection ...";
    $scope.gameMovesPlaceHolderMessageIsErrorMessage = false;
    $scope.isGameMovesPlaceHolderMessageShown = function() {
        return ($scope.gameMoves.length === 0);
    };

    // ----------------------------------------------------------------------
    // Fetch game data once when this controller is initialized
    // ----------------------------------------------------------------------
    function getGameInProgressWithMoves() {
        $scope.playPlaceHolderMessage = "Retrieving data ...";
        $scope.playPlaceHolderMessageIsErrorMessage = false;
        $scope.gameMovesPlaceHolderMessage = "Retrieving data ...";
        $scope.gameMovesPlaceHolderMessageIsErrorMessage = false;

        // We get the game ID as a string. By subtracting 0 we coerce the
        // value into a number. We can't add 0 because the "+" operator is
        // also used for string concatenation.
        var gameIDFromRoute = $routeParams.gameID - 0;
        if (isNaN(gameIDFromRoute))
            gameIDFromRoute = GAMEID_UNDEFINED;

        webSocketService.getGameInProgressWithMoves(gameIDFromRoute);
    }

    webSocketService.addGetGameInProgressWithMovesListener(handleGetGameInProgressWithMoves);
    function handleGetGameInProgressWithMoves(success, gameInProgressJsonObject, gameMovesJsonObjects, errorMessage) {
        $scope.$apply(function() {
            if (success)
            {
                var goBoard = new GoBoard(
                    gameInProgressJsonObject.boardSize);
                var goGameRules = new GoGameRules(
                    gameInProgressJsonObject.koRule,
                    gameInProgressJsonObject.scoringSystem);
                goGame = new GoGame(
                    goBoard,
                    gameInProgressJsonObject.handicap,
                    gameInProgressJsonObject.komi,
                    goGameRules);

                gameMovesJsonObjects.forEach(function(gameMoveJsonObject) {
                    // TODO: Display progress

                    playGameMoveJsonObject(gameMoveJsonObject);
                }, this);

                goGame.state = gameInProgressJsonObject.state;

                var blackPlayerUserInfo = new UserInfo(gameInProgressJsonObject.blackPlayer);
                $scope.boardPlayerInfoBlack = new BoardPlayerInfoBlack(blackPlayerUserInfo, goGame);
                var whitePlayerUserInfo = new UserInfo(gameInProgressJsonObject.whitePlayer);
                $scope.boardPlayerInfoWhite = new BoardPlayerInfoWhite(whitePlayerUserInfo, goGame);

                $scope.gameMoves = [];
                var moveNumber = 0;
                var goMove = goGame.getFirstMove();
                while (goMove !== null)
                {
                    moveNumber++;
                    var gameMove = new GameMove(goMove, moveNumber);
                    // unshift() adds to the beginning of the array. We want the
                    // last move to appear first in the data table
                    $scope.gameMoves.unshift(gameMove);
                    goMove = goMove.getNextGoMove();
                }

                if (gameInProgressJsonObject.blackPlayer.userID === sessionService.getUserInfo().userID)
                    thisPlayerColor = COLOR_BLACK;
                else
                    thisPlayerColor = COLOR_WHITE;

                drawingService.configure(goGame, thisPlayerColor);

                $scope.playPlaceHolderMessage = "";
                $scope.playPlaceHolderMessageIsErrorMessage = false;
                $scope.gameMovesPlaceHolderMessage = false;
                if ($scope.gameMoves.length === 0)
                    $scope.gameMovesPlaceHolderMessage = "This game has no moves.";
                else
                    $scope.gameMovesPlaceHolderMessage = "";

                switch (goGame.state)
                {
                    case GAME_STATE_INPROGRESS_PLAYING:
                        boardViewMode = BOARDVIEW_MODE_PLAY;
                        break;
                    case GAME_STATE_INPROGRESS_SCORING:
                    case GAME_STATE_FINISHED:
                        boardViewMode = BOARDVIEW_MODE_SCORING;
                        break;
                    default:
                        throw new Error("Unknown game state " + goGame.state);
                }

                // Invoke all updaters in order to make sure that everything
                // is up-to-date
                updateIsThisPlayersTurn();
                updateThisPlayerCanPlayMove();
                updateDrawingServiceUserInteraction();

                // Last but not least: Remember the game ID so that the play
                // area becomes visible and we can submit moves.
                gameID = gameInProgressJsonObject.gameID;
            }
            else
            {
                $scope.playPlaceHolderMessage = "Data retrieval error: " + errorMessage;
                $scope.playPlaceHolderMessageIsErrorMessage = true;
                $scope.gameMovesPlaceHolderMessage = "Data retrieval error: " + errorMessage;
                $scope.gameMovesPlaceHolderMessageIsErrorMessage = true;
            }
        });

        if ($scope.isBoardShown())
        {
            // Start drawing the board AFTER the play area has been made
            // visible, as per requirement of the drawing service.
            //
            // Why don't we invoke this method further up in the if(success)
            // branch? Because we don't want to do this inside $scope.$apply(),
            // because drawing the entire board is quite an expensive
            // operation, and we're not sure if this would negatively
            // affect the performance of $scope.$apply().
            drawingService.drawGoBoard();
        }
    }

    // ----------------------------------------------------------------------
    // Updaters
    // ----------------------------------------------------------------------

    // Enable or disable whether it is currently this player's turn (i.e. the
    // user logged in on this client), depending on the state and moves of the
    // current GoGame object that this controller operates on.
    //
    // This updater must be called whenever the game state changes or any
    // game moves are played.
    function updateIsThisPlayersTurn()
    {
        var newIsThisPlayersTurn;
        if (goGame.getNextMoveColor() === thisPlayerColor)
            newIsThisPlayersTurn = true;
        else
            newIsThisPlayersTurn = false;

        if (isThisPlayersTurn === newIsThisPlayersTurn)
            return;
        isThisPlayersTurn = newIsThisPlayersTurn;

        updateThisPlayerCanPlayMove();
    }

    // Enable or disable whether this player (i.e. the user logged in on
    // this client) can currently play a move, depending on the value of
    // the following properties of this controller:
    //
    // - Whether or not it's this player's turn
    // - Whether or not the submission of a move by this player is
    //   currently in progress.
    //
    // The latter is important because until we have received the server's
    // response the move is not yet played, so isThisPlayersTurn is still
    // true. Nevertheless the user must not be able to play more moves
    // while we are waiting for the server's response.
    //
    // This updater must be called whenever any of these properties changes
    // its value.
    function updateThisPlayerCanPlayMove()
    {

        var newThisPlayerCanPlayMove;
        if (isThisPlayersTurn && ! isMoveSubmissionInProgress)
            newThisPlayerCanPlayMove = true;
        else
            newThisPlayerCanPlayMove = false;

        if (thisPlayerCanPlayMove === newThisPlayerCanPlayMove)
            return;
        thisPlayerCanPlayMove = newThisPlayerCanPlayMove;

        updateDrawingServiceUserInteraction();
    }

    // Enable or disable user interaction in the drawing service, depending
    // on the value of the following properties of this controller:
    //
    // - Board view mode
    // - Whether or not this player can currently play a move
    //
    // This updater must be called whenever any of these properties changes
    // its value.
    function updateDrawingServiceUserInteraction()
    {
        var enableUserInteraction;
        if ($scope.isPlayModeActivated())
        {
            enableUserInteraction = thisPlayerCanPlayMove;
        }
        else if ($scope.isAnalyzeModeActivated())
        {
            enableUserInteraction = false;
        }
        else if ($scope.isScoringModeActivated())
        {
            // TODO: Enable always if game state is GAME_STATE_INPROGRESS_PLAYING (local scoring only)
            // TODO: Enable only if it's this player's turn if game state is GAME_STATE_INPROGRESS_SCORING (scoring proposal is submitted)
            enableUserInteraction = true;
        }

        if (drawingService.isUserInteractionEnabled() === enableUserInteraction)
            return;

        if (enableUserInteraction)
            drawingService.enableUserInteraction();
        else
            drawingService.disableUserInteraction();
    }

    function updateBeforeEnteringScoringMode()
    {
        goGame.goScore.enableScoringInformationCollection();
        drawingService.enableScoringMode();
    }

    function updateBeforeLeavingScoringMode()
    {
        goGame.goScore.disableScoringInformationCollection();
        drawingService.disableScoringMode();
    }

    // ----------------------------------------------------------------------
    // Handle mode switches
    // ----------------------------------------------------------------------

    $scope.activatePlayMode = function() {
        if ($scope.isPlayModeActivated())
            return;

        if ($scope.isScoringModeActivated())
            updateBeforeLeavingScoringMode();

        boardViewMode = BOARDVIEW_MODE_PLAY;

        updateDrawingServiceUserInteraction();
    };

    $scope.activateAnalyzeMode = function() {
        if ($scope.isAnalyzeModeActivated())
            return;

        if ($scope.isScoringModeActivated())
            updateBeforeLeavingScoringMode();

        boardViewMode = BOARDVIEW_MODE_ANALYZE;

        updateDrawingServiceUserInteraction();
    };

    $scope.activateScoringMode = function() {
        if ($scope.isScoringModeActivated())
            return;

        updateBeforeEnteringScoringMode();

        boardViewMode = BOARDVIEW_MODE_SCORING;

        updateDrawingServiceUserInteraction();
    };

    $scope.isPlayModeActivated = function() {
        return (boardViewMode === BOARDVIEW_MODE_PLAY);
    };

    $scope.isAnalyzeModeActivated = function() {
        return (boardViewMode === BOARDVIEW_MODE_ANALYZE);
    };

    $scope.isScoringModeActivated = function() {
        return (boardViewMode === BOARDVIEW_MODE_SCORING);
    };

    // ----------------------------------------------------------------------
    // Handle play mode operations
    // ----------------------------------------------------------------------

    $scope.isPassButtonDisabled = function() {
        if ($scope.isBoardShown())
            return (goGame.getNextMoveColor() !== thisPlayerColor);
        else
            return false;  // we get here on page reload: goGame does not exist yet
    };

    $scope.isResignButtonDisabled = function() {
        if ($scope.isBoardShown())
            return (goGame.getNextMoveColor() !== thisPlayerColor);
        else
            return false;  // we get here on page reload: goGame does not exist yet
    };

    // Playing a stone is not handled via AngularJS "ngClick" directive,
    // therefore the following function is not attached to the $scope.
    // The click is detected by the drawing service, which is why the
    // following function is an event listener.
    drawingService.addDidClickOnIntersectionListener(handleDidClickOnIntersection);
    function handleDidClickOnIntersection(goPoint) {

        if ($scope.isScoringModeActivated())
        {
            // TODO: Distinguish between "mark as dead" and "mark as seki"
            goGame.goScore.toggleDeadStateOfStoneGroup(goPoint.goBoardRegion);

            drawingService.drawGoBoardAfterScoreChange();
            // Enable/disable interaction depending on whether it's currently
            // this player's turn to score
            // TODO: Implement
            //updateIsThisPlayersTurnToScore();

            updateIsThisPlayersTurn();
            updateDrawingServiceUserInteraction();

            return;
        }

        isMoveSubmissionInProgress = true;
        updateDrawingServiceUserInteraction();

        webSocketService.submitNewGameMovePlay(
            gameID,
            goGame.getNextMoveColor(),
            goPoint.goVertex.x,
            goPoint.goVertex.y);
    }

    $scope.pass = function() {

        isMoveSubmissionInProgress = true;
        updateDrawingServiceUserInteraction();

        webSocketService.submitNewGameMovePass(
            gameID,
            goGame.getNextMoveColor());
    };

    $scope.resign = function() {
        // TODO: Don't use jQuery
        $("#" + ID_MODAL_NOT_YET_IMPLEMENTED).modal()
    };

    webSocketService.addSubmitNewGameMoveListener(handleSubmitNewGameMove);
    function handleSubmitNewGameMove(success, gameMoveJsonObject, errorMessage) {

        if (success)
        {
            // The server sends us moves for all games that the currently
            // logged in user is playing, but we are interested only in those
            // moves that are for the game that the user is currently viewing
            if (gameMoveJsonObject.gameID !== gameID)
                return;

            // Clear the submission flag only if the response is for the
            // game that the user is currently viewing
            isMoveSubmissionInProgress = false;

            playGameMoveJsonObject(gameMoveJsonObject);

            $scope.$apply(function() {
                if (goGame.getLastMove().goPlayer.isBlack())
                    $scope.boardPlayerInfoBlack.updateAfterGameMoveWasPlayed(goGame);
                else
                    $scope.boardPlayerInfoWhite.updateAfterGameMoveWasPlayed(goGame);

                var goMove = goGame.getLastMove();
                var moveNumber = $scope.gameMoves.length + 1;
                var gameMove = new GameMove(goMove, moveNumber);
                $scope.gameMoves.unshift(gameMove);
            });

            drawingService.drawGoBoardAfterNewGameMoveWasPlayed();
            updateIsThisPlayersTurn();
            updateDrawingServiceUserInteraction();
        }
        else
        {
            errorHandlingService.showServerError(errorMessage);

            // We can confidently clear the submission flag because even
            // though the WebSocket error response data does not include
            // a game ID, we know that the server only sends us an error
            // response after we made a request
            isMoveSubmissionInProgress = false;
        }
    }

    // This function is invoked in the following scenarios:
    // - After the initial game data has been loaded, this function is
    //   invoked repeatedly to simulate playing the game moves that
    //   are part of the game data.
    // - When the user on this client plays a move, that move is
    //   first submitted to the server. This function is invoked
    //   when the server sends this client a success response.
    // - When the user on the other client plays a move and successfully
    //   submits the move to the server, the server notifies this
    //   client, which causes this function to be invoked.
    function playGameMoveJsonObject(gameMoveJsonObject) {
        var expectedNextMoveColor = goGame.getNextMoveColor();
        var actualNextMoveColor = gameMoveJsonObject.moveColor;
        if (expectedNextMoveColor !== actualNextMoveColor)
            throw new Error("Expected next move color = " + expectedNextMoveColor + ", actual next move color = " + actualNextMoveColor);

        switch (gameMoveJsonObject.moveType)
        {
            case GOMOVE_TYPE_PLAY:
                var goPoint = goGame.goBoard.getPointAtVertexCoordinates(
                    gameMoveJsonObject.vertexX,
                    gameMoveJsonObject.vertexY);
                goGame.play(goPoint);
                break;
            case GOMOVE_TYPE_PASS:
                goGame.pass();
                break;
            default:
                throw new Error("Invalid move type " + gameMoveJsonObject.moveType);
        }
    }

    // ----------------------------------------------------------------------
    // Controller initialization and destruction
    // ----------------------------------------------------------------------

    if (webSocketService.isReady())
        getGameInProgressWithMoves();
    else
        webSocketService.addServiceIsReadyListener(handleWebSocketServiceIsReady);

    function handleWebSocketServiceIsReady() {
        $scope.$apply(function() {
            getGameInProgressWithMoves();
        });
    }

    $scope.$on("$destroy", function() {
        webSocketService.removeServiceIsReadyListener(handleWebSocketServiceIsReady);
        webSocketService.removeGetGameInProgressWithMovesListener(handleGetGameInProgressWithMoves);
        webSocketService.removeSubmitNewGameMoveListener(handleSubmitNewGameMove);
        drawingService.removeDidClickOnIntersectionListener(handleDidClickOnIntersection);
    })
}]);
