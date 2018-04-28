<?php
declare(strict_types=1);

// --------------------------------------------------------------------------------
// Initialize program
// --------------------------------------------------------------------------------
const DATABASE_NAME_PLACEHOLDER = "littlego-web";

// --------------------------------------------------------------------------------
// Process command line arguments
// --------------------------------------------------------------------------------

$scriptName = basename($argv[0]);
$usageLine = <<<"ENDOFUSAGELINE"
Usage 1: php $scriptName hostname port username password dbname
Usage 2: php $scriptName /path/to/socket username password dbname
ENDOFUSAGELINE;

if ($argc < 5)
{
    echo "Insufficient number of arguments\n";
    echo "$usageLine\n";
    exit(1);
}
else if ($argc > 6)
{
    echo "Too many arguments\n";
    echo "$usageLine\n";
    exit(1);
}
else if ($argc == 5)
{
    $socketPath = $argv[1];
    $connectionString = "unix_socket=$socketPath";

    $username = $argv[2];
    $password = $argv[3];

    $databaseName = $argv[4];
}
else if ($argc == 6)
{
    $hostname = $argv[1];
    $port = $argv[2];
    $connectionString = "host=$hostname; port=$port";

    $username = $argv[3];
    $password = $argv[4];

    $databaseName = $argv[5];
}

// --------------------------------------------------------------------------------
// Create database connection
// --------------------------------------------------------------------------------

try
{
    echo "Connecting to database...\n";

    $pdoDriverName = "mysql";
    $dsn = $pdoDriverName . ":" . $connectionString;

    $options = null;
    $pdo = new PDO($dsn, $username, $password, $options);
}
catch (PDOException $exception)
{
    $errorMessage = $exception->getMessage();
    echo "Connection failed, aborting program\n";
    echo "Error message was: $errorMessage\n";
    exit(1);
}

// --------------------------------------------------------------------------------
// Read database creation script
// --------------------------------------------------------------------------------

echo "Reading database creation script...\n";

$databaseCreationScriptPath = dirname($argv[0]) . "/" . "createDatabase.sql";
$databaseCreationScript = file_get_contents($databaseCreationScriptPath);
if ($databaseCreationScript === FALSE)
{
    echo "Error reading database creation script: $databaseCreationScriptPath\n";
    exit(1);
}

$databaseCreationScript = str_replace(DATABASE_NAME_PLACEHOLDER, $databaseName, $databaseCreationScript);

// --------------------------------------------------------------------------------
// Run database creation script
// --------------------------------------------------------------------------------

try
{
    echo "Creating database...\n";

    // TODO: Executing the script does NOT throw an exception if the database
    // and the table already exist, even though CREATE TABLE runs without an
    // "IF NOT EXISTS" clause! No exception is thrown either if a deliberate
    // syntax error is added to the script! It's likely that this is by
    // design - at least that's what the following bug report suggests:
    //   https://bugs.php.net/bug.php?id=61613
    // To fix the problem we should execute every statement on its own, but
    // then we probably have to add manual transaction handling.

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $res = $pdo->exec($databaseCreationScript);


    echo "Database '" . $databaseName . "' created successfully\n";

    echo "Shutting down database connection...\n";
    $pdo = null;
}
catch (PDOException $exception)
{
    $errorMessage = $exception->getMessage();
    echo "Database creation script failed, aborting program\n";
    echo "Error message was: $errorMessage\n";
    exit(1);
}

exit(0);
