// ----------------------------------------------------------------------
// This file contains code that implements an AngularJS service for
// error handling.
// ----------------------------------------------------------------------

"use strict";

// The Error Handling service currently supports only showing a modal with
// an error message in response to a server communication error.
//
// The Error Handling service can be extended with arbitrary functions
// if more error handling functionality is required.
lg4wApp.service(ANGULARNAME_SERVICE_ERRORHANDLING, [function() {

    // ----------------------------------------------------------------------
    // Friends API - friend controllers can set their handlers here.
    // Only a single handler can be set per error type.
    // ----------------------------------------------------------------------

    var showServerErrorHandler = undefined;
    this.setShowServerErrorHandler = function(newShowServerErrorHandler) {
        showServerErrorHandler = newShowServerErrorHandler;
    };
    this.removeShowServerErrorHandler = function() {
        showServerErrorHandler = undefined;
    };

    // ----------------------------------------------------------------------
    // Public API
    // ----------------------------------------------------------------------

    this.showServerError = function(serverErrorMessage)
    {
        if (showServerErrorHandler !== undefined)
            showServerErrorHandler(serverErrorMessage);
    };
}]);

lg4wApp.controller("lg4wServerErrorController", ["$scope", ANGULARNAME_SERVICE_ERRORHANDLING, function($scope, errorHandlingService) {

    $scope.serverErrorMessage = "";

    errorHandlingService.setShowServerErrorHandler(handleShowServerError);
    function handleShowServerError(serverErrorMessage)
    {
        $scope.$apply(function() {
            $scope.serverErrorMessage = serverErrorMessage;
        });

        // TODO: Don't use jQuery
        $("#" + ID_SERVER_ERROR_MODAL).modal()
    }

    $scope.$on("$destroy", function() {
        errorHandlingService.removeShowServerErrorHandler();
    })
}]);
