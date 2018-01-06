angular.module('app.features.controllers').controller('allUsersController', ['$ionicScrollDelegate','$scope', '$state', '$stateParams' ,'$http' ,'$ionicLoading' ,'$rootScope',
function($ionicScrollDelegate, $scope, $state, $stateParams, $http,$ionicLoading, $rootScope) {

  $rootScope.users_view = 'friends';
  var update;

  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.switch_view($rootScope.users_view);

    $ionicScrollDelegate.scrollTop();
 });

  $scope.$on('$ionicView.afterLeave', function(){
    // has left Controller.
    clearTimeout(update);
  });



  $scope.chat = function(player2_username) {
    $rootScope.enterChat(player2_username);
  };

  $scope.switch_view = function(string) {

    switch (string) {
      case 'friends':
          $scope.title = 'Friends';
          $rootScope.users_view = 'friends';
          $scope.search = 'Search through your friends';
          $scope.updateFriends();

        break;

      case 'all_users':
          $scope.title = 'All users';
          $rootScope.users_view = 'all_users';
          $scope.search = 'Search through all users';
          $scope.updateUsers();

        break;
      default:
    }

  };

  $scope.updateFriends = function(timeout = false) {
    if (!timeout) {
      $rootScope.chat.player2 = ''; // clear chat cache.
    }

    var obj = {
      token: token,
      username_request: $rootScope.username,
     };

    var request = $http({
      token: token,
      method: "post",
      url: https_url + "/users/friends/get_friends.php",
      data: obj,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    request.success(function (data) {
      console.log(data);
      if (data !== null || data !== undefined) {
        if (data.success == 1) {
          data = data.friends;
          $scope.success = true;
          for (var i = 0; i < data.length; i++) {
            $scope.all_users = data;
            // if ($scope.all_users == undefined) {
            //   $scope.all_users = data;
            // } else {
            //   $scope.all_users[i].is_online = data[i].is_online;
            //   $scope.all_users[i].chat_notifications = data[i].chat_notifications;
            // }
          }
        } else {
          console.log("crash");
          $scope.success = false;
          $scope.error = data.error;
        }
      }

      console.log(data);

      // update = setTimeout(function() {
      //   $scope.updateUsers(true);
      // }, 4000);
    });

    request.finally(function() {
      $rootScope.$broadcast('scroll.refreshComplete');
    });


  };


  $scope.updateUsers = function(timeout = false) {

    if (!timeout) {
      $rootScope.chat.player2 = ''; // clear chat cache.
    }

    var obj = {
      token: token,
      username_request: $rootScope.username,
      get_all_users: true
     };

    var request = $http({
      token: token,
      method: "post",
      url: https_url + "/users/status/online_players.php",
      data: obj,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    request.success(function (data) {
      console.log(data);
      if (data !== null || data !== undefined) {
        $scope.success = true;
        for (var i = 0; i < data.length; i++) {
          $scope.all_users = data;
          // if ($scope.all_users == undefined) {
          //   $scope.all_users = data;
          // } else {
          //   $scope.all_users[i].is_online = data[i].is_online;
          //   $scope.all_users[i].chat_notifications = data[i].chat_notifications;
          // }
        }

        if (data == $scope.all_users) {
          console.log("No changes..");
        }
      }

      console.log(data);

      // update = setTimeout(function() {
      //   $scope.updateUsers(true);
      // }, 4000);
    });

    request.finally(function() {
      $rootScope.$broadcast('scroll.refreshComplete');
    });


  };

}]);
