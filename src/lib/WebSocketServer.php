<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    use \Ratchet\MessageComponentInterface;
    use \Ratchet\ConnectionInterface;

    class WebSocketServer implements MessageComponentInterface
    {
        private $clients;
        private $config;

        public function __construct(Config $config)
        {
            $this->clients = [];
            $this->config = $config;

            // We immediately discard the DbAccess object because we don't
            // really need anything from the database. We try to establish
            // a database connection merely to detect configuration problems
            // immediately upon startup of the WebSocket server.
            new DbAccess($this->config);
            echo "Successfully established database connection\n";

            echo "WebSocket server is now running\n";
        }

        private function getWebSocketClient(ConnectionInterface $conn) : ?WebSocketClient
        {
            $resourceID = $conn->resourceId;
            if (array_key_exists($resourceID, $this->clients))
                return $this->clients[$resourceID];
            else
                return null;
        }

        private function getWebSocketClientByUserID(int $userID) : ?WebSocketClient
        {
            foreach ($this->clients as $webSocketClient)
            {
                if ($webSocketClient->getSession()->getUserID() === $userID)
                    return $webSocketClient;
            }
            return null;
        }

        public function onOpen(ConnectionInterface $conn): void
        {
            $webSocketClient = new WebSocketClient($conn);
            $this->clients[$conn->resourceId] = $webSocketClient;
            echo "New connection! ({$conn->resourceId})\n";
        }

        public function onMessage(ConnectionInterface $from, $message): void
        {
            $webSocketMessage = WebSocketMessage::tryCreateMessageFromJson($message);
            if ($webSocketMessage === null)
                return;

            $webSocketRequestType = $webSocketMessage->getMessageType();
            echo "Received message from connection {$from->resourceId}: $webSocketRequestType\n";

            $webSocketClient = $this->getWebSocketClient($from);
            $webSocketResponseType = $this->webSocketResponseTypeForRequestType($webSocketRequestType);

            $authenticationAndSessionHandlingSuccess = $this->handleAuthenticationAndSession(
                $webSocketClient,
                $webSocketRequestType,
                $webSocketResponseType);
            if (! $authenticationAndSessionHandlingSuccess)
                return;

            switch ($webSocketRequestType)
            {
                case WEBSOCKET_REQUEST_TYPE_LOGIN:
                    $this->handleLogin($webSocketClient, $webSocketMessage->getData(), $webSocketResponseType);
                    break;
                case WEBSOCKET_REQUEST_TYPE_LOGOUT:
                    $this->handleLogout($webSocketClient, $webSocketResponseType);
                    break;
                case WEBSOCKET_REQUEST_TYPE_REGISTERACCOUNT:
                    $this->handleRegisterAccount($webSocketClient, $webSocketMessage->getData(), $webSocketResponseType);
                    break;
                case WEBSOCKET_REQUEST_TYPE_VALIDATESESSION:
                    $this->handleValidateSession($webSocketClient, $webSocketMessage->getData(), $webSocketResponseType);
                    break;
                case WEBSOCKET_REQUEST_TYPE_SUBMITNEWGAMEREQUEST:
                    $this->handleSubmitNewGameRequest($webSocketClient, $webSocketMessage->getData(), $webSocketResponseType);
                    break;
                case WEBSOCKET_REQUEST_TYPE_GETGAMEREQUESTS:
                    $this->handleGetGameRequests($webSocketClient, $webSocketResponseType);
                    break;
                case WEBSOCKET_REQUEST_TYPE_CANCELGAMEREQUEST:
                    $this->handleCancelGameRequest($webSocketClient, $webSocketMessage->getData(), $webSocketResponseType);
                    break;
                case WEBSOCKET_REQUEST_TYPE_GETGAMEREQUESTPAIRING:
                    $this->handleGetGameRequestPairing($webSocketClient, $webSocketMessage->getData(), $webSocketResponseType);
                    break;
                case WEBSOCKET_REQUEST_TYPE_CONFIRMGAMEREQUESTPAIRING:
                    $this->handleConfirmGameRequestPairing($webSocketClient, $webSocketMessage->getData(), $webSocketResponseType);
                    break;
                case WEBSOCKET_REQUEST_TYPE_GETGAMESINPROGRESS:
                    $this->handleGetGamesInProgress($webSocketClient, $webSocketResponseType);
                    break;
                case WEBSOCKET_REQUEST_TYPE_GETGAMEINPROGRESSWITHMOVES:
                    $this->handleGetGameInProgressWithMoves($webSocketClient, $webSocketMessage->getData(), $webSocketResponseType);
                    break;
                case WEBSOCKET_REQUEST_TYPE_SUBMITNEWGAMEMOVE:
                    $this->handleSubmitNewGameMove($webSocketClient, $webSocketMessage->getData(), $webSocketResponseType);
                    break;
                default:
                    echo "Unknown message type {$webSocketMessage->getMessageType()}\n";
            }
        }

        public function onClose(ConnectionInterface $conn): void
        {
            unset($this->clients[$conn->resourceId]);
            echo "Connection {$conn->resourceId} has disconnected\n";
        }

        public function onError(ConnectionInterface $conn, \Exception $e): void
        {
            echo "An error has occurred: {$e->getMessage()}\n";
            $webSocketClient = $this->getWebSocketClient($conn);
            $webSocketClient->invalidateAuthentication();
            $conn->close();
        }

        private function webSocketResponseTypeForRequestType(string $webSocketRequestType) : string
        {
            switch ($webSocketRequestType)
            {
                case WEBSOCKET_REQUEST_TYPE_LOGIN:
                    return WEBSOCKET_RESPONSE_TYPE_LOGIN;
                case WEBSOCKET_REQUEST_TYPE_LOGOUT:
                    return WEBSOCKET_RESPONSE_TYPE_LOGOUT;
                case WEBSOCKET_REQUEST_TYPE_REGISTERACCOUNT:
                    return WEBSOCKET_RESPONSE_TYPE_REGISTERACCOUNT;
                case WEBSOCKET_REQUEST_TYPE_VALIDATESESSION:
                    return WEBSOCKET_RESPONSE_TYPE_VALIDATESESSION;
                case WEBSOCKET_REQUEST_TYPE_SUBMITNEWGAMEREQUEST:
                    return WEBSOCKET_RESPONSE_TYPE_SUBMITNEWGAMEREQUEST;
                case WEBSOCKET_REQUEST_TYPE_GETGAMEREQUESTS:
                    return WEBSOCKET_RESPONSE_TYPE_GETGAMEREQUESTS;
                case WEBSOCKET_REQUEST_TYPE_CANCELGAMEREQUEST:
                    return WEBSOCKET_RESPONSE_TYPE_CANCELGAMEREQUEST;
                case WEBSOCKET_REQUEST_TYPE_GETGAMEREQUESTPAIRING:
                    return WEBSOCKET_RESPONSE_TYPE_GETGAMEREQUESTPAIRING;
                case WEBSOCKET_REQUEST_TYPE_CONFIRMGAMEREQUESTPAIRING:
                    return WEBSOCKET_RESPONSE_TYPE_CONFIRMGAMEREQUESTPAIRING;
                case WEBSOCKET_REQUEST_TYPE_GETGAMESINPROGRESS:
                    return WEBSOCKET_RESPONSE_TYPE_GETGAMESINPROGRESS;
                case WEBSOCKET_REQUEST_TYPE_GETGAMEINPROGRESSWITHMOVES:
                    return WEBSOCKET_RESPONSE_TYPE_GETGAMEINPROGRESSWITHMOVES;
                case WEBSOCKET_REQUEST_TYPE_SUBMITNEWGAMEMOVE:
                    return WEBSOCKET_RESPONSE_TYPE_SUBMITNEWGAMEMOVE;
                default:
                    throw new \Exception("Unsupported request type $webSocketRequestType");
            }
        }

        // Performs authentication and session checks for the specified
        // WebSocket request type, using the specified WebSocketClient object.
        //
        // If the specified WebSocket request type does not require
        // authentication, the WebSocketClient must not be in authenticated
        // state.
        //
        // If the specified WebSocket request type requires authentication,
        // the WebSocketClient must be in authenticated state. In addition,
        // the session must still be valid. If these checks are successful,
        // the session's validity period is extended.
        //
        // Returns true if all checks passed and all database operations were
        // successful. The caller is now allowed to continue to process the
        // WebSocket request.
        //
        // Returns false if any check failed or any error occurred during a
        // database operation. Before it returns, this method sends a
        // WebSocket response with an appropriate error message. The caller
        // must not process the WebSocket request any further. If the
        // WebSocketClient was in authenticated state, it becomes
        // unauthenticated.
        private function handleAuthenticationAndSession(
            WebSocketClient $webSocketClient,
            string $webSocketRequestType,
            string $webSocketResponseType) : bool
        {
            $webSocketRequestTypeNeedsAuthentication =
                $this->webSocketRequestTypeNeedsAuthentication($webSocketRequestType);

            if ($webSocketRequestTypeNeedsAuthentication)
            {
                if (! $webSocketClient->isAuthenticated())
                {
                    $errorMessage = "Client is not authenticated";
                    $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                    return false;
                }
                else
                {
                    $session = $webSocketClient->getSession();
                    $now = time();
                    if ($session->getValidUntil() < $now)
                    {
                        $webSocketClient->invalidateAuthentication();

                        $errorMessage = "Session is no longer valid";
                        $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                        return false;
                    }

                    $newValidUntil = $now + $this->config->sessionValidityDuration;
                    if ($newValidUntil === $session->getValidUntil())
                    {
                        // Data will not change, so no need to perform a
                        // database update. This is not just an optimization,
                        // it's also necessary because MySQL does not actually
                        // perform an update if nothing has changed, which
                        // would cause DbAccess to think that the update failed
                        // for some reason.
                        return true;
                    }

                    $session->setValidUntil($newValidUntil);

                    $dbAccess = new DbAccess($this->config);

                    $success = $dbAccess->updateSession($session);
                    if ($success)
                    {
                        return true;
                    }
                    else
                    {
                        $webSocketClient->invalidateAuthentication();

                        $errorMessage = "Failed to extend session validity";
                        $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                        return false;
                    }
                }
            }
            else
            {
                if ($webSocketClient->isAuthenticated())
                {
                    $errorMessage = "Client is already authenticated";
                    $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                    return false;
                }
                else
                {
                    return true;
                }
            }
        }

        private function webSocketRequestTypeNeedsAuthentication(string $webSocketRequestType) : bool
        {
            switch ($webSocketRequestType)
            {
                case WEBSOCKET_REQUEST_TYPE_LOGIN:
                case WEBSOCKET_REQUEST_TYPE_REGISTERACCOUNT:
                case WEBSOCKET_REQUEST_TYPE_VALIDATESESSION:
                    return false;
                default:
                    return true;
            }
        }

        private function handleLogin(WebSocketClient $webSocketClient, array $messageData, string $webSocketResponseType): void
        {
            // Use the same message for both failures - we don't want to give
            // an attacker a hint whether he guessed the email address
            // correctly
            $webSocketResponseDefaultErrorMessage = "Invalid email address or password";

            $emailAddress = $messageData[WEBSOCKET_MESSAGEDATA_KEY_EMAILADDRESS];
            $password = $messageData[WEBSOCKET_MESSAGEDATA_KEY_PASSWORD];

            $dbAccess = new DbAccess($this->config);

            $user = $dbAccess->findUserByEmailAddress($emailAddress);
            if ($user === null)
            {
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $webSocketResponseDefaultErrorMessage);
                return;
            }

            $passwordIsValid = $this->verifyPassword($password, $user->getPasswordHash());
            if (! $passwordIsValid)
            {
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $webSocketResponseDefaultErrorMessage);
                return;
            }

            $sessionID = SESSION_SESSIONID_DEFAULT;
            $sessionKey = $this->generateSessionKey();
            $userID = $user->getUserID();
            $validUntil = time() + $this->config->sessionValidityDuration;
            $session = new Session($sessionID, $sessionKey, $userID, $validUntil);

            $sessionID = $dbAccess->insertSession($session);
            if ($sessionID === -1)
            {
                $errorMessage = "Failed to store session data in database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $session->setSessionID($sessionID);
            $webSocketClient->authenticate($session);

            $webSocketResponseData =
                [
                    WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => true,
                    WEBSOCKET_MESSAGEDATA_KEY_SESSIONKEY => $sessionKey,
                    WEBSOCKET_MESSAGEDATA_KEY_USERINFO => $user->toJsonObject()
                ];
            $webSocketMessage = new WebSocketMessage($webSocketResponseType, $webSocketResponseData);
            $webSocketClient->send($webSocketMessage);
        }

        private function verifyPassword(string $password, $passwordHash): bool
        {
            // Takes the salt in the password hash into account
            $passwordIsValid = password_verify($password, $passwordHash);

            return $passwordIsValid;
        }

        private function generateSessionKey(): string
        {
            // TODO: Generate a v4 UUID. Alas, PHP does not have built-in
            // support for generating UUIDs.

            // We would have preferred to use session_start() + session_id()
            // to generate the session key, but we encountered the following
            // error  message:
            //   Warning: session_start(): Cannot start session when headers already sent
            // Due to lack of time to investigate the problem, we now use
            // uniqid() although it looks as if this has less unique'ness
            // than session_id().
            $sessionID = uniqid();

            return $sessionID;
        }

        private function handleLogout(WebSocketClient $webSocketClient, string $webSocketResponseType): void
        {
            $sessionKey = $webSocketClient->getSession()->getSessionKey();

            // The client loses its authentication regardless of the
            // outcome of the subsequent database operation
            $webSocketClient->invalidateAuthentication();

            $dbAccess = new DbAccess($this->config);
            $success = $dbAccess->deleteSessionBySessionKey($sessionKey);

            if ($success)
            {
                $webSocketResponseData =
                    [
                        WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => true,
                    ];
                $webSocketMessage = new WebSocketMessage($webSocketResponseType, $webSocketResponseData);
                $webSocketClient->send($webSocketMessage);
            }
            else
            {
                $errorMessage = "Invalid session key";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
            }
        }

        private function handleRegisterAccount(WebSocketClient $webSocketClient, array $messageData, string $webSocketResponseType): void
        {
            $emailAddress = $messageData[WEBSOCKET_MESSAGEDATA_KEY_EMAILADDRESS];
            $displayName = $messageData[WEBSOCKET_MESSAGEDATA_KEY_DISPLAYNAME];
            $password = $messageData[WEBSOCKET_MESSAGEDATA_KEY_PASSWORD];

            $dbAccess = new DbAccess($this->config);

            $user = $dbAccess->findUserByEmailAddress($emailAddress);
            if ($user !== null)
            {
                $errorMessage = "Another account with this email address already exists";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $user = $dbAccess->findUserByDisplayName($displayName);
            if ($user !== null)
            {
                $errorMessage = "Another account with this display name already exists";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $userID = USER_USERID_DEFAULT;
            $passwordHash = $this->generatePasswordHash($password);
            $user = new User($userID, $emailAddress, $displayName, $passwordHash);

            $userID = $dbAccess->insertUser($user);
            if ($userID === -1)
            {
                $errorMessage = "Failed to store user data in database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $user->setUserID($userID);

            $webSocketResponseData =
                [
                    WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => true,
                ];
            $webSocketMessage = new WebSocketMessage($webSocketResponseType, $webSocketResponseData);
            $webSocketClient->send($webSocketMessage);
        }

        private function generatePasswordHash(string $password): string
        {
            // Let PHP decide which algorithm to use. This may change over time
            // when newer PHP versions decide that a more secure algorithm
            // is required.
            $hashAlgorithmType = PASSWORD_DEFAULT;

            // Adds a random salt
            $passwordHash = password_hash($password, $hashAlgorithmType);

            return $passwordHash;
        }

        private function handleValidateSession(WebSocketClient $webSocketClient, array $messageData, string $webSocketResponseType): void
        {
            $sessionKey = $messageData[WEBSOCKET_MESSAGEDATA_KEY_SESSIONKEY];

            $dbAccess = new DbAccess($this->config);

            $session = $dbAccess->findSessionByKey($sessionKey);
            if ($session !== null)
            {
                $user = $dbAccess->findUserByID($session->getUserID());
                if ($user !== null)
                {
                    $webSocketClient->authenticate($session);

                    $webSocketResponseData =
                        [
                            WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => true,
                            WEBSOCKET_MESSAGEDATA_KEY_SESSIONKEY => $sessionKey,
                            WEBSOCKET_MESSAGEDATA_KEY_USERINFO => $user->toJsonObject()
                        ];
                    $webSocketMessage = new WebSocketMessage($webSocketResponseType, $webSocketResponseData);
                    $webSocketClient->send($webSocketMessage);
                }
                else
                {
                    $dbAccess->deleteSessionBySessionKey($sessionKey);

                    $errorMessage = "Session has invalid user ID";
                    $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                }
            }
            else
            {
                $this->sendInvalidSession($webSocketClient, $webSocketResponseType);
            }
        }

        private function handleSubmitNewGameRequest(WebSocketClient $webSocketClient, array $messageData, string $webSocketResponseType): void
        {
            $requestedBoardSize = intval($messageData[WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDBOARDSIZE]);
            $requestedStoneColor = intval($messageData[WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDSTONECOLOR]);
            $requestedHandicap = intval($messageData[WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDHANDICAP]);
            $requestedKomi = intval($messageData[WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDKOMI]);
            $requestedKoRule = intval($messageData[WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDKORULE]);
            $requestedScoringSystem = intval($messageData[WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDSCORINGSYSTEM]);

            $dbAccess = new DbAccess($this->config);

            $gameRequestID = GAMEREQUEST_GAMEREQUESTID_DEFAULT;
            $createTime = time();
            $userID = $webSocketClient->getSession()->getUserID();
            $state = GAMEREQUEST_STATE_UNPAIRED;
            $gameID = GAMEREQUEST_GAMEID_DEFAULT;
            $gameRequest = new GameRequest(
                $gameRequestID,
                $createTime,
                $requestedBoardSize,
                $requestedStoneColor,
                $requestedHandicap,
                $requestedKomi,
                $requestedKoRule,
                $requestedScoringSystem,
                $userID,
                $state,
                $gameID);

            $gameRequestID = $dbAccess->insertGameRequest($gameRequest);
            if ($gameRequestID === -1)
            {
                $errorMessage = "Failed to store game request in database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $gameRequest->setGameRequestID($gameRequestID);

            $webSocketResponseData =
                [
                    WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => true,
                ];

            $matchMaker = new MatchMaker($dbAccess);
            $gameRequestPairing = $matchMaker->tryFindMatchingGameRequest($gameRequest);
            if ($gameRequestPairing !== null)
            {
                $webSocketResponseData[WEBSOCKET_MESSAGEDATA_KEY_GAMEREQUESTPAIRING] = $gameRequestPairing->toJsonObject();
            }

            $webSocketMessage = new WebSocketMessage($webSocketResponseType, $webSocketResponseData);
            $webSocketClient->send($webSocketMessage);

            if ($gameRequestPairing !== null)
            {
                if ($gameRequestPairing->getBlackPlayer()->getUserID() === $webSocketClient->getSession()->getUserID())
                    $otherUserID = $gameRequestPairing->getWhitePlayer()->getUserID();
                else
                    $otherUserID = $gameRequestPairing->getBlackPlayer()->getUserID();

                // Notify all clients where the other user is online
                // TODO: Retrieve the data only once from the database!!!
                $webSocketMessageType = WEBSOCKET_MESSAGE_TYPE_GAMEREQUESTPAIRINGFOUND;
                foreach ($this->clients as $otherUserWebSocketClient)
                {
                    if ($otherUserWebSocketClient->getSession()->getUserID() === $otherUserID)
                        $this->findAndSendGameRequests($otherUserWebSocketClient, $webSocketMessageType, $dbAccess);
                }
            }
        }

        private function handleGetGameRequests(WebSocketClient $webSocketClient, string $webSocketResponseType): void
        {
            $dbAccess = new DbAccess($this->config);

            $this->findAndSendGameRequests($webSocketClient, $webSocketResponseType, $dbAccess);
        }

        private function handleCancelGameRequest(WebSocketClient $webSocketClient, array $messageData, string $webSocketResponseType): void
        {
            $gameRequestID = $messageData[WEBSOCKET_MESSAGEDATA_KEY_GAMEREQUESTID];

            $dbAccess = new DbAccess($this->config);

            $gameRequest = $dbAccess->findGameRequestByGameRequestID($gameRequestID);
            if ($gameRequest === null)
            {
                $errorMessage = "Invalid game request ID";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }
            else if ($gameRequest->getState() !== GAMEREQUEST_STATE_UNPAIRED)
            {
                $errorMessage = "Game request is already paired";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            // Must delete pairings (active and rejected) first before we can
            // delete the game request itself
            // TODO: Add transaction that spans all database operations
            $dbAccess->deleteGameRequestPairingsByGameRequestID($gameRequestID);
            $success = $dbAccess->deleteGameRequestByGameRequestID($gameRequestID);
            if ($success)
            {
                $this->findAndSendGameRequests($webSocketClient, $webSocketResponseType, $dbAccess);
            }
            else
            {
                $errorMessage = "Failed to delete game request";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
            }
        }

        private function handleGetGameRequestPairing(WebSocketClient $webSocketClient, array $messageData, string $webSocketResponseType) : void
        {
            $gameRequestID = $messageData[WEBSOCKET_MESSAGEDATA_KEY_GAMEREQUESTID];

            $dbAccess = new DbAccess($this->config);

            $gameRequestPairing = $dbAccess->findGameRequestPairingByGameRequestID($gameRequestID);
            if ($gameRequestPairing === null)
            {
                $errorMessage = "Failed to retrieve game request pairing data from database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            // No error handling required, we trust that references are OK
            // because of foreign key constraints in the database
            $blackPlayerGameRequestID = $gameRequestPairing->getBlackPlayerGameRequestID();
            $blackPlayerGameRequest = $dbAccess->findGameRequestByGameRequestID($blackPlayerGameRequestID);
            $blackPlayer = $dbAccess->findUserByID($blackPlayerGameRequest->getUserID());
            $gameRequestPairing->setBlackPlayer($blackPlayer);
            $whitePlayerGameRequestID = $gameRequestPairing->getWhitePlayerGameRequestID();
            $whitePlayerGameRequest = $dbAccess->findGameRequestByGameRequestID($whitePlayerGameRequestID);
            $whitePlayer = $dbAccess->findUserByID($whitePlayerGameRequest->getUserID());
            $gameRequestPairing->setWhitePlayer($whitePlayer);

            $webSocketResponseData =
                [
                    WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => true,
                    WEBSOCKET_MESSAGEDATA_KEY_GAMEREQUESTPAIRING => $gameRequestPairing->toJsonObject()
                ];
            $webSocketMessage = new WebSocketMessage($webSocketResponseType, $webSocketResponseData);
            $webSocketClient->send($webSocketMessage);
        }

        private function handleConfirmGameRequestPairing(WebSocketClient $webSocketClient, array $messageData, string $webSocketResponseType) : void
        {
            $gameRequestID = $messageData[WEBSOCKET_MESSAGEDATA_KEY_GAMEREQUESTID];

            $dbAccess = new DbAccess($this->config);

            $gameRequest = $dbAccess->findGameRequestByGameRequestID($gameRequestID);
            if ($gameRequest === null)
            {
                $errorMessage = "Failed to retrieve game request data from database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $gameRequest->setState(GAMEREQUEST_STATE_CONFIRMEDPAIRING);

            $success = $dbAccess->updateGameRequest($gameRequest);
            if (! $success)
            {
                $errorMessage = "Failed to update game request data in database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $this->findAndSendGameRequests($webSocketClient, $webSocketResponseType, $dbAccess);
        }

        private function handleGetGamesInProgress(WebSocketClient $webSocketClient, string $webSocketResponseType) : void
        {
            $dbAccess = new DbAccess($this->config);

            $userID = $webSocketClient->getSession()->getUserID();
            $gamesInProgress = $dbAccess->findGamesInProgressByUserID($userID);
            if ($gamesInProgress === null)
            {
                $errorMessage = "Failed to retrieve games in progress data from database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $gamesInProgressJSON = array();
            foreach ($gamesInProgress as $gameInProgress)
            {
                $success = $this->addDataToGameInProgress(
                    $webSocketClient,
                    $webSocketResponseType,
                    $gameInProgress,
                    $dbAccess);
                if (! $success)
                    return;  // helper function has already sent WebSocket error message

                array_push($gamesInProgressJSON, $gameInProgress->toJsonObject());
            }

            $webSocketResponseData =
                [
                    WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => true,
                    WEBSOCKET_MESSAGEDATA_KEY_GAMESINPROGRESS => $gamesInProgressJSON
                ];
            $webSocketMessage = new WebSocketMessage($webSocketResponseType, $webSocketResponseData);
            $webSocketClient->send($webSocketMessage);
        }

        private function handleGetGameInProgressWithMoves(WebSocketClient $webSocketClient, array $messageData, string $webSocketResponseType) : void
        {
            $gameID = $messageData[WEBSOCKET_MESSAGEDATA_KEY_GAMEID];

            $dbAccess = new DbAccess($this->config);

            $userID = $webSocketClient->getSession()->getUserID();
            $gameInProgress = $this->getGameInProgressWithoutAdditionalData(
                $webSocketClient,
                $webSocketResponseType,
                $userID,
                $gameID,
                $dbAccess);
            if ($gameInProgress === null)
                return;  // helper function has already sent WebSocket error message

            $success = $this->addDataToGameInProgress(
                $webSocketClient,
                $webSocketResponseType,
                $gameInProgress,
                $dbAccess);
            if (! $success)
                return;  // helper function has already sent WebSocket error message

            $gameMoves = $dbAccess->findGameMovesByGameID($gameID);
            if ($gameMoves === null)
            {
                $errorMessage = "Failed to retrieve game moves data from database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $gameMovesJSON = array();
            foreach ($gameMoves as $gameMove)
                array_push($gameMovesJSON, $gameMove->toJsonObject());

            $webSocketResponseData =
                [
                    WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => true,
                    WEBSOCKET_MESSAGEDATA_KEY_GAMEINPROGRESS => $gameInProgress->toJsonObject(),
                    WEBSOCKET_MESSAGEDATA_KEY_GAMEMOVES => $gameMovesJSON
                ];
            $webSocketMessage = new WebSocketMessage($webSocketResponseType, $webSocketResponseData);
            $webSocketClient->send($webSocketMessage);
        }

        private function handleSubmitNewGameMove(WebSocketClient $webSocketClient, array $messageData, string $webSocketResponseType) : void
        {
            $gameID = $messageData[WEBSOCKET_MESSAGEDATA_KEY_GAMEID];
            $moveType = $messageData[WEBSOCKET_MESSAGEDATA_KEY_MOVETYPE];
            $moveColor = $messageData[WEBSOCKET_MESSAGEDATA_KEY_MOVECOLOR];
            if ($moveType === GAMEMOVE_MOVETYPE_PLAY)
            {
                $vertexX = $messageData[WEBSOCKET_MESSAGEDATA_KEY_VERTEXX];
                $vertexY = $messageData[WEBSOCKET_MESSAGEDATA_KEY_VERTEXY];
            }
            else
            {
                $vertexX = GAMEMOVE_VERTEXX_DEFAULT;
                $vertexY = GAMEMOVE_VERTEXY_DEFAULT;
            }

            $gameMoveID = GAMEMOVE_GAMEMOVEID_DEFAULT;
            $createTime = time();
            $gameMove = new GameMove(
                $gameMoveID,
                $createTime,
                $gameID,
                $moveType,
                $moveColor,
                $vertexX,
                $vertexY);

            $dbAccess = new DbAccess($this->config);

            // Validate that the supplied game is in progress, i.e. it's allowed
            // to add moves
            $userID = $webSocketClient->getSession()->getUserID();
            $gameInProgress = $this->getGameInProgressWithoutAdditionalData(
                $webSocketClient,
                $webSocketResponseType,
                $userID,
                $gameID,
                $dbAccess);
            if ($gameInProgress === null)
                return;  // helper function has already sent WebSocket error message

            if ($gameInProgress->getState() !== GAME_STATE_INPROGRESS_PLAYING)
            {
                $errorMessage = "Game in progress is not in a state that allows playing moves";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $nextMoveColor = $this->getNextMoveColor($gameInProgress, $dbAccess);
            if ($nextMoveColor !== $gameMove->getMoveColor())
            {
                $errorMessage = "Not this player's turn to move";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            // TODO: Validate whether the move is legal to play, i.e.
            // - Is the intersection occupied?
            // - Is the move suicidal?
            // - Is the move a Ko?

            $gameMoveID = $dbAccess->insertGameMove($gameMove);
            if ($gameMoveID === -1)
            {
                $errorMessage = "Failed to store game move in database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $gameMove->setGameMoveID($gameMoveID);

            $webSocketResponseData =
                [
                    WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => true,
                    WEBSOCKET_MESSAGEDATA_KEY_GAMEMOVE => $gameMove->toJsonObject()
                ];
            $webSocketMessage = new WebSocketMessage($webSocketResponseType, $webSocketResponseData);
            $webSocketClient->send($webSocketMessage);
        }

        private function getGameInProgressWithoutAdditionalData(
            WebSocketClient $webSocketClient,
            string $webSocketResponseType,
            int $userID,
            int $gameID,
            DbAccess $dbAccess) : ?Game
        {
            $gamesInProgress = $dbAccess->findGamesInProgressByUserID($userID);
            if ($gamesInProgress === null)
            {
                $errorMessage = "Failed to retrieve games in progress data from database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return null;
            }

            foreach ($gamesInProgress as $gameInProgress)
            {
                if ($gameInProgress->getGameID() === $gameID)
                    return $gameInProgress;
            }

            $errorMessage = "Failed to retrieve game in progress data from database";
            $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);

            return null;
        }

        private function addDataToGameInProgress(
            WebSocketClient $webSocketClient,
            string $webSocketResponseType,
            Game $gameInProgress,
            DbAccess $dbAccess) : bool
        {
            $users = $dbAccess->findUsersByGameID($gameInProgress->getGameID());
            if ($users === null)
            {
                $errorMessage = "Failed to retrieve users for game in progress from database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return false;
            }
            $gameInProgress->setBlackPlayer($users[COLOR_BLACK]);
            $gameInProgress->setWhitePlayer($users[COLOR_WHITE]);

            if ($gameInProgress->getState() === GAME_STATE_INPROGRESS_PLAYING)
            {
                $nextMoveColor = $this->getNextMoveColor($gameInProgress, $dbAccess);
                $gameInProgress->setNextMoveColor($nextMoveColor);
            }

            $numberOfMovesPlayed = $dbAccess->findNumberOfMovesPlayed($gameInProgress->getGameID());
            if ($numberOfMovesPlayed === -1)
            {
                $errorMessage = "Failed to retrieve number of moves played from database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return false;
            }
            $gameInProgress->setNumberOfMovesPlayed($numberOfMovesPlayed);

            return true;
        }

        private function getNextMoveColor(Game $gameInProgress, DbAccess $dbAccess) : int
        {
            $lastGameMove = $dbAccess->findLastGameMove($gameInProgress->getGameID());
            if ($lastGameMove === null)
            {
                if ($gameInProgress->getHandicap() === 0)
                    return COLOR_BLACK;
                else
                    return COLOR_WHITE;
            }
            else
            {
                if ($lastGameMove->getMoveColor() === COLOR_BLACK)
                    return COLOR_WHITE;
                else
                    return COLOR_BLACK;
            }
        }

        private function findAndSendGameRequests(WebSocketClient $webSocketClient, string $webSocketMessageType, DbAccess $dbAccess): void
        {
            $userID = $webSocketClient->getSession()->getUserID();
            $gameRequests = $dbAccess->findGameRequestsByUserID($userID);
            if ($gameRequests === null)
            {
                $errorMessage = "Failed to retrieve game requests data from database";
                $this->sendErrorMessage($webSocketClient, $webSocketMessageType, $errorMessage);
                return;
            }

            $gameRequestsJSON = array();
            foreach ($gameRequests as $gameRequest)
            {
                // A user who has already confirmed a pairing no longer wants
                // to see that game request
                if ($gameRequest->getState() === GAMEREQUEST_STATE_CONFIRMEDPAIRING)
                    continue;

                array_push($gameRequestsJSON, $gameRequest->toJsonObject());
            }

            $webSocketMessageData =
                [
                    WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => true,
                    WEBSOCKET_MESSAGEDATA_KEY_GAMEREQUESTS => $gameRequestsJSON
                ];
            $webSocketMessage = new WebSocketMessage($webSocketMessageType, $webSocketMessageData);
            $webSocketClient->send($webSocketMessage);
        }

        private function sendInvalidSession(WebSocketClient $webSocketClient, string $webSocketMessageType): void
        {
            $errorMessage = "Invalid session key";
            $this->sendErrorMessage($webSocketClient, $webSocketMessageType, $errorMessage);
        }

        private function sendErrorMessage(WebSocketClient $webSocketClient, string $webSocketMessageType, string $errorMessage): void
        {
            echo $errorMessage . "\n";
            $webSocketMessageData =
                [
                    WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => false,
                    WEBSOCKET_MESSAGEDATA_KEY_ERRORMESSAGE => $errorMessage
                ];
            $webSocketMessage = new WebSocketMessage($webSocketMessageType, $webSocketMessageData);
            $webSocketClient->send($webSocketMessage);
        }
    }
}

?>