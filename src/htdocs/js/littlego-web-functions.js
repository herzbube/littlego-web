// ----------------------------------------------------------------------
// This file contains global functions
// ----------------------------------------------------------------------

// Converts the specified board size value into a string that is suitable
// for displaying in the UI. Throws an Error object for invalid values.
function boardSizeToString(boardSize)
{
    switch (boardSize)
    {
        case BOARDSIZE_7:
        case BOARDSIZE_9:
        case BOARDSIZE_11:
        case BOARDSIZE_13:
        case BOARDSIZE_15:
        case BOARDSIZE_17:
        case BOARDSIZE_19:
            return "" + boardSize + "x" + boardSize;
        default:
            throw new Error("Unsupported board size value: " + boardSize);
    }
}

// Converts the specified stone color value into a string that is suitable
// for displaying in the UI. Throws an Error object for invalid values.
function stoneColorToString(stoneColor)
{
    switch (stoneColor)
    {
        case STONECOLOR_BLACK:
            return "Black";
        case STONECOLOR_WHITE:
            return "White";
        default:
            throw new Error("Unsupported stone color value: " + stoneColor);
    }
}

// Converts the specified handicap value into a string that is suitable
// for displaying in the UI. Throws an Error object for invalid values.
function handicapToString(handicap)
{
    if (handicap === 0)
        return "None";
    else if (handicap >= 2 && handicap <= 9)
        return "" + handicap;
    else
        throw new Error("Unsupported handicap value: " + handicap);
}

// Converts the specified komi value into a string that is suitable
// for displaying in the UI. Throws an Error object for invalid values.
function komiToString(komi)
{
    var entityFractionOneHalf = "&frac12;";
    switch (komi)
    {
        case 0:
            return "None";
        case 0.5:
            return entityFractionOneHalf;
        case 5:
        case 6:
        case 7:
        case 8:
            return "" + komi;
        case 5.5:
        case 6.5:
        case 7.5:
            return "" + Math.floor(komi) + entityFractionOneHalf;
        default:
            throw new Error("Unsupported komi value: " + komi);
    }
}

// Converts the specified ko rule value into a string that is suitable
// for displaying in the UI. Throws an Error object for invalid values.
function koRuleToString(koRule)
{
    switch (koRule)
    {
        case KORULE_SIMPLE_KO:
            return "Simple ko";
        case KORULE_POSITIONAL_SUPERKO:
            return "Positional superko";
        case KORULE_SITUATIONAL_SUPERKO:
            return "Situational superko";
        default:
            throw new Error("Unsupported ko rule value: " + koRule);
    }
}

// Converts the specified scoring system value into a string that is suitable
// for displaying in the UI. Throws an Error object for invalid values.
function scoringSystemToString(scoringSystem)
{
    switch (scoringSystem)
    {
        case SCORINGSYSTEM_AREA_SCORING:
            return "Area scoring";
        case SCORINGSYSTEM_TERRITORY_SCORING:
            return "Territory scoring";
        default:
            throw new Error("Unsupported scoring system value: " + scoringSystem);
    }
}