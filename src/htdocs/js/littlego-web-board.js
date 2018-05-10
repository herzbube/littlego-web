// ----------------------------------------------------------------------
// This file contains the code that manages everything on the Go board.
// ----------------------------------------------------------------------

var Board = (function ()
{
    "use strict";

    function Board(webSocket, callbackBoardDataHasFinishedLoading)
    {
        this.webSocket = webSocket;

        var self = this;
        this.webSocket.addEventListener("message", function(event) {
            self.handleWebSocketMessage(event);
        });

        this.onBoardDataHasFinishedLoading = callbackBoardDataHasFinishedLoading;

        $("#" + ID_BUTTON_BOARD_MODE_PLAY).on("click", function(event) {
            self.onBoardModePlay(event);
        });
        $("#" + ID_BUTTON_BOARD_MODE_ANALYZE).on("click", function(event) {
            self.onBoardModeAnalyze(event);
        });
        $("#" + ID_BUTTON_BOARD_MODE_SCORING).on("click", function(event) {
            self.onBoardModeScoring(event);
        });

        this.makeBoardControlsContainerVisible(ID_CONTAINER_BOARD_CONTROLS_PLAY_MODE, ID_BUTTON_BOARD_MODE_PLAY);

        this.goGame = null;
        this.boardPlayerInfoBlack = null;
        this.boardPlayerInfoWhite = null;
        this.drawingController = null;
        this.gameID = GAMEID_UNDEFINED;
    }

    // Internal function. Handles incoming WebSocket messages that are
    // responses to messages sent by the Board object.
    Board.prototype.handleWebSocketMessage = function(event)
    {
        var webSocketMessage = JSON.parse(event.data);

        switch (webSocketMessage.messageType)
        {
            case WEBSOCKET_RESPONSE_TYPE_GETGAMEINPROGRESSWITHMOVES:
                this.onGetGameInProgressWithMovesComplete(
                    webSocketMessage.data.success,
                    webSocketMessage.data.gameInProgress,
                    webSocketMessage.data.gameMoves,
                    webSocketMessage.data.errorMessage);
                break;

            case WEBSOCKET_RESPONSE_TYPE_SUBMITNEWGAMEMOVE:
                this.onSubmitNewGameMoveComplete(
                    webSocketMessage.data.success,
                    webSocketMessage.data.gameMove,
                    webSocketMessage.data.errorMessage);
                break;

            default:
                // Ignore all messages that are not board related
                break;
        }
    };

    // Initiates retrieval via WebSocket of the data that is required to show
    // the game in progress with the specified ID on the game board. Shows a
    // placeholder message while we are still waiting for the WebSocket
    // response from the server.
    Board.prototype.setupBoardForGameInProgress = function(gameID)
    {
        // This method can be called many times, so we have to reset
        // some member variables on every call
        this.goGame = null;
        this.boardPlayerInfoBlack = null;
        this.boardPlayerInfoWhite = null;
        this.drawingController = null;
        this.gameID = GAMEID_UNDEFINED;

        var messageData =
            {
                gameID: gameID
            };
        // Triggers onGetGameInProgressWithMovesComplete
        sendWebSocketMessage(this.webSocket, WEBSOCKET_REQUEST_TYPE_GETGAMEINPROGRESSWITHMOVES, messageData);
    };

    // This function is responsible for setting up all view model objects
    // and Go model objects that are required on the Go board.
    Board.prototype.onGetGameInProgressWithMovesComplete = function(
        success,
        gameInProgressJsonObject,
        gameMovesJsonObjects,
        errorMessage)
    {
        if (success)
        {
            if (this.onBoardDataHasFinishedLoading !== undefined)
                this.onBoardDataHasFinishedLoading();

            var goBoard = new GoBoard(
                gameInProgressJsonObject.boardSize);
            var goGameRules = new GoGameRules(
                gameInProgressJsonObject.koRule,
                gameInProgressJsonObject.scoringSystem);
            this.goGame = new GoGame(
                goBoard,
                gameInProgressJsonObject.handicap,
                gameInProgressJsonObject.komi,
                goGameRules);

            gameMovesJsonObjects.forEach(function(gameMoveJsonObject) {
                // TODO: Display progress

                this.playGameMoveJsonObject(gameMoveJsonObject);
            }, this);

            var blackPlayerUserInfo = new UserInfo(gameInProgressJsonObject.blackPlayer);
            this.boardPlayerInfoBlack = new BoardPlayerInfoBlack(blackPlayerUserInfo, this.goGame);
            var whitePlayerUserInfo = new UserInfo(gameInProgressJsonObject.whitePlayer);
            this.boardPlayerInfoWhite = new BoardPlayerInfoWhite(whitePlayerUserInfo, this.goGame);
            this.updateBoardPlayerInfo();

            // Start drawing the board AFTER the board container has been
            // made visible, otherwise the container has width/height 0.
            var containerBoard = $("#" + ID_CONTAINER_BOARD);
            var self = this;
            this.drawingController = new DrawingController(containerBoard, this.goGame, function(goPoint) {
                self.onDidPlayStone(goPoint);
            });
            this.drawingController.drawGoBoard();

            // Last but not least: Remember the game ID so that we can
            // submit moves
            this.gameID = gameInProgressJsonObject.gameID;
        }
        else
        {
            // TODO: Add error handling
        }
    };

    Board.prototype.updateBoardPlayerInfo = function()
    {
        $("#" + ID_BOARD_PLAYER_NAME_BLACK).html(
            this.boardPlayerInfoBlack.userInfo.displayName);
        $("#" + ID_BOARD_NUMBER_OF_CAPTURES_BLACK).html(
            numberOfCapturedStonesToString(this.boardPlayerInfoBlack.numberOfCapturedStones));

        $("#" + ID_BOARD_PLAYER_NAME_WHITE).html(
            this.boardPlayerInfoWhite.userInfo.displayName);
        $("#" + ID_BOARD_NUMBER_OF_CAPTURES_WHITE).html(
            numberOfCapturedStonesToString(this.boardPlayerInfoWhite.numberOfCapturedStones));

        $("#" + ID_BOARD_KOMI).html(
            komiToString(this.boardPlayerInfoWhite.komi));
    };

    Board.prototype.onBoardModePlay = function(event)
    {
        this.makeBoardControlsContainerVisible(ID_CONTAINER_BOARD_CONTROLS_PLAY_MODE, ID_BUTTON_BOARD_MODE_PLAY);
    };

    Board.prototype.onBoardModeAnalyze = function(event)
    {
        this.makeBoardControlsContainerVisible(ID_CONTAINER_BOARD_CONTROLS_ANALYZE_MODE, ID_BUTTON_BOARD_MODE_ANALYZE);
    };

    Board.prototype.onBoardModeScoring = function(event)
    {
        this.makeBoardControlsContainerVisible(ID_CONTAINER_BOARD_CONTROLS_SCORING_MODE, ID_BUTTON_BOARD_MODE_SCORING);
    };

    Board.prototype.makeBoardControlsContainerVisible = function(boardControlsContainerID, boardModeNavigationButtonID)
    {
        this.hideAllBoardControlsContainers();
        this.deactivateAllBoardModeNavigationTabs();

        $("#" + boardControlsContainerID).show();
        $("#" + boardModeNavigationButtonID).addClass(BOOTSTRAP_CLASS_ACTIVE);
    };

    Board.prototype.hideAllBoardControlsContainers = function()
    {
        // Use the direct child selector for better performance
        $("#" + ID_CONTAINER_BOARD_CONTROLS +  " > div").hide();
    };

    Board.prototype.deactivateAllBoardModeNavigationTabs = function()
    {
        $("#" + ID_CONTAINER_BOARD_MODE_NAVIGATION +  " button").removeClass(BOOTSTRAP_CLASS_ACTIVE);
    };

    Board.prototype.onDidPlayStone = function(goPoint)
    {
        var nextMoveColor = this.goGame.getNextMoveColor();
        var messageData =
            {
                gameID: this.gameID,
                moveType: GOMOVE_TYPE_PLAY,
                moveColor: nextMoveColor,
                vertexX: goPoint.goVertex.x,
                vertexY: goPoint.goVertex.y
            };
        // Triggers onSubmitNewGameMoveComplete
        sendWebSocketMessage(this.webSocket, WEBSOCKET_REQUEST_TYPE_SUBMITNEWGAMEMOVE, messageData);
    };

    Board.prototype.onSubmitNewGameMoveComplete = function(
        success,
        gameMoveJsonObject,
        errorMessage)
    {
        if (success)
        {
            this.playGameMoveJsonObject(gameMoveJsonObject);

            if (this.goGame.getLastMove().goPlayer.isBlack())
                this.boardPlayerInfoBlack.updateAfterGameMoveWasPlayed(this.goGame);
            else
                this.boardPlayerInfoWhite.updateAfterGameMoveWasPlayed(this.goGame);
            this.updateBoardPlayerInfo();

            // TODO: The move can also be played by the other player.

            this.drawingController.updateAfterGameMoveWasPlayed();
        }
        else
        {
            // TODO: Add error handling
        }
    };

    Board.prototype.playGameMoveJsonObject = function(gameMoveJsonObject)
    {
        var expectedNextMoveColor = this.goGame.getNextMoveColor();
        var actualNextMoveColor = gameMoveJsonObject.moveColor;
        if (expectedNextMoveColor !== actualNextMoveColor)
            throw new Error("Expected next move color = " + expectedNextMoveColor + ", actual next move color = " + actualNextMoveColor);

        switch (gameMoveJsonObject.moveType)
        {
            case GOMOVE_TYPE_PLAY:
                var goPoint = this.goGame.goBoard.getPointAtVertexCoordinates(
                    gameMoveJsonObject.vertexX,
                    gameMoveJsonObject.vertexY);
                this.goGame.play(goPoint);
                break;
            case GOMOVE_TYPE_PASS:
                //[self.game pass];
                break;
            default:
                throw new Error("Invalid move type " + gameMoveJsonObject.moveType);
        }
    };

    return Board;
})();

// ----------------------------------------------------------------------
// The BoardPlayerInfoBlack class is a view model class that stores the
// values for displaying information about the black player on the Go
// board.
// ----------------------------------------------------------------------
var BoardPlayerInfoBlack = (function ()
{
    "use strict";

    // Creates a new BoardPlayerInfoBlack object from the data in the
    // specified UserInfo and GoGame objects.
    function BoardPlayerInfoBlack(userInfo, goGame)
    {
        this.userInfo = userInfo;
        this.numberOfCapturedStones = 0;

        if (goGame.hasMoves())
        {
            var goMove = goGame.getFirstMove();
            while (goMove !== null)
            {
                if (goMove.goPlayer.isBlack())
                    this.numberOfCapturedStones += goMove.capturedStones.length;
                goMove = goMove.nextGoMove;
            }
        }
    }

    BoardPlayerInfoBlack.prototype.updateAfterGameMoveWasPlayed = function(goGame)
    {
        var lastMove = goGame.getLastMove();

        if (lastMove.goPlayer.isBlack())
            this.numberOfCapturedStones += lastMove.capturedStones.length;
    };

    return BoardPlayerInfoBlack;
})();

// ----------------------------------------------------------------------
// The BoardPlayerInfoWhite class is a view model class that stores the
// values for displaying information about the white player on the Go
// board.
// ----------------------------------------------------------------------
var BoardPlayerInfoWhite = (function ()
{
    "use strict";

    // Creates a new BoardPlayerInfoWhite object from the data in the
    // specified UserInfo and GoGame objects.
    function BoardPlayerInfoWhite(userInfo, goGame)
    {
        this.userInfo = userInfo;
        this.komi = goGame.komi;
        this.numberOfCapturedStones = 0;

        if (goGame.hasMoves())
        {
            var goMove = goGame.getFirstMove();
            while (goMove !== null)
            {
                if (!goMove.goPlayer.isBlack())
                    this.numberOfCapturedStones += goMove.capturedStones.length;
                goMove = goMove.nextGoMove;
            }
        }
    }

    BoardPlayerInfoWhite.prototype.updateAfterGameMoveWasPlayed = function(goGame)
    {
        var lastMove = goGame.getLastMove();

        if (!lastMove.goPlayer.isBlack())
            this.numberOfCapturedStones += lastMove.capturedStones.length;
    };

    return BoardPlayerInfoWhite;
})();
