
angular.module('app.features.controllers').controller('battlesController', ['$scope','$http', '$state', '$stateParams','$ionicPlatform' , '$rootScope' , '$ionicLoading', '$ionicPopup', '$ionicModal','$cordovaLocalNotification' , function($scope, $http, $state, $stateParams, $ionicPlatform, $rootScope, $ionicLoading, $ionicPopup, $ionicModal, $cordovaLocalNotification){

  $scope.goTo = function(state){
    $state.go(state);
  };

  $rootScope.$on("$cordovaLocalNotification:triggered", function(e,notification) {});

  $scope.add = function() {
    var now = new Date().getTime();
    var _10SecondsFromNow = new Date(now + 10 * 1000);
      $cordovaLocalNotification.add({
          id: "1234",
          date: now,
          text: "This is a message",
          title: "This is a title",
      }).then(function () {
          console.log("The notification has been set");
      });
    };

    $scope.isScheduled = function() {
        $cordovaLocalNotification.isScheduled("1234").then(function(isScheduled) {
            alert("Notification 1234 Scheduled: " + isScheduled);
        });
    };

  var battles_guide = localStorage.getItem("battles_guide");

  if (battles_guide === "false" || battles_guide === null || battles_guide === null || battles_guide !== "true" || battles_guide === false) {
    // popup with player 2 invite.
    $ionicPopup.show({
      title: "When your pet has reached stage 2, you can enter battles",
      subTitle: "By battling other users pets, you'll gain rewards.",
      scope: $rootScope,
      buttons: [
        {
          text: 'Got it!',
          type: 'gradient',
          onTap: function(e) {
            localStorage.setItem("battles_guide", "true");

          }
        }
      ]
    });
  }

  $scope.fetchBattles = function() {
    // also fetch your projects.
    $rootScope.reloadAllProjects();
    $state.reload();

    var obj = {
        token:token,
        username_request: $rootScope.username,
     };

    var request = $http({
        method: "post",
        url: https_url + "/battles/available_battles.php",
        data: obj,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    $ionicLoading.show({
      template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Loading...',
    });

    request.success(function(data) {
      console.log(data);
      $ionicLoading.hide();
      // user fetch
      if (data[0].success === 1 || data.success === 1) {
        console.log(data);
        $scope.battles = data;

        // check if any battles are any of your projects.
        //$rootScope.projects = $rootScope.projects;

        for (var i = 0; i < $rootScope.projects.length; i++) {
          for (var j = 0; j < $scope.battles.length; j++) {
            // json.parse the attacks as well.
            if ($scope.battles[j].battle_player1_attacks !== null) {
              console.log($scope.battles[j].battle_player1_attacks);
              $scope.battles[j].battle_player1_attacks = JSON.parse($scope.battles[j].battle_player1_attacks);
            }

            if ($rootScope.projects[i].id === $scope.battles[j].battle_player1_project_id) {
              $scope.battles[j].can_sign = 0;
            }
          }
        }
      } else if(data[0].empty == 1) {
        $scope.empty_battles = true;
        $scope.battles = '';
      } else {
        $rootScope.popup_notice('There was an error! ' +  data);
        $scope.empty_battles = false;

      }

      console.log($scope.battles);

    });
    request.error(function(data) {
      $ionicLoading.hide();
      console.log(data);
      $rootScope.popup_notice('There was an error!' + data);
    });
    request.finally(function() {
      // function for cloisng ion-refresh thingy..
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  // get all projects from rootscope var.
  // start value
  $rootScope.choice = {
    value: '1', // project select
  };
  $rootScope.resource_bundle = {
    value: '1', // const select
  };
  $rootScope.bitfunds = {
    value: '0', // bitfunds select
  };
  $rootScope.pet = {
    value: '0', // pet winner select
  };
  $rootScope.pvp_pve = {
    value: 'pve', // bitfunds select
  };

  $rootScope.battle_params = {};

  $scope.view_battle = function(project_name, stage, attacks) {

    $rootScope.view_battle_data = {
      project_name: project_name,
      stage: stage,
    };

    console.log(attacks.length);
    if (attacks.length > 0) {
      attacks = JSON.parse(attacks);
      $rootScope.view_battle_data['attacks'] = attacks;
    } else {
      $rootScope.view_battle_data['attacks'] = null;
    }

    console.log($rootScope.view_battle_data);

    $ionicPopup.show({
      title: project_name + " - stage: " + stage,
      templateUrl:'view_battle.html',
      scope: $rootScope,
      buttons: [{
        text: 'Close',
        type: 'gradient',
        onTap: function (e) {
        }
      }]
    });
  }

  $scope.new_battle = function() {
    $rootScope.battle_params = {}; // clear

    $ionicPopup.show({
      title:'Select pet to sign with',
      templateUrl:'projects_choose.html',
      scope: $rootScope,
      buttons: [{
        text: 'Cancel',
        type: 'button-default',
        onTap: function (e) {

        }
       }, {
       text: 'Continue',
       type: 'gradient',
       onTap: function (x) {
         var next = false;
          //$scope.validate_project(null,$scope.choice.value, null, null, 'new_battle');
          $rootScope.battle_params.battle_action = 'new_battle';
          $rootScope.battle_params.project_id = $scope.choice.value;

          $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Loading...',
          });

          $rootScope.get_attacks_by_id($scope.choice.value);
          $scope.choose_attacks();

          //$scope.create_battle();
       }
     }]
    });
  };

  $scope.enter_battle = function(battle_id,project_opponent_id, project_opponent_name){
    $rootScope.battle_params = {}; // clear

     $ionicPopup.show({
       title:'Select a pet to enter with',
       templateUrl:'projects_choose.html',
       scope: $rootScope,
       buttons: [{
         text: 'Cancel',
         type: 'button-default',
         onTap: function (e) {

         }
        }, {
        text: 'Enter',
        type: 'gradient',
        onTap: function (e) {
          console.log($scope.choice.value);
          //$scope.validate_project(battle_id,$scope.choice.value, project_opponent_id, project_opponent_name, 'enter_battle');
          let project_id = $scope.choice.value;
          $rootScope.get_attacks_by_id(project_id);

          $rootScope.battle_params = {
            project_id: project_id,
            battle_id: battle_id,
            project_opponend_id: project_opponent_id,
            project_opponend_name: project_opponent_name,
            battle_action: 'enter_battle'
          };

          $scope.choose_attacks();
        }
      }]
     });
   };


   // init array to store users picked attacks.
   $rootScope.chosen_attacks = [];

   $rootScope.add_attack = function(attack_name, attack_id) {
     console.log(attack_id);
     console.log(attack_name);

     let exists =  false;
     for (var i = 0; i < $rootScope.chosen_attacks.length; i++) {
       if ($rootScope.chosen_attacks[i].attack_id === attack_id) {
         exists =  true;
         $rootScope.chosen_attacks.splice(i, 1);
       }
     }

     if (!exists) {
       $rootScope.chosen_attacks.push
       ({
         'attack_name': attack_name,
         'attack_id': attack_id
      })
    }
  };


   $scope.choose_attacks = function() {
     $rootScope.chosen_attacks = []; // clear
     $rootScope.get_attacks_by_id($rootScope.battle_params.project_id);
     $ionicPopup.show({
       title:'Pick 2 attacks',
       templateUrl:'choose_attacks.html',
       scope: $rootScope,
       buttons: [{
         text: 'Cancel',
         type: 'button-default',
         onTap: function (e) {
           $rootScope.project_attacks = null;
         }
        }, {
        text: 'Next',
        type: 'gradient',
        onTap: function (e) {
          console.log($scope.choice.value);

          $rootScope.battle_params['attacks'] = $rootScope.chosen_attacks;

          if ($rootScope.battle_params.battle_action === "new_battle") {
            $scope.create_battle();
          } else {
            $scope.http_battle();
          }

        }
      }]
     });
   }

   $scope.create_battle = function() {
     $ionicPopup.show({
       title:'Select PvE or PvP',
       subTitle: "Player versus Enviroment or Player versus Player.",
       templateUrl:'pve_pvp_choose.html',
       scope: $rootScope,
       buttons: [{
         text: 'Cancel',
         type: 'button-default',
         onTap: function (e) {

         }
        }, {
        text: 'Continue',
        type: 'gradient',
        onTap: function (e) {
          console.log($scope.pvp_pve.value);

          // pve -> bot
         if ($scope.pvp_pve.value == 'pve') {

           $ionicPopup.show({
             title:'Bet your battle',
             subTitle: "The higher awards, the higher chance of loosing. If you loose your pet might die!",
             templateUrl:'rewards_choose.html',
             scope: $rootScope,
             buttons: [{
               text: 'Cancel',
               type: 'button-default',
               onTap: function (e) {

               }
              }, {
              text: 'Create battle',
              type: 'gradient',
              onTap: function (e) {
                console.log("Project: " + $scope.choice.value + " BitFunds amount:" + $scope.bitfunds.value +  "Pet translat" + $scope.pet.value);
                $rootScope.battle_params['bitfunds_reward'] = $scope.bitfunds.value;
                $rootScope.battle_params['pet_reward'] = $scope.pet.value;
                $rootScope.battle_params['pvp_pve'] = $scope.pvp_pve.value;

                $scope.http_battle();

              }
            }]
          });

        } else if($scope.pvp_pve.value == 'pvp'){
           // pvp -> multiplayer

           $ionicPopup.show({
             title:'Select winner rewards',
             subTitle: 'The winner of the battle will recieve your chosen rewards.',
             templateUrl:'rewards_choose.html',
             scope: $rootScope,
             buttons: [{
               text: 'Cancel',
               type: 'button-default',
               onTap: function (e) {

               }
              }, {
              text: 'Create battle',
              type: 'gradient',
              onTap: function (e) {

                $rootScope.battle_params['bitfunds_reward'] = $scope.bitfunds.value;
                $rootScope.battle_params['pet_reward'] = $scope.pet.value;
                $rootScope.battle_params['pvp_pve'] = $scope.pvp_pve.value;
                $scope.http_battle();

              }
            }]
          });
         }

        }
      }]
   });
   }

  // check if your chosen project is validated for battles. Works for both "new_battle" && sign up
  // $scope.validate_project = function(battle_id,project_id, project_opponent_id, project_opponent_name, battle_action) {
  //   for (var i = 0; i < $rootScope.projects.length; i++) {
  //     console.log($rootScope.projects[i].name);
  //     if ($rootScope.projects[i].id === project_id) {
  //       if ($rootScope.projects[i].in_battle === '0') {
  //         if (($rootScope.projects[i].stage >= '2' && ($rootScope.projects[i].dead == '0') || ($rootScope.projects[i].player2_accepted == '1' && $rootScope.projects[i].player2 === '') || ($rootScope.projects[i].player2_accepted == '0' && $rootScope.projects[i].player2 !== ''))) {
  //           if (battle_action === 'enter_battle') {
  //               $scope.http_battle(battle_id, project_id, project_opponent_id, project_opponent_name, battle_action);
  //           } else if(battle_action === 'new_battle') {
  //
  //
  //
  //
  //
  //           } else {
  //             $ionicPopup.show({
  //               title: 'Error: No target for $scope.validate_project(->battle_action) ',
  //               buttons: [{
  //                text: 'Close',
  //                type: 'gradient',
  //                onTap: function (e) {
  //                }
  //              }]
  //            });
  //           }
  //
  //         } else {
  //           $rootScope.popup_notice($rootScope.projects[i].name + ' is not suitable for battles yet.');
  //         }
  //       } else {
  //         $rootScope.popup_notice($rootScope.projects[i].name + ' is already signed up for a battle.');
  //
  //       }
  //       break;
  //     }
  //   }
  // };

  $scope.http_battle = function() {
    var obj = {
      token: token,
      battle_id: $rootScope.battle_params.battle_id, // the id of the battle.
      project_id: $rootScope.battle_params.project_id, // id of project signing up
      username_signing: $rootScope.username,
      id_signing: id,
      winner_reward_pet: $rootScope.battle_params.pet_reward,
      winner_reward_bitfunds: $rootScope.battle_params.bitfunds_reward,
      pvp_pve: $rootScope.battle_params.pvp_pve,
      attacks: JSON.stringify($rootScope.battle_params.attacks)
    };

    console.log(obj);

    var request = $http({
      method: "post",
      url: https_url + "/battles/" + $rootScope.battle_params.battle_action + ".php",
      data: obj,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    request.success(function(data) {

      console.log(data);

      // user fetch
      if (data.success === 1) {

        switch ($rootScope.battle_params.battle_action) {
          case 'new_battle':

          $scope.fetchBattles();
          $state.reload();
          $ionicLoading.show({
            template: 'Battle has been created',
            duration: 3000
          });
          break;
          case 'enter_battle':
            $ionicPopup.show({
              title : 'signed up for battle against ' + $rootScope.battle_params.project_opponent_name,
              subTitle: 'Your pet is now in battle. Check back later to view the winner',
              buttons: [{
               text: 'Okay!',
               type: 'gradient',
               onTap: function (e) {
                 $scope.fetchBattles();
                 $state.reload();
               }
             }]
           });
            break;
          default:
        }
      } else {
        $rootScope.append_errors(data.error_log + "---" + data.mysqli_error + "---" + data.mysqli_queries);
        $ionicPopup.show({
          title: 'Error. Please try again.',
          template: 'Server response: ' + data.error_log + data.mysqli_error + data.mysqli_queries ,
          buttons: [{
           text: 'Close',
           type: 'gradient',
           onTap: function (e) {
             // TODO: this should be logged!
             $state.reload();
           }
         }]
       });
      }
    });
  };


  $scope.delete_battle = function(battle_id) {

    $ionicPopup.show({
      title:'Are you sure?',
      subTitle: 'This action will remove selected battle.',
      scope: $rootScope,
      buttons: [{
        text: 'Cancel',
        type: 'button-default',
        onTap: function (e) {

        }
       }, {
       text: 'Delete battle',
       type: 'gradient',
       onTap: function (e) {
          var obj = {
            token: token,
            username_request: $rootScope.username,
            battle_id: battle_id
          };

          var request = $http({
            method: "post",
            url: https_url + "/battles/delete_battle.php",
            data: obj,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });

          request.success(function(data) {
            console.log(data);
            if (data.success === 1) {
              $rootScope.popup_notice("Success", "Battle has been removed");
            } else {
              $rootScope.popup_notice("Error", data.error_log);

            }
            $scope.fetchBattles();
            $state.reload();
          });
       }
     }]
    });

  };
}]);
