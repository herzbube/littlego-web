<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    require_once(dirname(__FILE__) . "/config_defaults.php");

    use \PDO;

    // The DbAccess class provides access to the application database.
    class DbAccess
    {
        private $config;
        private $pdo;
        private $sqlGenerator;

        // Constructs a new DbAccess object. A database connection is
        // established immediately in this constructor using the parameters
        // in the specified configuration object.
        //
        // Throws a PDOException if any error occurs.
        public function __construct(Config $config)
        {
            $this->config = $config;

            $dsn = $config->pdoDriverName . ":" . $config->pdoConnectionString;

            $options = null;
            $this->pdo = new PDO($dsn, $config->dbUsername, $config->dbPassword, $options);

            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $this->sqlGenerator = new SqlGenerator($config->dbName);
        }

        // Obtains the session data for the specified session key from the
        // database and returns the data as a Session object. Returns null if
        // the database has no session data for the specified session key.
        public function findSessionByKey(string $sessionKey): ?Session
        {
            $tableName = DB_TABLE_NAME_SESSION;
            $columnNames = array(
                DB_COLUMN_NAME_SESSION_SESSIONID,
                DB_COLUMN_NAME_SESSION_SESSIONKEY,
                DB_COLUMN_NAME_SESSION_USERID,
                DB_COLUMN_NAME_SESSION_VALIDUNTIL);
            $whereColumnNames = array(DB_COLUMN_NAME_SESSION_SESSIONKEY);

            $selectQueryString = $this->sqlGenerator->getSelectStatementWithWhereClause(
                $tableName,
                $columnNames,
                $whereColumnNames);

            $selectStatement = $this->pdo->prepare($selectQueryString);
            $selectStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_SESSION_SESSIONKEY),
                $sessionKey,
                PDO::PARAM_STR);
            $selectStatement->execute();

            $row = $selectStatement->fetch(PDO::FETCH_ASSOC);
            if ($row)
            {
                $sessionID = intval($row[DB_COLUMN_NAME_SESSION_SESSIONID]);
                $sessionKey = $row[DB_COLUMN_NAME_SESSION_SESSIONKEY];
                $userID = intval($row[DB_COLUMN_NAME_SESSION_USERID]);
                $validUntil = intval($row[DB_COLUMN_NAME_SESSION_VALIDUNTIL]);

                return new Session($sessionID, $sessionKey, $userID, $validUntil);
            }
            else
            {
                return null;
            }
        }

        // Inserts a new row into the database that contains the data in the
        // specified Session object, with the exception of the session ID.
        // On success, returns the session ID auto-generated by the database.
        // On failure, returns -1.
        public function insertSession(Session $session): int
        {
            $tableName = DB_TABLE_NAME_SESSION;
            $columnNames = array(
                DB_COLUMN_NAME_SESSION_SESSIONKEY,
                DB_COLUMN_NAME_SESSION_USERID,
                DB_COLUMN_NAME_SESSION_VALIDUNTIL);

            $insertQueryString = $this->sqlGenerator->getInsertStatement(
                $tableName,
                $columnNames);

            $insertStatement = $this->pdo->prepare($insertQueryString);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_SESSION_SESSIONKEY),
                $session->getSessionKey(),
                PDO::PARAM_STR);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_SESSION_USERID),
                $session->getUserID(),
                PDO::PARAM_INT);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_SESSION_VALIDUNTIL),
                $session->getValidUntil(),
                PDO::PARAM_INT);

            try
            {
                $insertStatement->execute();

                $sessionID = intval($this->pdo->lastInsertId());
                return $sessionID;
            }
            catch (\PDOException $exception)
            {
                return -1;
            }
        }

        // Deletes data for the session with the specified session key from
        // the database. Returns true on success, false on failure (i.e. no
        // session for the specified session key exists).
        public function deleteSessionBySessionKey(string $sessionKey): bool
        {
            $tableName = DB_TABLE_NAME_SESSION;
            $columnNames = array(
                DB_COLUMN_NAME_SESSION_SESSIONKEY);

            $deleteQueryString = $this->sqlGenerator->getDeleteStatementWithWhereClause(
                $tableName,
                $columnNames);

            $deleteStatement = $this->pdo->prepare($deleteQueryString);
            $deleteStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_SESSION_SESSIONKEY),
                $sessionKey,
                PDO::PARAM_STR);

            $deleteStatement->execute();

            $numberOfDeletedRows = $deleteStatement->rowCount();
            if ($numberOfDeletedRows === 1)
                return true;
            else
                return false;
        }

        // Obtains the user data for the specified user ID from the database
        // and returns the data as a User object. Returns null if the database
        // has no user data for the specified user ID.
        public function findUserByID(int $userID): User
        {
            $selectStatement = $this->getPdoStatementFindUser(DB_COLUMN_NAME_USER_USERID);

            $selectStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_USER_USERID),
                $userID,
                PDO::PARAM_INT);

            return $this->executePdoStatementFindUser($selectStatement);
        }

        // Obtains the user data for the specified email address from the
        // database and returns the data as a User object. Returns null if
        // the database has no user data for the specified email address.
        public function findUserByEmailAddress(string $emailAddress): ?User
        {
            $selectStatement = $this->getPdoStatementFindUser(DB_COLUMN_NAME_USER_EMAILADDRESS);

            $selectStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_USER_EMAILADDRESS),
                $emailAddress,
                PDO::PARAM_STR);

            return $this->executePdoStatementFindUser($selectStatement);
        }

        // Obtains the user data for the specified display name from the
        // database and returns the data as a User object. Returns null if
        // the database has no user data for the specified display name.
        public function findUserByDisplayName(string $displayName): ?User
        {
            $selectStatement = $this->getPdoStatementFindUser(DB_COLUMN_NAME_USER_DISPLAYNAME);

            $selectStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_USER_DISPLAYNAME),
                $displayName,
                PDO::PARAM_STR);

            return $this->executePdoStatementFindUser($selectStatement);
        }

        // Returns an already prepared PDOStatement that represents a query to
        // find user data in the database by the specified column name. The
        // caller must bind the value to the PDOStatement before it can be
        // executed.
        private function getPdoStatementFindUser(string $findByColumnName): \PDOStatement
        {
            $tableName = DB_TABLE_NAME_USER;
            $columnNames = array(
                DB_COLUMN_NAME_USER_USERID,
                DB_COLUMN_NAME_USER_EMAILADDRESS,
                DB_COLUMN_NAME_USER_DISPLAYNAME,
                DB_COLUMN_NAME_USER_PASSWORDHASH);
            $whereColumnNames = array($findByColumnName);

            $selectQueryString = $this->sqlGenerator->getSelectStatementWithWhereClause(
                $tableName,
                $columnNames,
                $whereColumnNames);

            $selectStatement = $this->pdo->prepare($selectQueryString);

            return $selectStatement;
        }

        // Executes the prepared PDOStatement that represents a query to
        // find a single row of user data in the database. Returns a User
        // object with the data, or null if the database has no user data.
        private function executePdoStatementFindUser(\PDOStatement $selectStatement): ?User
        {
            $selectStatement->execute();

            $row = $selectStatement->fetch(PDO::FETCH_ASSOC);
            if ($row)
            {
                $userID = intval($row[DB_COLUMN_NAME_USER_USERID]);
                $emailAddress = $row[DB_COLUMN_NAME_USER_EMAILADDRESS];
                $displayName = $row[DB_COLUMN_NAME_USER_DISPLAYNAME];
                $passwordHash = $row[DB_COLUMN_NAME_USER_PASSWORDHASH];

                return new User($userID, $emailAddress, $displayName, $passwordHash);
            }
            else
            {
                return null;
            }
        }

        // Inserts a new row into the database that contains the data in the
        // specified User object, with the exception of the user ID.
        // On success, returns the user ID auto-generated by the database.
        // On failure, returns -1.
        public function insertUser(User $user): int
        {
            $tableName = DB_TABLE_NAME_USER;
            $columnNames = array(
                DB_COLUMN_NAME_USER_EMAILADDRESS,
                DB_COLUMN_NAME_USER_DISPLAYNAME,
                DB_COLUMN_NAME_USER_PASSWORDHASH);

            $insertQueryString = $this->sqlGenerator->getInsertStatement(
                $tableName,
                $columnNames);

            $insertStatement = $this->pdo->prepare($insertQueryString);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_USER_EMAILADDRESS),
                $user->getEmailAddress(),
                PDO::PARAM_STR);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_USER_DISPLAYNAME),
                $user->getDisplayName(),
                PDO::PARAM_STR);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_USER_PASSWORDHASH),
                $user->getPasswordHash(),
                PDO::PARAM_STR);

            try
            {
                $insertStatement->execute();

                $userID = intval($this->pdo->lastInsertId());
                return $userID;
            }
            catch (\PDOException $exception)
            {
                return -1;
            }
        }
    }
}
