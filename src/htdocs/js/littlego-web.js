(function () {
    "use strict";

    $(document).ready(function () {
        // TODO Check if user is already logged in

        // TODO: This is executed too late, the user sees the
        // main app container for a very short moment before it's hidden.
        $("#container-login-form").show();
        $("#container-main-app").hide();

        // We want to handle the login process without form submission
        // mechanics because that would require another server request,
        // but we want to be a single-page app. We therefore don't
        // listen for the form's "submit" event (in fact the form cannot
        // be submitted at all, the button is not a submit button),
        // instead we perform just regular click handling.
        $("#login-button").on("click", onLogin);

        // TODO: Establish connection. Include error handling!
        // var websocketUrl =
        //     "ws://"
        //     + websocketConfig.hostname
        //     + ":"
        //     + websocketConfig.port;
        // var socket = new WebSocket(websocketUrl);
    });

    function onLogin() {
        // TODO Form validation
        // TODO Login via WebSocket
        // TODO Store session locally

        $("#container-login-form").hide();
        $("#container-main-app").show();
    }
})();