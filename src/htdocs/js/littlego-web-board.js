// ----------------------------------------------------------------------
// This file contains the code that manages everything on the Go board.
// ----------------------------------------------------------------------

if (false)
{

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
        $("#" + ID_BUTTON_BOARD_CONTROL_PASS).on("click", function(event) {
            self.onPass(event);
        });
        $("#" + ID_BUTTON_BOARD_CONTROL_RESIGN).on("click", function(event) {
            self.onResign(event);
        });

        this.makeBoardControlsContainerVisible(ID_CONTAINER_BOARD_CONTROLS_PLAY_MODE, ID_BUTTON_BOARD_MODE_PLAY);

        this.goGame = null;
        this.boardPlayerInfoBlack = null;
        this.boardPlayerInfoWhite = null;
        this.drawingController = null;
        this.gameID = GAMEID_UNDEFINED;
        this.userInfo = null;

        this.gameMovesDataTableController = new DataTableController(
            ID_CONTAINER_BOARD_GAME_MOVES,
            NUMBER_OF_COLUMNS_GAME_MOVES_TABLE);
        this.gameMoves = [];
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
    //
    // The specified UserInfo object refers to the currently logged in user,
    // i.e. the user who will make moves on this client.
    Board.prototype.setupBoardForGameInProgress = function(gameID, userInfo)
    {
        // This method can be called many times, so we have to reset
        // some member variables on every call
        this.goGame = null;
        this.boardPlayerInfoBlack = null;
        this.boardPlayerInfoWhite = null;
        this.drawingController = null;
        this.gameID = GAMEID_UNDEFINED;
        this.userInfo = userInfo;

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

            this.gameMoves = [];
            var moveNumber = 0;
            var goMove = this.goGame.getFirstMove();
            while (goMove !== null)
            {
                moveNumber++;
                var gameMove = new GameMove(goMove, moveNumber);
                // unshift() adds to the beginning of the array. We want the
                // last move to appear first in the data table
                this.gameMoves.unshift(gameMove);
                goMove = goMove.getNextGoMove();
            }
            this.updateBoardGameMoveTable();

            var thisPlayerColor;
            if (gameInProgressJsonObject.blackPlayer.userID === this.userInfo.userID)
                thisPlayerColor = COLOR_BLACK;
            else
                thisPlayerColor = COLOR_WHITE;

            // Start drawing the board AFTER the board container has been
            // made visible, otherwise the container has width/height 0.
            var containerBoard = $("#" + ID_CONTAINER_BOARD);
            var self = this;
            this.drawingController = new DrawingController(containerBoard, this.goGame, thisPlayerColor, function(goPoint) {
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

    Board.prototype.updateBoardGameMoveTable = function()
    {
        this.gameMovesDataTableController.updateDataTable(this.gameMoves, "No game moves");
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

    Board.prototype.onPass = function(event)
    {
        var nextMoveColor = this.goGame.getNextMoveColor();
        var messageData =
            {
                gameID: this.gameID,
                moveType: GOMOVE_TYPE_PASS,
                moveColor: nextMoveColor,
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

            var goMove = this.goGame.getLastMove();
            var moveNumber = this.gameMoves.length + 1;
            var gameMove = new GameMove(goMove, moveNumber);
            this.gameMoves.unshift(gameMove);
            this.updateBoardGameMoveTable();

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
                this.goGame.pass();
                break;
            default:
                throw new Error("Invalid move type " + gameMoveJsonObject.moveType);
        }
    };

    Board.prototype.onResign = function(event)
    {
        $("#" + ID_MODAL_NOT_YET_IMPLEMENTED).modal()
    };

    return Board;
})();

}
