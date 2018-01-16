angular.module('app.features.controllers').controller('recoverController', ['$scope','$http', '$state','$ionicLoading','$ionicPopup','$ionicNavBarDelegate', '$rootScope',
  function($scope, $http, $state, $ionicLoading, $ionicPopup,$ionicNavBarDelegate, $rootScope) {

  $scope.recover = function (email, password) {

    $ionicLoading.show({
      template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Loading...',
    });

    var obj = {
      token: token,
      email: email,
      new_password: password
     };

    var request = $http({
        token: token,
        method: "post",
        url: https_url + "/users/restore_password.php",
        data: obj,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

    console.log(request); // log the request

    request.success(function (data) {
        console.log(data);
        $ionicLoading.hide();

    });
    request.error(function(data)
    {
      $ionicLoading.hide();
      $rootScope.popup_notice("Connection error");
    });
  };

}]);
