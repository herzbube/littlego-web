<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    require_once(dirname(__FILE__) . "/constants.php");

    // The Session class is a simple data container that represents a single
    // row in the database table "session".
    class Session
    {
        private $sessionID = SESSION_SESSIONID_DEFAULT;
        private $sessionKey = SESSION_SESSIONKEY_DEFAULT;
        private $userID = SESSION_USERID_DEFAULT;
        private $validUntil = SESSION_VALIDUNTIL_DEFAULT;

        public function __construct(int $sessionID, string $sessionKey, int $userID, int $validUntil)
        {
            $this->sessionID = $sessionID;
            $this->sessionKey = $sessionKey;
            $this->userID = $userID;
            $this->validUntil = $validUntil;
        }

        public function getSessionID(): int
        {
            return $this->sessionID;
        }

        public function setSessionID(int $sessionID): void
        {
            $this->sessionID = $sessionID;
        }

        public function getSessionKey(): string
        {
            return $this->sessionKey;
        }

        public function setSessionKey(string $sessionKey): void
        {
            $this->sessionKey = $sessionKey;
        }

        public function getUserID(): int
        {
            return $this->userID;
        }

        public function setUserID(int $userID): void
        {
            $this->userID = $userID;
        }

        public function getValidUntil(): int
        {
            return $this->validUntil;
        }

        public function setValidUntil(int $validUntil): void
        {
            $this->validUntil = $validUntil;
        }
    }
}