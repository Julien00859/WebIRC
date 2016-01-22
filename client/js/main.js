// Module principale
var main = angular.module("main", ["chatIrc"]);
// Dépendance du module principale
var chatIrc = angular.module("chatIrc", []);
// Controlleur du module chatIrc
chatIrc.controller("fieldsController", function($scope) {

  $scope.infos = []; // Tableau vide destiné à recevoir les infos d'indentification de l'user
  var nm = []; // Tableau de travail (contenant les noms des users connectés)
  $scope.tp = []; // Tableau de travail (contenant les topics)

  $scope.initPage = function init() { // Affiche l'heure au chargement de la page
    function getDate() {
      var fulldate = new Date();
      var hours = fulldate.getHours();
      var minutes = fulldate.getMinutes();
      var date = fulldate.toLocaleDateString();
      console.log(date + " " + hours + ":" + minutes);
      $("#date").text(date + " " + hours + ":" + minutes);
    };
    setInterval(getDate, 60000); // Heure mis à jour toute les minutes
  };

  $scope.showTextField = function(event, sender, channel) { // Fonction lors de l'envoi du formulaire d'identification
    $scope.infos.push({ // Ajout des infos renseignés par l'user dans le tableau $scope.infos
      nickname: $scope.user.nickname,
      username: $scope.user.username,
      realname: $scope.user.realname,
      password: $scope.user.password,
      channel: $scope.user.joinCommand,
      command: $scope.user.joinChannel
    });
    //console.log($scope.infos);
    $scope.showForm = true; // Lors de l'envoi du 1er form, on le cache et on affiche le second formulaire
    $scope.showChl = true; // Affiche dans le titre le(s) salon(s) auquel on s'est connecté


    var user1 = $scope.infos[0];
    //console.log(user1.channel);

    event.preventDefault(); // Bloque l'envoi du formulaire
  };

  $scope.sendText = function(event, sender, channel, msg) { // Fonction lors de l'envoi du formulaire de message

    var user1 = $scope.infos[0];

    IRC.sendCommand(user1.command);
    IRC.sendMessage(user1.channel || user1.nickname, $scope.user.message);

    IRC.sendNamesQuery(user1.channel, function(names) {
      console.log(names.join(" "));
      nm.push(names);
    });

    IRC.sendTopicQuery(user1.channel, function(topic) {
      console.log(topic.join(" "));
      $scope.tp.push(topic);
    });

    event.preventDefault(); // Bloque l'envoi du formulaire
  };
});
