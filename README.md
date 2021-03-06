## Introduction

The [original Little Go](https://github.com/herzbube/littlego) is a free and open source iOS application that lets you play the game of Go on the iPhone or iPad. This project attempts to reimagine the original iOS app into the world of web applications, so that you can enjoy playing Go in a web browser in real time against a human opponent.

Little Go for the Web is released under the [Apache License](http://www.apache.org/licenses/LICENSE-2.0) (2.0).

## Is this useful for me?

If you != me, then the answer is: Probably not ☺. Little Go for the web is an educational project that I use to learn the basics of server-side and client-side web programming.

If you are interested in playing the game of Go, then frankly you are better off with one of the many established services that are already out there. To get an overview you can check out the 
American Go Association's page [Go on the Internet](http://www.usgo.org/go-internet).
 
I also recommend that you pay a visit to [Sensei's Library](https://senseis.xmp.net/), an invaluable resource for Go in general.

## Installation

Read the [INSTALL.md](INSTALL.md) file for instructions on how to get the project to run on a real server machine.

## Contributing

In the unlikely event that you wish to contribute something to this educational project, feel free to fork the repo and create a pull request.

## Project structure

```
<root>
 +-- INSTALL.md          Installation instructions to get the project to run
 |                       on a real server. This file is formatted in Markdown.
 +-- LICENSE             The Apache license file.
 +-- LICENSE.html        The Apache license in HTML format.
 +-- NOTICE              Attribution notices.
 +-- README.md           Introduction to the project. This file is formatted in
 |                       Markdown and rendered as the front page on GitHub.
 +-- composer.json       The Composer configuration file.
 +-- vendor              This folder is not under version control and does not
 |                       exist when you initially clone the repository. The
 |                       folder is created by Composer when you run it for the
 |                       first time.
 +-- db                  This folder contains database-related stuff, most
 |                       importantly the database creation script.
 +-- doc                 This folder contains the project documentation. The
 |                       content of this folder is not relevant for running
 |                       the application.
 +-- script              This folder contains command line scripts, notably
 |                       the script that launches the WebSocket server process.
 +-- src                 This folder contains the project's source code and
 |   |                   assets, in fact everything that is required for
 |   |                   actually running the application.
 |   +-- htdocs          The content of this folder should be published by
 |   |                   the web server. Nothing else in the "src" folder
 |   |                   should be directly accessible via an URL.
 |   +-- lib             Library files pulled in by the files in the "htdocs"
 |   |                   folder when necessary.
 |   +-- config          Project configuration files pulled in by the files
 |                       in the "htdocs" folder when necessary.
 +-- test                This folder contains the project's unit test files.
```

## Client-side application bootstrap mechanism

This is how the application is bootstrapped:

1. The user retrieves `index.php`.
1. `index.php` reads configuration from `config_defaults.php` and `config.php`, which includes WebSocket connection information.
1. `index.php` serves a HTML document which consists of these parts:
   * The AngularJS main application controller
   * A small dynamically generated inline JavaScript snippet which creates an object that holds the WebSocket connection information
   * Several `<script>` elements that reference all the JavaScript fragements that together make up the client-side application code.
1. The client-side application connects to the WebSocket server
1. The client-side application displays the login form or, depending on the initial URL, some other content.

## System requirements

#### PHP

PHP 7.1 or newer is required because the project makes use of the PHP feature "nullable return types".

#### Database

Currently this project requires the MySQL database server with a reasonably up-to-date version.
 
Since the project does not use highly specific MySQL features, a product with reasonable compatibility such as MariaDB might also work. However, development and testing have been done with MySQL only.

First steps have been taken to make the project database independent: It uses the PDO database abstraction library, and it generates all SQL queries in a dedicated class `SQLGenerator` (which could be refactored into a generic interface and DBMS-specific implementations).

## Third party dependencies

This project has dependencies to a number of third party libraries. These dependencies are managed via the Composer package and dependency manager. The dependencies are listed in the file `composer.php` in the project root folder.
 
Before you can install the required third party libraries you must make sure that you have Composer installed on your system. Refer to the [Composer manual](https://getcomposer.org/doc/00-intro.md) for details. On macOS X the simplest way to make Composer available system-wide probably is via [Homebrew](https://brew.sh/). These are the necessary commands:

```
brew tap homebrew/homebrew-php   # only necessary if homebrew-php has not been tapped yet
brew install composer
```

Once Composer is ready to use you can install third party libraries by running Composer's `install` command. The exact syntax depends on how you installed Composer on your system. If in doubt, refer to Composer's manual. Here are two suggestions that might work for you:

```
cd /path/to/project/root

# If you installed Composer via Homebrew:
composer install

# If you installed Composer as a standalone PHP archive (.phar):
php composer.phar install
```

## Running a local web server for development

If you don't have an actual web server available for testing during development, then a "poor man" solution that nevertheless should be sufficient is to run PHP's integrated web server.

If this is what you want, then run this script:

```
cd /path/to/project/root
./script/startWebServer.sh
```

On Windows you can try to run `startWebServer.bat`. This batch script has not been tested, though.

The web server is now available from this URL: `http://localhost:8000`. If you need a different hostname and/or TCP port then you have to manually edit `startWebServer.sh` (or `startWebServer.bat` on Windows).


## Running the WebSocket server

**Important**: Before you run the WebSocket server for the first time, you must **create the database** and **configure the WebSocket server**. See the corresponding sections below.

The WebSocket server implemented in this project is based on the [Ratchet](http://socketo.me/) PHP library.

To run the WebSocket server, either locally during development or after deploying the project to an actual web server, run this script:

```
cd /path/to/project/root
./script/startWebSocketServer.sh
```

On Windows you can try to run `startWebSocketServer.bat`. This batch script has not been tested, though.

The web server is now available from this URL: `ws://localhost:8001`. If you need a different hostname and/or TCP port then you have to manually edit the file `src/config/config.php`.


## Creating the database

Make sure you have MySQL installed (cf. section "System requirements"). Then use one of the following commands to create the database on the command line:

```
# For TCP/IP connections
php db/createDatabase.php hostname port username password dbname

# For socket connections
php db/createDatabase.php /path/to/socket username password dbname
```

As an alternative, you can run the database creation SQL script with a tool of your choice, such as phpMyAdmin. The script is located in the file `createDatabase.sql` in the subfolder `db`.

## Configuring the WebSocket server

The WebSocket server configuration is located in the subfolder `src/config`. This folder contains the file `config-template.php` which you can use as a template for creating your own configuration. To create the actual configuration, follow these steps:

1. Copy the template file `config-template.php` to a new file which **must** be named `config.php`.
1. Open `config.php` in any text editor.
1. Perform the edits you need. You will at least have to configure the details for accessing the database.
1. Save your changes.

The WebSocket server is now ready for start. On startup, the Websocket server immediately performs a test connection to the database so that configuration problems are detected without delay. If there is a connection problem, the WebSocket server immediately aborts with an exception.

## Configuring the URL base path

An important aspect of the web server configuration is the location where the user can access the application. The project's default configuration assumes that the application is accessible from the document root, i.e. from the base path

    /

This typically is the case if you run Little Go for the Web in its own virtual host, or from the PHP built-in web server in a dev/test environment.
 
If you want to make Little Go for the Web accessible from a different base path than `/`, then you have to specify that URL base path in the config file `config.php`.

## Debugging / development aids

### Server-side logging

The WebSocket server sends log messages to the system's log service. On Linux this typically is `syslog`.

In the config file `config.php` you can specify a number of options that change the way how logging is done. Notably you can increase the log level.

### Client-side logging

Search the client-side JavaScript code for the following line:

    $logProvider.debugEnabled(false);

Set this to true if you want to see some logging in the JavaScript console of your browser.


### Artificially delay WebSocket communication

In the config file `config.php` you can specify two artificial delays for slowing down the WebSocket communication. The two options add a bottleneck either on the server or on the client side (or both, if you want this for some reason).

For instance, the following config snippet will delay sending and receiving messages by 3000 milliseconds (i.e. 3 seconds) per message.

```
$config->webSocketMessageSendDelayInMilliseconds = 3000;
$config->webSocketMessageReceiveDelayInMilliseconds = 3000;
```

This is very useful for manual testing: You can easily see how the application will handle impatient users ☺.
