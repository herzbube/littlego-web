// ----------------------------------------------------------------------
// This file contains the controller that manages the "New game request" modal.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.controller("lg4wNewGameRequestController", ["$scope", "$rootScope", ANGULARNAME_SERVICE_WEBSOCKET, ANGULARNAME_SERVICE_ERRORHANDLING, function($scope, $rootScope, webSocketService, errorHandlingService) {

    // AngularJS uses strict comparison (===) to match model values with
    // option values. Because option values are always string values we
    // must also use a string value as our model default value.
    var noPreferenceValue = "" + GAMEREQUEST_NOPREFERENCE;

    $scope.requestedBoardSize = noPreferenceValue;
    $scope.requestedStoneColor = noPreferenceValue;
    $scope.requestedHandicap = noPreferenceValue;
    $scope.requestedKomi = noPreferenceValue;
    $scope.requestedKoRule = noPreferenceValue;
    $scope.requestedScoringSystem = noPreferenceValue;

    var noPreferenceOption = {
        optionValue: noPreferenceValue,
        optionText: GAMEREQUEST_NOPREFERENCE_TEXT
    };

    $scope.boardSizeOptions = [ noPreferenceOption ];
    BOARDSIZES_ARRAY.forEach(function(boardSize) {
        var boardSizeOption = {
            optionValue: "" + boardSize,
            optionText: boardSizeToString(boardSize)
        };
        $scope.boardSizeOptions.push(boardSizeOption);
    });

    $scope.stoneColorOptions = [ noPreferenceOption ];
    COLORS_ARRAY.forEach(function(stoneColor) {
        var stoneColorOption = {
            optionValue: "" + stoneColor,
            optionText: colorToString(stoneColor)
        };
        $scope.stoneColorOptions.push(stoneColorOption);
    });

    $scope.handicapOptions = [ noPreferenceOption ];
    HANDICAPS_ARRAY.forEach(function(handicap) {
        var handicapOption = {
            optionValue: "" + handicap,
            optionText: handicapToString(handicap)
        };
        $scope.handicapOptions.push(handicapOption);
    });

    $scope.komiOptions = [ noPreferenceOption ];
    KOMIS_ARRAY.forEach(function(komi) {
        var komiOption = {
            optionValue: "" + komi,
            optionText: komiToString(komi)
        };
        $scope.komiOptions.push(komiOption);
    });

    $scope.koRuleOptions = [ noPreferenceOption ];
    KORULES_ARRAY.forEach(function(koRule) {
        var koRuleOption = {
            optionValue: "" + koRule,
            optionText: koRuleToString(koRule)
        };
        $scope.koRuleOptions.push(koRuleOption);
    });

    $scope.scoringSystemOptions = [ noPreferenceOption ];
    SCORINGSYSTEMS_ARRAY.forEach(function(scoringSystem) {
        var scoringSystemOption = {
            optionValue: "" + scoringSystem,
            optionText: scoringSystemToString(scoringSystem)
        };
        $scope.scoringSystemOptions.push(scoringSystemOption);
    });

    $scope.submit = function() {
        webSocketService.submitNewGameRequest(
            $scope.requestedBoardSize,
            $scope.requestedStoneColor,
            $scope.requestedHandicap,
            $scope.requestedKomi,
            $scope.requestedKoRule,
            $scope.requestedScoringSystem
        );

        // TODO: Add "waiting for server response" overlay
    };

    webSocketService.addSubmitNewGameRequestListener(handleSubmitNewGameRequest);
    function handleSubmitNewGameRequest(success, gameRequestPairing, errorMessage) {

        // TODO Don't use jQuery
        $("#" + ID_NEW_GAME_REQUEST_MODAL).modal('hide');

        if (success)
        {
            // The pairing is optional - it's present only if the server found
            // a game request matching the one that we submitted
            if (gameRequestPairing !== undefined)
                $rootScope.$broadcast(ANGULARNAME_EVENT_SHOWCONFIRMGAMEREQUESTPAIRINGMODAL, gameRequestPairing);
        }
        else
        {
            errorHandlingService.showServerError(errorMessage);
        }
    }

    $scope.$on("$destroy", function() {
        webSocketService.removeSubmitNewGameRequestListener(handleSubmitNewGameRequest);
    })
}]);
