angular.module('app.features.controllers').// dynamic guide controllers
  controller('guideController', ['$scope','$state','$stateParams',
  function($scope, $state, $stateParams) {

  $scope.moveOn = function(page){
    // check if the user is on the fourth page, and passing to login screen.
    if (page === 'login') {
      var guideCompleted = true;
      localStorage.setItem("GuideCompletion", JSON.stringify(guideCompleted));
    }
    // goto page sent in my Page param by each guide views.
    $state.go(page);
  };
}]);
