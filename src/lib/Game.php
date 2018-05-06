<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    require_once(dirname(__FILE__) . "/constants.php");

    // The Game class mostly is a simple data container that represents a
    // single row in the database table "game".
    //
    // The Game class has a few additional properties for which there are no
    // columns in the database table. These are used to attach objects to a
    // Game that contain additional data linked to the Game via foreign key.
    class Game
    {
        private $gameID = GAME_GAMEID_DEFAULT;
        private $createTime = GAME_CREATETIME_DEFAULT;
        private $boardSize = GAME_BOARDSIZE_DEFAULT;
        private $handicap = GAME_HANDICAP_DEFAULT;
        private $komi = GAME_KOMI_DEFAULT;
        private $koRule = GAME_KORULE_DEFAULT;
        private $scoringSystem = GAME_SCORINGSYSTEM_DEFAULT;
        private $state = GAME_STATE_DEFAULT;
        private $blackPlayer = null;
        private $whitePlayer = null;
        private $numberOfMovesPlayed = GAME_NUMBEROFMOVESPLAYED_DEFAULT;
        private $nextMoveColor = GAME_NEXTMOVECOLOR_DEFAULT;

        public function __construct(
            int $gameID,
            int $createTime,
            int $boardSize,
            int $handicap,
            float $komi,
            int $koRule,
            int $scoringSystem,
            int $state)
        {
            $this->gameID = $gameID;
            $this->createTime = $createTime;
            $this->boardSize = $boardSize;
            $this->handicap = $handicap;
            $this->komi = $komi;
            $this->koRule = $koRule;
            $this->scoringSystem = $scoringSystem;
            $this->state = $state;
        }

        public function getGameID(): int
        {
            return $this->gameID;
        }

        public function setGameID(int $gameID): void
        {
            $this->gameID = $gameID;
        }

        public function getCreateTime(): int
        {
            return $this->createTime;
        }

        public function setCreateTime(int $createTime): void
        {
            $this->createTime = $createTime;
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

        public function setKomi(float $komi): void
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

        public function getState(): int
        {
            return $this->state;
        }

        public function setState(int $state): void
        {
            $this->state = $state;
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

        public function getNumberOfMovesPlayed(): int
        {
            return $this->numberOfMovesPlayed;
        }

        public function setNumberOfMovesPlayed(int $numberOfMovesPlayed): void
        {
            $this->numberOfMovesPlayed = $numberOfMovesPlayed;
        }

        public function getNextMoveColor(): int
        {
            return $this->nextMoveColor;
        }

        public function setNextMoveColor(int $nextMoveColor): void
        {
            $this->nextMoveColor = $nextMoveColor;
        }

        public function toJsonObject(): array
        {
            return array(
                WEBSOCKET_MESSAGEDATA_KEY_GAMEID => $this->gameID,
                WEBSOCKET_MESSAGEDATA_KEY_CREATETIME => $this->createTime,
                WEBSOCKET_MESSAGEDATA_KEY_BOARDSIZE => $this->boardSize,
                WEBSOCKET_MESSAGEDATA_KEY_HANDICAP => $this->handicap,
                WEBSOCKET_MESSAGEDATA_KEY_KOMI => $this->komi,
                WEBSOCKET_MESSAGEDATA_KEY_KORULE => $this->koRule,
                WEBSOCKET_MESSAGEDATA_KEY_SCORINGSYSTEM => $this->scoringSystem,
                WEBSOCKET_MESSAGEDATA_KEY_STATE => $this->state,
                WEBSOCKET_MESSAGEDATA_KEY_BLACKPLAYER => $this->blackPlayer->toJsonObject(),
                WEBSOCKET_MESSAGEDATA_KEY_WHITEPLAYER => $this->whitePlayer->toJsonObject(),
                WEBSOCKET_MESSAGEDATA_KEY_NUMBEROFMOVESPLAYED => $this->numberOfMovesPlayed,
                WEBSOCKET_MESSAGEDATA_KEY_NEXTMOVECOLOR => $this->nextMoveColor
            );
        }
    }
}
