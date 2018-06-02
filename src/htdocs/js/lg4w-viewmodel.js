// ----------------------------------------------------------------------
// This file contains the view model classes that are used to populate the
// various tables on the application main tabs.
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// The GameRequest class represents a server-side game request. GameRequest
// objects are view model objects whose values are suitable for displaying in
// the UI. GameRequest objects are created from JSON objects that were
// transmitted by the server. A GameRequest object uses the same property
// names that are specified in the JSON format.
//
// This is the JSON format:
//
// var jsonObject =
// {
//   "gameRequestID" : 12345,        // a unique ID
//   "createTime" : 123457890,       // seconds since the epoch
//   "requestedBoardSize" : 19,      // valid values: see GameInProgress
//   "requestedStoneColor" : 0,      // valid values: see GameInProgress
//   "requestedHandicap" : 0,        // valid values: see GameInProgress
//   "requestedKomi" : 7.5,          // valid values: see GameInProgress
//   "requestedKoRule" : 0,          // valid values: see GameInProgress
//   "requestedScoringSystem" : 0,   // valid values: see GameInProgress
// };
//
// All "requested..." properties can also have the value -1, which
// signifies "no preference".
// ----------------------------------------------------------------------
var GameRequest = (function ()
{
    "use strict";

    const STRING_NOPREFERENCE = "*";

    // Creates a new GameRequest object from the data in the specified
    // JSON object.
    function GameRequest(jsonObject)
    {
        this.gameRequestID = jsonObject.gameRequestID;

        this.createTime = startTimeToString(jsonObject.createTime * 1000);

        if (GAMEREQUEST_NOPREFERENCE === jsonObject.requestedBoardSize)
            this.requestedBoardSize = STRING_NOPREFERENCE;
        else
            this.requestedBoardSize = boardSizeToString(jsonObject.requestedBoardSize);

        if (GAMEREQUEST_NOPREFERENCE === jsonObject.requestedStoneColor)
            this.requestedStoneColor = STRING_NOPREFERENCE;
        else
            this.requestedStoneColor = colorToString(jsonObject.requestedStoneColor);

        if (GAMEREQUEST_NOPREFERENCE === jsonObject.requestedHandicap)
            this.requestedHandicap = STRING_NOPREFERENCE;
        else
            this.requestedHandicap = handicapToString(jsonObject.requestedHandicap);

        if (GAMEREQUEST_NOPREFERENCE === jsonObject.requestedKomi)
            this.requestedKomi = STRING_NOPREFERENCE;
        else
            this.requestedKomi = komiToString(jsonObject.requestedKomi);

        if (GAMEREQUEST_NOPREFERENCE === jsonObject.requestedKoRule)
            this.requestedKoRule = STRING_NOPREFERENCE;
        else
            this.requestedKoRule = koRuleToString(jsonObject.requestedKoRule);

        if (GAMEREQUEST_NOPREFERENCE === jsonObject.requestedScoringSystem)
            this.requestedScoringSystem = STRING_NOPREFERENCE;
        else
            this.requestedScoringSystem = scoringSystemToString(jsonObject.requestedScoringSystem);

        this.state = jsonObject.state;
    }

    return GameRequest;
})();

// ----------------------------------------------------------------------
// The GameInProgress class represents a server-side game in progress.
// GameInProgress objects are view model objects whose values are suitable for
// displaying in the UI. GameInProgress objects are created from JSON
// objects that were transmitted by the server. A GameInProgress object
// uses the same property names that are specified in the JSON format.
//
// This is the JSON format:
//
// var jsonObject =
// {
//   "gameID" : 12345,                        // a unique ID
//   "createTime" : 123457890,                // milliseconds since the epoch
//   "boardSize" : 19,                        // valid values: 7, 9, 11, 13, 15, 17, 19
//   "handicap" : 0,                          // valid values: 0, 2-9
//   "komi" : 7.5,                            // valid values: 0, 0.5, 5.0, 5.5, [...], 8.0
//   "koRule" : 0,                            // valid values: 0 (= simple ko), 1 (= positional superko), 2 (= situational superko)
//   "scoringSystem" : 0,                     // valid values: 0 (= area scoring), 1 (= territory scoring)
//   "numberOfMovesPlayed" : 32,              // valid values: 0-n
//   "state" : 0,                             // valid values: 0 (= in progress & playing), 1 (= in progress & scoring)
//   "nextActionColor" : 1,                   // valid values: 0 (= black), 1 (= white)
//   "blackPlayer" : {                        // a UserInfo object that describes the black player
//     "userID" : 12345,
//     "displayName" : "foo"
//   },
//   "whitePlayer" : {                        // a UserInfo object that describes the white player
//     "userID" : 12345,
//     "displayName" : "bar"
//   }
// };
// ----------------------------------------------------------------------
var GameInProgress = (function ()
{
    "use strict";

    // Creates a new GameInProgress object from the data in the specified
    // JSON object. The specified user ID refers to the logged in user.
    function GameInProgress(jsonObject, userID)
    {
        this.gameID = jsonObject.gameID;

        this.createTime = startTimeToString(jsonObject.createTime * 1000);
        this.boardSize = boardSizeToString(jsonObject.boardSize);
        this.handicap = handicapToString(jsonObject.handicap);
        this.komi = komiToString(jsonObject.komi);
        this.koRule = koRuleToString(jsonObject.koRule);
        this.scoringSystem = scoringSystemToString(jsonObject.scoringSystem);
        this.numberOfMovesPlayed = numberOfMovesPlayedToString(jsonObject.numberOfMovesPlayed);
        if (jsonObject.blackPlayer.userID === userID)
        {
            this.blackPlayerName = "You";
            this.whitePlayerName = jsonObject.whitePlayer.displayName;
            this.blackPlayerIsThisPlayer = true;
            this.whitePlayerIsThisPlayer = false;
        }
        else
        {
            this.blackPlayerName = jsonObject.blackPlayer.displayName;
            this.whitePlayerName = "You";
            this.blackPlayerIsThisPlayer = false;
            this.whitePlayerIsThisPlayer = true;
        }
        this.gameState = gameStateToString(jsonObject.state);
        if (jsonObject.nextActionColor === COLOR_BLACK)
        {
            this.blackPlayerIsActivePlayer = true;
            this.whitePlayerIsActivePlayer = false;
        }
        else
        {
            this.blackPlayerIsActivePlayer = false;
            this.whitePlayerIsActivePlayer = true;
        }
    }

    return GameInProgress;
})();

// ----------------------------------------------------------------------
// The FinishedGame class represents a server-side finished game.
// FinishedGame objects are view model objects whose values are suitable for
// displaying in the UI. FinishedGame objects are created from JSON
// objects that were transmitted by the server. A FinishedGame object
// mostly uses the same property names that are specified in the JSON format.
// A FinishedGame object replaces the "createTime" JSON property with
// the property "endTime" (contains the gameResult's "createTime" property
// value) and the "gameResult" sub-object with the property "result" (contains
// the human-readable game result string).
//
// This is the JSON format:
//
// var jsonObject =
// {
//   "gameID" : 12345,             // a unique ID
//   "createTime" : 123457890,     // milliseconds since the epoch
//   "boardSize" : 19,             // valid values: see GameInProgress
//   "handicap" : 0,               // valid values: see GameInProgress
//   "komi" : 7.5,                 // valid values: see GameInProgress
//   "koRule" : 0,                 // valid values: see GameInProgress
//   "scoringSystem" : 0,          // valid values: see GameInProgress
//   "gameResult" : {
//     "gameResultID" : 12345,     // a unique ID
//     "createTime" : 123457890,   // milliseconds since the epoch, the time when the game's end result became known
//     "gameID" : 12345,           // the same unique ID as on the top-level
//     "resultType" : 0,           // valid values: 0 (= game won by points), 1 (= game is a draw), 2 (= game won by resignation)
//     "winningStoneColor" : 0,    // valid values: 0 (= black), 1 (= white), -1 (= game is a draw)
//     "winningPoints" : 32.5,     // valid values: 0.5-n, 0 (= game is a draw), -1 (= the other player resigned)
//   },
// };
// ----------------------------------------------------------------------
var FinishedGame = (function ()
{
    "use strict";

    // Creates a new FinishedGame object from the data in the specified
    // JSON object.
    function FinishedGame(jsonObject, userID)
    {
        this.gameID = jsonObject.gameID;

        this.boardSize = boardSizeToString(jsonObject.boardSize);
        this.handicap = handicapToString(jsonObject.handicap);
        this.komi = komiToString(jsonObject.komi);
        this.koRule = koRuleToString(jsonObject.koRule);
        this.scoringSystem = scoringSystemToString(jsonObject.scoringSystem);

        var gameResult = jsonObject.gameResult;

        // For finished games the user is not interested in when the game
        // was created, she wants to know when the game ended. So let's
        // ignore jsonObject.createTime and instead add the property "endTime".
        this.endTime = endTimeToString(gameResult.createTime * 1000);

        if (jsonObject.blackPlayer.userID === userID)
        {
            this.blackPlayerName = "You";
            this.whitePlayerName = jsonObject.whitePlayer.displayName;
            this.blackPlayerIsThisPlayer = true;
            this.whitePlayerIsThisPlayer = false;
        }
        else
        {
            this.blackPlayerName = jsonObject.blackPlayer.displayName;
            this.whitePlayerName = "You";
            this.blackPlayerIsThisPlayer = false;
            this.whitePlayerIsThisPlayer = true;
        }
        switch (gameResult.winningStoneColor)
        {
            case COLOR_BLACK:
                this.blackPlayerIsWinningPlayer = true;
                this.whitePlayerIsWinningPlayer = false;
                break;
            case COLOR_WHITE:
                this.blackPlayerIsWinningPlayer = false;
                this.whitePlayerIsWinningPlayer = true;
                break;
            case COLOR_NONE:
                this.blackPlayerIsWinningPlayer = false;
                this.whitePlayerIsWinningPlayer = false;
                break;
            default:
                throw new Error("Unknown stone color: " + gameResult.winningStoneColor);
        }

        this.result = gameResultToString(gameResult);
    }

    return FinishedGame;
})();

// ----------------------------------------------------------------------
// The Highscore class represents a server-side highscore. Highscore
// objects are view model objects whose values are suitable for displaying in
// the UI. Highscore objects are created from JSON objects that were
// transmitted by the server. A Highscore object uses the same property
// names that are specified in the JSON format.
//
// This is the JSON format:
//
// var jsonObject =
// {
//   "userID" : 12345,               // a unique ID
//   "displayName" : 123457890,      // the player's display name
//   "totalGamesWon" : 19,           // valid values: >= 0
//   "totalGamesLost" : 7,           // valid values: >= 0
//   "mostRecentWin" : 123457890,    // milliseconds since the epoch, or -1 if the user has never won a game
//   "gamesWonAsBlack" : 1,          // valid values: >= 0
//   "gamesWonAsWhite" : 3,          // valid values: >= 0
// };
// ----------------------------------------------------------------------
var Highscore = (function ()
{
    "use strict";

    // Creates a new Highscore object from the data in the specified
    // JSON object.
    function Highscore(jsonObject)
    {
        this.userID = jsonObject.userID;
        this.displayName = jsonObject.displayName;
        this.totalGamesWon = jsonObject.totalGamesWon;
        this.totalGamesLost = jsonObject.totalGamesLost;
        if (-1 === jsonObject.mostRecentWin)
            this.mostRecentWin = mostRecentWinToString(jsonObject.mostRecentWin);
        else
            this.mostRecentWin = mostRecentWinToString(jsonObject.mostRecentWin * 1000);
        this.gamesWonAsBlack = jsonObject.gamesWonAsBlack;
        this.gamesWonAsWhite = jsonObject.gamesWonAsWhite;
    }

    return Highscore;
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

// ----------------------------------------------------------------------
// The GameMove class represents a game move. GameMove objects are view model
// objects whose values are suitable for displaying in the UI. GameMove objects
// are created from GoMove objects that were created locally from data
// transmitted by the server.
// ----------------------------------------------------------------------
var GameMove = (function ()
{
    "use strict";

    // Creates a new GameMove object from the data in the specified
    // JSON object.
    function GameMove(goMove, moveNumber)
    {
        this.moveNumber = moveNumber;
        this.playedBy = colorToString(goMove.goPlayer.stoneColor);
        this.intersection = moveIntersectionToString(goMove);
        this.captured = moveNumberOfCapturedStonesToString(goMove);
    }

    return GameMove;
})();