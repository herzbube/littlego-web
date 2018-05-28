<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    require_once(dirname(__FILE__) . "/constants.php");

    // The GameResult class is a simple data container that represents a
    // single row in the database table "gameresult".
    class GameResult
    {
        private $gameResultID = GAMERESULT_GAMERESULTID_DEFAULT;
        private $createTime = GAMERESULT_CREATETIME_DEFAULT;
        private $gameID = GAMERESULT_GAMEID_DEFAULT;
        private $resultType = GAMERESULT_RESULTTYPE_DEFAULT;
        private $winningStoneColor = GAMERESULT_WINNINGSTONECOLOR_DEFAULT;
        private $winningPoints = GAMERESULT_WINNINGPOINTS_DEFAULT;

        public function __construct(
            int $gameResultID,
            int $createTime,
            int $gameID,
            int $resultType,
            int $winningStoneColor,
            float $winningPoints)
        {
            $this->gameResultID = $gameResultID;
            $this->createTime = $createTime;
            $this->gameID = $gameID;
            $this->resultType = $resultType;
            $this->winningStoneColor = $winningStoneColor;
            $this->winningPoints = $winningPoints;
        }

        public function getGameResultID(): int
        {
            return $this->gameResultID;
        }

        public function setGameResultID(int $gameResultID): void
        {
            $this->gameResultID = $gameResultID;
        }

        public function getCreateTime(): int
        {
            return $this->createTime;
        }

        public function setCreateTime(int $createTime): void
        {
            $this->createTime = $createTime;
        }

        public function getGameID(): int
        {
            return $this->gameID;
        }

        public function setGameID(int $gameID): void
        {
            $this->gameID = $gameID;
        }

        public function getResultType(): int
        {
            return $this->resultType;
        }

        public function setResultType(int $resultType): void
        {
            $this->resultType = $resultType;
        }

        public function getWinningStoneColor(): int
        {
            return $this->winningStoneColor;
        }

        public function setWinningStoneColor(int $winningStoneColor): void
        {
            $this->winningStoneColor = $winningStoneColor;
        }

        public function getWinningPoints(): float
        {
            return $this->winningPoints;
        }

        public function setWinningPoints(float $winningPoints): void
        {
            $this->winningPoints = $winningPoints;
        }

        public function toJsonObject(): array
        {
            return array(
                WEBSOCKET_MESSAGEDATA_KEY_GAMERESULTID => $this->gameResultID,
                WEBSOCKET_MESSAGEDATA_KEY_CREATETIME => $this->createTime,
                WEBSOCKET_MESSAGEDATA_KEY_GAMEID => $this->gameID,
                WEBSOCKET_MESSAGEDATA_KEY_RESULTTYPE => $this->resultType,
                WEBSOCKET_MESSAGEDATA_KEY_WINNINGSTONECOLOR => $this->winningStoneColor,
                WEBSOCKET_MESSAGEDATA_KEY_WINNINGPOINTS => $this->winningPoints
            );
        }
    }
}
