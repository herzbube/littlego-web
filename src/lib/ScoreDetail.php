<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    require_once(dirname(__FILE__) . "/constants.php");

    // The ScoreDetail class is a simple data container that represents a
    // single row in the database table "scoredetail".
    class ScoreDetail
    {
        private $scoreDetailID = SCOREDETAIL_SCOREDETAILID_DEFAULT;
        private $scoreID = SCOREDETAIL_SCOREID_DEFAULT;
        private $vertexX = SCOREDETAIL_VERTEXX_DEFAULT;
        private $vertexY = SCOREDETAIL_VERTEXY_DEFAULT;
        private $stoneGroupState = SCOREDETAIL_STONEGROUPSTATE_DEFAULT;

        public function __construct(
            int $scoreDetailID,
            int $scoreID,
            int $vertexX,
            int $vertexY,
            int $stoneGroupState)
        {
            $this->scoreDetailID = $scoreDetailID;
            $this->scoreID = $scoreID;
            $this->vertexX = $vertexX;
            $this->vertexY = $vertexY;
            $this->stoneGroupState = $stoneGroupState;
        }

        public function getScoreDetailID(): int
        {
            return $this->scoreDetailID;
        }

        public function setScoreDetailID(int $scoreDetailID): void
        {
            $this->scoreDetailID = $scoreDetailID;
        }

        public function getScoreID(): int
        {
            return $this->scoreID;
        }

        public function setScoreID(int $scoreID): void
        {
            $this->scoreID = $scoreID;
        }

        public function getVertexX(): int
        {
            return $this->vertexX;
        }

        public function setVertexX(int $vertexX): void
        {
            $this->vertexX = $vertexX;
        }

        public function getVertexY(): int
        {
            return $this->vertexY;
        }

        public function setVertexY(int $vertexY): void
        {
            $this->vertexY = $vertexY;
        }

        public function getStoneGroupState(): int
        {
            return $this->stoneGroupState;
        }

        public function setStoneGroupState(int $stoneGroupState): void
        {
            $this->stoneGroupState = $stoneGroupState;
        }

        public function toJsonObject(): array
        {
            return array(
                WEBSOCKET_MESSAGEDATA_KEY_SCOREDETAILID => $this->scoreDetailID,
                WEBSOCKET_MESSAGEDATA_KEY_SCOREID => $this->scoreID,
                WEBSOCKET_MESSAGEDATA_KEY_VERTEXX => $this->vertexX,
                WEBSOCKET_MESSAGEDATA_KEY_VERTEXY => $this->vertexY,
                WEBSOCKET_MESSAGEDATA_KEY_STONEGROUPSTATE => $this->stoneGroupState
            );
        }
    }
}
