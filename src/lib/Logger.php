<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    require_once(dirname(__FILE__) . "/constants.php");

    // The Logger class is responsible for logging messages to the system's
    // logging service (syslog).
    class Logger
    {
        private $config = null;
        private $openLogOptions = LOG_PID | LOG_ODELAY;
        private $loggerIsReady = false;
        private $timestampFormat = "d.m.Y H:i:s";

        public function __construct(Config $config)
        {
            $this->config = $config;
            if (! $this->config->loggingEnabled)
                return;

            $openLogResult = openLog(
                $this->config->loggingIdentifier,
                $this->openLogOptions,
                $this->config->loggingFacility);

            if ($openLogResult === TRUE)
            {
                $this->loggerIsReady = true;
            }
            else
            {
                $this->loggerIsReady = false;
                $this->writeMessageToStderr(LOG_ERR, "Failed to open connection to syslog");
            }
        }

        public function __destruct()
        {
            if ($this->loggerIsReady)
            {
                $closeLogResult = closeLog();
                if ($closeLogResult !== TRUE)
                    $this->writeMessageToStderr(LOG_ERR, "Failed to close connection to syslog");
            }
        }

        public function logError(string $message) : void
        {
            $this->writeMessageToSyslog(LOG_ERR, $message);
        }

        public function logWarning(string $message) : void
        {
            $this->writeMessageToSyslog(LOG_WARNING, $message);
        }

        public function logInfo(string $message) : void
        {
            $this->writeMessageToSyslog(LOG_INFO, $message);
        }

        public function logDebug(string $message) : void
        {
            $this->writeMessageToSyslog(LOG_DEBUG, $message);
        }

        private function writeMessageToSyslog(int $priority, string $message)
        {
            if (! $this->loggerIsReady)
                return;

            // PHP counter-intuitively assigns the lowest numeric values to
            // those priority constants that represent the most important
            // messages :-(
            if ($priority > $this->config->logLevel)
                return;

            $syslogResult = syslog($priority, $message);
            if ($syslogResult !== TRUE)
                $this->writeMessageToStderr(LOG_ERR, "Failed to write message syslog: $message");

            if ($this->config->echoLoggingToStdout)
                $this->writeMessageToStdout($priority, $message);
        }

        private function writeMessageToStdout($priority, string $message) : void
        {
            $this->writeMessageToStream(STDOUT, $priority, $message);
        }

        private function writeMessageToStderr($priority, string $message) : void
        {
            $this->writeMessageToStream(STDERR, $priority, $message);
        }

        private function writeMessageToStream($handle, $priority, string $message) : void
        {
            $timestampString = date($this->timestampFormat);

            switch ($priority)
            {
                case LOG_ERR:
                    $priorityString = "ERROR ";
                    break;
                case LOG_WARNING:
                    $priorityString = "WARNING";
                    break;
                case LOG_INFO:
                    $priorityString = "INFO  ";
                    break;
                case LOG_DEBUG:
                    $priorityString = "DEBUG ";
                    break;
                default:
                    $priorityString = "???   ";
                    break;
            }

            fwrite($handle, "$timestampString  $priorityString  $message\n");
        }
    }
}
