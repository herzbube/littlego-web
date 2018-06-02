// ----------------------------------------------------------------------
// This file contains the controller that manages the
// "Confirm game resign" modal.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.controller("lg4wConfirmGameResignController", ["$scope", "$rootScope", function($scope, $rootScope) {

    var callbackOnGameResigned = undefined;

    // Remember the unregister function so that we can use it on $destroy
    var unregisterShowConfirmGameResignModal = $rootScope.$on(ANGULARNAME_EVENT_SHOWCONFIRMGAMERESIGNMODAL, function(event, newCallbackOnGameResigned) {

        callbackOnGameResigned = newCallbackOnGameResigned;

        // TODO Don't use jQuery
        $("#" + ID_MODAL_CONFIRM_GAME_RESIGN).modal()
    });

    $scope.resignGame = function() {

        if (callbackOnGameResigned !== undefined)
            callbackOnGameResigned();
    };

    $scope.$on("$destroy", function() {

        // If we had registered on our own $scope we wouldn't need to
        // unregister. But we registered on $rootScope.
        unregisterShowConfirmGameResignModal();
    });
}]);
