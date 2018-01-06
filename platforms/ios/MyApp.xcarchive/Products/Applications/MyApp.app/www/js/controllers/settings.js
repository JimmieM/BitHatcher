angular.module('app.features.controllers').controller('settingsController', ['$scope','$rootScope', '$state', '$http', '$ionicPopup','$cordovaSocialSharing' ,'$cordovaAppVersion' ,
  function($scope, $rootScope, $state, $http, $ionicPopup,$cordovaSocialSharing,$cordovaAppVersion) {

    document.addEventListener('deviceready', function () {

      cordova.getAppVersion.getVersionNumber(function(value) {
        $scope.appVersion = value;
        $rootScope.appVersion = value;
      });
      cordova.getAppVersion.getAppName().then(function (appname) {
        $scope.appName = appname;
      });
    });


  $scope.goTo = function(state) {
    $state.go(state);
  };

  console.log($scope.appPackage + ' : ' + $scope.appBuild + ' : ' + $scope.appName + ' : ' + $scope.appVersion);

  $scope.share = function(message = 'BitHatcher', subject = 'Check out BitHatcher, available for Android and iOS!', file= '', link= '') {
    $cordovaSocialSharing
      .share(message, subject, file, link) // Share via native share sheet
      .then(function(result) {
      }, function(err) {
        $rootScope.popup_notice('Error','Something went wrong..');
      });
  };

  $scope.feedback = function(message = '', subject = 'BitHatcher Feedback from: ' + username,toArr = ['bithatcher.com@gmail.com'], ccArr = ['bithatcher.com@gmail.com'],bccArr = ['bithatcher.com@gmail.com'], file = '') {
    $cordovaSocialSharing
    .shareViaEmail(message, subject, toArr, ccArr, bccArr, file)
    .then(function(result) {
      $rootScope.popup_notice('Thank you for the feedback!','');
    }, function(err) {
      $rootScope.popup_notice('Error','Something went wrong..');
    });
  };

  // logout function
  $scope.logout = function() {

    $ionicPopup.show({
      title:'Logout?',
      subTitle: 'Are you sure?',
      scope: $rootScope,
      buttons: [{
        text: 'Cancel',
        type: 'button-default',
        onTap: function (e) {

        }
       }, {
       text: 'Logout',
       type: 'gradient',
       onTap: function (e) {
         console.log("logging out");

         localStorage.clear();

         $rootScope = $rootScope.$new(true);
         $scope = $scope.$new(true);

         localStorage.removeItem("Username");
         var loggedIn = false;
         localStorage.setItem("LoggedIn", JSON.stringify(loggedIn));
         $rootScope.LoggedIn = false;

         localStorage.removeItem("Avatar");

         if (!localStorage.getItem("Username")) {
           $state.reload();
           $state.go('login'); // redirect to login page.
         }
       }
     }]
    });
  };
}]);
