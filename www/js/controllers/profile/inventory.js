angular.module('app.features.controllers').controller('inventoryController', ['$scope','$http', '$state', '$rootScope',
  function($scope, $http, $state, $rootScope) {
  $scope.user_inventory = $rootScope.user_inventory;
}]);
