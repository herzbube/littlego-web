# Anforderungsspezifikation für das Projekt "Little Go for the web"

## Einleitung

Das Projekt "Little Go for the web" wird auf GitHub entwickelt. Die Repository URL ist [https://github.com/herzbube/littlego-web](https://github.com/herzbube/littlego-web). Die aktuellste Version dieses Dokuments ist unter der folgenden URL zu finden: [https://github.com/herzbube/littlego-web/blob/master/doc/specs.md](https://github.com/herzbube/littlego-web/blob/master/doc/specs.md). 

Anmerkungen zum Stil dieses Dokuments:
* Jede Anforderung hat eine eindeutige ID, damit sie bei Diskussionen und der Implementation eindeutig referenziert werden kann.
* Die Anforderungen sind wo immer möglich in der Aktivform geschrieben, damit der Akteur immer sofort erkennbar ist.
* Um den Aufwand klein zu halten ist die Spezifikation (zumindest vorerst) in reiner Textform geschrieben. Es gibt zudem (noch) keine Wireframes oder ähnliche UI Design Vorlagen, da das konkrete UI Design meiner Ansicht nach erst später gemacht werden soll und sich das UI sowieso bis gegen Schluss des Projekts noch wesentlich verändern kann.
* Wenn eine Anforderung eine Interaktion des Benutzers mit dem System beschreibt, so geht sie meistens nicht besonders darauf ein, wie genau das fertig implementierte UI die Interaktion ermöglichen soll. Der Leser kann davon ausgehen, dass es in der Regel ein Button oder ein klickbarer Link sein wird. Spricht die Anforderung jedoch von einem Button, dann kann das später auch noch ändern - es geht in dieser Spezifikation vor allem um griffige Formulierungen.

Der Projektname ist inspiriert von der von mir entwickelten iOS Applikation "Little Go", welche ich schon seit mehreren Jahren in Apple's App Store kostenlos veröffentliche. Der Source Code zu Little Go ist frei verfügbar über das folgende GitHub Repository: [https://github.com/herzbube/littlego](https://github.com/herzbube/littlego).

Für die Umsetzung von "Little Go for the web" habe ich vor, einige Teile der "Business Logik" sowie vielleicht auch einige der Assets (Bilder) von der iOS-Lösung zu übernehmen. Da die iOS-Lösung in Objective-C und C++ implementiert ist, kann ich den Source Code nicht 1:1 übernehmen sondern werde eine Adaptierung für PHP und/oder JavaScript finden müssen.

## Benutzerkonten und Sessions

### Benutzerkonto

* ACC-001 : Der Benutzer hat ein Benutzerkonto.
* ACC-002 : Das Benutzerkonto ist durch eine eindeutige technische ID identifiziert. Keine zwei Konten dürfen die gleiche technische ID verwenden.
* ACC-003 : Das Benutzerkonto hat zusätzlich eine eindeutige Email-Adresse. Keine zwei Konten dürfen die gleiche Email-Adresse verwenden. Die Email-Adresse ist wichtig für den Registrierungs-Prozess und für allfällige spätere Kommunikation.
* ACC-004 : Das Benutzerkonto hat zusätzlich einen eindeutigen Anzeigenamen. Keine zwei Konten dürfen den gleichen Anzeigenamen verwenden. Grund: Anderen Benutzern gegenüber ist lediglich der Anzeigename sichtbar und Verwechslungen müssen ausgeschlossen werden. Der Anzeigename ist wichtig, damit Benutzer ihre Email-Adresse gegenüber anderen Benutzern nicht preisgeben müssen.
* ACC-005 : Das Benutzerkonto ist durch ein Passwort geschützt.

### Benutzerkonto registrieren

* ACC-020 : Der Benutzer eröffnet ein neues Benutzerkonto, indem er den aus 2 Schritten bestehenden Registrierprozess durchläuft.
* ACC-021 : Der Benutzer muss im Schritt 1 des Registrierprozesses eine eindeutige Email-Adresse, einen eindeutigen Anzeigenamen und ein Passwort angeben.
* ACC-022 : Der Benutzer kann kein Konto registrieren für eine Email-Adresse, die von einem bereits existierenden Konto verwendet wird. Das System zeigt eine Fehlermeldung an, fall er es trotzdem versucht.
* ACC-023 : Der Benutzer kann kein Konto registrieren für einen Anzeigenamen, der von einem bereits existierenden Konto verwendet wird. Das System zeigt eine Fehlermeldung an, fall er es trotzdem versucht.
* ACC-024 : Der Benutzer kann eine beliebige Email-Adresse verwenden, sofern diese ein gültiges Format hat. Das System zeigt eine Fehlermeldung an, falls der Benutzer ein ungültiges Format verwendet. Die maximale Länge der Email-Adresse ist nur durch die technische Limite des DBMS begrenzt.
* ACC-025 : Der Benutzer kann einen beliebigen Anzeigenamen verwenden, der mindestens 1 Zeichen lang ist. Die maximale Länge des Anzeigenamens ist nur durch die technische Limite des DBMS begrenzt.
* ACC-026 : Der Benutzer kann ein beliebiges Passwort verwenden, das mindestens 1 Zeichen lang ist. Die maximale Länge des Passworts ist nur durch die technische Limite des DBMS begrenzt.
* ACC-027 : Das System erstellt bei Abschluss von Schritt 1 des Registrierprozesses das Benutzerkonto und markiert es als "nicht verifiziert".
* ACC-028 : Das System vergibt automatisch die technische ID des Benutzerkontos.
* ACC-029 : Das System generiert für das Benutzerkonto ein eindeutiges, zufälliges Verifikations-Token.
* ACC-030 : Das Verifikations-Token ist 24 Stunden lang gültig.
* ACC-031 : Das System versendet eine Nachricht an die Email-Adresse des Benutzerkontos. Das Ziel ist, die Gültigkeit der Email-Adresse zu verifizieren.
* ACC-032 : Das System fügt einen klickbaren Link in die Email-Nachricht ein, mit einer Verifikations-URL, welche das Verifikations-Token enthält. Die Email-Nachricht enthält die Verifikations-URL auch in einer nicht-klickbaren Form, die der Benutzer von Hand in die Adresszeile des Browsers kopieren kann.
* ACC-033 : Der Benutzer navigiert im Schritt 2 des Registrierprozesses zur Verifikations-URL. Das System identifiziert das Benutzerkonto anhand des Verifikations-Token in der URL und markiert das Konto als "verifziert".
* ACC-034 : Das System löscht das Benutzerkonto, falls der Benutzer das Konto bis zum Ablauf der Gültigkeit des Verifikations-Tokens nicht verifiziert hat.
* ACC-035 : Das System verwendet in Schritt 1 des Registrierprozesses für die Überprüfung der Eindeutigkeit von Email-Adresse und Anzeigename alle verifizierten Benutzerkonten, sowie alle noch nicht verifizierten Benutzerkonten, bei denen das Verifikations-Token noch gültig ist.

Optionale weitere Anforderungen:
* ACC-036 : Das System begrenzt den Registrierprozess auf 1 Versuch pro Minute pro Client IP-Adresse.
* ACC-037 : Das System generiert drei zufällige Worte, die es dem Benutzer bei Abschluss von Schritt 1 des Registrierprozesses anzeigt und die auch in der Verifikations-Email enthalten sind. Ziel: Dem Benutzer die Sicherheit geben, dass die Verifikations-Email echt ist.

### Anmelden

* ACC-050 : Der Benutzer muss sich anmelden, damit er die Webseite benutzen kann.
* ACC-051 : Der Benutzer meldet sich beim System mit der Eingabe einer Benutzerkennung und eines Passworts an.
* ACC-052 : Der Benutzer kann für die Benutzerkennung nach Belieben die Email-Adresse oder den Anzeigenamen verwenden.
* ACC-053 : Der Benutzer gibt beim Anmelden zusätzlich an, ob er auch nach Schliessen des Browser Tabs bzw. Fensters angemeldet bleiben will.
* ACC-054 : Das System sucht zuerst in den Email-Adressen, danach in den Anzeigenamen aller Konti nach der Benutzerkennung.
* ACC-055 : Das System zeigt eine Fehlermeldung an, falls es die Benutzerkennung nicht findet.
* ACC-056 : Das System zeigt eine Fehlermeldung an, falls es ein Benutzerkonto findet aber das Passwort nicht übereinstimmt.
* ACC-057 : Das System zeigt eine Fehlermeldung an, falls es ein Benutzerkonto mit übereinstimmendem Passwort findet, aber das Benutzerkonto ist noch nicht verifiziert.
* ACC-058 : Das System meldet den Benutzer an, falls es für die Benutzerkennung ein verifiziertes Benutzerkonto mit übereinstimmendem Passwort findet.
* ACC-059 : Das System generiert ein Session Token, das 30 Tage gültig ist.
* ACC-060 : Das System speichert das Session Token auf dem Client, falls der Benutzer beim Anmelden angegeben hat, dass er angemeldet bleiben will.
* ACC-061 : Das System übermittelt bei allen weiteren Requests das Session Token.
* ACC-062 : Das System überprüft bei jedem Request das Session Token, ob es (noch) gültig ist.
* ACC-063 : Das System zeigt eine Fehlermeldung an, falls das Session Token nicht (mehr) gültig ist. 
* ACC-064 : Das System akzeptiert und verarbeitet den Request, falls das Session Token (noch) gültig ist.
* ACC-065 : Das System verlängert die Gültigkeit der Session bei jedem Request, den es akzeptiert und verarbeitet, auf n+30 Tage, wobei n = Datum des Requests.

### Berechtigungen

* ACC-070 : Das System verwendet keine Berechtigungen. Alle Benutzer haben die gleichen Rechte.

### Abmelden

* ACC-080 : Der Benutzer kann sich abmelden, wenn er angemeldet ist.
* ACC-081 : Der Benutzer meldet sich ab, indem er die entsprechende Programmfunktion wählt.
* ACC-082 : Das System löscht das Session Token auf dem Client.
* ACC-083 : Das System löscht das Session Token auf dem Server.

## Partien

### Einleitung

* PAR-001 : Der Benutzer hat 0-n Spielanfragen.
* PAR-002 : Der Benutzer hat 0-n laufende Partien.
* PAR-003 : Der Benutzer hat 0-n beendete Partien.
* PAR-004 : Der Benutzer kann sich eine Liste seiner Spielanfragen, laufenden und beendeten Partien ansehen.
* PAR-005 : Das System zeigt dem Benutzer nach dem Anmelden automatisch die Liste seiner laufenden Partien an.
* PAR-006 : Der Benutzer kann aus einer der Listen einen Eintrag auswählen.
* PAR-007 : Das System zeigt die Details zu dem Listeneintrag an.
* PAR-008 : Was angezeigt wird hängt von der Art des Listeneintrags ab. Für Details siehe die Abschnitte "Liste der Spielanfragen", "Liste der laufenden Partien" und "Liste der beendeten Partien".

### Spielstart

* PAR-020 : Der Benutzer kann eine neue Spielanfrage starten.
* PAR-021 : Das System limitiert die Anzahl Partien pro Benutzer.
* PAR-022 : Das System zeigt einen Fehler an, wenn der Benutzer eine Spielanfrage starten will aber die Limite erreicht ist.
* PAR-023 : Der Benutzer wählt die Eigenschaften des Spiels, für das er eine Spielanfrage startet.
* PAR-024 : Der Benutzer wählt die Brettgrösse. Zur Verfügung stehen die Optionen: Egal, 7x7, 9x9, 11x11, 13x13, 15x15, 17x17, 19x19.
* PAR-025 : Der Benutzer wählt die Steinfarbe. Zur Verfügung stehen die Optionen: Egal, Schwarz, Weiss, Zufällig.
* PAR-026 : Der Benutzer wählt das Handicap. Zur Verfügung stehen die Optionen: Egal, Kein Handicap, 2 Steine, 3 Steine, [...], 9 Steine.
* PAR-027 : Der Benutzer wählt das Komi. Zur Verfügung stehen die Optionen: Egal, Kein Komi, 0.5 Komi, 5 Komi, 5.5 Komi, 6 Komi, [...], 8 Komi.
* PAR-028 : Der Benutzer wählt die Ko-Regel. Zur Verfügung stehen die Optionen: Egal, Einfaches Ko, Positional Superko, Situational Superko.
* PAR-029 : Der Benutzer wählt das Wertungs-System. Zur Verfügung stehen die Optionen: Egal, Area Scoring, Territory Scoring.
* PAR-030 : Das System erstellt eine neue Spielanfrage mit den gewählten Eigenschaften.
* PAR-031 : Das System übergibt die neue Spielanfrage an das Matchmaking Subsystem.
* PAR-032 : Der Benutzer muss warten, bis das Matchmaking Subsystem eine zu den gewählten Spieleigenschaften passende Spielanfrage eines zweiten Benutzers gefunden hat.
* PAR-033 : Das System zeigt **beiden** Benutzern Informationen über den jeweils anderen Benutzer an, ebenso wie die konkreten Spieleigenschaften.
* PAR-034 : Beide Benutzer wählen, ob sie die Partie beginnen wollen oder nicht.
* PAR-035 : Lehnt einer der Benutzer oder beide Benutzer ab, so müssen beide weiter warten, bis das Matchmaking Subsystem die nächste passende Spielanfrage gefunden hat. Der Prozess beginnt wieder bei PAR-032.
* PAR-036 : Stimmen beide Benutzer zu, so beginnt das Spiel.
* PAR-037 : Der Benutzer kann die Spielanfrage verwerfen, während er auf ein Angebot des Matchmaking Subsystems wartet.
* PAR-038 : Das System informiert das Matchmaking Subsystem, dass die Spielanfrage verworfen wurde.
* PAR-039 : Das System zeigt dem Benutzer nach dem Verwerfen der Spielanfrage die Liste der laufenden Partien an.
* PAR-040 : Schliesst der Benutzer das Browser Fenster oder Browser Tab, während er auf ein Angebot des Matchmaking Subsystems wartet, so bleibt die Spielanfrage erhalten.

### Matchmaking Subsystem

* PAR-050 : Das System verwaltet Spielanfragen in einer Matchmaking Queue.
* PAR-051 : Das System erstellt Paarungen aus je 2 Spielanfragen in der Matchmaking Queue, sofern die Eigenschaften der Spielanfragen, welche die Benutzer beim Erstellen der Spielanfrage gewählt haben, zueinander passen.
* PAR-052 : Der Wert "Egal" passt zu jedem anderen Wert.
* PAR-053 : Das System verwendet bei denjenigen Spiel-Eigenschaften, für die nur eine der gepaarten Spielanfragen den Wert "Egal" hat, den konkreten Wert der jeweils anderen Spielanfrage.
* PAR-054 : Das System ermittelt bei denjenigen Spiel-Eigenschaften, für die **beide** gepaarten Spielanfragen den Wert "Egal" haben, automatisch einen konkreten Wert aus der folgenden Liste von Default-Werten:
  * Brettgrösse = 19x19
  * Steinfarbe = Zufällig
  * Handicap = Keines
  * Komi = 7.5 bei Area Scoring ohne Handicap, 6.5 bei Territory Scoring ohne Handicap, 0.5 bei Handicap
  * Ko-Regel = Einfach
  * Wertungs-System = Area Scoring
* PAR-055 : Das System versucht immer dann, eine Paarung zu erstellen, wenn eine neue Spielanfrage in die Matchmaking Queue gelangt.
* PAR-056 : Das System legt eine neue Spielanfrage ans Ende der Matchmaking Queue.
* PAR-057 : Das System durchsucht die Matchmaking Queue nach einer passenden zweiten Spielanfrage von vorne. Die schon am längsten in der Queue befindliche Spielanfrage kommt somit zuerst zum Zug.
* PAR-058 : Findet das System keine passende zweite Spielanfrage, so informiert es den Benutzer, der die neue Spiel darüber, dass nach anderen passenden Spielanfragen gesucht wird. Die Spielanfrage verbleibt vorerst ohne Paarung in der Matchmaking Queue.
* PAR-059 : Findet das System eine passende zweite Spielanfrage, so überprüft das System, ob der zweite Benutzer über das Netzwerk erreichbar ist (z.B. für den Fall, dass der schon länger wartende zweite Benutzer das Browser Tab geschlossen hat, o.ä.).
* PAR-060 : Ist der zweite Benutzer nicht erreichbar, so sucht das System nach anderen passenden Spielanfragen.
* PAR-061 : Ist der zweite Benutzer erreichbar, so nimmt das System die Paarung vor.
* PAR-062 : Das System kontaktiert **beide** Benutzer und bietet ihnen an, das Spiel zu beginnen. Siehe PAR-033.
* PAR-063 : Kommt das Spiel nicht zustande, so löst das System die Paarung wieder auf und sucht nach anderen passenden Spielanfragen.
* PAR-064 : Kommt das Spiel zustande, so erstellt das System eine neue laufende Partie aus den Informationen der beiden Spielanfragen und löscht die Spielanfragen anschliessend aus der Matchmaking Queue.
* PAR-065 : Das System sendet wiederholt Erinnerungen an einen Benutzer, der nicht innerhalb einer bestimmten Zeit antwortet.
* PAR-066 : Ist der Benutzer nicht erreichbar, so informiert das System den anderen Benutzer, löst die Paarung wieder auf und sucht nach anderen passenden Spielanfragen.
* PAR-067 : Spielanfragen haben ein Timeout.
* PAR-068 : Findet das System beim Abarbeiten der Matchmaking Queue eine Spielanfrage mit abgelaufenem Timeout, dann löscht es die Spielanfrage.
* PAR-069 : Das Matchmaking-System führt eine Paarung, die von einem oder beiden Benutzern abgelehnt worden ist, kein zweites Mal durch.

### Liste der Spielanfragen

* PAR-080 : Die Liste der Spielanfragen existiert für den Fall, dass der Benutzer das Browser Fenster oder Browser Tab mit einer aktiven Spielanfrage geschlossen hat. Es ermöglicht dem Benutzer, die Spielanfrage wiederaufzunehmen.
* PAR-081 : Der Benutzer kann in der Liste der Spielanfragen eine Spielanfrage auswählen.
* PAR-082 : Das System zeigt die vom Benutzer gewählten Eigenschaften der Partie an. Für Details siehe Abschnitt "Spielstart".
* PAR-083 : Der Benutzer kann die Spielanfrage verwerfen. Für Details siehe Abschnitt "Spielstart".
* PAR-084 : Der Benutzer kann die Spielanfrage wieder aufnehmen. Das System setzt das Timeout der Spielanfrage zurück (siehe PAR-067) und weist das Matchmaking Subsystem an, eine weitere Paarung zu versuchen. Siehe PAR-032 für die nächsten Schritte.

### Liste der laufenden Partien

* PAR-090 : Die Liste der laufenden Partien existiert für den Fall, dass der Benutzer das Browser Fenster oder Browser Tab mit einem aktiven Spiel geschlossen hat. Es ermöglicht dem Benutzer, das Spiel wiederaufzunehmen.
* PAR-091 : Der Benutzer kann in der Liste der laufenden Partien eine laufende Partie auswählen.
* PAR-092 : Das System zeigt die Eigenschaften der Partie an. Für Details siehe Abschnitt "Spielstart".
* PAR-093 : Der Benutzer kann das Spiel abbrechen. Dies ist gleichbedeutend mit "Spiel aufgeben". Für Details siehe Abschnitt "Spielende".
* PAR-094 : Der Benutzer kann das Spiel wieder aufnehmen. Das System zeigt die normale während dem Spielen übliche Benutzeroberfläche an. Ist der Benutzer am Zug kann er sofort weiterspielen. Für Details siehe Abschnitt "Spielen".

### Liste der beendeten Partien

* PAR-100 : Der Benutzer kann in der Liste der beendeten Partien eine Partie auswählen.
* PAR-101 : Das System zeigt das Schluss-Resultat der Partie an. Für Details siehe den Abschnitt "Wertung".
* PAR-102 : Der Benutzer kann sich das Schluss-Resultat der Partie per Email zuschicken lassen.

Optionale Anforderungen:
* PAR-102 : Der Benutzer kann das Schluss-Resultat im Smart Game Format (Dateiendung .sgf) herunterladen oder per Email zuschicken lassen. Die Spezfikation des Formats findet man unter folgender URL: [https://www.red-bean.com/sgf/](https://www.red-bean.com/sgf/).

## Spielen

### Spielbrett

Das System zeichnet das Spielbrett wie folgt:
* PLAY-001 : Das Spielbrett zeigt die Anzeigenamen der beiden Benutzer an.
* PLAY-002 : Das Spielbrett hat einen Hintergrund mit Holzmuster
* PLAY-003 : Das Spielbrett zeigt Gitterlinien entsprechend der Brettgrösse an
* PLAY-004 : Das Spielbrett zeigt an den durch die Brettgrösse definierten Kreuzungspunkten dickere Markierungen an.
* PLAY-005 : Das Spielbrett zeigt die Spielsteine an, die dem momentanen Spielstand entsprechen (d.h. in früheren Spielzügen geschlagene Spielsteine werden nicht angezeigt).
* PLAY-006 : Das Spielbrett markiert den zuletzt gespielten Spielstein mit einem Quadrat-Symbol.
* PLAY-007 : Das Spielbrett zeigt an der oberen und linken Kante Koordinaten im europäischen System an. Obere Kante = von links nach rechts A-T (ohne I), linke Kante = von unten nach oben 1-19. Der Ursprung des Koordinaten-Systems ist immer unten links.
* PLAY-008 : Das Spielbrett zeigt im Wertungsmodus das Territorium an, d.h. ob ein Punkt im Besitz ist von Schwarz oder Weiss, oder ob der Punkt neutrales oder gar unklares Territorium ist (z.B. wegen fehlerhaft markierter toter Steine).
* PLAY-009 : Das Spielbrett zeigt im Wertungsmodus die als tot markierten Steine an.
* PLAY-010 : Das Spielbrett zeigt im Wertungsmodus die als "in seki" markierten Steine an.

Optionale Anforderungen:
* PLAY-011 : Der Benutzer kann das Spielbrett vergrössern und verkleinern.
* PLAY-012 : Der Benutzer kann die Nummern der Spielzüge anzeigen lassen.

### Vergangene Spielzüge

* PLAY-030 : Das System zeigt neben dem Spielbrett eine Liste aller vergangenen Spielzüge in tabellarischer Form an
* PLAY-031 : Das System zeigt für jeden Spielzug die Zugnummer an. Der erste Spielzug hat die Nummer 1.
* PLAY-032 : Das System zeigt für jeden Spielzug an, ob Schwarz oder Weiss den Zug gemacht hat.
* PLAY-033 : Das System zeigt für Spielzüge vom Typ "Passen" lediglich den Zug-Typ "Passen" an.
* PLAY-034 : Das System zeigt für Spielzüge vom Typ "Spielen" an, auf welche Koordinate der Stein gelegt wurde, sowie - falls vorhanden - die Anzahl Gefangene, die bei dem Spielzug gemacht worden sind.
* PLAY-035 : Das System zeigt Handicap-Steine nicht als Spielzug an.

Optionale Anforderungen:
* PLAY-036 : Der Benutzer kann einen Spielzug aus der Vergangenheit auswählen. Das System zeigt den Zustand des Bretts zum damaligen Zeitpunkt an.

## Nächster Spielzug

* PLAY-040 : Schwarz und Weiss ziehen alternierend.
* PLAY-041 : Bei einem Spiel ohne Handicap beginnt Schwarz, bei einem Spiel mit Handicap beginnt Weiss.
* PLAY-042 : Das System zeigt an, ob Schwarz oder Weiss an der Reihe ist.
* PLAY-043 : Ist der Benutzer nicht an der Reihe, so kann er nicht mit dem Spielbrett interagieren. Der Benutzer muss warten, bis er an der Reihe ist.
* PLAY-044 : Ist der Benutzer an der Reihe, so kann er entweder passen oder spielen.
* PLAY-045 : Der Benutzer klickt auf den Button "Passen", um zu passen.
* PLAY-046 : Der Benutzer klickt auf dem Spielbrett auf einen Schnittpunkt, um zu spielen.
* PLAY-047 : Auf Systemen, die eine Maus haben, zeigt das System auf dem Spielbrett eine Markierung an, die dem Mauszeiger folgt. Ziel: Der Benutzer weiss, auf welchen Schnittpunkt er spielen wird, wenn er klickt.
* PLAY-048 : Das System aktualisiert das Spielbrett, nachdem der Benutzer den Zug abgegeben hat.

Optionale Anforderungen:
* PLAY-049 : Der Benutzer muss den Spielzug mit einem Klick auf den Button "Abgeben" bestätigen, bevor er an den Server gesendet wird. Der Benutzer kann den Spielzug mit einem Klick auf den Button "Zurücknehmen" rückgängig machen, solange er noch nicht gesendet wurde. Diese Anforderung ist insbesondere für touch-basierte Systeme ohne Maus nützlich, da man dort mit einem Fingertippen unter Umständen den Stein auf einen falschen Punkt setzt. 

### Spielende

* PLAY-060 : Das System beendet sofort das Spiel und beginnt die Wertungsphase, wenn der Benutzer passt und dies der zweite Spielzug vom Typ "Passen" ist. Für Details siehe den Abschnitt "Wertung".
* PLAY-061 : Werden sich die Spieler bei der Wertung einig, dann endet auch die Partie.
* PLAY-062 : Werden sich die Spieler bei der Wertung nicht einig wird das Spiel wieder aufgenommen. Es beginnt der Spieler, der alternierend nach dem zweiten Spielzug vom Typ "Passen" an die Reihe kommt.
* PLAY-063 : Das System beendet sofort das Spiel und die Partie ohne Wertungsphase, wenn der Benutzer auf den Button "Aufgeben" klickt. Indem der Benutzer aufgibt deklariert er das Spiel und die Partie als verloren und verzichtet auf eine Wertung.
* PLAY-064 : Der Benutzer kann aufgeben, auch wenn er nicht an der Reihe ist.
* PLAY-065 : Der Benutzer kann ein aufgegebenes Spiel nicht wieder aufnehmen.
* PLAY-066 : Das System fragt beim Benutzer zur Sicherheit nach, ob er wirklich aufgeben will.
* PLAY-067 : Das System aktualisiert die High Scores beider Benutzer entweder mit dem Resultat der Wertung oder, bei Aufgabe eines Benutzers, mit dem Gewinn/Verlust der Partie. Für Details siehe "High Score".

Anmerkungen:
* Dass zweimal hintereinander Passen das Ende des Spiels bedeutet ist eine Vereinfachung. Ebenfalls eine Vereinfachung ist, dass nach dem Wiederaufnehmen des Spiels der alternierende Spieler an die Reihe kommt. In der Realität kann das Spielende bzw. das Wiederaufnehmen des Spiels je nach Regelwerk unterschiedlich ablaufen werden.

### Weitere Interaktionen

* PLAY-080 : Der Benutzer kann auf den Button "Zwischenwertung" klicken, um für sich persönlich eine Zwischenwertung durchzuführen, ohne dass der Spielstand dadurch beeinflusst wird. Für Details siehe den Abschnitt "Zwischenwertung".
* PLAY-081 : Der Benutzer kann eine Zwischenwertung durchführen, auch wenn er nicht an der Reihe ist. Dies ist die einzige Ausnahme zu PLAY-043.

## Wertung

### Einleitung

Die Wertung kann nicht automatisch vom System durchgeführt werden, da in vielen Fällen nur einem Menschen intuitiv klar ist, ob eine Steingruppe lebt oder tot ist. Selbst zwischen Menschen gibt es unterschiedliche Interpretationen, weshalb es das System der Wertungsvorschläge braucht.

### Wertung am Spielende

* SCORE-001 : Gibt der Benutzer auf so verliert er das Spiel automatisch und es gibt keine Wertung.
* SCORE-002 : Passt der Benutzer und dies ist der zweite Passen-Zug in Serie, so beendet das System das Spiel und beginnt die Wertungsphase.
* SCORE-003 : Die Wertungsphase besteht aus 1-n Wertungsvorschlägen.
* SCORE-004 : Der Benutzer, der den zweiten Passen-Zug gemacht und damit das Spiel beendet hat, macht den ersten Wertungsvorschlag. Für Details zur Interaktion siehe den Abschnitt "Die Wertung".
* SCORE-005 : Jeder Klick des Benutzers beim Zusammenstellen eines Wertungsvorschlags wird live an den anderen Benutzer übertragen, so dass der andere Benutzer ein laufendes Feedback hat.
* SCORE-006 : Der andere Benutzer hat keine Möglichkeit zur Interaktion, solange der erste Benutzer seinen Wertungsvorschlag zusammenstellt.
* SCORE-007 : Der Benutzer klickt auf den Button "Vorschlag für die Wertung abgeben" wenn er mit seinem Vorschlag zufrieden ist.
* SCORE-008 : Der andere Benutzer klickt auf den Button "Vorschlag für die Wertung annehmen", wenn er mit dem Wertungsvorschlag einverstanden ist. Der Wertungsvorschlag wird zum definitiven Resultat und die Partie endet.
* SCORE-009 : Der andere Benutzer klickt auf den Button "Vorschlag für die Wertung ändern", wenn er mit dem Wertungsvorschlag nicht einverstanden ist. Der Benutzer erhält jetzt die Gelegenheit, einen eigenen Wertungsvorschlag basierend auf dem Vorschlag des ersten Benutzers zusammenzustellen. Die Interaktion läuft dabei genau gleich ab wie beim ersten Benutzer.
* SCORE-010 : Der andere Benutzer klickt auf den Button "Situation ausspielen", wenn er mit dem Wertungsvorschlag nicht einverstanden ist und die Situation ausspielen will. Das Spiel wird wie im Abschnitt "Spielende" beschrieben wieder aufgenommen.

Optionale Anforderungen:
* SCORE-011 : Der Benutzer kann einen erklärenden Kommentar verfassen und zusammen mit dem Wertungsvorschlag abgeben.
* SCORE-012 : Der Benutzer kann festlegen, dass das Zusammenstellen des Wertungsvorschlag nicht live übertragen werden soll.

### Zwischenwertung

* SCORE-020 : Der Benutzer kann mitten im Spiel eine Zwischenwertung durchführen, ohne dass dies einen Einfluss auf den Spielstand hat.
* SCORE-021 : Der Benutzer hat während der Zwischenwertung die gleichen Möglichkeiten zur Interaktion, wie wenn er einen Wertungsvorschlag am Ende des Spiels zusammenstellen würde.
* SCORE-022 : Der Benutzer klickt auf den Button "Zurück zum Spiel", um den Zwischenwertungs-Modus zu verlassen und weiterzuspielen.
* SCORE-023 : Das System verwirft alle Eingaben der Zwischenwertung, wenn der Benutzer den Zwischenwertungs-Modus verlässt.

### Die Wertung

* SCORE-030 : Der Benutzer kann während dem Wertungsmodus Steine markieren.
* SCORE-031 : Ein Stein ist entweder als lebendig, tot oder "in seki" markiert.
* SCORE-032 : Zu Beginn des Auswertungsmodus sind alle Steine als lebendig markiert.
* SCORE-033 : Der Benutzer kann zwischen dem Markierungsmodus "tote Steine markieren" und "Steine in seki markieren" wählen.
* SCORE-034 : Zu Beginn des Auswertungsmodus ist der Markierungsmodus "tote Steine markieren" aktiv.
* SCORE-035 : Im Markierungsmodus "tote Steine markieren" markiert der Benutzer einen Stein durch einen Klick als tot oder lebendig. Wiederholtes Klicken schaltet zwischen den beiden Markierungen hin und her. Ist der Stein als "in seki" markiert, so markiert ein Klick ihn als tot.
* SCORE-036 : Im Markierungsmodus "Steine in seki markieren" markiert der Benutzer einen Stein durch einen Klick als "in seki" oder lebendig. Wiederholtes Klicken schaltet zwischen den beiden Markierungen hin und her. Ist der Stein als tot markiert, so markiert ein Klick ihn als "in seki".
* SCORE-037 : Das System berechnet nach jeder Markierung die Wertung neu.
* SCORE-038 : Das System aktualisiert nach jeder Markierung die Anzeige, so dass ersichtlich ist, welche Markierung ein Stein zur Zeit hat.
* SCORE-039 : Das System aktualisiert nach jeder Markierung die Anzeige, so dass ersichtlich ist, welche Punkte auf dem Spielfeld zu welchem Territorium gehören. Die Territoriums-Berechnung erfolgt nach den universellen Regeln von Go.
* SCORE-040 : Die Berechnung der Wertung erfolgt nach dem zu Beginn des Spiels gewählten Wertungs-System (entweder Area Scoring oder Territory Scoring).

### High Score

* SCORE-050 : Das System führt pro Benutzer und für das gesamte System eine Spielstatistik sowie verschiedene High Scores.
* SCORE-051 : Das System führt die Spielstatistik nach verschiedenen Spiel-Kategorien, sowie über alle Partien insgesamt.
* SCORE-052 : Das System zählt in der Spielstatistik, wieviele Partien in jeder Spiel-Kategorie gespielt wurden.
* SCORE-053 : Das System führt die High Scores nach den gleichen Kategorien wie die Spielstatistik
* SCORE-054 : Das System zeichnet pro Spiel-Kategorie diejenigen Partien mit den 5 höchsten Wertungen auf. Die Aufzeichnung beinhaltet die Eigenschaften der Partie, das Datum, an dem die Partie beendet wurde, sowie die Wertung.
* SCORE-055 : Das System kategorisiert Spiele wie folgt: Pro Wertungs-System, pro Brettgrösse, pro Steinfarbe, mit/ohne Handicap, mit/ohne Komi.

### Informationen an den Benutzer

TODO: Beschreiben, wie ein Benutzer informiert wird. Z.B. sollte es eine Nachrichten-Queue geben, in die das System Benachrichtigungen stellen kann und die der Benutzer ansehen kann. Alte Nachrichten werden u.U. automatisch gelöscht. Der Benutzer kann Nachrichten selbst löschen. Nachrichten können gelesen/ungelesen sein. Gibt es Neuigkeiten vom System, die nicht direkt im Zusammenhang mit der momenanten Benutzer-Interaktion stehen, dann wird im UI an der passenden Stelle ein "!" Badge angezeigt.


## Client/Server Kommunikation

* COMM-001 : Der Client beschafft sich den initialen JavaScript Code über einen HTTP Request.
* COMM-002 : Der Server liefert den initialen JavaScript Code mit dem Wissen aus, welcher Web Socket für die weitere Kommunikation mit dem Server genutzt werden kann.
* COMM-003 : Der Client kommuniziert ab sofort mit dem Server über den Web Socket.
* COMM-004 : Die Kommunikation fängt wieder bei COMM-001 an, wenn der Benutzer den Browser-Inhalt neu lädt (z.B. via Reload Button).
* COMM-005 : Der Benutzer kann mehrere Browser-Fenster oder -Tabs offen haben.
* COMM-006 : Jedes Browser-Fenster oder -Tab hat mit Ausnahme der Login-Session seinen eigenen Zustand und verfügt über einen eigenen Kommunikationskanal mit dem Server. Ob dazu ein separater Web Socket pro Fenster/Tab verwendet werden muss oder ob es eine andere Lösung gibt muss noch recherchiert werden.
* COMM-007 : Alle Browser-Fenster oder -Tabs teilen sich die gleiche Login-Session.
* COMM-008 : Meldet sich der Benutzer in einem Browser-Fenster oder -Tab ab, dann schlagen alle weiteren Kommunikationsversuche in anderen Browser-Fenstern oder -Tabs fehl.

## Client

* CLIENT-001 : Der Client zeichnet das Spielbrett mit Hilfe entweder des Canvas API oder von SVG. Welche der beiden Technologien zum Einsatz kommt muss noch evaluiert werden.
* CLIENT-002 : Der Client beherrscht die Go Spielregeln, damit die Benutzer-Interaktion beim Spielen und während einer Wertung flüssig bleibt und nicht eine dauernde Kommunikation zwischen Server und Client erforderlich ist.
* CLIENT-003 : Der Client nutzt Web Storage für die Datenspeicherung. Mögliche Anwendungsbeispiele: Speichern von Spieldaten, falls die Verbindung mit dem Server abbricht; Caching, um die Kommunikation mit dem Server auf ein Minimum zu beschränken.

## Server und Datenbank

* SERVER-001 : Der Server persistiert die folgenden Daten in einem DBMS:
  * Benutzerkonten
  * Spielanfragen
  * Laufende Spiele
  * Beendete Spiele
  * Statistiken und High Scores pro Benutzer
  * Globale High Scores
* SERVER-002 : Die Implementation des Servers verwendet einen Mechanismus, welcher die Business Logik des Servers unabhängig vom konkreten DBMS macht. Das kann etwas so einfaches wie das Verwenden von generischen SQL Queries sein.
* SERVER-003 : Der Server legt das Passwort salted and hashed in der Datenbank ab.
* SERVER-004 : Der Server beherrscht die Go Spielregeln, damit er die durch den Client abgegebenen Spielzüge und Wertungen auf Gültigkeit prüfen kann.
* SERVER-005 : Der Server implementiert das Matchmaking Subsystem.
* SERVER-006 : Der Server unterstützt mindestens die folgenden Plattformen: macOS, Linux, Windows.

## Konfiguration

* CONFIG-001 : Der Server kann mit einer Konfigurationsdatei konfiguriert werden.
* CONFIG-002 : Die Konfigurationsdatei enthält die Zugangsdaten zum DBMS.
* CONFIG-003 : Die Konfigurationsdatei enthält die Zugangsdaten für den MTA, den der Server für das Verschicken von beendeten Partien via Email benutzt.

## Tests

* TEST-001 : Alle Klassen der Server-Implementation sind mit Unit Tests minimal aber ausreichend getestet.

Optionale Anforderungen:
* TEST-002 : Alle Klassen der Client-Implementation sind mit Unit Tests minimal aber ausreichend getestet.

## Release und Deployment

* DEPLOY-001 : Ein Release umfasst die folgenden Artefakte: .tar.gz und .zip Archiv.
* DEPLOY-002 : Es existiert ein Dokument, das den Konfigurations- und Deployment-Prozess beschreibt.

Optionale Anforderungen:
* DEPLOY-003 : Ein Release umfasst als zusätzliches Artefakt ein Debian Package.
* DEPLOY-004 : Das Debian Package wird in einem Debian Package Repository veröffentlicht.

# Offene Punkte

* Handicap und Komi sollten in einer realistischen Umgebung anhand des Vergleichs der Spielstärke der beiden Spieler ermittelt werden, entweder automatisch vom System und/oder interaktiv durch die Spieler beim Spielstart. Aus Gründen der Komplexität habe ich auf die Spezifikation eines solchen Systems verzichtet und messe den Spiel-Eigenschaften Handicap und Komi keine besondere Bedeutung zu.
* Das Matchmaking System ist nicht bis ins letzte Detail durchdacht, bei der Umsetzung können sich noch Änderungen ergeben.
* Die Möglichkeit, dass der Benutzer eine Paarung ablehnen kann macht das Matchmaking sehr kompliziert. Folgende Varianten sind denkbar:
  * Der Benutzer kann die Paarung nicht ablehnen. Dafür kann der Benutzer andere Benutzer auf eine "Ignore List" setzen.
  * Es gibt kein automatisches Matchmaking. Statt einfach ein neues Spiel zu beginnen kann der Benutzer die offenen Spielanfragen durchsehen und eine davon auswählen. Der Benutzer führt somit eine manuelle Paarung durch. 
* Zur Zeit ist das System darauf ausgelegt, dass der Benutzer bei Spielanfragen und laufenden Spielen nicht anderweitig mit dem System interagieren kann. Eventuell wäre es benutzerfreundlicher, dem Benutzer zu erlauben, andere Dinge zu tun während er warten muss, und ihn bei hereinkommender Kommunikation mit einer Art Notifikation aufmerksam zu machen.
* Es fehlt ein Konzept dafür, was passieren soll, wenn ein Benutzer offline geht und das Spiel nicht mehr wiederaufnimmt (z.B. weil er am Verlieren ist und nicht mehr weiterspielen will). Wie lange soll der noch aktive Benutzer warten müssen, bevor das System reagiert? Was sind die Konsequenzen für einen solchen Spielabbruch? Gibt es einen Unterschied, ob es während dem Spiel oder während der Wertung passiert?
* Macht es unter Umständen Sinn, eine Funktion einzuführen, mit der die Benutzer sich auf "Partie nicht werten" einigen können?
* Ein Chat System fehlt definitiv!
* Support for OAuth?
