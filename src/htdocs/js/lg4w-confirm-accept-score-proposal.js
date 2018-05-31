// ----------------------------------------------------------------------
// This file contains the controller that manages the
// "Confirm game resign" modal.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.controller("lg4wConfirmAcceptScoreProposalController", ["$scope", "$rootScope", function($scope, $rootScope) {

    var callbackOnScoreProposalAccepted = undefined;

    // Remember the unregister function so that we can use it on $destroy
    var unregisterShowConfirmAcceptScoreProposalModal = $rootScope.$on(ANGULARNAME_EVENT_SHOWCONFIRMACCEPTSCOREPROPOSALMODAL, function(event, newCallbackOnScoreProposalAccepted) {

        callbackOnScoreProposalAccepted = newCallbackOnScoreProposalAccepted;

        // TODO Don't use jQuery
        $("#" + ID_MODAL_CONFIRM_ACCEPT_SCORE_PROPOSAL).modal()
    });

    $scope.acceptScoreProposal = function() {

        if (callbackOnScoreProposalAccepted !== undefined)
            callbackOnScoreProposalAccepted();
    };

    $scope.$on("$destroy", function() {

        // If we had registered on our own $scope we wouldn't need to
        // unregister. But we registered on $rootScope.
        unregisterShowConfirmAcceptScoreProposalModal();
    })
}]);
