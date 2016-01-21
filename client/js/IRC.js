var IRC = function IRC(nickname, password, channels, commands) {
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
        self.socket.emit("names", channels, callbackId);
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
        for (var index in IRCMessage.split("\r\n")) {
            var line = IRCMessage.split("\r\n")[index];
            console.log(line)

            if (!self.connected) { // Si on a pas encore reçu le MOTD
                if (line.indexOf("End of message of the day") > -1) {
                    self.connected = true; // Ok on est connecté !
                    channels.forEach(function(chan) self.sendCommand("JOIN " + chan)); // On rejoint les salons
                    commands.forEach(function(cmd) self.sendCommand(cmd)); // On envoie les commandes
                    delete channels;
                    delete commands;
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
                            break;
                        case "JOIN":
                            break;

                        case "KICK":
                            break;

                        case "PART":
                            break;

                        case "QUIT":
                            break;

                        case "MODE":
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
        delete self.callbacks[callbackId];
    });

    self.socket.on("names", function(messages, callbackId) {
        // :127.0.0.1 353 Julien008 = #Dev :@Julien008 @MrRobot %Mathieu Jean-Kevin
        //                                 [^^^^^^^^^^,^^^^^^^^,^^^^^^^^,^^^^^^^^^^]
        // :127.0.0.1 366 Julien008 #Dev :End of /NAMES list.

        var names = messages.split("\r\n")[0].split(" ").slice(5).join(" ").slice(1).split(" ");
        self.callbacks[callbackId](names);
        delete self.callbacks[callbackId];
    });
}
var irc;
// À déplacer dans le controleur et changer les variables par défaut
function connect() {
    console.log("Connecting to IRC");
    irc = new IRC("WebIRC", "", ["#Dev"], []);
}
