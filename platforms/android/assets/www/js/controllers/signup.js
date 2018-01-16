angular.module('app.features.controllers').controller('signupController', ['$scope','$http','$state','$rootScope' ,'$ionicPopup' ,'$ionicLoading',
function($scope, $http, $state, $rootScope, $ionicPopup, $ionicLoading) {

  $scope.disabled = false;

  $scope.platform = localStorage.getItem("Platform");

  $scope.gender_img = 'img/avatar/male.png';

  // prepare dropdown list for creature
  $scope.genders = ["Male", "Female", "Prefer not to say"];
  $scope.signup_gender = {};
  // start the select as default on first object
  $scope.signup_gender.index = 0;

  $scope.gender_changed_select = function(gender) {
    switch ($scope.signup_gender.index) {
      case 0:
          $scope.gender_img = 'male';
        break;
      case 1:
          $scope.gender_img = 'female';
        break;
      case 2:
          $scope.gender_img = 'other';
        break;
    }

    $scope.gender_img = 'img/avatar/' + $scope.gender_img + '.png';
  };

  $scope.goToTerms = function() {
    $state.go('terms');
  }

  $scope.validateEmail = function(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };


  $scope.signup = function(email, username, password) {

    //$scope.disabled = true;

    console.log(username, password, email);
    x = 1;
    if((username === undefined) || (password === undefined) || (email === undefined) || ($scope.gender === 0)) {
      $rootScope.popup_notice('One or several fields are empty.');
    } else {

      var email_check = false;
      var username_check = false;
      var password_check = false;

      // check email regex etc.
      if ($scope.validateEmail(email)) {
        email_check = true;
      } else {
        $rootScope.popup_notice('Invalid email.');
      }

      if (username.length < 3) {
        $rootScope.popup_notice('Your username has to be atleast 3 characters.');
      } else if(username.length > 15) {
        $rootScope.popup_notice('Your username can not be longer than 15 characters.');
      } else {
        username_check = true;
        username = username.split(" ").join("");
      }

      if (password.length < 6) {
        $rootScope.popup_notice('Your password has to be atleast 6 characters.');
      } else {
        password_check = true;
      }

      if (email_check && username_check && password_check) {
        var obj = {
            token: token,
            username: username,
            password: password,
            email: email,
            platform: $scope.platform,
            gender: $scope.signup_gender.index
         };
1
         console.log(obj);

          var request = $http({
            method: "post",
            url: https_url + "/users/signup.php",
            data: obj,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        $ionicLoading.show({
          template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Loading...',
        });

        request.success(function (data) {
            console.log(data);
            $ionicLoading.hide();

            cred = data[0].success;

            switch (cred) {
              case 1:
                var username = data[0].player_username;
                // localStorage stuff
                localStorage.setItem("Username", username);

                var loggedin = true;
                localStorage.setItem("LoggedIn", JSON.stringify(loggedin));
                $rootScope.LoggedIn = true;

                // fetch Level
                var level = data[0].player_level;
                localStorage.setItem("level", level);
                console.log(level);

                // fetch avatar from JSON
                var avatar = data[0].player_avatar;

                // build avatar string
                avatar = 'img/avatar/' + avatar + '.png';

                console.log("Avatar signing in: " + avatar);
                window.localStorage.setItem("Avatar", avatar);

                $ionicPopup.show({
                  title: "Welcome, " + username,
                  scope: $rootScope,
                  buttons: [
                    {
                      text: 'Continue',
                      type: 'gradient',
                      onTap: function(e) {
                        $state.reload();
                        $state.go('tabsController.projects'); // redirect
                      }
                    }
                  ]
                });

                break;
              case 0:
                  if (data[0].re_log == 1) {
                    $rootScope.popup_notice("A problem occured, please sign in with your new credentials",'','', $state.go('login'));
                  }
                  if(data[0].user_exist == 1) {
                    $rootScope.popup_notice("That username already exist.");
                    $scope.disabled = false;
                  }
                break;
              default:

            }
        });
        request.error(function(data) {
          $ionicLoading.hide();
          $rootScope.popup_notice("There was an error.. " + data);
        });
      }
    }
  };
}])
