## Introduction

This document contains some installation instructions that should help you in getting Little Go for Web to run on a Linux server machine that runs the Apache web server.
 
The instructions were written while deploying the project on an Ubuntu AWS system. For other Linux distributions you may have to make minor tweaks. For system types other than Linux (notably Windows) you will probably have to be a little bit more creative ☺.

## Prepare the system

You must install a number of packages on your system to be able to run the project:
* Obviously you need a web server. On Ubuntu/Debian this is the package `apache2`
* You also need MySQL. MariaDB might work but has not been tested. The package to install is `mysql-server`.
* Install PHP 7.1 or newer, e.g. the package `php7.1` or `php7.2`. If your system is too old and does not yet contain such a package, but is Debian based, then you can add Ondřej Surý's personal package repository as a custom APT package source to your system. Ondřej Surý is one of the current Debian maintainers for PHP. I found [these instructions](https://thishosting.rocks/install-php-on-ubuntu/) helpful for the task.
* Another important package is `php-mysql`. It contains the driver that PHP needs to access the database server.
* Last but not least, you need the packages `composer` (PHP composer) and `php-zip`. The latter is required so that PHP composer can decompress the zipped packages it downloads.

## Get the source code

Probably the simplest way how to get the project's source code onto your server machine is to clone the GitHub repository:
```
cd /usr/local/share
sudo git clone https://github.com/herzbube/littlego-web.git
```

## Database server setup

The next step is to create a new user in your MySQL database that has the privileges for creating a new database and reading/writing data to/from that database. Run the following SQL commands to create a user named `littlego-web` that has all privileges on the database `littlego-web`. You can choose a different user name and/or database name if you don't like the defaults.  

```
create user 'littlego-web'@'localhost' identified by 'secret';
grant all privileges on `littlego-web`.* to 'littlego-web'@'localhost';
```

Now you are ready to create the database. If you are accessing the database via TCP/IP and working with the default user and database names, the following command should do the trick. If in doubt, read the section [Creating the database](README.md#creating-the-database) in README.md. 

```
cd /usr/local/share/littlego-web/db
php createDatabase.php localhost 3306 littlego-web "secret" littlego-web
```

## Web server setup

The next step is to configure your web server. Basically what you will have to do is to make sure that the web server publishes the folder `src/htdocs`.

There are two ways how to achieve this:
* If you decide to make Little Go for Web accessible under its own subdomain (e.g. `https://lg4w.foo.com/`), then `src/htdocs` should be the virtual host's document root.
* If you decide to make Little Go for Web accessible as part of another website but under its own path (e.g. `https://www.foo.com/lg4w`), then `src/htdocs` should be aliased to that path.

Discussion of an actual configuration is beyond the scope of this document, but here's a small Apache config snippet that roughly shows what to do to make Little Go for Web accessible under an alias path.
```
Alias /littlego-web /usr/local/share/littlego-web/src/htdocs

<Directory /usr/local/share/littlego-web/src/htdocs/>
  Require all granted
  php_admin_flag engine on

  # The following mod_rewrite configuration is necessary so that the user
  # can click "reload" on any of the single-page application's valid routes
  RewriteEngine On

  # In Apache HTTP Server 2.4.16 and later, the RewriteBase directive may
  # be omitted when the request is mapped via Alias or mod_userdir.
  RewriteBase "/littlego-web/"

  # In the following rules we enumerate all paths that are valid routes
  # and map them back to the PHP file that is the single-page application.
  RewriteRule ^(register|login|gamerequests|gamesinprogress|finishedgames|highscores|logout)$ index.php
  RewriteRule ^board/[0-9]+$ index.php  
</Directory>
```

To make the rewrite configuration work make sure that you have enabled the Apache module `mod_rewrite`:

    sudo a2enmod rewrite


## Application configuration

Now create the configuration file. The fastest way is to copy the template file and then edit the copy in a text editor.
```
cd /usr/local/share/littlego-web/src/config
sudo cp config-template.php config.php
sudo vi config.php
```

The absolute minimum that you have to specify is
* The database user's password
* The WebSocket host and port
* The PHPMailer configuration

The `urlBasePath` option is also necessary if your web server makes Little Go for the Web accessible as part of another website but under its own path.

Because the configuration file contains passwords, you should make sure that the file is not world-readable:
```
sudo chown root:www-data /usr/local/share/littlego-web/src/config/config.php
sudo chmod 640 /usr/local/share/littlego-web/src/config/config.php
``` 

## Installing third party dependencies

You're almost done. One of the last things to do is to install the project's third party dependencies via PHP composer:
```
cd /usr/local/share/littlego-web
sudo composer install
```

## Running the WebSocket server

The project contains a simple script that will run the WebSocket server for you.
```
sudo ./script/startWebSocketServer.sh
```

If you want the server to run as a daemon you can send the job to the background, then log out. However, there is currently no safeguard that will restart the daemonized server if it crashes.
