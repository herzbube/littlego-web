// ----------------------------------------------------------------------
// This file contains the controller that manages the
// "Confirm game resign" modal.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.controller("lg4wConfirmAcceptScoreProposalController", ["$scope", "$rootScope", ANGULARNAME_SERVICE_WEBSOCKET, ANGULARNAME_SERVICE_ERRORHANDLING, function($scope, $rootScope, webSocketService, errorHandlingService) {

    // Remember the unregister function so that we can use it on $destroy
    var unregisterShowConfirmAcceptScoreProposalModal = $rootScope.$on(ANGULARNAME_EVENT_SHOWCONFIRMACCEPTSCOREPROPOSALMODAL, function(event, gameID, resultType, winningStoneColor, winningPoints) {
        showConfirmAcceptScoreProposalModal(
            gameID,
            resultType,
            winningStoneColor,
            winningPoints);
    });

    var gameID = undefined;
    var resultType = undefined;
    var winningStoneColor = undefined;
    var winningPoints = undefined;

    function showConfirmAcceptScoreProposalModal(
        newGameID,
        newResultType,
        newWinningStoneColor,
        newWinningPoints)
    {
        gameID = newGameID;
        resultType = newResultType;
        winningStoneColor = newWinningStoneColor;
        winningPoints = newWinningPoints;

        // TODO Don't use jQuery
        $("#" + ID_MODAL_CONFIRM_ACCEPT_SCORE_PROPOSAL).modal()
    }

    $scope.acceptScoreProposal = function() {
        webSocketService.acceptScoreProposal(
            gameID,
            resultType,
            winningStoneColor,
            winningPoints);

        // TODO: Add "waiting for server response" modal
    };

    webSocketService.addAcceptScoreProposalListener(handleAcceptScoreProposal);
    function handleAcceptScoreProposal(success, responseGameID, errorMessage) {

        // TODO Don't use jQuery
        $("#" + ID_MODAL_CONFIRM_ACCEPT_SCORE_PROPOSAL).modal('hide');

        if (! success)
        {
            errorHandlingService.showServerError(errorMessage);
        }
    }

    $scope.$on("$destroy", function() {
        webSocketService.removeAcceptScoreProposalListener(handleAcceptScoreProposal);

        // If we had registered on our own $scope we wouldn't need to
        // unregister. But we registered on $rootScope.
        unregisterShowConfirmAcceptScoreProposalModal();
    })
}]);
