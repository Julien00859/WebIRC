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

socketio.on("connection", function(socket){
    console.log("User connected");
    socket.irc = {};

    socket.on("register", function(nickname, password) {
        socket.irc.server = new net.Socket();
        socket.irc.registred = false;

        console.log("Connecting new client to IRC")
        socket.irc.server.connect(config.IRCPort, config.IRCHost, function(){
            console.log("Connected, sending pass nick and user commands")
            if (password) socket.irc.server.write("PASS " + password + "\r\n");
            socket.irc.server.write("NICK " + nickname + "\r\n");
            socket.irc.server.write("USER WebIRC 0 * :" + socket.handshake.address.address + "\r\n");
        });

        socket.irc.server.on("data", function(buffer){
            msg = new String(buffer).valueOf()
            console.log(msg);
            socket.emit("IRCMessage", msg);
        });

        socket.on("command", function(cmd){
            socket.irc.server.write(cmd + "\r\n")
        });
        socket.on('disconnect', function(){
            console.log('user disconnected');
            socket.irc.server.end("QUIT :Page closed");
        });
    });
});
