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
//   "requestedScoringSystem": 0,    // valid values: see GameInProgress
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
//   "gameID" : 12345,             // a unique ID
//   "createTime" : 123457890,     // milliseconds since the epoch
//   "boardSize" : 19,             // valid values: 7, 9, 11, 13, 15, 17, 19
//   "handicap" : 0,               // valid values: 0, 2-9
//   "komi" : 7.5,                 // valid values: 0, 0.5, 5.0, 5.5, [...], 8.0
//   "koRule" : 0,                 // valid values: 0 (= simple ko), 1 (= positional superko), 2 (= situational superko)
//   "scoringSystem": 0,           // valid values: 0 (= area scoring), 1 (= territory scoring)
//   "numberOfMovesPlayed" : 32,   // valid values: 0-n
//   "nextMoveColor" : 1,          // valid values: 0 (= black), 1 (= white)
// };
// ----------------------------------------------------------------------
var GameInProgress = (function ()
{
    "use strict";

    // Creates a new GameInProgress object from the data in the specified
    // JSON object.
    function GameInProgress(jsonObject)
    {
        this.gameID = jsonObject.gameID;

        this.createTime = startTimeToString(jsonObject.createTime * 1000);
        this.boardSize = boardSizeToString(jsonObject.boardSize);
        this.handicap = handicapToString(jsonObject.handicap);
        this.komi = komiToString(jsonObject.komi);
        this.koRule = koRuleToString(jsonObject.koRule);
        this.scoringSystem = scoringSystemToString(jsonObject.scoringSystem);
        this.numberOfMovesPlayed = numberOfMovesPlayedToString(jsonObject.numberOfMovesPlayed);
        this.nextMoveColor = colorToString(jsonObject.nextMoveColor);
    }

    return GameInProgress;
})();

// ----------------------------------------------------------------------
// The FinishedGame class represents a server-side finished game.
// FinishedGame objects are view model objects whose values are suitable for
// displaying in the UI. FinishedGame objects are created from JSON
// objects that were transmitted by the server. A FinishedGame object
// uses the same property names that are specified in the JSON format.
// A FinishedGame object in addition has a property named "result" which
// contains the human-readable game result string.
//
// This is the JSON format:
//
// var jsonObject =
// {
//   "id" : 12345,                 // a unique ID
//   "endTime" : 123457890,        // milliseconds since the epoch
//   "boardSize" : 19,             // valid values: see GameInProgress
//   "handicap" : 0,               // valid values: see GameInProgress
//   "komi" : 7.5,                 // valid values: see GameInProgress
//   "koRule" : 0,                 // valid values: see GameInProgress
//   "scoringSystem": 0,           // valid values: see GameInProgress
//   "winningColor" : 0,           // valid values: 0 (= black), 1 (= white), -1 (= game is a draw)
//   "score" : 32.5,               // valid values: 1-n, 0 (= game is a draw), -1 (= the other player resigned)
// };
// ----------------------------------------------------------------------
var FinishedGame = (function ()
{
    "use strict";

    // Creates a new FinishedGame object from the data in the specified
    // JSON object.
    function FinishedGame(jsonObject)
    {
        this.id = jsonObject.id;

        this.endTime = endTimeToString(jsonObject.endTime);
        this.boardSize = boardSizeToString(jsonObject.boardSize);
        this.handicap = handicapToString(jsonObject.handicap);
        this.komi = komiToString(jsonObject.komi);
        this.koRule = koRuleToString(jsonObject.koRule);
        this.scoringSystem = scoringSystemToString(jsonObject.scoringSystem);
        this.winningColor = jsonObject.winningColor;
        this.score = jsonObject.score;
        this.result = winningColorAndScoreToString(this.winningColor, this.score);
    }

    return FinishedGame;
})();

// ----------------------------------------------------------------------
// The DataItemAction class represents an action that the user can take in
// the UI and that operates on a data item.
// ----------------------------------------------------------------------
var DataItemAction = (function ()
{
    "use strict";

    // Creates a new DataItemAction object with the specified operation type,
    // data item, title string and action type.
    //
    // The action performs the operation of the specified type on the
    // specified data item.
    //
    // The action is represented in the UI by the title string. The action
    // type defines the visual style with which the action is rendered in
    // the UI.
    function DataItemAction(operationType, dataItem, actionTitle, actionType)
    {
        this.operationType = operationType;
        this.dataItem = dataItem;
        this.actionTitle = actionTitle;
        this.actionType = actionType;
    }

    return DataItemAction;
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