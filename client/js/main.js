// Module principale
var main = angular.module("main", ["chatIrc"]);
// Dépendance du module principale
var chatIrc = angular.module("chatIrc", []);
// Controlleur du module chatIrc
chatIrc.controller("fieldsController", function($scope) {
  $scope.channels = { // Liste des salons
    "Dev": { // Un salon en particulier
       name: "#Dev", // Son nom
       topic: "Salon de développement", // Le topic associé
       users: [ // La liste d'utilisateur dedans
         "@Julien", // Un utilisateur
         "%Mathieu",
         "+Danielle",
         "Nathan"
       ],
       blocks: [ // La liste des blocks de message
         { // Un block de message (messages envoyés par la suite par un même utilisateur)
           user: "@Julien", // L'utilisateur qui l'a envoyé
           messages: [ // La liste des messages
             { // Un message en particulier
               time: new Date(), // L'heure à laquelle le message a été envoyé
               text: "Hello world" // Le texte du message
             } // Fin message
           ] // Fin messages
         } // Fin block
       ] // Fin blocks
     } // Fin channel
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
    $scope.me.connected = true;
    $scope.irc = new IRC(
      $scope.me.nickname,
      $scope.me.password ? $scope.me.password : "",
      $scope,
      function() {
        if ($scope.me.autoChannels) {
          $scope.me.autoChannels.split("\r\n").forEach(function(channel){
            $scope.irc.sendCommand("JOIN " + channel);
          });
        }
        if ($scope.me.autoCommands) {
          $scope.me.autoCommands.split("\r\n").forEach(function(command){
            $scope.irc.sendCommand(command);
          });
        }
      });

    event.preventDefault();
  }

  $scope.sendMessage = function sendMessage(event) {
    $scope.irc.sendMessage($scope.currentChannel, $scope.message);
    event.preventDefault();
  }

  this.getActiveChannelClass = function getActiveChannelClass(channel) {
    return {
      activeChannel: channel == $scope.currentChannel, // Active la classe activeChannel si c'est le salon courant, sinon la désactive
      notActiveChannel: channel != $scope.currentChannel // Active la classe notActiveChannel si ce n'est pas le salon courant, sinon la désactive
    }
  }
});

function onJoin(scope, sender, channel, topic, names) {
  if (!(channel in scope.channels)) { // Je rejoins un nouveau salon que je n'avais jamais rejoint avant
    scope.channels[channel] =  {
      name: channel,
      users: [scope.me.nickname],
      topic: "",
      blocks: []
    }
  }
  if (sender != scope.me.nickname) { // Un nouvel utilisateur arrive sur un salon où je suis déjà
    scope.channels[channel].users.push(sender);
  } else { // Je rejoins un nouveau salon
    if (typeof topic != undefined) scope.channels[channel].topic = topic;
    if (typeof names != undefined) scope.channels[channel].users = names;
  }
  console.log(scope.channels)
}
