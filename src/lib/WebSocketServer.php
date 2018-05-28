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

            if ($config->webSocketMessageSendDelayInMilliseconds > 0)
            {
                echo "WARNING: Sending of all WebSocket messages will be delayed by " . $config->webSocketMessageSendDelayInMilliseconds . " milliseconds! Fix the configuration if this is unintentional.\n";
            }

            if ($config->webSocketMessageReceiveDelayInMilliseconds > 0)
            {
                echo "WARNING: Receiving of all WebSocket messages will be delayed by " . $config->webSocketMessageReceiveDelayInMilliseconds . " milliseconds! Fix the configuration if this is unintentional.\n";
            }
        }

        private function getWebSocketClient(ConnectionInterface $conn) : ?WebSocketClient
        {
            $resourceID = $conn->resourceId;
            if (array_key_exists($resourceID, $this->clients))
                return $this->clients[$resourceID];
            else
                return null;
        }

        private function getWebSocketClientsByUserID(int $userID) : array
        {
            $webSocketClients = [];

            foreach ($this->clients as $webSocketClient)
            {
                if ($webSocketClient->getSession()->getUserID() === $userID)
                    array_push($webSocketClients, $webSocketClient);
            }

            return $webSocketClients;
        }

        public function onOpen(ConnectionInterface $conn): void
        {
            $webSocketClient = new WebSocketClient($conn, $this->config->webSocketMessageSendDelayInMilliseconds);
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
                case WEBSOCKET_REQUEST_TYPE_GETGAME:
                    $this->handleGetGame($webSocketClient, $webSocketMessage->getData(), $webSocketResponseType);
                    break;
                case WEBSOCKET_REQUEST_TYPE_SUBMITNEWGAMEMOVE:
                    $this->handleSubmitNewGameMove($webSocketClient, $webSocketMessage->getData(), $webSocketResponseType);
                    break;
                case WEBSOCKET_REQUEST_TYPE_SUBMITNEWSCOREPROPOSAL:
                    $this->handleSubmitNewScoreProposal($webSocketClient, $webSocketMessage->getData(), $webSocketResponseType);
                    break;
                case WEBSOCKET_REQUEST_TYPE_GETSCOREPROPOSAL:
                    $this->handleGetScoreProposal($webSocketClient, $webSocketMessage->getData(), $webSocketResponseType);
                    break;
                case WEBSOCKET_REQUEST_TYPE_ACCEPTSCOREPROPOSAL:
                    $this->handleAcceptScoreProposal($webSocketClient, $webSocketMessage->getData(), $webSocketResponseType);
                    break;
                case WEBSOCKET_REQUEST_TYPE_GETFINISHEDGAMES:
                    $this->handleGetFinishedGames($webSocketClient, $webSocketMessage->getData(), $webSocketResponseType);
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
                case WEBSOCKET_REQUEST_TYPE_GETGAME:
                    return WEBSOCKET_RESPONSE_TYPE_GETGAME;
                case WEBSOCKET_REQUEST_TYPE_SUBMITNEWGAMEMOVE:
                    return WEBSOCKET_RESPONSE_TYPE_SUBMITNEWGAMEMOVE;
                case WEBSOCKET_REQUEST_TYPE_SUBMITNEWSCOREPROPOSAL:
                    return WEBSOCKET_RESPONSE_TYPE_SUBMITNEWSCOREPROPOSAL;
                case WEBSOCKET_REQUEST_TYPE_GETSCOREPROPOSAL:
                    return WEBSOCKET_RESPONSE_TYPE_GETSCOREPROPOSAL;
                case WEBSOCKET_REQUEST_TYPE_ACCEPTSCOREPROPOSAL:
                    return WEBSOCKET_RESPONSE_TYPE_ACCEPTSCOREPROPOSAL;
                case WEBSOCKET_REQUEST_TYPE_GETFINISHEDGAMES:
                    return WEBSOCKET_RESPONSE_TYPE_GETFINISHEDGAMES;
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
            $requestedKomi = floatval($messageData[WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDKOMI]);
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
                $success = $this->addUsersToGame(
                    $webSocketClient,
                    $webSocketResponseType,
                    $gameInProgress,
                    $dbAccess);
                if (! $success)
                    return;  // helper function has already sent WebSocket error message

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

        private function handleGetGame(WebSocketClient $webSocketClient, array $messageData, string $webSocketResponseType) : void
        {
            $gameID = $messageData[WEBSOCKET_MESSAGEDATA_KEY_GAMEID];
            $userID = $webSocketClient->getSession()->getUserID();

            $dbAccess = new DbAccess($this->config);

            $game = $dbAccess->findGameByGameID($gameID);
            if ($game === null)
            {
                $errorMessage = "Failed to retrieve game data from database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            // Validate that the user is authorized to access the game
            $success = $this->addUsersToGame(
                $webSocketClient,
                $webSocketResponseType,
                $game,
                $dbAccess);
            if (! $success)
                return;  // helper function has already sent WebSocket error message
            if ($game->getBlackPlayer()->getUserID() !== $userID &&
                $game->getWhitePlayer()->getUserID() !== $userID)
            {
                $errorMessage = "Access to game data denied, user is not one of the players of the game";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $score = null;
            $scoreDetailsJSON = null;

            if ($game->getState() === GAME_STATE_INPROGRESS_PLAYING)
            {
                // Validate that the user has confirmed the pairing
                $gameRequests = $dbAccess->findGameRequestsByGameID($gameID);
                if ($gameRequests !== null)
                {
                    if (array_key_exists($userID, $gameRequests))
                    {
                        $gameRequest = $gameRequests[$userID];
                        if ($gameRequest->getState() !== GAMEREQUEST_STATE_CONFIRMEDPAIRING)
                        {
                            $errorMessage = "User has not yet confirmed game request pairing";
                            $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                            return;
                        }
                    }
                    else
                    {
                        $errorMessage = "Failed to retrieve game request data from database";
                        $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                        return;
                    }
                }
            }
            else if ($game->getState() === GAME_STATE_INPROGRESS_SCORING ||
                $game->getState() === GAME_STATE_FINISHED)
            {
                $success = $this->getScoreData(
                    $webSocketClient,
                    $webSocketResponseType,
                    $gameID,
                    $dbAccess,
                    $score,
                    $scoreDetails);
                if (! $success)
                    return;  // helper function has already sent WebSocket error message

                if ($scoreDetails !== null)
                {
                    $scoreDetailsJSON = array();
                    foreach ($scoreDetails as $scoreDetail)
                        array_push($scoreDetailsJSON, $scoreDetail->toJsonObject());
                }

                if ($game->getState() === GAME_STATE_FINISHED)
                {
                    $success = $this->addGameResultToFinishedGame(
                        $webSocketClient,
                        $webSocketResponseType,
                        $game,
                        $dbAccess);
                    if (! $success)
                        return;  // helper function has already sent WebSocket error message
                }
            }
            else
            {
                throw new \Exception("Game has unknown state");
            }

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
                    WEBSOCKET_MESSAGEDATA_KEY_GAME => $game->toJsonObject(),
                    WEBSOCKET_MESSAGEDATA_KEY_GAMEMOVES => $gameMovesJSON
                ];
            if ($score !== null)
                $webSocketResponseData[WEBSOCKET_MESSAGEDATA_KEY_SCORE] = $score->toJsonObject();
            if ($scoreDetailsJSON !== null)
                $webSocketResponseData[WEBSOCKET_MESSAGEDATA_KEY_SCOREDETAILS] = $scoreDetailsJSON;
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

            // Validate that the supplied game is in progress and that it is in a
            // state that allows to add moves
            if ($gameInProgress->getState() !== GAME_STATE_INPROGRESS_PLAYING)
            {
                $errorMessage = "Game in progress is not in a state that allows playing moves";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            // Validate that it's the player's turn to move
            // TODO The current validation allows a user to submit a move for the other player!
            // TODO Validate the USER, not the COLOR.
            $lastGameMove = $dbAccess->findLastGameMove($gameInProgress->getGameID());
            $nextMoveColor = $this->getNextMoveColor($gameInProgress, $lastGameMove);
            if ($nextMoveColor !== $moveColor)
            {
                $errorMessage = "Not this player's turn to move";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            // TODO: Validate whether the move is legal to play, i.e.
            // - Is the intersection occupied?
            // - Is the move suicidal?
            // - Is the move a Ko?

            // Find out whether it's time to move the game into the scoring phase.
            // At the moment only two pass moves in a row can lead to this, but if
            // we support new game rules in a future version the trigger could be
            // something different (e.g. 3 pass moves under AGA rules).
            if ($lastGameMove !== null)
            {
                if ($moveType === GAMEMOVE_MOVETYPE_PASS && $lastGameMove->getMoveType() === GAMEMOVE_MOVETYPE_PASS)
                {
                    $gameInProgress->setState(GAME_STATE_INPROGRESS_SCORING);
                    $success = $dbAccess->updateGame($gameInProgress);
                    if (! $success)
                    {
                        $errorMessage = "Failed to update game data in database";
                        $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                        return;
                    }
                }
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
                    WEBSOCKET_MESSAGEDATA_KEY_GAMEMOVE => $gameMove->toJsonObject(),
                    WEBSOCKET_MESSAGEDATA_KEY_GAMESTATE => $gameInProgress->getState()
                ];
            $webSocketMessage = new WebSocketMessage($webSocketResponseType, $webSocketResponseData);

            $this->sendMessageToAllGameIDClients(
                $webSocketMessage,
                $gameID,
                $dbAccess,
                $webSocketClient);
        }

        private function handleSubmitNewScoreProposal(WebSocketClient $webSocketClient, array $messageData, string $webSocketResponseType) : void
        {
            $gameID = $messageData[WEBSOCKET_MESSAGEDATA_KEY_GAMEID];
            $scoreDetailsJSON = $messageData[WEBSOCKET_MESSAGEDATA_KEY_SCOREDETAILS];

            $userID = $webSocketClient->getSession()->getUserID();

            $dbAccess = new DbAccess($this->config);

            $gameInProgress = null;
            $score = null;
            $success = $this->getGameInProgressAndOptionalScore(
                $webSocketClient,
                $webSocketResponseType,
                $userID,
                $gameID,
                $dbAccess,
                $gameInProgress,
                $score);
            if (! $success)
                return;  // helper function has already sent WebSocket error message

            if ($score === null)
            {
                $scoreID = SCORE_SCOREID_DEFAULT;
                $state = SCORE_STATE_PROPOSED;
                $lastModifiedByUserID = $userID;
                $lastModifiedTime = time();

                $score = new Score(
                    $scoreID,
                    $gameID,
                    $state,
                    $lastModifiedByUserID,
                    $lastModifiedTime);

                $scoreID = $dbAccess->insertScore($score);
                if ($scoreID === -1)
                {
                    $errorMessage = "Failed to store score in database";
                    $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                    return;
                }

                $score->setScoreID($scoreID);
            }
            else
            {
                $score->setLastModifiedByUserID($userID);
                $score->setLastModifiedTime(time());
                $success = $dbAccess->updateScore($score);
                if (! $success)
                {
                    $errorMessage = "Failed to update score";
                    $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                    return;
                }

                // Remove existing score details, they are completely replace
                // by the new score details
                $success = $dbAccess->deleteScoreDetailsByScoreID($score->getScoreID());
                if (! $success)
                {
                    $errorMessage = "Failed to delete score details";
                    $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                    return;
                }
            }

            $scoreDetailID = SCOREDETAIL_SCOREDETAILID_DEFAULT;
            $scoreID = $score->getScoreID();
            $scoreDetailsJSONResponse = array();
            foreach ($scoreDetailsJSON as $scoreDetailJSON)
            {
                $vertexX = $scoreDetailJSON[WEBSOCKET_MESSAGEDATA_KEY_VERTEXX];
                $vertexY = $scoreDetailJSON[WEBSOCKET_MESSAGEDATA_KEY_VERTEXY];
                $stoneGroupState = $scoreDetailJSON[WEBSOCKET_MESSAGEDATA_KEY_STONEGROUPSTATE];

                $scoreDetail = new ScoreDetail(
                    $scoreDetailID,
                    $scoreID,
                    $vertexX,
                    $vertexY,
                    $stoneGroupState);

                $scoreDetailID = $dbAccess->insertScoreDetail($scoreDetail);
                if ($scoreDetailID === -1)
                {
                    $errorMessage = "Failed to store score detail in database";
                    $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                    return;
                }

                $scoreDetail->setScoreDetailID($scoreDetailID);

                array_push($scoreDetailsJSONResponse, $scoreDetail->toJsonObject());
            }

            $webSocketResponseData =
                [
                    WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => true,
                    WEBSOCKET_MESSAGEDATA_KEY_SCORE => $score->toJsonObject(),
                    WEBSOCKET_MESSAGEDATA_KEY_SCOREDETAILS => $scoreDetailsJSONResponse
                ];
            $webSocketMessage = new WebSocketMessage($webSocketResponseType, $webSocketResponseData);

            $this->sendMessageToAllGameIDClients(
                $webSocketMessage,
                $gameID,
                $dbAccess,
                $webSocketClient);
        }

        private function handleGetScoreProposal(WebSocketClient $webSocketClient, array $messageData, string $webSocketResponseType) : void
        {
            $gameID = $messageData[WEBSOCKET_MESSAGEDATA_KEY_GAMEID];

            $dbAccess = new DbAccess($this->config);

            $score = $dbAccess->findScoreByGameID($gameID);
            $scoreDetailsJSON = array();
            if ($score === null)
            {
                // A score is optional: Initially, when the game progresses
                // from state "playing" to state "scoring", a score proposal
                // does not exist yet.
                $scoreID = SCORE_SCOREID_DEFAULT;
                $gameID = SCORE_GAMEID_DEFAULT;
                $state = SCORE_STATE_DEFAULT;
                $lastModifiedByUserID = SCORE_LASTMODIFIEDBYUSERID_DEFAULT;
                $lastModifiedTime = SCORE_LASTMODIFIEDTIME_DEFAULT;
                $score = new Score($scoreID, $gameID, $state, $lastModifiedByUserID, $lastModifiedTime);
            }
            else
            {
                $scoreDetails = $dbAccess->findScoreDetailsByScoreID($score->getScoreID());

                foreach ($scoreDetails as $scoreDetail)
                    array_push($scoreDetailsJSON, $scoreDetail->toJsonObject());
            }

            $webSocketResponseData =
                [
                    WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => true,
                    WEBSOCKET_MESSAGEDATA_KEY_SCORE => $score->toJsonObject(),
                    WEBSOCKET_MESSAGEDATA_KEY_SCOREDETAILS => $scoreDetailsJSON
                ];
            $webSocketMessage = new WebSocketMessage($webSocketResponseType, $webSocketResponseData);
            $webSocketClient->send($webSocketMessage);
        }

        private function handleAcceptScoreProposal(WebSocketClient $webSocketClient, array $messageData, string $webSocketResponseType) : void
        {
            $gameID = $messageData[WEBSOCKET_MESSAGEDATA_KEY_GAMEID];
            $resultType = $messageData[WEBSOCKET_MESSAGEDATA_KEY_RESULTTYPE];
            $winningStoneColor = $messageData[WEBSOCKET_MESSAGEDATA_KEY_WINNINGSTONECOLOR];
            $winningPoints = $messageData[WEBSOCKET_MESSAGEDATA_KEY_WINNINGPOINTS];

            $userID = $webSocketClient->getSession()->getUserID();

            $dbAccess = new DbAccess($this->config);

            // Validate that a game that is still in scoring state exists.
            // This validation is somewhat extraneous because if a score
            // in the correct state exists there should be no reason why a
            // game in the correct does not exist. Since we need the game
            // data anyway for the subsequent update, there's no harm in a
            // small double-check.
            $game = $dbAccess->findGameByGameID($gameID);
            if ($game === null)
            {
                $errorMessage = "Failed to retrieve game data from database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }
            if ($game->getState() !== GAME_STATE_INPROGRESS_SCORING)
            {
                $errorMessage = "Game is not in a state that allows accepting the score";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            // Validate that the user is authorized to make changes to the game
            $success = $this->addUsersToGame(
                $webSocketClient,
                $webSocketResponseType,
                $game,
                $dbAccess);
            if (! $success)
                return;  // helper function has already sent WebSocket error message
            if ($game->getBlackPlayer()->getUserID() !== $userID &&
                $game->getWhitePlayer()->getUserID() !== $userID)
            {
                $errorMessage = "User is not one of the players of the game";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            // Validate that a score that is still in proposed state exists
            $score = $dbAccess->findScoreByGameID($gameID);
            if ($score === null)
            {
                $errorMessage = "Failed to retrieve score data from database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }
            if ($score->getState() !== SCORE_STATE_PROPOSED)
            {
                $errorMessage = "Score cannot be accepted because it's not proposed";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            // Validate that it's the user's turn to accept the score proposal
            if ($score->getLastModifiedByUserID() === $userID)
            {
                $errorMessage = "Not this player's turn to accept the score";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $gameResultID = GAMERESULT_GAMERESULTID_DEFAULT;
            $createTime = time();

            $gameResult = new GameResult(
                $gameResultID,
                $createTime,
                $gameID,
                $resultType,
                $winningStoneColor,
                $winningPoints);

            $gameResultID = $dbAccess->insertGameResult($gameResult);
            if ($gameResultID === -1)
            {
                $errorMessage = "Failed to store game result in database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            // Only update the state, not the last modified user ID and time.
            // Accepting a score does not alter the fact who made the last
            // score proposal and when that proposal was made.
            $score->setState(SCORE_STATE_ACCEPTED);
            $success = $dbAccess->updateScore($score);
            if (! $success)
            {
                $errorMessage = "Failed to update score";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $game->setState(GAME_STATE_FINISHED);
            $success = $dbAccess->updateGame($game);
            if (! $success)
            {
                $errorMessage = "Failed to update game";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $webSocketResponseData =
                [
                    WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => true,
                    WEBSOCKET_MESSAGEDATA_KEY_GAMEID => $gameID,
                ];
            $webSocketMessage = new WebSocketMessage($webSocketResponseType, $webSocketResponseData);

            // TODO: We already have the user data, the send... messages should
            // not have to retrieve it again
            $this->sendMessageToAllGameIDClients(
                $webSocketMessage,
                $gameID,
                $dbAccess,
                $webSocketClient);
        }

        private function handleGetFinishedGames(WebSocketClient $webSocketClient, array $messageData, string $webSocketResponseType) : void
        {
            $dbAccess = new DbAccess($this->config);

            $userID = $webSocketClient->getSession()->getUserID();
            $finishedGames = $dbAccess->findFinishedGamesByUserID($userID);
            if ($finishedGames === null)
            {
                $errorMessage = "Failed to retrieve finished games data from database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $finishedGamesJSON = array();
            foreach ($finishedGames as $finishedGame)
            {
                $success = $this->addUsersToGame(
                    $webSocketClient,
                    $webSocketResponseType,
                    $finishedGame,
                    $dbAccess);
                if (! $success)
                    return;  // helper function has already sent WebSocket error message

                $success = $this->addGameResultToFinishedGame(
                    $webSocketClient,
                    $webSocketResponseType,
                    $finishedGame,
                    $dbAccess);
                if (! $success)
                    return;  // helper function has already sent WebSocket error message

                array_push($finishedGamesJSON, $finishedGame->toJsonObject());
            }

            $webSocketResponseData =
                [
                    WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => true,
                    WEBSOCKET_MESSAGEDATA_KEY_GAMESINPROGRESS => $finishedGamesJSON
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
            if ($gameInProgress->getState() === GAME_STATE_INPROGRESS_PLAYING)
            {
                $lastGameMove = $dbAccess->findLastGameMove($gameInProgress->getGameID());
                $nextMoveColor = $this->getNextMoveColor($gameInProgress, $lastGameMove);
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

        private function addUsersToGame(
            WebSocketClient $webSocketClient,
            string $webSocketResponseType,
            Game $game,
            DbAccess $dbAccess) : bool
        {
            $users = $dbAccess->findUsersByGameID($game->getGameID());
            if ($users === null)
            {
                $errorMessage = "Failed to retrieve users for game from database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return false;
            }

            if (array_key_exists(COLOR_BLACK, $users))
                $game->setBlackPlayer($users[COLOR_BLACK]);

            if (array_key_exists(COLOR_WHITE, $users))
                $game->setWhitePlayer($users[COLOR_WHITE]);

            return true;
        }

        private function getScoreData(
            WebSocketClient $webSocketClient,
            string $webSocketResponseType,
            int $gameID,
            DbAccess $dbAccess,
            ?Score &$score,
            ?array &$scoreDetails) : bool
        {
            $score = $dbAccess->findScoreByGameID($gameID);

            // A score is optional: Initially, when the game progresses
            // from state "playing" to state "scoring", a score proposal
            // does not exist yet.
            if ($score !== null)
            {
                $scoreDetails = $dbAccess->findScoreDetailsByScoreID($score->getScoreID());
                if ($scoreDetails === null)
                {
                    $errorMessage = "Failed to retrieve score details from database";
                    $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                    return false;
                }
            }

            return true;
        }

        private function addGameResultToFinishedGame(
            WebSocketClient $webSocketClient,
            string $webSocketResponseType,
            Game $finishedGame,
            DbAccess $dbAccess) : bool
        {
            $success = $this->addUsersToGame(
                $webSocketClient,
                $webSocketResponseType,
                $finishedGame,
                $dbAccess);
            if (! $success)
                return false;  // helper function has already sent WebSocket error message

            $gameResult = $dbAccess->findGameResultByGameID($finishedGame->getGameID());
            if ($gameResult === null)
            {
                $errorMessage = "Failed to retrieve game result data from database";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return false;
            }
            $finishedGame->setGameResult($gameResult);

            return true;
        }

        private function getNextMoveColor(Game $gameInProgress, $lastGameMove) : int
        {
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

        private function getGameInProgressAndOptionalScore(
            WebSocketClient $webSocketClient,
            string $webSocketResponseType,
            int $userID,
            int $gameID,
            DbAccess $dbAccess,
            // From here on out parameters. These must be specified as
            // nullable types so that the caller can provide NULL as
            // input value.
            ?GameInProgress &$gameInProgress,
            ?Score &$score) : bool
        {
            $gameInProgress = $this->getGameInProgressWithoutAdditionalData(
                $webSocketClient,
                $webSocketResponseType,
                $userID,
                $gameID,
                $dbAccess);
            if ($gameInProgress === null)
                return false;  // helper function has already sent WebSocket error message

            // Validate that the supplied game is in progress and that it is in a
            // state that allows proposing a score
            if ($gameInProgress->getState() !== GAME_STATE_INPROGRESS_SCORING)
            {
                $errorMessage = "Game in progress is not in a state that allows proposing a score";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return false;
            }

            $success = $this->addUsersToGame(
                $webSocketClient,
                $webSocketResponseType,
                $gameInProgress,
                $dbAccess);
            if (! $success)
                return false;  // helper function has already sent WebSocket error message

            $score = $dbAccess->findScoreByGameID($gameID);

            // Validate that a score that is still in proposed state exists
            if ($score !== null && $score->getState() !== SCORE_STATE_PROPOSED)
            {
                $errorMessage = "An already accepted score cannot be proposed again";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return false;
            }

            // Validate that it's the user's turn to make a score proposal
            $isItThisPlayersTurnToProposeAScore = true;
            if ($score === null)
            {
                $lastGameMove = $dbAccess->findLastGameMove($gameID);
                if ($lastGameMove->getMoveColor() === COLOR_BLACK)
                    $lastGameMoveUserID = $gameInProgress->getBlackPlayer()->getUserID();
                else
                    $lastGameMoveUserID = $gameInProgress->getWhitePlayer()->getUserID();

                // The user who made the second pass move is allowed to
                // make the first score proposal
                if ($lastGameMoveUserID !== $userID)
                    $isItThisPlayersTurnToProposeAScore = false;
            }
            else
            {
                // Users must make score proposals in alternating order
                if ($score->getLastModifiedByUserID() === $userID)
                    $isItThisPlayersTurnToProposeAScore = false;
            }
            if (! $isItThisPlayersTurnToProposeAScore)
            {
                $errorMessage = "Not this player's turn to propose a score";
                $this->sendErrorMessage($webSocketClient, $webSocketResponseType, $errorMessage);
                return false;
            }

            return true;
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

        // Sends the specified WebSocketMessage to all clients where one of
        // the users is logged in who is playing the game with the specified
        // game ID.
        private function sendMessageToAllGameIDClients(
            WebSocketMessage $webSocketMessage,
            int $gameID,
            DbAccess $dbAccess,
            WebSocketClient $originatingWebSocketClient) : void
        {
            $users = $dbAccess->findUsersByGameID($gameID);
            if ($users === null)
            {
                $errorMessage = "Failed to retrieve users for game from database";
                $this->sendErrorMessage($originatingWebSocketClient, $webSocketMessage->getMessageType(), $errorMessage);
                return;
            }

            foreach ($users as $user)
            {
                $webSocketClients = $this->getWebSocketClientsByUserID($user->getUserID());
                foreach ($webSocketClients as $loopWebSocketClient)
                    $loopWebSocketClient->send($webSocketMessage);
            }
        }
    }
}

?>