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
    }

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
    // Star points definitions are by convention in the Go world, therefore
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

        // TODO: Add GoZobristTable

        // This is going to be an array of arrays.
        // - Dimension 1 = x-axis position on the board
        // - Dimension 2 = y-axis position on the board
        // Important: Array indices are 0-based, but GoVertex uses 1-based
        // numeric values !!!
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

        this.isStarPoint = false;
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

    // Returns true if the intersection represented by this GoPoint is
    // occupied by a black stone. Otherwise returns false (i.e. also returns
    // false if the intersection is not occupied by a stone.
    GoPoint.prototype.getPrevious = function()
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

        if (goPoint !== undefined)
            this.addPoint(goPoint);
    }

    // Returns the size of the GoBoardRegion (which corresponds to the number
    // of GoPoint objects in the GoBoardRegion).
    GoBoardRegion.prototype.getSize = function()
    {
        return this.points.length;
    };

    // Returns true if the GoBoardRegion represents a stone group.
    GoBoardRegion.prototype.isStoneGroup = function()
    {
        if (0 === this.points.length)
            return false;
        var goPoint = this.points[0];
        return goPoint.hasStone();
    };

    // Returns the color of the stones in the GoBoardRegion, or COLOR_NONE
    // if the GoBoardRegion does not represent a stone group.
    GoBoardRegion.prototype.getColor = function()
    {
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
        var pointsCopy = this.points.slice();
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
// GoMove objects are interlinked with their predecessor (getPrevious()) and
// successor (getNext()) GoMove object. This represents the fact that a game
// can be seen as a series of moves.
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
    GoMove.prototype.doIt = function()
    {
        // Nothing to do for pass moves
        if (this.type === GOMOVE_TYPE_PASS)
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

        this.movePointToNewRegion(this.goPoint);

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
            neighbour.goBoardRegion.points.forEach(function(goPointCapture) {
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

        // TODO: Uncomment when GoZobristTable is implemented
        //this.zobristHash = this.goPoint.goBoard.goZobristTable.getHashForMove(this);
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
    GoMove.prototype.undo = function()
    {
        // Nothing to do for pass moves
        if (this.type === GOMOVE_TYPE_PASS)
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
        // point of this move. This makes sure that movePointToNewRegion()
        // further down does not join regions incorrectly.
        this.capturedStones.forEach(function(goPointCapture) {
            goPointCapture.stoneState = capturedStoneColor;
        }, this);  // <-- supply "this" value seen in the loop

        // Update the point's stone state *BEFORE* moving it to a new region
        this.goPoint.stoneState = COLOR_NONE;

        this.movePointToNewRegion(this.goPoint);
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
    //
    // TODO: This method should be made reusable, it is also needed by GoGame
    // when it sets up handicap stones. We still lack a GoUtilities class with
    // static functions.
    GoMove.prototype.movePointToNewRegion = function(goPoint)
    {
        // Step 1: Remove point from old region
        var oldGoBoardRegion = goPoint.goBoardRegion;
        oldGoBoardRegion.removePoint(goPoint);  // possible side-effect: oldRegion might be
                                                // split into multiple GoBoardRegion objects

        // Step 2: Attempt to add the point to the same region as one of its
        // neighbours. At the same time, merge regions if they can be joined.
        var newGoBoardRegion = null;
        this.goPoint.getNeighbours().forEach(function(neighbour) {
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

    return GoMove;
})();
