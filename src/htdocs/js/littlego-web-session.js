// The Session class represents a server-side session.
//
// A Session object must be created using a WebSocket object with an
// established connection. The Session object communicates with the Server via
// the WebSocket to fulfill its responsibilities. These are:
// - Validate a session key retrieved from Web Storage.
// - Validate credentials. If successful this creates a new session. The
//   session key is optionally persisted via Web Storage API.
// - Invalidate the current session.
//
// A Session object has an attached UserInfo object. If the session is valid
// the UserInfo object provides information about the user account that is
// associated with the session. If the session is not valid the UserInfo
// object also is not valid.
//
// Session keys are persisted via local Web Storage, i.e. all browser tabs and
// windows share the same session (COMM-007).
//
// Any session or credentials validation that a Session object performs is
// an asynchronous operation. The Session class defines the event
// "validationComplete" on which users can install a single event handler
// (property "onValidationComplete") that gets notified when an asynchronous
// validation operation has completed. The initial event handler is supplied
// on construction. When the event fires, the Session object invokes the
// currently installed event handler with the Session object and an optional
// error message as parameters. The event handler signature looks like this:
//   handleValidationComplete(session, errorMessage);
// The error message is set only if the server reports an error in response
// to the asynchronous operation. The error message is suitable for display
// to the user.
//
// Note that it is not possible to check if a validation operation is currently
// in progress. This is by design: Users of Session should rely on event
// handlers, not poll the Session object!
var Session = (function ()
{
    "use strict";

    const STORAGEKEY_SESSIONKEY = "sessionKey";

    // Creates a new Session object.
    //
    // Retrieves the session key from Web Storage. If no session key exists
    // the Session object represents an invalid session. If a session key
    // exists, the Session object immediately contacts the server and
    // validates the session key, with two possible outcomes:
    // - If the session key is still valid the Session represents a valid
    //   session and has an attached valid UserInfo object.
    // - If the session key is no longer valid the Session represents an
    //   invalid session.
    //
    // The Session object is treated as invalid while validation is
    // in progress.
    //
    // If the optional callback function is supplied it is installed as
    // handler for the validationComplete event, and will be invoked when
    // the Session object completes validation of the persisted session
    // key.
    //
    // Note: The validationComplete event fires even if no session key
    // exists in Web Storage and no actual validation took place. This
    // makes life much easier for users of the Session class because
    // it provides a uniform event interface.
    function Session(webSocket, callbackValidationComplete)
    {
        this.webSocket = webSocket;

        var self = this;
        this.webSocket.addEventListener("message", function(event) {
            self.handleWebSocketMessage(event);
        });

        this.sessionKey = undefined;
        this.userInfo = new UserInfo();
        this.isPersistentSession = false;

        this.onValidationComplete = callbackValidationComplete;
        this.validationInProgress = false;

        // We don't store the session key in this.sessionKey
        // because we want the session to remain invalid
        var sessionKey = localStorage[STORAGEKEY_SESSIONKEY];

        this.validationBegins();

        if (sessionKey !== undefined)
        {
            // Check with the server whether the stored session key is still
            // valid. If it's not, the message handler will remove the
            // session key from storage.
            var messageData = { sessionKey: sessionKey };
            sendWebSocketMessage(this.webSocket, WEBSOCKET_REQUEST_TYPE_VALIDATESESSION, messageData);
        }
        else
        {
            // Immediately notify callback
            this.validationEnds();
        }
    }

    // Returns true if the Session object represents a valid session, false if
    // not. A valid session also has an attached valid UserInfo object.
    Session.prototype.isValid = function()
    {
        if (this.sessionKey !== undefined)
            return true;
        else
            return false;
    };

    // Contacts the server to perform a login with the supplied credentials.
    // If the credentials are valid a new session is created and this Session
    // object represents a valid session. If the credentials are invalid no
    // session is created and this Session object represents an invalid
    // session.
    //
    // The Session object is treated as invalid while validation is
    // in progress.
    //
    // Credentials validation occurs asynchronously. When validation is
    // complete (regardless of the outcome) the handler for the
    // validationComplete event is invoked with the Session object as its sole
    // parameter.
    //
    // Note: If the Session object represents a valid session at the time this
    // function is invoked, the session is first invalidated. In that case the
    // validationComplete event will fire twice.
    Session.prototype.login = function(emailAddress, password, persistSession)
    {
        if (this.isValid())
        {
            // TODO: If this happens we must chain validation of the
            // credentials after invalidation of the old session. If this
            // gets complicated, it might be simpler to disallow calling
            // login() on a valid Session object.
            this.invalidate();
        }

        this.validationBegins();

        // TODO: Find a better way how to communicate the persistSession
        // parameter value to the web socket message handler
        this.isPersistentSessionRequested = persistSession;

        var messageData =
            {
                emailAddress: emailAddress,
                password: password,
            };
        sendWebSocketMessage(this.webSocket, WEBSOCKET_REQUEST_TYPE_LOGIN, messageData);
    };

    // Contacts the server to invalidate the session that the Session object
    // represents. Does nothing if the Session object currently represents
    // an invalid session.
    //
    // Session invalidation occurs asynchronously. When invalidation is
    // complete the handler for the validationComplete event is invoked with
    // the Session object as its sole parameter. While invalidation is in
    // progress the Session object is already treated as invalid.
    //
    // Note: If the Session object represents a valid session at the time this
    // function is invoked, the session is first invalidated. In that case the
    // validityChanged event will fire twice.

    Session.prototype.invalidate = function()
    {
        // TODO: Shouldn't we fire validationComplete? Not firing makes life
        // difficult for clients. On the other hands, clients should not
        // invalidate an already-invalid session...
        if (! this.isValid())
            return;

        if (this.isPersistentSession)
        {
            localStorage.removeItem(STORAGEKEY_SESSIONKEY);

            // TODO: If later on we store more data than just the session key
            // we may need to remove all data (because it can be expected that
            // all data depends on the session, and if the session is
            // invalidated the other data becomes invalid, too).
        }

        this.sessionKey = undefined;
        this.userInfo = new UserInfo();
        this.isPersistentSession = false;

        this.validationBegins();
        // TODO Contact the server to invalidate the session. The Session
        // object has already changed state so that it cannot be used anymore.
        this.validationEnds();
    };

    // Internal function. Updates the state of the Session object when an
    // asynchronous validation operation begins.
    Session.prototype.validationBegins = function()
    {
        if (this.validationInProgress)
            throw new Error("Validation is already in progress");

        this.validationInProgress = true;
    }

    // Internal function. Updates the state of the Session object when an
    // asynchronous validation operation ends. Also fires the
    // validationComplete event, i.e. calls the event handler (if one
    // is installed).
    //
    // The error message parameter is optional. It is not evaluated by
    // this function. It is passed on to the event handler of the
    // validationComplete event.
    Session.prototype.validationEnds = function(errorMessage)
    {
        if (! this.validationInProgress)
            throw new Error("No validation is in progress");

        this.validationInProgress = false;

        if (this.onValidationComplete !== undefined)
            this.onValidationComplete(this, errorMessage);
    };

    // Internal function. Handles incoming WebSocket messages that are
    // responses to messages sent by the Session object.
    Session.prototype.handleWebSocketMessage = function(event)
    {
        var webSocketMessage = JSON.parse(event.data);

        switch (webSocketMessage.messageType)
        {
            case WEBSOCKET_RESPONSE_TYPE_VALIDATESESSION:
                if (webSocketMessage.data.success)
                {
                    this.sessionKey = webSocketMessage.data.sessionKey;
                    this.userInfo = new UserInfo(webSocketMessage.data.userInfo);
                    // Session validation occurs only if we have a session key
                    // in Web Storage, so this automatically becomes a
                    // persistent session.
                    this.isPersistentSession = true;
                }
                else
                {
                    localStorage.removeItem(STORAGEKEY_SESSIONKEY);
                }

                this.validationEnds(webSocketMessage.data.errorMessage);

                break;

            case WEBSOCKET_RESPONSE_TYPE_LOGIN:
                if (webSocketMessage.data.success)
                {
                    this.sessionKey = webSocketMessage.data.sessionKey;
                    this.userInfo = new UserInfo(webSocketMessage.data.userInfo);
                    // The isPersistentSessionRequested property was set when
                    // the Session object received the login request
                    this.isPersistentSession = this.isPersistentSessionRequested;

                    if (this.isPersistentSession === true)
                        localStorage[STORAGEKEY_SESSIONKEY] = this.sessionKey;
                }

                // Remove temporary property
                delete this.isPersistentSessionRequested;

                this.validationEnds(webSocketMessage.data.errorMessage);

                break;

            default:
                // Ignore all messages that are not session related
                break;
        }
    };

    return Session;
})();

// The UserInfo class represents a server-side user account. It is merely a data
// object that provides information about the user.
//
// The "displayName" property is notably useful for displaying in the UI.
var UserInfo = (function ()
{
    "use strict";

    function UserInfo(userInfoJsonObject)
    {
        if (userInfoJsonObject !== undefined)
        {
            this.userID = userInfoJsonObject.userID;
            this.emailAddress = userInfoJsonObject.emailAddress;
            this.displayName = userInfoJsonObject.displayName;
        }
    }

    UserInfo.prototype.isValid = function()
    {
        if (this.userID !== undefined)
            return true;
        else
            return false;
    }

    return UserInfo;
})();
