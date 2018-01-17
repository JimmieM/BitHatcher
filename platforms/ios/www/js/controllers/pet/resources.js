angular.module('app.features.controllers').controller('resourcesController', ['$scope', '$rootScope', '$state', '$http', '$ionicPopup', '$ionicLoading',
  function($scope, $rootScope, $state, $http, $ionicPopup, $ionicLoading) {

  var projectresource_guide = localStorage.getItem("projectresource_guide");

  if (projectresource_guide === "false" || projectresource_guide === undefined || projectresource_guide === null || projectresource_guide !== "true" || projectresource_guide === false) {
    // popup with player 2 invite.
    $ionicPopup.show({
      title: 'This is your pets resources',
      subTitle: "By investing in your pet and regularly feeding it and signing it up for battles, you add resources from your own inventory.",
      scope: $rootScope,
      buttons: [
        {
          text: 'Got it!',
          type: 'gradient',
          onTap: function(e) {
            localStorage.setItem("projectresource_guide", "true");
            $state.reload();

          }
        }
      ]
    });
  }

  $scope.init = function() {
    $scope.resources = true;
  };

  $scope.purchase_attack = function(sql_name, name, cost) {

    $ionicPopup.show({
      title: 'Purchase ' + name + ' for ' + cost + ' BitFunds?',
      subTitle: "This attack will only be usable with this pet.",
      scope: $rootScope,
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Purchase',
          type: 'gradient',
          onTap: function(e) {
            obj = {
              token: token,
              username: $rootScope.username,
              project_id: $rootScope.app.open_project.id,
              sql_name: sql_name
            };

            var request = $http({
              method: "post",
              url: https_url + "/projects/project_attacks/unlock_attack.php",
              data: obj,
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            request.success(function(response) {
              if (response.success === 1) {
                $rootScope.popup_notice('Successfully purchased ' + name);

                // recall the fetch_attacks.
                $scope.get_attacks_by_id($rootScope.app.open_project.id);
                $state.reload();
              }
            });

          }
        }
      ]
    });
  };

  $scope.switch_view = function(string) {
    switch (string) {
      case 'attacks':
          $scope.title = 'Attacks';
          $rootScope.get_attacks_by_id($rootScope.app.open_project.id);
          $scope.attacks = true;
          $scope.resources = false;
        break;

      case 'resources':
          $scope.title = 'Resources';
          $scope.attacks = false;
          $scope.resources = true;
        break;
      default:
    }

  };

  // app global array used to push project contents into from ListController -> ViewProject(), and recieve in projectController..

  $scope.viewFoodType = function(foodtype) {

    var health_standard;
    var agility_standard;
    var strength_standard;
    var energy_standard;

    switch (foodtype) {
      case 'cooked_steak':
          health_standard = 20;
          agility_standard = 5;
          strength_standard = 20;
          energy_standard = 40;
        break;
      default:

    }


    // .. what the food will give.
    switch ($rootScope.project_variables.creature) {
      case "Fox":
          var health = health_standard + 20;
          var agility = agility_standard + 15;
          var strength = agility_standard + 40;
          var energy = energy_standard + 30;

          swal(foodtype,
          "Health:" + health + "\n" +
          "Energy: " + energy + "\n" +
          "Agility: " + agility + "\n");
        break;

      case "Bird":
          $scope.foodtype_cooked_meat_health = "20";
          $scope.foodtype_cooked_meat_agility = "15";
          $scope.foodtype_cooked_meat_strength = "40";
          $scope.foodtype_cooked_meat_energy = "30";
        break;
      default:

    }

  };


  $scope.addResources = function(foodstring, indextype, foodtype_string) {
    // get param for foodtype
    // send to Server
    // - player resurce || + project resource.


    // fetch the USERS resources from inventory array..

    $scope.available_user_resources = user_inventory[0];

    var foodtype_amount_available;

    // get what YOU as user have in inventory
    switch (indextype) {
      // foodtypes
      case 0.1:
           foodtype_amount_available = $scope.available_user_resources.player_foodtype_cooked_steak;
        break;
      case 1.1:
          foodtype_amount_available = $scope.available_user_resources.player_foodtype_cooked_chicken;
        break;
      case 2.0:
          foodtype_amount_available = $scope.available_user_resources.player_foodtype_carrot;
        break;
      case 2.1:
          foodtype_amount_available = $scope.available_user_resources.player_foodtype_mini_carrot;
        break;

      case 3.0:
          foodtype_amount_available = $scope.available_user_resources.player_foodtype_bird_seed;
        break;

      case 4.0:
          foodtype_amount_available = $scope.available_user_resources.player_foodtype_apple;
        break;

      // water
      case 5.0:
          foodtype_amount_available = $scope.available_user_resources.player_foodtype_water;
        break;

      // treats
      case 5.1:
        foodtype_amount_available = $scope.available_user_resources.player_treattype_dogbone;
      break;
    }

    $rootScope.input = {
      value: 1,
    };

    if (foodtype_amount_available >= 1) {
      // do request

      username_request = localStorage.getItem("Username");

      resource = {
        token: token, // TODO: Change this later to a more secure token ples.
        username_request: username_request,
        resource_item_name: indextype, // steak for example == foodtype: 0.1;
        resource_item_amount: 1,
        project_id: $rootScope.project_variables.id
      };

      var request = $http({
        method: "post",
        url: https_url + "/projects/project_actions/add_resources.php",
        data: resource,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      request.success(function (response) {
        if (response.success === 1) {
          console.log($rootScope.project_variables[foodtype_string]);
          $rootScope.fetchUserData();
          $rootScope.reloadProject();
        } else {
          $rootScope.popup_notice("Error", "Error log: " + response.error_log);
        }

      });
    } else {
      $ionicLoading.show({
        template: 'You have 0 '+ foodstring  ,
        duration: 1500
      });
    }
    $rootScope.max = Number(foodtype_amount_available);
  };

}]);
