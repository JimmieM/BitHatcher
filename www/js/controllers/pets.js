
angular.module('app.features.controllers').controller('myProfileController', ['$scope', '$state', '$http' ,'$ionicLoading' ,'$rootScope',  function($scope, $state, $http,$ionicLoading, $rootScope){

  // username displayed in Profile.HTML
  $scope.username = localStorage.getItem("Username");

  $scope.avatar = localStorage.getItem("Avatar");

  //$rootScope.fetchUserData();
}]);

angular.module('app.features.controllers').controller('listController', ['$scope','$http', '$state' , '$stateParams','$ionicPlatform' , '$rootScope' , '$ionicLoading' , '$ionicPopup',
  function($scope, $http, $state, $stateParams, $ionicPlatform, $rootScope, $ionicLoading, $ionicPopup) {
      $state.reload();
      // if (username !== null) {
      //
      //   // setInterval(function() {
      //   //   $rootScope.fetchProjects(false);
      //   // }, 30000);
      // }


      // func to fetch projects..
      $rootScope.fetchProjects = function(loader = true) {

      $rootScope.fetchUserData();

        if (loader) {
          // init loader
          $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Loading...',
          });
        }

        var obj = {
           username: $rootScope.username,
           token: token
         };

        var request = $http({
          token: token,
          method: "post",
          url: https_url + "/projects/fetch_projects.php",
          data: obj,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        $scope.server_response = server_response;

        request.success(function (data) {

          $ionicLoading.hide();

          if (data.success !== 0) {
            console.log(data);

            // var with all projects to print in profile.html as ng-repeat
            // also works as a boolean to hide elements which should only be seen IF any projects has returned.

            $rootScope.projects_full = data;
            $rootScope.projects = data.pets; // only the pets.
            $rootScope.projects = data.pets;

            if ($rootScope.projects.length === 0) {
              $rootScope.projects = false;
            } else {
              // assign
              $scope.outgoing_projects = 0;
              $scope.incoming_projects = 0;
              $scope.shared_projects = 0;

              for (var i = 0; i < $rootScope.projects.length; i++) {

                $rootScope.projects[i].player_avatar = $rootScope.build_avatar($rootScope.projects[i].player_avatar);

                // check if the project has levled up.
                if ($rootScope.projects[i].leveled_up === '1') {
                  if ($rootScope.projects[i].battle_ready === '1') {
                    $rootScope.popup_notice($rootScope.projects[i].name + ' has reached a new stage!', 'The pet is now ready for battle!');
                  } else {
                     $rootScope.popup_notice($rootScope.projects[i].name + ' has reached a new stage!');
                  }

                }


                // at the same time as looping through,
                // check if any battles are finished.

                if ($rootScope.projects[i].battle_done === '1') {
                  // battle is done.
                  // fetch winner and resources.

                  $rootScope.subTitle = '';

                  // if you WON
                  if ($rootScope.projects[i].battle_winner === '1') {
                    // init array to store each resources AND bitfunds AND pet
                    $rootScope.resources_won = [];
                    // get BitFunds amount won
                    $rootScope.resources_won.push($rootScope.projects[i].battle_reward_bitfunds + " BitFunds");
                    if ($rootScope.projects[i].battle_reward_pet !== 0) {
                      $rootScope.resources_won.push("Pet: " + $rootScope.projects[i].battle_reward_pet);
                    }

                    // get all resources that server returned
                    for (var x = 0; x < $rootScope.projects[i].battle_reward_resources.all_battle_resources_won.length; x++) {
                      if ($rootScope.projects[i].battle_reward_resources.all_battle_resources_won[x].success == 1) {
                          $rootScope.resources_won.push($rootScope.projects[i].battle_reward_resources.all_battle_resources_won[x].battle_resource_won);
                      } else {
                        // handle error.
                      }

                    }

                    //$rootScope.popup_notice("Battle won","Your project " + $rootScope.projects[i].name + " won against " + $rootScope.projects[i].battle_winner_project_name_opponent + "\n\nYou've earned following resources!");

                    // create templte for battle won. Check if its PvE or PvP
                    if ($rootScope.projects[i].battle_pvp_pve == 'pvp') {
                      $rootScope.subTitle = $rootScope.projects[i].name + " won against " + $rootScope.projects[i].battle_winner_project_name_opponent + "\n\nYou won " + $rootScope.resources_won.length + " resources!"
                    } else if($rootScope.projects[i].battle_pvp_pve == 'pve') {
                      $rootScope.subTitle = $rootScope.projects[i].name  + " won against bot" + "\n\nYou won " + $rootScope.resources_won.length + " resources!";
                    } else {
                      $rootScope.subTitle = 'error';
                    }

                    $ionicPopup.show({
                      title: "Battle won!",
                      template: $rootScope.subTitle,
                      scope: $rootScope,
                      buttons: [
                        { text: 'Close' }, {
                          text: '<b>View resources </b>',
                          type: 'gradient',
                          onTap: function(e) {
                            $ionicPopup.show({
                             template: '<ion-list>                                '+
                                       '  <ion-item ng-repeat="resource in resources_won"> '+
                                       '    {{resource}}                              '+
                                       '  </ion-item>                             '+
                                       '</ion-list>                               ',

                             title: 'Following resources has been added to your pets inventory.',
                             scope: $rootScope,
                             buttons: [
                               { type: 'gradient',
                                 text: 'Close' },
                             ]
                            });
                          }
                        }
                      ]
                    });
                  } else {

                    if ($rootScope.projects[i].battle_pvp_pve == 'pvp') {
                      subTitle = $rootScope.projects[i].battle_winner_project_name_opponent;
                    } else if($rootScope.projects[i].battle_pvp_pve == 'pve') {
                      $rootScope.subTitle = "bot";
                    } else {
                      $rootScope.subTitle = 'undefined';
                    }

                    if ($rootScope.projects[i].battle_looser_died === '1') {
                        $rootScope.popup_notice("Battle lost","Your pet " + $rootScope.projects[i].name + " lost against " + $rootScope.subTitle + "\n\n Your pet survived!");
                    } else {
                        $rootScope.popup_notice("Battle lost","Your pet " + $rootScope.projects[i].name + " lost against " + $rootScope.subTitle + "\n\n Your pet has been terminated. If you possess a revival potion, you can use to to revive your pet.");
                    }

                  }
                }

                // before toggling sections. Sort Outgoing, incoming and shared.
                // check if there is any outgoing/incoming or shared projects.

                // outgoing
                if (($rootScope.projects[i].player1 === username) && ($rootScope.projects[i].request_sent_by_player1 === '1') && ($rootScope.projects[i].player2_accepted === '-1' || $rootScope.projects[i].player2_accepted === '0')) {
                  $scope.outgoing_projects ++;
                }

                // incoming
                else if (($rootScope.projects[i].player2_accepted === '0') && ($rootScope.projects[i].player2 === username) && ($rootScope.projects[i].request_sent_by_player1 === '0')) {
                  $scope.incoming_projects ++;
                    console.log($scope.incoming_projects);
                }

                // shared
                else if ($rootScope.projects[i].player2_accepted === '1' || $rootScope.projects[i].player2 === '') {
                  $scope.shared_projects ++;
                }
              }
            }

            $rootScope.earnedAchievement($rootScope.projects_full);

            $scope.toggle_project_sections();
          } else {
            $rootScope.popup_notice('There was an error fetching your pets', 'Error message:' + data.error_log);
          }
        });
        request.error(function(data)
        {
          $ionicLoading.hide();

          console.log(data);

          $scope.error_array = [];

          for (var i = 0; i < $scope.server_response.length; i++) {
            console.log($scope.server_response[i]);
            if (data === $scope.server_response[i]) {
              $scope.error_array.push = $scope.server_response[i]
            }
          }

          $ionicLoading.show({
            template: 'Error',
            duration: 500
          });
        });

        request.finally(function() {
          // function for cloisng ion-refresh thingy..
          $rootScope.$broadcast('scroll.refreshComplete');
        });

      };

      // call this to place Project data in view.
      $rootScope.projects;

      // select row action
      $scope.viewProject = function(id) {

        // $ionicLoading.show({
        //   template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Loading...',
        // });

        // do a post request with requested project.....
        var username = localStorage.getItem('Username');
        console.log("Opening project with ID: " + id);

        var obj = {
            username: username,
            project_id: id,
            token: token
         };

        var request = $http({
          method: "post",
          url: https_url + "/projects/fetch_projects.php",
          data: obj,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        request.success(function (data) {
          $ionicLoading.hide();
          console.log(data);
          // create scope variables with params to be accessed from Project.HTML view.

          // push the fetched data to a variable for ProjectController to access
          $rootScope.app.open_project = data.pets[0];

          var redirect = true;


          if ($rootScope.app.open_project.in_battle === '1') {
            if ($rootScope.app.open_project.battle_queued !== 1) {
              $rootScope.popup_notice($rootScope.app.open_project.name + ' is currently in battle!');
              redirect = false;
            }


          }

          if ($rootScope.app.open_project.dead === 1) {
            //$rootScope.popup_notice($rootScope.app.open_project.name + ' has died.');

            $ionicPopup.show({
              title: $rootScope.app.open_project.name + ' is dead',
              subTitle: "You can revive it by using a revival potion. Which only works if " + $rootScope.app.open_project.name + " died in battle",
              scope: $rootScope,
              buttons: [
                { text: 'Cancel' },
                {
                  text: 'Use revival potion',
                  type: 'gradient',
                  onTap: function(e) {
                    $ionicPopup.show({
                      title: "Are you sure to spend 1 revival potion on " + $rootScope.app.open_project.name + "?",
                      scope: $rootScope,
                      buttons: [
                        { text: 'Cancel' },
                        {
                          text: 'Use revival potion',
                          type: 'gradient',
                          onTap: function(e) {
                            console.log($rootScope.app.open_project.potiontype_revival + " player: " + user_inventory[0].player_potiontype_revival);
                            if ($rootScope.app.open_project.potiontype_revival >= 1 || user_inventory[0].player_potiontype_revival >= 1) {
                              var obj = {
                                token: token,
                                username_request: username,
                                revive_project: true,
                                project_id: $rootScope.app.open_project.id
                               };

                              var request = $http({
                                method: "post",
                                url: https_url + "/projects/project_actions/revive_project.php",
                                data: obj,
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                              });

                              request.success(function (data) {
                                console.log(data);
                                if (data.success === 1) {
                                  $rootScope.popup_notice("You've successfully revived " + $rootScope.app.open_project.name);
                                  $state.reload();
                                } else if(data.success === 0) {
                                  $rootScope.popup_notice("Could not revive " + $rootScope.app.open_project.name, data.error_log);
                                }
                              });
                            } else {
                              $rootScope.popup_notice("You don't have enough revival potions");
                            }
                          }
                        }
                      ]
                    });
                  }
                }
              ]
            });
            redirect = false;
          }

          if ($rootScope.app.open_project.egg_creature == '1' && $rootScope.app.open_project.stage == '1') {
            $rootScope.popup_notice($rootScope.app.open_project.name + ' is currently hatching.');
            redirect = false;
          }

          if (redirect) {
            $state.go('tabsController.project');
          }


        });
        request.error(function(data) {
          $ionicLoading.hide();
          console.log(data);
          $rootScope.popup_notice('Error viewing project');
        });
      };
      $scope.project_invite = function(action, project_id) {

        // accept === action(true)
        // decline === action(false);

        var username = localStorage.getItem("Username");
        var data = {
          token: token,
          project_action: action,
          project_id: project_id,
          username: username,
        };


        var request = $http({
          method: "post",
          url: https_url + "/projects/project_actions/project_invite.php", // TODO:
          data: data,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        request.success(function (data) {
        console.log(data);

        // did the accept/decline return success:1?
        if (data[0].success === 1) {
          // did the user accept the invite?
            $scope.fetchProjects();

        } else {
          $rootScope.popup_notice("Oh..", "Error handling request.. Message: " + data[0].error_log);
          $rootScope.append_errors(data[0].error_log);
        }
      });
        request.error(function (data) {
        console.log(data);
        $rootScope.popup_notice("Oh..", "Error handling request..");
        });
      };

      $scope.toggle_project_sections = function(section) {
          switch (section) {
            case 'shared':
              $scope.shared = $scope.shared !== true;
              localStorage.setItem("toggleSharedProjects", $scope.shared);
                break;
            case 'invited':
              $scope.invited = $scope.invited !== true;
              localStorage.setItem("toggleInvitedProjects", $scope.invited);
                break;
            case 'invites':
              $scope.invites = $scope.invites !== true;
              localStorage.setItem("toggleInvitesProjects", $scope.invites);
                break;
            default:

            // check if there are any sent invites.. Else don't show the label/toggle
            $scope.invited = JSON.parse(localStorage.getItem("toggleInvitedProjects"));
            $scope.invites = JSON.parse(localStorage.getItem("toggleInvitesProjects"));
            $scope.shared = JSON.parse(localStorage.getItem("toggleSharedProjects"));

          }
      };

      $scope.destroyProject = function() {

      };
}]);
