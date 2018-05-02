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

        private function getWebSocketClient(ConnectionInterface $conn) : WebSocketClient
        {
            $resourceID = $conn->resourceId;
            if (array_key_exists($resourceID, $this->clients))
                return $this->clients[$resourceID];
            else
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

            $messageType = $webSocketMessage->getMessageType();
            echo "Received message '$messageType' from connection! ({$from->resourceId})\n";

            $webSocketClient = $this->getWebSocketClient($from);

            switch ($messageType)
            {
                case WEBSOCKET_REQUEST_TYPE_LOGIN:
                    $this->handleLogin($webSocketClient, $webSocketMessage->getData());
                    break;
                case WEBSOCKET_REQUEST_TYPE_LOGOUT:
                    $this->handleLogout($webSocketClient, $webSocketMessage->getData());
                    break;
                case WEBSOCKET_REQUEST_TYPE_REGISTERACCOUNT:
                    $this->handleRegisterAccount($webSocketClient, $webSocketMessage->getData());
                    break;
                case WEBSOCKET_REQUEST_TYPE_VALIDATESESSION:
                    $this->handleValidateSession($webSocketClient, $webSocketMessage->getData());
                    break;
                case WEBSOCKET_REQUEST_TYPE_SUBMITNEWGAMEREQUEST:
                    $this->handleSubmitNewGameRequest($webSocketClient, $webSocketMessage->getData());
                    break;
                case WEBSOCKET_REQUEST_TYPE_GETGAMEREQUESTS:
                    $this->handleGetGameRequests($webSocketClient, $webSocketMessage->getData());
                    break;
                case WEBSOCKET_REQUEST_TYPE_CANCELGAMEREQUEST:
                    $this->handleCancelGameRequest($webSocketClient, $webSocketMessage->getData());
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

        private function handleLogin(WebSocketClient $webSocketClient, array $messageData): void
        {
            $webSocketResponseType = WEBSOCKET_RESPONSE_TYPE_LOGIN;
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
                $this->sendErrorResponse($webSocketClient, $webSocketResponseType, $webSocketResponseDefaultErrorMessage);
                return;
            }

            $passwordIsValid = $this->verifyPassword($password, $user->getPasswordHash());
            if (! $passwordIsValid)
            {
                $this->sendErrorResponse($webSocketClient, $webSocketResponseType, $webSocketResponseDefaultErrorMessage);
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
                $this->sendErrorResponse($webSocketClient, $webSocketResponseType, $errorMessage);
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

        private function handleLogout(WebSocketClient $webSocketClient, array $messageData): void
        {
            $webSocketResponseType = WEBSOCKET_RESPONSE_TYPE_LOGOUT;

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
                $this->sendErrorResponse($webSocketClient, $webSocketResponseType, $errorMessage);
            }
        }

        private function handleRegisterAccount(WebSocketClient $webSocketClient, array $messageData): void
        {
            $webSocketResponseType = WEBSOCKET_RESPONSE_TYPE_REGISTERACCOUNT;

            $emailAddress = $messageData[WEBSOCKET_MESSAGEDATA_KEY_EMAILADDRESS];
            $displayName = $messageData[WEBSOCKET_MESSAGEDATA_KEY_DISPLAYNAME];
            $password = $messageData[WEBSOCKET_MESSAGEDATA_KEY_PASSWORD];

            $dbAccess = new DbAccess($this->config);

            $user = $dbAccess->findUserByEmailAddress($emailAddress);
            if ($user !== null)
            {
                $errorMessage = "Another account with this email address already exists";
                $this->sendErrorResponse($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $user = $dbAccess->findUserByDisplayName($displayName);
            if ($user !== null)
            {
                $errorMessage = "Another account with this display name already exists";
                $this->sendErrorResponse($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $userID = USER_USERID_DEFAULT;
            $passwordHash = $this->generatePasswordHash($password);
            $user = new User($userID, $emailAddress, $displayName, $passwordHash);

            $userID = $dbAccess->insertUser($user);
            if ($userID === -1)
            {
                $errorMessage = "Failed to store user data in database";
                $this->sendErrorResponse($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

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

        private function handleValidateSession(WebSocketClient $webSocketClient, array $messageData): void
        {
            $webSocketResponseType = WEBSOCKET_RESPONSE_TYPE_VALIDATESESSION;

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
                    $this->sendErrorResponse($webSocketClient, $webSocketResponseType, $errorMessage);
                }
            }
            else
            {
                $this->sendInvalidSession($webSocketClient, $webSocketResponseType);
            }
        }

        private function handleSubmitNewGameRequest(WebSocketClient $webSocketClient, array $messageData): void
        {
            $webSocketResponseType = WEBSOCKET_RESPONSE_TYPE_SUBMITNEWGAMEREQUEST;

            $requestedBoardSize = intval($messageData[WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDBOARDSIZE]);
            $requestedStoneColor = intval($messageData[WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDSTONECOLOR]);
            $requestedHandicap = intval($messageData[WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDHANDICAP]);
            $requestedKomi = intval($messageData[WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDKOMI]);
            $requestedKoRule = intval($messageData[WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDKORULE]);
            $requestedScoringSystem = intval($messageData[WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDSCORINGSYSTEM]);

            $dbAccess = new DbAccess($this->config);

            $sessionKey = $webSocketClient->getSession()->getSessionKey();
            $session = $dbAccess->findSessionByKey($sessionKey);
            if ($session === null)
            {
                $this->sendInvalidSession($webSocketClient, $webSocketResponseType);
                return;
            }

            $gameRequestID = GAMEREQUEST_GAMEREQUESTID_DEFAULT;
            $createTime = time();
            $userID = $session->getUserID();
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

            $gameRequestID = $dbAccess->insertGameRequest($gameRequest);
            if ($gameRequestID === -1)
            {
                $errorMessage = "Failed to store game request in database";
                $this->sendErrorResponse($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $webSocketResponseData =
                [
                    WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => true,
                ];
            $webSocketMessage = new WebSocketMessage($webSocketResponseType, $webSocketResponseData);
            $webSocketClient->send($webSocketMessage);
        }

        private function handleGetGameRequests(WebSocketClient $webSocketClient, array $messageData): void
        {
            $webSocketResponseType = WEBSOCKET_RESPONSE_TYPE_GETGAMEREQUESTS;


            $dbAccess = new DbAccess($this->config);

            $sessionKey = $webSocketClient->getSession()->getSessionKey();
            $session = $dbAccess->findSessionByKey($sessionKey);
            if ($session === null)
            {
                $this->sendInvalidSession($webSocketClient, $webSocketResponseType);
                return;
            }

            $this->findAndSendGameRequests($webSocketClient, $webSocketResponseType, $dbAccess, $session);
        }

        private function handleCancelGameRequest(WebSocketClient $webSocketClient, array $messageData): void
        {
            $webSocketResponseType = WEBSOCKET_RESPONSE_TYPE_CANCELGAMEREQUEST;

            $gameRequestID = $messageData[WEBSOCKET_MESSAGEDATA_KEY_GAMEREQUESTID];

            $dbAccess = new DbAccess($this->config);

            $sessionKey = $webSocketClient->getSession()->getSessionKey();
            $session = $dbAccess->findSessionByKey($sessionKey);
            if ($session === null)
            {
                $this->sendInvalidSession($webSocketClient, $webSocketResponseType);
                return;
            }

            $success = $dbAccess->deleteGameRequestByGameRequestID($gameRequestID);
            if ($success)
            {
                $this->findAndSendGameRequests($webSocketClient, $webSocketResponseType, $dbAccess, $session);
            }
            else
            {
                $errorMessage = "Invalid game request ID";
                $this->sendErrorResponse($webSocketClient, $webSocketResponseType, $errorMessage);
            }
        }

        private function findAndSendGameRequests(WebSocketClient $webSocketClient, string $webSocketResponseType, DbAccess $dbAccess, Session $session): void
        {
            $userID = $session->getUserID();
            $gameRequests = $dbAccess->findGameRequestsByUserID($userID);
            if ($gameRequests === null)
            {
                $errorMessage = "Failed to retrieve game requests data from database";
                $this->sendErrorResponse($webSocketClient, $webSocketResponseType, $errorMessage);
                return;
            }

            $gameRequestsJSON = array();
            foreach ($gameRequests as $gameRequest)
                array_push($gameRequestsJSON, $gameRequest->toJsonObject());

            $webSocketResponseData =
                [
                    WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => true,
                    WEBSOCKET_MESSAGEDATA_KEY_GAMEREQUESTS => $gameRequestsJSON
                ];
            $webSocketMessage = new WebSocketMessage($webSocketResponseType, $webSocketResponseData);
            $webSocketClient->send($webSocketMessage);
        }

        private function sendInvalidSession(WebSocketClient $webSocketClient, string $webSocketResponseType): void
        {
            $errorMessage = "Invalid session key";
            $this->sendErrorResponse($webSocketClient, $webSocketResponseType, $errorMessage);
        }

        private function sendErrorResponse(WebSocketClient $webSocketClient, string $webSocketResponseType, string $errorMessage): void
        {
            $webSocketResponseData =
                [
                    WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => false,
                    WEBSOCKET_MESSAGEDATA_KEY_ERRORMESSAGE => $errorMessage
                ];
            $webSocketMessage = new WebSocketMessage($webSocketResponseType, $webSocketResponseData);
            $webSocketClient->send($webSocketMessage);
        }
    }
}

?>