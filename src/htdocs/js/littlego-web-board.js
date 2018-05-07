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

            var goGameRules = new GoGameRules(
                gameInProgressJsonObject.koRule,
                gameInProgressJsonObject.scoringSystem);
            var goGame = new GoGame(
                gameInProgressJsonObject.boardSize,
                gameInProgressJsonObject.handicap,
                gameInProgressJsonObject.komi,
                goGameRules);

            // TODO: Create GoBoard and GoMove objects

            var blackPlayerUserInfo = new UserInfo(gameInProgressJsonObject.blackPlayer);
            var boardPlayerInfoBlack = new BoardPlayerInfoBlack(blackPlayerUserInfo, goGame);
            var whitePlayerUserInfo = new UserInfo(gameInProgressJsonObject.whitePlayer);
            var boardPlayerInfoWhite = new BoardPlayerInfoWhite(whitePlayerUserInfo, goGame);
            this.updateBoardPlayerInfo(boardPlayerInfoBlack, boardPlayerInfoWhite);

            // Start drawing the board AFTER the board container has been
            // made visible, otherwise the container has width/height 0.
            var containerBoard = $("#" + ID_CONTAINER_BOARD);
            drawGoBoard(containerBoard);
        }
        else
        {
            // TODO: Add error handling
        }
    };

    Board.prototype.updateBoardPlayerInfo = function(boardPlayerInfoBlack, boardPlayerInfoWhite)
    {
        $("#" + ID_BOARD_PLAYER_NAME_BLACK).html(
            boardPlayerInfoBlack.userInfo.displayName);
        $("#" + ID_BOARD_NUMBER_OF_CAPTURES_BLACK).html(
            numberOfCapturedStonesToString(boardPlayerInfoBlack.numberOfCapturedStones));

        $("#" + ID_BOARD_PLAYER_NAME_WHITE).html(
            boardPlayerInfoWhite.userInfo.displayName);
        $("#" + ID_BOARD_NUMBER_OF_CAPTURES_WHITE).html(
            numberOfCapturedStonesToString(boardPlayerInfoWhite.numberOfCapturedStones));

        $("#" + ID_BOARD_KOMI).html(
            komiToString(boardPlayerInfoWhite.komi));
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
            var goMove = goGame.firstMove;
            while (goMove !== null)
            {
                if (goMove.goPlayer.isBlack())
                    this.numberOfCapturedStones += goMove.capturedStones.length;
                goMove = goMove.nextGoMove;
            }
        }
    }

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
            var goMove = goGame.firstMove;
            while (goMove !== null)
            {
                if (!goMove.goPlayer.isBlack())
                    this.numberOfCapturedStones += goMove.capturedStones.length;
                goMove = goMove.nextGoMove;
            }
        }
    }

    return BoardPlayerInfoWhite;
})();
