<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    require_once(dirname(__FILE__) . "/constants.php");

    // The WebSocketMessage class is a simple data container that represents a
    // message being sent or received via WebSocket.
    class WebSocketMessage
    {
        private $messageType = "";
        private $data = array();

        // Constructs a new WebSocketMessage object that has the specified
        // message type and contains the specified data payload. The payload
        // must be an associative array, i.e. an array with key/value pairs,
        // that can be JSON-encoded.
        public function __construct(string $messageType, array $data)
        {
            $this->messageType = $messageType;
            $this->data = $data;
        }

        public function getMessageType(): string
        {
            return $this->messageType;
        }

        public function setMessageType(array $messageType): void
        {
            $this->messageType = $messageType;
        }

        public function getData(): array
        {
            return $this->data;
        }

        public function setData(string $data): void
        {
            $this->data = $data;
        }

        public function toJsonString(): string
        {
            $jsonObject =
                [
                    WEBSOCKET_JSON_KEY_MESSAGE_TYPE => $this->messageType,
                    WEBSOCKET_JSON_KEY_MESSAGE_DATA => $this->data
                ];

            $jsonString = json_encode($jsonObject);

            return $jsonString;
        }

        // Creates a new WebSocketMessage object from the specified JSON
        // string and returns the object.
        //
        // Returns null if any error occurs. Examples are:
        // - The specified string is not a JSON string
        // - The specified string is a JSON string but has an unsupported
        //   format.
        //
        // In case of error, echoes an appropriate error message.
        public static function tryCreateMessageFromJson(string $jsonString) : ?WebSocketMessage
        {
            $convertToAssociativeArray = true;
            $jsonObject = json_decode($jsonString, $convertToAssociativeArray);

            if ($jsonObject === null)
            {
                $jsonLastError = json_last_error();
                if ($jsonLastError === JSON_ERROR_NONE)
                    echo "JSON data is incorrect, no data\n";
                else
                    echo "JSON data is incorrect, error code = $jsonLastError\n";

                return null;
            }
            else
            {
                if (is_array($jsonObject))
                {
                    if (! array_key_exists(WEBSOCKET_JSON_KEY_MESSAGE_TYPE, $jsonObject))
                    {
                        echo "JSON data is incorrect, message type is missing\n";
                        return null;
                    }
                    if (! array_key_exists(WEBSOCKET_JSON_KEY_MESSAGE_DATA, $jsonObject))
                    {
                        echo "JSON data is incorrect, data payload is missing\n";
                        return null;
                    }

                    $messageType = $jsonObject[WEBSOCKET_JSON_KEY_MESSAGE_TYPE];
                    $data = $jsonObject[WEBSOCKET_JSON_KEY_MESSAGE_DATA];
                    return new WebSocketMessage($messageType, $data);
                }
                else
                {
                    echo "JSON data is incorrect, result of decoding is not an array\n";
                    return null;
                }
            }
        }
    }
}
