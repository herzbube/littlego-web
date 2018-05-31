// ----------------------------------------------------------------------
// This file contains code that implements an AngularJS service for
// showing and hiding a "please wait" modal.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.service(ANGULARNAME_SERVICE_PLEASEWAIT, [function() {

    // ----------------------------------------------------------------------
    // Friends API - a friend controller can set its handlers here.
    // ----------------------------------------------------------------------

    var showPleaseWaitModalHandler = undefined;
    this.setShowPleaseWaitModalHandler = function(newShowPleaseWaitModalHandler) {
        showPleaseWaitModalHandler = newShowPleaseWaitModalHandler;
    };
    this.removeShowPleaseWaitModalHandler = function() {
        showPleaseWaitModalHandler = undefined;
    };

    var hidePleaseWaitModalHandler = undefined;
    this.setHidePleaseWaitModalHandler = function(newHidePleaseWaitModalHandler) {
        hidePleaseWaitModalHandler = newHidePleaseWaitModalHandler;
    };
    this.removeHidePleaseWaitModalHandler = function() {
        hidePleaseWaitModalHandler = undefined;
    };

    // ----------------------------------------------------------------------
    // Public API
    // ----------------------------------------------------------------------

    this.showPleaseWaitModal = function() {
        if (showPleaseWaitModalHandler !== undefined)
            showPleaseWaitModalHandler();
    };

    this.hidePleaseWaitModal = function() {
        if (hidePleaseWaitModalHandler !== undefined)
            hidePleaseWaitModalHandler();
    };
}]);

lg4wApp.controller("lg4wPleaseWaitController", ["$scope", ANGULARNAME_SERVICE_PLEASEWAIT, function($scope, pleaseWaitService) {

    pleaseWaitService.setShowPleaseWaitModalHandler(handleShowPleaseWaitModal);
    function handleShowPleaseWaitModal() {
        // TODO: Don't use jQuery
        $("#" + ID_MODAL_PLEASE_WAIT).modal()
    }

    pleaseWaitService.setHidePleaseWaitModalHandler(handleHidePleaseWaitModal);
    function handleHidePleaseWaitModal() {
        // TODO: Don't use jQuery
        $("#" + ID_MODAL_PLEASE_WAIT).modal("hide");
    }

    $scope.$on("$destroy", function() {
        pleaseWaitService.removeShowPleaseWaitModalHandler();
        pleaseWaitService.removeHidePleaseWaitModalHandler();
    })
}]);
