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

        // Updates an existing row in the database with the data in the
        // specified Session object, with the exception of the session ID.
        // Returns true on success, false on failure (e.g. session does
        // not exist).
        public function updateSession(Session $session) : bool
        {
            $tableName = DB_TABLE_NAME_SESSION;
            // The session's validity is the only column that can change
            $columnNames = array(DB_COLUMN_NAME_SESSION_VALIDUNTIL);
            $whereColumnNames = array(DB_COLUMN_NAME_SESSION_SESSIONID);

            $updateQueryString = $this->sqlGenerator->getUpdateStatementWithWhereClause(
                $tableName,
                $columnNames,
                $whereColumnNames);

            $updateStatement = $this->pdo->prepare($updateQueryString);
            $updateStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_SESSION_VALIDUNTIL),
                $session->getValidUntil(),
                PDO::PARAM_INT);
            $updateStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_SESSION_SESSIONID),
                $session->getSessionID(),
                PDO::PARAM_INT);

            $updateStatement->execute();

            $numberOfUpdatedRows = $updateStatement->rowCount();
            if ($numberOfUpdatedRows === 1)
                return true;
            else
                return false;
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
                $emailAddress = htmlspecialchars($row[DB_COLUMN_NAME_USER_EMAILADDRESS]);
                $displayName = htmlspecialchars($row[DB_COLUMN_NAME_USER_DISPLAYNAME]);
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

        // Inserts a new row into the database that contains the data in the
        // specified GameRequest object, with the exception of the
        // game request ID. On success, returns the game request ID
        // auto-generated by the database. On failure, returns -1.
        public function insertGameRequest(GameRequest $gameRequest): int
        {
            $tableName = DB_TABLE_NAME_GAMEREQUEST;
            $columnNames = array(
                DB_COLUMN_NAME_GAMEREQUEST_CREATETIME,
                DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDBOARDSIZE,
                DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDSTONECOLOR,
                DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDHANDICAP,
                DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDKOMI,
                DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDKORULE,
                DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDSCORINGSYSTEM,
                DB_COLUMN_NAME_GAMEREQUEST_USERID);

            $insertQueryString = $this->sqlGenerator->getInsertStatement(
                $tableName,
                $columnNames);

            $insertStatement = $this->pdo->prepare($insertQueryString);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUEST_CREATETIME),
                $gameRequest->getCreateTime(),
                PDO::PARAM_INT);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDBOARDSIZE),
                $gameRequest->getRequestedBoardSize(),
                PDO::PARAM_INT);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDSTONECOLOR),
                $gameRequest->getRequestedStoneColor(),
                PDO::PARAM_INT);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDHANDICAP),
                $gameRequest->getRequestedHandicap(),
                PDO::PARAM_INT);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDKOMI),
                $gameRequest->getRequestedKomi(),
                PDO::PARAM_INT);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDKORULE),
                $gameRequest->getRequestedKoRule(),
                PDO::PARAM_INT);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDSCORINGSYSTEM),
                $gameRequest->getRequestedScoringSystem(),
                PDO::PARAM_INT);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUEST_USERID),
                $gameRequest->getUserID(),
                PDO::PARAM_INT);

            try
            {
                $insertStatement->execute();

                $gameRequestID = intval($this->pdo->lastInsertId());
                return $gameRequestID;
            }
            catch (\PDOException $exception)
            {
                return -1;
            }
        }

        // Deletes data for the game request with the specified game request
        // ID from the database. Returns true on success, false on failure
        // (i.e. no game request with the specified ID exists).
        public function deleteGameRequestByGameRequestID(int $gameRequestID): bool
        {
            $tableName = DB_TABLE_NAME_GAMEREQUEST;
            $columnNames = array(
                DB_COLUMN_NAME_GAMEREQUEST_GAMEREQUESTID);

            $deleteQueryString = $this->sqlGenerator->getDeleteStatementWithWhereClause(
                $tableName,
                $columnNames);

            $deleteStatement = $this->pdo->prepare($deleteQueryString);
            $deleteStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUEST_GAMEREQUESTID),
                $gameRequestID,
                PDO::PARAM_INT);

            $deleteStatement->execute();

            $numberOfDeletedRows = $deleteStatement->rowCount();
            if ($numberOfDeletedRows === 1)
                return true;
            else
                return false;
        }

        // Obtains the game requests data for the specified user ID from the
        // database and returns the data as an array object. Returns an empty
        // array if the database has no game requests data for the specified
        // user ID.
        //
        // Array elements are ordered descending by create time (i.e. newest
        // first), then descending by game request ID.
        //
        // On failure, returns null.
        public function findGameRequestsByUserID(int $userID): ?array
        {
            $tableName = DB_TABLE_NAME_GAMEREQUEST;
            $columnNames = array(
                DB_COLUMN_NAME_GAMEREQUEST_GAMEREQUESTID,
                DB_COLUMN_NAME_GAMEREQUEST_CREATETIME,
                DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDBOARDSIZE,
                DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDSTONECOLOR,
                DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDHANDICAP,
                DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDKOMI,
                DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDKORULE,
                DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDSCORINGSYSTEM,
                DB_COLUMN_NAME_GAMEREQUEST_USERID);
            $whereColumnNames = array(DB_COLUMN_NAME_GAMEREQUEST_USERID);
            $orderByColumnNames = array(
                DB_COLUMN_NAME_GAMEREQUEST_CREATETIME,
                DB_COLUMN_NAME_GAMEREQUEST_GAMEREQUESTID);
            $orderings = array(
                false,
                false);

            $selectQueryString = $this->sqlGenerator->getSelectStatementWithOrderByAndWhereClause(
                $tableName,
                $columnNames,
                $whereColumnNames,
                $orderByColumnNames,
                $orderings);

            $selectStatement = $this->pdo->prepare($selectQueryString);

            $selectStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUEST_USERID),
                $userID,
                PDO::PARAM_INT);

            return $this->executePdoStatementFindGameRequests($selectStatement);
        }

        // Obtains all game request data from the database and returns
        // the data as an array object. Returns an empty array if the
        // database has no game requests data.
        //
        // Array elements are ordered ascending by create time (i.e. oldest
        // first), then ascending by game request ID.
        //
        // On failure, returns null.
        public function findGameRequests(): ?array
        {
            $tableName = DB_TABLE_NAME_GAMEREQUEST;
            $columnNames = array(
                DB_COLUMN_NAME_GAMEREQUEST_GAMEREQUESTID,
                DB_COLUMN_NAME_GAMEREQUEST_CREATETIME,
                DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDBOARDSIZE,
                DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDSTONECOLOR,
                DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDHANDICAP,
                DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDKOMI,
                DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDKORULE,
                DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDSCORINGSYSTEM,
                DB_COLUMN_NAME_GAMEREQUEST_USERID);
            $orderByColumnNames = array(
                DB_COLUMN_NAME_GAMEREQUEST_CREATETIME,
                DB_COLUMN_NAME_GAMEREQUEST_GAMEREQUESTID);
            $orderings = array(
                true,
                true);

            $selectQueryString = $this->sqlGenerator->getSelectStatementWithOrderByClause(
                $tableName,
                $columnNames,
                $orderByColumnNames,
                $orderings);

            $selectStatement = $this->pdo->prepare($selectQueryString);

            return $this->executePdoStatementFindGameRequests($selectStatement);
        }

        // Executes the prepared PDOStatement that represents a query to
        // find multiple rows of game request data in the database. Returns
        // an array whose elements are GameRequest objects. Returns null
        // on failure.
        private function executePdoStatementFindGameRequests(\PDOStatement $selectStatement): ?array
        {
            try
            {
                $selectStatement->execute();

                $gameRequests = [];

                while ($row = $selectStatement->fetch(PDO::FETCH_ASSOC))
                {
                    $gameRequestID = intval($row[DB_COLUMN_NAME_GAMEREQUEST_GAMEREQUESTID]);
                    $createTime = intval($row[DB_COLUMN_NAME_GAMEREQUEST_CREATETIME]);
                    $requestedBoardSize = intval($row[DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDBOARDSIZE]);
                    $requestedStoneColor = intval($row[DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDSTONECOLOR]);
                    $requestedHandicap = intval($row[DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDHANDICAP]);
                    $requestedKomi = intval($row[DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDKOMI]);
                    $requestedKoRule = intval($row[DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDKORULE]);
                    $requestedScoringSystem = intval($row[DB_COLUMN_NAME_GAMEREQUEST_REQUESTEDSCORINGSYSTEM]);
                    $userID = intval($row[DB_COLUMN_NAME_GAMEREQUEST_USERID]);

                    $gameRequest = new GameRequest(
                        $gameRequestID,
                        $createTime,
                        $requestedBoardSize,
                        $requestedStoneColor,
                        $requestedHandicap,
                        $requestedKomi,
                        $requestedKoRule,
                        $requestedScoringSystem,
                        $userID);

                    array_push($gameRequests, $gameRequest);
                }

                return $gameRequests;
            }
            catch (\PDOException $exception)
            {
                return null;
            }
        }

        // Obtains all game request pairings data from the database and
        // returns the data as an array object. Returns an empty array if the
        // database has no game request pairings data.
        //
        // The array has no particular order.
        public function findGameRequestPairings(): ?array
        {
            $tableName = DB_TABLE_NAME_GAMEREQUESTPAIRING;
            $columnNames = array(
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_GAMEREQUESTPAIRINGID,
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_CREATETIME,
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_BLACKPLAYERGAMEREQUESTID,
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_WHITEPLAYERGAMEREQUESTID,
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_BOARDSIZE,
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_HANDICAP,
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_KOMI,
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_KORULE,
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_SCORINGSYSTEM,
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_ISREJECTED);

            $selectQueryString = $this->sqlGenerator->getSelectStatement(
                $tableName,
                $columnNames);

            $selectStatement = $this->pdo->prepare($selectQueryString);

            try
            {
                $selectStatement->execute();

                $gameRequestPairings = [];

                while ($row = $selectStatement->fetch(PDO::FETCH_ASSOC))
                {
                    $gameRequestPairingID = intval($row[DB_COLUMN_NAME_GAMEREQUESTPAIRING_GAMEREQUESTPAIRINGID]);
                    $createTime = intval($row[DB_COLUMN_NAME_GAMEREQUESTPAIRING_CREATETIME]);
                    $blackPlayerGameRequestID = intval($row[DB_COLUMN_NAME_GAMEREQUESTPAIRING_BLACKPLAYERGAMEREQUESTID]);
                    $whitePlayerGameRequestID = intval($row[DB_COLUMN_NAME_GAMEREQUESTPAIRING_WHITEPLAYERGAMEREQUESTID]);
                    $boardSize = intval($row[DB_COLUMN_NAME_GAMEREQUESTPAIRING_BOARDSIZE]);
                    $handicap = intval($row[DB_COLUMN_NAME_GAMEREQUESTPAIRING_HANDICAP]);
                    $komi = floatval($row[DB_COLUMN_NAME_GAMEREQUESTPAIRING_KOMI]);
                    $koRule = intval($row[DB_COLUMN_NAME_GAMEREQUESTPAIRING_KORULE]);
                    $scoringSystem = intval($row[DB_COLUMN_NAME_GAMEREQUESTPAIRING_SCORINGSYSTEM]);
                    $rejected = boolval($row[DB_COLUMN_NAME_GAMEREQUESTPAIRING_ISREJECTED]);

                    $gameRequestPairing = new GameRequestPairing(
                        $gameRequestPairingID,
                        $createTime,
                        $blackPlayerGameRequestID,
                        $whitePlayerGameRequestID,
                        $boardSize,
                        $handicap,
                        $komi,
                        $koRule,
                        $scoringSystem,
                        $rejected);

                    array_push($gameRequestPairings, $gameRequestPairing);
                }

                return $gameRequestPairings;
            }
            catch (\PDOException $exception)
            {
                return null;
            }
        }

        // Inserts a new row into the database that contains the data in the
        // specified GameRequestPairing object, with the exception of the
        // game request pairing ID. On success, returns the
        // game request pairing ID  auto-generated by the database. On failure,
        // returns -1.
        public function insertGameRequestPairing(GameRequestPairing $gameRequestPairing): int
        {
            $tableName = DB_TABLE_NAME_GAMEREQUESTPAIRING;
            $columnNames = array(
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_CREATETIME,
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_BLACKPLAYERGAMEREQUESTID,
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_WHITEPLAYERGAMEREQUESTID,
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_BOARDSIZE,
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_HANDICAP,
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_KOMI,
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_KORULE,
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_SCORINGSYSTEM,
                DB_COLUMN_NAME_GAMEREQUESTPAIRING_ISREJECTED);

            $insertQueryString = $this->sqlGenerator->getInsertStatement(
                $tableName,
                $columnNames);

            $insertStatement = $this->pdo->prepare($insertQueryString);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUESTPAIRING_CREATETIME),
                $gameRequestPairing->getCreateTime(),
                PDO::PARAM_INT);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUESTPAIRING_BLACKPLAYERGAMEREQUESTID),
                $gameRequestPairing->getBlackPlayerGameRequestID(),
                PDO::PARAM_INT);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUESTPAIRING_WHITEPLAYERGAMEREQUESTID),
                $gameRequestPairing->getWhitePlayerGameRequestID(),
                PDO::PARAM_INT);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUESTPAIRING_BOARDSIZE),
                $gameRequestPairing->getBoardSize(),
                PDO::PARAM_INT);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUESTPAIRING_HANDICAP),
                $gameRequestPairing->getHandicap(),
                PDO::PARAM_INT);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUESTPAIRING_KOMI),
                strval($gameRequestPairing->getKomi()),
                PDO::PARAM_STRING);  // PDO has no PARAM_FLOAT, float values must be bound as string :-(
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUESTPAIRING_KORULE),
                $gameRequestPairing->getKoRule(),
                PDO::PARAM_INT);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUESTPAIRING_SCORINGSYSTEM),
                $gameRequestPairing->getScoringSystem(),
                PDO::PARAM_INT);
            $insertStatement->bindValue(
                $this->sqlGenerator->getParameterNameForColumName(DB_COLUMN_NAME_GAMEREQUESTPAIRING_ISREJECTED),
                $gameRequestPairing->isRejected(),
                PDO::PARAM_BOOL);

            try
            {
                $insertStatement->execute();

                $gameRequestPairingID = intval($this->pdo->lastInsertId());
                return $gameRequestPairingID;
            }
            catch (\PDOException $exception)
            {
                return -1;
            }
        }
    }
}
