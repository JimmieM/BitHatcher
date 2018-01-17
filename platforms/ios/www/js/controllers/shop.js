angular.module('app.features.controllers').controller('shopController', ['$scope','$http', '$state', '$stateParams','$ionicPlatform' , '$rootScope' , '$ionicLoading', '$ionicPopup' , '$ionicModal' ,
  function($scope, $http, $state, $stateParams, $ionicPlatform, $rootScope, $ionicLoading, $ionicPopup, $ionicModal) {


  // localStorage variables for the first time in app..
  //shop_guide = localStorage.getItem("shop_guide");

  // localStorage variables for the first time in app..
  var shop_guide = localStorage.getItem("shop_guide");

  if (shop_guide === "false" || shop_guide === undefined || shop_guide === null || shop_guide !== "true" || shop_guide === false) {
    // popup with player 2 invite.
    $ionicPopup.show({
      title: 'Spend your BitFunds to purchase pets and food, you got 150 BitFunds.',
      subTitle: "You'll gain most of your BitFunds entering battles against other users, but also by achievements.",
      scope: $rootScope,
      buttons: [
        {
          text: 'Got it!',
          type: 'gradient',
          onTap: function(e) {
            localStorage.setItem("shop_guide", "true");
            $state.reload();

          }
        }
      ]
    });
  }


  $scope.user_inventory = $rootScope.user_inventory;

  $scope.purchase_item = function(item_string, purchase_item, pet = false, egg_creature = false) {

    // intiate to fetch ALL users. Used for inviting another player..
    $scope.fetchUsers();

    if (pet) {
      // start prices for a specific pet.
      switch (purchase_item) {
        case 1: // bird
          $scope.price = 40;
          break;

        case 2: // fox
          $scope.price = 55;
          break;

        case 3: // bunny
          $scope.price = 40;
          break;

        case 4:
          $scope.price = 60;
          break;
        case 5:  // squirell
          $scope.price = 70;
          break;
        case 6: // sea srurtle
          $scope.price = 125;
          break;
        default:

      }

      console.log("item:" + purchase_item);

      // stage picker by options
      $rootScope.pet_stage = {
        stage: 1,
      };


      // get input value for the pets name
      $rootScope.pet_name = {
        value: null,
      };

      // get input value for the player2s name
      // TODO this should be authenticated.
      $rootScope.pet_player2 = {
        value: '',
      };

      // TODO

      //give HTML stage options the price STATICS
      $rootScope.pet_stage1_price = $scope.price;
      $rootScope.pet_stage2_price = $scope.price * 2;
      $rootScope.pet_stage3_price = $scope.price * 3;
      $rootScope.pet_stage4_price = null;
      if (egg_creature) {
        $rootScope.pet_stage4_price = $scope.price * 4;
      }
      // disable stage option if not affordable.


      // disable pet_stages choices if they cannot be afforded.
      if ($scope.user_inventory.player_bitfunds < ($scope.price * 2)) {
        $scope.pet_highend_stages = false;
      } else {
        $scope.pet_highend_stages = true;
      }

      if ($scope.user_inventory.player_bitfunds >= $scope.price) {
        $ionicPopup.show({
          templateUrl: 'pet_purchase_popup.html',
          title: 'Pet options for your new ' + item_string,
          subTitle: '',
          scope: $rootScope,
          buttons: [
            { text: 'Cancel' },
            {
              text: 'Continue',
              attr: 'data-ng-disabled="pet_name.value === null',
              type: 'gradient',
              onTap: function(e) {
                if ($scope.pet_name.value === null) {
                  e.preventDefault();
                } else {
                  $rootScope.totalPrice = $rootScope.pet_stage.stage * $scope.price;

                  // popup with player 2 invite.
                  $ionicPopup.show({
                    title: 'Invite another player to join your pet',
                    templateUrl: 'pet_player2_popup.html',
                    scope: $rootScope,
                    buttons: [
                      { text: 'Cancel' },
                      {
                        text: 'Continue',
                        type: 'gradient',
                        onTap: function(e) {

                          // confirm purchasehere.
                          $ionicPopup.show({
                            title: 'Are you sure to purchase following item for ' + $rootScope.totalPrice + ' BitFunds?',
                            subTitle: item_string + ' stage ' + $scope.pet_stage.stage + ' shared with ' + $scope.pet_player2.value,
                            scope: $rootScope,
                            buttons: [
                              { text: 'Cancel' },
                              {
                                text: 'Confim purchase',
                                type: 'gradient',
                                onTap: function(e) {

                                  var obj = {
                                    token:token,
                                    username_request: username,
                                    purchase_item: purchase_item,

                                    // pet specifics
                                    purchase_pet: pet,
                                    pet_name: $scope.pet_name.value,
                                    player2: $scope.pet_player2.value,
                                    pet_stage: $scope.pet_stage.stage,
                                    total_price: $rootScope.totalPrice
                                   };

                                  console.log(obj);

                                  var request = $http({
                                    method: "post",
                                    url: https_url + "/shop/shop.php",
                                    data: obj,
                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                                  });

                                  $ionicLoading.show({
                                    template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Purchasing...',
                                  });

                                  request.success(function(data) {
                                    // reload user data to get new bitfunds..
                                    console.log(data);
                                    $scope.purchase_completed(data);
                                  });
                                  request.error(function(data){
                                    $ionicLoading.hide();
                                    console.log(data);
                                  });
                                }
                              }
                            ]
                          });
                        }
                      }
                    ]
                  });
                }
              }
            }
          ]
        });
      } else {
        $rootScope.popup_notice("You don't have enough BitFunds");
      }
    } else {
      // food bundle
      $rootScope.totalPrice = 15;

      // if user can afford.
      if ($scope.user_inventory.player_bitfunds >= $rootScope.totalPrice) {
        $ionicPopup.show({
          title: 'Are you sure to purchase a food bundle for ' + $rootScope.totalPrice + ' BitFunds?',
          scope: $rootScope,
          buttons: [
            { text: 'Cancel' },
            {
              text: 'Confim purchase',
              type: 'gradient',
              onTap: function(e) {

                var obj = {
                  token:token,
                  username_request: username,
                  purchase_item: purchase_item,
                  total_price: $rootScope.totalPrice
                 };

                console.log(obj);

                var request = $http({
                  method: "post",
                  url: https_url + "/shop/shop.php",
                  data: obj,
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                $ionicLoading.show({
                  template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Purchasing...',
                });

                request.success(function(data) {
                  $scope.purchase_completed(data);
                });
                request.error(function(data){
                  $ionicLoading.hide();
                  console.log(data);
                });
              }
            }
          ]
        });
      } else {
        // cant afford.
        $rootScope.popup_notice("You don't have enough BitFunds for this purchase", "");
      }

    }
  };

  $scope.purchase_completed = function(data) {
    $ionicLoading.hide();
    console.log(data);

    console.log("After reload!");
    console.log($rootScope.user_inventory);

    if (data.success === 1) {
      // successfull purchase.
      if (data[0].all_resources === null || data[0].all_resources === undefined || data[0].all_resources.length === 0) {

        $rootScope.popup_notice("Purchase complete");
     } else {
      // user bought resources..
      $rootScope.resources_bought = [];
      data.all_resources = data[0].all_resources;
      for (var x = 0; x < data.all_resources.length; x++) {
        console.log(data.all_resources[x].resource);
        if (data.all_resources[x].success == 1) {

          $rootScope.resources_bought.push(data.all_resources[x].resource);
        }
      }

      $ionicPopup.show({
       template: '<ion-list>                                '+
                 '  <ion-item ng-repeat="resource in resources_bought"> '+
                 '    {{resource}}                              '+
                 '  </ion-item>                             '+
                 '</ion-list>                               ',

       title: 'Purchase complete',
       subTitle: 'Following resources has been added to your inventory.',
       scope: $rootScope,
       buttons: [
         { type: 'gradient',
           text: 'Close' },
       ]
     });
     }
    } else {
      if (data.error_log.can_afford === 0) {
        $rootScope.popup_notice("You don't have enough BitFunds for this purchase", "");
      } else {
        $rootScope.popup_notice("An error occured", data.error_log.error_log);
        $rootScope.append_errors(data.error_log.error_log);
      }

    }
    $rootScope.fetchUserData();
    $state.reload();

  };

  // function to get ALL users.
  $scope.fetchUsers = function() {
    var username_request = $scope.username = localStorage.getItem("Username");
    obj = {
      token: token, // TODO: Change this later to a more secure token ples.
      username_request: username_request // the user that requested to fetch users.
    };

    var request = $http({
      method: "post",
      url: https_url + "/users/fetchUsers.php",
      data: obj,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    request.success(function (data) {
      $rootScope.all_users = data;
      localStorage.setItem('allUsers', data);
      console.log(data);
    });
  };

}])
