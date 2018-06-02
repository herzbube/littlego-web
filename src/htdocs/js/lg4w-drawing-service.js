// ----------------------------------------------------------------------
// This file contains code that implements an AngularJS service for
// drawing the Go board.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.service(ANGULARNAME_SERVICE_DRAWING, ["$log", function($log) {

    // ----------------------------------------------------------------------
    // Private variables
    // ----------------------------------------------------------------------

    var canvasDimension;
    var goGame;
    var thisPlayerColor;
    var boardViewMetrics;
    var paper;  // the Raphael library object
    var scoringMode;
    var userInteractionIsEnabled;
    var boardViewIntersectionOfPreviousMouseMoveEvent;

    initializeService();

    function initializeService()
    {
        goGame = undefined;
        thisPlayerColor = COLOR_NONE;
        boardViewMetrics = undefined;
        paper = null;
        scoringMode = false;
        userInteractionIsEnabled = false;
        boardViewIntersectionOfPreviousMouseMoveEvent = null;
    }

    // ----------------------------------------------------------------------
    // Event listeners
    // ----------------------------------------------------------------------

    var eventListeners =
        {
            didClickOnIntersection: []
        };

    // ----------------------------------------------------------------------
    // Public API
    // ----------------------------------------------------------------------

    this.addDidClickOnIntersectionListener = function(listener) {
        eventListeners.didClickOnIntersection.push(listener);
    };

    this.removeDidClickOnIntersectionListener = function(listener)
    {
        var index = eventListeners.didClickOnIntersection.indexOf(listener);
        if (-1 !== index)
            eventListeners.didClickOnIntersection.splice(index, 1);
    };

    // Configure the drawing service so that future drawing operations draw
    // a Go board that represents the specified GoGame.
    //
    // The player who in the future will interact with the Go board has the
    // specified stone color (must be either COLOR_BLACK or COLOR_WHITE).
    //
    // Every time this function is invoked the service re-initializes itself
    // to the default state and the calling controller must set up again
    // any non-default state.
    this.configure = function(newGoGame, newThisPlayerColor) {

        initializeService();

        goGame = newGoGame;
        thisPlayerColor = newThisPlayerColor;
    };

    this.setCanvasDimension = function(newCanvasDimension) {
        canvasDimension = newCanvasDimension;
    };

    this.setCanvasDimensionAndDrawGoBoardIfChanged = function(newCanvasDimension) {
        if (canvasDimension === newCanvasDimension)
            return;

        canvasDimension = newCanvasDimension;

        this.drawGoBoard();
    };

    // Configure the drawing service for scoring mode user interaction.
    // For instance, the user can now click only on intersections occupied
    // by stones.
    //
    // Scoring mode is disabled by default whenever the service is configured
    // for a new game, and needs to be explicitly enabled.
    this.enableScoringMode = function() {
        if (scoringMode === true)
            return;

        scoringMode = true;

        clearNextMoveIndicatorIfExists();
    };

    // Configure the drawing service for play mode user interaction.
    // For instance, the user can now click only on empty intersections.
    this.disableScoringMode = function() {
        if (scoringMode === false)
            return;

        scoringMode = false;

        // TODO: We should only remove some layers instead of redrawing the whole board
        this.drawGoBoard();
    };

    // Erases the previous Go board (if it exists) and draws a new Go board
    // that represents up-to-date information from the GoGame object that
    // was specified when the drawing service was configured (see
    // configure() function).
    //
    // This function must be invoked only while the area that contains the
    // board is visible. Reason: If the area that contains the board is
    // not visible the board will get width/height 0.
    this.drawGoBoard = function() {
        // TODO: Don't use jQuery
        var jQueryObjectContainerCanvas = $("#" + ID_CONTAINER_BOARD);
        eraseCurrentGoBoard(jQueryObjectContainerCanvas);
        paper = createPaper(jQueryObjectContainerCanvas);

        boardViewMetrics = new BoardViewMetrics(goGame);
        boardViewMetrics.updateWithBaseSize(CGSizeMake(paper.width, paper.height));
        boardViewMetrics.updateWithBoardSize(goGame.goBoard.boardSize);

        // The order in which layers are drawn is important! Later layers are
        // drawn on top of earlier layers.
        drawGridLayer();
        drawStonesLayer();
        drawSymbolsLayer();
        if (scoringMode)
            drawScoringLayer();

        // TODO: Don't use jQuery. Can we use paper.canvas?
        var jQueryObjectBoard = $("#" + ID_SVG_BOARD);
        jQueryObjectBoard.on("mousemove", onMouseMove);
        jQueryObjectBoard.on("click", onMouseClick);

        boardViewIntersectionOfPreviousMouseMoveEvent = null;
    };

    // Draws the Go board after a new game move was played. The new game
    // move is available from the GoGame object that was specified when
    // the drawing service was configured (see configure() function).
    this.drawGoBoardAfterNewGameMoveWasPlayed = function()
    {
        // TODO: The controller must remove the submission indicator (if one
        // is present).

        // TODO: We should only re-draw those layers that need it.
        // Currently we don't know how to do this. In theory we could try
        // to find all elements by class, then get the corresponding Raphael
        // objects for the elements, then invoke Raphael's remove() method.
        // This seems much too complicated! Investigate whether we can use
        // SVG layers.
        //this.eraseStonesLayer();
        //this.erasedSymbolsLayer();
        //this.drawStonesLayer();
        //this.drawSymbolsLayer();
        if (scoringMode)
            drawScoringLayer();
        this.drawGoBoard();
    };

    // Draws the Go board after a score change.
    this.drawGoBoardAfterScoreChange = function()
    {
        // TODO: The controller must remove the submission indicator (if one
        // is present).

        // TODO: We should only re-draw those layers that need it.
        // See comments in drawGoBoardAfterNewGameMoveWasPlayed();
        this.drawGoBoard();
    };

    // Enables user interaction in general. Note that the user may still be
    // unable to play simply because it's not her turn.
    //
    // User interaction is disabled by default whenever the service is
    // configured for a new game, and needs to be explicitly enabled.
    this.enableUserInteraction = function() {
        userInteractionIsEnabled = true;
    };

    // Disables user interaction. This is useful e.g. to temporarily prevent
    // user interaction while the UI waits for a server response.
    this.disableUserInteraction = function() {
        userInteractionIsEnabled = false;
    };

    this.isUserInteractionEnabled = function() {
        return userInteractionIsEnabled;
    };

    // ----------------------------------------------------------------------
    // Internal functions - Setting up the canvas
    // ----------------------------------------------------------------------

    function eraseCurrentGoBoard(jQueryObjectContainerCanvas)
    {
        jQueryObjectContainerCanvas.empty();
    }

    function createPaper(jQueryObjectContainerCanvas)
    {
        var domElementContainerCanvas = jQueryObjectContainerCanvas.get(0);
        var paper = Raphael(domElementContainerCanvas, canvasDimension, canvasDimension);

        // This is required so that CSS properties are applied (e.g. the background)
        paper.canvas.id = ID_SVG_BOARD;

        // For unknown reasons Raphael adds this to the svg element:
        //   style="overflow: hidden; position: relative; top: -0.666626px;"
        // The property "overflow" is not a problem, but we don't want the
        // properties "position" and "top" because we set these in our own CSS.
        //
        // Note that we could also set our own CSS properties to "!important"
        // to override the style on the svg element.
        paper.canvas.removeAttribute("style");

        return paper;
    }

    // ----------------------------------------------------------------------
    // Internal functions - Drawing layers
    // ----------------------------------------------------------------------

    // Draws the line grid and the star points.
    function drawGridLayer()
    {
        boardViewMetrics.lineRectangles.forEach(function(lineRectangle) {
            var lineRectangleSvg = paper.rect(
                lineRectangle.origin.x,
                lineRectangle.origin.y,
                lineRectangle.size.width,
                lineRectangle.size.height);
            lineRectangleSvg.attr("fill", boardViewMetrics.lineColor);
        }, this);

        goGame.goBoard.starPoints.forEach(function(starPoint) {
            var starPointCoordinates = boardViewMetrics.getCoordinatesFromGoPoint(starPoint);
            var starPointID = ID_SVG_STARPOINT_PREFIX + starPoint.goVertex.toString();

            drawCircle(
                starPointCoordinates.x,
                starPointCoordinates.y,
                boardViewMetrics.starPointRadius,
                boardViewMetrics.starPointColor,
                FILL_OPACITY_STARPOINT,
                starPointID);
        }, this);
    }

    // Draws the black and white stones
    function drawStonesLayer()
    {
        goGame.goBoard.getPoints().forEach(function(pointsXAxis) {
            pointsXAxis.forEach(function(goPoint) {
                if (! goPoint.hasStone())
                    return;

                var goPointCoordinates = boardViewMetrics.getCoordinatesFromGoPoint(goPoint);
                var stoneID = ID_SVG_STONE_PREFIX + goPoint.goVertex.toString();

                var stoneColor;
                if (goPoint.hasBlackStone())
                    stoneColor = FILL_COLOR_BLACK_STONE;
                else
                    stoneColor = FILL_COLOR_WHITE_STONE;

                drawCircle(
                    goPointCoordinates.x,
                    goPointCoordinates.y,
                    boardViewMetrics.stoneRadius,
                    stoneColor,
                    FILL_OPACITY_STONE,
                    stoneID);
            }, this);
        }, this);
    }

    // Draws the symbols (e.g. last move, move numbers)
    function drawSymbolsLayer()
    {
        // In scoring mode the user wants to concentrate on marking dead
        // stones and/or stones in seki. Symbols are only a distraction
        // from that task, so we disable them completely.
        if (scoringMode)
            return;

        var lastMove = goGame.getLastMove();
        if (lastMove !== null && GOMOVE_TYPE_PLAY === lastMove.moveType)
        {
            var lastMoveSymbolRect = getSymbolRectCenteredAtPoint(lastMove.goPoint);

            var lastMoveSymbolStrokeColor;
            if (lastMove.goPlayer.isBlack())
                lastMoveSymbolStrokeColor = STROKE_COLOR_BLACK_LAST_MOVE_SYMBOL;
            else
                lastMoveSymbolStrokeColor = STROKE_COLOR_WHITE_LAST_MOVE_SYMBOL;

            var lastMoveSymbolStrokeWidth = boardViewMetrics.normalLineWidth * boardViewMetrics.contentsScale;

            drawRect(
                lastMoveSymbolRect,
                lastMoveSymbolStrokeColor,
                lastMoveSymbolStrokeWidth,
                undefined,
                undefined,
                ID_SVG_LASTMOVESYMBOL);
        }
    }

    // Draws territory and marks up stones according to their GoBoardRegion's
    // stoneGroupState property. This function is invoked only while scoring
    // scoring is in progress.
    function drawScoringLayer()
    {
        goGame.goBoard.getPoints().forEach(function(pointsXAxis) {
            pointsXAxis.forEach(function(goPoint) {

                var goBoardRegion = goPoint.goBoardRegion;

                drawTerritoryRectIfNotNeutral(goPoint, goBoardRegion);
                drawStoneGroupStateIfNotAlive(goPoint, goBoardRegion);

            }, this);
        }, this);
    }

    // ----------------------------------------------------------------------
    // Internal functions - Drawing helpers for layer drawing functions
    // ----------------------------------------------------------------------

    function drawTerritoryRectIfNotNeutral(goPoint, goBoardRegion) {

        var territoryFillColor;
        var territoryFillOpacity;
        var territoryColor = goBoardRegion.getTerritoryColor();
        switch (territoryColor)
        {
            case COLOR_BLACK:
                territoryFillColor = FILL_COLOR_BLACK_TERRITORY;
                territoryFillOpacity = FILL_OPACITY_BLACK_TERRITORY;
                break;
            case COLOR_WHITE:
                territoryFillColor = FILL_COLOR_WHITE_TERRITORY;
                territoryFillOpacity = FILL_OPACITY_WHITE_TERRITORY;
                break;
            case COLOR_NONE:
                if (goBoardRegion.getTerritoryInconsistencyFound())
                {
                    territoryFillColor = FILL_COLOR_INCONSISTENT_TERRITORY;
                    territoryFillOpacity = FILL_OPACITY_INCONSISTENT_TERRITORY;
                }
                else
                {
                    // Territory is truly neutral, no markup needed
                    return;
                }
                break;
            default:
            {
                throw new Error("Unknown territory color " + territoryColor + " for intersection " + goPoint.goVertex);
            }
        }

        var territoryRect = getTerritoryRectCenteredAtPoint(goPoint);
        var territoryID = ID_SVG_TERRITORY_PREFIX + goPoint.goVertex.toString();

        drawRect(
            territoryRect,
            undefined,
            undefined,
            territoryFillColor,
            territoryFillOpacity,
            territoryID);
    }

    function drawStoneGroupStateIfNotAlive(goPoint, goBoardRegion)
    {
        if (! goPoint.hasStone())
            return;

        var stoneGroupState = goBoardRegion.getStoneGroupState();
        switch (stoneGroupState)
        {
            case STONEGROUPSTATE_DEAD:
            {
                var deadStoneSymbolRect = getSymbolRectCenteredAtPoint(goPoint);

                // The symbol for marking a dead stone is an "x"; we draw this as the two
                // diagonals of a Go stone's "inner square".
                var deadStoneSymbolPath = "";
                deadStoneSymbolPath += "M" + deadStoneSymbolRect.origin.x + "," + deadStoneSymbolRect.origin.y;
                deadStoneSymbolPath += "L" + (deadStoneSymbolRect.origin.x + deadStoneSymbolRect.size.width) + "," + (deadStoneSymbolRect.origin.y + deadStoneSymbolRect.size.width);
                deadStoneSymbolPath += "M" + deadStoneSymbolRect.origin.x + "," + (deadStoneSymbolRect.origin.y + deadStoneSymbolRect.size.width);
                deadStoneSymbolPath += "L" + (deadStoneSymbolRect.origin.x + deadStoneSymbolRect.size.width) + "," + deadStoneSymbolRect.origin.y;

                var deadStoneSymbolStrokeColor = STROKE_COLOR_DEAD_STONE_SYMBOL;
                var deadStoneSymbolStrokeWidth = boardViewMetrics.normalLineWidth * boardViewMetrics.contentsScale;
                var deadStoneSymbolID = ID_SVG_DEADSTONESYMBOL_PREFIX + goPoint.goVertex.toString();

                drawPath(
                    deadStoneSymbolPath,
                    deadStoneSymbolStrokeColor,
                    deadStoneSymbolStrokeWidth,
                    undefined,
                    undefined,
                    deadStoneSymbolID);

                break;
            }
            case STONEGROUPSTATE_SEKI:
            {
                var sekiSymbolRect = getSymbolRectCenteredAtPoint(goPoint);

                var sekiSymbolStrokeColor;
                if (goPoint.hasBlackStone())
                    sekiSymbolStrokeColor = STROKE_COLOR_BLACK_SEKI_SYMBOL;
                else
                    sekiSymbolStrokeColor = STROKE_COLOR_WHITE_SEKI_SYMBOL;

                var sekiSymbolStrokeWidth = boardViewMetrics.normalLineWidth * boardViewMetrics.contentsScale;
                var sekiSymbolID = ID_SVG_SEKISYMBOL_PREFIX + goPoint.goVertex.toString();

                drawRect(
                    sekiSymbolRect,
                    sekiSymbolStrokeColor,
                    sekiSymbolStrokeWidth,
                    undefined,
                    undefined,
                    sekiSymbolID);

                break;
            }
            case STONEGROUPSTATE_ALIVE:
            {
                // Don't draw anything for alive groups
                return;
            }
            default:
            {
                throw new Error("Unknown stone group state " + stoneGroupState + " for intersection " + goPoint.goVertex);
            }
        }
    }

    // ----------------------------------------------------------------------
    // Internal functions - Drawing in response to user interaction
    // ----------------------------------------------------------------------

    // Draws the "next move" indicator at the specified intersection if the
    // player can place a stone on this intersection.
    //
    // Note that "can place a stone" does not include a check if the move would
    // be legal, because such a check would be much too expensive.
    // TODO: Is this note really correct? Since we draw the next move indicator
    // only when the intersection changes (i.e. NOT on every mouse move event)
    // such a legal move check shouldn't generate too much CPU load.
    function drawNextMoveIndicatorIfStoneCanBePlacedAtIntersection(boardViewIntersection)
    {
        if (boardViewIntersection.goPoint === null)
        {
            // Don't draw anything
        }
        else
        {
            if (boardViewIntersection.goPoint.hasStone())
            {
                // Don't draw anything
            }
            else
            {
                var nextMoveColor = goGame.getNextMoveColor();
                var nextMoveStoneColor;
                if (nextMoveColor === COLOR_BLACK)
                    nextMoveStoneColor = FILL_COLOR_BLACK_STONE;
                else
                    nextMoveStoneColor = FILL_COLOR_WHITE_STONE;

                drawCircle(
                    boardViewIntersection.coordinates.x,
                    boardViewIntersection.coordinates.y,
                    boardViewMetrics.stoneRadius,
                    nextMoveStoneColor,
                    FILL_OPACITY_NEXTMOVEINDICATOR,
                    ID_SVG_NEXTMOVEINDICATOR);
            }
        }
    }

    function drawToggleIndicatorIfStoneGroupCanBeToggledAtIntersection(boardViewIntersection)
    {
        if (boardViewIntersection.goPoint === null)
        {
            // Don't draw anything
        }
        else
        {
            if (! boardViewIntersection.goPoint.hasStone())
            {
                // Don't draw anything
            }
            else
            {
                drawCircle(
                    boardViewIntersection.coordinates.x,
                    boardViewIntersection.coordinates.y,
                    boardViewMetrics.starPointRadius * 1.5,
                    FILL_COLOR_TOGGLEINDICATOR,
                    FILL_OPACITY_TOGGLEINDICATOR,
                    ID_SVG_TOGGLEINDICATOR);
            }
        }
    }

    // ----------------------------------------------------------------------
    // Internal functions - Clearing drawing artifacts and layers
    // ----------------------------------------------------------------------

    function clearNextMoveIndicatorIfExists()
    {
        // The function might be already called before we have drawn an
        // initial board
        if (paper === null)
            return;

        var nextMoveIndicator = paper.getById(ID_SVG_NEXTMOVEINDICATOR);
        if (nextMoveIndicator !== null)
            nextMoveIndicator.remove();
    }

    function clearToggleIndicatorIfExists()
    {
        // The function might be already called before we have drawn an
        // initial board
        if (paper === null)
            return;

        var toggleIndicator = paper.getById(ID_SVG_TOGGLEINDICATOR);
        if (toggleIndicator !== null)
            toggleIndicator.remove();
    }

    // ----------------------------------------------------------------------
    // Internal functions - Drawing primitives (= reusable by other drawing code)
    // ----------------------------------------------------------------------

    function drawCircle(centerX, centerY, radius, fillColor, fillOpacity, id)
    {
        var circleSvg = paper.circle(
            centerX,
            centerY,
            radius);
        circleSvg.attr(
            "fill",
            fillColor);
        circleSvg.attr(
            "fill-opacity",
            fillOpacity);
        // TODO: Remove stroke-width entirely - we don't need it, but
        // Raphael adds stroke-width != 0 for us.
        circleSvg.attr("stroke-width", "0");

        circleSvg.id = id;
    }

    function drawRect(rect, strokeColor, strokeWidth, fillColor, fillOpacity, id)
    {
        var rectSvg = paper.rect(
            rect.origin.x,
            rect.origin.y,
            rect.size.width,
            rect.size.height);

        if (strokeColor !== undefined)
        {
            rectSvg.attr("stroke", strokeColor);
            rectSvg.attr("stroke-width", strokeWidth);
        }
        else
        {
            // TODO: Remove stroke-width entirely - we don't need it, but
            // Raphael adds stroke-width != 0 for us.
            rectSvg.attr("stroke-width", "0");
        }

        if (fillColor !== undefined)
        {
            rectSvg.attr("fill", fillColor);
            rectSvg.attr("fill-opacity", fillOpacity);
        }

        rectSvg.id = id;
    }

    function drawPath(pathString, strokeColor, strokeWidth, fillColor, fillOpacity, id)
    {
        var pathSvg = paper.path(pathString);

        if (strokeColor !== undefined)
        {
            pathSvg.attr("stroke", strokeColor);
            pathSvg.attr("stroke-width", strokeWidth);
        }
        else
        {
            // TODO: Remove stroke-width entirely - we don't need it, but
            // Raphael adds stroke-width != 0 for us.
            pathSvg.attr("stroke-width", "0");
        }

        if (fillColor !== undefined)
        {
            pathSvg.attr("fill", fillColor);
            pathSvg.attr("fill-opacity", fillOpacity);
        }

        pathSvg.id = id;
    }

    // ----------------------------------------------------------------------
    // Internal functions - Geometry functions
    // ----------------------------------------------------------------------

    function getSymbolRectCenteredAtPoint(goPoint)
    {
        var width = boardViewMetrics.stoneInnerSquareSize.width;
        var height = boardViewMetrics.stoneInnerSquareSize.height;
        width *= boardViewMetrics.contentsScale;
        height *= boardViewMetrics.contentsScale;

        // It looks better if the marker is slightly inset, and in a desktop
        // browser we can afford to waste the space
        // TODO: Implement the distinction between desktop and mobile browsers
        // if ([LayoutManager sharedManager].uiType == UITypePad)
        width -= 2 * boardViewMetrics.contentsScale;
        height -= 2 * boardViewMetrics.contentsScale;

        var symbolSize = CGSizeMake(width, height);

        return getRectWithSizeCenteredAtPoint(symbolSize, goPoint);
    }

    function getTerritoryRectCenteredAtPoint(goPoint)
    {
        var width = boardViewMetrics.pointCellSize.width;
        var height = boardViewMetrics.pointCellSize.height;
        width *= boardViewMetrics.contentsScale;
        height *= boardViewMetrics.contentsScale;

        var rectSize = CGSizeMake(width, height);

        return getRectWithSizeCenteredAtPoint(rectSize, goPoint);
    }

    function getRectWithSizeCenteredAtPoint(rectSize, goPoint)
    {
        var originBasedRect = CGRectMake(CGPointZero, rectSize);
        var originBasedRectCenter = CGPointMake(CGRectGetMidX(originBasedRect), CGRectGetMidY(originBasedRect));

        var goPointCoordinates = boardViewMetrics.getCoordinatesFromGoPoint(goPoint);

        var x = goPointCoordinates.x - originBasedRectCenter.x;
        var y = goPointCoordinates.y - originBasedRectCenter.y;
        var rectOrigin = CGPointMake(x, y);

        return CGRectMake(rectOrigin, rectSize);
    }

        // ----------------------------------------------------------------------
    // Internal functions - Mouse event handling
    // ----------------------------------------------------------------------

    function onMouseMove(event)
    {
        if (! userInteractionIsEnabled)
            return;

        var intersection = getIntersectionNearMouseEvent(event);

        if (boardViewIntersectionOfPreviousMouseMoveEvent !== null)
        {
            // Don't need to draw anything if the previous mouse move event
            // was near the same intersection
            var sameIntersectionAsPreviousMouseMoveEvent = BoardViewIntersectionEqualToIntersection(
                intersection,
                boardViewIntersectionOfPreviousMouseMoveEvent);
            if (sameIntersectionAsPreviousMouseMoveEvent)
                return;
        }
        boardViewIntersectionOfPreviousMouseMoveEvent = intersection;

        if (scoringMode)
        {
            clearToggleIndicatorIfExists();
            drawToggleIndicatorIfStoneGroupCanBeToggledAtIntersection(intersection);
        }
        else
        {
            clearNextMoveIndicatorIfExists();
            drawNextMoveIndicatorIfStoneCanBePlacedAtIntersection(intersection);
        }
    }

    function onMouseClick(event)
    {
        if (! userInteractionIsEnabled)
            return;

        var intersection = getIntersectionNearMouseEvent(event);
        if (BoardViewIntersectionIsNullIntersection(intersection))
            return;

        if (scoringMode)
        {
            if (! intersection.goPoint.hasStone())
                return;

            clearToggleIndicatorIfExists();
        }
        else
        {
            if (intersection.goPoint.hasStone())
                return;

            var isLegalMoveResult = goGame.isLegalMove(intersection.goPoint);
            if (!isLegalMoveResult.isLegalMove)
            {
                var illegalReasonString = goMoveIsIllegalReasonToString(isLegalMoveResult.illegalReason);

                // TODO: Don't use jQuery
                $("#" + ID_MOVE_IS_ILLEGAL_MODAL_INTERSECTION).html(intersection.goPoint.goVertex.toString());
                $("#" + ID_MOVE_IS_ILLEGAL_MODAL_REASON).html(illegalReasonString);
                $("#" + ID_MOVE_IS_ILLEGAL_MODAL).modal();

                clearNextMoveIndicatorIfExists();
                return;
            }

            clearNextMoveIndicatorIfExists();
        }

        // Iterate over a copy in case the handler wants to remove itself
        var listenersCopy = eventListeners.didClickOnIntersection.slice(0);
        listenersCopy.forEach(function(listener) {
            listener(intersection.goPoint);
        });

        // TODO: Possibly add an indicator that submission is taking place
    }

    function getIntersectionNearMouseEvent(event)
    {
        // We want the coordinates on the canvas. The event target is not
        // always the canvas (i.e. the main "svg" element), the event target
        // is whatever SVG construct the mouse happens to move over at the
        // moment. For this reason we can't use event.target as the source
        // of the bounding client rectangle, instead we must use the
        // well-known paper.canvas.
        //
        // Also note that we can't use a pre-calculated bounding client
        // rectangle, because that rectangle changes when the browser
        // window scrolls.
        var paperBoundingClientRect = paper.canvas.getBoundingClientRect();
        var coordinates = CGPointMake(
            event.clientX - paperBoundingClientRect.left,
            event.clientY - paperBoundingClientRect.top);

        var intersectionNearCoordinates = boardViewMetrics.getIntersectionNearCoordinates(coordinates);
        return intersectionNearCoordinates;
    }
}]);
