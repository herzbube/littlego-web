// ----------------------------------------------------------------------
// This file contains all Go domain model classes
//
// Most of the code in this file was lifted from the Little Go project
// (from the same author as this project) and transcribed from Objective-C
// into JavaScript.
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// The GoGame class represents a game of Go.
// ----------------------------------------------------------------------
var GoGame = (function ()
{
    "use strict";

    // Creates a new GoGame object without any moves.
    function GoGame(goBoard, handicap, komi, goGameRules)
    {
        this.goBoard = goBoard;
        this.handicap = handicap;
        this.komi = komi;
        this.goGameRules = goGameRules;
        this.goPlayerBlack = new GoPlayer(COLOR_BLACK);
        this.goPlayerWhite = new GoPlayer(COLOR_WHITE);
        this.firstMove = null;
        this.goUtilities = new GoUtilities(this);
        this.goScore = new GoScore(this);
        this.state = GAME_STATE_INPROGRESS_PLAYING;

        this.goUtilities.placeHandicapStones();
    }

    GoGame.prototype.getState = function()
    {
        return this.state;
    };

    GoGame.prototype.setState = function(state)
    {
        this.state = state;
    };

    // Returns true if the GoGame has at least one move. Returns false
    // if the GoGame has no moves.
    GoGame.prototype.hasMoves = function()
    {
        return (this.firstMove !== null);
    };

    // Returns the GoMove object that represents the first move of the game,
    // or null if no move has been played yet.
    GoGame.prototype.getFirstMove = function()
    {
        return this.firstMove;
    };

    // Returns the GoMove object that represents the last (i.e. most recent)
    // move of the game, or null if no move has been played yet.
    GoGame.prototype.getLastMove = function()
    {
        var lastMove = this.firstMove;
        while (lastMove !== null)
        {
            if (lastMove.nextGoMove === null)
                break;
            else
                lastMove = lastMove.nextGoMove;
        }
        return lastMove;
    };

    // Returns either COLOR_BLACK or COLOR_WHITE, depending on which player's
    // turn it is.
    GoGame.prototype.getNextMoveColor = function()
    {
        var lastMove = this.getLastMove();
        if (lastMove === null)
        {
            if (this.handicap === 0)
                return COLOR_BLACK;
            else
                return COLOR_WHITE;
        }
        else
        {
            if (lastMove.goPlayer.isBlack())
                return COLOR_WHITE;
            else
                return COLOR_BLACK;
        }
    };

    // Updates the state of this GoGame and all associated objects in response
    // to the @e nextMovePlayer making a #GoMoveTypePlay.
    //
    // Invoking this method sets the document dirty flag and, if alternating play
    // is enabled, switches the @e nextMovePlayer.
    //
    // Raises an @e NSInternalInconsistencyException if this method is invoked
    // while this GoGame object is not in state #GoGameStateGameHasStarted or
    // #GoGameStateGameIsPaused.
    //
    // Throws an Error if playing on @a goPoint is not a legal move.
    GoGame.prototype.play = function(goPoint)
    {
        var isLegalMoveResult = this.isLegalMove(goPoint);
        if (! isLegalMoveResult.isLegalMove)
            throw new Error("Playing a stone on intersection " + goPoint.goVertex + " is not a legal move: " + goMoveIsIllegalReasonToString(isLegalMoveResult.illegalReason));

        // TODO: The following implementation needs to be refactored
        // as soon as GoMoveModel and GoBoardPosition are added

        var nextMoveColor = this.getNextMoveColor();
        var goPlayer;
        if (nextMoveColor === COLOR_BLACK)
            goPlayer = this.goPlayerBlack;
        else
            goPlayer = this.goPlayerWhite;

        var previousGoMove = this.getLastMove();
        var goMove;
        if (previousGoMove === null)
            goMove = new GoMove(GOMOVE_TYPE_PLAY, goPlayer);
        else
            goMove = new GoMove(GOMOVE_TYPE_PLAY, goPlayer, previousGoMove);

        goMove.setGoPoint(goPoint);
        goMove.doIt(this);

        if (previousGoMove === null)
            this.firstMove = goMove;
    };

    // Updates the state of this GoGame and all associated objects in
    // response to the @e nextMovePlayer making a #GoMoveTypePass.
    //
    // Invoking this method sets the document dirty flag and, if alternating play
    // is enabled, switches the @e nextMovePlayer.
    //
    // Raises an @e NSInternalInconsistencyException if this method is invoked
    // while this GoGame object is not in state #GoGameStateGameHasStarted or
    // #GoGameStateGameIsPaused.
    GoGame.prototype.pass = function()
    {
        // TODO: The following implementation needs to be refactored
        // as soon as GoMoveModel and GoBoardPosition are added

        var nextMoveColor = this.getNextMoveColor();
        var goPlayer;
        if (nextMoveColor === COLOR_BLACK)
            goPlayer = this.goPlayerBlack;
        else
            goPlayer = this.goPlayerWhite;

        var previousGoMove = this.getLastMove();
        var goMove;
        if (previousGoMove === null)
            goMove = new GoMove(GOMOVE_TYPE_PASS, goPlayer);
        else
            goMove = new GoMove(GOMOVE_TYPE_PASS, goPlayer, previousGoMove);

        goMove.doIt(this);

        if (previousGoMove === null)
            this.firstMove = goMove;
    };

    // Checks if playing a stone on the intersection represented by
    // @a goPoint would be legal for the @e nextMovePlayer in the current board
    // position. This includes checking for suicide moves and Ko situations, but
    // not for alternating play.
    //
    // This method returns an object that encapsulates the result of the check.
    // The object has two properties:
    // - isLegalMove: A boolean indicating whether the move would be legal
    // - illegalReason: A numeric value indicating why the move is not legal.
    //   The value of this property is undefined if isLegalMove is true. The
    //   value of this property is one of the GOMOVEISILLEGALREASON_* constants
    //   if isLegalMove is false.
    //
    // Alternating play, if it is desired, must be enforced by the application
    // logic. This method simply assumes that the @e nextMovePlayer has the right
    // to move in the current board position.
    GoGame.prototype.isLegalMove = function(goPoint)
    {
        return this.isLegalMoveByColor(
            goPoint,
            this.getNextMoveColor());
    };

    // Checks if playing a stone on the intersection represented by
    // @a goPoint would be legal for the player who plays @a color in the
    // current board position. This includes checking for suicide moves and
    // Ko situations, but not for alternating play.
    //
    // This method returns an object that encapsulates the result of the check.
    // The object has two properties:
    // - isLegalMove: A boolean indicating whether the move would be legal
    // - illegalReason: A numeric value indicating why the move is not legal.
    //   The value of this property is undefined if isLegalMove is true. The
    //   value of this property is one of the GOMOVEISILLEGALREASON_* constants
    //   if isLegalMove is false.
    //
    // Alternating play, if it is desired, must be enforced by the application
    // logic. This method simply assumes that the @e nextMovePlayer has the right
    // to move in the current board position.
    GoGame.prototype.isLegalMoveByColor = function(goPoint, color)
    {
        var isLegalMoveResult =
            {
                isLegalMove: false,
                illegalReason: GOMOVEISILLEGALREASON_UNDEFINED
            };

        if (goPoint.hasStone())
        {
            isLegalMoveResult.isLegalMove = false;
            isLegalMoveResult.illegalReason = GOMOVEISILLEGALREASON_INTERSECTIONOCCUPIED;
            return isLegalMoveResult;
        }
        // Point is an empty intersection, possibly with other empty intersections as
        // neighbours
        else if (goPoint.getLiberties() > 0)
        {
            // Because the point has liberties a simple ko is not possible
            var simpleKoIsPossible = false;
            var isKoMoveResult = this.isKoMove(
                goPoint,
                color,
                simpleKoIsPossible);
            this.convertIsKoMoveResultToIsLegalMoveResult(isKoMoveResult, isLegalMoveResult);
            return isLegalMoveResult;
        }
        // Point is an empty intersection that is surrounded by stones
        else
        {
            // Pass 1: Check if we can connect to a friendly colored stone group
            // without killing it
            // Use some() so that we can abort the loop prematurely
            var neighbourRegionsFriendly = goPoint.getNeighbourRegionsWithColor(color);
            var canWeConnect = neighbourRegionsFriendly.some(function(neighbourRegion) {
                // If the friendly stone group has more than one liberty, we are sure that
                // we are not killing it. The only thing that can still make the move
                // illegal is a ko (but since we are connecting, a simple ko is not
                // possible here).
                if (neighbourRegion.getLiberties() > 1)
                {
                    var simpleKoIsPossible = false;
                    var isKoMoveResult = this.isKoMove(
                        goPoint,
                        color,
                        simpleKoIsPossible);
                    this.convertIsKoMoveResultToIsLegalMoveResult(isKoMoveResult, isLegalMoveResult);

                    // together with some() this simulates break in a foreach loop
                    return true;
                }

                // some() requires that we return a value to continue with
                // the iteration
                return false;
            }, this);  // <-- supply "this" value seen in the loop

            if (canWeConnect)
                return isLegalMoveResult;

            // Pass 2: Check if we can capture opposing stone groups
            // Use some() so that we can abort the loop prematurely
            var opponentColor = (color === COLOR_BLACK ? COLOR_WHITE : COLOR_BLACK);
            var neighbourRegionsOpponent = goPoint.getNeighbourRegionsWithColor(opponentColor);
            var canWeCapture = neighbourRegionsOpponent.some(function(neighbourRegion) {
                // If the opposing stone group has only one liberty left we can capture
                // it. The only thing that can still make the move illegal is a ko.
                if (neighbourRegion.getLiberties() === 1)
                {
                    // A simple Ko situation is possible only if we are NOT connecting
                    var simpleKoIsPossible = (0 === neighbourRegionsFriendly.length);
                    var isKoMoveResult = this.isKoMove(
                        goPoint,
                        color,
                        simpleKoIsPossible);
                    this.convertIsKoMoveResultToIsLegalMoveResult(isKoMoveResult, isLegalMoveResult);

                    // together with some() this simulates break in a foreach loop
                    return true;
                }

                // some() requires that we return a value to continue with
                // the iteration
                return false;
            }, this);  // <-- supply "this" value seen in the loop

            if (canWeCapture)
                return isLegalMoveResult;

            // If we arrive here, no opposing stones can be captured and there are no
            // friendly groups with sufficient liberties to connect to
            // -> the move is a suicide and therefore illegal
            isLegalMoveResult.isLegalMove = false;
            isLegalMoveResult.illegalReason = GOMOVEISILLEGALREASON_SUICIDE;
            return isLegalMoveResult;
        }
    };

    GoGame.prototype.convertIsKoMoveResultToIsLegalMoveResult = function(isKoMoveResult, isLegalMoveResult)
    {
        if (isKoMoveResult.isKoMove)
        {
            isLegalMoveResult.isLegalMove = false;
            if (isKoMoveResult.isSuperko)
                isLegalMoveResult.illegalReason = GOMOVEISILLEGALREASON_SUPERKO;
            else
                isLegalMoveResult.illegalReason = GOMOVEISILLEGALREASON_SIMPLEKO;
        }
        else
        {
            isLegalMoveResult.isLegalMove = true;
        }
    };

    // Checks if placing a stone at @a goPoint by player @a moveColor
    // would violate the current ko rule of the game.
    //
    // This method returns an object that encapsulates the result of the check.
    // The object has two properties:
    // - isKoMove: A boolean indicating whether the move would violate the
    //   current ko rule of the game
    // - isSuperko: A boolean distinguishing ko from superko. The value of
    //   this property is undefined if isKoMove is false. Otherwise the value
    //   true indicates that the ko is a superko, the value false indicates
    //   that the ko is a simple ko. If the current ko rule is KORULE_SIMPLE_KO
    //   this method does not check for superko at all, so isSuperko can never
    //   become true.
    //
    // This ko detection routine is based on the current board position!
    //
    // To optimize ko detection, the caller may set @a simpleKoIsPossible to
    // false if prior analysis has shown that placing a stone at @a goPoint
    // by player @a moveColor is impossible to be a simple ko. If the current
    // ko rule is KORULE_SIMPLE_KO and the caller sets @a simpleKoIsPossible
    // to false, then this method does not have to perform any ko detection
    // at all! If the current ko rule is not KORULE_SIMPLE_KO (i.e. the ko
    // rule allows superko), then no optimization is possible.
    //
    // This is a private helper for isLegalMoveByColor().
    GoGame.prototype.isKoMove = function(goPoint, moveColor, simpleKoIsPossible)
    {
        var isKoMoveResult =
            {
                isKoMove: false,
                isSuperko: false
            };

        var koRule = this.goGameRules.koRule;
        if (KORULE_SIMPLE_KO === koRule && !simpleKoIsPossible)
            return false;

        // The algorithm below for finding ko can kick in only if we have at least
        // two moves. The earliest possible ko needs even more moves, but optimizing
        // the algorithm is not worth the trouble.
        //
        // IMPORTANT: Ko detection must be based on the current board position, so
        // we must not use this.getLastMove()!
        // TODO: Change this when we start to support board positions
        //GoMove* lastMove = this.boardPosition.currentMove;
        var lastMove = this.getLastMove();
        if (lastMove === null)
            return false;
        var previousToLastMove = lastMove.getPreviousGoMove();
        if (previousToLastMove === null)
            return false;

        var zobristHashOfHypotheticalMove = this.getZobristHashOfHypotheticalMoveAtPoint(
            goPoint,
            moveColor,
            lastMove);


        // Even if we use one of the superko rules, we still want to check for simple
        // ko first so that we can distinguish between simple ko and superko.
        var isSimpleKo = (zobristHashOfHypotheticalMove === previousToLastMove.getZobristHash());
        if (isSimpleKo)
        {
            isKoMoveResult.isKoMove = true;
            isKoMoveResult.isSuperko = false;
            return isKoMoveResult;
        }

        switch (koRule)
        {
            case KORULE_SIMPLE_KO:
            {
                // Simple Ko has already been checked above, so there's nothing else we
                // need to do here
                isKoMoveResult.isKoMove = false;
                return isKoMoveResult;
            }
            case KORULE_POSITIONAL_SUPERKO:
            case KORULE_SITUATIONAL_SUPERKO:
            {
                for (var move = previousToLastMove.getPreviousGoMove(); move !== null; move = move.getPreviousGoMove())
                {
                    // Situational superko only examines board positions that resulted from
                    // moves made by the same color
                    if (KORULE_SITUATIONAL_SUPERKO === koRule && move.goPlayer.getStoneColor() !== moveColor)
                        continue;
                    if (zobristHashOfHypotheticalMove === move.getZobristHash())
                    {
                        isKoMoveResult.isKoMove = true;
                        isKoMoveResult.isSuperko = true;
                        return isKoMoveResult;
                    }
                }
                return false;
            }
            default:
            {
                throw new Error("Invalid ko rule " + koRule);
            }
        }
    };

    // Generates the Zobrist hash for a hypothetical move played by @a color
    // on the intersection @a goPoint, after the previous move @a previousMove.
    //
    // This is a private helper for isKoMove().
    GoGame.prototype.getZobristHashOfHypotheticalMoveAtPoint = function(goPoint, color, previousMove)
    {
        var opponentColor = (color === COLOR_BLACK ? COLOR_WHITE : COLOR_BLACK);

        var stonesWithOneLiberty = this.getStonesWithColorAndSingleLiberty(
            opponentColor,
            goPoint);

        var hash = this.goBoard.goZobristTable.getHashForStonePlayedByColorAtPointCapturingStonesAfterMove(
            color,
            goPoint,
            stonesWithOneLiberty,
            previousMove);

        return hash;
    };

    // Determines stone groups with color @a color that have only a single
    // liberty, and that liberty is at @a goPoint. Returns an array with all
    // GoPoint objects that make up those regions. The array is empty if no
    // such stone groups exist. The array has no particular order.
    //
    // This is a private helper for getZobristHashOfHypotheticalMoveAtPoint().
    GoGame.prototype.getStonesWithColorAndSingleLiberty = function(color, goPoint)
    {
        var stonesWithSingleLiberty = [];

        // The array we get is guaranteed to have no duplicates
        var neighbourRegionsOpponent = goPoint.getNeighbourRegionsWithColor(color);

        neighbourRegionsOpponent.forEach(function(neighbourRegion) {
            if (neighbourRegion.getLiberties() === 1)
            {
                stonesWithSingleLiberty = stonesWithSingleLiberty.concat(neighbourRegion.getPoints())
            }
        }, this);  // <-- supply "this" value seen in the loop

        return stonesWithSingleLiberty;
    };

    return GoGame;
})();

// ----------------------------------------------------------------------
// The GoGameRules class defines the rules that are in effect for a
// game.
// ----------------------------------------------------------------------
var GoGameRules = (function ()
{
    "use strict";

    function GoGameRules(koRule, scoringSystem)
    {
        this.koRule = koRule;
        this.scoringSystem = scoringSystem;
    }

    return GoGameRules;
})();

// ----------------------------------------------------------------------
// The GoBoard class represents the Go board. Note, though, that the current
// state of the board (i.e. which points are occupied) is managed by
// GoBoardPosition.
//
// The main property of GoBoard is its size. The size determines the board's
// horizontal and vertical dimensions and thus the number of GoPoint objects
// that may exist at any given time.
//
// GoBoard is responsible for creating GoPoint objects and providing access to
// these objects. A GoPoint object is identified by the coordinates of the
// intersection it is located on, or by its association with its neighbouring
// GoPoint objects in one of several directions (see #GoBoardDirection).
//
// For convenience, GoBoard also provides access to a list of GoBoardRegion
// objects. GoBoard is, however, not responsible for managing that list.
// See GoBoardRegion for more details.
// ----------------------------------------------------------------------
var GoBoard = (function ()
{
    "use strict";

    // Defining these vertexes in human-readable form has a slight performance
    // impact because they need to be parsed into numeric form, but a numeric
    // representation would be difficult to maintain.
    //
    // Star point definitions are by convention in the Go world, therefore
    // we should be safe to hardcode them here.
    const STAR_POINT_VERTEXES = [
        [],  // board size 7
        ["C3", "G3", "C7", "G7"],  // board size 9
        ["C3", "J3", "C9", "J9"],  // board size 11
        ["D4", "G4", "K4", "D7", "G7", "K7", "D10", "G10", "K10"],    // board size 13
        ["D4", "H4", "M4", "D8", "H8", "M8", "D12", "H12", "M12"],    // board size 15
        ["D4", "J4", "O4", "D9", "J9", "O9", "D14", "J14", "O14"],    // board size 17
        ["D4", "K4", "Q4", "D10", "K10", "Q10", "D16", "K16", "Q16"]  // board size 19
    ];
    const CHAR_CODE_LETTER_A = "A".charCodeAt(0);
    const CHAR_CODE_LETTER_I = "I".charCodeAt(0);

    // Creates a new GoBoard object with the specified size. Immediately
    // creates a set of new unoccupied GoPoint objects and places them in
    // a single GoBoardRegion.
    function GoBoard(boardSize)
    {
        this.boardSize = boardSize;

        this.goZobristTable = new GoZobristTable(this.boardSize);

        // See getPoints() documentation for details about the structure
        // of this member variable.
        this.points = [];
        // Initially all GoPoint objects belong to the single GoBoardRegion
        // that we create here
        var goBoardRegion = new GoBoardRegion();
        for (var x = 1; x <= this.boardSize; x++)
        {
            var pointsXAxis = [];
            this.points.push(pointsXAxis);

            for (var y = 1; y <= this.boardSize; y++)
            {
                var goVertex = new GoVertex(x, y);
                var goPoint = new GoPoint(goVertex, this);
                pointsXAxis.push(goPoint);

                goBoardRegion.addPoint(goPoint);
            }
        }

        // A normal array that is a subset of this.points and contains those
        // GoPoint objects that match a set of pre-defined star point vertexes.
        // TODO: Refactor the following string vertex parsing code into a reusable function.
        this.starPoints = [];
        var boardSizeAsArrayIndex = Math.floor((this.boardSize - BOARDSIZE_SMALLEST) / 2);
        var starPointVertexes = STAR_POINT_VERTEXES[boardSizeAsArrayIndex];
        starPointVertexes.forEach(function(starPointVertex) {
            var x = starPointVertex.charCodeAt(0);
            if (x >= CHAR_CODE_LETTER_I)
                x--;
            x -= CHAR_CODE_LETTER_A;
            x++;  // vertex coordinates are 1-based
            var y = parseInt(starPointVertex.substring(1));

            var starPoint = this.getPointAtVertexCoordinates(x, y);
            this.starPoints.push(starPoint);
        }, this);  // <-- supply "this" value seen in the loop
    }

    // Returns an array of arrays with all GoPoint objects on the board.
    //
    // The structure is this:
    // - Dimension 1 = x-axis position on the board
    // - Dimension 2 = y-axis position on the board
    //
    // Important: Array indices are 0-based, but GoVertex uses 1-based
    // numeric values !!!
    //
    // TODO: Return a flat array. Add a separate getter for those clients
    // that really, really want an array of arrays.
    GoBoard.prototype.getPoints = function()
    {
        return this.points;
    };

    // Returns the GoPoint object located at the specified GoVertex.
    GoBoard.prototype.getPointAtVertex = function(goVertex)
    {
        return this.getPointAtVertexCoordinates(goVertex.x, goVertex.y);
    };

    // Returns the GoPoint object located at the specified numeric
    // vertex coordinates. Important: Vertex coordinates are 1-based.
    GoBoard.prototype.getPointAtVertexCoordinates = function(vertexX, vertexY)
    {
        // Subtract 1 because vertex numeric values are 1-based
        return this.points[vertexX - 1][vertexY - 1];
    };

    // Returns the GoPoint object that is a direct neighbour of the specified
    // GoPoint object located in the specified direction. The direction must
    // be one of the GOBOARD_DIRECTION_... constants. Returns null if no
    // neighbour exists in the specified direction. For instance, if the
    // specified GoPoint is at the left edge of the board, it has no left
    // neighbour.
    //
    // GOBOARD_DIRECTION_NEXT and GOBOARD_DIRECTION_PREVIOUS can be used to
    // iterate over all existing GoPoint objects.
    GoBoard.prototype.getNeighbour = function(goPoint, goBoardDirection)
    {
        var goVertex = goPoint.goVertex;
        var x = goVertex.x;
        var y = goVertex.y;

        // Important: GoVertex uses 1-based numeric values !!!
        switch (goBoardDirection)
        {
            case GOBOARD_DIRECTION_LEFT:
                x--;
                if (x < 1)
                    return null;
                break;
            case GOBOARD_DIRECTION_RIGHT:
                x++;
                if (x > this.boardSize)
                    return null;
                break;
            case GOBOARD_DIRECTION_UP:
                y++;
                if (y > this.boardSize)
                    return null;
                break;
            case GOBOARD_DIRECTION_DOWN:
                y--;
                if (y < 1)
                    return null;
                break;
            case GOBOARD_DIRECTION_NEXT:
                x++;
                if (x > this.boardSize)
                {
                    x = 1;
                    y++;
                    if (y > this.boardSize)
                        return null;
                }
                break;
            case GOBOARD_DIRECTION_PREVIOUS:
                x--;
                if (x < 1)
                {
                    x = this.boardSize;
                    y--;
                    if (y < 1)
                        return null;
                }
                break;
            default:
                throw new Error("Unsupported direction value " + goBoardDirection);
        }

        return this.getPointAtVertexCoordinates(x, y);
    };

    // Returns the GoPoint object located at the corner of the board
    // defined by @a corner.
    GoBoard.prototype.getPointAtCorner = function(goBoardCorner)
    {
        var x;
        var y;
        switch (goBoardCorner)
        {
            case GOBOARDCORNER_BOTTOMLEFT:
                x = 1;
                y = 1;
                break;
            case GOBOARDCORNER_BOTTOMRIGHT:
                x = this.boardSize;
                y = 1;
                break;
            case GOBOARDCORNER_TOPLEFT:
                x = 1;
                y = this.boardSize;
                break;
            case GOBOARDCORNER_TOPRIGHT:
                x = this.boardSize;
                y = this.boardSize;
                break;
            default:
                throw new Error("Invalid board cornder: " + goBoardCorner);
        }

        var goVertex = new GoVertex(x, y);
        return this.getPointAtVertex(goVertex);
    };

    // Returns an array of all GoBoardRegion objects on this board.
    // The list has no particular order.
    GoBoard.prototype.getRegions = function()
    {
        var goBoardRegions = [];

        this.points.forEach(function(pointsXAxis) {
            pointsXAxis.forEach(function(goPoint) {
                var goBoardRegion = goPoint.goBoardRegion;
                var index = goBoardRegions.indexOf(goBoardRegion);
                if (index === -1)
                    goBoardRegions.push(goBoardRegion);
            }, this);
        }, this);

        return goBoardRegions;
    };

    return GoBoard;
})();

// ----------------------------------------------------------------------
// The GoPoint class represents the intersection of a horizontal and a
// vertical line on the Go board. The location of the intersection is
// identified by a GoVertex, which is used to create the GoPoint object.
//
// A GoPoint has a "stone state", denoting whether a stone has been placed on
// the intersection, and which color the stone has. Instead of accessing the
// technical stoneState property, one might prefer to query a GoPoint object
// for the same information using the more intuitive hasStone() and
// hasBlackStone() methods.
//
// A GoPoint object always belongs to a GoBoardRegion. A GoPoint object
// is moved from one GoBoardRegion to another when its stone state changes.
// The GoPoint object does not take an active part in this, it simply holds
// a reference to the GoBoardRegion that it belongs to which must be updated
// by other actors.
//
// The getLiberties() method behaves differently depending on whether GoPoint
// is occupied by a stone: If it is occupied by a stone, the method returns
// the number of liberties of the entire stone group. If the GoPoint is not
// occupied, the method returns the number of liberties of just that one
// intersection.
//
// isLegalMove() is a convenient way to check whether placing a stone on the
// GoPoint would be legal. This includes checking for suicide moves and Ko
// situations.
// ----------------------------------------------------------------------
var GoPoint = (function ()
{
    "use strict";

    function GoPoint(goVertex, goBoard)
    {
        this.goVertex = goVertex;
        this.goBoard = goBoard;
        this.goBoardRegion = null;

        this.stoneState = COLOR_NONE;

        this.left = null;
        this.right = null;
        this.above = null;
        this.below = null;

        this.next = null;
        this.previous = null;

        this.neighbours = null;

        this.isLeftValid = false;
        this.isRightValid = false;
        this.isAboveValid = false;
        this.isBelowValid = false;
        this.isNextValid = false;
        this.isPreviousValid = false;
    }

    // Returns the GoPoint object that is the direct neighbour of this
    // GoPoint object in GOBOARD_DIRECTION_LEFT. Returns null if this GoPoint
    // object is located at the left edge of the Go board.
    GoPoint.prototype.getLeft = function()
    {
        if (! this.isLeftValid)
        {
            this.isLeftValid = true;
            this.left = this.goBoard.getNeighbour(this, GOBOARD_DIRECTION_LEFT);
        }
        return this.left;
    };

    // Returns the GoPoint object that is the direct neighbour of this
    // GoPoint object in GOBOARD_DIRECTION_RIGHT. Returns null if this GoPoint
    // object is located at the right edge of the Go board.
    GoPoint.prototype.getRight = function()
    {
        if (! this.isRightValid)
        {
            this.isRightValid = true;
            this.right = this.goBoard.getNeighbour(this, GOBOARD_DIRECTION_RIGHT);
        }
        return this.right;
    };

    // Returns the GoPoint object that is the direct neighbour of this
    // GoPoint object in GOBOARD_DIRECTION_UP. Returns null if this GoPoint
    // object is located at the upper edge of the Go board.
    GoPoint.prototype.getAbove = function()
    {
        if (! this.isAboveValid)
        {
            this.isAboveValid = true;
            this.above = this.goBoard.getNeighbour(this, GOBOARD_DIRECTION_UP);
        }
        return this.above;
    };

    // Returns the GoPoint object that is the direct neighbour of this
    // GoPoint object in GOBOARD_DIRECTION_DOWN. Returns null if this GoPoint
    // object is located at the lower edge of the Go board.
    GoPoint.prototype.getBelow = function()
    {
        if (! this.isBelowValid)
        {
            this.isBelowValid = true;
            this.below = this.goBoard.getNeighbour(this, GOBOARD_DIRECTION_DOWN);
        }
        return this.below;
    };

    // Returns a list of up to 4 GoPoint objects that are the direct
    // neighbours of this GoPoint object in GOBOARD_DIRECTION_LEFT,
    // GOBOARD_DIRECTION_RIGHT, GOBOARD_DIRECTION_UP and
    // GOBOARD_DIRECTION_DOWN. The returned array has no particular order.
    GoPoint.prototype.getNeighbours = function()
    {
        if (this.neighbours === null)
        {
            this.neighbours = [];

            var left = this.getLeft();
            if (left !== null)
                this.neighbours.push(left);
            var right = this.getRight();
            if (right !== null)
                this.neighbours.push(right);
            var above = this.getAbove();
            if (above !== null)
                this.neighbours.push(above);
            var below = this.getBelow();
            if (below !== null)
                this.neighbours.push(below);
        }

        return this.neighbours;
    };

    // Returns the GoPoint object that is the direct neighbour of this
    // GoPoint object in GOBOARD_DIRECTION_NEXT. Returns null if this GoPoint
    // object is the last GoPoint of the sequence.
    GoPoint.prototype.getNext = function()
    {
        if (! this.isNextValid)
        {
            this.isNextValid = true;
            this.next = this.goBoard.getNeighbour(this, GOBOARD_DIRECTION_NEXT);
        }
        return this.next;
    };

    // Returns the GoPoint object that is the direct neighbour of this
    // GoPoint object in GOBOARD_DIRECTION_PREVIOUS. Returns null if this GoPoint
    // object is the first GoPoint of the sequence.
    GoPoint.prototype.getPrevious = function()
    {
        if (! this.isPreviousValid)
        {
            this.isPreviousValid = true;
            this.previous = this.goBoard.getNeighbour(this, GOBOARD_DIRECTION_PREVIOUS);
        }
        return this.previous;
    };

    // Returns true if the intersection represented by this GoPoint is
    // occupied by a stone.
    GoPoint.prototype.hasStone = function()
    {
        return (COLOR_NONE !== this.stoneState);
    };

    // Returns true if the intersection represented by the GoPoint is
    // occupied by a black stone. Otherwise returns false (i.e. also returns
    // false if the intersection is not occupied by a stone).
    GoPoint.prototype.hasBlackStone = function()
    {
        return (COLOR_BLACK === this.stoneState);
    };

    // Returns the number of liberties that the intersection represented by
    // this GoPoint has. The way how liberties are counted depends on whether the
    // intersection is occupied by a stone.
    //
    // If the intersection is occupied by a stone, this method returns the number
    // of liberties of the entire stone group. If the intersection is not occupied,
    // this method returns the number of liberties of just that one intersection.
    GoPoint.prototype.getLiberties = function()
    {
        if (this.hasStone())
        {
            return this.goBoardRegion.getLiberties();
        }
        else
        {
            var liberties = 0;
            this.getNeighbours().forEach(function(neighbour) {
                if (! neighbour.hasStone())
                    liberties++;
            }, this);  // <-- supply "this" value seen in the loop
            return liberties;
        }
    };

    // Collects the GoBoardRegion objects from those neighbours
    // (see getNeighbours() method) of this GoPoint object whose
    // stoneState matches @a color, then returns an array with those
    // GoBoardRegion objects.
    //
    // The array that is returned contains no duplicates.
    GoPoint.prototype.getNeighbourRegionsWithColor = function(color)
    {
        var neighbourRegions = [];

        this.getNeighbours().forEach(function(neighbour) {
            if (neighbour.stoneState !== color)
                return;

            var neighbourRegion = neighbour.goBoardRegion;
            var index = neighbourRegions.indexOf(neighbourRegion);
            if (-1 !== index)
                return;

            neighbourRegions.push(neighbourRegion);
        }, this);  // <-- supply "this" value seen in the loop

        return neighbourRegions;
    };

    return GoPoint;
})();

// ----------------------------------------------------------------------
// The GoVertex class stores the coordinates that uniquely identify the
// intersection of a horizontal and a vertical line on the Go board. GoVertex
// objects are immutable, i.e. they cannot be changed once they have been
// created.
//
// A human-readable vertex is a string such as "C13". "A1" is in the
// lower-left corner of the Go board. The letter axis is horizontal, the
// number axis is vertical. The letter "I" is not used.
//
// A numeric vertex is a conversion of the compounds of a string vertex into
// their numeric values. The number axis conversion is 1:1, but letters are
// converted so that A=1, B=2, etc. The gap caused by the unused letter "I" is
// closed, i.e. H=8, J=9.
//
// GoVertex supports values in the range 1..19 on both axis.
//
// To reiterate: Numeric values are 1-based, not 0-based!
//
// GoVertex provides properties for accessing the vertex compounds both
// in their numeric and string form. In addition, GoVertex overrides the
// toString() method to provide the vertex in its human-readable form.
// ----------------------------------------------------------------------
var GoVertex = (function ()
{
    "use strict";

    // Letter I is missing by design! This is a convention in the Go world.
    const LETTER_AXIS_CHARACTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];

    function GoVertex(x, y)
    {
        // Numeric values are 1-based, not 0-based!
        if (x < 1 || x > 19 || y < 1 || y > 19)
            throw new Error("Vertex coordinates are invalid: x = " + x + ", y = " + y);

        this.x = x;
        this.y = y;
        this.letterAxisCompound = LETTER_AXIS_CHARACTERS[this.x - 1];
        this.numberAxisCompound = "" + this.y;
        this.humanReadableString = this.letterAxisCompound + this.numberAxisCompound;
    }

    GoVertex.prototype.toString = function()
    {
        return this.humanReadableString;
    };

    return GoVertex;
})();

// ----------------------------------------------------------------------
// The GoBoardRegion class is a collection of neighbouring GoPoint objects.
//
// GoPoint objects within a GoBoardRegion either all have a stone placed on
// them (in which case the GoBoardRegion represents a stone group), or they all
// have no stone (in which case the GoBoardRegion represents an empty area).
// If the GoBoardRegion represents a stone group, all stones are of the same
// color.
//
// Every GoPoint object is always part of a GoBoardRegion. At the beginning of
// a game there is only a single GoBoardRegion that represents the entire
// board; it contains all existing GoPoint objects. As the game progresses,
// the initial GoBoardRegion is fragmented into smaller GoBoardRegion objects.
//
// Scoring mode
// ------------
//
// GoBoardRegion assumes that if scoring mode is enabled (via setting of the
// correspondingly named function) the state of the Go board remains static,
// i.e. no stones are placed or removed. Operating under this assumption,
// GoBoardRegion starts to aggressively cache information that is otherwise
// computed dynamically. The benefit is improved performance during scoring.
//
// Clients do not need to know or care about which pieces of information are
// cached, this is an implementation detail.
// ----------------------------------------------------------------------
var GoBoardRegion = (function ()
{
    "use strict";

    // Creates a GoBoardRegion object. If the GoPoint parameter is not
    // specified the GoBoardRegion remains empty, otherwise it starts out
    // containing the single specified GoPoint. Note that in that case
    // the GoPoint object is first removed from its previous GoBoardRegion
    // container.
    function GoBoardRegion(goPoint)
    {
        this.points = [];
        this.scoringMode = false;
        this.territoryColor = COLOR_NONE;
        this.territoryInconsistencyFound = false;
        this.stoneGroupState = STONEGROUPSTATE_UNDEFINED;

        if (goPoint !== undefined)
            this.addPoint(goPoint);

        // We call this only to initialize cache member variables
        this.invalidateCache();
    }

    // Returns the size of the GoBoardRegion (which corresponds to the number
    // of GoPoint objects in the GoBoardRegion).
    GoBoardRegion.prototype.getSize = function()
    {
        if (this.scoringMode)
            return this.cachedSize;

        return this.points.length;
    };

    // Returns an array with GoPoint objects in the GoBoardRegion.
    // The array is empty if the GoBoardRegion contains no GoPoint
    // objects. The array has no particular order.
    GoBoardRegion.prototype.getPoints = function()
    {
        return this.points;
    };

    // Returns true if the GoBoardRegion represents a stone group.
    GoBoardRegion.prototype.isStoneGroup = function()
    {
        if (this.scoringMode)
            return this.cachedIsStoneGroup;

        if (0 === this.points.length)
            return false;
        var goPoint = this.points[0];
        return goPoint.hasStone();
    };

    // Returns the color of the stones in the GoBoardRegion, or COLOR_NONE
    // if the GoBoardRegion does not represent a stone group.
    GoBoardRegion.prototype.getColor = function()
    {
        if (this.scoringMode)
            return this.cachedColor;

        if (0 === this.points.length)
            return COLOR_NONE;
        var goPoint = this.points[0];
        return goPoint.stoneState;
    };

    // Returns the number of liberties of the stone group that the
    // GoBoardRegion represents. Throws an Error object if the GoBoardRegion
    // does not represent a stone group.
    GoBoardRegion.prototype.getLiberties = function()
    {
        if (this.scoringMode)
            return this.cachedLiberties;

        if (! this.isStoneGroup())
            throw new Error("GoBoardRegion does not represent a stone group");

        var libertyPoints = [];

        this.points.forEach(function(goPoint) {
            goPoint.getNeighbours().forEach(function(neighbour) {
                // Is it a liberty?
                if (neighbour.hasStone())
                    return;  // no
                // Count the liberty if it hasn't been counted already
                var index = libertyPoints.indexOf(neighbour);
                if (-1 === index)
                    libertyPoints.push(neighbour);
            }, this);  // <-- supply "this" value seen in the loop
        }, this);  // <-- supply "this" value seen in the loop

        return libertyPoints.length;
    };

    // Returns an array of GoBoardRegion objects that are direct neighbours
    // of this GoBoardRegion.
    GoBoardRegion.prototype.getAdjacentRegions = function()
    {
        if (this.scoringMode)
            return this.cachedAdjacentRegions;

        var adjacentRegions = [];

        this.points.forEach(function(goPoint) {
            goPoint.getNeighbours().forEach(function(neighbour) {
                // Is the neighbour in an adjacent region?
                var adjacentRegion = neighbour.goBoardRegion;
                if (adjacentRegion === this)
                    return;  // no
                if (adjacentRegion === null)
                    return;  // no (this should not happen, but at the moment we try to be graceful about it)
                // Count the adjacent region if it hasn't been counted already
                var index = adjacentRegions.indexOf(adjacentRegion);
                if (-1 === index)
                    adjacentRegions.push(adjacentRegion);
            }, this);  // <-- supply "this" value seen in the loop
        }, this);  // <-- supply "this" value seen in the loop

        return adjacentRegions;
    };

    // Adds the specified GoPoint object to the GoBoardRegion.
    //
    // Updates the GoBoardRegion reference of the specified GoPoint object to
    // the new GoBoardRegion. First removes the GoPoint object from the
    // GoBoardRegion that it previously belonged to. If the GoPoint object
    // point was the last point in that region, the other GoBoardRegion
    // object is deleted.
    //
    // Throws an Error object if the specified GoPoint is already in this
    // GoBoardRegion, or if its stoneState property does not match the
    // stoneState property of the other GoPoint objects already in this
    // GoBoardRegion.
    GoBoardRegion.prototype.addPoint = function(goPoint)
    {
        var previousGoBoardRegion = goPoint.goBoardRegion;
        if (this === previousGoBoardRegion)
            throw new Error("GoPoint is already associated with this GoBoardRegion");

        if (this.points.length > 0)
        {
            var otherGoPoint = this.points[0];
            if (otherGoPoint.stoneState !== goPoint.stoneState)
                throw new Error("GoPoint's stoneState (" + otherGoPoint.stoneState + ") does not match stoneState of points already in this GoBoardRegion (" + otherGoPoint.stoneState + ")");
        }

        // The previous GoBoardRegion can be null only when the GoBoard
        // initially constructs GoPoint objects and adds them to the
        // initial single GoBoardRegion
        if (previousGoBoardRegion !== null)
        {
            // Side-effect: sets goPoint.goBoardRegion to null. This is the
            // only moment during which a GoPoint can exist outside of a
            // GoBoardRegion. We immediately set the new reference a few lines
            // of code down.
            previousGoBoardRegion.removePoint(goPoint);
        }

        this.points.push(goPoint);
        goPoint.goBoardRegion = this;
    };

    // Removes the specified GoPoint from this GoBoardRegion.
    //
    // The GoBoardRegion reference of the specified GoPoint object
    // is updated to null. If the GoPoint object is the last point
    // in this GoBoardRegion, this GoBoardRegion is deleted.
    //
    // Important: Technically a GoPoint must always be part of a
    // GoBoardRegion! Whoever invokes this method must IMMEDIATELY
    // place the GoPoint object into another GoBoardRegion. This
    // method must ONLY be called as part of moving a GoPoint
    // object from one GoBoardRegion to another!
    //
    // Invoking this method may cause this GoBoardRegion to
    // fragment, i.e. other GoBoardRegion objects may come into
    // existence because GoPoint objects within this GoBoardRegion
    // are no longer adjacent.
    GoBoardRegion.prototype.removePoint = function(goPoint)
    {
        var previousGoBoardRegion = goPoint.goBoardRegion;
        if (this !== previousGoBoardRegion)
            throw new Error("GoPoint is not associated with this GoBoardRegion");

        var index = this.points.indexOf(goPoint);
        if (index === -1)
            throw new Error("GoBoardRegion has no reference to GoPoint");

        this.points.splice(index, 1);

        // Check this.points NOW because the next statement might delete this
        // GoBoardRegion, including this.points
        var lastPoint = (0 === this.points.length);

        // If point is the last point in this region, the next statement is
        // going to remove the last reference to this GoBoardRegion - the
        // runtime is now clear to delete this GoBoardRegion.
        goPoint.goBoardRegion = null;

        if (! lastPoint)
            this.splitRegionAfterRemovingPoint(goPoint);
    };

    // Joins the specified GoBoardRegion with this GoBoardRegion, i.e. all
    // GoPoint objects in the specified GoBoardRegion are added to this
    // GoBoardRegion.
    //
    // Updates the GoBoardRegion reference of all GoPoint objects to this
    // GoBoardRegion. As a result, the specified GoBoardRegion might be
    // deleted by the runtime and should not be used after this method
    // returns.
    //
    // Throws an Error object if the specified GoBoardRegion is the same
    // as this GoBoardRegion, or if the stoneState property of its GoPoint
    // members does not match the stoneState property of the other GoPoint
    // objects already in this GoBoardRegion.
    GoBoardRegion.prototype.joinRegion = function(goBoardRegion)
    {
        if (this === goBoardRegion)
            throw new Error("Specified GoBoardRegion is the same as this GoBoardRegion object");

        // Iterate over a copy of the array to be safe from modifications of
        // the array. Such modifications occur because addPoint() below causes
        // the GoPoint to be removed from the other region.
        var pointsCopy = goBoardRegion.points.slice();
        pointsCopy.forEach(function(goPoint) {
            this.addPoint(goPoint);
        }, this);  // <-- supply "this" value seen in the loop
    };

    // Splits the GoBoardRegion if any of the GoPoint objects within it
    // are no longer adjacent after the specified GoPoint object has been
    // removed.
    //
    // Additional GoBoardRegion objects are created by this method if it detects
    // that this GoBoardRegion has fragmented into smaller, non-adjacent sets of
    // GoPoint objects.
    //
    // It may help to understand the implementation if one keeps in mind that
    // this method is invoked only for the following scenarios:
    // - When a stone is placed either by regular play, or when a board position
    //   is set up, a single empty region may fragment into multiple empty
    //   regions
    // - When a stone is removed by undoing a move, a single stone group may
    //   fragment into multiple stone groups
    //
    // Note: When this method is invoked, @a removedPoint must already have
    // been removed from this GoBoardRegion.
    //
    // Note: This is a private backend helper method for removePoint().
    GoBoardRegion.prototype.splitRegionAfterRemovingPoint = function(removedGoPoint)
    {
        // Split not possible if less than 2 points
        if (this.points.length < 2)
            return;

        var subRegionArrays = [];

        // Because the point that has been removed is the splitting point,
        // we iterate the point's neighbours to see if they are still connected
        // Use some() so that we can abort the loop prematurely
        removedGoPoint.getNeighbours().some(function(neighbourOfRemovedPoint) {
            // We are not interested in the neighbour if it is not in our region
            if (neighbourOfRemovedPoint.goBoardRegion !== this)
                return false;  // together with some() this simulates continue in a foreach loop

            // Check if the current neighbour is connected to one of the other
            // neighbours that have been previously processed
            var isNeighbourConnected = subRegionArrays.some(function(subRegionArray) {
                var index = subRegionArray.indexOf(neighbourOfRemovedPoint);
                // some() requires that we return a value:
                // true => break iteration, i.e. neighbour is connected
                // false => continue with iteration, i.e. neighour is not connected
                return (index !== -1);
            }, this);  // <-- supply "this" value seen in the loop

            // If the neighbour is connected then we can skip it
            if (isNeighbourConnected)
                return false;  // together with some() this simulates continue in a foreach loop

            // If the neighbour is not connected, we can create a new
            // sub-region that contains the current neighbour and its
            // neighbours that are also in this (the main region)
            var newSubRegionArray = [];
            subRegionArrays.push(newSubRegionArray);
            this.fillSubRegionContainingPoint(newSubRegionArray, neighbourOfRemovedPoint);

            // If the new sub-region has the same size as this (the main
            // region), then it effectively is the same thing as this. There
            // won't be any more splits, so we can skip processing the
            // remaining neighbours. We also don't have to create a new
            // GoBoardRegion object - this would unnecessarily shuffle all
            // remaining points from this to the new region.
            if (this.points.length === newSubRegionArray.length)
                return true;  // together with some() this simulates break in a foreach loop

            // At this point we know that newSubRegionArray does not contain
            // all the points of this (the main region), so a split is certain
            // to occur and we need a new GoBoardRegion. We need to immediately
            // remove the points of newSubRegionArray from this (the main
            // region) so that in the next iteration the GoPoint.goBoardRegion
            // property of those points is already correct.
            var newGoBoardRegion = new GoBoardRegion();
            newGoBoardRegion.moveSubRegionFromMainRegion(newSubRegionArray, this);

            // some() requires that we return a value to continue with
            // the iteration
            return false;
        }, this);  // <-- supply "this" value seen in the loop
    };

    // Recursively adds GoPoint objects to the specified sub-region array
    // that are connected with @a point and that, together, form a sub-region
    // of this GoBoardRegion.
    //
    // Note: This is a private backend helper method for
    // splitRegionAfterRemovingPoint().
    GoBoardRegion.prototype.fillSubRegionContainingPoint = function(subRegionArray, goPoint)
    {
        subRegionArray.push(goPoint);

        goPoint.getNeighbours().forEach(function(neighbour) {
            // Check simple property first - this catches a significant
            // amount of cases so that we don't have to check the array
            // at all.
            if (neighbour.goBoardRegion !== this)
                return;

            // Check array second - do this only after the simple property
            // check above. In Objective-C this ordering had a measurable
            // positive effect on performance (although measurements were
            // taken a long time on an iPhone 3GS).
            var index = subRegionArray.indexOf(neighbour);
            if (index !== -1)
                return;

            this.fillSubRegionContainingPoint(subRegionArray, neighbour);
        }, this);  // <-- supply "this" value seen in the loop
    };

    // Moves the GoPoint objects in the specified sub-region array to this
    // GoBoardRegion. The GoPoint objects currently must be part of the
    // specified main GoBoardRegion object.
    //
    // The purpose of this method is to provide a light-weight alternative to
    // removePoint(). removePoint() is heavy-weight because it applies expensive
    // region-fragmentation logic to the GoBoardRegion from which the GoPoint
    // object is removed.
    //
    // In contrast, this method does not apply the region-fragmentation logic:
    // it simply assumes the GoPoint objects in the sub-region array are
    // connected and form a sub-region of the main GoBoardRegion. Operating
    // under this assumption, GoPoint objects in the sub-region array can
    // simply be bulk-removed from the main GoBoardRegion and bulk-added to
    // to this GoBoardRegion. The only thing that is done in addition is
    // updating the GoBoardRegion reference of the GoPoint objects being moved.
    //
    // Note: The assumption that GoPoint objects in the sub-region array are
    // connected is not checked for efficiency reasons, again with the goal to
    // keep this method as light-weight as possible.
    //
    // Note: If the main GoBoardRegion is empty after all GoPoint objects have
    // been moved, it is deleted. The effect is the same as if joinRegion:()
    // had been called.
    //
    // Throws an Error object if the GoPoint objects in the sub-region array
    // do not reference the main GoBoardRegion, or if their stoneState property
    // does not match the stoneState property of the other GoPoint objects
    // already in this GoBoardRegion.
    //
    // Note: This is a private backend helper method for
    // splitRegionAfterRemovingPoint().
    GoBoardRegion.prototype.moveSubRegionFromMainRegion = function(subRegionArray, mainGoBoardRegion)
    {
        if (0 === subRegionArray.length)
            return;

        // We only check the attributes of the first point of the sub-region,
        // assuming that it is representative for the other points in the
        // array. We don't check all points for efficiency reasons!
        var firstPointOfSubRegionArray = subRegionArray[0];
        var previousGoBoardRegion = firstPointOfSubRegionArray.goBoardRegion;
        if (mainGoBoardRegion !== previousGoBoardRegion)
            throw new Error("Points of subregion do not reference specified main region");

        if (this.points.length > 0)
        {
            var otherGoPoint = this.points[0];
            if (otherGoPoint.stoneState !== firstPointOfSubRegionArray.stoneState)
                throw new Error("Subregion points' stoneState ("+ firstPointOfSubRegionArray.stoneState + ") does not match stoneState of points already in this GoBoardRegion (" + otherGoPoint.stoneState + ")");
        }

        // Bulk-remove subRegionArray
        var subRegionArrayCopy = subRegionArray.slice();
        mainGoBoardRegion.points = mainGoBoardRegion.points.filter(function(goPoint) {
            var index = subRegionArrayCopy.indexOf(goPoint);
            if (index === -1)
            {
                return true;  // keep the point, it's not in the sub-region
            }
            else
            {
                // Make the array smaller so that in the next iteration
                // indexOf() has less work to do
                subRegionArrayCopy.slice(index, 1);
                return false;  // discard the point
            }
        }, this);  // <-- supply "this" value seen in the loop

        // Bulk-add subRegionArray
        this.points = this.points.concat(subRegionArray);

        // Update region references. Note that mainGoBoardRegion may be deleted
        // by this operation, so we must not use it after the loop completes.
        subRegionArray.forEach(function(goPoint) {
            goPoint.goBoardRegion = this;
        }, this);  // <-- supply "this" value seen in the loop
    };

    // Enables scoring mode. The GoBoardRegion fills its cache and from now on
    // will return cached information until scoring mode is disabled.
    GoBoardRegion.prototype.enableScoringMode = function()
    {
        if (this.scoringMode)
            return;

        // Fill the cache before updating scoringMode! This allows fillCache() to
        // invoke normal members to gather the information
        // -> members will check scoringMode and see that the mode is still disabled,
        //    so they will perform their normal dynamic computing
        // -> the result can then be stored in a special caching member whose value
        //    will subsequently be returned by members once they see that the mode is
        //    enabled
        this.fillCache();

        this.scoringMode = true;
    };

    // Disables scoring mode. The GoBoardRegion invalidates its cache and from
    // now on will again return dynamically computed information.
    GoBoardRegion.prototype.disableScoringMode = function()
    {
        this.invalidateCache();
        this.scoringMode = false;
    };

    // Fills the information cache to be used while scoring mode is enabled.
    GoBoardRegion.prototype.fillCache = function()
    {
        this.cachedSize = this.getSize();
        this.cachedIsStoneGroup = this.isStoneGroup();
        this.cachedColor = this.getColor();
        if (this.cachedIsStoneGroup)
            this.cachedLiberties = this.getLiberties();
        this.cachedAdjacentRegions = this.getAdjacentRegions();

        this.territoryColor = undefined;
        this.territoryInconsistencyFound = undefined;
        this.stoneGroupState = undefined;
    };

    // Invalidates cached information gathered while scoring mode was enabled.
    GoBoardRegion.prototype.invalidateCache = function()
    {
        this.cachedSize = undefined;
        this.cachedIsStoneGroup = undefined;
        this.cachedColor = undefined;
        this.cachedLiberties = undefined;
        this.cachedAdjacentRegions = undefined;

        this.territoryColor = undefined;
        this.territoryInconsistencyFound = undefined;
        this.stoneGroupState = undefined;
    };

    // During scoring denotes which territory the GoBoardRegion belongs to.
    // Must be COLOR_BLACK, COLOR_WHITE or COLOR_NONE.
    GoBoardRegion.prototype.getTerritoryColor = function()
    {
        return this.territoryColor;
    };
    GoBoardRegion.prototype.setTerritoryColor = function(territoryColor)
    {
        this.territoryColor = territoryColor;
    };

    // Returns true if the scoring algorithm detected an inconsistency and
    // was unable to assign a territory color to the GoBoardRegion.
    //
    // If this flag is true, getTerritoryColor() returns COLOR_NONE. However,
    // it cannot be concluded from this that the region is truly neutral.
    GoBoardRegion.prototype.getTerritoryInconsistencyFound = function()
    {
        return this.territoryInconsistencyFound;
    };
    GoBoardRegion.prototype.setTerritoryInconsistencyFound = function(territoryInconsistencyFound)
    {
        this.territoryInconsistencyFound = territoryInconsistencyFound;
    };

    // During scoring denotes the state of the stone group represented by
    // the GoBoardRegion. Returns STONEGROUPSTATE_UNDEFINED if the
    // GoBoardRegion is not a stone group.
    GoBoardRegion.prototype.getStoneGroupState = function()
    {
        return this.stoneGroupState;
    };
    GoBoardRegion.prototype.setStoneGroupState = function(stoneGroupState)
    {
        this.stoneGroupState = stoneGroupState;
    };

    return GoBoardRegion;
})();

// ----------------------------------------------------------------------
// The GoPlayer class represents one of the two players of a Go game.
// ----------------------------------------------------------------------
var GoPlayer = (function ()
{
    "use strict";

    // Creates a new GoPlayer object. The player plays with stones of the
    // specified color (must be either COLOR_BLACK or COLOR_WHITE).
    function GoPlayer(stoneColor)
    {
        this.stoneColor = stoneColor;
    }

    // Returns true if the GoPlayer plays with black stones, false if the
    // GoPlayer plays with white stones.
    GoPlayer.prototype.isBlack = function()
    {
        return (this.stoneColor === COLOR_BLACK);
    };

    // Returns the color that the GoPlayer plays with.
    GoPlayer.prototype.getStoneColor = function()
    {
        return this.stoneColor;
    };

    return GoPlayer;
})();

// ----------------------------------------------------------------------
// The GoMove class represents a move made by one of the players.
//
// A GoMove object always has a type; the different types of moves are
// enumerated by the GOMOVE_TYPE_... constants. A GoMove object is always
// associated with the GoPlayer who made the move. The GoPlayer object can
// be queried for the color of the move.
//
// If a GoMove object is of type GOMOVE_TYPE_PLAY it also has an associated
// GoPoint object which registers where the stone was placed.
//
// GoMove objects are interlinked with their predecessor (getPreviousGoMove())
// and successor (getNextGoMove()) GoMove object. This represents the fact
// that a game can be seen as a series of moves.
//
// Playing/undoing a move
// ----------------------
// For a GoMove object that is of type GOMOVE_TYPE_PLAY, invoking the doIt()
// method triggers the mechanism for placing a stone. This is a comparatively
// expensive operation, as doIt() manipulates the entire board to reflect the
// position that exists after the stone has been placed.
//
// For a GoMove object that is of type GOMOVE_TYPE_PASS, invoking the doIt()
// method has no effect.
//
// Invoking undo() reverts whatever operations were performed by doIt(). For
// GoMove objects of type GOMOVE_TYPE_PASS this resolves to nothing. For GoMove
// objects of type GOMOVE_TYPE_PLAY, the board is reverted to the state it had
// before the move's stone was placed.
//
// Note: doIt() and undo() must never be invoked twice in a row. They can be
// invoked in alternation any number of times.
// ----------------------------------------------------------------------
var GoMove = (function ()
{
    "use strict";

    // Creates a new GoMove object of the specified type. The move is played
    // by the specified GoPlayer. The move is the successor the specified
    // previous GoMove. The previous GoMove can be omitted if the new GoMove
    // is the first move of the game, in which case the property
    // "previousGoMove" will have the value null (i.e. NOT undefined).
    function GoMove(moveType, goPlayer, previousGoMove)
    {
        this.moveType = moveType;
        this.goPlayer = goPlayer;

        if (previousGoMove === undefined)
        {
            this.previousGoMove = null;
            this.moveNumber = 1;
        }
        else
        {
            this.previousGoMove = previousGoMove;
            this.moveNumber = this.previousGoMove.moveNumber + 1;

            this.previousGoMove.nextGoMove = this;
        }

        // The successor to this GoMove object. Is assigned when the next
        // move is played, remains null until then. Is null if this is
        // the last move of the game.
        this.nextGoMove = null;

        // The GoPoint object registering where the stone was placed for this
        // GoMove. Is assigned soon after construction for GOMOVE_TYPE_PLAY,
        // but remains null for GOMOVE_TYPE_PASS.
        //
        // The actor that sets this property must have checked whether
        // placing the stone at @a newValue is a legal move.
        this.goPoint = null;

        // Keeps track of stones that were captured by this move. Is assigned
        // soon after construction for GOMOVE_TYPE_PLAY if a capture was made,
        // but remains always empty for GOMOVE_TYPE_PASS.
        //
        // If not empty, the array contains an unordered list of GoPoint
        // objects. Also, if several stone groups were captured, the GoPoint
        // objects do NOT form a single contiguous GoBoardRegion.
        this.capturedStones = [];

        // Zobrist hash that identifies the board position created by this
        // move. Zobrist hashes are used to detect ko, and especially superko.
        // Is assigned soon after construction.
        this.zobristHash = 0;
    }

    GoMove.prototype.getPreviousGoMove = function()
    {
        return this.previousGoMove;
    };

    GoMove.prototype.getNextGoMove = function()
    {
        return this.nextGoMove;
    };

    GoMove.prototype.getZobristHash = function()
    {
        return this.zobristHash;
    };

    GoMove.prototype.setGoPoint = function(goPoint)
    {
        this.goPoint = goPoint;
    };

    // Modifies the board to reflect the state after this GoMove was played.
    //
    // Invoking this method has no effect unless this GoMove is of type
    // GOMOVE_TYPE_PLAY.
    //
    // If this GoMove is of type GOMOVE_TYPE_PLAY, this method effectively
    // places a stone at the intersection referred to by the GoPoint object
    // stored in the goPoint property. This placing of a stone includes the
    // following  modifications:
    // - Updates GoPoint.stoneState for the GoPoint object in property
    //   goPoint.
    // - Updates GoPoint.goBoardRegion for the GoPoint object in property
    //   goPoint. As a result, GoBoardRegions may become fragmented and/or
    //   multiple GoBoardRegions may merge with other regions.
    // - If placing the stone reduces an opposing stone group to 0 (zero)
    //   liberties, that stone group is captured. The GoBoardRegion
    //   representing the captured stone group turns back into an empty area.
    //
    // Throws an Error object if the GoMove is of type GOMOVE_TYPE_PLAY and one
    //  the following conditions is true:
    // - The goPoint  property is null
    // - The stoneState property of the GoPoint object in the goPoint property
    //   is not COLOR_NONE (i.e. there already is a stone on the intersection).
    GoMove.prototype.doIt = function(goGame)
    {
        // Nothing to do for pass moves
        if (this.moveType === GOMOVE_TYPE_PASS)
        {
            if (this.previousGoMove !== null)
                this.zobristHash = this.previousGoMove.zobristHash;
            return;
        }

        if (this.goPoint === null)
            throw new Error("GoMove has no associated GoPoint");

        if (this.goPoint.stoneState !== COLOR_NONE)
            throw new Error("Color of GoPoint " + this.goPoint + " is not COLOR_NONE (actual color is " + this.goPoint.stoneState + ")");

        // Update the point's stone state *BEFORE* moving it to a new region
        if (this.goPlayer.isBlack())
            this.goPoint.stoneState = COLOR_BLACK;
        else
            this.goPoint.stoneState = COLOR_WHITE;

        goGame.goUtilities.movePointToNewRegion(this.goPoint);

        // If the captured stones array already contains entries we assume
        // that this invocation of doIt() is actually a "redo", i.e. undo()
        // has previously been invoked for this GoMove
        var redo = (this.capturedStones.length > 0);

        // Check neighbours for captures
        this.goPoint.getNeighbours().forEach(function(neighbour) {
            if (! neighbour.hasStone())
                return;
            if (neighbour.hasBlackStone() === this.goPoint.hasBlackStone())
                return;
            if (neighbour.getLiberties() > 0)
                return;

            // The stone made a capture!!!
            neighbour.goBoardRegion.getPoints().forEach(function(goPointCapture) {
                // If in the next iteration of the outer loop we find a
                // neighbour in the same captured group, the neighbour will
                // already have its state reset, and we will skip it
                goPointCapture.stoneState = COLOR_NONE;

                if (redo)
                {
                    var index = this.capturedStones.indexOf(goPointCapture);
                    if (index === -1)
                        throw new Error("Redo of GoMove: Captured stone on point " + goPointCapture + " is not in array");
                }
                else
                {
                    this.capturedStones.push(goPointCapture);
                }

            }, this);  // <-- supply "this" value seen in the loop
        }, this);  // <-- supply "this" value seen in the loop

        this.zobristHash = this.goPoint.goBoard.goZobristTable.getHashForMove(this);
    };

    // Reverts the board to the state it had before this GoMove was played.
    //
    // As a side-effect of this method, GoBoardRegions may become fragmented
    // and/or multiple GoBoardRegions may merge with other regions.
    //
    // Throws an Error object if the GoMove is of type GOMOVE_TYPE_PLAY and one
    //  the following conditions is true:
    // - The goPoint  property is null
    // - The stoneState property of the GoPoint object in the goPoint property
    //   does not match the color of the player in the goPolayer property.
    GoMove.prototype.undo = function(goGame)
    {
        // Nothing to do for pass moves
        if (this.moveType === GOMOVE_TYPE_PASS)
            return;

        if (this.goPoint === null)
            throw new Error("GoMove has no associated GoPoint");

        var playedStoneColor;
        var capturedStoneColor;
        if (this.goPlayer.isBlack())
        {
            playedStoneColor = COLOR_BLACK;
            capturedStoneColor = COLOR_WHITE;
        }
        else
        {
            playedStoneColor = COLOR_WHITE;
            capturedStoneColor = COLOR_BLACK;
        }

        if (playedStoneColor !== this.goPoint.stoneState)
            throw new Error("Color of GoPoint " + this.goPoint + " does not match player color " + playedStoneColor + " (actual color is " + this.goPoint.stoneState + ")");

        // Update stone state of captured stones *BEFORE* handling the actual
        // point of this move. This makes sure that the call to
        // GoUtilities.movePointToNewRegion() further down does not join
        // regions incorrectly.
        this.capturedStones.forEach(function(goPointCapture) {
            goPointCapture.stoneState = capturedStoneColor;
        }, this);  // <-- supply "this" value seen in the loop

        // Update the point's stone state *BEFORE* moving it to a new region
        this.goPoint.stoneState = COLOR_NONE;

        goGame.goUtilities.movePointToNewRegion(this.goPoint);
    };

    return GoMove;
})();

// ----------------------------------------------------------------------
// The GoZobristTable class encapsulates a table with random values.
// When requested by clients, it uses those values co calculate Zobrist hashes.
// (Zobrist hashes are used to find superko). It is the responsibiility of
// clients to store the calculated hashes for later use.
//
// Read the Wikipedia article [1] to find out more about Zobrist hashing.
//
// TODO: JavaScript does not have 64-bit integer support, for this reason
// the following comment is inaccurate - the current GoZobristTable
// implementation works with 53-bit integers only (Number.MAX_SAFE_INTEGER).
// We need to add 64-bit support by way of a high-precision library. The
// library must be able to generate random numbers and to XOR two numbers.
//
// GoZobristTable uses 64 bit random values to initialize the table. Why 64 bit
// and not, for instance, 32 bit, or 128 bit? I am not a computer scientist, so
// I do not know the real reason. I am simply using the same number of bits
// as everybody else (e.g. Fuego, but also [2]). It appears that it is
// universally accepted that the chance for a hash collision is extremely (!)
// small when 64 bit values are used (e.g. [3]).
//
// [1] http://en.wikipedia.org/wiki/Zobrist_hashing
// [2] http://www.cwi.nl/~tromp/java/go/GoGame.java
// [3] http://osdir.com/ml/games.devel.go/2002-09/msg00006.html
// ----------------------------------------------------------------------
var GoZobristTable = (function ()
{
    "use strict";

    function GoZobristTable(boardSize)
    {
        this.boardSize = boardSize;
        // This will end up with the following number of elements:
        //   boardSize * boardSize * 2
        //   ^           ^           ^
        //   x-axis      y-axis      two colors (black and white)
        this.zobristTable = [];
        this.fillZobristTableWithRandomNumbers();
    }

    GoZobristTable.prototype.fillZobristTableWithRandomNumbers = function()
    {
        // Unlike other runtime environments it appears that in JavaScript
        // we don't have to seed the random number generator.

        for (var vertexX = 0; vertexX < this.boardSize; ++vertexX)
        {
            for (var vertexY = 0; vertexY < this.boardSize; ++vertexY)
            {
                for (var color = 0; color < 2; ++color)
                {
                    var random53BitNumber = this.generateRandom53BitNumber();
                    this.zobristTable.push(random53BitNumber);
                }
            }
        }
    };

    GoZobristTable.prototype.generateRandom53BitNumber = function()
    {
        // Number.MAX_SAFE_INTEGER is 2^53 - 1
        return Math.random() * Number.MAX_SAFE_INTEGER;
    };

    // Generates the Zobrist hash for the current board position represented
    // by @a goBoard.
    GoZobristTable.prototype.getHashForBoard = function(goBoard)
    {
        this.throwIfTableSizeDoesNotMatchSizeOfBoard(goBoard);

        var hash = 0;
        var goPoint = goBoard.getPointAtCorner(GOBOARDCORNER_BOTTOMLEFT);
        while (goPoint !== null)
        {
            if (goPoint.hasStone())
            {
                var index = this.getIndexOfPoint(goPoint);
                hash ^= this.zobristTable[index];
            }
            goPoint = goPoint.getNext();
        }
        return hash;
    };

    // Generates the Zobrist hash for @a goMove.
    //
    // The hash is calculated incrementally from the previous move:
    // - Any stones that are captured by @a goMove are removed from the hash of the
    //   previous move
    // - The stone that was added by @a goMove is added to the hash of the previous
    //   move
    //
    // If there is no previous move the calculation starts with 0.
    //
    // If @a goMove is a pass move, the resulting hash is the same as for the
    // previous move.
    GoZobristTable.prototype.getHashForMove = function(goMove)
    {
        var hash;
        if (GOMOVE_TYPE_PLAY === goMove.moveType)
        {
            hash = this.getHashForStonePlayedByColorAtPointCapturingStonesAfterMove(
                goMove.goPlayer.getStoneColor(),
                goMove.goPoint,
                goMove.capturedStones,
                goMove.getPreviousGoMove());
        }
        else
        {
            var previousGoMove = goMove.getPreviousGoMove();
            if (previousGoMove !== null)
                hash = previousGoMove.getZobristHash();
            else
                hash = 0;
        }
        return hash;
    };

    // Generates the Zobrist hash for a hypothetical move played by @a color
    // on the intersection @a goPoint, after the previous move
    // @a previousGoMove. The move would capture the stones in
    // @a capturedStones (array of GoPoint objects).
    //
    // The hash is calculated incrementally from the Zobrist hash of the previous
    // move @a previousGoMove:
    // - Stones that are captured are removed from the hash
    // - The stone that was added is added to the hash
    //
    // If @a previousGoMove is null the calculation starts with 0.
    //
    // @a capturedStones can be null if the move does not capture any stones.
    GoZobristTable.prototype.getHashForStonePlayedByColorAtPointCapturingStonesAfterMove = function(
        color,
        goPoint,
        capturedStones,
        previousGoMove)
    {
        var hash;
        if (previousGoMove !== null)
            hash = previousGoMove.getZobristHash();
        else
            hash = 0;

        this.throwIfTableSizeDoesNotMatchSizeOfBoard(goPoint.goBoard);

        if (capturedStones !== null)
        {
            capturedStones.forEach(function(capturedStone) {
                var indexCaptured = this.getIndexForStoneAtPointCapturedByColor(capturedStone, color);
                hash ^= this.zobristTable[indexCaptured];
            }, this);  // <-- supply "this" value seen in the loop
        }

        var indexPlayed = this.getIndexForStoneAtPointPlayedByColor(goPoint, color);
        hash ^= this.zobristTable[indexPlayed];

        return hash;
    };

    GoZobristTable.prototype.getIndexOfPoint = function(goPoint)
    {
        var color = this.getColorOfStoneAtPoint(goPoint);
        return this.getIndexForVertexColorBoardSize(goPoint.goVertex, color, this.boardSize);
    };

    GoZobristTable.prototype.getColorOfStoneAtPoint = function(goPoint)
    {
        var color = goPoint.hasBlackStone() ? COLOR_BLACK : COLOR_WHITE;
        return color;
    };

    GoZobristTable.prototype.getIndexForStoneAtPointPlayedByColor = function(goPoint, color)
    {
        var colorOfPlayedStone = this.getColorOfStonePlayedByColor(color);
        return this.getIndexForVertexColorBoardSize(goPoint.goVertex, colorOfPlayedStone, this.boardSize);
    };

    GoZobristTable.prototype.getColorOfStonePlayedByColor = function(color)
    {
        // The inverse of getColorOfStoneCapturedByColor()
        return (COLOR_BLACK === color ? COLOR_BLACK : COLOR_WHITE);
    };

    GoZobristTable.prototype.getIndexForStoneAtPointCapturedByColor = function(goPoint, color)
    {
        var colorOfCapturedStone = this.getColorOfStoneCapturedByColor(color);
        return this.getIndexForVertexColorBoardSize(goPoint.goVertex, colorOfCapturedStone, this.boardSize);
    };

    GoZobristTable.prototype.getColorOfStoneCapturedByColor = function(color)
    {
        // The inverse of getColorOfStonePlayedByColor()
        return (COLOR_BLACK === color ? COLOR_WHITE : COLOR_BLACK);
    };

    GoZobristTable.prototype.getIndexForVertexColorBoardSize = function(goVertex, color, boardSize)
    {
        var index = (color * boardSize * boardSize) + ((goVertex.y - 1) * boardSize) + (goVertex.x - 1);
        return index;
    };

    GoZobristTable.prototype.throwIfTableSizeDoesNotMatchSizeOfBoard = function(goBoard)
    {
        if (goBoard.boardSize !== this.boardSize)
            throw new Error("Board size " + goBoard.boardSize + " does not match Zobrist table size " + this.boardSize);
    };

    return GoZobristTable;
})();

// ----------------------------------------------------------------------
// The GoUtilities class is a container for various utility functions
// that operate on all sorts of Go domain model objects.
// ----------------------------------------------------------------------
var GoUtilities = (function ()
{
    "use strict";

    // The following arrays must have one element for every possible board size
    const MAX_HANDICAPS = [4, 9, 9, 9, 9, 9, 9];
    const EDGE_DISTANCES = [3, 3, 3, 4, 4, 4, 4];

    // Creates a new GoUtilities object that operates on the specified GoGame
    // object and its associated Go domain model objects.
    function GoUtilities(goGame)
    {
        this.goGame = goGame;
    }

    // Returns an (unordered) array of GoVertex objects that denote vertices
    // for the handicap/board size combination of the GoGame that the GoUtilities
    // operates on.
    //
    // For board sizes greater than 7x7, @a handicap must be between 2 and 9.
    // For board size 7x7, @a handicap must be between 2 and 4. The limits
    // are inclusive.
    //
    // The handicap positions returned by this method correspond to those
    // specified in section 4.1.1 of the GTP v2 specification.
    // http://www.lysator.liu.se/~gunnar/gtp/gtp2-spec-draft2/gtp2-spec.html#sec:fixed-handicap-placement
    //
    // Handicap stone distribution for handicaps 1-5:
    // @verbatim
    // 3   2
    //   5
    // 1   4
    // @endverbatim
    //
    // Handicap stone distribution for handicaps 6-7:
    // @verbatim
    // 3   2
    // 5 7 6
    // 1   4
    // @endverbatim
    //
    // Handicap stone distribution for handicaps 8-9:
    // @verbatim
    // 3 8 2
    // 5 9 6
    // 1 7 4
    // @endverbatim
    GoUtilities.prototype.getHandicapVertices = function()
    {
        var handicap = this.goGame.handicap;
        var boardSize = this.goGame.goBoard.boardSize;

        var handicapVertices = [];
        if (0 === handicap)
            return handicapVertices;

        var boardSizeAsArrayIndex = Math.floor((boardSize - BOARDSIZE_SMALLEST) / 2);
        if (handicap < 2 || handicap > MAX_HANDICAPS[boardSizeAsArrayIndex])
        {
            throw new Error("Handicap " + handicap + " is out of range for board size " + boardSize);
        }

        var edgeDistance = EDGE_DISTANCES[boardSizeAsArrayIndex];
        var lineClose = edgeDistance;
        var lineFar = boardSize - edgeDistance + 1;
        var lineMiddle = lineClose + ((lineFar - lineClose) / 2);

        for (var handicapIter = 1; handicapIter <= handicap; ++handicapIter)
        {
            var vertexX;
            var vertexY;
            switch (handicapIter)
            {
                case 1:
                {
                    vertexX = lineClose;
                    vertexY = lineClose;
                    break;
                }
                case 2:
                {
                    vertexX = lineFar;
                    vertexY = lineFar;
                    break;
                }
                case 3:
                {
                    vertexX = lineClose;
                    vertexY = lineFar;
                    break;
                }
                case 4:
                {
                    vertexX = lineFar;
                    vertexY = lineClose;
                    break;
                }
                case 5:
                {
                    if (handicapIter === handicap)
                    {
                        vertexX = lineMiddle;
                        vertexY = lineMiddle;
                    }
                    else
                    {
                        vertexX = lineClose;
                        vertexY = lineMiddle;
                    }
                    break;
                }
                case 6:
                {
                    vertexX = lineFar;
                    vertexY = lineMiddle;
                    break;
                }
                case 7:
                {
                    if (handicapIter === handicap)
                    {
                        vertexX = lineMiddle;
                        vertexY = lineMiddle;
                    }
                    else
                    {
                        vertexX = lineMiddle;
                        vertexY = lineClose;
                    }
                    break;
                }
                case 8:
                {
                    vertexX = lineMiddle;
                    vertexY = lineFar;
                    break;
                }
                case 9:
                {
                    vertexX = lineMiddle;
                    vertexY = lineMiddle;
                    break;
                }
                default:
                {
                    throw new Error("Unsupported handicap " + handicapIter);
                }
            }

            var goVertex = new GoVertex(vertexX, vertexY);
            handicapVertices.push(goVertex);
        }

        return handicapVertices;
    };

    // Returns an (unordered) array of GoPoint objects that denote the
    // intersections on which handicap stones are to be placed for the
    // handicap/board size combination of the GoGame that the GoUtilities
    // operates on.
    //
    // See getHandicapVertices() for details.
    GoUtilities.prototype.getHandicapPoints = function()
    {
        var board = this.goGame.goBoard;
        var handicapPoints = [];

        var handicapVertices = this.getHandicapVertices();
        handicapVertices.forEach(function(goVertex) {
            var goPoint = board.getPointAtVertex(goVertex);
            handicapPoints.push(goPoint);
        }, this);

        return handicapPoints;
    };

    // Returns the maximum handicap for the board size of the GoGame that
    // the GoUtilities operates on.
    GoUtilities.prototype.getMaximumHandicap = function()
    {
        var boardSize = this.goGame.goBoard.boardSize;

        switch (boardSize)
        {
            case BOARDSIZE_7:
                return 4;
            default:
                return 9;
        }
    };

    // Places handicap stones on the board of the GoGame that the GoUtilities
    // operates on. The game's handicap/board size determine the intersections
    // where stones are to be placed.
    //
    // See getHandicapVertices() for details.
    GoUtilities.prototype.placeHandicapStones = function()
    {
        var handicapPoints = this.getHandicapPoints();
        handicapPoints.forEach(function(goPoint) {
            goPoint.stoneState = COLOR_BLACK;
            this.movePointToNewRegion(goPoint);
        }, this);
    };

    // Moves the specified GoPoint object to a new GoBoardRegion in response to
    // a change of GoPoint.stoneState.
    //
    // The specified GoPoint's stoneState property must already have its new
    // value at the time this method is invoked.
    //
    // Effects of this method are:
    // - The GoPoint is removed from its old GoBoardRegion
    // - The GoPoint is added either to an existing GoBoardRegion (if one of
    //   the neighbours of the GoPoint has the same stoneState property value),
    //   or to a new GoBoardRegion (if all neighbours have a different
    //   stoneState property values)
    // - The GoPoint's old GoBoardRegion may become fragmented if the GoPoint
    //   has been the only link between two or more sub-regions
    // - The GoPoint's new GoBoardRegion may merge with other regions if
    //   the GoPoint joins them together
    GoUtilities.prototype.movePointToNewRegion = function(goPoint)
    {
        // Step 1: Remove point from old region
        var oldGoBoardRegion = goPoint.goBoardRegion;
        oldGoBoardRegion.removePoint(goPoint);  // possible side-effect: oldRegion might be
                                                // split into multiple GoBoardRegion objects

        // Step 2: Attempt to add the point to the same region as one of its
        // neighbours. At the same time, merge regions if they can be joined.
        var newGoBoardRegion = null;
        goPoint.getNeighbours().forEach(function(neighbour) {
            // Do not consider the neighbour if the stone states do not match
            // (stone state also includes stone color)
            if (neighbour.stoneState !== goPoint.stoneState)
                return;

            if (newGoBoardRegion === null)
            {
                // Join the region of one of the neighbours
                newGoBoardRegion = neighbour.goBoardRegion;
                newGoBoardRegion.addPoint(goPoint);
            }
            else
            {
                // The stone has already joined a neighbouring region
                // -> now check if entire regions can be merged
                var neighbourGoBoardRegion = neighbour.goBoardRegion;
                if (neighbourGoBoardRegion !== newGoBoardRegion)
                    newGoBoardRegion.joinRegion(neighbourGoBoardRegion);
            }
        }, this);  // <-- supply "this" value seen in the loop

        // Step 3: Still no region? The point forms its own new region!
        if (newGoBoardRegion === null)
            newGoBoardRegion = new GoBoardRegion(goPoint);
    };

    return GoUtilities;
})();

// ----------------------------------------------------------------------
// @brief The GoScore class collects scoring information and move statistics
// from the GoGame object that is specified during construction. Scoring
// information is collected for the current board position, while the move
// statistics refer to the entire game.
//
// GoScore does not automatically collect any information, nor does it
// automatically update previously collected information.
// calculate() must be invoked for the initial information
// collection, and also every time that the information needs to be updated.
//
// By default GoScore does not collect scoring information because this is a
// potentially time-consuming operation. A controller may enable the collection
// of scoring information by invoking enableScoringInformationCollection().
//
// Scoring overview
// ----------------
//
// Score calculation depends on the scoring system in effect for the current
// game. The score can only be calculated after the status of all stones on the
// board has been determined to be either dead, alive or in seki. The
// application is not "clever" enough to find out this status on its own.
// This means that the user must help out by interactively marking
// stones as dead, alive or in seki.
//
// An updated score is calculated every time that the user marks a stone group
// as dead, alive or in seki. This is the sequence of events:
// 1) toggleDeadStateOfStoneGroup() or toggleSekiStateOfStoneGroup() is
//    invoked by the controller object that handles user input
//   - toggleDeadStateOfStoneGroup() or toggleSekiStateOfStoneGroup() stores
//     the information whether stones are dead, alive or in seki in
//     GoBoardRegion objects' stoneGroupState property.
//   - If the user has turned the "mark stones intelligently" feature on in
//     the user preferences, toggleDeadStateOfStoneGroup() assists the user
//     by changing the stoneGroupState property not only of the GoBoardRegion
//     that is passed as a parameter, but also of adjacent GoBoardRegion
//     objects. See the "Mark dead stones intelligently" section below for
//     details.
//   - No such assistance is available for toggleSekiStateOfStoneGroup().
// 2) calculate() is invoked by the controller object that handles
//    user input. This initiates the actual scoring process which consists of
//    two more steps.
// 3) updateTerritoryColor() (a private helper method invoked as part of the
//    scoring process) calculates the color that "owns" each GoBoardRegion
//    - updateTerritoryColor() stores the "owning" color in GoBoardRegion
//      objects' territoryColor property.
//    - Calculation of the territory color entirely depends on the
//      stoneGroupState property of all GoBoardRegion objects having been
//      set up correctly before.
//    - See the section "Determining territory color" below for details on how
//      the calculation works
// 4) updateScoringProperties() (a private helper method invoked as part of
//    the scoring process) finally adds up all the scores and statistics and
//    stores the values in GoScore's publicly accessible scoring and statistics
//    properties
//
//
// Mark dead stones intelligently
// ------------------------------
//
// If the user has turned this feature on in the user preferences,
// toggleDeadStateOfStoneGroup() changes the stoneGroupState property not
// only of the GoBoardRegion that is passed as a parameter, but also of
// adjacent GoBoardRegion objects. The reasoning is this:
// - Marking a stone group as dead means that the owning color has conceded
//   that the group is in opposing territory.
// - However, it is not possible to have two or more stone groups of the same
//   color in the same territory, but some of them are dead and some of them
//   are alive or in seki. They must either be all dead, or all alive.
// - toggleDeadStateOfStoneGroup() therefore looks not only at the single
//   stone group that is passed as a parameter, but also examines adjacent
//   GoBoardRegion objects. If it finds other stone groups that do not satisfy
//   the rule above, it toggles them to dead/alive as appropriate.
// - For instance, if the user marks a black stone group to be dead, other
//   black stone groups in the same territory are also automatically marked
//   dead (if they are not dead already)
// - The original implementation of this feature would also examine white stone
//   groups in the same territory and turn them back to be alive if they were
//   dead. The result of this, however, was a cascade of toggling operations
//   that, after a few repetitions, would affect the entire board. The feature
//   effectively became unusable, so toggleDeadStateOfStoneGroup() was limited
//   to look only at groups of the same color as the group that is passed as
//   a parameter.
//
//
// Determining territory color
// ---------------------------
//
// The implementation of updateTerritoryColor() is rather simple and consists
// of two passes:
// 1) Territory colors for stone groups can easily be determined by looking at
//    the stone group's color
//    - If the group is alive, the points in the group belong to the color
//      that has played the stones. This is important only for area scoring.
//    - If the group is dead, the points in the group belong to the opposing
//      color.
//    - If the group is in seki, the scoring system decides the territory
//      that the group belongs to: Under area scoring rules the group belongs to
//      the color that has played the stones, under territory scoring rules
//      the group is neutral.
// 2) Territory colors for empty regions are determined by looking at each empty
//    region's adjacent regions
//    - These must, of course, all be stone groups
//    - If all adjacent stone groups are alive and of the same color, the empty
//      region belongs to that color's territory. The empty region in this case
//      can be considered to be surrounded.
//    - If all adjacent stone groups are in seki and of the same color, the
//      empty region is an eye and either neutral (under territory scoring
//      rules) or belongs to that color's territory (under area scoring rules).
//    - If all adjacent stone groups are alive or in seki and have different
//      colors, the empty region does not belong to any territory. The region
//      is neutral and consists of dame points.
//    - If at least one adjacent stone group is dead, the empty region belongs
//      to the opposing color's territory.
//    - In the last case, updateTerritoryColor() makes a final check to see
//      if there are any inconsistencies (stone groups of the same color that
//      are alive, or stones groups of the opposing color that are also dead).
//    - An inconsistency is also detected if at least one of the adjacent stone
//      groups is in seki and one or more other adjacent stone groups are alive
//      or dead. Seki stones can only share liberties with other seki stones.
//    - If inconsistencies are found the empty region is marked accordingly so
//      that the problem can be made visible to user. For scoring purposes, the
//      empty region is considered to be neutral.
var GoScore = (function ()
{
    "use strict";

    // Creates a new GoScore object that operates on the specified GoGame
    // object and its associated Go domain model objects.
    function GoScore(goGame)
    {
        this.goGame = goGame;
        this.scoringEnabled = false;

        this.resetValues();
    }

    // Resets all score and statistics values to zero. Typically invoked before
    // a new calculation starts.
    GoScore.prototype.resetValues = function()
    {
        // Scoring
        this.komi = 0;
        this.capturedByBlack = 0;
        this.capturedByWhite = 0;
        this.deadBlack = 0;
        this.deadWhite = 0;
        this.territoryBlack = 0;
        this.territoryWhite = 0;
        this.aliveBlack = 0;
        this.aliveWhite = 0;
        this.handicapCompensationBlack = 0;
        this.handicapCompensationWhite = 0;
        this.totalScoreBlack = 0;
        this.totalScoreWhite = 0;
        this.result = GAMERESULT_NONE;

        // Statistics
        this.numberOfMoves = 0;
        this.stonesPlayedByBlack = 0;
        this.stonesPlayedByWhite = 0;
        this.passesPlayedByBlack = 0;
        this.passesPlayedByWhite = 0;
    };

    // Puts all GoBoardRegion objects that currently exist into scoring mode
    // (see the GoBoardRegion class documentation for details) and initializes
    // them to belong to no territory.
    GoScore.prototype.enableScoringInformationCollection = function()
    {
        if (this.scoringEnabled)
            return;

        this.initializeRegions();
        this.scoringEnabled = true;
    };

    // Puts all GoBoardRegion objects that currently exist into normal mode,
    // i.e. "not scoring" mode.
    GoScore.prototype.disableScoringInformationCollection = function()
    {
        if (! this.scoringEnabled)
            return;

        this.uninitializeRegions();
        this.scoringEnabled = false;
    };

    GoScore.prototype.initializeRegions = function()
    {
        var allRegions = this.goGame.goBoard.getRegions();
        allRegions.forEach(function(goBoardRegion) {
            // Enabling scoring mode allows caching for optimized performance.
            // Invoke this first because it initializes all scoring mode
            // members.
            goBoardRegion.enableScoringMode();

            goBoardRegion.setTerritoryColor(COLOR_NONE);
            goBoardRegion.setTerritoryInconsistencyFound(false);
            if (goBoardRegion.isStoneGroup())
                goBoardRegion.setStoneGroupState(STONEGROUPSTATE_ALIVE);
            else
                goBoardRegion.setStoneGroupState(STONEGROUPSTATE_UNDEFINED);
        }, this);
    };

    GoScore.prototype.uninitializeRegions = function()
    {
        var allRegions = this.goGame.goBoard.getRegions();
        allRegions.forEach(function(goBoardRegion) {
            goBoardRegion.disableScoringMode();  // forget cached values
        }, this);
    };

    // Starts calculation of a new score.
    GoScore.prototype.calculate = function()
    {
        this.resetValues();

        if (this.scoringEnabled)
            this.updateTerritoryColor();

        this.updateScoringProperties();
    };

    // Toggles the status of the stone group @a stoneGroup from alive to
    // dead, or vice versa. If @a stoneGroup is in seki, its status is changed to
    // dead.
    //
    // Once the main stone group @a stoneGroup has been updated, this method also
    // considers neighbouring regions and, if necessary, toggles the dead/alive
    // state of other stone groups to remain consistent with the logic of the game
    // rules. This feature is optional and the user can turn it off in the user
    // preferences. For details read the class documentation, section "Mark dead
    // stones intelligently".
    //
    // @note Invoking this method does not change the current scoring values. The
    // client needs to separately invoke calculate() to get the updated score.
    //
    // @note This method does nothing if scoring is not enabled on this GoScore
    // object.
    GoScore.prototype.toggleDeadStateOfStoneGroup = function(stoneGroup)
    {
        if (! this.scoringEnabled)
            return;
        if (! stoneGroup.isStoneGroup())
            return;

        // TODO: Make this into a user preference
        // var markDeadStonesIntelligently = [ApplicationDelegate sharedDelegate].scoringModel.markDeadStonesIntelligently;
        var markDeadStonesIntelligently = true;

        // We use this array like a queue: We add GoBoardRegion objects to it that
        // need to be toggled, and we loop until the queue is empty. In each iteration
        // new GoBoardRegion objects may be added to the queue which will cause the
        // loop to run longer.
        var stoneGroupsToToggle = [];
        // And this array is the guard that prevents an infinite loop: Whenever a
        // GoBoardRegion object is processed by the loop, it puts the processed object
        // into this array. Before the loop starts processing a GoBoardRegion object,
        // though, it looks into the array to see if the object has already been
        // processed in an earlier iteration.
        var regionsAlreadyProcessed = [];

        stoneGroupsToToggle.push(stoneGroup);
        regionsAlreadyProcessed.push(stoneGroup);
        while (stoneGroupsToToggle.length > 0)
        {
            var stoneGroupToToggle = stoneGroupsToToggle.shift();  // removes (and returns) the first element of the array

            var newStoneGroupState;
            switch (stoneGroupToToggle.getStoneGroupState())
            {
                case STONEGROUPSTATE_ALIVE:
                    newStoneGroupState = STONEGROUPSTATE_DEAD;
                    break;
                case STONEGROUPSTATE_DEAD:
                    newStoneGroupState = STONEGROUPSTATE_ALIVE;
                    break;
                case STONEGROUPSTATE_SEKI:
                    newStoneGroupState = STONEGROUPSTATE_DEAD;
                    break;
                default:
                    throw new Error("Unknown stone group state " + stoneGroupToToggle.getStoneGroupState());
            }
            stoneGroupToToggle.setStoneGroupState(newStoneGroupState);
            var colorOfStoneGroupToToggle = stoneGroupToToggle.getColor();

            // If the user has decided that he does not need any help with toggling,
            // we can abort the whole process now
            if (! markDeadStonesIntelligently)
                break;

            // Collect stone groups that are either directly adjacent to the stone
            // group we just toggled ("once removed"), or separated from it by an
            // intermediate empty region ("twice removed").
            var adjacentStoneGroupsToExamine = [];
            stoneGroupToToggle.getAdjacentRegions().forEach(function(adjacentRegionOnceRemoved) {
                if (regionsAlreadyProcessed.indexOf(adjacentRegionOnceRemoved) >= 0)
                    return;
                regionsAlreadyProcessed.push(adjacentRegionOnceRemoved);

                if (adjacentRegionOnceRemoved.getColor() !== COLOR_NONE)
                {
                    adjacentStoneGroupsToExamine.push(adjacentRegionOnceRemoved);
                }
                else
                {
                    adjacentRegionOnceRemoved.getAdjacentRegions().forEach(function (adjacentRegionTwiceRemoved)
                    {
                        if (regionsAlreadyProcessed.indexOf(adjacentRegionTwiceRemoved) >= 0)
                            return;
                        regionsAlreadyProcessed.push(adjacentRegionTwiceRemoved);

                        if (adjacentRegionTwiceRemoved.getColor() === COLOR_NONE)
                            throw new Error("Inconsistency - regions adjacent to an empty region cannot be empty, too, adjacent empty region = " + adjacentRegionTwiceRemoved);
                        else
                            adjacentStoneGroupsToExamine.push(adjacentRegionTwiceRemoved);
                    }, this);
                }
            }, this);

            // Now examine the collected stone groups and, if necessary, toggle their
            // dead/alive state:
            // - Stone groups of the same color need to get into the same state
            // - In theory, stone groups of the opposing color need to get into the
            //   opposite state, but doing this has too much effect, so for the moment
            //   we ignore the opposing color
            // See the "Mark dead stones intelligently" section in the class
            // documentation for details.
            adjacentStoneGroupsToExamine.forEach(function(adjacentStoneGroupToExamine) {
                if (! adjacentStoneGroupToExamine.isStoneGroup())
                    throw new Error("Error in previous loop, we should have collected only stone groups, adjacent empty region = " + adjacentStoneGroupToExamine);

                var colorOfAdjacentStoneGroupToExamine = adjacentStoneGroupToExamine.getColor();
                if (colorOfAdjacentStoneGroupToExamine === colorOfStoneGroupToToggle)
                {
                    if (adjacentStoneGroupToExamine.getStoneGroupState() !== newStoneGroupState)
                        stoneGroupsToToggle.push(adjacentStoneGroupToExamine);
                }

            }, this);
        }
    };

    // Toggles the status of the stone group @a stoneGroup from seki to
    // alive, or vice versa. If @a stoneGroup is dead, its status is changed to
    // in seki.
    GoScore.prototype.toggleSekiStateOfStoneGroup = function(stoneGroup)
    {
        if (! this.scoringEnabled)
            return;
        if (! stoneGroup.isStoneGroup())
            return;

        var newStoneGroupState;
        switch (stoneGroup.getStoneGroupState())
        {
            case STONEGROUPSTATE_ALIVE:
                newStoneGroupState = STONEGROUPSTATE_SEKI;
                break;
            case STONEGROUPSTATE_DEAD:
                newStoneGroupState = STONEGROUPSTATE_SEKI;
                break;
            case STONEGROUPSTATE_SEKI:
                newStoneGroupState = STONEGROUPSTATE_ALIVE;
                break;
            default:
                throw new Error("Unknown stone group state " + stoneGroup.getStoneGroupState());
        }

        stoneGroup.setStoneGroupState(newStoneGroupState);
    };

    // (Re)Calculates the territory color of all GoBoardRegion objects.
    // Returns true if calculation was successful, false if not.
    //
    // This method looks at the @e stoneGroupState property of GoBoardRegion
    // objects. For details see the class documentation, paragraph "Determining
    // territory color".
    GoScore.prototype.updateTerritoryColor = function()
    {
        // Preliminary sanity check. The fact that only two scoring systems can occur
        // makes some of the logic further down a lot simpler.
        var scoringSystem = this.goGame.goGameRules.scoringSystem;
        if (SCORINGSYSTEM_AREA_SCORING !== scoringSystem &&
            SCORINGSYSTEM_TERRITORY_SCORING !== scoringSystem)
        {
            throw new Error("Unknown scoring system " + scoringSystem);
        }

        // Regions that are truly empty, i.e. that do not have dead stones
        var emptyRegions = [];

        // Pass 1: Set territory colors for stone groups. This is easy and can be
        // done both for groups that are alive and dead. While we are at it, we can
        // also collect empty regions, which will be processed in pass 2.
        var allRegions = this.goGame.goBoard.getRegions();
        allRegions.forEach(function(region) {
            if (! region.isStoneGroup())
            {
                // Setting territory color here is temporary, the final color will be
                // determined in pass 2. We still need to do it, though, to erase traces
                // from a previous scoring calculation.
                region.setTerritoryColor(COLOR_NONE);
                emptyRegions.push(region);
            }
            else
            {
                switch (region.getStoneGroupState())
                {
                    case STONEGROUPSTATE_ALIVE:
                    {
                        // If the group is alive, it belongs to the territory of the color who
                        // played the stones in the group. This is important only for area
                        // scoring.
                        region.setTerritoryColor(region.getColor());
                        break;
                    }
                    case STONEGROUPSTATE_DEAD:
                    {
                        // If the group is dead, it belongs to the territory of the opposing
                        // color
                        switch (region.getColor())
                        {
                            case COLOR_BLACK:
                                region.setTerritoryColor(COLOR_WHITE);
                                break;
                            case COLOR_WHITE:
                                region.setTerritoryColor(COLOR_BLACK);
                                break;
                            default:
                                throw new Error("Stone groups must be either black or white, region " + region + " has color " + region.getColor());
                        }
                        break;
                    }
                    case STONEGROUPSTATE_SEKI:
                    {
                        // If the group is in seki, the scoring system decides the territory
                        // that the group belongs to
                        if (SCORINGSYSTEM_AREA_SCORING === scoringSystem)
                            region.setTerritoryColor(region.getColor());
                        else
                            region.setTerritoryColor(COLOR_NONE);
                        break;
                    }
                    default:
                    {
                        throw new Error("Unknown stone group state = " + region.getStoneGroupState());
                    }
                }
            }
        }, this);

        // Pass 2: Process empty regions. Here we examine the stone groups adjacent
        // to each empty region to determine the empty region's final territory color.
        emptyRegions.forEach(function(emptyRegion) {
            var aliveSeen = false;
            var blackAliveSeen = false;
            var whiteAliveSeen = false;
            var deadSeen = false;
            var blackDeadSeen = false;
            var whiteDeadSeen = false;
            var sekiSeen = false;
            var blackSekiSeen = false;
            var whiteSekiSeen = false;
            emptyRegion.getAdjacentRegions().forEach(function(adjacentRegion) {
                if (! adjacentRegion.isStoneGroup())
                {
                    throw new Error("Regions adjacent to an empty region can only be stone groups, adjacent region = " + adjacentRegion);
                }

                // Preliminary sanity check. The fact that only two colors can occur makes
                // the subsequent logic simpler.
                var adjacentRegionColor = adjacentRegion.getColor();
                if (COLOR_BLACK !== adjacentRegionColor && COLOR_WHITE !== adjacentRegionColor)
                {
                    throw new Error("Stone groups must be either black or white, adjacent stone group region " + adjacentRegion + " has color " + adjacentRegionColor);
                }

                switch (adjacentRegion.getStoneGroupState())
                {
                    case STONEGROUPSTATE_ALIVE:
                    {
                        aliveSeen = true;
                        if (COLOR_BLACK === adjacentRegionColor)
                            blackAliveSeen = true;
                        else
                            whiteAliveSeen = true;
                        break;
                    }
                    case STONEGROUPSTATE_DEAD:
                    {
                        deadSeen = true;
                        if (COLOR_BLACK === adjacentRegionColor)
                            blackDeadSeen = true;
                        else
                            whiteDeadSeen = true;
                        break;
                    }
                    case STONEGROUPSTATE_SEKI:
                    {
                        sekiSeen = true;
                        if (COLOR_BLACK === adjacentRegionColor)
                            blackSekiSeen = true;
                        else
                            whiteSekiSeen = true;
                        break;
                    }
                    default:
                    {
                        throw new Error("Unknown stone group state = " + adjacentRegion.getStoneGroupState());
                    }
                }
            }, this);



            var territoryInconsistencyFound = false;
            var territoryColor = COLOR_NONE;
            if (! deadSeen)
            {
                if (! aliveSeen && ! sekiSeen)
                {
                    // Ok, empty board, neutral territory
                    territoryColor = COLOR_NONE;
                }
                else if ((blackSekiSeen && blackAliveSeen) || (whiteSekiSeen && whiteAliveSeen))
                {
                    // Rules violation! Cannot see alive and seki stones of the same
                    // color. In such a position, the seki stones could, theoretically,
                    // be connected to the alive stones. The opposing player therefore
                    // MUST play so that no connection is possible and this position
                    // cannot occur.
                    territoryInconsistencyFound = true;
                }
                else if ((blackSekiSeen && whiteAliveSeen) || (whiteSekiSeen && blackAliveSeen))
                {
                    // Rules violation! Cannot see alive and seki stones of different
                    // colors. In all seki positions and examples that I could find,
                    // seki stones are always completely surrounded, the only liberties
                    // being their own eyes, or liberties shared with seki stones of
                    // the other color. The opposing player therefore MUST play and fill
                    // in all liberties around the seki stones.
                    territoryInconsistencyFound = true;
                }
                else if ((blackSekiSeen && whiteSekiSeen) || (blackAliveSeen && whiteAliveSeen))
                {
                    // Ok, dame, neutral territory
                    territoryColor = COLOR_NONE;
                }
                else if (sekiSeen)
                {
                    // Ok, only one color has been seen, and all groups were in seki
                    if (SCORINGSYSTEM_AREA_SCORING === scoringSystem)
                    {
                        // Area scoring counts this as territory
                        if (blackSekiSeen)
                            territoryColor = COLOR_BLACK;
                        else
                            territoryColor = COLOR_WHITE;
                    }
                    else
                    {
                        // Territory scoring counts this as neutral territory
                        territoryColor = COLOR_NONE;
                    }
                }
                else
                {
                    // Ok, only one color has been seen, and all groups were alive
                    if (blackAliveSeen)
                        territoryColor = COLOR_BLACK;
                    else
                        territoryColor = COLOR_WHITE;
                }
            }
            else
            {
                if (sekiSeen)
                {
                    // Rules violation! Cannot see dead and seki stones at the same time
                    territoryInconsistencyFound = true;
                }
                else if (blackDeadSeen && whiteDeadSeen)
                {
                    // Rules violation! Cannot see dead stones of both colors
                    territoryInconsistencyFound = true;
                }
                else if ((blackDeadSeen && blackAliveSeen) || (whiteDeadSeen && whiteAliveSeen))
                {
                    // Rules violation! Cannot see both dead and alive stones of the same
                    // color
                    territoryInconsistencyFound = true;
                }
                else
                {
                    // Ok, only dead stones of one color seen (we don't care whether the
                    // opposing color has alive stones)
                    if (blackDeadSeen)
                        territoryColor = COLOR_WHITE;
                    else
                        territoryColor = COLOR_BLACK;
                }
            }

            emptyRegion.setTerritoryColor(territoryColor);
            emptyRegion.setTerritoryInconsistencyFound(territoryInconsistencyFound);
        }, this);

        return true;
    };

    // (Re)Calculates the scoring and move statistics properties of the
    // GoScore object.
    //
    // If territory scoring is enabled, this method requires that the
    // @e deadStoneGroup and @e territoryColor properties of GoBoardRegion objects
    // are correct and up-to-date.
    GoScore.prototype.updateScoringProperties = function()
    {
        // Komi
        this.komi = this.goGame.komi;

        // Captured stones (up to the current board position) and move statistics (for
        // the entire game)
        this.numberOfMoves = 0;
        // TODO Obtain the GoMove from GoBoardPosition once that class is available
        //var currentBoardPositionMove = this.goGame.goBoardPosition.currentMove;
        var currentBoardPositionMove = this.goGame.getLastMove();
        var loopHasPassedCurrentBoardPosition = false;
        var move = this.goGame.getLastMove();
        while (move !== null)
        {
            if (! loopHasPassedCurrentBoardPosition)
            {
                if (move === currentBoardPositionMove)
                    loopHasPassedCurrentBoardPosition = true;
            }

            this.numberOfMoves++;
            var moveByBlack = move.goPlayer.isBlack();
            switch (move.moveType)
            {
                case GOMOVE_TYPE_PLAY:
                {
                    if (moveByBlack)
                    {
                        if (loopHasPassedCurrentBoardPosition)
                        {
                            this.capturedByBlack += move.capturedStones.length;
                        }
                        this.stonesPlayedByBlack++;
                    }
                    else
                    {
                        if (loopHasPassedCurrentBoardPosition)
                        {
                            this.capturedByWhite += move.capturedStones.length;
                        }
                        this.stonesPlayedByWhite++;
                    }
                    break;
                }
                case GOMOVE_TYPE_PASS:
                {
                    if (moveByBlack)
                        this.passesPlayedByBlack++;
                    else
                        this.passesPlayedByWhite++;
                    break;
                }
                default:
                {
                    break;
                }
            }
            move = move.getPreviousGoMove();
        }

        // Area, territory & dead stones (for current board position)
        if (this.scoringEnabled)
        {
            var allRegions = this.goGame.goBoard.getRegions();
            allRegions.forEach(function(region) {
                var regionSize = region.getSize();
                var regionIsStoneGroup = region.isStoneGroup();
                var stoneGroupState = region.getStoneGroupState();
                var regionIsDeadStoneGroup = (STONEGROUPSTATE_DEAD === stoneGroupState);
                var regionTerritoryColor = region.getTerritoryColor();

                // Territory: We count dead stones and intersections in empty regions. An
                // empty region could be an eye in seki, which only counts when area
                // scoring is in effect. We don't have to check the scoring system,
                // though, this was already done when the empty region's territory color
                // was determined.
                if (regionIsDeadStoneGroup || ! regionIsStoneGroup)
                {
                    switch (regionTerritoryColor)
                    {
                        case COLOR_BLACK:
                            this.territoryBlack += regionSize;
                            break;
                        case COLOR_WHITE:
                            this.territoryWhite += regionSize;
                            break;
                        default:
                            break;
                    }
                }

                // Alive stones + stones in seki
                if (regionIsStoneGroup && ! regionIsDeadStoneGroup)
                {
                    switch (regionTerritoryColor)
                    {
                        case COLOR_BLACK:
                            this.aliveBlack += regionSize;
                            break;
                        case COLOR_WHITE:
                            this.aliveWhite += regionSize;
                            break;
                        default:
                            break;
                    }
                }

                // Dead stones
                if (regionIsDeadStoneGroup)
                {
                    switch (region.getColor())
                    {
                        case COLOR_BLACK:
                            this.deadBlack += regionSize;
                            break;
                        case COLOR_WHITE:
                            this.deadWhite += regionSize;
                            break;
                        default:
                            break;
                    }
                }
            }, this);
        }

        // Handicap
        var numberOfHandicapStones = this.goGame.handicap;
        if (numberOfHandicapStones > 0)
        {
            this.handicapCompensationWhite = numberOfHandicapStones;
        }

        // Total score
        switch (this.goGame.goGameRules.scoringSystem)
        {
            case SCORINGSYSTEM_AREA_SCORING:
            {
                this.totalScoreBlack = this.aliveBlack + this.territoryBlack + this.handicapCompensationBlack;
                this.totalScoreWhite = this.komi + this.aliveWhite + this.territoryWhite + this.handicapCompensationWhite;
                break;
            }
            case SCORINGSYSTEM_TERRITORY_SCORING:
            {
                this.totalScoreBlack = this.capturedByBlack + this.deadWhite + this.territoryBlack;
                this.totalScoreWhite = this.komi + this.capturedByWhite + this.deadBlack + this.territoryWhite;
                break;
            }
            default:
            {
                break;
            }
        }

        // Final result
        if (this.totalScoreBlack > this.totalScoreWhite)
            this.result = GAMERESULT_BLACKHASWON;
        else if (this.totalScoreWhite > this.totalScoreBlack)
            this.result = GAMERESULT_WHITEHASWON;
        else
            this.result = GAMERESULT_TIE;
    };

    return GoScore;
})();
