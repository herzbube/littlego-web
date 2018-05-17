// ----------------------------------------------------------------------
// This file contains code that implements an AngularJS service for
// managing the login session on the client.
// ----------------------------------------------------------------------

"use strict";

// The Session service depends on the WebSocket service so that it can
// communicate with the server to fulfill its responsibilities. These are:
// - Validate a session key retrieved from Web Storage (occurs only once
//   when the service is initialized).
// - Validate credentials. If successful this creates a new session. The
//   session key is optionally persisted via Web Storage API.
// - Invalidate the current session.
//
// The service starts its life in the "not ready" state. When the WebSocket
// connection becomes established the service attempts to validate a
// stored session key if one is present. Once this validation step is
// complete (regardless of whether the session is valid or not) the service
// changes its state to the "is ready" state. Service consumers can query the
// service state via the isReady() function. Service consumers can add an
// event listener for the "serviceIsReady" event to get notified when the
// service becomes ready.
//
// The service has an attached UserInfo object. If the service has a valid
// session the UserInfo object provides information about the user account
// that is associated with the session. If the session is not valid the
// UserInfo object also is not valid.
//
// Session keys are persisted via local Web Storage, i.e. all browser tabs and
// windows share the same session (COMM-007).
//
// Any session or credentials validation that the service performs is an
// asynchronous operation. Service consumers can add an event listener for
// the "validationComplete" event to get notified when an asynchronous
// validation operation has completed. When the event fires, the service
// invokes event handlers with an optional error message as parameter. The
// event handler signature looks like this:
//   handleValidationComplete(errorMessage);
// The error message is set only if the server reports an error in response
// to the asynchronous operation. The error message is suitable for display
// to the user.
//
// Note that it is not possible to check if a validation operation is currently
// in progress. This is by design: Service consumers should rely on event
// handlers, not poll the service!
lg4wApp.service(ANGULARNAME_SERVICE_SESSION, [ANGULARNAME_SERVICE_WEBSOCKET, "$log", function(webSocketService, $log) {

    // ----------------------------------------------------------------------
    // Initialize the service
    // ----------------------------------------------------------------------
    var sessionKey = undefined;
    var userInfo = new UserInfo();
    var isPersistentSession = false;
    var validationInProgress = false;
    var isPersistentSessionRequested = undefined;

    webSocketService.addLoginListener(handleLogin);
    webSocketService.addLogoutListener(handleLogout);
    webSocketService.addValidateSessionListener(handleValidateSession);
    // TODO: Remove event listeners

    // ----------------------------------------------------------------------
    // Stored session validation
    // ----------------------------------------------------------------------

    if (webSocketService.isReady())
        validateInitialSessionIfExists();
    else
        webSocketService.addServiceIsReadyListener(handleWebSocketServiceIsReady);

    function handleWebSocketServiceIsReady()
    {
        webSocketService.removeServiceIsReadyListener(handleWebSocketServiceIsReady);

        validateInitialSessionIfExists();
    }

    function validateInitialSessionIfExists()
    {
        // Don't store the session key in the service's sessionKey
        // variable because we want the service's session to remain
        // invalid
        var sessionKey = localStorage[STORAGEKEY_SESSIONKEY];

        validationBegins();

        if (sessionKey !== undefined)
        {
            $log.debug(ANGULARNAME_SERVICE_SESSION + ": Begin validating stored session...");

            // Check with the server whether the stored session key is still
            // valid. If it's not, the message handler will remove the
            // session key from storage.
            webSocketService.validateSession(sessionKey);
        }
        else
        {
            $log.debug(ANGULARNAME_SERVICE_SESSION + ": No stored session available");

            // Immediately notify event listeners
            handleServiceIsReady();
            validationEnds();
        }
    }

    // ----------------------------------------------------------------------
    // Service is ready handling
    // ----------------------------------------------------------------------

    var isServiceReady = false;

    this.isReady = function()
    {
        return isServiceReady;
    };

    function handleServiceIsReady()
    {
        isServiceReady = true;

        $log.debug(ANGULARNAME_SERVICE_SESSION + ": Service is ready");

        eventListeners.serviceIsReady.forEach(function(listener) {
            listener();
        });
    }

    function handleServiceIsNotReady()
    {
        $log.debug(ANGULARNAME_SERVICE_SESSION + ": Service is NOT ready");

        isServiceReady = false;
    }

    // ----------------------------------------------------------------------
    // Event listeners
    // ----------------------------------------------------------------------

    var eventListeners =
        {
            serviceIsReady: [],
            validationComplete: []
        };

    // ----------------------------------------------------------------------
    // validationComplete event handling
    // ----------------------------------------------------------------------

    // Internal function. Updates the state of the service when an
    // asynchronous validation operation begins.
    function validationBegins()
    {
        if (validationInProgress)
            throw new Error("Internal error: Validation is already in progress");

        validationInProgress = true;
    }

    // Internal function. Updates the state of the service when an
    // asynchronous validation operation ends. Also fires the
    // validationComplete event, i.e. invokes event listeners if
    // any are registered.
    //
    // The error message parameter is optional. It is not evaluated by
    // this function. It is passed on to listeners of the
    // validationComplete event.
    function validationEnds(errorMessage)
    {
        if (! validationInProgress)
            throw new Error("Internal error: No validation is in progress");

        validationInProgress = false;

        eventListeners.validationComplete.forEach(function(listener) {
            listener(errorMessage);
        });
    }

    // ----------------------------------------------------------------------
    // Public API
    // ----------------------------------------------------------------------

    // The serviceIsReady event is invoked after the WebSocket connection
    // is established and the stored session validation is complete.
    this.addServiceIsReadyListener = function(listener) {
        eventListeners.serviceIsReady.push(listener);
    };

    this.removeServiceIsReadyListener = function(listener)
    {
        var index = eventListeners.serviceIsReady.indexOf(listener);
        if (-1 !== index)
            eventListeners.serviceIsReady.splice(index, 1);
    };

    // Adds an event listener for the "validationComplete" event. The
    // listener function is invoked whenever an asynchronous validation
    // operation completes. The listener function is invoked with a single
    // error message parameter. The parameter value is undefined if the
    // validation operation was successful.
    this.addValidationCompleteListener = function(listener)
    {
        eventListeners.validationComplete.push(listener);
    };

    this.removeValidationCompleteListener = function(listener)
    {
        var index = eventListeners.validationComplete.indexOf(listener);
        if (-1 !== index)
            eventListeners.validationComplete.splice(index, 1);
    };

    // Returns true if the service has a valid session, false if not.
    // A valid session also has an attached valid UserInfo object.
    this.hasValidSession = function()
    {
        if (sessionKey !== undefined)
            return true;
        else
            return false;
    };

    // Returns the UserInfo object that describes the user account that is
    // associated with the session. If the service has an invalid session,
    // the UserInfo returned here also is not valid.
    this.getUserInfo = function()
    {
        return userInfo;
    };

    // Contacts the server to perform a login with the supplied credentials.
    // If the credentials are valid a new session is created and the service
    // has a valid session. If the credentials are invalid no session is
    // created and the service has an invalid session.
    //
    // The service has an invalid session while validation is in progress.
    //
    // Credentials validation occurs asynchronously. When validation is
    // complete (regardless of the outcome) registered listeners for the
    // validationComplete event are invoked.
    //
    // Note: If the service has a valid session at the time this function
    // is invoked, the service first invalidates the session. In that case
    // the validationComplete event will fire twice.
    this.login = function(emailAddress, password, persistSession)
    {
        if (this.hasValidSession())
        {
            // TODO: If this happens we must chain validation of the
            // credentials after invalidation of the old session. If this
            // gets complicated, it might be simpler to disallow calling
            // login() while the session is valid.
            this.invalidate();
        }

        validationBegins();

        // TODO: Find a better way how to communicate the persistSession
        // parameter value to the web socket message handler. If login()
        // is invoked twice in a row the second call overwrites the
        // persistSession value from the first call.
        isPersistentSessionRequested = persistSession;

        webSocketService.login(emailAddress, password);
    };

    // Contacts the server to logout, i.e. invalidate the session that the
    // service has. Does nothing if the service currently has an invalid
    // session.
    //
    // While invalidation is in progress the service already has an invalid
    // session.
    //
    // Session invalidation occurs asynchronously. When invalidation is
    // complete registered listeners for the validationComplete event are
    // invoked.
    this.logout = function() {
        // TODO: Shouldn't we fire validationComplete? Not firing makes life
        // difficult for clients. On the other hands, clients should not
        // invalidate an already-invalid session...
        if (! this.hasValidSession())
            return;

        if (isPersistentSession)
            localStorage.removeItem(STORAGEKEY_SESSIONKEY);

        sessionKey = undefined;
        userInfo = new UserInfo();
        isPersistentSession = false;

        validationBegins();

        webSocketService.logout();
    };

    // ----------------------------------------------------------------------
    // Internal handling of WebSocket messages
    // ----------------------------------------------------------------------

    function handleLogin(
        success,
        sessionKeyFromServer,
        userInfoFromServer,
        errorMessage)
    {
        if (success)
        {
            sessionKey = sessionKeyFromServer;
            userInfo = new UserInfo(userInfoFromServer);
            // The isPersistentSessionRequested property was set when
            // the Session object received the login request
            isPersistentSession = isPersistentSessionRequested;

            if (isPersistentSession === true)
                localStorage[STORAGEKEY_SESSIONKEY] = sessionKey;

            isPersistentSessionRequested = undefined;
            validationEnds();
        }
        else
        {
            isPersistentSessionRequested = undefined;
            validationEnds(errorMessage);
        }
    }

    function handleLogout(
        success,
        errorMessage)
    {
        // In this service we don't really care about any server-side
        // problems on logout. The session is already invalid, anyway.
        if (success)
            validationEnds();
        else
            validationEnds(errorMessage);
    }

    function handleValidateSession(
        success,
        sessionKeyFromServer,
        userInfoFromServer,
        errorMessage)
    {
        $log.debug(ANGULARNAME_SERVICE_SESSION + ": Stored session was " + (success ? "valid" : "invalid"));

        if (success)
        {
            sessionKey = sessionKeyFromServer;
            userInfo = new UserInfo(userInfoFromServer);
            // Session validation occurs only if we have a session key
            // in Web Storage, so this automatically becomes a
            // persistent session.
            isPersistentSession = true;

            handleServiceIsReady();
            validationEnds();
        }
        else
        {
            localStorage.removeItem(STORAGEKEY_SESSIONKEY);

            handleServiceIsReady();
            validationEnds(errorMessage);
        }
    }
}]);

// The UserInfo class represents a server-side user account. It is merely a
// data object that provides information about the user.
//
// The "displayName" property is useful for displaying in the UI. The
// "userID" property is useful for
var UserInfo = (function ()
{
    function UserInfo(userInfoJsonObject)
    {
        if (userInfoJsonObject !== undefined)
        {
            this.userID = userInfoJsonObject.userID;
            this.displayName = userInfoJsonObject.displayName;
        }
    }

    UserInfo.prototype.isValid = function()
    {
        if (this.userID !== undefined)
            return true;
        else
            return false;
    };

    return UserInfo;
})();
