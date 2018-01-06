angular.module('app.features.controllers').controller('loginController', ['$scope','$http', '$state','$ionicLoading','$ionicPopup','$ionicNavBarDelegate', '$rootScope',
  function($scope, $http, $state, $ionicLoading, $ionicPopup,$ionicNavBarDelegate, $rootScope) {

  $state.reload();
  $ionicNavBarDelegate.showBackButton(false);

  $scope.load_init = function(){
    swal.close();
    var loggedin = window.localStorage.getItem("LoggedIn");

    console.log(loggedin);
    console.log(typeof loggedin);
    if (loggedin === 'true') {
      console.log("Already Logged in!");
      $state.go('tabsController.projects');
    }
  };

  $scope.login = function (username,password) {

    $ionicLoading.show({
      template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Loading...',
    });

    var obj = {
      token: token,
      username: username,
      password: password
     };

    var usern = $scope.username;

    var request = $http({
        token: token,
        method: "post",
        url: https_url + "/users/login.php",
        data: obj,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

    console.log(request); // log the request

    request.success(function (data) {
        console.log(data);
        $ionicLoading.hide();

        cred = data[0].success;

        switch (cred) {
          case 1:
            try {
              // localStorage stuff
              var username = data[1].player_username;
              window.localStorage.setItem("Username", username);
              $rootScope.username = username;

              var loggedin = true;
              window.localStorage.setItem("LoggedIn", JSON.stringify(loggedin));
              $rootScope.loggedIn = true;

              // fetch Level
              var level = data[1].player_level;
              window.localStorage.setItem("level", level);

              // fetch avatar from JSON
              var avatar = data[1].player_avatar;

              // build avatar string
              avatar = 'img/avatar/' + avatar + '.png';

              console.log("Avatar signing in: " + avatar);
              window.localStorage.setItem("Avatar", avatar);
            } catch (e) {

              $rootScope.popup_notice('Error!');
            } finally {
              $state.reload();

              // reload to reload localstorage variables! TODO maybe this doesnt work in prod

              $state.go('tabsController.projects'); // redirect
              console.log("Logged in as: " + localStorage.getItem("Username"));
            }
            break;
          case 0:
            $rootScope.popup_notice("Wrong credentials");
            break;
          default:
          $rootScope.popup_notice("Wrong credentials");
        }
    });
    request.error(function(data)
    {
      $ionicLoading.hide();
      $rootScope.popup_notice("Connection error");
    });
  };

  $scope.gotoSignup = function() {
    $state.go('signup');
  };
}])
