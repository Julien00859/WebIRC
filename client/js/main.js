// Module principale
var main = angular.module("main", ["chatIrc"]);
// Dépendance du module principale
var chatIrc = angular.module("chatIrc", ["ngSanitize"]);
// Controlleur du module chatIrc
chatIrc.controller("fieldsController", function($scope, $sce, $interval) {
  $scope.channels = { // Liste des salons
    "Console": { // Un salon en particulier
      name: "Console", // Son nom
      topic: "Gérer le serveur", // Le topic associé
      users: [], // La liste d'utilisateur dans le channel
      blocks: [ // La liste des blocks de message
        { // Un block de message (messages envoyés par la suite par un même utilisateur)
          user: "", // L'utilisateur qui l'a envoyé
          messages: [ // La liste des messages
            { // Un message en particulier
              type: "", // Le type du message (msg, kick, join, ...)
              time: "", // L'heure à laquelle le message a été envoyé
              text: "" // Le texte du message
            } // Fin message
          ] // Fin messages
        } // Fin block
      ] // Fin blocks
    }// Fin channel
  } // Fin object

  $scope.me = { // Infos de l'utilisateur actif sur la page
//  nickname: String(), // Le nickname de l'utilisateur
//  password: String(), // Le mot de passe pour entrer sur le serveur
//  autoChannels: [ // La liste des channels à rejoindre automatiquement
//    String() // Un salon à rejoindre une fois connecté
//  ],
//  autoCommands: [ // La liste des commandes à exécuter automatiquement
//    String() // Une commande à exécuter une fois connecté
//  ]
  }

  $scope.kick = function kick(user, permLevelNeeded) {
    if ($scope.canIDoIt($scope.currentChannel, permLevelNeeded)) {
      $scope.irc.sendCommand("KICK " + $scope.currentChannel + " " + user + " :Kicked");
    }
  }

  $scope.openPrivate = function(user) {
    var nickname = $scope.getRawUsername(user);
    if (!(nickname in $scope.channels)){
      console.log("Nouveau salon privé")
      $scope.channels[nickname] = {
        name: nickname,
        topic: "Salon privé avec " + nickname,
        users: [$scope.me.nickname, nickname],
        blocks:[]
      }
    }
    $scope.currentChannel = nickname;
  }

  $scope.options = {
    scroll: true,
    visu: true,
    sound: false
  }

  this.menu = false;
  $scope.showMenu = function() {
    this.menu = true;
  };
  $scope.hideMenu = function() {
    this.menu = false
  }

  $scope.currentChannel = ""; // Variable contenant le nom du salon actuellement selectionné par l'utilisateur

  $interval(function(){$scope.date = new Date()}, 1000 * 10);

  // Fonction pour s'enregistrer sur le serveur IRC
  $scope.register = function register(event) {
    $scope.me.connected = true;

    // Crée un objet irc en lui passant nickname, password et une fonction de callback
    $scope.irc = new IRC(
      $scope.me.nickname,
      $scope.me.password ? $scope.me.password : "",
      function() { // Fonction de callback a exécuter une fois connecté
        // Rejoint les salons auto
        if ($scope.me.autoChannels) {
          $scope.me.autoChannels.split("\r\n").forEach(function(channel){
            $scope.irc.sendCommand("JOIN " + channel);
          });
        }
        // Envoie les commandes auto
        if ($scope.me.autoCommands) {
          $scope.me.autoCommands.split("\r\n").forEach(function(command){
            $scope.irc.sendCommand(command);
          });
        }
      });
    Notification.requestPermission(); // Demande la permission de jouer les notifications

    event.preventDefault(); // Empêche l'envoit du formulaire
  }

  // Fonction pour envoyer un message (commande PRIVMSG) sur le salon courant
  $scope.sendMessage = function sendMessage(event) {
    if ($scope.currentChannel == "Console") $scope.irc.sendCommand($scope.message) // Envoit un message en console
    else $scope.irc.sendMessage($scope.currentChannel, $scope.message); // Envoit le message au serveur IRC
    addText($scope.channels, $scope.currentChannel, $scope.me.nickname, "msg", new Date(), $scope.message); // Ajoute le texte sur la page HTML
    if ($scope.options.scroll) setTimeout(function(){$("#chatbox section:not(.ng-hide) .block:last p:last").get(0).scrollIntoView();}, 10); // Si l'option de déffilement est checked, on déffile sur le nouveau message
    $scope.message = ""; // Retire le text de la textarea
    event.preventDefault(); // Empêche l'envoit du formulaire
  }

  $scope.joinChannel = function joinChannel(channel) {
    if (channel in $scope.channels) { // Active le salon
      $scope.currentChannel = channel;

    } else if (!(channel in $scope.channels) && channel[0] == "#") { // Rejoint le salon, il sera activé une fois rejoint
      $scope.irc.sendCommand("JOIN " + channel);

    } else { // On rejette
      alert("Operation rejected !")
    }
  }

  // Fonction qui retourne true si le salon passé en argument est le salon actif
  $scope.isCurrentChannel = function isCurrentChannel(channel) {
    return (channel == $scope.currentChannel);
  }

  // Fonction qui retourne la classe d'un message selon le type passé en argument
  $scope.getMessageTypeClass = function getMessageTypeClass(type) {
    return {
      typeMsg: type == "msg",
      typeJoin: type == "join",
      typeKick: type == "kick",
      typeQuit: type == "quit",
      typePart: type == "part",
      typeMode: type == "mode",
      typeRaw: type == "raw"
    }
  }

  // Fonction qui retourne une classe spécifique au salon actif
  $scope.getNavChannelClass = function getNavChannelClass(channel) {
    return {
      activeNavChannel: channel == $scope.currentChannel
    }
  }

  // Fonction qui returne la classe d'un utilisateur en fonction du prefix du nickname passé en argument
  $scope.getUserModeClass = function getUserModeClass(user) {
    return {
      modeUser: user[0] != "+" && user[0] != "%" && user[0] != "@",
      modeVoice: user[0] == "+",
      modeHalfOP: user[0] == "%",
      modeOP: user[0] == "@"
    }
  }

  // Fonction qui retourne le type du block en fonction de l'user à l'avoir envoyé
  $scope.getMessageSenderClass = function getMessageSenderClass(user) {
    return {
      messageBySystem: user == "", // Hardcodé pour les messages de type join, kick, part, ...
      messageByMe: user == $scope.me.nickname,
      messageNotByMe: user != $scope.me.nickname && user != ""
    }
  }

  $scope.optionsMenu = [
    {
      name: "Salon privé",
      fun: $scope.openPrivate,
      permLevel: 0
    },
    {
      name:"Kicker",
      fun: $scope.kick,
      permLevel: 2
    }
  ];

  $scope.canIDoIt = function canIDoIt(channel, permLevelNeeded) {
    var iCan = false;
    for (var user in $scope.channels[channel].users) {
      if ($scope.channels[channel].users[user].indexOf($scope.me.nickname) >= 0) {
        if ($scope.getUserPermission($scope.channels[channel].users[user]).level >= permLevelNeeded) {
          iCan = true;
        }
      }
    }
    return iCan
  }

  $scope.getClickableButtonClass = function getClickableButtonClass(channel, permLevelNeeded) {
    var isClickable = $scope.canIDoIt(channel, permLevelNeeded);
    return {
      clickableButton: isClickable,
      notClickableButton: !isClickable
    }
  }

  $scope.getRawUsername = function getRawUsername(fullnick) {
    if (["+","%","@","~"].indexOf(fullnick[0]) >= 0) return fullnick.slice(1);
    else return fullnick;
  }

  $scope.getUserPermission = function getUserPermission(fullnick) {
    var perms = {
      "~":{name: "Owner", level: 4},
      "@":{name: "Op", level: 3},
      "%":{name: "HalfOp", level: 2},
      "+":{name: "Voice", level: 1}
    }
    if (fullnick[0] in perms) return perms[fullnick[0]]
    else return {name: "User", level: 0}
  }

});

// Fonctions event lié à IRC.js

function onJoin(sender, channel, topic, names) {
  var scope = angular.element(document.body).scope(); // Récupération du $scope du controleur
  if (!(channel in scope.channels)) { // Lorsque d'un nouveau salon est rejoint
    scope.channels[channel] =  { // On crée la mapping de base lié à ce salon, elle sera peuplé après
      name: channel,
      users: [],
      topic: "",
      blocks: []
    }
  }
  if (sender != scope.me.nickname) { // Lorsqu'un utilisateur rejoint un salon sur lequel on est présent
    scope.channels[channel].users.push(sender); // On l'ajoute simplement à la liste des utilisateurs connectés au salon
  } else { // Lorsque c'est l'utilisateur qui rejoint un salon
    scope.currentChannel = channel; // On le défini comme salon actif
    if (typeof topic != undefined) scope.channels[channel].topic = topic; // On ajoute le topic
    if (typeof names != undefined) scope.channels[channel].users = names.split(" "); // On ajoute la liste des utilisateurs
  }
  // On affiche le message sur la page HTML
  scope.channels[channel].blocks.push(
    {
      user: "",
      messages: [
        {
          type: "join",
          time: new Date(),
          text: sender + " a rejoint le salon !"
        }
      ]
    }
  );
  scope.$apply(); // On applique les changements sur la DOM
  if (scope.options.scroll && channel == scope.currentChannel) $("#chatbox section:not(.ng-hide) .block:last p:last").get(0).scrollIntoView(); // Si l'option scroll est checké et qu'on se trouve dans le salon actif, on récupère le dernier élément et on scroll dessus.
}

function onPrivMsg(sender, channel, message) {
  var scope = angular.element(document.body).scope(); // On récupère le $scope d'Angular
  if (channel in scope.channels) addText(scope.channels, channel, sender, "msg", new Date(), message); // Si le salon existe déjà, on écrit simplement le message dessus
  else if (channel == scope.me.nickname) {
    if (!(sender in scope.channels)) {
      scope.channels[sender] =  {
        name: sender,
        users: [sender, scope.me.nickname],
        topic: "Message privé avec " + sender,
        blocks: []
      }
    }
    addText(scope.channels, sender, sender, "msg", new Date(), message, scope.options.scroll && channel == scope.currentChannel); // On écrit le message
  }
  scope.$apply(); // On applique les changements sur la DOM
  if (scope.options.scroll && channel == scope.currentChannel) $("#chatbox section:not(.ng-hide) .block:last p:last").get(0).scrollIntoView(); // Si l'option scroll est checké et qu'on se trouve dans le salon actif, on récupère le dernier élément et on scroll dessus.
  if ((message.indexOf(scope.me.nickname) >= 0 || channel == scope.me.nickname) && scope.options.visu) {// Notification
    notif("Web IRC - Nouveau message", "Vous avez été pocké !", scope.options.sound)
  }
}

function onQuit(sender, message) {
  var scope = angular.element(document.body).scope(); // On récupère le $scope d'Angular
  Object.keys(scope.channels).forEach(function(channel){ // Sur chaque channel
    addText(scope.channels, channel, "", "quit", new Date(), sender + " a quitté le serveur: \"" + message + "\""); // On affiche que l'utilisateur est parti
    updatesNames(scope, channel) // On supprime l'utilisateur de la liste
    scope.$apply(); // On applique les changements sur la DOM
    if (scope.options.scroll && channel == scope.currentChannel) $("#chatbox section:not(.ng-hide) .block:last p:last").get(0).scrollIntoView(); // Si l'option scroll est checké et qu'on se trouve dans le salon actif, on récupère le dernier élément et on scroll dessus.
  });
}

function onPart(sender, channel, message) {
  var scope = angular.element(document.body).scope(); // On récupère le $scope d'Angular
  addText(scope.channels, channel, "", "part", new Date(), sender + " a quitté le salon: \"" + message + "\""); // On ajoute le message
  updatesNames(scope, channel); // On rafraichit la liste des utilisateurs
  scope.$apply(); // On applique les changements sur la DOM
  if (scope.options.scroll && channel == scope.currentChannel) $("#chatbox section:not(.ng-hide) .block:last p:last").get(0).scrollIntoView(); // Si l'option scroll est checké et qu'on se trouve dans le salon actif, on récupère le dernier élément et on scroll dessus.
}

function onKick(sender, channel, target, message) {
  var scope = angular.element(document.body).scope(); // On récupère le $scope d'Angular
  addText(scope.channels, channel, "", "kick", new Date(), sender + " a renvoyé " + target + " du salon pour: \"" + message + "\""); // On ajoute le message
  updatesNames(scope, channel); // On rafraichit la liste des utilisateurs
  scope.$apply(); // On applique les changements sur la DOM
  if (scope.options.scroll && channel == scope.currentChannel) $("#chatbox section:not(.ng-hide) .block:last p:last").get(0).scrollIntoView(); // Si l'option scroll est checké et qu'on se trouve dans le salon actif, on récupère le dernier élément et on scroll dessus.
}

function onMode(sender, channel, mode, target) {
  var scope = angular.element(document.body).scope(); // On récupère le $scope d'Angular
  updatesNames(scope, channel)
}

// Macro fonction qui ajoute ce qu'il faut là où il faut. Ce commentaire vous est offert par Julien Inc.
function addText(channels, channel, user, type, time, text) {
  if (channels[channel].blocks.length > 0 && channels[channel].blocks.slice(-1)[0].user == user) { // Si ce n'est pas le premier message et que l'user concorde avec le dernier ayant écrit quelque chose
    channels[channel].blocks.slice(-1)[0].messages.push( // On ajoute un message au bloc
      {
        "type": type,
        "time": time,
        "text": text
      }
    );
  } else { // Sinon si c'est le tout premier message ou que l'user ne concorde pas avec le dernier ayant dit quelque chose
    channels[channel].blocks.push( // On crée un nouveau bloc auquel on ajoute un nouveau message
      {
        "user": user,
        "messages": [
          {
            "type": type,
            "time": time,
            "text": messageParser.parse(text)
          }
        ]
      }
    );
  }
}

function updatesNames(scope, channel) {
  scope.irc.sendNamesQuery(channel, function(names){ // On envoit une requête pour obtenie la liste des utilisateurs avec leur mode
    scope.channels[channel].users = names.split(" "); // On affiche la nouvelle liste d'utilisateur
    scope.$apply(); // On applique les changements sur la DOM
  });
}

function notif(title, content, bip) {
  // Let's check whether notification permissions have already been granted
  if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var not = new Notification(title, {body:content, silent:!bip});
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var not = new Notification(title, {body:content, silent:!bip});
      }
    });
  }
}
