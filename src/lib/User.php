<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    require_once(dirname(__FILE__) . "/constants.php");

    // The User class is a simple data container that represents a single
    // row in the database table "user".
    class User
    {
        private $userID = USER_USERID_DEFAULT;
        private $emailAddress = USER_EMAILADDRESS_DEFAULT;
        private $displayName = USER_DISPLAYNAME_DEFAULT;
        private $passwordHash = USER_PASSWORDHASH_DEFAULT;

        public function __construct(int $userID, string $emailAddress, string $displayName, string $passwordHash)
        {
            $this->userID = $userID;
            $this->emailAddress = $emailAddress;
            $this->displayName = $displayName;
            $this->passwordHash = $passwordHash;
        }

        public function getUserID(): int
        {
            return $this->userID;
        }

        public function setUserID(int $userID): void
        {
            $this->userID = $userID;
        }

        public function getEmailAddress(): string
        {
            return $this->emailAddress;
        }

        public function setEmailAddress(string $emailAddress): void
        {
            $this->emailAddress = $emailAddress;
        }

        public function getDisplayName(): string
        {
            return $this->displayName;
        }

        public function setDisplayName(string $displayName): void
        {
            $this->displayName = $displayName;
        }

        public function getPasswordHash(): string
        {
            return $this->passwordHash;
        }

        public function setPasswordHash(string $passwordHash): void
        {
            $this->passwordHash = $passwordHash;
        }

        public function toJsonObject(): array
        {
            return array(
                WEBSOCKET_MESSAGEDATA_KEY_USERID => $this->userID,
                WEBSOCKET_MESSAGEDATA_KEY_EMAILADDRESS => $this->emailAddress,
                WEBSOCKET_MESSAGEDATA_KEY_DISPLAYNAME => $this->displayName
                // No password hash - this is sensitive and must never leave the system!
            );
        }
    }
}
