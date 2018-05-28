<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    require_once(dirname(__FILE__) . "/constants.php");

    // The Score class is a simple data container that represents a
    // single row in the database table "score".
    class Score
    {
        private $scoreID = SCORE_SCOREID_DEFAULT;
        private $gameID = SCORE_GAMEID_DEFAULT;
        private $state = SCORE_STATE_DEFAULT;
        private $lastModifiedByUserID = SCORE_LASTMODIFIEDBYUSERID_DEFAULT;
        private $lastModifiedTime = SCORE_LASTMODIFIEDTIME_DEFAULT;

        public function __construct(
            int $scoreID,
            int $gameID,
            int $state,
            int $lastModifiedByUserID,
            int $lastModifiedTime)
        {
            $this->scoreID = $scoreID;
            $this->gameID = $gameID;
            $this->state = $state;
            $this->lastModifiedByUserID = $lastModifiedByUserID;
            $this->lastModifiedTime = $lastModifiedTime;
        }

        public function getScoreID(): int
        {
            return $this->scoreID;
        }

        public function setScoreID(int $scoreID): void
        {
            $this->scoreID = $scoreID;
        }

        public function getGameID(): int
        {
            return $this->gameID;
        }

        public function setGameID(int $gameID): void
        {
            $this->gameID = $gameID;
        }

        public function getState(): int
        {
            return $this->state;
        }

        public function setState(int $state): void
        {
            $this->state = $state;
        }

        public function getLastModifiedByUserID(): int
        {
            return $this->lastModifiedByUserID;
        }

        public function setLastModifiedByUserID(int $lastModifiedByUserID): void
        {
            $this->lastModifiedByUserID = $lastModifiedByUserID;
        }

        public function getLastModifiedTime(): int
        {
            return $this->lastModifiedTime;
        }

        public function setLastModifiedTime(int $lastModifiedTime): void
        {
            $this->lastModifiedTime = $lastModifiedTime;
        }

        public function toJsonObject(): array
        {
            return array(
                WEBSOCKET_MESSAGEDATA_KEY_SCOREID => $this->scoreID,
                WEBSOCKET_MESSAGEDATA_KEY_GAMEID => $this->gameID,
                WEBSOCKET_MESSAGEDATA_KEY_STATE => $this->state,
                WEBSOCKET_MESSAGEDATA_KEY_LASTMODIFIEDBYUSERID => $this->lastModifiedByUserID,
                WEBSOCKET_MESSAGEDATA_KEY_LASTMODIFIEDTIME => $this->lastModifiedTime
            );
        }
    }
}
