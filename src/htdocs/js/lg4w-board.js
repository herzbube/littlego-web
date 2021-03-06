// ----------------------------------------------------------------------
// This file contains the controller that manages the game board (excluding
// drawing code).
// ----------------------------------------------------------------------

"use strict";

lg4wApp.controller("lg4wBoardController", ["$scope", "$rootScope", "$routeParams", ANGULARNAME_SERVICE_WEBSOCKET, ANGULARNAME_SERVICE_SESSION, ANGULARNAME_SERVICE_DRAWING, ANGULARNAME_SERVICE_ERRORHANDLING, function($scope, $rootScope, $routeParams, webSocketService, sessionService, drawingService, errorHandlingService) {

    // ----------------------------------------------------------------------
    // Private data not available via the $scope
    // ----------------------------------------------------------------------

    // The general mode that the view is in. Changing this affects which
    // controls are visible and what kind of interaction the drawing service
    // offers to the user.
    var boardViewMode = BOARDVIEW_MODE_INITIALIZING;
    // The ID of the game that the user is currently viewing. The view
    // remains empty as long as this is not set.
    var gameID = GAMEID_UNDEFINED;
    // The color of the stones that the currently logged in user is playing
    // with in this game.
    var thisPlayerColor = COLOR_NONE;
    // The main Go domain model object. All other domain model objects are
    // accessible via this object.
    var goGame = undefined;
    // The following variables help us to control alternating play
    // while the user views a game in state GAME_STATE_INPROGRESS_PLAYING
    var thisPlayerCanPlayMove = false;
    var isMoveSubmissionInProgress = false;
    // The mark mode that is in effect while the view is in
    // BOARDVIEW_MODE_SCORING
    var scoringMarkMode = SCORINGMARKMODE_DEAD;
    // Which type of data should be shown in the view's data area
    var dataTypeShown = BOARDVIEW_DATATYPE_GAMEMOVES;
    // The score object helps us keep track whose turn it is to submit a
    // score proposal while the user views a game in state
    // GAME_STATE_INPROGRESS_SCORING
    var score = undefined;
    // The scoreDetails object contains the actual score (either the
    // proposal for a game in state GAME_STATE_INPROGRESS_SCORING, or
    // the final score for a game in state GAME_STATE_FINISHED).
    var scoreDetails = undefined;
    // The following variables help us to control alternating
    // submission of score proposals while the user views a game in state
    // GAME_STATE_INPROGRESS_SCORING
    var thisPlayerCanSubmitScoreProposal = false;
    var isScoreProposalSubmissionInProgress = false;
    // A kind of "dirty" flag that indicates whether the user has
    // made changes to a score proposal that the opponent submitted
    var thisPlayerHasChangedScoreProposal = false;
    // The gameResult object is present only for a game in state
    // GAME_STATE_FINISHED. It contains the summary of the final result.
    var gameResult = undefined;

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
    function getGame() {
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

        webSocketService.getGame(gameIDFromRoute);
    }

    webSocketService.addGetGameListener(handleGetGame);
    function handleGetGame(success, gameJsonObject, gameMovesJsonObjects, scoreJsonObject, scoreDetailsJsonObject, errorMessage) {
        $scope.$apply(function() {
            if (success)
            {
                var goBoard = new GoBoard(
                    gameJsonObject.boardSize);
                var goGameRules = new GoGameRules(
                    gameJsonObject.koRule,
                    gameJsonObject.scoringSystem);
                goGame = new GoGame(
                    goBoard,
                    gameJsonObject.handicap,
                    gameJsonObject.komi,
                    goGameRules);

                gameMovesJsonObjects.forEach(function(gameMoveJsonObject) {
                    // TODO: Display progress

                    playGameMoveJsonObject(gameMoveJsonObject);
                }, this);

                goGame.setState(gameJsonObject.state);

                var blackPlayerUserInfo = new UserInfo(gameJsonObject.blackPlayer);
                $scope.boardPlayerInfoBlack = new BoardPlayerInfoBlack(blackPlayerUserInfo, goGame);
                var whitePlayerUserInfo = new UserInfo(gameJsonObject.whitePlayer);
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

                if (gameJsonObject.blackPlayer.userID === sessionService.getUserInfo().userID)
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

                switch (goGame.getState())
                {
                    case GAME_STATE_INPROGRESS_PLAYING:
                        boardViewMode = BOARDVIEW_MODE_PLAY;
                        break;
                    case GAME_STATE_INPROGRESS_SCORING:
                    case GAME_STATE_FINISHED:
                        // For GAME_STATE_INPROGRESS_SCORING the following
                        // two parameters can be undefined if no score proposal
                        // has been submitted yet.
                        score = scoreJsonObject;
                        scoreDetails = scoreDetailsJsonObject;

                        if (goGame.getState() === GAME_STATE_FINISHED)
                        {
                            gameResult = gameJsonObject.gameResult;
                            updateGameResult();
                        }

                        updateBeforeEnteringScoringMode();
                        if (scoreDetails !== undefined)
                        {
                            applyScoreDetails();
                            thisPlayerHasChangedScoreProposal = false;
                        }

                        boardViewMode = BOARDVIEW_MODE_SCORING;
                        dataTypeShown = BOARDVIEW_DATATYPE_SCORE;
                        break;
                    default:
                        throw new Error("Unknown game state " + goGame.getState());
                }

                // Even in play mode we need an initial score, the user might
                // switch immediately to the score tab without playing a move
                goGame.goScore.calculate();
                updateScoringData();

                // Invoke all updaters in order to make sure that everything
                // is up-to-date
                updateThisPlayerCanPlayMove();
                updateThisPlayerCanSubmitScoreProposal();
                updateDrawingServiceUserInteraction();

                // Last but not least: Remember the game ID so that the play
                // area becomes visible and we can submit moves.
                gameID = gameJsonObject.gameID;
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
            // We can't use updateCanvasDimensionAndDrawGoBoardIfChanged
            // because the drawing service might still be configured with
            // the correct canvas dimension, and in that case wouldn't
            // draw the board because the dimension hasn't changed.
            //
            // Instead we have to explicitly invoke drawGoBoard() to
            // force the drawing service to draw the board. We must still
            // update the canvas dimension, though, because it might have
            // changed. But we use the simpler updateCanvasDimension
            // to prevent two full drawings.
            updateCanvasDimension();
            // Start drawing the board AFTER the play area has been made
            // visible, as per requirement of the drawing service. The
            // play area becomes visible only after $scope.$apply() has
            // finished its magic.
            drawingService.drawGoBoard();
        }
    }

    // ----------------------------------------------------------------------
    // Updaters
    // ----------------------------------------------------------------------

    // Enable or disable whether this player (i.e. the user logged in on
    // this client) can currently play a move, depending on the value of
    // the following properties of this controller:
    //
    // - The game state.
    // - Whether or not it's this player's turn (i.e. the user logged in on
    //   this client) to play a move. This changes whenever any game move
    //   is played.
    // - Whether or not the submission of a move by this player is
    //   currently in progress. This is important because until we have
    //   received the server's response the move is not yet played, so
    //   technically it's still this player's turn to play a move.
    //   Nevertheless the user must not be able to play more moves while
    //   we are waiting for the server's response.
    //
    // This updater must be called whenever any of these properties changes
    // its value.
    function updateThisPlayerCanPlayMove()
    {
        var isThisPlayersTurnToPlayMove;
        if (goGame.getNextMoveColor() === thisPlayerColor)
            isThisPlayersTurnToPlayMove = true;
        else
            isThisPlayersTurnToPlayMove = false;

        var newThisPlayerCanPlayMove;
        if (goGame.getState() !== GAME_STATE_INPROGRESS_PLAYING)
            newThisPlayerCanPlayMove = false;
        else if (isThisPlayersTurnToPlayMove && ! isMoveSubmissionInProgress)
            newThisPlayerCanPlayMove = true;
        else
            newThisPlayerCanPlayMove = false;

        if (thisPlayerCanPlayMove === newThisPlayerCanPlayMove)
            return;
        thisPlayerCanPlayMove = newThisPlayerCanPlayMove;
    }

    // Enable or disable whether this player (i.e. the user logged in on
    // this client) can currently submit a score proposal, depending on the
    // value of the following properties of this controller:
    //
    // - The game state.
    // - Whether or not it's this player's turn (i.e. the user logged in on
    //   this client) to submit a score proposal. This changes whenever any
    //   game move is played or a new score proposal is received.
    // - Whether or not the submission of a score proposal by this player is
    //   currently in progress. This is important because until we have
    //   received the server's response the score proposal is not yet in
    //   effect, so technically it's still this player's turn to submit a
    //   score proposal. Nevertheless the user must not be able to submit
    //   more score proposals while we are waiting for the server's response.
    //
    // This updater must be called whenever any of these properties changes
    // its value.
    function updateThisPlayerCanSubmitScoreProposal()
    {
        var isThisPlayersTurnToSubmitScoreProposal;
        if (score === undefined)
        {
            if (goGame.getNextMoveColor() === thisPlayerColor)
                isThisPlayersTurnToSubmitScoreProposal = false;
            else
                isThisPlayersTurnToSubmitScoreProposal = true;
        }
        else
        {
            if (score.lastModifiedByUserID === sessionService.getUserInfo().userID)
                isThisPlayersTurnToSubmitScoreProposal = false;
            else
                isThisPlayersTurnToSubmitScoreProposal = true;
        }

        var newThisPlayerCanSubmitScoreProposal;
        if (goGame.getState() !== GAME_STATE_INPROGRESS_SCORING)
            newThisPlayerCanSubmitScoreProposal = false;
        else if (isThisPlayersTurnToSubmitScoreProposal && ! isScoreProposalSubmissionInProgress)
            newThisPlayerCanSubmitScoreProposal = true;
        else
            newThisPlayerCanSubmitScoreProposal = false;

        if (thisPlayerCanSubmitScoreProposal === newThisPlayerCanSubmitScoreProposal)
            return;
        thisPlayerCanSubmitScoreProposal = newThisPlayerCanSubmitScoreProposal;
    }

    // Enable or disable user interaction in the drawing service, depending
    // on the value of the following properties of this controller:
    //
    // - Board view mode
    // - Whether or not this player can currently play a move or submit a
    //   score proposal
    //
    // This updater must be called whenever any of these properties changes
    // its value.
    function updateDrawingServiceUserInteraction()
    {
        var enableUserInteraction;
        if ($scope.isPlayModeActivated())
        {
            if (goGame.getState() === GAME_STATE_INPROGRESS_PLAYING)
                enableUserInteraction = thisPlayerCanPlayMove;
            else
                enableUserInteraction = false;
        }
        else if ($scope.isAnalyzeModeActivated())
        {
            enableUserInteraction = false;
        }
        else if ($scope.isScoringModeActivated())
        {
            if (goGame.getState() === GAME_STATE_INPROGRESS_PLAYING)
                enableUserInteraction = true;  // in playing state the score is only local, so no restrictions
            else if (goGame.getState() === GAME_STATE_INPROGRESS_SCORING)
                enableUserInteraction = thisPlayerCanSubmitScoreProposal;
            else
                enableUserInteraction = false;
        }
        else
        {
            throw new Error("Unknown board view mode");
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

        var leavingScoringMode = $scope.isScoringModeActivated();
        if (leavingScoringMode)
            updateBeforeLeavingScoringMode();

        boardViewMode = BOARDVIEW_MODE_PLAY;

        if (leavingScoringMode)
            updateScoringData();
        updateDrawingServiceUserInteraction();
    };

    $scope.activateAnalyzeMode = function() {
        if ($scope.isAnalyzeModeActivated())
            return;

        var leavingScoringMode = $scope.isScoringModeActivated();
        if (leavingScoringMode)
            updateBeforeLeavingScoringMode();

        boardViewMode = BOARDVIEW_MODE_ANALYZE;

        if (leavingScoringMode)
            updateScoringData();
        updateDrawingServiceUserInteraction();
    };

    $scope.activateScoringMode = function() {
        if ($scope.isScoringModeActivated())
            return;

        updateBeforeEnteringScoringMode();

        boardViewMode = BOARDVIEW_MODE_SCORING;

        updateDrawingServiceUserInteraction();

        goGame.goScore.calculate();
        updateScoringData();
        drawingService.drawGoBoardAfterScoreChange();
    };

    $scope.isPlayModeActivated = function() {
        return (boardViewMode === BOARDVIEW_MODE_PLAY);
    };

    $scope.isPlayModeShown = function() {
        if ($scope.isBoardShown())
            return (goGame.getState() === GAME_STATE_INPROGRESS_PLAYING);
        else
            return false;
    };

    $scope.isAnalyzeModeActivated = function() {
        return (boardViewMode === BOARDVIEW_MODE_ANALYZE);
    };

    $scope.isAnalyzeModeShown = function() {
        if ($scope.isBoardShown())
            return (goGame.getState() !== GAME_STATE_FINISHED);
        else
            return false;
    };

    $scope.isScoringModeActivated = function() {
        return (boardViewMode === BOARDVIEW_MODE_SCORING);
    };

    $scope.isScoringModeShown = function() {
        if ($scope.isBoardShown())
            return true;
        else
            return false;
    };

    // ----------------------------------------------------------------------
    // Handle play mode operations
    // ----------------------------------------------------------------------

    $scope.isPassButtonDisabled = function() {
        if ($scope.isBoardShown())
            return ! thisPlayerCanPlayMove;
        else
            return true;  // we get here on page reload: goGame does not exist yet
    };

    $scope.isResignButtonPlayModeDisabled = function() {
        if ($scope.isBoardShown())
            return ! thisPlayerCanPlayMove;
        else
            return true;  // we get here on page reload: goGame does not exist yet
    };

    // Playing a stone is not handled via AngularJS "ngClick" directive,
    // therefore the following function is not attached to the $scope.
    // The click is detected by the drawing service, which is why the
    // following function is an event listener.
    drawingService.addDidClickOnIntersectionListener(handleDidClickOnIntersection);
    function handleDidClickOnIntersection(goPoint) {

        if ($scope.isScoringModeActivated())
        {
            if ($scope.isMarkDeadActivated())
                goGame.goScore.toggleDeadStateOfStoneGroup(goPoint.goBoardRegion);
            else
                goGame.goScore.toggleSekiStateOfStoneGroup(goPoint.goBoardRegion);

            $scope.$apply(function() {
                thisPlayerHasChangedScoreProposal = true;

                goGame.goScore.calculate();
                updateScoringData();
            });

            drawingService.drawGoBoardAfterScoreChange();
        }
        else if ($scope.isPlayModeActivated())
        {
            $scope.$apply(function() {
                isMoveSubmissionInProgress = true;
                updateThisPlayerCanPlayMove();
                updateDrawingServiceUserInteraction();
            });

            webSocketService.submitNewGameMovePlay(
                gameID,
                goGame.getNextMoveColor(),
                goPoint.goVertex.x,
                goPoint.goVertex.y);
        }
    }

    $scope.pass = function() {

        isMoveSubmissionInProgress = true;
        updateThisPlayerCanPlayMove();
        updateDrawingServiceUserInteraction();

        webSocketService.submitNewGameMovePass(
            gameID,
            goGame.getNextMoveColor());
    };

    webSocketService.addSubmitNewGameMoveListener(handleSubmitNewGameMove);
    function handleSubmitNewGameMove(success, gameMoveJsonObject, gameState, errorMessage) {

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
                updateThisPlayerCanPlayMove();
                updateThisPlayerCanSubmitScoreProposal();
                updateDrawingServiceUserInteraction();

                // At least the number of captured stones in territory scoring
                // must be updated
                goGame.goScore.calculate();
                updateScoringData();

                // Move from GAME_STATE_INPROGRESS_PLAYING to
                // GAME_STATE_INPROGRESS_SCORING if the server instructs us
                // to do so
                if (gameState === GAME_STATE_INPROGRESS_SCORING)
                {
                    goGame.setState(GAME_STATE_INPROGRESS_SCORING);

                    updateThisPlayerCanPlayMove();
                    updateThisPlayerCanSubmitScoreProposal();
                    updateDrawingServiceUserInteraction();

                    $scope.activateScoringMode();
                    dataTypeShown = BOARDVIEW_DATATYPE_SCORE;
                }
            });

            drawingService.drawGoBoardAfterNewGameMoveWasPlayed();
            updateDrawingServiceUserInteraction();
        }
        else
        {
            errorHandlingService.showServerError(errorMessage);

            // We can confidently clear the submission flag because even
            // though the WebSocket error response data does not include
            // a game ID, we know that the server only sends us an error
            // response after we made a request
            $scope.$apply(function() {
                isMoveSubmissionInProgress = false;
            });
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

    $scope.resign = function() {
        $rootScope.$broadcast(ANGULARNAME_EVENT_SHOWCONFIRMGAMERESIGNMODAL, function() {

            // Prevent any further interaction until we receive
            // the server response
            isMoveSubmissionInProgress = true;
            isScoreProposalSubmissionInProgress = true;
            updateThisPlayerCanPlayMove();
            updateThisPlayerCanSubmitScoreProposal();
            updateDrawingServiceUserInteraction();

            webSocketService.resignGame(gameID);

            // TODO: Add "waiting for server response" modal
        });
    };

    webSocketService.addResignGameListener(handleResignGame);
    function handleResignGame(success, gameJsonObject, errorMessage) {

        if (success)
        {
            // The server sends us resignations for all games that the currently
            // logged in user is playing, but we are interested only if the
            // resignation is for the game that the user is currently viewing
            if (gameJsonObject.gameID !== gameID)
                return;

            // Clear the submission flag only if the response is for the
            // game that the user is currently viewing
            isMoveSubmissionInProgress = false;
            isScoreProposalSubmissionInProgress = false;

            $scope.$apply(function() {
                // A resigned game has no score
                score = undefined;
                scoreDetails = undefined
                applyScoreDetails();
                thisPlayerHasChangedScoreProposal = false;

                gameResult = gameJsonObject.gameResult;
                updateGameResult();

                if (goGame.getState() === GAME_STATE_INPROGRESS_PLAYING)
                {
                    $scope.activateScoringMode();
                    dataTypeShown = BOARDVIEW_DATATYPE_SCORE;
                }
                else
                {
                    // For the remaining states scoring mode is already
                    // activated
                }

                goGame.goScore.calculate();
                updateScoringData();

                goGame.setState(GAME_STATE_FINISHED);

                updateThisPlayerCanPlayMove();
                updateThisPlayerCanSubmitScoreProposal();
                updateDrawingServiceUserInteraction();

                drawingService.drawGoBoardAfterScoreChange();
            });
        }
        else
        {
            errorHandlingService.showServerError(errorMessage);

            // We can confidently clear the submission flag because even
            // though the WebSocket error response data does not include
            // a game ID, we know that the server only sends us an error
            // response after we made a request
            $scope.$apply(function() {
                isMoveSubmissionInProgress = false;
                isScoreProposalSubmissionInProgress = false;
            });
        }
    }

    function updateGameResult() {
        if (gameResult === undefined)
        {
            $scope.gameResult = "Game result not available.";
        }
        else
        {
            var otherPlayerDisplayName;
            if (thisPlayerColor === COLOR_BLACK)
                otherPlayerDisplayName = $scope.boardPlayerInfoWhite.userInfo.displayName;
            else
                otherPlayerDisplayName = $scope.boardPlayerInfoBlack.userInfo.displayName;

            switch (gameResult.resultType)
            {
                case GAMERESULT_RESULTTYPE_WINBYPOINTS:
                    if (gameResult.winningStoneColor === thisPlayerColor)
                        $scope.gameResult = otherPlayerDisplayName + " has won by ";
                    else
                        $scope.gameResult = "You have won by ";
                    $scope.gameResult += fractionalNumberToString(gameResult.winningPoints);
                    $scope.gameResult += " points.";
                    break;
                case GAMERESULT_RESULTTYPE_DRAW:
                    $scope.gameResult = "The game is a draw.";
                    break;
                case GAMERESULT_RESULTTYPE_WINBYRESIGNATION:
                    if (gameResult.winningStoneColor === thisPlayerColor)
                        $scope.gameResult = otherPlayerDisplayName + " has resigned.";
                    else
                        $scope.gameResult = "You have resigned.";
                    break;
                default:
                    throw new Error("Unknown game result type " + gameResult.resultType);
            }
        }
    }

    // ----------------------------------------------------------------------
    // Handle scoring mode data and operations
    // ----------------------------------------------------------------------

    $scope.beginMarkingDeadStones = function() {
        scoringMarkMode = SCORINGMARKMODE_DEAD;
    };

    $scope.beginMarkingStonesInSeki = function() {
        scoringMarkMode = SCORINGMARKMODE_SEKI;
    };

    $scope.isMarkDeadActivated = function() {
        return (scoringMarkMode === SCORINGMARKMODE_DEAD);
    };

    $scope.isMarkSekiActivated = function() {
        return (scoringMarkMode === SCORINGMARKMODE_SEKI);
    };

    $scope.isRevertToOpponentScoreProposalButtonDisabled = function() {
        if ($scope.isRevertToOpponentScoreProposalButtonShown())
            return (! thisPlayerCanSubmitScoreProposal);
        else
            return true;
    };

    $scope.isRevertToOpponentScoreProposalButtonShown = function() {
        // Basic rule: Show revert button only if accept button is also
        // shown. But revert button remains hidden if there's no score
        // proposal to revert to.
        if ($scope.isSubmitScoreProposalButtonShown())
            return (score !== undefined);
        else
            return false;
    };

    $scope.isResignButtonScoringModeDisabled = function() {
        if ($scope.isSubmitScoreProposalButtonShown())
        {
            if ($scope.isSubmitScoreProposalButtonDisabled())
                return true;
            else
                return false;
        }
        else if ($scope.isAcceptScoreProposalButtonShown())
        {
            if ($scope.isAcceptScoreProposalButtonDisabled())
                return true;
            else
                return false;
        }
        else
        {
            return false;
        }
    };

    $scope.isResignButtonScoringModeShown = function() {
        if ($scope.isSubmitScoreProposalButtonShown())
            return true;
        else if ($scope.isAcceptScoreProposalButtonShown())
            return true;
        else
            return false;
    };

    $scope.isSubmitScoreProposalButtonDisabled = function() {
        if ($scope.isSubmitScoreProposalButtonShown())
            return (! thisPlayerCanSubmitScoreProposal);
        else
            return true;
    };

    $scope.isSubmitScoreProposalButtonShown = function() {
        if ($scope.isBoardShown())
        {
            if (goGame.getState() !== GAME_STATE_INPROGRESS_SCORING)
                return false;
            else if ($scope.isAcceptScoreProposalButtonShown())
                return false;  // don't show accept and submit button at the same time
            else
                return true;
        }
        else
        {
            return false;
        }
    };

    $scope.isAcceptScoreProposalButtonDisabled = function() {
        if ($scope.isAcceptScoreProposalButtonShown())
            return (! thisPlayerCanSubmitScoreProposal);
        else
            return true;
    };

    $scope.isAcceptScoreProposalButtonShown = function() {
        if ($scope.isBoardShown())
        {
            if (goGame.getState() !== GAME_STATE_INPROGRESS_SCORING)
                return false;
            else
                return (score !== undefined && ! thisPlayerHasChangedScoreProposal);
        }
        else
        {
            return false;
        }
    };

    $scope.isScoringModeNotActivated = function() {
        return ! $scope.isScoringModeActivated();
    };

    $scope.isAreaScoring = function() {
        if ($scope.isBoardShown())
            return (goGame.goGameRules.scoringSystem === SCORINGSYSTEM_AREA_SCORING);
        else
            return false;  // we get here on page reload: goGame does not exist yet
    };

    $scope.isTerritoryScoring = function() {
        if ($scope.isBoardShown())
            return (goGame.goGameRules.scoringSystem === SCORINGSYSTEM_TERRITORY_SCORING);
        else
            return false;  // we get here on page reload: goGame does not exist yet
    };

    function updateScoringData() {
        $scope.scoreKomi = fractionalNumberToString(goGame.goScore.komi);
        $scope.scoreHandicapCompensationWhite = goGame.goScore.handicapCompensationWhite;
        if ($scope.isScoringModeActivated())
        {
            $scope.scoreAliveBlack = goGame.goScore.aliveBlack;
            $scope.scoreAliveWhite = goGame.goScore.aliveWhite;
            $scope.scoreDeadWhite = goGame.goScore.deadWhite;
            $scope.scoreDeadBlack = goGame.goScore.deadBlack;
            $scope.scoreTerritoryBlack = goGame.goScore.territoryBlack;
            $scope.scoreTerritoryWhite = goGame.goScore.territoryWhite;
        }
        else
        {
            var notAvailableString = "n/a";
            $scope.scoreAliveBlack = notAvailableString;
            $scope.scoreAliveWhite = notAvailableString;
            $scope.scoreDeadWhite = notAvailableString;
            $scope.scoreDeadBlack = notAvailableString;
            $scope.scoreTerritoryBlack = notAvailableString;
            $scope.scoreTerritoryWhite = notAvailableString;
        }
        $scope.scoreCapturedByBlack = goGame.goScore.capturedByBlack;
        $scope.scoreCapturedByWhite = goGame.goScore.capturedByWhite;
        $scope.scoreTotalScoreBlack = fractionalNumberToString(goGame.goScore.totalScoreBlack);
        $scope.scoreTotalScoreWhite = fractionalNumberToString(goGame.goScore.totalScoreWhite);
        switch (goGame.goScore.result)
        {
            case GAMERESULT_BLACKHASWON:
                var score = goGame.goScore.totalScoreBlack - goGame.goScore.totalScoreWhite;
                $scope.scoreFinalScore = "Black wins by " + fractionalNumberToString(score);
                break;
            case GAMERESULT_WHITEHASWON:
                var score = goGame.goScore.totalScoreWhite - goGame.goScore.totalScoreBlack;
                $scope.scoreFinalScore = "White wins by " + fractionalNumberToString(score);
                break;
            case GAMERESULT_TIE:
                $scope.scoreFinalScore = "Game is a draw";
                break;
            default:
                throw new Error("Unknown game result " + goGame.goScore.result);
        }
        $scope.scoreScoringSystem = "(" + scoringSystemToString(goGame.goGameRules.scoringSystem) + ")";
    }

    $scope.revertToOpponentScoreProposal = function () {
        applyScoreDetails();
        thisPlayerHasChangedScoreProposal = false;

        goGame.goScore.calculate();
        updateScoringData();

        drawingService.drawGoBoardAfterScoreChange();
    };

    $scope.submitScoreProposal = function () {

        // TODO Should we not allow submission if inconsistent territory exists?

        var scoreDetails = [];

        var allRegions = goGame.goBoard.getRegions();
        allRegions.forEach(function(goBoardRegion) {

            // We want to transmit only regions that are stone groups
            // that are either dead or in seki. Everything else can
            // be derived from these two pieces of information:
            // - Remaining stone groups must be alive
            // - Regions that consist of empty intersections are
            //   territory, whether or not it's neutral or any color
            //   is determined by the surrounding stone groups
            if (! goBoardRegion.isStoneGroup())
                return;
            var stoneGroupState = goBoardRegion.getStoneGroupState();
            if (stoneGroupState !== STONEGROUPSTATE_DEAD && stoneGroupState !== STONEGROUPSTATE_SEKI)
                return;

            // The first intersection of the stone group is representative
            // for the entire group. We are safe accessing the array's
            // first elemnt because regions cannot be empty.
            var goPoint = goBoardRegion.getPoints()[0];

            var scoreDetail =
                {
                    vertexX: goPoint.goVertex.x,
                    vertexY: goPoint.goVertex.y,
                    stoneGroupState: stoneGroupState
                };

            scoreDetails.push(scoreDetail);
        });

        // TODO: Compare the new proposal to the previous proposal
        // If they are the same, let the user know

        isScoreProposalSubmissionInProgress = true;
        updateThisPlayerCanSubmitScoreProposal();
        updateDrawingServiceUserInteraction();

        webSocketService.submitNewScoreProposal(gameID, scoreDetails);
    };

    webSocketService.addSubmitNewScoreProposalListener(handleSubmitNewScoreProposal);
    function handleSubmitNewScoreProposal(success, scoreJsonObject, scoreDetailsJsonObject, errorMessage) {

        if (success)
        {
            // The server sends us score proposals for all games that the
            // currently logged in user is playing, but we are interested
            // only in those score proposals that are for the game that
            // the user is currently viewing
            if (scoreJsonObject.gameID !== gameID)
                return;

            // Clear the submission flag only if the response is for the
            // game that the user is currently viewing
            isScoreProposalSubmissionInProgress = false;

            score = scoreJsonObject;
            scoreDetails = scoreDetailsJsonObject;

            // TODO: Only apply if we're in scoring mode
            // TODO: Reapply when we enter scoring mode
            applyScoreDetails();
            thisPlayerHasChangedScoreProposal = false;

            $scope.$apply(function() {

                updateThisPlayerCanSubmitScoreProposal();
                updateDrawingServiceUserInteraction();

                goGame.goScore.calculate();
                updateScoringData();
            });

            drawingService.drawGoBoardAfterScoreChange();
        }
        else
        {
            errorHandlingService.showServerError(errorMessage);

            // We can confidently clear the submission flag because even
            // though the WebSocket error response data does not include
            // a game ID, we know that the server only sends us an error
            // response after we made a request
            $scope.$apply(function() {
                isScoreProposalSubmissionInProgress = false;
            });
        }
    }

    function applyScoreDetails()
    {
        // Pass 1: Reset all stone groups back to alive.
        var allRegions = goGame.goBoard.getRegions();
        allRegions.forEach(function(goBoardRegion) {
            if (goBoardRegion.isStoneGroup())
                goBoardRegion.setStoneGroupState(STONEGROUPSTATE_ALIVE);

        });

        // Skip pass 2 if we have no score details. This is possible
        // for resigned games
        if (scoreDetails === undefined)
            return;

        // Pass 2: Apply the dead/seki state for which we have explicit
        // information. Stone groups that have been marked as alive
        // in pass 1 are now turned again.
        scoreDetails.forEach(function(scoreDetail) {
            var goPoint = goGame.goBoard.getPointAtVertexCoordinates(
                scoreDetail.vertexX,
                scoreDetail.vertexY);

            // A minimalistic check that the score detail contains
            // correct data - although we *should* trust our own data :-/
            if (! goPoint.hasStone())
                throw new Error("Intersection is not occupied but score detail says it should be: " + goPoint.goVertex);

            goPoint.goBoardRegion.setStoneGroupState(scoreDetail.stoneGroupState);
        });
    }

    $scope.acceptScoreProposal = function () {

        var resultType;
        var winningStoneColor;
        var winningPoints;
        switch (goGame.goScore.result)
        {
            case GAMERESULT_BLACKHASWON:
                resultType = GAMERESULT_RESULTTYPE_WINBYPOINTS;
                winningStoneColor = COLOR_BLACK;
                winningPoints = goGame.goScore.totalScoreBlack - goGame.goScore.totalScoreWhite;
                break;
            case GAMERESULT_WHITEHASWON:
                resultType = GAMERESULT_RESULTTYPE_WINBYPOINTS;
                winningStoneColor = COLOR_WHITE;
                winningPoints = goGame.goScore.totalScoreWhite - goGame.goScore.totalScoreBlack;
                break;
            case GAMERESULT_TIE:
                resultType = GAMERESULT_RESULTTYPE_DRAW;
                winningStoneColor = COLOR_NONE;
                winningPoints = WINNINGPOINTS_UNDEFINED;
                break;
            default:
                throw new Error("Unknown score result " + goGame.goScore.result);
        }

        $rootScope.$broadcast(ANGULARNAME_EVENT_SHOWCONFIRMACCEPTSCOREPROPOSALMODAL, function() {

            // Accepting a proposal is just another form of
            // score proposal submission
            isScoreProposalSubmissionInProgress = true;
            updateThisPlayerCanSubmitScoreProposal();
            updateDrawingServiceUserInteraction();

            webSocketService.acceptScoreProposal(
                gameID,
                resultType,
                winningStoneColor,
                winningPoints);

            // TODO: Add "waiting for server response" modal
        });
    };

    webSocketService.addAcceptScoreProposalListener(handleAcceptScoreProposal);
    function handleAcceptScoreProposal(success, responseGameID, errorMessage) {
        if (success)
        {
            // The server sends us acceptance notifications for all games that
            // the currently logged in user is playing, but we are interested
            // only in those notifications that are for the game that the user
            // is currently viewing
            if (responseGameID !== gameID)
                return;

            // Clear the submission flag only if the response is for the
            // game that the user is currently viewing
            isScoreProposalSubmissionInProgress = false;

            $scope.$apply(function() {
                goGame.setState(GAME_STATE_FINISHED);

                updateThisPlayerCanPlayMove();
                updateThisPlayerCanSubmitScoreProposal();
                updateDrawingServiceUserInteraction();
            });
        }
        else
        {
            errorHandlingService.showServerError(errorMessage);

            // We can confidently clear the submission flag because even
            // though the WebSocket error response data does not include
            // a game ID, we know that the server only sends us an error
            // response after we made a request
            $scope.$apply(function() {
                isScoreProposalSubmissionInProgress = false;
            });
        }
    }

    // ----------------------------------------------------------------------
    // Handle data switching operations
    // ----------------------------------------------------------------------

    $scope.showGameMoves = function() {
        dataTypeShown = BOARDVIEW_DATATYPE_GAMEMOVES;
    };

    $scope.showScore = function() {
        dataTypeShown = BOARDVIEW_DATATYPE_SCORE;
    };

    $scope.areGameMovesShown = function() {
        return (dataTypeShown === BOARDVIEW_DATATYPE_GAMEMOVES);
    };

    $scope.isScoreShown = function() {
        return (dataTypeShown === BOARDVIEW_DATATYPE_SCORE);
    };

    $scope.isScoringTableShown = function() {
        if (dataTypeShown !== BOARDVIEW_DATATYPE_SCORE)
            return false;
        else if (gameResult !== undefined && gameResult.resultType === GAMERESULT_RESULTTYPE_WINBYRESIGNATION)
            return false;
        else
            return true;
    };

    $scope.isGameResultShown = function() {
        if (dataTypeShown !== BOARDVIEW_DATATYPE_SCORE)
            return false;
        // Show the game result only for games won by resignation,
        // because for those games there is no score and displaying
        // the scoring table therefore does not make much sense
        else if (gameResult !== undefined && gameResult.resultType === GAMERESULT_RESULTTYPE_WINBYRESIGNATION)
            return true;
        else
            return false;
    };

    // ----------------------------------------------------------------------
    // Compute board dimension & handle window resizes
    // ----------------------------------------------------------------------

    // Resize throttling solution from
    // https://developer.mozilla.org/en-US/docs/Web/Events/resize
    var resizeTimeoutID = undefined;
    window.addEventListener("resize", resizeThrottler);
    function resizeThrottler() {
        // Ignore the resize event if a call to actualResizeHandler is
        // already scheduled.
        if (resizeTimeoutID !== undefined)
            return;

        // Schedule a call to actualResizeHandler
        resizeTimeoutID = setTimeout(function() {
            resizeTimeoutID = undefined;
            actualResizeHandler();
        }, RESIZE_INTERVAL_IN_MILLISECONDS);
    }

    function actualResizeHandler() {
        if (! $scope.isBoardShown())
            return;

        updateCanvasDimensionAndDrawGoBoardIfChanged();

        // TODO Calculate height of game move table
    }

    function updateCanvasDimension() {
        var canvasDimension = calculateCanvasDimension();
        drawingService.setCanvasDimension(canvasDimension);
    }

    function updateCanvasDimensionAndDrawGoBoardIfChanged() {
        var canvasDimension = calculateCanvasDimension();
        drawingService.setCanvasDimensionAndDrawGoBoardIfChanged(canvasDimension);
    }

    // The board view appears in one of two layouts:
    // 1) The left and right side are displayed side-by-side. This layout
    //    is in effect as long as the browser window has sufficient width.
    //    In this layout the main goal is that the canvas remains visible
    //    within the browser window without scrolling.
    // 2) The left and right side are displayed vertically stacked. This
    //    layout is in effect when the browser window becomes too narrow.
    //    In this layout the canvas is not vertically constrained.
    //    Horizontally, though, it must fit into the browser window.
    //
    // The algorithm works like this:
    // 1. Determine canvas container content width.
    // 2. Do we have layout 2?
    //    >>> Yes: The canvas dimension is the container content width
    //        from step 1. The algorithm ends.
    //    >>> No: Continue with step 3.
    // 3. Determine maximum possible height so that the canvas vertically
    //    still fits into the browser window.
    // 4. The canvas dimension is the smaller of the two values
    //    - Canvas container content width (step 1)
    //    - Maximum possible canvas height (step 3)
    //
    // Manual testing:
    // - Game with no moves
    // - Game with many moves
    // - Very wide browser window. The canvas is capped by the browser window
    //   height. The canvas is horizontally centered. There's a small gap
    //   between the canvas bottom and the browser window bottom edge.
    // - Medium wide browser window. The canvas is capped by the container
    //   content width. The canvas is vertically centered.
    // - Narrow browser window. The canvas is capped by the browser window
    //   width. The canvas is horizontally centered. There's a small gap
    //   between the canvas bottom and the user info section.
    // - Reload the page
    // - Navigate to the page from the "games in progress" or
    //   the "finished games" tab
    // - Resize browser window while the window is scrolled down
    function calculateCanvasDimension()
    {
        // TODO: Don't use jQuery
        var jQueryObjectContainerCanvas = $("#" + ID_BOARD_LEFT_HAND_SIDE);
        var domElementContainerCanvas = jQueryObjectContainerCanvas.get(0);
        var jQueryObjectLineBreak = $("#" + ID_BOARD_LINE_BREAK);
        var domElementLineBreak = jQueryObjectLineBreak.get(0);

        // Here we find out which of the two layouts currently is in effect.
        // If the "line break" element is not visible, i.e. has display "none",
        // then layout 1 is in effect. Otherwise layout 2 is in effect.
        var styleLineBreak = window.getComputedStyle(domElementLineBreak);
        var verticallyStackedLayout = (styleLineBreak.display !== "none");

        // Usually offsetWidth and offsetHeight are the same as the dimensions
        // of the rectangle returned by getBoundingClientRect(). This
        // information is from
        // https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
        //
        // Experimentally determined in Firefox and Safari, though, that
        // offsetWidth and offsetHeight are rounded values, whereas the
        // bounding rectangle contains exact values. Rounded values are bad
        // because rounding up yields values that are too high. Exact values
        // are preferrable because those can be truncated with Math.floor().
        // This way it is guaranteed that the board always fits within its
        // container.
        //
        // Important notes:
        // - The bounding rectangle includes border and padding, but excludes
        //   margin.
        // - The bounding rectangle is not affected by the value of the
        //   box-sizing CSS property.
        // - The bounding rectangle coordinates are relative to the window's
        //   current scroll position. So if the user has scrolled down the
        //   document, the top position of the rectangle might very well be
        //   a negative value. For calculating the rectangle's width and
        //   height, though, this does not matter.
        var boundingClientRect = domElementContainerCanvas.getBoundingClientRect();
        var containerCanvasContentWidthIncludingBorderAndPadding = (boundingClientRect.right - boundingClientRect.left);
        var containerCanvasContentHeightIncludingBorderAndPadding = (boundingClientRect.bottom - boundingClientRect.top);

        // We have to determine border and padding to subtract them from the
        // bounding rectangle. It appears as if getComputedStyle is the only
        // way to do this. Alas, getComputedStyle yields values such as
        // "123.45px", so we have to use parseFloat to extract the numeric
        // value.
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle
        var styleContainerCanvas = window.getComputedStyle(domElementContainerCanvas);

        var horizontalBorder = parseFloat(styleContainerCanvas.borderLeftWidth) + parseFloat(styleContainerCanvas.borderRightWidth);
        var horizontalPadding = parseFloat(styleContainerCanvas.paddingLeft) + parseFloat(styleContainerCanvas.paddingRight);
        var verticalBorder = parseFloat(styleContainerCanvas.borderTopWidth) + parseFloat(styleContainerCanvas.borderTopWidth);
        var verticalPadding = parseFloat(styleContainerCanvas.paddingTop) + parseFloat(styleContainerCanvas.paddingBottom);
        var marginBottom = parseFloat(styleContainerCanvas.marginBottom);

        // Here we have a theoretical canvas width/height that would fit into
        // the container's current content box.
        // This is step 1 of the algorithm outlined in the method
        // documentation.
        var containerCanvasContentWidth =  Math.floor(containerCanvasContentWidthIncludingBorderAndPadding - horizontalBorder - horizontalPadding);
        var containerCanvasContentHeight =  Math.floor(containerCanvasContentHeightIncludingBorderAndPadding - verticalBorder - verticalPadding);

        // This is step 2 of the algorithm outlined in the method
        // documentation.
        // Note: The gap after the canvas bottom is achieved by a CSS rule
        // that defines a bottom margin.
        if (verticallyStackedLayout)
            return containerCanvasContentWidth;

        // This is step 3 of the algorithm outlined in the method
        // documentation.
        // Important: We can't use the container content box height because
        // this could be very low - if the game moves table on the right-hand
        // side doesn't contain anything, the document body will not extend
        // down to the bottom of the browser window, therefore the container
        // will also have a height that is too small.
        var absoluteTopPosition = (boundingClientRect.top + window.scrollY);
        var maximumPossibleHeight = window.innerHeight - absoluteTopPosition;
        // We have to incorporate the bottom margin defined by one of our
        // CSS rules into the calculation, otherwise the canvas will vertically
        // overflow its container and touch the browser window bottom.
        maximumPossibleHeight -= parseFloat(styleContainerCanvas.marginBottom);
        maximumPossibleHeight = Math.floor(maximumPossibleHeight);

        // This is step 4 of the algorithm outlined in the method
        // documentation.
        var cappedCanvasDimension = Math.min(containerCanvasContentWidth, maximumPossibleHeight);
        return cappedCanvasDimension;
    }

    // ----------------------------------------------------------------------
    // Controller initialization and destruction
    // ----------------------------------------------------------------------

    if (webSocketService.isReady())
        getGame();
    else
        webSocketService.addServiceIsReadyListener(handleWebSocketServiceIsReady);

    function handleWebSocketServiceIsReady() {
        $scope.$apply(function() {
            getGame();
        });
    }

    $scope.$on("$destroy", function() {
        webSocketService.removeServiceIsReadyListener(handleWebSocketServiceIsReady);
        webSocketService.removeGetGameListener(handleGetGame);
        webSocketService.removeSubmitNewGameMoveListener(handleSubmitNewGameMove);
        webSocketService.removeResignGameListener(handleResignGame);
        webSocketService.removeSubmitNewScoreProposalListener(handleSubmitNewScoreProposal);
        webSocketService.removeAcceptScoreProposalListener(handleAcceptScoreProposal);
        drawingService.removeDidClickOnIntersectionListener(handleDidClickOnIntersection);
        window.removeEventListener("resize", resizeThrottler);
    });
}]);
