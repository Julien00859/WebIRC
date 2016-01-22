// Importation des dépendances
const fs = require("fs");
const pathlib = require("path");
const net = require("net");
const express = require("express")
const app = express(http)
const http = require("http").Server(app);
const socketio = require("socket.io")(http);

// Récupération de la configuration
const config = JSON.parse(fs.readFileSync(pathlib.join(process.cwd(), "config.json"), "utf8"));

// Définition de la racine
app.use(express.static("../client/"));

// Lancement du serveur web
http.listen(config.nodePort, function(){
    console.log("Server running on localhost:" + config.nodePort + "\n");
});

// Gestion des sockets clients
socketio.on("connection", function(socket){
    console.log("User connected");
    socket.irc = {}; // Mapping pour chaque client contenant le socket IRC et d'autres infos (pour gérer les callbacks par exemple)

    // Le seul event dispo pour le client est register.
    // Il ouvre le socket et connecte le client au réseau IRC
    // Il ajoute les autres events
    socket.on("register", function(nickname, password) {
        socket.irc.server = new net.Socket(); // Le socket avec le serveur IRC

        // Une map gardant une trace des ID des fonctions de callback chez le client
        // Le client sauvegarde la fonction dans une liste et envoit son identifiant
        // Le serveur lie cet identifiant au salon pour lequel la requête a été envoyé
        // Et retourne cet ID en même temps que la réponse à la requête
        socket.irc.callbacks = {"names": {}, "topîc": {}};

        socket.irc.query = ""; // Me sert à gérer les requêtes client.

        // Se connecte au serveur IRC
        console.log("Connecting new client to IRC")
        socket.irc.server.connect(config.IRCPort, config.IRCHost, function(){
            // Une fois la connexion socket établie, on enregistre l'utilisateur
            console.log("Connected, sending pass, nick and user commands")
            if (password) socket.irc.server.write("PASS " + password + "\r\n"); // Si besoin du password, on l'envoit
            socket.irc.server.write("NICK " + nickname + "\r\n"); // On envoit le nickname fourni à la fonction
            socket.irc.server.write("USER WebIRC 0 * :" + socket.handshake.address.address + "\r\n"); // On force le pseudonyme pour "WebIRC" avec comme realname l'adresse IP du client.
        });

        // Fonction de récupérer de chaque message envoyé depuis le serveur IRC
        socket.irc.server.on("data", function(buffer){
            msg = new String(buffer).valueOf() // On converti le buffer en string

            if (socket.irc.query != "") { // Si il y a une requête en attente, on exécute l'event associé en passant l'ID de la fonction de callback
                var channel = msg.split("\r\n")[1].split(" ")[3];

                if (channel in socket.irc.callbacks[socket.irc.query]) {
                     socket.emit(socket.irc.query, msg, socket.irc.callbacks[socket.irc.query][channel]);
                     delete socket.irc.callbacks[socket.irc.query][channel]
                }
                else socket.emit(socket.irc.query, msg);

                socket.irc.query = "";

            } else { // Si aucune requête en attente, on envoit simplement le message au client qui s'occupera de le gérer
                socket.emit("IRCMessage", msg);
            }
        });

        // Une commande "normale" à envoyer au réseau IRC (join, part, privmsg, kick, ...)
        socket.on("command", function(cmd){
            socket.irc.server.write(cmd + "\r\n");
        });

        // Une requête TOPIC
        socket.on("topic", function(channel, callbackId){
            // Si il y a une fonction de callback, on sauvegarde son ID en le liant à la commande et au salon
            if (typeof callbackId != "undefined") socket.irc.callbacks.topic[channel] = callbackId;
            socket.irc.query = "topic"; // On prévient la fonction on("data") que c'est une requête spéciale à traiter séparément
            socket.irc.server.write("TOPIC " + channel + "\r\n"); // On envoie la commande au serveur IRC
        });

        // Une requête NAMES
        socket.on("names", function(channel, callbackId){
            // Si il y a une fonction de callback, on sauvegarde son ID en le liant à la commande et au salon
            if (typeof callbackId != "undefined") socket.irc.callbacks.names[channel] = callbackId;
            socket.irc.query = "names"; // On prévient la fonction on("data") que c'est une requête spéciale à traiter séparément
            socket.irc.server.write("NAMES " + channel + "\r\n"); // On envoie la commande au serveur IRC
        });

        // Le client se déconnecte (ferme la page ?)
        socket.on('disconnect', function(){
            console.log('user disconnected');
            // On kill le socket tout en envoyant le message propice au serveur IRC
            socket.irc.server.end("QUIT :Page closed");
        });
    });
});
