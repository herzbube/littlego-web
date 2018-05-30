// ----------------------------------------------------------------------
// This file contains constants.
// ----------------------------------------------------------------------

const ANGULARNAME_CONSTANT_WEBSOCKETCONFIG = "webSocketConfig";
const ANGULARNAME_CONSTANT_URLBASEPATH = "urlBasePath";
const ANGULARNAME_SERVICE_WEBSOCKET = "WebSocketService";
const ANGULARNAME_SERVICE_SESSION = "SessionService";
const ANGULARNAME_SERVICE_ERRORHANDLING = "ErrorHandlingService";
const ANGULARNAME_SERVICE_DRAWING = "DrawingService";
const ANGULARNAME_EVENT_SHOWCONFIRMGAMEREQUESTPAIRINGMODAL = "showConfirmGameRequestPairingModal";
const ANGULARNAME_EVENT_SHOWCONFIRMGAMERESIGNMODAL = "showConfirmGameResignModal";
const ANGULARNAME_EVENT_SHOWCONFIRMACCEPTSCOREPROPOSALMODAL = "showConfirmAcceptScoreProposalModal";

const STORAGEKEY_SESSIONKEY = "sessionKey";

const GAME_STATE_INPROGRESS_PLAYING = 0;
const GAME_STATE_INPROGRESS_SCORING = 1;
const GAME_STATE_FINISHED = 2;

const BOARDSIZE_7 = 7;
const BOARDSIZE_9 = 9;
const BOARDSIZE_11 = 11;
const BOARDSIZE_13 = 13;
const BOARDSIZE_15 = 15;
const BOARDSIZE_17 = 17;
const BOARDSIZE_19 = 19;
const BOARDSIZES_ARRAY = [ BOARDSIZE_7, BOARDSIZE_9, BOARDSIZE_11, BOARDSIZE_13, BOARDSIZE_15, BOARDSIZE_17, BOARDSIZE_19 ];
const BOARDSIZE_SMALLEST = BOARDSIZE_7;
const BOARDSIZE_UNDEFINED = -1;

const GOBOARDCORNER_BOTTOMLEFT = 0;   // A1 on all board sizes
const GOBOARDCORNER_BOTTOMRIGHT = 1;  // T1 on a 19x19 board
const GOBOARDCORNER_TOPLEFT = 2;      // A19 on a 19x19 board
const GOBOARDCORNER_TOPRIGHT = 3;     // T19 on a 19x19 board

const COLOR_NONE = -1;
const COLOR_BLACK = 0;
const COLOR_WHITE = 1;
const COLORS_ARRAY = [ COLOR_BLACK, COLOR_WHITE ];

const HANDICAPS_ARRAY = [ 0, 2, 3, 4, 5, 6, 7, 8, 9 ];
const KOMIS_ARRAY = [ 0.0, 0.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0 ];

const KORULE_SIMPLE_KO = 0;
const KORULE_POSITIONAL_SUPERKO = 1;
const KORULE_SITUATIONAL_SUPERKO = 2;
const KORULES_ARRAY = [ KORULE_SIMPLE_KO, KORULE_POSITIONAL_SUPERKO, KORULE_SITUATIONAL_SUPERKO ];

const SCORINGSYSTEM_AREA_SCORING = 0;
const SCORINGSYSTEM_TERRITORY_SCORING = 1;
const SCORINGSYSTEMS_ARRAY = [ SCORINGSYSTEM_AREA_SCORING, SCORINGSYSTEM_TERRITORY_SCORING ];

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
const GOMOVE_TYPE_PASS = 1;

const GOMOVEISILLEGALREASON_INTERSECTIONOCCUPIED = 0;
const GOMOVEISILLEGALREASON_SUICIDE = 1;
const GOMOVEISILLEGALREASON_SIMPLEKO = 2;
const GOMOVEISILLEGALREASON_SUPERKO = 3;
const GOMOVEISILLEGALREASON_UNDEFINED = -1;

// The states that a stone group can have during scoring
const STONEGROUPSTATE_ALIVE = 0;
const STONEGROUPSTATE_DEAD = 1;
const STONEGROUPSTATE_SEKI = 2;
const STONEGROUPSTATE_UNDEFINED = -1;

// The modes that the user can choose to mark stone groups during scoring
const SCORINGMARKMODE_DEAD = 0;
const SCORINGMARKMODE_SEKI = 1;

// The possible results of a scoring run
const GAMERESULT_NONE = 0;
const GAMERESULT_BLACKHASWON = 1;
const GAMERESULT_WHITEHASWON = 2;
const GAMERESULT_TIE = 3;

// The possible game results understood by the server
const GAMERESULT_RESULTTYPE_WINBYPOINTS = 0;
const GAMERESULT_RESULTTYPE_WINBYRESIGNATION = 1;
const GAMERESULT_RESULTTYPE_DRAW = 2;

const DEFAULT_BOARDSIZE = BOARDSIZE_19;
const DEFAULT_STONECOLOR = COLOR_BLACK;
const DEFAULT_HANDICAP = 0;
const DEFAULT_KOMI = 7.5;  // default for area scoring and no handicap
const DEFAULT_KORULE = KORULE_SIMPLE_KO;
const DEFAULT_SCORINGSYSTEM = SCORINGSYSTEM_AREA_SCORING;

const GAMEREQUEST_NOPREFERENCE = -1;
const GAMEREQUEST_NOPREFERENCE_TEXT = "No preference";
const GAMEREQUEST_STATE_UNPAIRED = 0;
const GAMEREQUEST_STATE_UNCONFIRMEDPAIRING = 1;
const GAMEREQUEST_STATE_CONFIRMEDPAIRING = 2;

const SCORE_NONE = -1;
const WINNINGPOINTS_UNDEFINED = -1;

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
const NUMBER_OF_COLUMNS_GAME_MOVES_TABLE = 4;

const BADGE_SYMBOL = "!";

const GAMEREQUESTID_UNDEFINED = -1;
const GAMEID_UNDEFINED = -1;

const ANGULARROUTE_PATH_LOGIN = urlBasePath + "/login";
const ANGULARROUTE_PATH_REGISTER = urlBasePath + "/register";
const ANGULARROUTE_PATH_GAMEREQUESTS = urlBasePath + "/gamerequests";
const ANGULARROUTE_PATH_GAMESINPROGRESS = urlBasePath + "/gamesinprogress";
const ANGULARROUTE_PATH_FINISHEDGAMES = urlBasePath + "/finishedgames";
const ANGULARROUTE_PATH_HIGHSCORES = urlBasePath + "/highscores";
const ANGULARROUTE_PATH_LOGOUT = urlBasePath + "/logout";
const ANGULARROUTE_PATH_BOARD = urlBasePath + "/board";
const ANGULARROUTE_PATH_DEFAULT_IF_VALID_SESSION = ANGULARROUTE_PATH_GAMESINPROGRESS;
const LOGOUT_MESSAGE_DELAY_IN_MILLISECONDS = 3 * MILLISECONDS_1_SECOND;

const BOARDVIEW_MODE_INITIALIZING = 0;
const BOARDVIEW_MODE_PLAY = 1;
const BOARDVIEW_MODE_ANALYZE = 2;
const BOARDVIEW_MODE_SCORING = 3;

const BOARDVIEW_DATATYPE_GAMEMOVES = 0;
const BOARDVIEW_DATATYPE_SCORE = 1;

// ----------------------------------------------------------------------
// Drawing constants
// ----------------------------------------------------------------------

// Line widths remain always the same, regardless of the canvas size.
// Bounding line must be thicker than the normal line. Normal line
// should be a very thin, crisp line.
const STROKE_WIDTH_BOUNDING_GRID_LINE = 2;
const STROKE_WIDTH_NORMAL_GRID_LINE = 1;
const STROKE_COLOR_GRID_LINE = "black";
const STROKE_COLOR_BLACK_LAST_MOVE_SYMBOL = "white";
const STROKE_COLOR_WHITE_LAST_MOVE_SYMBOL = "black";
const STROKE_COLOR_DEAD_STONE_SYMBOL = "red";
const STROKE_COLOR_BLACK_SEKI_SYMBOL = "#80c0f0";
const STROKE_COLOR_WHITE_SEKI_SYMBOL = "#60b0e0";
const FILL_COLOR_STAR_POINT = "black";
const FILL_COLOR_BLACK_STONE = "black";
const FILL_COLOR_WHITE_STONE = "white";
const FILL_COLOR_BLACK_TERRITORY = "black";
const FILL_COLOR_WHITE_TERRITORY = "white";
const FILL_COLOR_INCONSISTENT_TERRITORY = "red";
const FILL_COLOR_TOGGLEINDICATOR = "red";
const FILL_OPACITY_STARPOINT = 1.0;
const FILL_OPACITY_STONE = 1.0;
const FILL_OPACITY_NEXTMOVEINDICATOR = 0.6;
const FILL_OPACITY_TOGGLEINDICATOR = 1.0;
const FILL_OPACITY_BLACK_TERRITORY = 0.35;
const FILL_OPACITY_WHITE_TERRITORY = 0.6;
const FILL_OPACITY_INCONSISTENT_TERRITORY = 0.3;

// ----------------------------------------------------------------------
// Application IDs
// ----------------------------------------------------------------------
const PREFIX_ID_CONTAINER = "container-";
const PREFIX_ID_BUTTON = "button-";

const TAB_NAME_GAME_REQUESTS = "game-requests";
const TAB_NAME_GAMES_IN_PROGRESS = "games-in-progress";
const TAB_NAME_FINISHED_GAMES = "finished-games";
const TAB_NAME_HIGH_SCORES = "high-scores";
const TAB_NAME_LOGOUT = "logout";

// Login form
const ID_INPUT_LOGIN_EMAIL_ADDRESS = "login-email-address";

// Registration form
const ID_INPUT_REGISTRATION_EMAIL_ADDRESS = "registration-email-address";

// Main app
const ID_CONTAINER_BOARD = PREFIX_ID_CONTAINER + "board";

// Server error modal
const ID_SERVER_ERROR_MODAL = "server-error-modal";

// New game request modal
const ID_NEW_GAME_REQUEST_MODAL = "new-game-request-modal";

// Confirm game request pairing modal
const ID_CONFIRM_GAME_REQUEST_PAIRING_MODAL = "confirm-game-request-pairing-modal";

// Move is illegal modal
const ID_MOVE_IS_ILLEGAL_MODAL = "move-is-illegal-modal";
const PREFIX_MOVE_IS_ILLEGAL_MODAL = ID_MOVE_IS_ILLEGAL_MODAL + "-";
const ID_MOVE_IS_ILLEGAL_MODAL_INTERSECTION = PREFIX_MOVE_IS_ILLEGAL_MODAL + "intersection";
const ID_MOVE_IS_ILLEGAL_MODAL_REASON = PREFIX_MOVE_IS_ILLEGAL_MODAL + "reason";

// SVG
const ID_SVG_BOARD = "board";
const ID_SVG_STARPOINT_PREFIX = "starpoint-";
const ID_SVG_STONE_PREFIX = "stone-";
const ID_SVG_LASTMOVESYMBOL = "last-move-symbol";
const ID_SVG_DEADSTONESYMBOL_PREFIX = "dead-stone-symbol-";
const ID_SVG_TERRITORY_PREFIX = "territory-";
const ID_SVG_SEKISYMBOL_PREFIX = "seki-symbol-";
const ID_SVG_NEXTMOVEINDICATOR = "next-move-indicator";
const ID_SVG_TOGGLEINDICATOR = "toggle-indicator";

// Modals
const ID_MODAL_NOT_YET_IMPLEMENTED = "notYetImplemented";
const ID_MODAL_CONFIRM_GAME_RESIGN = "confirm-game-resign-modal";
const ID_MODAL_CONFIRM_ACCEPT_SCORE_PROPOSAL = "confirm-accept-score-proposal-modal";


// ----------------------------------------------------------------------
// Bootstrap classes, attributes and values
// ----------------------------------------------------------------------
const BOOTSTRAP_CLASS_NAV_ITEM = "nav-item";
const BOOTSTRAP_CLASS_ACTIVE = "active";


// ----------------------------------------------------------------------
// WebSocket messages
// ----------------------------------------------------------------------
// WebSocket requests (client outgoing/server incoming messages)
const WEBSOCKET_REQUEST_TYPE_LOGIN = "c2sLogin";
const WEBSOCKET_REQUEST_TYPE_LOGOUT = "c2sLogout";
const WEBSOCKET_REQUEST_TYPE_REGISTERACCOUNT = "c2sRegisterAccount";
const WEBSOCKET_REQUEST_TYPE_VALIDATESESSION = "c2sValidateSession";
const WEBSOCKET_REQUEST_TYPE_SUBMITNEWGAMEREQUEST = "c2sSubmitNewGameRequest";
const WEBSOCKET_REQUEST_TYPE_GETGAMEREQUESTS = "c2sGetGameRequestsRequest";
const WEBSOCKET_REQUEST_TYPE_CANCELGAMEREQUEST = "c2sCancelGameRequestRequest";
const WEBSOCKET_REQUEST_TYPE_GETGAMEREQUESTPAIRING = "c2sGetGameRequestPairingRequest";
const WEBSOCKET_REQUEST_TYPE_CONFIRMGAMEREQUESTPAIRING = "c2sConfirmGameRequestPairingRequest";
const WEBSOCKET_REQUEST_TYPE_GETGAMESINPROGRESS = "c2sGetGamesInProgressRequest";
const WEBSOCKET_REQUEST_TYPE_GETGAME = "c2sGetGameRequest";
const WEBSOCKET_REQUEST_TYPE_SUBMITNEWGAMEMOVE = "c2sSubmitNewGameMoveRequest";
const WEBSOCKET_REQUEST_TYPE_SUBMITNEWSCOREPROPOSAL = "c2sSubmitNewScoreProposalRequest";
const WEBSOCKET_REQUEST_TYPE_ACCEPTSCOREPROPOSAL = "c2sAcceptScoreProposalRequest";
const WEBSOCKET_REQUEST_TYPE_GETFINISHEDGAMES = "c2sGetFinishedGamesRequest";
const WEBSOCKET_REQUEST_TYPE_RESIGNGAME = "c2sResignGameRequest";

// WebSocket responses (server outgoing/client incoming messages)
const WEBSOCKET_RESPONSE_TYPE_LOGIN = "s2cLoginResponse";
const WEBSOCKET_RESPONSE_TYPE_LOGOUT = "s2cLogoutResponse";
const WEBSOCKET_RESPONSE_TYPE_REGISTERACCOUNT = "s2cRegisterAccountResponse";
const WEBSOCKET_RESPONSE_TYPE_VALIDATESESSION = "s2cValidateSessionResponse";
const WEBSOCKET_RESPONSE_TYPE_SUBMITNEWGAMEREQUEST = "s2cSubmitNewGameResponse";
const WEBSOCKET_RESPONSE_TYPE_GETGAMEREQUESTS = "s2cGetGameRequestsResponse";
const WEBSOCKET_RESPONSE_TYPE_CANCELGAMEREQUEST = "s2cCancelGameRequestResponse";
const WEBSOCKET_RESPONSE_TYPE_GETGAMEREQUESTPAIRING = "s2cGetGameRequestPairingResponse";
const WEBSOCKET_RESPONSE_TYPE_CONFIRMGAMEREQUESTPAIRING = "s2cConfirmGameRequestPairingResponse";
const WEBSOCKET_RESPONSE_TYPE_GETGAMESINPROGRESS = "s2cGetGamesInProgressResponse";
const WEBSOCKET_RESPONSE_TYPE_GETGAME = "s2cGetGameResponse";
const WEBSOCKET_RESPONSE_TYPE_SUBMITNEWGAMEMOVE = "s2cSubmitNewGameMoveResponse";
const WEBSOCKET_RESPONSE_TYPE_SUBMITNEWSCOREPROPOSAL = "s2cSubmitNewScoreProposalResponse";
const WEBSOCKET_RESPONSE_TYPE_ACCEPTSCOREPROPOSAL = "s2cAcceptScoreProposalResponse";
const WEBSOCKET_RESPONSE_TYPE_GETFINISHEDGAMES = "s2cGetFinishedGamesResponse";
const WEBSOCKET_RESPONSE_TYPE_RESIGNGAME = "s2cResignGameResponse";

// WebSocket messages proactively sent by the server to a client who didn't
// request anything (server outgoing/client incoming messages)
const WEBSOCKET_MESSAGE_TYPE_GAMEREQUESTPAIRINGFOUND = "s2cGameRequestPairingFoundMessage";
