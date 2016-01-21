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
    $scope.showForm = true; // Lors de l'envoi du 1er form, on le cache et n affiche le second formulaire
    event.preventDefault(); // Bloque l'envoi du formulaire
  };
  $scope.sendText = function(event) { // Fonction lors de l'envoi du formulaire de message
    event.preventDefault(); // Bloque l'envoi du formulaire
  }
});
