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
            $this->clients = new \SplObjectStorage;
            $this->config = $config;

            // We immediately discard the DbAccess object because we don't
            // really need anything from the database. We try to establish
            // a database connection merely to detect configuration problems
            // immediately upon startup of the WebSocket server.
            new DbAccess($this->config);
            echo "Successfully established database connection\n";

            echo "WebSocket server is now running\n";
        }

        public function onOpen(ConnectionInterface $conn): void
        {
            $this->clients->attach($conn);
            echo "New connection! ({$conn->resourceId})\n";
        }

        public function onMessage(ConnectionInterface $from, $message): void
        {
            $webSocketMessage = WebSocketMessage::tryCreateMessageFromJson($message);
            if ($webSocketMessage === null)
                return;

            $messageType = $webSocketMessage->getMessageType();
            echo "Received message '$messageType' from connection! ({$from->resourceId})\n";

            switch ($messageType)
            {
                case WEBSOCKET_REQUEST_TYPE_VALIDATESESSION:
                    $this->handleValidateSession($from, $webSocketMessage->getData());
                    break;
                default:
                    echo "Unknown message type {$webSocketMessage->getMessageType()}\n";
            }
        }

        public function onClose(ConnectionInterface $conn): void
        {
            $this->clients->detach($conn);
            echo "Connection {$conn->resourceId} has disconnected\n";
            unset($this->players[$conn->resourceId]);
        }

        public function onError(ConnectionInterface $conn, \Exception $e): void
        {
            echo "An error has occurred: {$e->getMessage()}\n";
            $conn->close();
        }

        private function handleValidateSession(ConnectionInterface $from, array $messageData): void
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
                    $webSocketResponseData =
                        [
                            WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => true,
                            WEBSOCKET_MESSAGEDATA_KEY_SESSIONKEY => $sessionKey,
                            WEBSOCKET_MESSAGEDATA_KEY_USERINFO => $user->toJsonObject()
                        ];
                    $webSocketMessage = new WebSocketMessage($webSocketResponseType, $webSocketResponseData);
                    $from->send($webSocketMessage->toJsonString());
                }
                else
                {
                    $dbAccess->deleteSessionBySessionKey($sessionKey);

                    $errorMessage = "Session has invalid user ID";
                    $this->sendErrorResponse($from, $webSocketResponseType, $errorMessage);
                }
            }
            else
            {
                $errorMessage = "Invalid session key";
                $this->sendErrorResponse($from, $webSocketResponseType, $errorMessage);
            }
        }

        private function sendErrorResponse(ConnectionInterface $from, string $webSocketResponseType, string $errorMessage): void
        {
            $webSocketResponseData =
                [
                    WEBSOCKET_MESSAGEDATA_KEY_SUCCESS => false,
                    WEBSOCKET_MESSAGEDATA_KEY_ERRORMESSAGE => $errorMessage
                ];
            $webSocketMessage = new WebSocketMessage($webSocketResponseType, $webSocketResponseData);
            $from->send($webSocketMessage->toJsonString());
        }
    }
}

?>