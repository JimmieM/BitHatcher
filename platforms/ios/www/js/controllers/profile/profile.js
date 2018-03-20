angular.module('app.features.controllers').controller('profileController', ['$scope','$rootScope','$http', '$state' , '$stateParams','$ionicPlatform' , '$ionicLoading','$ionicPopup' ,
function($scope, $rootScope, $http, $state, $stateParams, $ionicPlatform, $ionicLoading, $ionicPopup) {

  $scope.goToUsers = function() {
    $state.go('tabsController.users');
  };

  $scope.view_profile = $rootScope.view_profile;

  $rootScope.view_profile.player_avatar = $scope.build_avatar($rootScope.view_profile.player_avatar);

  $scope.is_friend = $scope.view_profile.player_is_a_friend;

  $scope.online = false;


  if ($scope.view_profile.player_is_online == true) {
    $scope.online = true;
  }

  $scope.render_achievements = function(achievements) {
    if (achievements.success === 1) {
      if (achievements.empty === 0) {
        $scope.achievements = JSON.parse(achievements.achievements);
      }
    }
  };

  $scope.render_achievements($scope.view_profile.achievements);

  $scope.battle = function() {
    var obj = {
      token: token,
      username_request: $rootScope.username,
      username_battle: $scope.view_profile.player_username
     };

    var request = $http({
      token: token,
      method: "post",
      url: https_url + "/battle/new_battle.php",
      data: obj,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    request.success(function(data) {
      console.log(data);
      if (data.success == 1) {
        $scope.is_friend = true;
        $rootScope.popup_notice(username_add + ' is now your friend');
      } else {
        $rootScope.popup_notice('Unexpected error', 'Error: ' + data.error);
      }
    });
  };

  $scope.add_friend = function(username_add) {
    if (!$scope.is_friend) {
      var obj = {
        token: token,
        username_request: $rootScope.username,
        username_add: username_add,
       };

      var request = $http({
        token: token,
        method: "post",
        url: https_url + "/users/friends/add_friend.php",
        data: obj,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      request.success(function(data) {
        console.log(data);
        if (data.success == 1) {
          $scope.is_friend = true;
          $rootScope.popup_notice(username_add + ' is now your friend');
        } else {
          $rootScope.popup_notice('Unexpected error', 'Error: ' + data.error);
        }
      });
    } else {
      $rootScope.popup_notice("You're already friends with " + username_add);
    }

  };

}])
