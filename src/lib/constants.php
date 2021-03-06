<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    // Database server defaults
    const PDO_DRIVER_NAME_DEFAULT = "mysql";
    const PDO_CONNECTION_STRING_DEFAULT = "host=127.0.0.1; port=3306";
    const DB_USER_NAME_DEFAULT = "littlego-web";
    const DB_PASSWORD_DEFAULT = "";
    const DB_DATABASE_NAME_DEFAULT = "littlego-web";

    // WebSocket server defaults
    const WEBSOCKET_HOST_DEFAULT = "localhost";
    const WEBSOCKET_PORT_DEFAULT = 8001;
    const WEBSOCKET_MESSAGESENDDELAYINMILLISECONDS_DEFAULT = 0;
    const WEBSOCKET_MESSAGERECEIVEDELAYINMILLISECONDS_DEFAULT = 0;

    // Logging configuration used by the WebSocket server
    const LOGGING_ENABLED_DEFAULT = true;
    const LOGGING_IDENTIFIER_DEFAULT = "littlego-web";
    const LOGGING_FACILITY_DEFAULT = LOG_USER;
    const LOGGING_LOGLEVEL_DEFAULT = LOG_ERR;
    const LOGGING_ECHOLOGGINGTOSTDOUT_DEFAULT = false;

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
    const WEBSOCKET_REQUEST_TYPE_GETHIGHSCORES = "c2sGetHighscoresRequest";
    const WEBSOCKET_REQUEST_TYPE_EMAILHIGHSCORES = "c2sEmailHighscoresRequest";

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
    const WEBSOCKET_RESPONSE_TYPE_GETHIGHSCORES = "s2cGetHighscoresResponse";
    const WEBSOCKET_RESPONSE_TYPE_EMAILHIGHSCORES = "s2cEmailHighscoresResponse";

    // WebSocket messages proactively sent by the server to a client who didn't
    // request anything (server outgoing/client incoming messages)
    const WEBSOCKET_MESSAGE_TYPE_GAMEREQUESTPAIRINGFOUND = "s2cGameRequestPairingFoundMessage";

    // WebSocket message keys used to compose the JSON message data
    const WEBSOCKET_JSON_KEY_MESSAGE_TYPE = "messageType";
    const WEBSOCKET_JSON_KEY_MESSAGE_DATA = "data";
    const WEBSOCKET_MESSAGEDATA_KEY_EMAILADDRESS = "emailAddress";
    const WEBSOCKET_MESSAGEDATA_KEY_PASSWORD = "password";
    const WEBSOCKET_MESSAGEDATA_KEY_SESSIONKEY = "sessionKey";
    const WEBSOCKET_MESSAGEDATA_KEY_USERID = "userID";
    const WEBSOCKET_MESSAGEDATA_KEY_DISPLAYNAME = "displayName";
    const WEBSOCKET_MESSAGEDATA_KEY_USERINFO = "userInfo";
    const WEBSOCKET_MESSAGEDATA_KEY_GAMEREQUESTID = "gameRequestID";
    const WEBSOCKET_MESSAGEDATA_KEY_CREATETIME = "createTime";
    const WEBSOCKET_MESSAGEDATA_KEY_BLACKPLAYERGAMEREQUESTID = "blackPlayerGameRequestID";
    const WEBSOCKET_MESSAGEDATA_KEY_WHITEPLAYERGAMEREQUESTID = "whitePlayerGameRequestID";
    const WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDBOARDSIZE = "requestedBoardSize";
    const WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDSTONECOLOR = "requestedStoneColor";
    const WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDHANDICAP = "requestedHandicap";
    const WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDKOMI = "requestedKomi";
    const WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDKORULE = "requestedKoRule";
    const WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDSCORINGSYSTEM = "requestedScoringSystem";
    const WEBSOCKET_MESSAGEDATA_KEY_STATE = "state";
    const WEBSOCKET_MESSAGEDATA_KEY_GAMEREQUESTS = "gameRequests";
    const WEBSOCKET_MESSAGEDATA_KEY_GAMEREQUESTPAIRING = "gameRequestPairing";
    const WEBSOCKET_MESSAGEDATA_KEY_GAMEREQUESTPAIRINGID = "gameRequestPairingID";
    const WEBSOCKET_MESSAGEDATA_KEY_BOARDSIZE = "boardSize";
    const WEBSOCKET_MESSAGEDATA_KEY_HANDICAP = "handicap";
    const WEBSOCKET_MESSAGEDATA_KEY_KOMI = "komi";
    const WEBSOCKET_MESSAGEDATA_KEY_KORULE = "koRule";
    const WEBSOCKET_MESSAGEDATA_KEY_SCORINGSYSTEM = "scoringSystem";
    const WEBSOCKET_MESSAGEDATA_KEY_ISREJECTED = "isRejected";
    const WEBSOCKET_MESSAGEDATA_KEY_BLACKPLAYER = "blackPlayer";
    const WEBSOCKET_MESSAGEDATA_KEY_WHITEPLAYER = "whitePlayer";
    const WEBSOCKET_MESSAGEDATA_KEY_GAMEID = "gameID";
    const WEBSOCKET_MESSAGEDATA_KEY_NUMBEROFMOVESPLAYED = "numberOfMovesPlayed";
    const WEBSOCKET_MESSAGEDATA_KEY_NEXTACTIONCOLOR = "nextActionColor";
    const WEBSOCKET_MESSAGEDATA_KEY_GAMERESULT = "gameResult";
    const WEBSOCKET_MESSAGEDATA_KEY_GAMEMOVEID = "gameMoveID";
    const WEBSOCKET_MESSAGEDATA_KEY_MOVETYPE = "moveType";
    const WEBSOCKET_MESSAGEDATA_KEY_MOVECOLOR = "moveColor";
    const WEBSOCKET_MESSAGEDATA_KEY_VERTEXX = "vertexX";
    const WEBSOCKET_MESSAGEDATA_KEY_VERTEXY = "vertexY";
    const WEBSOCKET_MESSAGEDATA_KEY_GAMESINPROGRESS = "gamesInProgress";
    const WEBSOCKET_MESSAGEDATA_KEY_GAME = "game";
    const WEBSOCKET_MESSAGEDATA_KEY_GAMEMOVES = "gameMoves";
    const WEBSOCKET_MESSAGEDATA_KEY_GAMEMOVE = "gameMove";
    const WEBSOCKET_MESSAGEDATA_KEY_GAMESTATE = "gameState";
    const WEBSOCKET_MESSAGEDATA_KEY_SCORE = "score";
    const WEBSOCKET_MESSAGEDATA_KEY_SCOREID = "scoreID";
    const WEBSOCKET_MESSAGEDATA_KEY_LASTMODIFIEDBYUSERID = "lastModifiedByUserID";
    const WEBSOCKET_MESSAGEDATA_KEY_LASTMODIFIEDTIME = "lastModifiedTime";
    const WEBSOCKET_MESSAGEDATA_KEY_SCOREDETAILS = "scoreDetails";
    const WEBSOCKET_MESSAGEDATA_KEY_SCOREDETAILID = "scoreDetailID";
    const WEBSOCKET_MESSAGEDATA_KEY_STONEGROUPSTATE = "stoneGroupState";
    const WEBSOCKET_MESSAGEDATA_KEY_GAMERESULTID = "gameResultID";
    const WEBSOCKET_MESSAGEDATA_KEY_RESULTTYPE = "resultType";
    const WEBSOCKET_MESSAGEDATA_KEY_WINNINGSTONECOLOR = "winningStoneColor";
    const WEBSOCKET_MESSAGEDATA_KEY_WINNINGPOINTS = "winningPoints";
    const WEBSOCKET_MESSAGEDATA_KEY_FINISHEDGAMES = "finishedGames";
    const WEBSOCKET_MESSAGEDATA_KEY_HIGHSCORES = "highscores";
    const WEBSOCKET_MESSAGEDATA_KEY_TOTALGAMESWON = "totalGamesWon";
    const WEBSOCKET_MESSAGEDATA_KEY_TOTALGAMESLOST = "totalGamesLost";
    const WEBSOCKET_MESSAGEDATA_KEY_MOSTRECENTWIN = "mostRecentWin";
    const WEBSOCKET_MESSAGEDATA_KEY_GAMESWONASBLACK = "gamesWonAsBlack";
    const WEBSOCKET_MESSAGEDATA_KEY_GAMESWONASWHITE = "gamesWonAsWhite";
    const WEBSOCKET_MESSAGEDATA_KEY_SUCCESS = "success";
    const WEBSOCKET_MESSAGEDATA_KEY_ERRORMESSAGE = "errorMessage";

    // Web server configuration
    const URL_BASE_PATH_DEFAULT = "/";

    // Session configuration
    const SESSION_VALIDITIY_DURATION_DEFAULT = 86400 * 30;

    // App configuration
    const APP_HIGHSCORE_LIMIT_DEFAULT = 10;

    // PHPMailer configuration
    const PHPMAILER_HOST_DEFAULT = "";
    const PHPMAILER_SMTPAUTH_DEFAULT = true;
    const PHPMAILER_USERNAME_DEFAULT = "";
    const PHPMAILER_PASSWORD_DEFAULT = "";
    const PHPMAILER_SMTPSECURE_DEFAULT = "tls";
    const PHPMAILER_PORT_DEFAULT = 25;
    const PHPMAILER_FROMADDRESS_DEFAULT =  "";
    const PHPMAILER_FROMNAME_DEFAULT = "Do not reply to this e-mail (Little Go for Web Mailer)";
    const PHPMAILER_REPLYTOADDRESS_DEFAULT =  "";
    const PHPMAILER_REPLYTONAME_DEFAULT = PHPMAILER_FROMNAME_DEFAULT;
    const PHPMAILER_SUBJECT_DEFAULT =  "Little Go for Web highscores";
    const PHPMAILER_SMTPDEBUG_DEFAULT = 0;

    // SQL query generation
    const PREPARED_STATEMENT_PARAMETER_PREFIX = ":";
    // This separator is used when concatenating table name + column name
    // to form a bound parameter name. There is no official documentation
    // on what characters can be legally used to form parameter names, so
    // I experimentally determined that the underscore character ("_") works,
    // whereas the following do NOT work: dash character ("-"),
    // dot character ("."), plus character ("+"). A theory is that parameter
    // names work just like PHP variable names, which would mean that
    // a parameter name can consist of numbers and letters and underscore ("_")
    // characters and must start with a letter.
    const PREPARED_STATEMENT_PARAMETER_SEPARATOR = "_";
    const SQL_QUOTE_CHARACTER = "`";
    const SQL_OBJECT_SEPARATOR = ".";
    const SQL_OPERATOR_AND = " and ";
    const SQL_OPERATOR_OR = " or ";
    const SQL_OPERATOR_EQUALS = " = ";
    const SQL_OPERATOR_NOTEQUALS = " <> ";
    const SQL_OPERATOR_ISNULL = " is null ";
    const SQL_OPERATOR_COMMA = ", ";
    const SQL_OPERATOR_PARANTHESIS_OPEN = " ( ";
    const SQL_OPERATOR_PARANTHESIS_CLOSE = " ) ";
    const SQL_OPERATOR_ASCENDING = " asc ";
    const SQL_OPERATOR_DESCENDING = " desc ";
    const SQL_OPERATOR_ON = " on ";
    const SQL_JOINNAME_INNERJOIN = " inner join ";
    const SQL_JOINNAME_LEFTJOIN = " left join ";

    // Data classes defaults
    const SESSION_SESSIONID_DEFAULT = -1;
    const SESSION_SESSIONKEY_DEFAULT = "";
    const SESSION_USERID_DEFAULT = -1;
    const SESSION_VALIDUNTIL_DEFAULT = -1;
    const USER_USERID_DEFAULT = -1;
    const USER_EMAILADDRESS_DEFAULT = "";
    const USER_DISPLAYNAME_DEFAULT = "";
    const USER_PASSWORDHASH_DEFAULT = "";
    const GAMEREQUEST_GAMEREQUESTID_DEFAULT = -1;
    const GAMEREQUEST_CREATETIME_DEFAULT = -1;
    const GAMEREQUEST_REQUESTEDBOARDSIZE_DEFAULT = -1;
    const GAMEREQUEST_REQUESTEDSTONECOLOR_DEFAULT = -1;
    const GAMEREQUEST_REQUESTEDHANDICAP_DEFAULT = -1;
    const GAMEREQUEST_REQUESTEDKOMI_DEFAULT = -1;
    const GAMEREQUEST_REQUESTEDKORULE_DEFAULT = -1;
    const GAMEREQUEST_SCORINGSYSTEM_DEFAULT = -1;
    const GAMEREQUEST_USERID_DEFAULT = -1;
    const GAMEREQUEST_STATE_DEFAULT = -1;
    const GAMEREQUEST_GAMEID_DEFAULT = -1;
    const GAMEREQUESTPAIRING_GAMEREQUESTPAIRINGID_DEFAULT = -1;
    const GAMEREQUESTPAIRING_CREATETIME_DEFAULT = -1;
    const GAMEREQUESTPAIRING_BLACKPLAYERGAMEREQUESTID_DEFAULT = -1;
    const GAMEREQUESTPAIRING_WHITEPLAYERGAMEREQUESTID_DEFAULT = -1;
    const GAMEREQUESTPAIRING_BOARDSIZE_DEFAULT = -1;
    const GAMEREQUESTPAIRING_HANDICAP_DEFAULT = -1;
    const GAMEREQUESTPAIRING_KOMI_DEFAULT = -1;
    const GAMEREQUESTPAIRING_KORULE_DEFAULT = -1;
    const GAMEREQUESTPAIRING_SCORINGSYSTEM_DEFAULT = -1;
    const GAMEREQUESTPAIRING_ISREJECTED_DEFAULT = false;
    const GAME_GAMEID_DEFAULT = -1;
    const GAME_CREATETIME_DEFAULT = -1;
    const GAME_BOARDSIZE_DEFAULT = -1;
    const GAME_HANDICAP_DEFAULT = -1;
    const GAME_KOMI_DEFAULT = -1;
    const GAME_KORULE_DEFAULT = -1;
    const GAME_SCORINGSYSTEM_DEFAULT = -1;
    const GAME_STATE_DEFAULT = -1;
    const GAME_NUMBEROFMOVESPLAYED_DEFAULT = -1;
    const GAME_NEXTACTIONCOLOR_DEFAULT = -1;
    const GAMEMOVE_GAMEMOVEID_DEFAULT = -1;
    const GAMEMOVE_CREATETIME_DEFAULT = -1;
    const GAMEMOVE_GAMEID_DEFAULT = -1;
    const GAMEMOVE_MOVETYPE_DEFAULT = -1;
    const GAMEMOVE_MOVECOLOR_DEFAULT = -1;
    const GAMEMOVE_VERTEXX_DEFAULT = -1;
    const GAMEMOVE_VERTEXY_DEFAULT = -1;
    const SCORE_SCOREID_DEFAULT = -1;
    const SCORE_GAMEID_DEFAULT = -1;
    const SCORE_STATE_DEFAULT = -1;
    const SCORE_LASTMODIFIEDBYUSERID_DEFAULT = -1;
    const SCORE_LASTMODIFIEDTIME_DEFAULT = -1;
    const SCOREDETAIL_SCOREDETAILID_DEFAULT = -1;
    const SCOREDETAIL_SCOREID_DEFAULT = -1;
    const SCOREDETAIL_VERTEXX_DEFAULT = -1;
    const SCOREDETAIL_VERTEXY_DEFAULT = -1;
    const SCOREDETAIL_STONEGROUPSTATE_DEFAULT = -1;
    const GAMERESULT_GAMERESULTID_DEFAULT = -1;
    const GAMERESULT_CREATETIME_DEFAULT = -1;
    const GAMERESULT_GAMEID_DEFAULT = -1;
    const GAMERESULT_RESULTTYPE_DEFAULT = -1;
    const GAMERESULT_WINNINGSTONECOLOR_DEFAULT = -1;
    const GAMERESULT_WINNINGPOINTS_DEFAULT = -1;
    const HIGHSCORE_USERID_DEFAULT = -1;
    const HIGHSCORE_DISPLAYNAME_DEFAULT = -1;
    const HIGHSCORE_TOTALGAMESWON_DEFAULT = -1;
    const HIGHSCORE_TOTALGAMESLOST_DEFAULT = -1;
    const HIGHSCORE_MOSTRECENTWIN_DEFAULT = -1;
    const HIGHSCORE_GAMESWONASBLACK_DEFAULT = -1;
    const HIGHSCORE_GAMESWONASWHITE_DEFAULT = -1;

    // Game request constants
    const GAMEREQUEST_NOPREFERENCE = -1;
    const GAMEREQUEST_STATE_UNPAIRED = 0;
    const GAMEREQUEST_STATE_UNCONFIRMEDPAIRING = 1;
    const GAMEREQUEST_STATE_CONFIRMEDPAIRING = 2;

    // Game constants
    const GAME_STATE_INPROGRESS_PLAYING = 0;
    const GAME_STATE_INPROGRESS_SCORING = 1;
    const GAME_STATE_FINISHED = 2;

    // Game parameter constants
    const BOARDSIZE_7 = 7;
    const BOARDSIZE_9 = 9;
    const BOARDSIZE_11 = 11;
    const BOARDSIZE_13 = 13;
    const BOARDSIZE_15 = 15;
    const BOARDSIZE_17 = 17;
    const BOARDSIZE_19 = 19;
    const COLOR_NONE = -1;
    const COLOR_BLACK = 0;
    const COLOR_WHITE = 1;
    const HANDICAP_NONE = 0;
    const KOMI_NONE = 0.0;
    const KORULE_SIMPLE_KO = 0;
    const KORULE_POSITIONAL_SUPERKO = 1;
    const KORULE_SITUATIONAL_SUPERKO = 2;
    const SCORINGSYSTEM_AREA_SCORING = 0;
    const SCORINGSYSTEM_TERRITORY_SCORING = 1;

    // New game constants
    const NEWGAME_BOARDSIZE_DEFAULT = BOARDSIZE_19;
    const NEWGAME_HANDICAP_DEFAULT = HANDICAP_NONE;
    const NEWGAME_KOMI_NOHANDICAP_AREASCORING_DEFAULT = 7.5;
    const NEWGAME_KOMI_NOHANDICAP_TERRITORYSCORING_DEFAULT = 6.5;
    const NEWGAME_KOMI_WITHHANDICAP_DEFAULT = 0.5;
    const NEWGAME_KORULE_DEFAULT = KORULE_SIMPLE_KO;
    const NEWGAME_SCORINGSYSTEM_DEFAULT = SCORINGSYSTEM_AREA_SCORING;

    // Game move constants
    const GAMEMOVE_MOVETYPE_PLAY = 0;
    const GAMEMOVE_MOVETYPE_PASS = 1;

    // Score constants
    const SCORE_STATE_PROPOSED = 0;
    const SCORE_STATE_ACCEPTED = 1;

    // Game result constants
    const GAMERESULT_RESULTTYPE_WINBYPOINTS = 0;
    const GAMERESULT_RESULTTYPE_WINBYRESIGNATION = 1;
    const GAMERESULT_RESULTTYPE_DRAW = 2;

    // Database table session
    const DB_TABLE_NAME_SESSION = "session";
    const DB_COLUMN_NAME_SESSION_SESSIONID = "sessionID";
    const DB_COLUMN_NAME_SESSION_SESSIONKEY = "sessionKey";
    const DB_COLUMN_NAME_SESSION_USERID = "userID";
    const DB_COLUMN_NAME_SESSION_VALIDUNTIL = "validUntil";

    // Database table user
    const DB_TABLE_NAME_USER = "user";
    const DB_COLUMN_NAME_USER_USERID = "userID";
    const DB_COLUMN_NAME_USER_EMAILADDRESS = "emailAddress";
    const DB_COLUMN_NAME_USER_DISPLAYNAME = "displayName";
    const DB_COLUMN_NAME_USER_PASSWORDHASH = "passwordHash";

    // Database table gamerequest
    const DB_TABLE_NAME_GAMEREQUEST = "gamerequest";
    const DB_COLUMN_NAME_GAMEREQUEST_GAMEREQUESTID = "gameRequestID";
    const DB_COLUMN_NAME_GAMEREQUEST_CREATETIME = "createTime";
    const DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDBOARDSIZE = "requestedBoardSize";
    const DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDSTONECOLOR = "requestedStoneColor";
    const DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDHANDICAP = "requestedHandicap";
    const DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDKOMI = "requestedKomi";
    const DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDKORULE = "requestedKoRule";
    const DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDSCORINGSYSTEM = "requestedScoringSystem";
    const DB_COLUMN_NAME_GAMEREQUEST_USERID = "userID";
    const DB_COLUMN_NAME_GAMEREQUEST_STATE = "state";
    const DB_COLUMN_NAME_GAMEREQUEST_GAMEID = "gameID";

    // Database table gamerequestpairing
    const DB_TABLE_NAME_GAMEREQUESTPAIRING = "gamerequestpairing";
    const DB_COLUMN_NAME_GAMEREQUESTPAIRING_GAMEREQUESTPAIRINGID = "gameRequestPairingID";
    const DB_COLUMN_NAME_GAMEREQUESTPAIRING_CREATETIME = "createTime";
    const DB_COLUMN_NAME_GAMEREQUESTPAIRING_BLACKPLAYERGAMEREQUESTID = "blackPlayerGameRequestID";
    const DB_COLUMN_NAME_GAMEREQUESTPAIRING_WHITEPLAYERGAMEREQUESTID = "whitePlayerGameRequestID";
    const DB_COLUMN_NAME_GAMEREQUESTPAIRING_BOARDSIZE = "boardSize";
    const DB_COLUMN_NAME_GAMEREQUESTPAIRING_HANDICAP = "handicap";
    const DB_COLUMN_NAME_GAMEREQUESTPAIRING_KOMI = "komi";
    const DB_COLUMN_NAME_GAMEREQUESTPAIRING_KORULE = "koRule";
    const DB_COLUMN_NAME_GAMEREQUESTPAIRING_SCORINGSYSTEM = "scoringSystem";
    const DB_COLUMN_NAME_GAMEREQUESTPAIRING_ISREJECTED = "isRejected";

    // Database table game
    const DB_TABLE_NAME_GAME = "game";
    const DB_COLUMN_NAME_GAME_GAMEID = "gameID";
    const DB_COLUMN_NAME_GAME_CREATETIME = "createTime";
    const DB_COLUMN_NAME_GAME_BOARDSIZE = "boardSize";
    const DB_COLUMN_NAME_GAME_HANDICAP = "handicap";
    const DB_COLUMN_NAME_GAME_KOMI = "komi";
    const DB_COLUMN_NAME_GAME_KORULE = "koRule";
    const DB_COLUMN_NAME_GAME_SCORINGSYSTEM = "scoringSystem";
    const DB_COLUMN_NAME_GAME_STATE = "state";

    // Database table gamesusersmapping
    const DB_TABLE_NAME_GAMESUSERSMAPPING = "gamesusersmapping";
    const DB_COLUMN_NAME_GAMESUSERSMAPPING_GAMESUSERSMAPPINGID = "gamesusersmappingID";
    const DB_COLUMN_NAME_GAMESUSERSMAPPING_GAMEID = "gameID";
    const DB_COLUMN_NAME_GAMESUSERSMAPPING_USERID = "userID";
    const DB_COLUMN_NAME_GAMESUSERSMAPPING_STONECOLOR = "stoneColor";

    // Database table gamemove
    const DB_TABLE_NAME_GAMEMOVE = "gamemove";
    const DB_COLUMN_NAME_GAMEMOVE_GAMEMOVEID = "gameMoveID";
    const DB_COLUMN_NAME_GAMEMOVE_CREATETIME = "createTime";
    const DB_COLUMN_NAME_GAMEMOVE_GAMEID = "gameID";
    const DB_COLUMN_NAME_GAMEMOVE_MOVETYPE = "moveType";
    const DB_COLUMN_NAME_GAMEMOVE_MOVECOLOR = "moveColor";
    const DB_COLUMN_NAME_GAMEMOVE_VERTEXX = "vertexX";
    const DB_COLUMN_NAME_GAMEMOVE_VERTEXY = "vertexY";

    // Database table score
    const DB_TABLE_NAME_SCORE = "score";
    const DB_COLUMN_NAME_SCORE_SCOREID = "scoreID";
    const DB_COLUMN_NAME_SCORE_GAMEID = "gameID";
    const DB_COLUMN_NAME_SCORE_STATE = "state";
    const DB_COLUMN_NAME_SCORE_LASTMODIFIEDBYUSERID = "lastModifiedByUserID";
    const DB_COLUMN_NAME_SCORE_LASTMODIFIEDTIME = "lastModifiedTime";

    // Database table scoredetail
    const DB_TABLE_NAME_SCOREDETAIL = "scoredetail";
    const DB_COLUMN_NAME_SCOREDETAIL_SCOREDETAILID = "scoreDetailID";
    const DB_COLUMN_NAME_SCOREDETAIL_SCOREID = "scoreID";
    const DB_COLUMN_NAME_SCOREDETAIL_VERTEXX = "vertexX";
    const DB_COLUMN_NAME_SCOREDETAIL_VERTEXY = "vertexY";
    const DB_COLUMN_NAME_SCOREDETAIL_STONEGROUPSTATE = "stoneGroupState";

    // Database table gameresult
    const DB_TABLE_NAME_GAMERESULT = "gameresult";
    const DB_COLUMN_NAME_GAMERESULT_GAMERESULTID = "gameResultID";
    const DB_COLUMN_NAME_GAMERESULT_CREATETIME = "createTime";
    const DB_COLUMN_NAME_GAMERESULT_GAMEID = "gameID";
    const DB_COLUMN_NAME_GAMERESULT_RESULTTYPE = "resultType";
    const DB_COLUMN_NAME_GAMERESULT_WINNINGSTONECOLOR = "winningStoneColor";
    const DB_COLUMN_NAME_GAMERESULT_WINNINGPOINTS = "winningPoints";

    // Database view highscores
    const DB_VIEW_NAME_HIGHSCORE = "highscore";
    const DB_COLUMN_NAME_HIGHSCORE_USERID = "userID";
    const DB_COLUMN_NAME_HIGHSCORE_DISPLAYNAME = "displayName";
    const DB_COLUMN_NAME_HIGHSCORE_TOTALGAMESWON = "totalGamesWon";
    const DB_COLUMN_NAME_HIGHSCORE_TOTALGAMESLOST = "totalGamesLost";
    const DB_COLUMN_NAME_HIGHSCORE_MOSTRECENTWIN = "mostRecentWin";
    const DB_COLUMN_NAME_HIGHSCORE_GAMESWONASBLACK = "gamesWonAsBlack";
    const DB_COLUMN_NAME_HIGHSCORE_GAMESWONASWHITE = "gamesWonAsWhite";
}

?>
