// ----------------------------------------------------------------------
// This file contains all model classes
// ----------------------------------------------------------------------

// The GameRequest class represents a server-side game request. GameRequest
// objects are model objects whose values are suitable for displaying in
// the UI. GameRequest objects are created from JSON objects that were
// transmitted by the server. A GameRequest object uses the same property
// names that are specified in the JSON format.
//
// This is the JSON format:
//
// var jsonObject =
// {
//   "id" : 12345,                   // a unique ID
//   "createTime" : 123457890,       // milliseconds since the epoch
//   "requestedBoardSize" : 19,      // valid values: 7, 9, 11, 13, 15, 17, 19
//   "requestedStoneColor" : 0,      // valid values: 0 (= black), 1 (= white)
//   "requestedHandicap" : 0,        // valid values: 0, 2-9
//   "requestedKomi" : 7.5,          // valid values: 0, 0.5, 5.0, 5.5, [...], 8.0
//   "requestedKoRule" : 0,          // valid values: 0 (= simple ko), 1 (= positional superko), 2 (= situational superko)
//   "requestedScoringSystem": 0,    // valid values: 0 (= area scoring), 1 (= territory scoring)
// };
//
// All "requested..." properties can also have the value -1, which
// signifies "don't care".
var GameRequest = (function ()
{
    "use strict";

    const STRING_DONTCARE = "*";

    // Creates a new GameRequest object from the data in the specified
    // JSON object.
    function GameRequest(jsonObject)
    {
        this.id = jsonObject.id;

        this.createTime = gameRequestCreateTimeToString(jsonObject.createTime);

        if (-1 === jsonObject.requestedBoardSize)
            this.requestedBoardSize = STRING_DONTCARE;
        else
            this.requestedBoardSize = boardSizeToString(jsonObject.requestedBoardSize);

        if (-1 === jsonObject.requestedStoneColor)
            this.requestedStoneColor = STRING_DONTCARE;
        else
            this.requestedStoneColor = stoneColorToString(jsonObject.requestedStoneColor);

        if (-1 === jsonObject.requestedHandicap)
            this.requestedHandicap = STRING_DONTCARE;
        else
            this.requestedHandicap = handicapToString(jsonObject.requestedHandicap);

        if (-1 === jsonObject.requestedKomi)
            this.requestedKomi = STRING_DONTCARE;
        else
            this.requestedKomi = komiToString(jsonObject.requestedKomi);

        if (-1 === jsonObject.requestedKoRule)
            this.requestedKoRule = STRING_DONTCARE;
        else
            this.requestedKoRule = koRuleToString(jsonObject.requestedKoRule);

        if (-1 === jsonObject.requestedScoringSystem)
            this.requestedScoringSystem = STRING_DONTCARE;
        else
            this.requestedScoringSystem = scoringSystemToString(jsonObject.requestedScoringSystem);
    }

    // Returns an array that contains the values that make up the GameRequest
    // object. The values are suitable for display in a data table in the UI.
    //
    // The order of the array elements matches the columns of the data table.
    GameRequest.prototype.getDataTableValues = function()
    {
        return [
            this.createTime,
            this.id,
            this.requestedBoardSize,
            this.requestedStoneColor,
            this.requestedHandicap,
            this.requestedKomi,
            this.requestedKoRule,
            this.requestedScoringSystem,
        ];
    };

    return GameRequest;
})();
