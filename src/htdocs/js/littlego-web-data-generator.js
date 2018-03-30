// ----------------------------------------------------------------------
// This file contains functions that generate fake JSON data.
// ----------------------------------------------------------------------

function createGameRequests()
{
    var gameRequestsJsonObjects = createGameRequestsJsonObjects();

    var gameRequests = [];
    gameRequestsJsonObjects.forEach(function(gameRequestJsonObject) {
        var gameRequest = new GameRequest(gameRequestJsonObject);
        gameRequests.push(gameRequest);
    });

    return gameRequests;
}

function createGameRequestsJsonObjects()
{
    return [
        {
            "id" : 1,
            "createTime" : gameRequestStartDate2MillisecondsSinceTheEpoch(GAMEREQUEST_STARTDATE_LESS_THAN_1_HOUR_AGO),
            "requestedBoardSize" : BOARDSIZE_19,
            "requestedStoneColor" : STONECOLOR_BLACK,
            "requestedHandicap" : 0,
            "requestedKomi" : 7.5,
            "requestedKoRule" : KORULE_SIMPLE_KO,
            "requestedScoringSystem": SCORINGSYSTEM_AREA_SCORING
        },
        {
            "id" : 2,
            "createTime" : gameRequestStartDate2MillisecondsSinceTheEpoch(GAMEREQUEST_STARTDATE_3_HOURS_AGO),
            "requestedBoardSize" : BOARDSIZE_9,
            "requestedStoneColor" : STONECOLOR_WHITE,
            "requestedHandicap" : 2,
            "requestedKomi" : 0.5,
            "requestedKoRule" : KORULE_POSITIONAL_SUPERKO,
            "requestedScoringSystem": SCORINGSYSTEM_TERRITORY_SCORING
        },
        {
            "id" : 3,
            "createTime" : gameRequestStartDate2MillisecondsSinceTheEpoch(GAMEREQUEST_STARTDATE_1_DAY_AGO),
            "requestedBoardSize" : BOARDSIZE_13,
            "requestedStoneColor" : GAMEREQUEST_DONTCARE,
            "requestedHandicap" : GAMEREQUEST_DONTCARE,
            "requestedKomi" : 6.5,
            "requestedKoRule" : KORULE_SITUATIONAL_SUPERKO,
            "requestedScoringSystem": SCORINGSYSTEM_TERRITORY_SCORING
        },
        {
            "id" : 4,
            "createTime" : gameRequestStartDate2MillisecondsSinceTheEpoch(GAMEREQUEST_STARTDATE_7_DAYS_AGO),
            "requestedBoardSize" : GAMEREQUEST_DONTCARE,
            "requestedStoneColor" : GAMEREQUEST_DONTCARE,
            "requestedHandicap" : GAMEREQUEST_DONTCARE,
            "requestedKomi" : GAMEREQUEST_DONTCARE,
            "requestedKoRule" : GAMEREQUEST_DONTCARE,
            "requestedScoringSystem": GAMEREQUEST_DONTCARE
        }
    ];
}

// Calculates and returns a "milliseconds since the epoch" value that
// matches the specified "game request start date" value.
//
// Use one of the various GAMEREQUEST_STARTDATE_... constants as the
// parameter value.
//
// For instance, if you specify GAMEREQUEST_STARTDATE_3_HOURS_AGO then
// this function returns a Date object that causes the game request
// to be displayed with a start date of "3 hours ago".
//
// This is helper function to generate fake game request data.
// TODO: Remove this function if it is no longer needed.
function gameRequestStartDate2MillisecondsSinceTheEpoch(gameRequestStartDate)
{
    var timespanInMilliseconds;
    switch (gameRequestStartDate)
    {
        case GAMEREQUEST_STARTDATE_LESS_THAN_1_HOUR_AGO:
            timespanInMilliseconds = MILLISECONDS_HALF_HOUR;
            break;
        case GAMEREQUEST_STARTDATE_3_HOURS_AGO:
            timespanInMilliseconds = MILLISECONDS_1_HOUR * 3 + MILLISECONDS_HALF_HOUR;
            break;
        case GAMEREQUEST_STARTDATE_1_DAY_AGO:
            timespanInMilliseconds = MILLISECONDS_1_DAY + MILLISECONDS_1_HOUR;
            break;
        case GAMEREQUEST_STARTDATE_7_DAYS_AGO:
            // Less than
            timespanInMilliseconds = MILLISECONDS_1_DAY * 7 + MILLISECONDS_1_HOUR;
            break;
        default:
            throw new Error("Unsupported game request start date: " + gameRequestStartDate);
    }

    var currentDate = new Date();
    return currentDate.getTime() - timespanInMilliseconds;
}
