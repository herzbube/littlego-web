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
            return "" + boardSize + "&nbsp;x&nbsp;" + boardSize;
        default:
            throw new Error("Unsupported board size value: " + boardSize);
    }
}

// Converts the specified color value into a string that is suitable
// for displaying in the UI. Throws an Error object for invalid values.
function colorToString(color)
{
    switch (color)
    {
        case COLOR_BLACK:
            return "Black";
        case COLOR_WHITE:
            return "White";
        default:
            throw new Error("Unsupported color value: " + color);
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
    switch (komi)
    {
        case 0:
            return "None";
        case 0.5:
        case 5:
        case 6:
        case 7:
        case 8:
        case 5.5:
        case 6.5:
        case 7.5:
            return fractionalNumberToString(komi);
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

// Converts the specified number of moves played value into a string that is
// suitable for displaying in the UI. Throws an Error object for invalid values.
function numberOfMovesPlayedToString(numberOfMovesPlayed)
{
    if (numberOfMovesPlayed === 0)
        return "None";
    else if (numberOfMovesPlayed >0)
        return "" + numberOfMovesPlayed;
    else
        throw new Error("Unsupported number of moves played value: " + numberOfMovesPlayed);
}

// Converts the specified start time value into a string that is suitable for
// displaying in the UI. Throws an Error object for invalid values.
function startTimeToString(startTimeInMilliseconds)
{
    var currentTime = new Date().getTime();
    var elapsedTimeInMilliseconds = currentTime - startTimeInMilliseconds;

    if (elapsedTimeInMilliseconds < 0)
    {
        // Time is in the future
        throw new Error("Unsupported start time value: " + startTimeInMilliseconds);
    }
    else if (elapsedTimeInMilliseconds < MILLISECONDS_1_HOUR)
    {
        return "<1 hour ago"
    }
    else if (elapsedTimeInMilliseconds < MILLISECONDS_1_DAY)
    {
        var elapsedTimeInHours = Math.floor(elapsedTimeInMilliseconds / MILLISECONDS_1_HOUR);
        if (elapsedTimeInHours === 1)
            return "1 hour ago"
        else
            return "" + elapsedTimeInHours + " hours ago"
    }
    else
    {
        var elapsedTimeInDays = Math.floor(elapsedTimeInMilliseconds / MILLISECONDS_1_DAY);
        if (elapsedTimeInDays === 1)
            return "1 day ago"
        else
            return "" + elapsedTimeInDays + " days ago"
    }
}

// Returns a nicely formatted HTML string for the specified fractional number.
//
// If the specified number is an integer, this function returns the number
// converted to a string.
//
// If the specified number is a fractional type and the fraction is .0,
// this function returns a string that omits the fraction.
//
// If the specified number is a fractional type and the fraction is not .0,
// this function assumes that the fraction is .5. It returns a string that
// represents the fraction with the HTML entity for "½".
//
/// A special case is 0.5: This number is represented with the integral part
// omitted, i.e. 0.5 becomes "½", not "0½".
function fractionalNumberToString(fractionalNumber)
{
    var flooredNumber = Math.floor(fractionalNumber);
    if (flooredNumber === fractionalNumber)
    {
        // Math.floor() didn't change the type, so the specified
        // number already was an integer. We can return it without
        // change.
        return "" + fractionalNumber;
    }
    else if (flooredNumber == fractionalNumber)
    {
        // Math.floor() did change the type, so the specified number
        // was a fractional type, but the fraction apparently was .0.
        // We return the floored value to make sure that string
        // conversion doesn't include the fraction .0.
        return "" + flooredNumber;
    }
    else
    {
        var entityFractionOneHalf = "&frac12;";

        if (fractionalNumber === 0.5)
            return entityFractionOneHalf;
        else
            return "" + flooredNumber + entityFractionOneHalf;
    }
}

function actionType2BootstrapButtonClass(actionType)
{
    switch (actionType)
    {
        case ACTION_TYPE_PRIMARY:
            return BOOTSTRAP_CLASS_BUTTON_PRIMARY;
        case ACTION_TYPE_SECONDARY:
            return BOOTSTRAP_CLASS_BUTTON_SECONDARY;
        case ACTION_TYPE_SUCCESS:
            return BOOTSTRAP_CLASS_BUTTON_SUCCESS;
        case ACTION_TYPE_DANGER:
            return BOOTSTRAP_CLASS_BUTTON_DANGER;
        default:
            throw new Error("Unsupported action type value: " + actionType);
    }
}
