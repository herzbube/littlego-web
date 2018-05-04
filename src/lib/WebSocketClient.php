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
        private $session = null;

        // Constructs a WebSocketClient object with the specified
        // WebSocket connection. The WebSocketClient begins its
        // life cycle in the unauthenticated state.
        public function __construct(ConnectionInterface $connection)
        {
            $this->connection = $connection;
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
