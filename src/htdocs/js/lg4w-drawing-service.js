// ----------------------------------------------------------------------
// This file contains code that implements an AngularJS service for
// drawing the Go board.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.service(ANGULARNAME_SERVICE_DRAWING, ["$log", function($log) {

    // ----------------------------------------------------------------------
    // Private variables
    // ----------------------------------------------------------------------

    var goGame = undefined;
    var thisPlayerColor = COLOR_NONE;
    var boardViewMetrics = undefined;
    var paper = null;  // the Raphael library object
    var isThisPlayersTurn = false;
    var boardViewIntersectionOfPreviousMouseMoveEvent = null;

    // ----------------------------------------------------------------------
    // Event listeners
    // ----------------------------------------------------------------------

    var eventListeners =
        {
            didPlayStone: []
        };

    // ----------------------------------------------------------------------
    // Public API
    // ----------------------------------------------------------------------

    this.addDidPlayStoneListener = function(listener) {
        eventListeners.didPlayStone.push(listener);
    };

    this.removeDidPlayStoneListener = function(listener)
    {
        var index = eventListeners.didPlayStone.indexOf(listener);
        if (-1 !== index)
            eventListeners.didPlayStone.splice(index, 1);
    };

    // Configure the drawing service so that future drawing operations draw
    // a Go board that represents the specified GoGame.
    //
    // The player who in the future will interact with the Go board has the
    // specified stone color (must be either COLOR_BLACK or COLOR_WHITE).
    this.configure = function(newGoGame, newThisPlayerColor) {
        goGame = newGoGame;
        thisPlayerColor = newThisPlayerColor;
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

        updateIsThisPlayersTurn();

        // The order in which layers are drawn is important! Later layers are
        // drawn on top of earlier layers.
        drawGridLayer();
        drawStonesLayer();
        drawSymbolsLayer();

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
        this.drawGoBoard();

        // Enable/disable interaction depending on whether it's currently
        // this player's turn
        updateIsThisPlayersTurn();
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

        var canvasWidth = domElementContainerCanvas.clientWidth;
        var canvasHeight = domElementContainerCanvas.clientHeight;

        if (canvasWidth !== canvasHeight)
        {
            var canvasDimension = Math.min(canvasWidth, canvasHeight);
            $log.warn("Canvas was not square, original width / height = " + canvasWidth + " / " + canvasHeight + ", new dimension is " + canvasDimension);
            canvasWidth = canvasDimension;
            canvasHeight = canvasDimension;
        }

        if (canvasWidth === 0)
        {
            $log.error("Canvas width / height is zero!");
        }

        var paper = Raphael(domElementContainerCanvas, canvasWidth, canvasHeight);

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
        var lastMove = goGame.getLastMove();
        if (lastMove !== null && GOMOVE_TYPE_PLAY === lastMove.moveType)
        {
            var lastMoveSymbolRect = getSymbolRectCenteredAtPoint(lastMove.goPoint);
            var lastMoveSymbolSvg = paper.rect(
                lastMoveSymbolRect.origin.x,
                lastMoveSymbolRect.origin.y,
                lastMoveSymbolRect.size.width,
                lastMoveSymbolRect.size.height);

            var lastMoveSymbolStrokeColor;
            if (lastMove.goPlayer.isBlack())
                lastMoveSymbolStrokeColor = STROKE_COLOR_BLACK_LAST_MOVE_SYMBOL;
            else
                lastMoveSymbolStrokeColor = STROKE_COLOR_WHITE_LAST_MOVE_SYMBOL;
            lastMoveSymbolSvg.attr("stroke", lastMoveSymbolStrokeColor);

            var lastMoveSymbolStrokeWidth = boardViewMetrics.normalLineWidth * boardViewMetrics.contentsScale;
            lastMoveSymbolSvg.attr("stroke-width", lastMoveSymbolStrokeWidth);
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
                var lastMove = goGame.getLastMove();

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

    function clearNextMoveIndicatorIfExists()
    {
        var nextMoveIndicator = paper.getById(ID_SVG_NEXTMOVEINDICATOR);
        if (nextMoveIndicator !== null)
            nextMoveIndicator.remove();
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


        var originBasedRect = CGRectMake(CGPointZero, symbolSize);
        var originBasedRectCenter = CGPointMake(CGRectGetMidX(originBasedRect), CGRectGetMidY(originBasedRect));
        var goPointCoordinates = boardViewMetrics.getCoordinatesFromGoPoint(goPoint);
        var x = goPointCoordinates.x - originBasedRectCenter.x;
        var y = goPointCoordinates.y - originBasedRectCenter.y;
        var symbolOrigin = CGPointMake(x, y);

        return CGRectMake(symbolOrigin, symbolSize);
    }

    // ----------------------------------------------------------------------
    // Internal functions - Game logic functions
    // ----------------------------------------------------------------------

    function updateIsThisPlayersTurn()
    {
        if (goGame.getNextMoveColor() === thisPlayerColor)
            isThisPlayersTurn = true;
        else
            isThisPlayersTurn = false;
    }

    // ----------------------------------------------------------------------
    // Internal functions - Mouse event handling
    // ----------------------------------------------------------------------

    function onMouseMove(event)
    {
        if (! isThisPlayersTurn)
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

        clearNextMoveIndicatorIfExists();
        drawNextMoveIndicatorIfStoneCanBePlacedAtIntersection(intersection);
    }

    function onMouseClick(event)
    {
        if (! isThisPlayersTurn)
            return;

        var intersection = getIntersectionNearMouseEvent(event);
        if (BoardViewIntersectionIsNullIntersection(intersection))
            return;

        if (intersection.goPoint.hasStone())
            return;

        var isLegalMoveResult = goGame.isLegalMove(intersection.goPoint);
        if (! isLegalMoveResult.isLegalMove)
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

        // Iterate over a copy in case the handler wants to remove itself
        var listenersCopy = eventListeners.didPlayStone.slice(0);
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
