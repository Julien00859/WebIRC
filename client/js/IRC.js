var IRC = function IRC(nickname, password, channels, commands) {
    // Varable d'instance
    var self = this;
    self.socket = io();
    self.nickname = new String(nickname).valueOf();
    self.channels = new Array().concat(channels);
    self.commands = new Array().concat(commands);
    self.connected = false;

    self.send = function send(e, command) {
        console.log("> " + command);
        self.socket.emit(e, command)
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
                    self.channels.forEach(function(chan) self.send("command", "JOIN " + chan)); // On rejoint les salons
                    self.commands.forEach(function(cmd) self.send("command", cmd)); // On envoie les commandes
                    break; // On passe les autres messages du MOTD
                }
            } else { // Sinon si on est en phase de connexion normal
                linex = line.split(" "); // On récupère chaque mot de la ligne

                // Si le 1e mot est PING, on renvoit le PONG correspondant
                if (linex[0] == "PING") self.send("PONG " + linex[1] + "\r\n");
                else { // Sinon on regarde chaque 2e mot (le 1e étant alors :<nickname>!<hostname>@<mask>)
                    switch (linex[1]) {
                        case "PRIVMSG":
                            // :Julien00859!Julien@host-85-201-171-39.dynamic.voo.be PRIVMSG #Dev :Hello world :D
                            //  ^^^^^^^^^^^                                                  ^^^^  ^^^^^^^^^^^^^^
                            var sender = linex[0].slice(1, linex[0].indexOf("!"));
                            var channel = linex[2];
                            var msg = linex.slice(3).join(" ").slice(1);
// ==>                      Appeler une fonction du controlleur.
                    }
                }
            }
        };
    });
}

// À déplacer dans le controlleur et changer les variables par défaut
function connect() {
    console.log("Connecting to IRC");
    irc = new IRC("WebIRC", "", ["#Dev"], []);
}
