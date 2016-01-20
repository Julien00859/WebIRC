// Module principale
var main = angular.module("main", ["chatIrc"]);
// Dépendance du module principale
var chatIrc = angular.module("chatIrc", []);
// Controlleur du module chatIrc
chatIrc.controller("fieldsController", function($scope) {
  $scope.infos = {};
  $scope.showTextField = function(user) {
    $scope.infos = angular.copy(user);
    console.log($scope.infos);
    $scope.showTypeMsg = true;
    $scope.showForm = true;
  }
});
