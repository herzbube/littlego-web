// ----------------------------------------------------------------------
// This file contains the controller that manages the registration form.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.controller("lg4wRegistrationFormController", ["$scope", "$location", ANGULARNAME_CONSTANT_URLBASEPATH, ANGULARNAME_SERVICE_WEBSOCKET, ANGULARNAME_SERVICE_SESSION, function($scope, $location, urlBasePath, webSocketService, sessionService) {

    $scope.urlBasePath = urlBasePath;

    $scope.emailAddress = "";
    $scope.displayName = "";
    $scope.password = "";
    $scope.validationErrorMessage = "";

    $scope.hasValidationError = function() {
        return ($scope.validationErrorMessage !== "");
    };

    $scope.onRegisterClicked = function() {
        webSocketService.registerAccount($scope.emailAddress, $scope.displayName, $scope.password);

        // TODO: Display some sort of progress overlay in case registration
        // takes longer than expected. This also prevents the user from
        // fiddling with the form data that onRegistrationComplete() needs
        // to perform the auto-login.
    };

    webSocketService.addRegisterAccountListener(handleRegisterAccount);
    function handleRegisterAccount(success, errorMessage) {
        $scope.$apply(function() {
            if (success)
            {
                $scope.validationErrorMessage = "";

                // Unfortunately we have to handle the login process
                // ourselves, hence our handleValidationComplete
                // implementation below.
                // TODO: Remove/change this code when email address verification
                // is implemented.
                var persistSession = true;
                sessionService.login($scope.emailAddress, $scope.password, persistSession)
            }
            else
            {
                $scope.validationErrorMessage = errorMessage;

                // TODO: The focus should be set on the input control
                // that contains the erroneous data
                // TODO: Don't use jQuery
                $("#" + ID_INPUT_REGISTRATION_EMAIL_ADDRESS).focus();
            }
        });
    }

    sessionService.addValidationCompleteListener(handleValidationComplete);
    // TODO: This is a duplicate of the same function in the login form
    // controller.
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
            }
        });
    }

    $scope.$on("$destroy", function() {
        webSocketService.removeRegisterAccountListener(handleRegisterAccount);
        sessionService.removeValidationCompleteListener(handleValidationComplete);
    })
}]);
