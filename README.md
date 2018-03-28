## Introduction

The [original Little Go](https://https://github.com/herzbube/littlego) is a free and open source iOS application that lets you play the game of Go on the iPhone or iPad. This project attempts to reimagine the original iOS app into the world of web applications, so that you can enjoy playing Go in a web browser in real time against a human opponent.

Little Go for the Web is released under the [Apache License](http://www.apache.org/licenses/LICENSE-2.0) (2.0).

## Is this useful for me?

If you != me, then the answer is: Probably not ☺. Little Go for the web is an educational project that I use to learn the basics of server-side and client-side web programming.

If you are interested in playing the game of Go, then frankly you are better off with one of the many established services that are already out there. To get an overview you can check out the 
American Go Association's page [Go on the Internet](http://www.usgo.org/go-internet).
 
I also recommend that you pay a visit to [Sensei's Library](https://senseis.xmp.net/), an invaluable resource for Go in general.

## Changes in this release

There have been no releases yet, and it is unlikely that this will ever see the light as an officially released software package.

## Getting and deploying the project

TODO: Write a section that explains what a developer has to do after cloning the repo in order to get the project to run.

TODO: Write another section that explains what a server admin has to do to in order to deploy the project.

## Contributing

In the unlikely event that you wish to contribute something to this educational project, feel free to fork the repo and create a pull request.

## Project structure

```
<root>
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
 +-- doc                 This folder contains the project documentation. The
 |                       content of this folder is not relevant for running
 |                       the application.
 +-- script              This folder contains command line scripts.
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
1. `index.php` reads configuration, which includes WebSocket connection information.
1. `index.php` serves a HTML document which consists of these parts:
   * The login form
   * The main application container
   * A small dynamically generated inline JavaScript snippet which creates an object that holds the WebSocket connection information
   * Several `<script>` elements that reference all the JavaScript fragements that together make up the client-side application code.
1. The client-side application connects to the WebSocket server
1. The client-side application displays the login form.
1. When the user logs in, the client-side application hides the login form and instead displays the main application container.

## Third party dependencies

This project has dependencies to a number of third party libraries. These dependencies are managed via the Composer package and dependency manager. The dependencies are listed in the file `composer.php` in the project root folder.
 
Before you can install the required third party libraries you must make sure that you have Composer installed on your system. Refer to the [Composer manual](https://getcomposer.org/doc/00-intro.md) for details. On macOS X the simplest way to make Composer available system-wide probably is via [Homebrew](https://brew.sh/). These are the necessary commands:

```
brew tap homebrew/homebrew-php   # only necessary if homebrew-php has not been tapped yet
brew install composer
```

Once Composer is ready to use you can install third party libraries by running Composer's ```install``` command. The exact syntax depends on how you installed Composer on your system. If in doubt, refer to Composer's manual. Here are two suggestions that might work for you:

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

The web server is now available from this URL: `http://localhost:8000`. If you need a different hostname and/or TCP port then you have to manually edit `The web server is now available from this URL: `http://localhost:8000`. If you need a different hostname and/or TCP port then you have to manually edit `the script.
`.


## Running the WebSocket server

The WebSocket server implemented in this project is based on the [Ratchet](http://socketo.me/) PHP library.

To run the WebSocket server, either locally during development or after deploying the project to an actual web server, run this script:

```
cd /path/to/project/root
./script/startWebSocketServer.sh
```

On Windows you can try to run `startWebSocketServer.bat`. This batch script has not been tested, though.

The web server is now available from this URL: `ws://localhost:8001`. If you need a different hostname and/or TCP port then you have to manually edit the file `src/config/config.php`.
