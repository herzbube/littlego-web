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

