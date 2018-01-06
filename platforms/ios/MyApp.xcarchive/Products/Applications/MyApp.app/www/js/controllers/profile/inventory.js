angular.module('app.features.controllers').controller('inventoryController', ['$scope','$http', '$state',
  function($scope, $http, $state) {
  $scope.user_inventory = $rootScope.user_inventory[0];

  // $scope.goTo = function(route) {
  //   $state.go(route);
  // };
}]);
