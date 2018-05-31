<?php declare(strict_types = 1);

namespace LittleGoWeb
{
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    require_once(dirname(__FILE__) . "/constants.php");

    // The Mailer class is responsible for sending emails using the external
    // PHPMailer component.
    class Mailer
    {
        public function __construct(Config $config)
        {
            $this->config = $config;
        }

        // Sends an email to the specified email address. The email contains
        // an HTML-formatted message displaying the specified highscores
        // (an array of Highscore objects).
        //
        // Returns null on success.
        // Returns an error message string on failure.
        public function sendHighscoreEmail(
            string $emailAddress,
            string $displayName,
            array $highscores) : ?string
        {
            $emailBodies = $this->generateEmailBodies($highscores);
            $emailBodyHtml = $emailBodies[0];
            $emailBodyText = $emailBodies[1];

            return $this->sendHighscoreEmailToEmailAddress($emailAddress, $displayName, $emailBodyHtml, $emailBodyText);
        }

        private function generateEmailBodies(array $highscores) : array
        {
            $numberOfHighscores = count($highscores);
            $tablePrefixParagraphText = "The list of top $numberOfHighscores players:";

            $tableRowsHtml = "";
            $tableRowsText = "";
            foreach ($highscores as $highscore)
            {
                $displayName = $highscore->getDisplayName();
                $totalGamesWon = $highscore->getTotalGamesWon();
                $totalGamesLost = $highscore->getTotalGamesLost();
                $mostRecentWin = $highscore->getMostRecentWin();
                $gamesWonAsBlack = $highscore->getGamesWonAsBlack();
                $gamesWonAsWhite = $highscore->getGamesWonAsWhite();

                if ($mostRecentWin === HIGHSCORE_MOSTRECENTWIN_DEFAULT)
                    $formattedDateTimeString = "Player has not yet won any games";
                else
                    $formattedDateTimeString = date("d.m.Y", $mostRecentWin);

                $tableRowsHtml .= "<tr><td>$displayName</td><td>$totalGamesWon</td><td>$totalGamesLost</td><td>$formattedDateTimeString</td><td>$gamesWonAsBlack</td><td>$gamesWonAsWhite</td></tr>";
                $tableRowsText .= sprintf("%-24s | %11d | %11d | %-11s | %13d | %13d\n", $displayName, $totalGamesWon, $totalGamesLost, $formattedDateTimeString, $gamesWonAsBlack, $gamesWonAsWhite);
            }

            $titleText = "Little Go for Web highscores";

            $emailBodyHtml = <<<"ENDOFEMAILBODYHTML"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <style>
        table {
            border-collapse: collapse;
            background-color: lightblue;
        }
        th, td {
            border: solid black 1px;
            padding: 0.5em;
        }
    </style>
    <title>$titleText</title>
</head>
<body>
    <h1>$titleText</h1>
    <div>
        <p>$tablePrefixParagraphText</p>
        <table>
            <tbody><tr><th>Player name</th><th>Total games won</th><th>Total games lost</th><th>Most recent win</th><th>Games won playing black</th><th>Games won playing white</th></tr>
            $tableRowsHtml
            </tbody>
        </table>
    </div>
</body>
</html>
ENDOFEMAILBODYHTML;

            $emailBodyText = <<<"ENDOFEMAILBODYTEXT"
$titleText
===============================================================================


-------------------------+-------------+-------------+-------------+---------------+---------------
                         | Total games | Total games | Most recent | Games won     | Games won
Player name              | won         | lost        | win         | playing black | playing white
-------------------------+-------------+-------------+-------------+---------------+---------------
$tableRowsText
-------------------------+-------------+-------------+-------------+---------------+---------------
ENDOFEMAILBODYTEXT;

            return [$emailBodyHtml, $emailBodyText];
        }

        private function sendHighscoreEmailToEmailAddress(
            string $emailAddress,
            string $displayName,
            $emailBodyHtml,
            $emailBodyText) : ?string
        {
            // The following code copied & adapted from README.md of
            // PHPMailer GitHub project
            // https://github.com/PHPMailer/PHPMailer

            // Passing `true` enables exceptions
            $mail = new PHPMailer(true);
            try
            {
                // Server settings
                $mail->SMTPDebug = $this->config->phpMailerSMTPDebug;
                $mail->isSMTP();     // Set mailer to use SMTP
                $mail->Host = $this->config->phpMailerHost;
                $mail->SMTPAuth = $this->config->phpMailerSMTPAuth;
                $mail->Username = $this->config->phpMailerUsername;
                $mail->Password = $this->config->phpMailerPassword;
                $mail->SMTPSecure = $this->config->phpMailerSMTPSecure;
                $mail->Port = $this->config->phpMailerPort;

                // Addresses (from, reply-to, recipient)
                $mail->setFrom($this->config->phpMailerFromAddress, $this->config->phpMailerFromName);
                $mail->addAddress($emailAddress, $displayName);
                if ($this->config->phpMailerReplyToAddress !== PHPMAILER_REPLYTOADDRESS_DEFAULT)
                    $mail->addReplyTo($this->config->phpMailerReplyToAddress, $this->config->phpMailerReplyToName);

                // Content
                $mail->isHTML(true);
                $mail->Subject = $this->config->phpMailerSubject;
                $mail->Body = $emailBodyHtml;
                $mail->AltBody = $emailBodyText;

                // This sends the message synchronously! Hopefully the admin
                // has configured a local mail server which does all the
                // heavy lifting.
                $mail->send();

                return null;  // null = no error
            }
            catch (Exception $e)
            {
                $errorMessage = "Highscore update email message could not be sent to $emailAddress. Mailer Error: " . $mail->ErrorInfo;
                return $errorMessage;
            }
        }
    }
}
