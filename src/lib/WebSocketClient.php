<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    use \Ratchet\ConnectionInterface;

    require_once(dirname(__FILE__) . "/constants.php");

    // The WebSocketClient class stores data about a client that is connected
    // to the WebSocket server.
    class WebSocketClient
    {
        private $connection = null;
        private $messageSendDelayInMicroseconds = WEBSOCKET_MESSAGESENDDELAYINMILLISECONDS_DEFAULT;
        private $session = null;

        // Constructs a WebSocketClient object with the specified
        // WebSocket connection. The WebSocketClient begins its
        // life cycle in the unauthenticated state.
        public function __construct(ConnectionInterface $connection, int $sendMessageDelayInMilliseconds)
        {
            $this->connection = $connection;
            $this->messageSendDelayInMicroseconds = $sendMessageDelayInMilliseconds * 1000;
        }

        public function getConnection() : ConnectionInterface
        {
            return $this->connection;
        }

        public function setConnection(ConnectionInterface $connection) : void
        {
            $this->connection = $connection;
        }

        public function send(WebSocketMessage $webSocketMessage) : void
        {
            if ($this->messageSendDelayInMicroseconds > 0)
            {
                echo "Delaying sending message to connection {$this->connection->resourceId}: {$webSocketMessage->getMessageType()}\n";
                usleep($this->messageSendDelayInMicroseconds);
            }

            echo "Sending message to connection {$this->connection->resourceId}: {$webSocketMessage->getMessageType()}\n";

            $data = $webSocketMessage->toJsonString();
            $this->connection->send($data);
        }

        public function getSession(): Session
        {
            return $this->session;
        }

        public function authenticate(Session $session)
        {
            $this->session = $session;
        }

        public function invalidateAuthentication()
        {
            $this->session = null;
        }

        public function isAuthenticated() : bool
        {
            return ($this->session !== null);
        }
    }
}
