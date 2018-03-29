(function () {
    "use strict";

    // TODO: Establish connection. Include error handling!
    // var websocketUrl =
    //     "ws://"
    //     + websocketConfig.hostname
    //     + ":"
    //     + websocketConfig.port;
    // var webSocket = new WebSocket(websocketUrl);
    var theWebSocket = null;

    // Declare a few global variables
    var theSession = null;

    $(document).ready(function ()
    {
        // We can create the Session object only after the document is ready
        // because the validationComplete event handler needs to show or hide
        // elements in the DOM.
        theSession = new Session(theWebSocket, onSessionValidationComplete);

        // We want to handle the login process without form submission
        // mechanics because that would require another server request,
        // but we want to be a single-page app. We therefore don't
        // listen for the form's "submit" event (in fact the form cannot
        // be submitted at all, the button is not a submit button),
        // instead we perform just regular click handling.
        $("#login-form").on("submit", onLogin);

        $("#logout-button").on("click", onLogout);
    });

    function onSessionValidationComplete(session)
    {
        // TODO: This is executed too late, the user sees the
        // main app container for a very short moment before it's hidden.
        if (session.isValid())
        {
            $("#container-login-form").hide();
            $("#container-main-app").show();
        }
        else
        {
            $("#container-login-form").show();
            $("#container-main-app").hide();

            // This is necessary after a logout
            $("#email-address").focus();
        }
    }

    function onLogin(event)
    {
        // We don't want form submission to take place.
        // We want to handle the login process ourselves.
        event.preventDefault();

        // TODO Form validation

        var emailAddress = $("#email-address").val();
        var password = $("#password").val();
        // TODO: Add a checkbox to the login form and query its value
        var persistSession = true;

        // Triggers onSessionValidationComplete
        theSession.login(emailAddress, password, persistSession);

        $("#login-form")[0].reset();
    }

    function onLogout(event)
    {
        // We don't want the anchor click to take place.
        // We want to handle the logout process ourselves.
        event.preventDefault();

        // Triggers onSessionValidationComplete
        theSession.invalidate();
    }
})();