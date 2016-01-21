// Module principale
var main = angular.module("main", ["chatIrc"]);
// Dépendance du module principale
var chatIrc = angular.module("chatIrc", []);
// Controlleur du module chatIrc
chatIrc.controller("fieldsController", function($scope) {
  $scope.infos = []; // Tableau vide destiné à recevoir les infos d'indentification de l'user
  $scope.showTextField = function(event) { // Fonction lors de l'envoi du formulaire d'identification
    $scope.infos.push({ // Ajout des infos renseignés par l'user dans le tableau $scope.infos
      nickname: $scope.user.nickname,
      username: $scope.user.username,
      realname: $scope.user.realname,
      password: $scope.user.password,
      saloon: $scope.user.joinCommand,
      command: $scope.user.joinChannel
    });
    //console.log($scope.infos);
    $scope.showForm = true; // Lors de l'envoi du 1er form, on le cache et on affiche le second formulaire
    event.preventDefault(); // Bloque l'envoi du formulaire
  };
  $scope.sendText = function(event) { // Fonction lors de l'envoi du formulaire de message
    this.on("join", function(sender, channel, message) { // User rejoint le salon
      
    });
    this.on("publicMessage", function(sender, channel, message) { // User envoi un message public (sur le salon)

    });
    this.on("privateMessage" function(sender, channel, message) { // User envoi un message privé

    });
    this.on("kick", function(sender, channel, message) { // User est banni du salon

    });
    this.on("part", function(sender, channel, message) { // User quitte le salon

    });
    this.on("quit", function(sender, channel, message) { // User quitte le serveur

    });
    this.on("mode", function(sender, channel, message) { // User change de mode (ex: passe Admin)

    });
    event.preventDefault(); // Bloque l'envoi du formulaire
  }
});
