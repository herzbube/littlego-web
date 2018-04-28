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
}

?>
