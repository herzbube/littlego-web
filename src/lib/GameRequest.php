<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    require_once(dirname(__FILE__) . "/constants.php");

    // The GameRequest class is a simple data container that represents a
    // single row in the database table "gamerequest".
    class GameRequest
    {
        private $gameRequestID = GAMEREQUEST_GAMEREQUESTID_DEFAULT;
        private $createTime = GAMEREQUEST_CREATETIME_DEFAULT;
        private $requestedBoardSize = GAMEREQUEST_REQUESTEDBOARDSIZE_DEFAULT;
        private $requestedStoneColor = GAMEREQUEST_REQUESTEDSTONECOLOR_DEFAULT;
        private $requestedHandicap = GAMEREQUEST_REQUESTEDHANDICAP_DEFAULT;
        private $requestedKomi = GAMEREQUEST_REQUESTEDKOMI_DEFAULT;
        private $requestedKoRule = GAMEREQUEST_REQUESTEDKORULE_DEFAULT;
        private $requestedScoringSystem = GAMEREQUEST_SCORINGSYSTEM_DEFAULT;
        private $userID = GAMEREQUEST_USERID_DEFAULT;
        private $state = GAMEREQUEST_STATE_DEFAULT;

        public function __construct(
            int $gameRequestID,
            int $createTime,
            int $requestedBoardSize,
            int $requestedStoneColor,
            int $requestedHandicap,
            float $requestedKomi,
            int $requestedKoRule,
            int $requestedScoringSystem,
            int $userID,
            int $state)
        {
            $this->gameRequestID = $gameRequestID;
            $this->createTime = $createTime;
            $this->requestedBoardSize = $requestedBoardSize;
            $this->requestedStoneColor = $requestedStoneColor;
            $this->requestedHandicap = $requestedHandicap;
            $this->requestedKomi = $requestedKomi;
            $this->requestedKoRule = $requestedKoRule;
            $this->requestedScoringSystem = $requestedScoringSystem;
            $this->userID = $userID;
            $this->state = $state;
        }

        public function getGameRequestID(): int
        {
            return $this->gameRequestID;
        }

        public function setGameRequestID(int $gameRequestID): void
        {
            $this->gameRequestID = $gameRequestID;
        }

        public function getCreateTime(): int
        {
            return $this->createTime;
        }

        public function setCreateTime(int $createTime): void
        {
            $this->createTime = $createTime;
        }

        public function getRequestedBoardSize(): int
        {
            return $this->requestedBoardSize;
        }

        public function setRequestedBoardSize(int $requestedBoardSize): void
        {
            $this->requestedBoardSize = $requestedBoardSize;
        }

        public function getRequestedStoneColor(): int
        {
            return $this->requestedStoneColor;
        }

        public function setRequestedStoneColor(int $requestedStoneColor): void
        {
            $this->requestedStoneColor = $requestedStoneColor;
        }

        public function getRequestedHandicap(): int
        {
            return $this->requestedHandicap;
        }

        public function setRequestedHandicap(int $requestedHandicap): void
        {
            $this->requestedHandicap = $requestedHandicap;
        }

        public function getRequestedKomi(): float
        {
            return $this->requestedKomi;
        }

        public function setRequestedKomi(float $requestedKomi): void
        {
            $this->requestedKomi = $requestedKomi;
        }

        public function getRequestedKoRule(): int
        {
            return $this->requestedKoRule;
        }

        public function setRequestedKoRule(int $requestedKoRule): void
        {
            $this->requestedKoRule = $requestedKoRule;
        }

        public function getRequestedScoringSystem(): int
        {
            return $this->requestedScoringSystem;
        }

        public function setRequestedScoringSystem(int $requestedScoringSystem): void
        {
            $this->requestedScoringSystem = $requestedScoringSystem;
        }

        public function getUserID(): int
        {
            return $this->userID;
        }

        public function setUserID(int $userID): void
        {
            $this->userID = $userID;
        }

        public function getState(): int
        {
            return $this->state;
        }

        public function setState(int $state): void
        {
            $this->state = $state;
        }

        public function toJsonObject(): array
        {
            return array(
                WEBSOCKET_MESSAGEDATA_KEY_GAMEREQUESTID => $this->gameRequestID,
                WEBSOCKET_MESSAGEDATA_KEY_CREATETIME => $this->createTime,
                WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDBOARDSIZE => $this->requestedBoardSize,
                WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDSTONECOLOR => $this->requestedStoneColor,
                WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDHANDICAP => $this->requestedHandicap,
                WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDKOMI => $this->requestedKomi,
                WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDKORULE => $this->requestedKoRule,
                WEBSOCKET_MESSAGEDATA_KEY_REQUESTEDSCORINGSYSTEM => $this->requestedScoringSystem,
                WEBSOCKET_MESSAGEDATA_KEY_STATE => $this->state
                // No user ID - the client who requests the data already
                // knows the user ID
            );
        }
    }
}
