// ----------------------------------------------------------------------
// This file contains the controller that manages the logout process.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.controller("lg4wLogoutController", ["$scope", "$location", ANGULARNAME_CONSTANT_URLBASEPATH, ANGULARNAME_SERVICE_SESSION, function($scope, $location, urlBasePath, sessionService) {

    $scope.urlBasePath = urlBasePath;

    // Perform logout only if there actually is an invalid session. This
    // check is necessary in case the user directly navigates to the
    // logout URL.
    if (sessionService.hasValidSession())
        sessionService.logout();

    // Give the user time to read the logout message.
    // Note that if the user manually clicks the link in the logout message,
    // the callback is never executed.
    var timeoutInMilliseconds = LOGOUT_MESSAGE_DELAY_IN_MILLISECONDS;
    setTimeout(function() {
        $scope.$apply(function() {
            $location.path(ANGULARROUTE_PATH_LOGIN);
        });
    }, timeoutInMilliseconds);

}]);
