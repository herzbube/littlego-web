// ----------------------------------------------------------------------
// This file contains functions that generate fake JSON data.
// ----------------------------------------------------------------------

function createFinishedGames()
{
    var finishedGamesJsonObjects = createFinishedGamesJsonObjects();

    var finishedGames = [];
    finishedGamesJsonObjects.forEach(function(finishedGameJsonObject) {
        var finishedGame = new FinishedGame(finishedGameJsonObject);
        finishedGames.push(finishedGame);
    });

    return finishedGames;
}

function createFinishedGamesJsonObjects()
{
    return [
        {
            "id" : 123,
            "endTime" : new Date(2017, 10, 6).getTime(),
            "boardSize" : BOARDSIZE_19,
            "handicap" : 0,
            "komi" : 7.5,
            "koRule" : KORULE_SIMPLE_KO,
            "scoringSystem": SCORINGSYSTEM_AREA_SCORING,
            "winningColor" : COLOR_WHITE,
            "score" : 12.5
        },
        {
            "id" : 106,
            "endTime" : new Date(2016, 2, 29).getTime(),
            "boardSize" : BOARDSIZE_9,
            "handicap" : 2,
            "komi" : 0.5,
            "koRule" : KORULE_POSITIONAL_SUPERKO,
            "scoringSystem": SCORINGSYSTEM_TERRITORY_SCORING,
            "winningColor" : COLOR_BLACK,
            "score" : 3.5
        },
        {
            "id" : 77,
            "endTime" : new Date(2015, 9, 18).getTime(),
            "boardSize" : BOARDSIZE_13,
            "handicap" : 0,
            "komi" : 6.5,
            "koRule" : KORULE_SITUATIONAL_SUPERKO,
            "scoringSystem": SCORINGSYSTEM_TERRITORY_SCORING,
            "winningColor" : COLOR_NONE,
            "score" : 0
        },
        {
            "id" : 88,
            "endTime" : new Date(2015, 7, 13).getTime(),
            "boardSize" : BOARDSIZE_13,
            "handicap" : 0,
            "komi" : 6.5,
            "koRule" : KORULE_SITUATIONAL_SUPERKO,
            "scoringSystem": SCORINGSYSTEM_TERRITORY_SCORING,
            "winningColor" : COLOR_BLACK,
            "score" : 1.5
        },
        {
            "id" : 6,
            "endTime" : new Date(2013, 0, 2).getTime(),
            "boardSize" : BOARDSIZE_7,
            "handicap" : 4,
            "komi" : 0,
            "koRule" : KORULE_SIMPLE_KO,
            "scoringSystem": SCORINGSYSTEM_AREA_SCORING,
            "winningColor" : COLOR_WHITE,
            "score" : -1
        },
        {
            "id" : 23,
            "endTime" : new Date(2013, 0, 1).getTime(),
            "boardSize" : BOARDSIZE_7,
            "handicap" : 4,
            "komi" : 0,
            "koRule" : KORULE_SIMPLE_KO,
            "scoringSystem": SCORINGSYSTEM_AREA_SCORING,
            "winningColor" : COLOR_WHITE,
            "score" : 17
        },
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
