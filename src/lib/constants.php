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

    // WebSocket messages
    const WEBSOCKET_JSON_KEY_MESSAGE_TYPE = "messageType";
    const WEBSOCKET_JSON_KEY_MESSAGE_DATA = "data";
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
}

?>
