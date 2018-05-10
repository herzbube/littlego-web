// ----------------------------------------------------------------------
// This file contains the code that draws the Go board.
//
// The BoardViewMetrics class was lifted from the Little Go project
// (from the same author as this project) and transcribed from Objective-C
// into JavaScript.
// ----------------------------------------------------------------------

// Drawing constants

// Line widths remain always the same, regardless of the canvas size.
// Bounding line must be thicker than the normal line. Normal line
// should be a very thin, crisp line.
const STROKE_WIDTH_BOUNDING_GRID_LINE = 2;
const STROKE_WIDTH_NORMAL_GRID_LINE = 1;
const STROKE_COLOR_GRID_LINE = "black";
const STROKE_COLOR_BLACK_LAST_MOVE_SYMBOL = "white";
const STROKE_COLOR_WHITE_LAST_MOVE_SYMBOL = "black";
const FILL_COLOR_STAR_POINT = "black";
const FILL_COLOR_BLACK_STONE = "black";
const FILL_COLOR_WHITE_STONE = "white";
const FILL_OPACITY_STARPOINT = 1.0;
const FILL_OPACITY_STONE = 1.0;
const FILL_OPACITY_NEXTMOVEINDICATOR = 0.6;


var DrawingController = (function ()
{
    "use strict";

    // Creates a new DrawingController object.
    function DrawingController(jQueryObjectContainerCanvas, goGame, callbackDidPlayStone)
    {
        this.jQueryObjectContainerCanvas = jQueryObjectContainerCanvas;
        this.goGame = goGame;
        this.boardViewMetrics = new BoardViewMetrics(goGame);
        this.paper = null;
        this.boardViewIntersectionOfPreviousMouseMoveEvent = null;
        this.callbackDidPlayStone = callbackDidPlayStone;
    }

    // This is the main function that triggers drawing the Go board. The parameter
    // must be a jQuery object that represents a container element inside which
    // this function can freely create any elements required for drawing the board.
    //
    // This function obtains the size of the canvas on which it can draw from the
    // size of the container element's displayed content. For this to work, the
    // container element must be visible, i.e. it's "display" property must not be
    // "none", when this function is invoked.
    DrawingController.prototype.drawGoBoard = function()
    {
        this.eraseCurrentGoBoard(this.jQueryObjectContainerCanvas);

        this.paper = this.createPaper(this.jQueryObjectContainerCanvas);

        // TODO: Add this event handler only if it's the user's turn to play
        var self = this;
        $("#" + ID_SVG_BOARD).on("mousemove", function(event) {
            self.onMouseMove(event);
        });
        this.boardViewIntersectionOfPreviousMouseMoveEvent = null;
        $("#" + ID_SVG_BOARD).on("click", function(event) {
            self.onMouseClick(event);
        });

        this.boardViewMetrics.updateWithBaseSize(CGSizeMake(this.paper.width, this.paper.height));
        this.boardViewMetrics.updateWithBoardSize(this.goGame.goBoard.boardSize);

        // The order in which layers are drawn is important! Later layers are
        // drawn on top of earlier layers.
        this.drawGridLayer();
        this.drawStonesLayer();
        this.drawSymbolsLayer();
    };

    DrawingController.prototype.eraseCurrentGoBoard = function ()
    {
        this.jQueryObjectContainerCanvas.empty();
    };

    DrawingController.prototype.createPaper = function()
    {
        var domElementContainerCanvas = this.jQueryObjectContainerCanvas.get(0);

        var canvasWidth = domElementContainerCanvas.clientWidth;
        var canvasHeight = domElementContainerCanvas.clientHeight;

        if (canvasWidth !== canvasHeight)
        {
            var canvasDimension = Math.min(canvasWidth, canvasHeight);
            console.log("Canvas was not square, original width / height = " + canvasWidth + " / " + canvasHeight + ", new dimension is " + canvasDimension);
            canvasWidth = canvasDimension;
            canvasHeight = canvasDimension;
        }

        if (canvasWidth === 0)
        {
            console.log("Canvas width / height is zero!");
        }

        var paper = Raphael(domElementContainerCanvas, canvasWidth, canvasHeight);

        // This is required so that CSS properties are applied (e.g. the background)
        paper.canvas.id = ID_SVG_BOARD;

        // For unknown reasons Raphael adds this to the svg element:
        //   style="overflow: hidden; position: relative; top: -0.666626px;"
        // We don't care about the overflow property, but we don't want
        // position and top because we set these in our own CSS.
        //
        // Note that we could also set our own CSS properties to "!important"
        // to override the style on the svg element.
        paper.canvas.removeAttribute("style");

        return paper;
    };

    // Draws the line grid and the star points.
    DrawingController.prototype.drawGridLayer = function()
    {
        this.boardViewMetrics.lineRectangles.forEach(function(lineRectangle) {
            var lineRectangleSvg = this.paper.rect(
                lineRectangle.origin.x,
                lineRectangle.origin.y,
                lineRectangle.size.width,
                lineRectangle.size.height);
            lineRectangleSvg.attr("fill", this.boardViewMetrics.lineColor);
        }, this);

        this.goGame.goBoard.starPoints.forEach(function(starPoint) {
            var starPointCoordinates = this.boardViewMetrics.getCoordinatesFromGoPoint(starPoint);
            var starPointID = ID_SVG_STARPOINT_PREFIX + starPoint.goVertex.toString();

            this.drawCircle(
                starPointCoordinates.x,
                starPointCoordinates.y,
                this.boardViewMetrics.starPointRadius,
                this.boardViewMetrics.starPointColor,
                FILL_OPACITY_STARPOINT,
                starPointID);
        }, this);
    };

    // Draws the black and white stones
    DrawingController.prototype.drawStonesLayer = function()
    {
        this.goGame.goBoard.points.forEach(function(pointsXAxis) {
            pointsXAxis.forEach(function(goPoint) {
                if (! goPoint.hasStone())
                    return;

                var goPointCoordinates = this.boardViewMetrics.getCoordinatesFromGoPoint(goPoint);
                var stoneID = ID_SVG_STONE_PREFIX + goPoint.goVertex.toString();

                var stoneColor;
                if (goPoint.hasBlackStone())
                    stoneColor = FILL_COLOR_BLACK_STONE;
                else
                    stoneColor = FILL_COLOR_WHITE_STONE;

                this.drawCircle(
                    goPointCoordinates.x,
                    goPointCoordinates.y,
                    this.boardViewMetrics.stoneRadius,
                    stoneColor,
                    FILL_OPACITY_STONE,
                    stoneID);
            }, this);
        }, this);
    };

    // Draws the symbols (e.g. last move, move numbers)
    DrawingController.prototype.drawSymbolsLayer = function()
    {
        var lastMove = this.goGame.getLastMove();
        if (lastMove !== null && GOMOVE_TYPE_PLAY === lastMove.moveType)
        {
            var lastMoveSymbolRect = this.getSymbolRectCenteredAtPoint(lastMove.goPoint);
            var lastMoveSymbolSvg = this.paper.rect(
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

            var lastMoveSymbolStrokeWidth = this.boardViewMetrics.normalLineWidth * this.boardViewMetrics.contentsScale;
            lastMoveSymbolSvg.attr("stroke-width", lastMoveSymbolStrokeWidth);
        }
    };

    // Draws the "next move" indicator at the specified intersection if the
    // player can place a stone on this intersection.
    //
    // Note that "can place a stone" does not include a check if the move would
    // be legal, because such a check would be much too expensive.
    DrawingController.prototype.drawNextMoveIndicatorIfStoneCanBePlacedAtIntersection = function(boardViewIntersection)
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
                var lastMove = this.goGame.getLastMove();

                var nextMoveColor = this.goGame.getNextMoveColor();
                var nextMoveStoneColor;
                if (nextMoveColor === COLOR_BLACK)
                    nextMoveStoneColor = FILL_COLOR_BLACK_STONE;
                else
                    nextMoveStoneColor = FILL_COLOR_WHITE_STONE;

                this.drawCircle(
                    boardViewIntersection.coordinates.x,
                    boardViewIntersection.coordinates.y,
                    this.boardViewMetrics.stoneRadius,
                    nextMoveStoneColor,
                    FILL_OPACITY_NEXTMOVEINDICATOR,
                    ID_SVG_NEXTMOVEINDICATOR);
            }
        }
    };

    DrawingController.prototype.clearNextMoveIndicatorIfExists = function()
    {
        var nextMoveIndicator = this.paper.getById(ID_SVG_NEXTMOVEINDICATOR);
        if (nextMoveIndicator !== null)
            nextMoveIndicator.remove();
    };

    DrawingController.prototype.drawCircle = function(centerX, centerY, radius, fillColor, fillOpacity, id)
    {
        var circleSvg = this.paper.circle(
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
    };

    DrawingController.prototype.getSymbolRectCenteredAtPoint = function(goPoint)
    {
        var width = this.boardViewMetrics.stoneInnerSquareSize.width;
        var height = this.boardViewMetrics.stoneInnerSquareSize.height;
        width *= this.boardViewMetrics.contentsScale;
        height *= this.boardViewMetrics.contentsScale;

        // It looks better if the marker is slightly inset, and in a desktop
        // browser we can afford to waste the space
        // TODO: Implement the distinction between desktop and mobile browsers
        // if ([LayoutManager sharedManager].uiType == UITypePad)
        width -= 2 * this.boardViewMetrics.contentsScale;
        height -= 2 * this.boardViewMetrics.contentsScale;

        var symbolSize = CGSizeMake(width, height);


        var originBasedRect = CGRectMake(CGPointZero, symbolSize);
        var originBasedRectCenter = CGPointMake(CGRectGetMidX(originBasedRect), CGRectGetMidY(originBasedRect));
        var goPointCoordinates = this.boardViewMetrics.getCoordinatesFromGoPoint(goPoint);
        var x = goPointCoordinates.x - originBasedRectCenter.x;
        var y = goPointCoordinates.y - originBasedRectCenter.y;
        var symbolOrigin = CGPointMake(x, y);

        return CGRectMake(symbolOrigin, symbolSize);
    };

    DrawingController.prototype.onMouseMove = function(event)
    {
        var intersection = this.getIntersectionNearMouseEvent(event);

        if (this.boardViewIntersectionOfPreviousMouseMoveEvent !== null)
        {
            // Don't need to draw anything if the previous mouse move event
            // was near the same intersection
            var sameIntersectionAsPreviousMouseMoveEvent = BoardViewIntersectionEqualToIntersection(
                intersection,
                this.boardViewIntersectionOfPreviousMouseMoveEvent);
            if (sameIntersectionAsPreviousMouseMoveEvent)
                return;
        }
        this.boardViewIntersectionOfPreviousMouseMoveEvent = intersection;

        this.clearNextMoveIndicatorIfExists();
        this.drawNextMoveIndicatorIfStoneCanBePlacedAtIntersection(intersection);
    };

    DrawingController.prototype.onMouseClick = function(event)
    {
        var intersection = this.getIntersectionNearMouseEvent(event);

        // TODO: Check if move is legal. If it's not display a banner with the reason why not.

        this.clearNextMoveIndicatorIfExists();
        this.callbackDidPlayStone(intersection.goPoint);

        // TODO: Deactivate interaction.
        // TODO: Possibly add an indicator that submission is taking place
    };

    DrawingController.prototype.getIntersectionNearMouseEvent = function(event)
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
        var paperBoundingClientRect = this.paper.canvas.getBoundingClientRect();
        var coordinates = CGPointMake(
            event.clientX - paperBoundingClientRect.left,
            event.clientY - paperBoundingClientRect.top);

        var intersectionNearCoordinates = this.boardViewMetrics.getIntersectionNearCoordinates(coordinates);
        return intersectionNearCoordinates;
    };

    DrawingController.prototype.updateAfterGameMoveWasPlayed = function()
    {
        // TODO: The controller must remove the submission indicator.
        // TODO: The controller possibly has to reactivate interaction.

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
    };

    return DrawingController;
})();


// ----------------------------------------------------------------------
// The BoardViewMetrics class is a model class that provides locations
// and sizes (i.e. "metrics") of Go board elements that can be used to draw
// those elements.
//
// All metrics refer to an imaginary canvas that contains the entire Go board.
// The size of the canvas is determined by two things:
// - A base size that is equal to the size of the "svg" element that displays
//   the part of the Go board that is currently visible
// - The base size is multiplied by a scale factor that is equal to the zoom
//   scale that is currently in effect.
//
// Effectively, the canvas is equal to the content of the "svg" element that
// displays the Go board. If the "svg" element size changes (e.g. when the
// browser window size changes, or an interface orientation change occurs on
// a mobile device), someone must invoke updateWithBaseSize:(). If the zoom
// scale changes, someone must invoke updateWithRelativeZoomScale:().
//
// Additional properties that influence the metrics calculated by
// BoardViewMetrics are:
// - The size of the Go board (e.g. 7x7, 19x19). If the board size changes
//   (e.g. when a new game is started), someone must invoke
//   updateWithBoardSize:().
// - Whether or not coordinate labels should be displayed. If this changes
//   (typically because the user preference changed), someone must invoke
//   updateWithDisplayCoordinates:().
//
// If any of these 4 updaters is invoked, BoardViewMetrics re-calculates all
// of its properties. Clients are expected to use KVO to notice any changes in
// this.canvasSize, this.boardSize or this.displayCoordinates, and to respond
// to such changes by initiating the re-drawing of the appropriate parts of the
// Go board.
// TODO: KVO is an Objective-C mechanism which does not exist in JavaScript.
//
//
// @par Calculations
//
// The following schematic illustrates the composition of the canvas for a
// (theoretical) 4x4 board. Note that the canvas has rectangular dimensions,
// while the actual board is square and centered within the canvas rectangle.
//
//                                                      offsetForCenteringX
//       +------- topLeftBoardCorner                   +-----+
//       |    +-- topLeftPoint                         |     |
//       |    |                                        |     v
// +---- | -- | --------------view-------------------- | ----+ <--+
// |     v    |                                        v     |    | offsetForCenteringY
// |     +--- v --------------board--------------------+ <--------+
// |     |    A           B           C           D    |     |
// |     |   /-\         /-\                           |     |
// |     |4 | o |-------| o |--grid---o-----------o   4|     |
// |     |   \-/         \-/          |           |    |     |
// |     |    |           |           |           |    |     |
// |     |    |           |           |           |    |     |
// |     |    |           |           |           |    |     |
// |     |    |          /-\         /-\         /-\   |     |
// |     |3   o---------| o |-------| o |-------| o | 3<-------- coordinate label
// |     |    |          \-/         \-/         \-/   |     |   coordinateLabelStripWidth
// |     |    |           |         ^   ^         |    |     |   is the distance from the
// |     |    |           |         +---+         |    |     |   stone to the board edge
// |     |    |           |    stoneRadius*2+1    |    |     |
// |     |    |           |       (diameter)      |    |     |
// |     |2   o-----------o-----------+-----------o   2|     |
// |     |    |           |           |           |    |     |
// |     |    |           |           |           |    |     |
// |     |    |           |           |           |    |     |
// |     |    |           |           |           |    |     |
// |     |    |           |           |           |    |     |
// |     |1   o-----------o-----------o-----------o   1|     |
// |     |    ^           ^^         ^            ^    |     |
// |     +--- | --------- ||  cell   | ---------- | ---+     |
// |     ^    |           |+--Width--+            |    ^     |
// +---- |    |           | point    ^            |    | ----+
//       |    |           +-Distance-+            |    |
//       |    +------------lineLength-------------+    |
//       +--------------boardSideLength----------------+
//
//
// The coordinates of topLeftBoardCorner, topLeftPoint and bottomRightPoint
// are based on a coordinate system whose origin is in the top-left corner.
// SVG, CSS and Canvas all use such a coordinate system.
//
// As a small reminder for how to calculate distances, lengths and sizes in the
// graphics system: The coordinate system is zero-based, and the distance
// between two points always includes the starting point, but not the end point
// (cf. pointDistance in the schematic above).
//
//
// @par Anti-aliasing
//
// Most calculations are made with integer types. If necessary, the actual
// drawing then uses a half-pixel translation to prevent anti-aliasing for
// straight lines. Half-pixel translation is usually needed when lines have an
// odd-numbered width (e.g. 1, 3, ...). See https://stackoverflow.com/q/2488115/1054378
// for details. Half-pixel translation may also be necessary if something is
// drawn with its center at an intersection on the Go board, and the
// intersection coordinate has fractional x.5 values.
//
// A straight line of width 1 can be drawn in different ways. Core Graphics
// can be observed to behave differently for the following cases:
// - The line is created with a path. To prevent anti-aliasing, the path must
//   start and end at coordinates that have fractional x.5 values.
// - The line is created by filling a path that is a rectangle of width or
//   height 1. To prevent anti-aliasing, the rectangle origin must be at a
//   coordinate that has integral x.0 values.
// TODO: Is this also true for SVG?
//
// @note One might be tempted to try to turn off anti-aliasing instead of doing
// half-pixel translation. Even if this were possible in SVG or Canvas drawing
// (which I'm not sure it is), then it wouldn't be a good idea. The reason is
// that 1) round shapes (e.g. star points, stones) do need anti-aliasing; and
// 2) if only some parts of the view are drawn with anti-aliasing, and others
// are not, things become mis-aligned (e.g. stones are not exactly centered on
// line intersections).
// ----------------------------------------------------------------------
var BoardViewMetrics = (function ()
{
    "use strict";

    // Creates a new BoardViewMetrics object.
    function BoardViewMetrics(goGame)
    {
        this.goGame = goGame;

        this.setupStaticProperties();
        this.setupFontRanges();
        this.setupMainProperties();
        // Remaining properties are initialized by this updater
        this.updateWithCanvasSizeBoardSizeDisplayCoordinates(
            this.canvasSize,
            this.boardSize,
            this.displayCoordinates);
    }

    // Helper for the constructor.
    BoardViewMetrics.prototype.setupStaticProperties = function()
    {
        this.contentsScale = 1.0;
        this.tileSize = CGSizeMake(128, 128);
        this.minimumAbsoluteZoomScale = 1.0;
        this.maximumAbsoluteZoomScale = 3.0;
        this.lineColor = STROKE_COLOR_GRID_LINE;
        this.boundingLineWidth = STROKE_WIDTH_BOUNDING_GRID_LINE;
        this.normalLineWidth = STROKE_WIDTH_NORMAL_GRID_LINE;
        this.starPointColor = FILL_COLOR_STAR_POINT;
        this.starPointRadius = 5;
        this.stoneRadiusPercentage = 0.9;
        // TODO: Implement
        //this.crossHairColor = [UIColor blueColor];
        //this.territoryColorBlack = [UIColor colorWithWhite:0.0 alpha:0.35];
        //this.territoryColorWhite = [UIColor colorWithWhite:1.0 alpha:0.6];
        //this.territoryColorInconsistent = [[UIColor redColor] colorWithAlphaComponent:0.3];
        //this.deadStoneSymbolColor = [UIColor redColor];
        this.deadStoneSymbolPercentage = 0.8;
        // TODO: Implement
        //this.inconsistentTerritoryDotSymbolColor = [UIColor redColor];
        this.inconsistentTerritoryDotSymbolPercentage = 0.5;
        // TODO: Implement
        //this.blackSekiSymbolColor = [UIColor colorFromHexString:@"80c0f0"];
        //this.whiteSekiSymbolColor = [UIColor colorFromHexString:@"60b0e0"];
    };

    // Helper for the constructor.
    BoardViewMetrics.prototype.setupFontRanges = function()
    {
        // TODO Implement this as soon as we can draw move numbers and/or symbols.
    };

    // Helper for the constructor.
    BoardViewMetrics.prototype.setupMainProperties = function()
    {
        this.baseSize = CGSizeZero;
        this.absoluteZoomScale = 1.0;
        this.canvasSize = CGSizeMake(
            this.baseSize.width * this.absoluteZoomScale,
            this.baseSize.height * this.absoluteZoomScale);
        this.boardSize = BOARDSIZE_UNDEFINED;
        this.displayCoordinates = false;
    };

    // Updates the values stored by this BoardViewMetrics object based on
    // @a newBaseSize.
    //
    // The new canvas size will be the new base size multiplied by the current
    // absolute zoom scale.
    BoardViewMetrics.prototype.updateWithBaseSize = function(newBaseSize)
    {
        if (CGSizeEqualToSize(newBaseSize, this.baseSize))
            return;
        var newCanvasSize = CGSizeMake(
            newBaseSize.width * this.absoluteZoomScale,
            newBaseSize.height * this.absoluteZoomScale);
        this.updateWithCanvasSizeBoardSizeDisplayCoordinates(
            newCanvasSize,
            this.boardSize,
            this.displayCoordinates);
        // Update properties only after everything has been re-calculated so that KVO
        // observers get the new values
        // TODO: Find a replacement for KVO
        this.baseSize = newBaseSize;
        this.canvasSize = newCanvasSize;
    };

    // Updates the values stored by this BoardViewMetrics object based on
    // @a newRelativeZoomScale.
    //
    // BoardViewMetrics uses an absolute zoom scale for its calculations. This zoom
    // scale is also available as the public property @e absoluteZoomScale. The
    // zoom scale specified here is a @e relative zoom scale that is multiplied
    // with the current absolute zoom to get the new absolute zoom scale.
    //
    // Example: The current absolute zoom scale is 2.0, i.e. the canvas size is
    // double the size of the base size. A new relative zoom scale of 1.5 results
    // in the new absolute zoom scale 2.0 * 1.5 = 3.0, i.e. the canvas size will
    // be triple the size of the base size.
    //
    // @attention This method may make adjustments so that the final absolute
    // zoom scale can be different from the result of the multiplication described
    // above. For instance, if rounding errors would cause the absolute zoom scale
    // to fall outside of the minimum/maximum range, an adjustment is made so that
    // the absolute zoom scale hits the range boundary.
    BoardViewMetrics.prototype.updateWithRelativeZoomScale = function(newRelativeZoomScale)
    {
        if (1.0 === newRelativeZoomScale)
            return;
        var newAbsoluteZoomScale = this.absoluteZoomScale * newRelativeZoomScale;
        if (newAbsoluteZoomScale < this.minimumAbsoluteZoomScale)
            newAbsoluteZoomScale = this.minimumAbsoluteZoomScale;
        else if (newAbsoluteZoomScale > this.maximumAbsoluteZoomScale)
            newAbsoluteZoomScale = this.maximumAbsoluteZoomScale;
        var newCanvasSize = CGSizeMake(
            this.baseSize.width * newAbsoluteZoomScale,
            this.baseSize.height * newAbsoluteZoomScale);
        this.updateWithCanvasSizeBoardSizeDisplayCoordinates(
            newCanvasSize,
            this.boardSize,
            this.displayCoordinates);
        // Update properties only after everything has been re-calculated so that KVO
        // observers get the new values
        // TODO: Find a replacement for KVO
        this.absoluteZoomScale = newAbsoluteZoomScale;
        this.canvasSize = newCanvasSize;
    };

    // Updates the values stored by this BoardViewMetrics object based on
    // @a newBoardSize.
    //
    // Invoking this updater does not change the canvas size, but it changes the
    // locations and sizes of all board elements on the canvas.
    BoardViewMetrics.prototype.updateWithBoardSize = function(newBoardSize)
    {
        if (this.boardSize === newBoardSize)
            return;
        this.updateWithCanvasSizeBoardSizeDisplayCoordinates(
            this.canvasSize,
            newBoardSize,
            this.displayCoordinates);
        // Update properties only after everything has been re-calculated so that KVO
        // observers get the new values
        // TODO: Find a replacement for KVO
        this.boardSize = newBoardSize;
    };

    // Updates the values stored by this BoardViewMetrics object based on
    // @a newDisplayCoordinates.
    //
    // Invoking this updater does not change the canvas size, but it changes the
    // locations and sizes of all board elements on the canvas.
    BoardViewMetrics.prototype.updateWithDisplayCoordinates = function(newDisplayCoordinates)
    {
        if (this.displayCoordinates === newDisplayCoordinates)
            return;
        this.updateWithCanvasSizeBoardSizeDisplayCoordinates(
            this.canvasSize,
            this.boardSize,
            newDisplayCoordinates);
        // Update properties only after everything has been re-calculated so that KVO
        // observers get the new values
        // TODO: Find a replacement for KVO
        this.displayCoordinates = newDisplayCoordinates;
    };

    // Updates the values stored by this BoardViewMetrics object based on
    // @a newCanvasSize, @a newBoardSize and @a newDisplayCoordinates.
    //
    // This is the internal backend for the various public updater methods.
    BoardViewMetrics.prototype.updateWithCanvasSizeBoardSizeDisplayCoordinates = function(
        newCanvasSize,
        newBoardSize,
        newDisplayCoordinates)
    {
        // ----------------------------------------------------------------------
        // All calculations in this method must use newCanvasSize, newBoardSize and
        // newDisplayCoordinates. The corresponding properties this.newCanvasSize,
        // this.boardSize and this.displayCoordinates must not be used because, due
        // to the way how this update method is invoked, at least one of these
        // properties is guaranteed to be not up-to-date.
        // ----------------------------------------------------------------------

        // The rect is rectangular, but the Go board is square. Examine the rect
        // orientation and use the smaller dimension of the rect as the base for
        // the Go board's side length.
        this.portrait = newCanvasSize.height >= newCanvasSize.width;
        var offsetForCenteringX = 0;
        var offsetForCenteringY = 0;
        if (this.portrait)
        {
            this.boardSideLength = Math.floor(newCanvasSize.width);
            offsetForCenteringY += Math.floor((newCanvasSize.height - this.boardSideLength) / 2);
        }
        else
        {
            this.boardSideLength = Math.floor(newCanvasSize.height);
            offsetForCenteringX += Math.floor((newCanvasSize.width - this.boardSideLength) / 2);
        }

        // A zero-sized canvas is possible if the SVG element is currently
        // not visible.
        if (BOARDSIZE_UNDEFINED === newBoardSize || CGSizeEqualToSize(newCanvasSize, CGSizeZero))
        {
            // Assign hard-coded values and don't rely on calculations that might
            // produce insane results. This also removes the risk of division by zero
            // errors.
            this.boardSideLength = 0;
            this.topLeftBoardCornerX = offsetForCenteringX;
            this.topLeftBoardCornerY = offsetForCenteringY;
            this.coordinateLabelStripWidth = 0;
            this.coordinateLabelInset = 0;
            this.coordinateLabelFont = null;
            this.coordinateLabelMaximumSize = CGSizeZero;
            this.nextMoveLabelFont = null;
            this.nextMoveLabelMaximumSize = CGSizeZero;
            this.numberOfCells = 0;
            this.cellWidth = 0;
            this.pointDistance = 0;
            this.stoneRadius = 0;
            this.lineLength = 0;
            this.topLeftPointX = this.topLeftBoardCornerX;
            this.topLeftPointY = this.topLeftBoardCornerY;
            this.bottomRightPointX = this.topLeftPointX;
            this.bottomRightPointY = this.topLeftPointY;
        }
        else
        {
            // When the board is zoomed, the rect usually has a size with fractions.
            // We need the fraction part so that we can make corrections to coordinates
            // that prevent anti-aliasing.
            var rectWidthFraction = newCanvasSize.width - Math.floor(newCanvasSize.width);
            var rectHeightFraction = newCanvasSize.height - Math.floor(newCanvasSize.height);
            // All coordinate calculations are based on topLeftBoardCorner, so if we
            // correct this coordinate, the correction will propagate appropriately.
            // TODO Find out why exactly the fractions need to be added and not
            // subtracted. It has something to do with the origin of the Core Graphics
            // coordinate system (lower-left corner), but I have not thought this
            // through.
            this.topLeftBoardCornerX = offsetForCenteringX + rectWidthFraction;
            this.topLeftBoardCornerY = offsetForCenteringY + rectHeightFraction;

            // The coordinate label strip can be smaller than this.cellWidth (because a
            // coordinate label at most contains 2 characters, whereas a cell must
            // accomodate a stone and a 3-character move number inside), but it must
            // still be fairly large so that the coordinate label is not too small.
            // 2/3 is an experimentally determined factor that matches the maximum font
            // sizes defined elsewhere. In an earlier implementation, we used the factor
            // 1/2, but then we also used much smaller font sizes.
            const coordinateLabelStripWidthFactor = 2.0 / 3.0;
            if (newDisplayCoordinates)
            {
                // The coordinate labels' font size will be selected so that labels fit
                // into the width of the strip that we calculate here. Because we do not
                // yet have this.cellWidth we need to approximate.
                // TODO: The current calculation is too simple and gives us a strip that
                // is wider than necessary, i.e. it will take away more space from
                // this.cellWidth than necessary. A more intelligent approach should find
                // out if a few pixels can be gained for this.cellWidth by choosing a
                // smaller coordinate label font. In the balance, the font size sacrifice
                // must not become too great, for instance the sacrifice would be too
                // great if no font could be found anymore and thus no coordinate labels
                // would be drawn. An algorithm that achieves such a balance would
                // probably need to find its solution in multiple iterations.
                this.coordinateLabelStripWidth = Math.floor(
                    this.boardSideLength
                    / newBoardSize
                    * coordinateLabelStripWidthFactor);

                // We want coordinate labels to be drawn with an inset: It just doesn't
                // look good if a coordinate label is drawn right at the screen edge or
                // touches a stone at the board edge.
                const coordinateLabelInsetMinimum = 1;
                // If there is sufficient space the inset can grow beyond the minimum.
                // We use a percentage so that the inset grows with the available drawing
                // area. The percentage chosen here is an arbitrary value.
                const coordinateLabelInsetPercentage = 0.10;
                this.coordinateLabelInset = Math.floor(this.coordinateLabelStripWidth * coordinateLabelInsetPercentage);
                if (this.coordinateLabelInset < coordinateLabelInsetMinimum)
                    this.coordinateLabelInset = coordinateLabelInsetMinimum;

                // Finally we are able to select a font. We use the largest possible font,
                // but if there isn't one we sacrifice 1 inset point and try again. The
                // idea is that it is better to display coordinate labels and use an inset
                // that is not the desired optimum, than to not display labels at all.
                // coordinateLabelInsetMinimum is still the hard limit, though.
                var didFindCoordinateLabelFont = false;
                while (! didFindCoordinateLabelFont && this.coordinateLabelInset >= coordinateLabelInsetMinimum)
                {
                    var coordinateLabelAvailableWidth = this.coordinateLabelStripWidth - 2 * this.coordinateLabelInset;
                    // TODO: Implement as soon as we display coordinate labels
                    didFindCoordinateLabelFont = true;
                    //didFindCoordinateLabelFont = this.coordinateLabelFontRange.queryForWidth(
                    //    coordinateLabelAvailableWidth,
                    //    &_coordinateLabelFont,
                    //    &_coordinateLabelMaximumSize);
                    if (! didFindCoordinateLabelFont)
                        this.coordinateLabelInset--;
                }
                if (! didFindCoordinateLabelFont)
                {
                    this.coordinateLabelStripWidth = 0;
                    this.coordinateLabelInset = 0;
                    this.coordinateLabelFont = null;
                    this.coordinateLabelMaximumSize = CGSizeZero;
                }
            }
            else
            {
                this.coordinateLabelStripWidth = 0;
                this.coordinateLabelInset = 0;
                this.coordinateLabelFont = null;
                this.coordinateLabelMaximumSize = CGSizeZero;
            }

            // Valid values for this constant:
            // 1 = A single coordinate label strip is displayed for each of the axis.
            //     The strips are drawn above and on the left hand side of the board
            // 2 = Two coordinate label strips are displayed for each of the axis. The
            //     strips are drawn on all edges of the board.
            // Note that this constant cannot be set to 0 to disable coordinate labels.
            // The calculations above already achieve this by setting
            // this.coordinateLabelStripWidth to 0.
            //
            // TODO: Currently only one strip is drawn even if this constant is set to
            // the value 2. The only effect that value 2 has is that drawing space is
            // reserved for the second strip.
            const numberOfCoordinateLabelStripsPerAxis = 1;

            // For the purpose of calculating the cell width, we assume that all lines
            // have the same thickness. The difference between normal and bounding line
            // width is added to the *OUTSIDE* of the board (see GridLayerDelegate).
            var numberOfPointsAvailableForCells =
                this.boardSideLength
                - (numberOfCoordinateLabelStripsPerAxis * this.coordinateLabelStripWidth)
                - (newBoardSize * this.normalLineWidth);
            console.assert(numberOfPointsAvailableForCells >= 0);
            if (numberOfPointsAvailableForCells < 0)
                throw new Error("Negative value for numberOfPointsAvailableForCells: " + numberOfPointsAvailableForCells);

            this.numberOfCells = newBoardSize - 1;
            // +1 to this.numberOfCells because we need one-half of a cell on both sides
            // of the board (top/bottom or left/right) to draw, for instance, a stone
            this.cellWidth = Math.floor(numberOfPointsAvailableForCells / (this.numberOfCells + 1));

            this.pointDistance = this.cellWidth + this.normalLineWidth;
            this.stoneRadius = Math.floor(this.cellWidth / 2 * this.stoneRadiusPercentage);
            var pointsUsedForGridLines =
                (newBoardSize - 2) * this.normalLineWidth
                + 2 * this.boundingLineWidth;
            this.lineLength = pointsUsedForGridLines + this.cellWidth * this.numberOfCells;


            // Calculate topLeftPointOffset so that the grid is centered. -1 to
            // newBoardSize because our goal is to get the coordinates of the top-left
            // point, which sits in the middle of a normal line. Because the centering
            // calculation divides by 2 we must subtract a full line width here, not
            // just half a line width.
            var widthForCentering = this.cellWidth * this.numberOfCells + (newBoardSize - 1) * this.normalLineWidth;
            var topLeftPointOffset = Math.floor(
                (this.boardSideLength
                    - (numberOfCoordinateLabelStripsPerAxis * this.coordinateLabelStripWidth)
                    - widthForCentering)
                / 2);
            topLeftPointOffset += this.coordinateLabelStripWidth;
            if (topLeftPointOffset < this.cellWidth / 2.0)
                console.error("Insufficient space to draw stones: topLeftPointOffset is below half-cell width: " + topLeftPointOffset);
            this.topLeftPointX = this.topLeftBoardCornerX + topLeftPointOffset;
            this.topLeftPointY = this.topLeftBoardCornerY + topLeftPointOffset;
            this.bottomRightPointX = this.topLeftPointX + (newBoardSize - 1) * this.pointDistance;
            this.bottomRightPointY = this.topLeftPointY + (newBoardSize - 1) * this.pointDistance;

            // Calculate this.pointCellSize. See property documentation for details
            // what we calculate here.
            var pointCellSideLength = this.cellWidth + this.normalLineWidth;
            this.pointCellSize = CGSizeMake(pointCellSideLength, pointCellSideLength);

            // Geometry tells us that for the square with side length "a":
            //   a = r * sqrt(2)
            var stoneInnerSquareSideLength = Math.floor(this.stoneRadius * Math.sqrt(2));
            // Subtract an additional 1-2 points because we don't want to touch the
            // stone border. The square side length must be an odd number to prevent
            // anti-aliasing when the square is drawn (we assume that drawing occurs
            // with boardViewModel.normalLineWidth and that the line width is an odd
            // number (typically 1 point)).
            --stoneInnerSquareSideLength;
            if (stoneInnerSquareSideLength % 2 === 0)
                --stoneInnerSquareSideLength;
            this.stoneInnerSquareSize = CGSizeMake(stoneInnerSquareSideLength, stoneInnerSquareSideLength);

            // Schema depicting the horizontal bounding line at the top of the board:
            //
            //       +----------->  +------------------------- startB
            //       |              |
            //       |              |
            //       |              |
            // widthB|              | ------------------------ strokeB
            //       |              |
            //       |        +-->  |   +--------------------- startN
            //       |  widthN|     |   | -------------------- strokeN
            //       +----->  +-->  +-- +---------------------
            //
            // widthN = width normal line
            // widthB = width bounding line
            // startN = start coordinate for normal line
            // startB = start coordinate for bounding line
            // strokeN = stroke coordinate for normal line, also this.topLeftPointY
            // strokeB = stroke coordinate for bounding line
            //
            // Notice how the lower edge of the bounding line is flush with the lower
            // edge of the normal line (it were drawn here). The calculation for
            // strokeB goes like this:
            //       strokeB = strokeN + widthN/2 - widthB/2
            //
            // Based on this, the calculation for startB looks like this:
            //       startB = strokeB - widthB / 2
            var normalLineStrokeCoordinate = this.topLeftPointY;
            var normalLineHalfWidth = this.normalLineWidth / 2.0;
            var boundingLineHalfWidth = this.boundingLineWidth / 2.0;
            var boundingLineStrokeCoordinate = normalLineStrokeCoordinate + normalLineHalfWidth - boundingLineHalfWidth;
            this.boundingLineStrokeOffset = normalLineStrokeCoordinate - boundingLineStrokeCoordinate;
            var boundingLineStartCoordinate = boundingLineStrokeCoordinate - boundingLineHalfWidth;
            this.lineStartOffset = normalLineStrokeCoordinate - boundingLineStartCoordinate;

            // TODO: Implement as soon as we display coordinate labels
            var success = false;
            //var success = this.moveNumberFontRange.queryForWidth(
            //    this.stoneInnerSquareSize.width,
            //    &_moveNumberFont,
            //    &_moveNumberMaximumSize);
            if (success)
            {
                // We tone down the coordinate label font because it looks very bad if
                // coordinate label become much larger than move numbers.
                var maximumCoordinateLabelFontSize = floorf(this.moveNumberFont.pointSize / coordinateLabelStripWidthFactor);
                if (this.coordinateLabelFont.pointSize > maximumCoordinateLabelFontSize)
                {
                    // TODO: Implement as soon as we display coordinate labels
                    this.coordinateLabelFont = null;
                    //this.coordinateLabelFont = [this.coordinateLabelFont fontWithSize:maximumCoordinateLabelFontSize];
                }
            }
            else
            {
                this.moveNumberFont = null;
                this.moveNumberMaximumSize = CGSizeZero;
            }

            // TODO: Implement as soon as we display coordinate labels
            success = false;
            //success = this.nextMoveLabelFontRange.queryForWidth(
            //    this.stoneInnerSquareSize.width,
            //    &_nextMoveLabelFont,
            //    &_nextMoveLabelMaximumSize);
            if (! success)
            {
                this.nextMoveLabelFont = null;
                this.nextMoveLabelMaximumSize = CGSizeZero;
            }

            this.lineRectangles = this.calculateLineRectanglesWithBoardSize(newBoardSize);
        }  // else [if (BOARDSIZE_UNDEFINED === newBoardSize || CGSizeEqualToSize(newCanvasSize, CGSizeZero))]
    };

    // Returns view coordinates that correspond to the intersection
    // @a goPoint on a board with size @a boardSize.
    //
    // The origin of the coordinate system is assumed to be in the top-left corner.
    //
    // If @a boardSize is undefined, then this method uses this.boardSize instead.
    // This is the behaviour that is normally desired. However, specifying a
    // board size is useful when this.boardSize does not (yet) have its correct value.
    // This is specifically the case while
    // updateWithCanvasSizeBoardSizeDisplayCoordinates() is still running.
    BoardViewMetrics.prototype.getCoordinatesFromGoPoint = function(goPoint, boardSize)
    {
        if (boardSize === undefined)
            boardSize = this.boardSize;

        return CGPointMake(
            this.topLeftPointX + (this.pointDistance * (goPoint.goVertex.x - 1)),
            this.topLeftPointY + (this.pointDistance * (boardSize - goPoint.goVertex.y)));
    };

    // Returns a GoPoint object for the intersection identified by the view
    // coordinates @a coordinates.
    //
    // Returns null if @a coordinates do not refer to a valid intersection (e.g.
    // because @a coordinates are outside the board's edges).
    //
    // The origin of the coordinate system is assumed to be in the top-left corner.
    BoardViewMetrics.prototype.getPointFromCoordinates = function(coordinates)
    {
        var x = 1 + (coordinates.x - this.topLeftPointX) / this.pointDistance;
        var y = this.boardSize - (coordinates.y - this.topLeftPointY) / this.pointDistance;
        var goVertex = new GoVertex(x, y);
        return this.goGame.goBoard.getPointAtVertex(goVertex);
    };

    // Returns a BoardViewIntersection object for the intersection that is
    // closest to the view coordinates @a coordinates. Returns
    // BoardViewIntersectionNull if there is no "closest" intersection.
    //
    // Determining "closest" works like this:
    // - The closest intersection is the one whose distance to @a coordinates is
    //   less than half the distance between two adjacent intersections
    //   - During panning this creates a "snap-to" effect when the user's panning
    //     fingertip crosses half the distance between two adjacent intersections.
    //   - For a tap this simply makes sure that the fingertip does not have to
    //     hit the exact coordinate of the intersection.
    // - If @a coordinates are a sufficient distance away from the Go board edges,
    //   there is no "closest" intersection
    BoardViewMetrics.prototype.getIntersectionNearCoordinates = function(coordinates)
    {
        var halfPointDistance = Math.floor(this.pointDistance / 2);
        var coordinatesOutOfRange = false;

        // Check if coordinates are outside the grid on the x-axis and cannot be
        // mapped to a point. To make the edge lines accessible in the same way as
        // the inner lines, a padding of half a point distance must be added.
        if (coordinates.x < this.topLeftPointX)
        {
            if (coordinates.x < this.topLeftPointX - halfPointDistance)
                coordinatesOutOfRange = true;
            else
                coordinates.x = this.topLeftPointX;
        }
        else if (coordinates.x > this.bottomRightPointX)
        {
            if (coordinates.x > this.bottomRightPointX + halfPointDistance)
                coordinatesOutOfRange = true;
            else
                coordinates.x = this.bottomRightPointX;
        }
        else
        {
            // Adjust so that the snap-to calculation below switches to the next vertex
            // when the coordinates are half-way through the distance to that vertex
            coordinates.x += halfPointDistance;
        }

        // Unless the x-axis checks have already found the coordinates to be out of
        // range, we now perform the same checks as above on the y-axis
        if (coordinatesOutOfRange)
        {
            // Coordinates are already out of range, no more checks necessary
        }
        else if (coordinates.y < this.topLeftPointY)
        {
            if (coordinates.y < this.topLeftPointY - halfPointDistance)
                coordinatesOutOfRange = true;
            else
                coordinates.y = this.topLeftPointY;
        }
        else if (coordinates.y > this.bottomRightPointY)
        {
            if (coordinates.y > this.bottomRightPointY + halfPointDistance)
                coordinatesOutOfRange = true;
            else
                coordinates.y = this.bottomRightPointY;
        }
        else
        {
            coordinates.y += halfPointDistance;
        }

        // Snap to the nearest vertex, unless the coordinates were out of range
        if (coordinatesOutOfRange)
            return BoardViewIntersectionNull;
        else
        {
            coordinates.x =
                this.topLeftPointX
                + this.pointDistance * Math.floor((coordinates.x - this.topLeftPointX) / this.pointDistance);
            coordinates.y =
                this.topLeftPointY
                + this.pointDistance * Math.floor((coordinates.y - this.topLeftPointY) / this.pointDistance);
            var pointAtCoordinates = this.getPointFromCoordinates(coordinates);
            if (pointAtCoordinates !== null)
            {
                return BoardViewIntersectionMake(pointAtCoordinates, coordinates);
            }
            else
            {
                console.error("Snap-to calculation failed");
                return BoardViewIntersectionNull;
            }
        }
    };

    // TODO Implement or remove
    // Responds to the #goGameDidCreate notification.
    //BoardViewMetrics.prototype.goGameDidCreate = function(notification)
    //{
    //    GoGame* newGame = [notification object];
    //    this.updateWithBoardSize:newGame.board.size];
    //};

    // Calculates a list of rectangles that together make up all grid lines
    // on the board.
    //
    // This is a private helper for
    // updateWithCanvasSizeBoardSizeDisplayCoordinates:(). The implementation of
    // this helper must not use any of the main properties (this.baseSize,
    // this.absoluteZoomScale, this.canvasSize, this.boardSize or
    // this.displayCoordinates) for its calculations because these properties do
    // not yet have the correct values.
    BoardViewMetrics.prototype.calculateLineRectanglesWithBoardSize = function(newBoardSize)
    {
        var lineRectangles = [];
        var topLeftPoint = this.goGame.goBoard.getPointAtCorner(GOBOARDCORNER_TOPLEFT);

        for (var lineDirection = 0; lineDirection < 2; ++lineDirection)
        {
            var isHorizontalLine = (0 === lineDirection) ? true : false;
            var previousPoint = null;
            var currentPoint = topLeftPoint;
            while (currentPoint)
            {
                var nextPoint;
                if (isHorizontalLine)
                    nextPoint = currentPoint.getBelow();
                else
                    nextPoint = currentPoint.getRight();

                var pointCoordinates = this.getCoordinatesFromGoPoint(currentPoint, newBoardSize);

                var lineWidth;
                var isBoundingLine = (null == previousPoint || null == nextPoint);
                if (isBoundingLine)
                    lineWidth = this.boundingLineWidth;
                else
                    lineWidth = this.normalLineWidth;
                var lineHalfWidth = lineWidth / 2.0;

                var goVertex = currentPoint.goVertex;
                var lineIndexCountingFromTopLeft;
                if (isHorizontalLine)
                    lineIndexCountingFromTopLeft = newBoardSize - goVertex.y;
                else
                    lineIndexCountingFromTopLeft = goVertex.x - 1;
                var isBoundingLineLeftOrTop = (0 == lineIndexCountingFromTopLeft);
                var isBoundingLineRightOrBottom = ((newBoardSize - 1) == lineIndexCountingFromTopLeft);

                var lineRect = CGRectMake(CGPointZero, CGSizeZero);
                if (isHorizontalLine)
                {
                    // 1. Determine the rectangle size. Everything below this deals with
                    // the rectangle origin.
                    lineRect.size = CGSizeMake(this.lineLength, lineWidth);
                    // 2. Place line so that its upper-left corner is at the y-position of
                    // the specified intersection
                    lineRect.origin.x = this.topLeftPointX;
                    lineRect.origin.y = pointCoordinates.y;
                    // 3. Place line so that it straddles the y-position of the specified
                    // intersection
                    lineRect.origin.y -= lineHalfWidth;
                    // 4. If it's a bounding line, adjust the line position so that its edge
                    // is in the same position as if a normal line were drawn. The surplus
                    // width lies outside of the board. As a result, all cells inside the
                    // board have the same size.
                    if (isBoundingLineLeftOrTop)
                        lineRect.origin.y -= this.boundingLineStrokeOffset;
                    else if (isBoundingLineRightOrBottom)
                        lineRect.origin.y += this.boundingLineStrokeOffset;
                    // 5. Adjust horizontal line position so that it starts at the left edge
                    // of the left bounding line
                    lineRect.origin.x -= this.lineStartOffset;
                }
                else
                {
                    // The if-branch above that deals with horizontal lines has more
                    // detailed comments.

                    // 1. Rectangle size
                    lineRect.size = CGSizeMake(lineWidth, this.lineLength);
                    // 2. Initial rectangle origin
                    lineRect.origin.x = pointCoordinates.x;
                    lineRect.origin.y = this.topLeftPointY;
                    // 3. Straddle intersection
                    lineRect.origin.x -= lineHalfWidth;
                    // 4. Position bounding lines
                    if (isBoundingLineLeftOrTop)
                        lineRect.origin.x -= this.boundingLineStrokeOffset;
                    else if (isBoundingLineRightOrBottom)
                        lineRect.origin.x += this.boundingLineStrokeOffset;
                    // 5. Adjust vertical line position
                    lineRect.origin.y -= this.lineStartOffset;
                }

                lineRectangles.push(lineRect);

                previousPoint = currentPoint;
                currentPoint = nextPoint;
            }
        }

        return lineRectangles;
    };

    return BoardViewMetrics;
})();


// ----------------------------------------------------------------------
// Compatibility classes and functions that emulate iOS' CoreGraphics
// structs and functions. We need these so that we can reuse a lot of the
// drawing code from the Little Go iOS project.
// ----------------------------------------------------------------------
function CGSize(width, height)
{
    this.width = width;
    this.height = height;
    this.toString = function() { return "width = " + this.width + ", height = " + this.height; };
}

function CGSizeMake(width, height)
{
    return new CGSize(width, height);
}

const CGSizeZero = CGSizeMake(0, 0);

function CGSizeEqualToSize(size1, size2)
{
    // Use ==, not ===, because some of the drawing code operates with
    // integers and some operates with floats
    return (size1.width == size2.width && size1.height == size2.height);
}


function CGPoint(x, y)
{
    this.x = x;
    this.y = y;
    this.toString = function() { return "x = " + this.x + ", y = " + this.y; };
}

function CGPointMake(x, y)
{
    return new CGPoint(x, y);
}

const CGPointZero = CGPointMake(0, 0);

function CGPointEqualToPoint(point1, point2)
{
    // Use ==, not ===, because some of the drawing code operates with
    // integers and some operates with floats
    return (point1.x == point2.x && point1.y == point2.y);
}


function CGRect(origin, size)
{
    // Make copies of the incoming CGPoint and CGSize objects! If we don't
    // make copies and the caller modifies the CGRect that we return, the
    // modifications will be made to the original CGPoint and CGSize objects.
    this.origin = CGPointMake(origin.x, origin.y);
    this.size = CGSizeMake(size.width, size.height);
    this.toString = function()
    {
        return "x = " + this.origin.x
            + ", y = " + this.origin.y
            + ", width = " + this.size.width
            + ", height = " + this.size.height;
    };
}

function CGRectMake(origin, size)
{
    return new CGRect(origin, size);
}

const CGRectZero = CGRectMake(CGPointZero, CGSizeZero);

function CGRectGetMidX(rect)
{
    return rect.origin.x + (rect.size.width / 2.0);
}

function CGRectGetMidY(rect)
{
    return rect.origin.y + (rect.size.height / 2.0);
}

function BoardViewIntersection(goPoint, coordinates)
{
    // Don't make a copy! The GoPoint object must remain tied to its
    // GoBoard object.
    this.goPoint = goPoint;
    // Make a copy. For an explanation read the comments in CGRectMake().
    this.coordinates = CGPointMake(coordinates.x, coordinates.y);
    this.toString = function()
    {
        return "vertex = " + this.goPoint.goVertex
            + ", x = " + this.coordinates.x
            + ", y = " + this.coordinates.y;
    };
}

function BoardViewIntersectionMake(goPoint, coordinates)
{
    return new BoardViewIntersection(goPoint, coordinates);
}

const BoardViewIntersectionNull = BoardViewIntersectionMake(null, CGPointZero);

function BoardViewIntersectionEqualToIntersection(intersection1, intersection2)
{
    if (intersection1.goPoint === null && intersection2.goPoint === null)
    {
        return CGPointEqualToPoint(intersection1.coordinates, intersection2.coordinates);
    }
    else if (intersection1.goPoint === null && intersection2.goPoint !== null ||
        intersection1.goPoint !== null && intersection2.goPoint === null)
    {
        return false;
    }
    else
    {
        if (intersection1.goPoint.goVertex.x !== intersection2.goPoint.goVertex.x)
            return false;
        else if (intersection1.goPoint.goVertex.y !== intersection2.goPoint.goVertex.y)
            return false;
        else
            return CGPointEqualToPoint(intersection1.coordinates, intersection2.coordinates);
    }
}

function BoardViewIntersectionIsNullIntersection(intersection)
{
    return BoardViewIntersectionEqualToIntersection(intersection, BoardViewIntersectionNull);
}
