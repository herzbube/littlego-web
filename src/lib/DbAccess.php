<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    require_once(dirname(__FILE__) . "/config_defaults.php");

    use \PDO;

    // The DbAccess class provides access to the application database.
    class DbAccess
    {
        private $config;
        private $pdo;
        private $sqlGenerator;

        // Constructs a new DbAccess object. A database connection is
        // established immediately in this constructor using the parameters
        // in the specified configuration object.
        //
        // Throws a PDOException if any error occurs.
        public function __construct(Config $config)
        {
            $this->config = $config;

            $dsn = $config->pdoDriverName . ":" . $config->pdoConnectionString;

            $options = null;
            $this->pdo = new PDO($dsn, $config->dbUsername, $config->dbPassword, $options);

            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $this->sqlGenerator = new SqlGenerator($config->dbName);
        }
    }
}
