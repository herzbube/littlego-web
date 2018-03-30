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
            "createTime" : startDate2MillisecondsSinceTheEpoch(STARTDATE_LESS_THAN_1_HOUR_AGO),
            "requestedBoardSize" : BOARDSIZE_19,
            "requestedStoneColor" : COLOR_BLACK,
            "requestedHandicap" : 0,
            "requestedKomi" : 7.5,
            "requestedKoRule" : KORULE_SIMPLE_KO,
            "requestedScoringSystem": SCORINGSYSTEM_AREA_SCORING
        },
        {
            "id" : 2,
            "createTime" : startDate2MillisecondsSinceTheEpoch(STARTDATE_3_HOURS_AGO),
            "requestedBoardSize" : BOARDSIZE_9,
            "requestedStoneColor" : COLOR_WHITE,
            "requestedHandicap" : 2,
            "requestedKomi" : 0.5,
            "requestedKoRule" : KORULE_POSITIONAL_SUPERKO,
            "requestedScoringSystem": SCORINGSYSTEM_TERRITORY_SCORING
        },
        {
            "id" : 3,
            "createTime" : startDate2MillisecondsSinceTheEpoch(STARTDATE_1_DAY_AGO),
            "requestedBoardSize" : BOARDSIZE_13,
            "requestedStoneColor" : GAMEREQUEST_DONTCARE,
            "requestedHandicap" : GAMEREQUEST_DONTCARE,
            "requestedKomi" : 6.5,
            "requestedKoRule" : KORULE_SITUATIONAL_SUPERKO,
            "requestedScoringSystem": SCORINGSYSTEM_TERRITORY_SCORING
        },
        {
            "id" : 4,
            "createTime" : startDate2MillisecondsSinceTheEpoch(STARTDATE_7_DAYS_AGO),
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
// matches the specified start date value.
//
// Use one of the various STARTDATE_... constants as the parameter value.
//
// For instance, if you specify STARTDATE_3_HOURS_AGO then this function
// returns a "milliseconds since the epoch" value that causes the start
// date to be displayed as "3 hours ago".
//
// This is helper function to generate fake data.
// TODO: Remove this function if it is no longer needed.
function startDate2MillisecondsSinceTheEpoch(startDate)
{
    var timespanInMilliseconds;
    switch (startDate)
    {
        case STARTDATE_LESS_THAN_1_HOUR_AGO:
            timespanInMilliseconds = MILLISECONDS_HALF_HOUR;
            break;
        case STARTDATE_3_HOURS_AGO:
            timespanInMilliseconds = MILLISECONDS_1_HOUR * 3 + MILLISECONDS_HALF_HOUR;
            break;
        case STARTDATE_1_DAY_AGO:
            timespanInMilliseconds = MILLISECONDS_1_DAY + MILLISECONDS_1_HOUR;
            break;
        case STARTDATE_7_DAYS_AGO:
            // Less than
            timespanInMilliseconds = MILLISECONDS_1_DAY * 7 + MILLISECONDS_1_HOUR;
            break;
        default:
            throw new Error("Unsupported game request start date: " + startDate);
    }

    var currentDate = new Date();
    return currentDate.getTime() - timespanInMilliseconds;
}
