// ----------------------------------------------------------------------
// This file contains the controller that manages the
// "Confirm game resign" modal.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.controller("lg4wConfirmGameResignController", ["$scope", "$rootScope", ANGULARNAME_SERVICE_WEBSOCKET, ANGULARNAME_SERVICE_ERRORHANDLING, function($scope, $rootScope, webSocketService, errorHandlingService) {

    // Remember the unregister function so that we can use it on $destroy
    var unregisterShowConfirmGameResignModal = $rootScope.$on(ANGULARNAME_EVENT_SHOWCONFIRMGAMERESIGNMODAL, function(event, gameID) {
        showConfirmGameResignModal(gameID);
    });

    var gameID = GAMEID_UNDEFINED;

    function showConfirmGameResignModal(newGameID) {
        gameID = newGameID;

        // TODO Don't use jQuery
        $("#" + ID_MODAL_CONFIRM_GAME_RESIGN).modal()
    }

    $scope.resignGame = function() {
        webSocketService.resignGame(gameID);

        // TODO: Add "waiting for server response" modal
    };

    webSocketService.addResignGameListener(handleResignGame);
    function handleResignGame(success, errorMessage) {

        // TODO Don't use jQuery
        $("#" + ID_MODAL_CONFIRM_GAME_RESIGN).modal('hide');

        if (! success)
        {
            errorHandlingService.showServerError(errorMessage);
        }
    }

    $scope.$on("$destroy", function() {
        webSocketService.removeResignGameListener(handleResignGame);

        // If we had registered on our own $scope we wouldn't need to
        // unregister. But we registered on $rootScope.
        unregisterShowConfirmGameResignModal();
    })
}]);
