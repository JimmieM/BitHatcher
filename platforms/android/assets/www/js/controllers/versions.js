angular.module('app.features.controllers').controller('versionsController', ['$scope', '$rootScope', '$state','$stateParams' , '$http' , '$ionicLoading', '$ionicPopup',
  function($scope, $rootScope, $state, $stateParams, $http, $ionicLoading, $ionicPopup) {

  $scope.load_versions = function() {
    var obj = {
      token: token, // TODO: Change this later to a more secure token ples.
      username_request: $rootScope.username,
    };

    var request = $http({
      method: "post",
      url: https_url + "/app_versions/app_versions.php",
      data: obj,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    request.success(function (response) {
      if (response.success === 1) {
        console.log(response);
        $scope.versions = response.versions;
      } else {
        $rootScope.popup_notice("Error", "Error log: " + response.error);
      }

    });
  };

  $scope.show_version = function(version_number, published_at) {
    var version_body = '';
    for (var i = 0; i < $scope.versions.length; i++) {
      if (version_number == $scope.versions[i].version_number) {
        version_body = $scope.versions[i].version_body;
        version_body = version_body.replace(/(\r\n|\n|\r)/gm, "<br>");
        break;
      }
    }
    $rootScope.popup_notice(version_number + ', release date: ' + published_at, version_body);
  };
}]);
