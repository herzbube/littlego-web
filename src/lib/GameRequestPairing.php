<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    require_once(dirname(__FILE__) . "/constants.php");

    // The GameRequestPairing class mostly is a simple data container that
    // represents a  single row in the database table "gamerequestpairing".
    //
    // The GameRequestPairing class has a few additional properties for
    // which there are no columns in the database table. These are used to
    // attach objects to a GameRequestPairing that contain additional data
    // linked to the GameRequestPairing via foreign key.
    class GameRequestPairing
    {
        private $gameRequestPairingID = GAMEREQUESTPAIRING_GAMEREQUESTPAIRINGID_DEFAULT;
        private $createTime = GAMEREQUESTPAIRING_CREATETIME_DEFAULT;
        private $blackPlayerGameRequestID = GAMEREQUESTPAIRING_BLACKPLAYERGAMEREQUESTID_DEFAULT;
        private $whitePlayerGameRequestID = GAMEREQUESTPAIRING_WHITEPLAYERGAMEREQUESTID_DEFAULT;
        private $boardSize = GAMEREQUESTPAIRING_BOARDSIZE_DEFAULT;
        private $handicap = GAMEREQUESTPAIRING_HANDICAP_DEFAULT;
        private $komi = GAMEREQUESTPAIRING_KOMI_DEFAULT;
        private $koRule = GAMEREQUESTPAIRING_KORULE_DEFAULT;
        private $scoringSystem = GAMEREQUESTPAIRING_SCORINGSYSTEM_DEFAULT;
        private $isRejected = GAMEREQUESTPAIRING_ISREJECTED_DEFAULT;
        private $blackPlayer = null;
        private $whitePlayer = null;

        public function __construct(
            int $gameRequestPairingID,
            int $createTime,
            int $blackPlayerGameRequestID,
            int $whitePlayerGameRequestID,
            int $boardSize,
            int $handicap,
            float $komi,
            int $koRule,
            int $scoringSystem,
            bool $isRejected)
        {
            $this->gameRequestPairingID = $gameRequestPairingID;
            $this->createTime = $createTime;
            $this->blackPlayerGameRequestID = $blackPlayerGameRequestID;
            $this->whitePlayerGameRequestID = $whitePlayerGameRequestID;
            $this->boardSize = $boardSize;
            $this->handicap = $handicap;
            $this->komi = $komi;
            $this->koRule = $koRule;
            $this->scoringSystem = $scoringSystem;
            $this->isRejected = $isRejected;
        }

        public function getGameRequestPairingID(): int
        {
            return $this->gameRequestPairingID;
        }

        public function setGameRequestPairingID(int $gameRequestPairingID): void
        {
            $this->gameRequestPairingID = $gameRequestPairingID;
        }

        public function getCreateTime(): int
        {
            return $this->createTime;
        }

        public function setCreateTime(int $createTime): void
        {
            $this->createTime = $createTime;
        }

        public function getBlackPlayerGameRequestID(): int
        {
            return $this->blackPlayerGameRequestID;
        }

        public function setBlackPlayerGameRequestID(int $blackPlayerGameRequestID): void
        {
            $this->blackPlayerGameRequestID = $blackPlayerGameRequestID;
        }

        public function getWhitePlayerGameRequestID(): int
        {
            return $this->whitePlayerGameRequestID;
        }

        public function setWhitePlayerGameRequestID(int $whitePlayerGameRequestID): void
        {
            $this->whitePlayerGameRequestID = $whitePlayerGameRequestID;
        }

        public function getBoardSize(): int
        {
            return $this->boardSize;
        }

        public function setBoardSize(int $boardSize): void
        {
            $this->boardSize = $boardSize;
        }

        public function getHandicap(): int
        {
            return $this->handicap;
        }

        public function setHandicap(int $handicap): void
        {
            $this->handicap = $handicap;
        }

        public function getKomi(): float
        {
            return $this->komi;
        }

        public function setkomi(float $komi): void
        {
            $this->komi = $komi;
        }

        public function getKoRule(): int
        {
            return $this->koRule;
        }

        public function setKoRule(int $koRule): void
        {
            $this->koRule = $koRule;
        }

        public function getScoringSystem(): int
        {
            return $this->scoringSystem;
        }

        public function setScoringSystem(int $scoringSystem): void
        {
            $this->scoringSystem = $scoringSystem;
        }

        public function isRejected(): bool
        {
            return $this->isRejected;
        }

        public function reject(): void
        {
            $this->isRejected = true;
        }

        public function getBlackPlayer(): User
        {
            return $this->blackPlayer;
        }

        public function setBlackPlayer(User $blackPlayer): void
        {
            $this->blackPlayer = $blackPlayer;
        }

        public function getWhitePlayer(): User
        {
            return $this->whitePlayer;
        }

        public function setWhitePlayer(User $whitePlayer): void
        {
            $this->whitePlayer = $whitePlayer;
        }

        public function toJsonObject(): array
        {
            return array(
                WEBSOCKET_MESSAGEDATA_KEY_GAMEREQUESTPAIRINGID => $this->gameRequestPairingID,
                WEBSOCKET_MESSAGEDATA_KEY_CREATETIME => $this->createTime,
                WEBSOCKET_MESSAGEDATA_KEY_BOARDSIZE => $this->boardSize,
                WEBSOCKET_MESSAGEDATA_KEY_HANDICAP => $this->handicap,
                WEBSOCKET_MESSAGEDATA_KEY_KOMI => $this->komi,
                WEBSOCKET_MESSAGEDATA_KEY_KORULE => $this->koRule,
                WEBSOCKET_MESSAGEDATA_KEY_SCORINGSYSTEM => $this->scoringSystem,
                WEBSOCKET_MESSAGEDATA_KEY_ISREJECTED => $this->isRejected,
                WEBSOCKET_MESSAGEDATA_KEY_BLACKPLAYER => $this->blackPlayer->toJsonObject(),
                WEBSOCKET_MESSAGEDATA_KEY_WHITEPLAYER => $this->whitePlayer->toJsonObject(),
            );
        }
    }
}
