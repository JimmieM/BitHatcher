angular.module('app.features.controllers').controller('projectController', ['$scope', '$rootScope', '$state','$stateParams' , '$http' , '$ionicLoading', '$ionicPopup',
  function($scope, $rootScope, $state, $stateParams, $http, $ionicLoading, $ionicPopup) {

  $scope.username = localStorage.getItem("Username");
  username_request = localStorage.getItem("Username");

  var project_guide = localStorage.getItem("project_guide");

  if (project_guide === "false" || project_guide === null || project_guide === null || project_guide !== "true" || project_guide === false) {
    // popup with player 2 invite.
    $ionicPopup.show({
      title: "This is your first pet.",
      subTitle: "Start by adding feeding bottles in the top right resource tab. What your pet can eat depends on its stage and type of creature.",
      scope: $rootScope,
      buttons: [
        {
          text: 'Got it!',
          type: 'gradient',
          onTap: function(e) {
            localStorage.setItem("project_guide", "true");
            $state.reload();
          }
        }
      ]
    });
  }

  $scope.reload = function() {
    $rootScope.reloadProject(function() {
       $rootScope.project_variables = $rootScope.project_variables;
   });
  };


  // app global array used to push project contents into from ListController -> ViewProject(), and recieve in projectController..
  $rootScope.project_variables = $rootScope.app.open_project;

  console.log();
  $rootScope.project_attacks = null;

  $rootScope.get_attacks_by_id($rootScope.project_variables.id);

  if ($rootScope.project_variables.player2 !== username) {
    $scope.second_player_name = $rootScope.project_variables.player2;
  } else {
    $scope.second_player_name = $rootScope.project_variables.player1;
  }

  $rootScope.project_variables.foodtype_bird_seed = Number($rootScope.project_variables.foodtype_bird_seed);
  $rootScope.project_variables.foodtype_cooked_steak = Number($rootScope.project_variables.foodtype_cooked_steak);
  $rootScope.project_variables.foodtype_cooked_chicken= Number($rootScope.project_variables.foodtype_cooked_chicken);
  $rootScope.project_variables.foodtype_carrot = Number($rootScope.project_variables.foodtype_carrot);
  $rootScope.project_variables.foodtype_mini_carrot = Number($rootScope.project_variables.foodtype_mini_carrot);
  $rootScope.project_variables.foodtype_water = Number($rootScope.project_variables.foodtype_water);
  $rootScope.project_variables.foodtype_feeding_bottle= Number($rootScope.project_variables.foodtype_feeding_bottle);
  $rootScope.project_variables.foodtype_dog_bone = Number($rootScope.project_variables.foodtype_dog_bone);
  $rootScope.project_variables.foodtype_apple = Number($rootScope.project_variables.foodtype_apple);

  $rootScope.project_variables.player_avatar = $rootScope.build_avatar($rootScope.project_variables.player_avatar);

  $scope.unlocked_foodtype_cooked_steak = false;
  $scope.unlocked_foodtype_cooked_chicken = false;
  //$scope.unlocked_foodtype_raw_steak = false;
  //$scope.unlocked_foodtype_raw_chicken = false;
  $scope.unlocked_foodtype_mini_carrot = false;
  $scope.unlocked_foodtype_carrot = false;
  $scope.unlocked_foodtype_apple = false;
  $scope.unlocked_foodtype_bird_seed = false;
  $scope.unlocked_foodtype_dog_bone = false;
  $scope.unlocked_foodtype_water = false;
  $scope.unlocked_foodtype_feeding_bottle = false;

  // determine the creature, also if certain foodtypes are allowed to feed with depending on creature and stage.
  if (Number($rootScope.project_variables.stage) >= 1) {
    $scope.unlocked_foodtype_mini_carrot = true;
    $scope.unlocked_foodtype_feeding_bottle = true;
  }
  if (Number($rootScope.project_variables.stage) >= 2) {
    $scope.unlocked_foodtype_feeding_bottle = false;
    $scope.unlocked_foodtype_carrot = true;
    $scope.unlocked_foodtype_apple = true;
  }
  // result. In stage 2, both steak and mini carrots are allowed..
  if (Number($rootScope.project_variables.stage) >= 3) {
    $scope.unlocked_foodtype_cooked_steak = true;
    $scope.unlocked_foodtype_cooked_chicken = true;
  }

  if (Number($rootScope.project_variables.egg_creature) === 1) { // bird
    if (Number($rootScope.project_variables.stage) >= 1) {
      $scope.unlocked_foodtype_bird_seed = true; // unlock foodtype.
      $scope.unlocked_foodtype_mini_carrot = true;
      $scope.unlocked_foodtype_feeding_bottle = true;
    }

  }

  if ($rootScope.app.open_project.name === undefined) {
    $state.go('tabsController.projects');
    $state.refresh();
  } else {
    console.log($rootScope.project_variables.name);
    console.log("Loading Project...");
  }

  // create view functions..

  // egg variables handeled by $scope variables above
  // if it's an egg..
  if ($rootScope.app.open_project.egg_creature === '1' && $rootScope.app.open_project.stage === '1') {
      // present waiting for hatch button
      $scope.egg = true;

  } else {
    $scope.action_feed = true;
    $scope.action_water = true;
    $scope.action_pet = true;

  }

  var player_id = localStorage.getItem("Id");

$scope.feed = function(project_id,foodtype, foodtype_string) {

  var obj = {
    token: token,
    username_request: username_request,
    player_id: player_id,
    foodtype: foodtype, // steak for example == foodtype: 0;
    project_id: project_id
  };

  var request = $http({
    method: "post",
    url: https_url + "/projects/project_actions/feed.php",
    data: obj,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

    request.success(function(response) {
      console.log("Feeding creature..");
      console.log(response);

      if (response.success === 1) {
        // $ionicLoading.show({
        //   template: "<a class='ion-ios-nutrition icon'></a>",
        //   duration: 6000
        //   // 1200
        // });

        // update project_variables scope.
        for (var key in $rootScope.project_variables) {
          if (key == foodtype_string) {
              $rootScope.project_variables[key] = $rootScope.project_variables[key] - 1;
              break;
          }
        }

        // fetch returned stats...
        $rootScope.project_variables.health = response.health;
        $rootScope.project_variables.energy = response.energy;
        $rootScope.project_variables.agility = response.agility;
        $rootScope.project_variables.strength = response.strength;

        $rootScope.project_variables.overfeeding = response.overfeeding;

        if ((response.overfeeding >= 5) && (response.health >= 99)) {
          $rootScope.popup_notice('Calm down!', "You're overfeeding your pet. This behaviour will slowly kill your pet!");
        }

        // try to parse the returned foodtype to update the remaining of it.
        //$rootScope.project_variables =$rootScope.reloadProject();

        $rootScope.reloadProject(function() {
           $rootScope.project_variables = $rootScope.project_variables;
       });

       console.log(response['achievement']);
       $rootScope.earnedAchievement(response['achievement']);
      }

      if (response.success === 0) {

        $rootScope.popup_notice('Server returned a bad response', response.error_log + ' query=>' + response.mysqli_error);
      }

    });

    request.error(function (response) {
      console.log("error feeding...");
      console.debug(response);
    });
  };

  $scope.goTo = function(state){
    $state.go(state);
  };

  $scope.toggle_menu = function(menu) {
    console.log($scope.action_menu_water);
    $scope.action_menu_water = $scope.action_menu_water = false;
    $scope.action_menu_food = $scope.action_menu_food = false;
    $scope.action_menu = $scope.action_menu = true;

    // close module
    if (menu === 0) {
      $scope.action_menu = $scope.action_menu !== true;
      $scope.action_menu_food = $scope.action_menu_food = false;
      $scope.action_menu.water = $scope.action_menu_water = false;
    }
    switch (menu) {
      case 'food':
            $scope.action_menu_food = $scope.action_menu_food !== true;
        break;
      case 'water':
            $scope.action_menu_water = $scope.action_menu_water !== true;
        break;
      default:
    }
  };
}])
