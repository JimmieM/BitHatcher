angular.module('app.features.controllers')
.controller('achievementsController', ['$scope','$http', '$state' , '$rootScope', '$ionicPopup',
  function($scope, $http, $state, $rootScope, $ionicPopup) {

  $scope.init = function() {
    var obj = {
      token: token,
      username_request: $rootScope.username,
    };

    var request = $http({
      method: "post",
      url: https_url + "/achievements/fetch_achievements.php",
      data: obj,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    request.success(function (response) {
      console.log(response);

      if (response['success']) {
        $scope.base_achievements = response['achievements']['achievements'];

        if ($scope.base_achievements !== null || $scope.base_achievements.length > 0) {
            $scope.switch_view('pets');
        }
      } else {
        $rootScope.popup_notice("Couldn't load achievements");
      }
    });
  };

  $scope.switch_view = function(string) {
    $scope.title = string;
    $scope.achievements = $scope.base_achievements[string]
    switch (string) {
      case 'player':
          $scope.player = true;
          $scope.pets = false;
          console.log($scope.player);
        break;
      case 'pets':
          $scope.player = false;
          $scope.pets = true;
        break;
    }

    console.log($scope.achievements);

  };
}]);
