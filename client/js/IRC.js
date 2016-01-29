var IRC = function IRC(nickname, password, callback) {
    // Varable d'instance
    var self = this;
    self.socket = io();
    self.callbacks = [];

    // Envoyer une commande en brute sur le réseau IRC
    self.sendCommand = function sendCommand(command) {
        console.log("> " + command);
        self.socket.emit("command", command);
    }

    // Envoyer un message sur un salon où à quelqu'un
    self.sendMessage = function sendMessage(channel, message) {
        self.sendCommand("PRIVMSG " + channel + " :" + message);
    }

    // Envoyer une requête pour récupérer la liste des utilisateurs d'un salon
    self.sendNamesQuery = function sendNamesQuery(channel, callback) {
        console.log("> NAMES " + channel);
        var callbackId = self.callbacks.length;
        self.callbacks.push(callback);
        self.socket.emit("names", channel, callbackId);
    }

    // Envoyer une requête pour récupérer le topic d'un salon
    self.sendTopicQuery = function sendTopicQuery(channel, callback) {
        console.log("> TOPIC " + channel);
        var callbackId = self.callbacks.length;
        self.callbacks.push(callback);
        self.socket.emit("topic", channel, callbackId);
    }

    // Envoie d'une requête d'enregistrement au serveur node
    self.socket.emit("register", nickname, password);

    // Active un événement sur la réception des messages du serveur node
    self.socket.on("IRCMessage", function(IRCMessage){

        // Récupère chaque ligne du message reçu et l'affiche en console
        lines = IRCMessage.trim().split("\r\n")
        for (var index in lines) {
            var line = lines[index];
            console.log(line)

            var scope = angular.element(document.body).scope();
            addText(scope.channels, "Console", "", "raw", new Date(), line);
            scope.$apply()

            if (!self.connected) { // Si on a pas encore reçu le MOTD
                if (line.indexOf("End of message of the day") > -1) {
                    self.connected = true; // Ok on est connecté !
                    callback();
                    break; // On passe les autres messages du MOTD
                }
            } else { // Sinon si on est en phase de connexion normal
                var linex = line.split(" "); // On récupère chaque mot de la ligne

                // Si le 1e mot est PING, on renvoit le PONG correspondant
                if (linex[0] == "PING") self.sendCommand("PONG " + linex[1] + "\r\n");
                else if (linex.length >= 2) { // Sinon on regarde chaque 2e mot (le 1e étant alors :<nickname>!<hostname>@<mask>)
                    switch (linex[1]) {
                        case "PRIVMSG":
                            // :Julien00859!Julien@host-85-201-171-39.dynamic.voo.be PRIVMSG #Dev :Hello world :D
                            //  ^^^^^^^^^^^                                                  ^^^^  ^^^^^^^^^^^^^^
                            var sender = linex[0].slice(1, linex[0].indexOf("!"));
                            var channel = linex[2];
                            var msg = linex.slice(3).join(" ").slice(1);
                            onPrivMsg(sender, channel, msg)
                            break;

                        case "JOIN":
                            // :Julien00859!Julien@host-85-201-171-39.dynamic.voo.be JOIN :#Dev
                            //  ^^^^^^^^^^^                                                ^^^^
                            // :127.0.0.1 332 Julien00859 #Dev :Salut tout le monde :D
                            //                                  ^^^^^^^^^^^^^^^^^^^^^^
                            // :127.0.0.1 333 Julien00859 #Dev Julien008!Julien@94.111.231.0 1453514793
                            // :127.0.0.1 353 Julien = #Dev :Juilen @Julien008 jsfljdflkjkflsj
                            //                              [^^^^^^,^^^^^^^^^^,^^^^^^^^^^^^^^^]
                            // :127.0.0.1 366 Julien00859 #Dev :End of /NAMES list.
                            var sender = linex[0].slice(1, linex[0].indexOf("!"));
                            var channel = linex[2].slice(1);

                            // Truc de gros porc :D
                            var topicAndName;
                            var topic;
                            var names;
                            for (var i in lines.slice(index)) {
                              if (lines[parseInt(index) + parseInt(i)].indexOf(":End of /NAMES list.") >= 0) {
                                topicAndName = lines.slice(index, parseInt(index) + parseInt(i) + 1);
                                if (topicAndName.length >= 5) {
                                  topic = topicAndName[1].split(" ").slice(4).join(" ").slice(1);
                                }
                                if (topicAndName.length >= 3 && topicAndName.slice(-1)[0].indexOf(":End of /NAMES list.") >= 0) {
                                  names = topicAndName.slice(-2, -1)[0].split(" ").slice(5).join(" ").slice(1).trim();
                                }
                                break;
                              }
                            }
                            onJoin(sender, channel, topic, names);
                            break;

                        case "KICK":
                            // :Julien008!Julien@host-85-201-171-39.dynamic.voo.be KICK #Dev Julien00859 :You have been kicked
                            //  ^^^^^^^^^                                               ^^^^ ^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^
                            var sender = linex[0].slice(1, linex[0].indexOf("!"));
                            var channel = linex[2];
                            var target = linex[3];
                            var kickMessage = linex.slice(4).join(" ").slice(1);
                            onKick(sender, channel, target, kickMessage);
                            break;

                        case "PART":
                            // :Julien00859!Julien@host-85-201-171-39.dynamic.voo.be PART #Dev :"Gonna bake some cookies..."
                            //  ^^^^^^^^^^^                                               ^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                            var sender = linex[0].slice(1, linex[0].indexOf("!"));
                            var channel = linex[2];
                            var partMessage = linex.slice(3).join(" ").slice(1);
                            onPart(sender, channel, partMessage);
                            break
                        case "QUIT":
                            // :Julien00859!Julien@host-85-201-171-39.dynamic.voo.be QUIT :Quit: Keep calm and do not rage quit
                            //  ^^^^^^^^^^^                                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                            var sender = linex[0].slice(1, linex[0].indexOf("!"));
                            var quitMessage = linex.slice(3).join(" ");
                            onQuit(sender, quitMessage);
                            break;

                        case "MODE":
                            // :Julien008!Julien@host-85-201-171-39.dynamic.voo.be MODE #Dev +h Julien00859
                            //  ^^^^^^^^^                                               ^^^^ ^^ ^^^^^^^^^^^
                            var sender = linex[0].slice(1, linex[0].indexOf("!"));
                            var channel = linex[2];
                            var mode = linex[3];
                            var target = linex[4];
                            onMode(sender, channel, mode, target);
                            break;
                    }
                }
            }
        };
    });

    self.socket.on("topic", function(messages, callbackId){
        // :127.0.0.1 332 Julien008 #Dev :Hello world
        //                               "^^^^^^^^^^^"
        // :127.0.0.1 333 Julien008 #Dev Julien008!Julien@host-85-201-171-39.dynamic.voo.be 1453335926

        var topic = messages.split("\r\n")[0].split(" ").slice(4).join(" ").slice(1);
        self.callbacks[callbackId](topic);
    });

    self.socket.on("names", function(messages, callbackId) {
        // :127.0.0.1 353 Julien008 = #Dev :@Julien008 @MrRobot %Mathieu Jean-Kevin
        //                                 [^^^^^^^^^^,^^^^^^^^,^^^^^^^^,^^^^^^^^^^]
        // :127.0.0.1 366 Julien008 #Dev :End of /NAMES list.

        var names = messages.split("\r\n")[0].split(" ").slice(5).join(" ").slice(1).trim();
        self.callbacks[callbackId](names);
    });
}
