// ----------------------------------------------------------------------
// This file contains the controller that manages the login form.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.controller("lg4wLoginFormController", ["$scope", "$location", ANGULARNAME_SERVICE_SESSION, function($scope, $location, sessionService) {

    $scope.emailAddress = "";
    $scope.password = "";
    // TODO: Add checkbox for this to the form
    $scope.persistSession = true;
    $scope.validationErrorMessage = "";

    $scope.hasValidationError = function() {
        return ($scope.validationErrorMessage !== "");
    };

    $scope.onLoginClicked = function() {
        sessionService.login($scope.emailAddress, $scope.password, $scope.persistSession);
    };

    sessionService.addValidationCompleteListener(handleValidationComplete);
    function handleValidationComplete(errorMessage) {
        $scope.$apply(function() {
            if (errorMessage === undefined)
            {
                $scope.validationErrorMessage = "";
                $location.path(ANGULARROUTE_PATH_GAMESINPROGRESS);
            }
            else
            {
                $scope.validationErrorMessage = errorMessage;

                // For security reasons, the server does not tell us whether
                // the email address or the password were wrong, so we
                // can't focus on a specific field.
                // TODO: Don't use jQuery
                $("#" + ID_INPUT_LOGIN_EMAIL_ADDRESS).focus();
            }
        });
    }

    $scope.$on("$destroy", function() {
        sessionService.removeValidationCompleteListener(handleValidationComplete);
    })
}]);
