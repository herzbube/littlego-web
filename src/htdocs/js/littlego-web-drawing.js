// ----------------------------------------------------------------------
// This file contains the code that draws the Go board.
//
// TODO: The current code draws a simplified, static board that always
// looks the same. This is meant for an early proof-of-concept stage only!
//
// TODO: Place the code in this file into a class.
//
// TODO: Add BoardViewMetrics class that provides numbers for the drawing
// code.
// ----------------------------------------------------------------------

// Drawing constants

const BOARD_SIZE = 19;
const NUMBER_OF_CELLS = BOARD_SIZE - 1;
const BOARD_PADDING = 10;
// Line widths remain always the same, regardless of the canvas size.
// Bounding line must be thicker than the normal line. Normal line
// should be a very thin, crisp line.
const STROKE_WIDTH_BOUNDING_GRID_LINE = 2;
const STROKE_WIDTH_NORMAL_GRID_LINE = 0.5;  // half-value because of anti-aliasing
const STROKE_WIDTH_LAST_MOVE_SYMBOL = 0.5;  // half-value because of anti-aliasing
// Remaining values are percentages
const RADIUS_STARPOINT_CELL_PERCENTAGE = 7;
const RADIUS_STONE_CELL_PERCENTAGE = 30;
const DIMENSION_LAST_MOVE_SYMBOL_PERCENTAGE = 30;
const STROKE_COLOR_GRID_LINE = "black";
// TODO: Is not fixed, depends on what the stone is that we draw onto
const STROKE_COLOR_LAST_MOVE_SYMBOL = "black";
const FILL_COLOR_STAR_POINT = "black";
const FILL_COLOR_BLACK_STONE = "black";
const FILL_COLOR_WHITE_STONE = "white";


// This is the main function that triggers drawing the Go board. The parameter
// must be a jQuery object that represents a container element inside which
// this function can freely create any elements required for drawing the board.
//
// This function obtains the size of the canvas on which it can draw from the
// size of the container element's displayed content. For this to work, the
// container element must be visible, i.e. it's "display" property must not be
// "none", when this function is invoked.
function drawGoBoard(jQueryObjectContainerCanvas)
{
    eraseCurrentGoBoard(jQueryObjectContainerCanvas);

    var paper = createPaper(jQueryObjectContainerCanvas);

    // The order in which layers are drawn is important! Later layers are
    // drawn on top of earlier layers.
    drawGridLayer(paper);
    drawStonesLayer(paper);
    drawSymbolsLayer(paper);
}

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
    paper.canvas.id = "board";

    // For unknown reasons Raphael adds this to the svg element:
    //   style="overflow: hidden; position: relative; top: -0.666626px;"
    // We don't care about the overflow property, but we don't want
    // position and top because we set these in our own CSS.
    //
    // Note that we could also set our own CSS properties to "!important"
    // to override the style on the svg element.
    paper.canvas.removeAttribute("style");

    return paper;
}

// Draws the line grid and the star points.
function drawGridLayer(paper)
{
    var cellDimension = calculateCellDimension(paper);
    var lineLength = cellDimension * NUMBER_OF_CELLS;

    for (var indexOfLine = 0; indexOfLine < BOARD_SIZE; indexOfLine++)
    {
        var horizontalX = BOARD_PADDING;
        var horizontalY = BOARD_PADDING + indexOfLine * cellDimension;

        var verticalX = horizontalY;
        var verticalY = horizontalX;

        var strokeWidth;
        if (indexOfLine === 0 || indexOfLine === (BOARD_SIZE - 1))
            strokeWidth = STROKE_WIDTH_BOUNDING_GRID_LINE;
        else
            strokeWidth = STROKE_WIDTH_NORMAL_GRID_LINE;

        // Alas, Raphael does not seem to support drawing lines with <line>,
        // instead we have to use the more complex path syntax.
        // M = Move to
        // L = Line to
        var horizontalLinePath = paper.path(["M", horizontalX, horizontalY, "L", horizontalX + lineLength, horizontalY]);
        horizontalLinePath.attr("stroke", STROKE_COLOR_GRID_LINE);
        horizontalLinePath.attr("stroke-width", strokeWidth);
        var verticalLinePath = paper.path(["M", verticalX, verticalY, "L", verticalX, verticalY + lineLength]);
        verticalLinePath.attr("stroke", STROKE_COLOR_GRID_LINE);
        verticalLinePath.attr("stroke-width", strokeWidth);
    }


    var starPointRadius = Math.floor(RADIUS_STARPOINT_CELL_PERCENTAGE * cellDimension / 100);

    // These are the vertexes:
    //   ["D4", "K4", "Q4", "D10", "K10", "Q10", "D16", "K16", "Q16"]
    // In the following array we convert them to numeric vertexes (1-based)
    var starPoints = [
        [4, 4],
        [10, 4],
        [16, 4],
        [4, 10],
        [10, 10],
        [16, 10],
        [4, 16],
        [10, 16],
        [16, 16],
    ];
    drawCircles(starPoints, starPointRadius, FILL_COLOR_STAR_POINT, cellDimension, paper);
}

// Draws the black and white stones
function drawStonesLayer(paper)
{
    var cellDimension = calculateCellDimension(paper);
    var stoneRadius = Math.floor(RADIUS_STONE_CELL_PERCENTAGE * cellDimension / 100);

    // Same concept as for star points in drawGridLayer()
    var blackStones = [
        [3, 4],
        [4, 3],
        [10, 3],
    ];
    drawCircles(blackStones, stoneRadius, FILL_COLOR_BLACK_STONE, cellDimension, paper);

    var whiteStones = [
        [16, 3],
        [17, 4],
        [17, 10],
    ];
    drawCircles(whiteStones, stoneRadius, FILL_COLOR_WHITE_STONE, cellDimension, paper);
}

// Draws the symbols (e.g. last move, move numbers)
function drawSymbolsLayer(paper)
{
    var cellDimension = calculateCellDimension(paper);
    var dimensionNextMoveSymbol = Math.floor(DIMENSION_LAST_MOVE_SYMBOL_PERCENTAGE * cellDimension / 100);

    var lastMoveSymbolVertexX = 17;
    var lastMoveSymbolVertexY = 10;

    var indexOfLineVertical = lastMoveSymbolVertexX - 1;
    var indexOfLineHorizontal = lastMoveSymbolVertexY - 1;

    var lastMoveSymbolCenterX = BOARD_PADDING + indexOfLineVertical * cellDimension;
    var lastMoveSymbolCenterY = BOARD_PADDING + indexOfLineHorizontal * cellDimension;

    var lastMoveSymbolX = lastMoveSymbolCenterX - Math.floor(dimensionNextMoveSymbol / 2);
    var lastMoveSymbolY = lastMoveSymbolCenterY - Math.floor(dimensionNextMoveSymbol / 2);
    var lastMoveSymbolWidth = dimensionNextMoveSymbol;
    var lastMoveSymbolHeight = dimensionNextMoveSymbol;

    var lastMoveSymbolSvg = paper.rect(lastMoveSymbolX, lastMoveSymbolY, lastMoveSymbolWidth, lastMoveSymbolHeight);
    verticalLinePath.attr("stroke", STROKE_COLOR_LAST_MOVE_SYMBOL);
    verticalLinePath.attr("stroke-width", STROKE_WIDTH_LAST_MOVE_SYMBOL);
}

function calculateCellDimension(paper)
{
    var canvasWidth = paper.width;

    var numberOfCells = BOARD_SIZE;
    var totalAvailableWidthToAllCells = canvasWidth - BOARD_PADDING;
    // Flooring wastes space because cellWidth * numberOfCells
    // does not add up again to totalAvailableWidthToAllCells.
    // Currently the difference is wasted space because our
    // callers do not know anything about this, they simply
    // start drawing from the upper-left corner. The result:
    // The board is not centered!
    var cellWidth = Math.floor(totalAvailableWidthToAllCells / numberOfCells);

    return cellWidth;
}

function drawCircles(positions, radius, fillColor, cellDimension, paper)
{
    positions.forEach(function(position) {
        var indexOfLineVertical = position[0] - 1;
        var indexOfLineHorizontal = position[1] - 1;

        var centerX = BOARD_PADDING + indexOfLineVertical * cellDimension;
        var centerY = BOARD_PADDING + indexOfLineHorizontal * cellDimension;

        var circleSvg = paper.circle(centerX, centerY, radius)
        circleSvg.attr("fill", fillColor);
        // TODO: Remove stroke-width entirely - we don't need it, but
        // Raphael adds stroke-width != 0 for us.
        circleSvg.attr("stroke-width", "0");
    })
}