// Module principale
var main = angular.module("main", ["chatIrc"]);
// Dépendance du module principale
var chatIrc = angular.module("chatIrc", []);
// Controlleur du module chatIrc
chatIrc.controller("fieldsController", function($scope) {
  $scope.channels = { // Liste des salons
// String(): { // Un salon en particulier
//    name: String(), // Son nom
//    topic: String(), // Le topic associé
//    users: [ // La liste d'utilisateur dedans
//      Strin() // Un utilisateur
//    ],
//    blocks: [ // La liste des blocks de message
//      { // Un block de message (messages envoyés par la suite par un même utilisateur)
//        user: String(), // L'utilisateur qui l'a envoyé
//        messages: [ // La liste des messages
//          { // Un message en particulier
//            time: Date(), // L'heure à laquelle le message a été envoyé
//            text: String() // Le texte du message
//          } // Fin message
//        ] // Fin messages
//      } // Fin block
//    ] // Fin blocks
//  } // Fin channel
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

  $scope.currentChannel = "";

  $scope.users = { // Liste totale des utilisateurs connus
//  String(): { // Un utilisateur en particulier
//    nickname: String()
//  }
  }

  $scope.register = function register(event) {
    $scope.irc = IRC(
      $scope.me.nickname,
      $scope.me.password,
      function() {
        $scope.me.autoChannels.split("\r\n").forEach(function(channel){
          $scope.join(channel);
        });
        $scope.me.autoCommands.split("\r\n").forEach(function(command){
          $scope.irc.sendCommand(command);
        })
      });

    event.preventDefault();
  }

  $scope.sendMessage = function sendMessage(event) {
    $scope.irc.sendMessage($scope.currentChannel, $scope.message);
    event.preventDefault();
  }

  $scope.join = function join(channel) {
    $scope.irc.sendCommand("JOIN " + channel);
    $scope.irc.channels[channel] = {
      name: channel,
      users: [],
      topic: "",
      blocks: []
    }

    $scope.irc.sendNamesQuery(channel, function(names){
      $scope.channels[channel].users = names;
    });

    $scope.irc.sendTopicQuery(channel, function(topic){
      $scope.channels[channel].topic = topic;
    });
  }

  this.getActiveChannelClass = function getActiveChannelClass(channel) {
    return {
      activeChannel: channel == $scope.currentChannel, // Active la classe activeChannel si c'est le salon courant, sinon la désactive
      notActiveChannel: channel != $scope.currentChannel // Active la classe notActiveChannel si ce n'est pas le salon courant, sinon la désactive
    }
  }
});
