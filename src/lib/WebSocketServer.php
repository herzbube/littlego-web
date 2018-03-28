<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    use \Ratchet\MessageComponentInterface;
    use \Ratchet\ConnectionInterface;

    class WebSocketServer implements MessageComponentInterface
    {
        private $clients;

        public function __construct()
        {
            $this->clients = new \SplObjectStorage;
            echo "WebSocket server is now running\n";
        }

        public function onOpen(ConnectionInterface $conn): void
        {
            $this->clients->attach($conn);
            echo "New connection! ({$conn->resourceId})\n";
        }

        public function onMessage(ConnectionInterface $from, $message): void
        {
            $convertToAssociativeArray = true;
            $jsonObject = json_decode($message, $convertToAssociativeArray);
            if ($jsonObject === null && json_last_error() !== JSON_ERROR_NONE)
            {
                echo "JSON data is incorrect";
                return;
            }
            echo "Received message from connection! ({$from->resourceId})\n";

            $eventType = $jsonObject['action'];
            switch ($eventType)
            {
                default:
                    echo "Unknown event type $eventType\n";
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
    }
}

?>