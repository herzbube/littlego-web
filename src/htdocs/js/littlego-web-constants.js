// ----------------------------------------------------------------------
// This file contains constants.
// ----------------------------------------------------------------------

const BOARDSIZE_7 = 7;
const BOARDSIZE_9 = 9;
const BOARDSIZE_11 = 11;
const BOARDSIZE_13 = 13;
const BOARDSIZE_15 = 15;
const BOARDSIZE_17 = 17;
const BOARDSIZE_19 = 19;
const BOARDSIZE_SMALLEST = BOARDSIZE_7;

const COLOR_NONE = -1;
const COLOR_BLACK = 0;
const COLOR_WHITE = 1;

const KORULE_SIMPLE_KO = 0;
const KORULE_POSITIONAL_SUPERKO = 1;
const KORULE_SITUATIONAL_SUPERKO = 2;

const SCORINGSYSTEM_AREA_SCORING = 0;
const SCORINGSYSTEM_TERRITORY_SCORING = 1;

// The possible directions one can take to get from one GoPoint to another
// neighbouring GoPoint.
const GOBOARD_DIRECTION_LEFT = 0;
const GOBOARD_DIRECTION_RIGHT = 1;
const GOBOARD_DIRECTION_UP = 2;
const GOBOARD_DIRECTION_DOWN = 3;
// Used for iterating all GoPoints. The first point is always A1, on a
// 19x19 board the last point is T19.
const GOBOARD_DIRECTION_NEXT = 4;
// Same as GOBOARD_DIRECTION_NEXT, but for iterating backwards.
const GOBOARD_DIRECTION_PREVIOUS = 5;

const GOMOVE_TYPE_PLAY = 0;
const GOMOVE_TYPE_PASS = 0;

const DEFAULT_BOARDSIZE = BOARDSIZE_19;
const DEFAULT_STONECOLOR = COLOR_BLACK;
const DEFAULT_HANDICAP = 0;
const DEFAULT_KOMI = 7.5;  // default for area scoring and no handicap
const DEFAULT_KORULE = KORULE_SIMPLE_KO;
const DEFAULT_SCORINGSYSTEM = SCORINGSYSTEM_AREA_SCORING;

const GAMEREQUEST_DONTCARE = -1;

const SCORE_NONE = -1;

const MILLISECONDS_1_SECOND = 1000;
const MILLISECONDS_1_MINUTE = 60000;
const MILLISECONDS_HALF_HOUR = 1800000;
const MILLISECONDS_1_HOUR = 3600000;
const MILLISECONDS_1_DAY = 86400000;

// Some timespans to generate fake start dates
const STARTDATE_LESS_THAN_1_HOUR_AGO = 0;
const STARTDATE_3_HOURS_AGO = 1;
const STARTDATE_1_DAY_AGO = 2;
const STARTDATE_7_DAYS_AGO = 3;

const NUMBER_OF_COLUMNS_GAME_REQUEST_TABLE = 9;
const NUMBER_OF_COLUMNS_GAMES_IN_PROGRESS_TABLE = 11;
const NUMBER_OF_COLUMNS_FINISHED_GAMES_TABLE = 10;
const NUMBER_OF_COLUMNS_HIGH_SCORE_TABLE = 11;

const OPERATION_TYPE_GAME_REQUEST_RESUME = 0;
const OPERATION_TYPE_GAME_REQUEST_CANCEL = 1;
const OPERATION_TYPE_GAME_IN_PROGRESS_RESUME = 10;
const OPERATION_TYPE_GAME_IN_PROGRESS_RESIGN = 11;
const OPERATION_TYPE_FINISHED_GAME_VIEW = 20;
const OPERATION_TYPE_FINISHED_GAME_EMAIL_RESULT = 21;
const OPERATION_TYPE_FINISHED_GAME_DELETE = 22;

const ACTION_TYPE_PRIMARY = 0;
const ACTION_TYPE_SECONDARY = 1;
const ACTION_TYPE_SUCCESS = 2;
const ACTION_TYPE_DANGER = 3;

// ----------------------------------------------------------------------
// Application IDs
// ----------------------------------------------------------------------
const PREFIX_ID_CONTAINER = "container-";
const PREFIX_ID_BUTTON = "button-";

const TAB_NAME_GAME_REQUESTS = "game-requests";
const TAB_NAME_GAMES_IN_PROGRESS = "games-in-progress";
const TAB_NAME_FINISHED_GAMES = "finished-games";
const TAB_NAME_HIGH_SCORES = "high-scores";

// Login form
const ID_CONTAINER_LOGIN_FORM = PREFIX_ID_CONTAINER + "login-form";
const ID_LOGIN_FORM = "login-form";
const ID_INPUT_EMAIL_ADDRESS = "email-address";
const ID_INPUT_PASSWORD = "password";

// Main app
const ID_CONTAINER_MAIN_APP = PREFIX_ID_CONTAINER + "main-app";
const ID_CONTAINER_GAME_REQUESTS = PREFIX_ID_CONTAINER + TAB_NAME_GAME_REQUESTS;
const ID_CONTAINER_GAMES_IN_PROGRESS = PREFIX_ID_CONTAINER + TAB_NAME_GAMES_IN_PROGRESS;
const ID_CONTAINER_FINISHED_GAMES = PREFIX_ID_CONTAINER + TAB_NAME_FINISHED_GAMES;
const ID_CONTAINER_HIGH_SCORES = PREFIX_ID_CONTAINER + TAB_NAME_HIGH_SCORES;
const ID_CONTAINER_PLAY = PREFIX_ID_CONTAINER + "play";
const ID_CONTAINER_BOARD = PREFIX_ID_CONTAINER + "board";

// Navigation
const ID_BUTTON_GAME_REQUESTS = PREFIX_ID_BUTTON + TAB_NAME_GAME_REQUESTS;
const ID_BUTTON_GAMES_IN_PROGRESS = PREFIX_ID_BUTTON + TAB_NAME_GAMES_IN_PROGRESS;
const ID_BUTTON_FINISHED_GAMES = PREFIX_ID_BUTTON + TAB_NAME_FINISHED_GAMES;
const ID_BUTTON_HGIH_SCORES = PREFIX_ID_BUTTON + TAB_NAME_HIGH_SCORES ;
const ID_BUTTON_LOGOUT = PREFIX_ID_BUTTON + "logout";

// Modals
const ID_MODAL_NOT_YET_IMPLEMENTED = "notYetImplemented";

// ----------------------------------------------------------------------
// Application classes
// ----------------------------------------------------------------------
const CLASS_DATA_RETRIEVAL_PLACEHOLDER = "data-retrieval-placeholder";

// ----------------------------------------------------------------------
// Bootstrap classes, attributes and values
// ----------------------------------------------------------------------
const BOOTSTRAP_CLASS_NAV_ITEM = "nav-item";
const BOOTSTRAP_CLASS_ACTIVE = "active";
const BOOTSTRAP_CLASS_BUTTON = "btn";
const BOOTSTRAP_CLASS_BUTTON_SMALL = "btn-sm";
const BOOTSTRAP_CLASS_BUTTON_BLOCKLEVEL = "btn-block";
const BOOTSTRAP_CLASS_BUTTON_PRIMARY = "btn-outline-primary";
const BOOTSTRAP_CLASS_BUTTON_SECONDARY = "btn-outline-secondary";
const BOOTSTRAP_CLASS_BUTTON_SUCCESS = "btn-outline-success";
const BOOTSTRAP_CLASS_BUTTON_DANGER = "btn-outline-danger";

const BOOTSTRAP_ATTRIBUTE_DATA_TOGGLE = "data-toggle";
const BOOTSTRAP_ATTRIBUTE_DATA_TARGET = "data-target";

const BOOTSTRAP_ATTRIBUTE_VALUE_MODAL = "modal";
