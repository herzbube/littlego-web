// ----------------------------------------------------------------------
// This file contains constants.
// ----------------------------------------------------------------------

const BOARDSIZE_7 = 7;
const BOARDSIZE_9 = 9;
const BOARDSIZE_11 = 11;
const BOARDSIZE_13 = 13;
const BOARDSIZE_15 = 15;
const BOARDSIZE_17 = 17;
const BOARDSIZE_19 = 19;

const STONECOLOR_BLACK = 0;
const STONECOLOR_WHITE = 1;

const KORULE_SIMPLE_KO = 0;
const KORULE_POSITIONAL_SUPERKO = 1;
const KORULE_SITUATIONAL_SUPERKO = 2;

const SCORINGSYSTEM_AREA_SCORING = 0;
const SCORINGSYSTEM_TERRITORY_SCORING = 0;

const DEFAULT_BOARDSIZE = BOARDSIZE_19;
const DEFAULT_STONECOLOR = STONECOLOR_BLACK;
const DEFAULT_HANDICAP = 0;
const DEFAULT_KOMI = 7.5;  // default for area scoring and no handicap
const DEFAULT_KORULE = KORULE_SIMPLE_KO;
const DEFAULT_SCORINGSYSTEM = SCORINGSYSTEM_AREA_SCORING;
