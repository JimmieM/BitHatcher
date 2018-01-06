angular.module('app.features.controllers').controller('userResourcesController', ['$scope','$http', '$state' , '$rootScope', '$ionicPopup',
  function($scope, $http, $state, $rootScope, $ionicPopup) {

  var resource_guide = localStorage.getItem("resource_guide");
  if (resource_guide === "false" || resource_guide === undefined || resource_guide === null || resource_guide !== "true" || resource_guide === false) {
    // popup with player 2 invite.
    $ionicPopup.show({
      title: 'This is your resources in your inventory.',
      subTitle: "You'll start of with different amounts of each food type",
      scope: $rootScope,
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Got it!',
          type: 'gradient',
          onTap: function(e) {
            localStorage.setItem("resource_guide", "true");
            $state.reload();

          }
        }
      ]
    });
  }


  // grab resoucrs from user_inventory array..
  $scope.user_resources = user_inventory[0];


  // food
  $scope.foodtype_carrot = $scope.user_resources.player_foodtype_carrot;
  $scope.foodtype_mini_carrot = $scope.user_resources.player_foodtype_mini_carrot;
  $scope.foodtype_bird_seed = $scope.user_resources.player_foodtype_bird_seed;
  $scope.foodtype_apple = $scope.user_resources.player_foodtype_apple;

  $scope.foodtype_cooked_steak = $scope.user_resources.player_foodtype_cooked_steak;
  $scope.foodtype_raw_steak = $scope.user_resources.player_foodtype_raw_steak;

  $scope.foodtype_cooked_chicken = $scope.user_resources.player_foodtype_cooked_chicken;
  $scope.foodtype_raw_chicken = $scope.user_resources.player_foodtype_raw_chicken;

  // drinks
  $scope.foodtype_water = $scope.user_resources.player_foodtype_water;
  $scope.foodtype_feeding_bottle = $scope.user_resources.player_foodtype_feeding_bottle;

  // cooking stuff
  $scope.cooktype_charcoal = $scope.user_resources.player_cooktype_charcoal;
  $scope.cooktype_spices_spicy = $scope.user_resources.player_cooktype_spices_spicy;
  $scope.cooktype_spices_barbeque = $scope.user_resources.player_cooktype_spices_barbeque;
  $scope.charcoal_lightened_date = $scope.user_resources.player_charcoal_lightened_date;

  // potions

  $scope.potiontype_revival = $scope.user_resources.player_potiontype_revival;
  $scope.potiontype_health = $scope.user_resources.player_potiontype_health;
  $scope.potiontype_energy = $scope.user_resources.player_potiontype_energy;
  $scope.potiontype_agility = $scope.user_resources.player_potiontype_agility;
  $scope.potiontype_strength = $scope.user_resources.player_potiontype_strength;
  $scope.potiontype_happiness = $scope.user_resources.player_potiontype_happiness;


  // click popup
  $scope.resourceInformation = function(resource) {

  var resource_description;
  var resource_image;

  console.log(resource);

    switch (resource) {
      case 'Water':
        resource_description = "Water is used to give your creature or plant water.";
        resource_image = "http://piq.codeus.net/static/media/userpics/piq_129453_400x400.png";
        break;
      case 'Food':
        resource_description = "Use any kind of food to feed your creature. In that way, it won't die.";
        resource_image = "http://rs385.pbsrc.com/albums/oo296/EmO_TEnTAi/HRM%20pixels/MeatPixel.gif~c200";
        break;
      case 'Potion':
        resource_description = "Potions help your pet to remain its stats.";
        resource_image = "http://piq.codeus.net/static/media/userpics/piq_81320_400x400.png";
        break;
      case 'Spices':
        resource_description = "Adding spices when cooking the food will increase the stats given to the animal.";
        resource_image = "http://piq.codeus.net/static/media/userpics/piq_81320_400x400.png";
        break;
      default:

    }

    swal({
      title: resource,
      text: resource_description,
      imageUrl: resource_image
    });
  };

}]);
