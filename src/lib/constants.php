<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    // Database server defaults
    const PDO_DRIVER_NAME_DEFAULT = "mysql";
    const PDO_CONNECTION_STRING_DEFAULT = "host=127.0.0.1; port=3306";
    const DB_USER_NAME_DEFAULT = "root";
    const DB_PASSWORD_DEFAULT = "";
    const DB_DATABASE_NAME_DEFAULT = "littlego-web";

    // WebSocket server defaults
    const WEBSOCKET_HOST_DEFAULT = "localhost";
    const WEBSOCKET_PORT_DEFAULT = 8001;

    // WebSocket requests (client outgoing/server incoming messages)
    const WEBSOCKET_REQUEST_TYPE_LOGIN = "c2sLogin";
    const WEBSOCKET_REQUEST_TYPE_LOGOUT = "c2sLogout";
    const WEBSOCKET_REQUEST_TYPE_REGISTERACCOUNT = "c2sRegisterAccount";
    const WEBSOCKET_REQUEST_TYPE_VALIDATESESSION = "c2sValidateSession";
    const WEBSOCKET_REQUEST_TYPE_SUBMITNEWGAMEREQUEST = "c2sSubmitNewGameRequest";
    const WEBSOCKET_REQUEST_TYPE_GETGAMEREQUESTS = "c2sGetGameRequestsRequest";
    const WEBSOCKET_REQUEST_TYPE_CANCELGAMEREQUEST = "c2sCancelGameRequestRequest";

    // WebSocket responses (server outgoing/client incoming messages)
    const WEBSOCKET_RESPONSE_TYPE_LOGIN = "s2cLoginResponse";
    const WEBSOCKET_RESPONSE_TYPE_LOGOUT = "s2cLogoutResponse";
    const WEBSOCKET_RESPONSE_TYPE_REGISTERACCOUNT = "s2cRegisterAccountResponse";
    const WEBSOCKET_RESPONSE_TYPE_VALIDATESESSION = "s2cValidateSessionResponse";
    const WEBSOCKET_RESPONSE_TYPE_SUBMITNEWGAMEREQUEST = "s2cSubmitNewGameResponse";
    const WEBSOCKET_RESPONSE_TYPE_GETGAMEREQUESTS = "s2cGetGameRequestsResponse";
    const WEBSOCKET_RESPONSE_TYPE_CANCELGAMEREQUEST = "s2cCancelGameRequestResponse";

    // WebSocket messages
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
    const WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDBOARDSIZE = "requestedBoardSize";
    const WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDSTONECOLOR = "requestedStoneColor";
    const WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDHANDICAP = "requestedHandicap";
    const WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDKOMI = "requestedKomi";
    const WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDKORULE = "requestedKoRule";
    const WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDSCORINGSYSTEM = "requestedScoringSystem";
    const WEBSOCKET_MESSAGEDATA_KEY_GAMEREQUESTS = "gameRequests";
    const WEBSOCKET_MESSAGEDATA_KEY_SUCCESS = "success";
    const WEBSOCKET_MESSAGEDATA_KEY_ERRORMESSAGE = "errorMessage";

    // Session configuration
    const SESSION_VALIDITIY_DURATION_DEFAULT = 86400 * 30;

    // SQL query generation
    const PREPARED_STATEMENT_PARAMETER_PREFIX = ":";
    const SQL_QUOTE_CHARACTER = "`";
    const SQL_NAME_SEPARATOR = ".";
    const SQL_OPERATOR_AND = " and ";
    const SQL_OPERATOR_OR = " or ";
    const SQL_OPERATOR_EQUALS = " = ";
    const SQL_OPERATOR_COMMA = ", ";
    const SQL_OPERATOR_PARANTHESIS_OPEN = " ( ";
    const SQL_OPERATOR_PARANTHESIS_CLOSE = " ) ";
    const SQL_OPERATOR_ASCENDING = " asc ";
    const SQL_OPERATOR_DESCENDING = " desc ";

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
}

?>
