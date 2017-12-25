
// global variables;
var token = "30617466141a15e9f8224fbca3fd7a4f2378746a1c66084811c2b99f55b28ef6"; // static token for webserver.. // this is actually translated to, imadirtydirtygirl
var https_url = "https://bithatcher.com/api/app/v2";

// object for storing project data..
var app = {};

// store global projects

// global object for storing logged in users inventory, which is fetched in profileController.
var user_inventory = {};

// global object to store data when viewing someone elses profile. .run func.
var view_profile = {};

var chat = {};

var obj = {};

// global to get username and ID.
var username = window.localStorage.getItem("Username");
var id = window.localStorage.getItem("Id");
var player_token = window.localStorage.getItem("Token");

console.log("this is the username" + username);

// all responses available from backend.
var server_response = ['error_log', 'mysqli_reponse', 'success', 'null', 'gain_resources_request', 'notes'];

// global foodtypes -> locate path

var cooked_steak = '../img/food/cooked_steak.png';
var cooked_chicken = '../img/food/cooked_chicken.png';

var mini_carrots = '../img/food/mini_carrots.png';
var carrot = '../img/food/carrot.png';

var bone = '../img/food/bone.png';
var oomelette = '../img/food/omelette.png';
var bird_seeds = '../img/food/bird_seeds.png';

var water = '../img/food/water.png';
var babybottle = '../img/food/babybottle.png';

// all animals src -> locate path

var src_index = '../img/animals/';

var animal;

// based on version from db
var animal_version = ['v1','v2','v3'];

// based on stage
var animal_size;

function getAss() {

    // Do whatever your want!
    return token;

}

angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.directives','app.services', 'ngCordova','ionic.cloud', 'app.features.controllers'])

.config(function($ionicConfigProvider, $sceDelegateProvider, $ionicCloudProvider) {
  $ionicCloudProvider.init({
  "core": {
    "app_id": "c4c31bb9"
  },
  "push": {
    "sender_id": "SENDER_ID",
    "pluginConfig": {
      "ios": {
        "badge": true,
        "sound": true
      },
      "android": {
        "iconColor": "#343434"
      }
    }
  }
});
  $ionicConfigProvider.tabs.position('bottom'); // OR top
  $sceDelegateProvider.resourceUrlWhitelist([ 'self','*://www.bithatcher.com/**', '*://player.vimeo.com/video/**', '*://www.triviadash.net/**']);

})



.run(function($ionicPlatform, $state, $rootScope, $http, $ionicLoading, $ionicPopup, $cordovaVibration, $cordovaLocalNotification) {
  $http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

  console.log(localStorage.getItem('Error_logs'));

  $rootScope.id = localStorage.getItem("Id");
  $rootScope.username = localStorage.getItem("Username");

  document.addEventListener('deviceready', function () {

    function ok (value) {console.log(value + " success save");}
    function fail (error) {console.log(error + "error save");}


    var prefs = plugins.appPreferences;

    // cordova interface

    // store key => value pair

    prefs.fetch ('username_loggedin').then (ok, fail);

    if ($rootScope.username !== '' || $rootScope.username !== undefined) {
      prefs.store (ok, fail, 'username_loggedin', $rootScope.username);
    }

    console.log(prefs.fetch ('username_loggedin').then (ok, fail));


    cordova.plugins.backgroundMode.enable();

    realtime = new Ably.Realtime('YWxmHw.T0c4Gg:9UQUZRXTeUv30RVL');


    realtime.connection.on('connected', function() {
      //alert('Connected');
    });


    if (cordova.plugins.backgroundMode.isActive()) {
      alert("Is now active!");
    }
    // cordova.plugins.backgroundMode is now available
  }, false);

  LoggedIn = JSON.parse(localStorage.getItem("LoggedIn"));
  if (!LoggedIn || !$rootScope.loggedIn) {

    // redirect to guide if not completed..
    guideCompleted = localStorage.getItem("GuideCompletion");
    if (!guideCompleted) {
      //$urlRouterProvider.otherwise('/guide-1');
      $state.go('firstGuide');
    } else {
      //$urlRouterProvider.otherwise('/page5');
      $state.go('login');
      //console.log("Redirct to login");
    }


  } else {
    //$urlRouterProvider.otherwise('/page1/projects');
    $state.go('tabsController.projects');
  }

  guideCompleted = localStorage.getItem("GuideCompletion");
  if (username === null && guideCompleted === true) {
    $ionicPopup.show({
      title: 'Error',
      template: 'Please sign in',
      buttons: [{
       text: 'Sign in',
       type: 'gradient',
       onTap: function (e) {
         $state.go('login');
         $state.reload();
       }
     }]
   });
 }

 $rootScope.current_notifications = 0;
 $rootScope.get_chat_notifications = function() {

   realtime = new Ably.Realtime('YWxmHw.T0c4Gg:9UQUZRXTeUv30RVL');

   realtime.connection.on('connected', function() {

   });
   var channel = realtime.channels.get($rootScope.username);
   channel.subscribe(function(message) {
     console.log("NEW MESSAGE!!!!!!");
     var obj = {
        username_request: $rootScope.username,
        token: token
      };
      var request = $http({
        method: "post",
        url: https_url + "/chat/get_notifications.php",
        data: obj,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
     });

     request.success(function (data) {
       console.log(data);
       $rootScope.local_chat_notifications = data.notifications;


       if (data.notifications > 0) {
         if ($rootScope.current_notifications !== data.notifications) {
            //$cordovaVibration.vibrate(100);
         }
         $rootScope.current_notifications = data.notifications;


       } else {
         $rootScope.current_notifications = 0;
       }
       setTimeout(function() {
         $rootScope.get_chat_notifications();
       }, 4000);
     });

     request.error(function (data) {
       console.log("error!");
     });
   });
 };

 $rootScope.get_attacks_by_id = function(project_id) {
   $ionicLoading.hide();
   obj = {
     username_request: username,
     token: token,
     project_id: project_id
   };

   var request = $http({
     method: 'POST',
     url: https_url + "/projects/project_attacks/fetch_attack_rules.php",
     data: obj,
     headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
   });

   let all_attacks;

   request.success(function(response) {
     console.log(response);

     /*
       response should contain all shit.
     */

     // your pets current attacks.
     let current_attacks = response[0];

     if (current_attacks !== null) {
       for (var i = 0; i < current_attacks.length; i++) {
         // parse them to ints.
         current_attacks[i] = parseInt(current_attacks[i]);
       }
     }

     // all attacks.
     all_attacks = response[1];

     for (var x = 0; x < all_attacks.length; x++) {
       if (!all_attacks[x].available) {
         all_attacks.splice(x, 1);
       }
     }

     let count_owned = 0;

     for (x = 0; x < all_attacks.length; x++) {

       if (response[0] !== null) {

         for (var attack in response[0]) {
           if (response[0].hasOwnProperty(attack)) {
             if (response[0][attack] === '1') {

               if (attack === all_attacks[x].sql_name) {
                 count_owned++;
                 all_attacks[x].owned = true;
               }

             }
           }
         }

         // for (i = 0; i < $scope.current_attacks.length; i++) {
         //   if ($scope.current_attacks[i] === $scope.all_attacks.sql_name) {
         //     console.log('yes!');
         //   } else {
         //     console.log($scope.current_attacks[i] + $scope.all_attacks.sql_name);
         //   }
         // }
       }


     }

     $rootScope.project_attacks = all_attacks;

     console.log($rootScope.project_attacks);

   });

 };

 $rootScope.reloadAllProjects = function() {
   var obj = {
      username: $rootScope.username,
      token: token
    };
    var request = $http({
      method: "post",
      url: https_url + "/projects/fetch_projects_beta.php",
      data: obj,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
   });

   request.success(function (data) {


     return $rootScope.projects['pets'];
   });
   request.error(function (data) {
     console.log("error!");
   });
 };

  $rootScope.loader = function(qry = false) {
    if (qry) {
      $ionicLoading.show({
        template: '<p>Loading...</p><ion-spinner></ion-spinner>'
      });
    } else {
      $ionicLoading.hide();
    }
  };

  $rootScope.popup_notice = function(title, template = '', btn_name = 'Close', btn_func = '') {
    //$cordovaVibration.vibrate(100);
    $ionicPopup.show({
      title: title,
      template: template,
      buttons: [{
       text: btn_name,
       type: 'gradient',
       onTap: function (e) {
         btn_func = btn_func;
       }
     }]
   });
  };

  $rootScope.error_check = function(object) {
    // all responses available from backend.
    // whilst doing http responses, check if any of these keys exists.
    var server_response = ["error_log", "mysqli_reponse", "battle_error_log", "null", "gain_resources_request", "notes", "success", "player_avatar", "player_ID"];
    var found = {};
    for (var val in object) {
      for (var i = 0; i < server_response.length; i++) {
        if (val.hasOwnProperty(server_response[i])) {
            found.val = object[val];

        }
      }
    //Do your logic with the property here
    //console.log(found);
    }


  };

  $rootScope.append_errors = function(data_append) {
    var errors = localStorage.getItem('Error_logs');
    if(errors === null) errors = "";
    data_append = '\n\n\n' + data_append;
    localStorage.setItem('Error_logs', errors + data_append);
  };

  $rootScope.goToSettings = function(){
    $state.go('tabsController.settings'); // redirect
  };

  $rootScope.goToInventory = function(){
    $state.go('tabsController.inventory'); // redirect
  };

  $rootScope.goToShop = function(){
    $state.go('tabsController.shop'); // redirect
  };

  $rootScope.goToAchievements = function(){
    $state.go('tabsController.achievements'); // redirect
  };


  /*
  achievement_obj - use returned variable with pointer of ['achievement']

  response['achievements']
  */
  $rootScope.earnedAchievement = function(achievement_obj) {
    let achievements = achievement_obj['achievements'];
    for (var i = 0; i < achievements.length; i++) {
      if (achievements[i].achievement_earned) {
        $rootScope.displayAchievement(
          achievements[i].achievement_name,
          achievements[i].achievement_description,
          achievements[i].achievement_icon
        );
      }
    }
  }

  $rootScope.displayAchievement = function(name, description, icon) {

    var icon = '<img style="width:50%;" src="img/achievements/achievement_' + icon + '.png">';
    var sub = '<h2 style="text-align:center;">' + name + '</h2><br><br><h3 style="text-align:center;">' + description+ '</h3>';

    $ionicPopup.show({
      template: icon,
      title: "You've earned an achievement!",
      subTitle: sub,
      buttons: [{
       text: 'Close',
       type: 'gradient',
       onTap: function (e) {}
     }]
   });
  };

  $rootScope.fetchUserData = function() {

    LoggedIn = JSON.parse(localStorage.getItem("LoggedIn"));
    if (LoggedIn) {

      var username =  localStorage.getItem("Username");

      var obj = {
           username: username,
           token: token
       };

      var request = $http({
          token: token,
          method: "post",
          url: https_url + "/users/userInformation.php",
          data: obj,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      request.success(function(data) {
        console.log(data);
        // deal with the stats from the logged in user
        var level = data[0].player_level;
        $rootScope.level = "Level: " + level;
        $rootScope.id = data[0].player_id;
        $rootScope.local_chat_notifications = data[0].notifications;
        $rootScope.experience_bar = data[0].player_experience_bar;

        console.log($rootScope.experience_bar);
        localStorage.setItem("Id", data[0].player_ID);

        // inventory fetch..
        // apply the data to global object.
        user_inventory = data;

        // rootScope
        $rootScope.user_inventory = data[0];

        $state.reload();

      });
      request.error(function(data)
      {
        console.log(data);
        $ionicLoading.show({
          template: 'There was an error.',
          duration: 500
        });

      });

    } else {
      $state.go('login'); // redirect to login page.
    }
  };

  var config;

  $rootScope.configProject = function(project_id, project_name, player2) {
    $rootScope.new_project_name = project_name;
    $rootScope.project_id = project_id;
    $rootScope.project_name = project_name;
    config = $ionicPopup.show({
      template: "<h4>New pet name</h4><input type='text' placeholder='New pet name' value='{{project_name}}' ng-model='new_project_name'><br><button class='button button-assertive button-block' ng-click='deleteProject({{project_id}}, username)'>Delete {{project_name}}</button>",
      title: 'Config ' + project_name,
      subTitle: '',
      scope: $rootScope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'gradient',
          onTap: function(e) {
            var obj = {
                token: token,
                rename_project: true,
                username_request: username,
                project_id: project_id,
                project_new_name: $rootScope.new_project_name
             };

              var request  = $http({

                method: "post",
                url: https_url + "/projects/project_actions/rename_project.php",
                data: obj,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            console.log(obj);

            request.success(function (data) {
              config.close();

              console.log(data);
              if (data.success == 1) {
                $rootScope.popup_notice(project_name + " has been renamed!");
                $rootScope.fetchProjects();
                $state.reload();
              } else {
                $rootScope.popup_notice(project_name + " could not be renamed.", "Please try again!");
              }
            });
            request.error(function(data) {
              $rootScope.popup_notice(project_name + " could not be renamed.", "Please try again!");
            });
          }
        }
      ]
    });
  };

  $rootScope.deleteProject = function(project_id, username) {
    config.close();
    $ionicPopup.show({
      title: 'Are you sure to delete this pet?',
      subTitle: 'You can not undo this action!',
      scope: $rootScope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Delete</b>',
          type: 'button-assertive',
          onTap: function(e) {
            var obj = {
                delete_project: true,
                token: token,
                username_request: username,
                project_id: project_id
             };

              var request  = $http({
                method: "post",
                url: https_url + "/projects/project_actions/delete_project.php",
                data: obj,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            request.success(function(data) {
              console.log(data);
              if (data.success == 1) {
                $rootScope.popup_notice("Pet successfully been deleted!");
                $rootScope.fetchProjects();
                $state.reload();
              } else {
                $rootScope.popup_notice("Pet could not be deleted.", "Please try again!");
              }
            });
            request.error(function(data) {
              $rootScope.popup_notice("Pet could not be deleted.", "Please try again!");
            });
          }
        }
      ]
    });

  };

  $rootScope.enterChat = function(player2_username) {
    chat.player2 = player2_username;
    $state.go('tabsController.chat');
  };

  // function to reload/fetch the project that you're in.
  $rootScope.reloadProject = function() {
    // do a post request with requested project.....
    var username = localStorage.getItem('Username');

    var obj = {
        token: token,
        username: username,
        project_id: app.open_project.id
     };

      var request = $http({
        method: "post",
        url: https_url + "/projects/fetch_projects_beta.php",
        data: obj,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    request.success(function(data) {
      $rootScope.project_variables = data[0]['pets']; // TODO might need to remove [0]
      console.log("THIS!");
      console.log($rootScope.project_variables);


    });
    request.finally(function() {
      $rootScope.$broadcast('scroll.refreshComplete');
      $state.reload();
      return $rootScope.project_variables;
    });
  };

  $rootScope.build_avatar = function(avatar) {
    // build avatar string
    return 'img/avatar/' + avatar + '.png';
  };

  // global function to view someones profile,
  $rootScope.view_player_profile = function(player2_username) {

    var username = localStorage.getItem("Username");

    if (player2_username === undefined || player2_username === null || player2_username === '') {
      player2_username = username;
    }

    var obj = {
        token: token,
        username_request: username,
        username_get: player2_username,
     };

     console.log(obj);

    var request = $http({

        method: "post",
        url: https_url + "/users/view_profile.php",
        data: obj,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    request.success(function(data) {

      console.log("Fetching data to view profile..");
      console.log(data);

      // user fetch
      if (data.success === 1) {
        view_profile = data[0];

        console.log("Opening profile of: " + view_profile.player_username);

        $state.go('tabsController.profile');
      } else {
        $rootScope.popup_notice('Something went wrong!', 'Error: ' + data.error + ' ' + data.error_log);
        $rootScope.append_errors(data.error_log);
      }

    });

    request.error(function(data)
    {
      console.log(data);
      console.log("error fetching stats!");
      swal("Oops!","Connection error.","error");
    });
  };


   $rootScope.push_notification = function(id, at, title, text, badge) {

   };

  $ionicPlatform.ready(function() {
    if(device.platform === "iOS") {
      window.plugin.notification.local.promptForPermission();
      localStorage.setItem("Platform","iOS");
    }
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      cordova.plugins.Keyboard.disableScroll(false);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required

      StatusBar.styleDefault();

      StatusBar.backgroundColorByName("white");
    }

     $rootScope.$on('$cordovaLocalNotification:trigger',
      function (event, notification, state) {
        console.log("crash");
      });


    window.plugin.notification.local.onadd = function (id, state, json) {
       var notification = {
           id: id,
           state: state,
           json: json
       };
       $timeout(function() {
           $rootScope.$broadcast("$cordovaLocalNotification:added", notification);
       });
     };

  });
})




/*
  This directive is used to disable the "drag to open" functionality of the Side-Menu
  when you are dragging a Slider component.
*/
.directive('disableSideMenuDrag', ['$ionicSideMenuDelegate', '$rootScope', function($ionicSideMenuDelegate, $rootScope) {
    return {
        restrict: "A",
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {

            function stopDrag(){
              $ionicSideMenuDelegate.canDragContent(false);
            }

            function allowDrag(){
              $ionicSideMenuDelegate.canDragContent(true);
            }

            $rootScope.$on('$ionicSlides.slideChangeEnd', allowDrag);
            $element.on('touchstart', stopDrag);
            $element.on('touchend', allowDrag);
            $element.on('mousedown', stopDrag);
            $element.on('mouseup', allowDrag);

        }]
    };
}])

.controller('versionsController', ['$scope', '$rootScope', '$state','$stateParams' , '$http' , '$ionicLoading', '$ionicPopup',  function($scope, $rootScope, $state, $stateParams, $http, $ionicLoading, $ionicPopup){

  username_request = localStorage.getItem("Username");
  $scope.load_versions = function() {
    var obj = {
      token: token, // TODO: Change this later to a more secure token ples.
      username_request: username_request,
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
}])

// dynamic guide controllers
.controller('guideController', ['$scope','$state','$stateParams' ,  function($scope, $state, $stateParams){

  $scope.moveOn = function(page){

    // check if the user is on the fourth page, and passing to login screen.

    if (page === 'login') {
      var guideCompleted = true;
      localStorage.setItem("GuideCompletion", JSON.stringify(guideCompleted));

    }

    console.log(page);
    // goto page sent in my Page param by each guide views.
    $state.go(page);
  };
}])


.controller('inventoryController', ['$scope','$http', '$state', function($scope, $http, $state) {
  $scope.user_inventory = user_inventory[0];


  $scope.goTo = function(route) {
    $state.go(route);
  };
}])

.controller('achievementsController', ['$scope','$http', '$state' , '$rootScope', '$ionicPopup', function($scope, $http, $state, $rootScope, $ionicPopup) {
  $scope.init = function() {
    var obj = {
      token: token, // TODO: Change this later to a more secure token ples.
      username_request: username,
    };

    var request = $http({
      method: "post",
      url: https_url + "/achievements/fetch_achievements.php",
      data: obj,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    request.success(function (response) {
      console.log(response);

      if (response['success']) {
        $scope.base_achievements = response['achievements']['achievements'];

        if ($scope.base_achievements !== null || $scope.base_achievements.length > 0) {
            $scope.switch_view('pets');
        }
      } else {
        console.log("COULDNT LOAD ACHIEVEMENTS!");
      }




    });
  };

  $scope.switch_view = function(string) {
    $scope.title = string;
    $scope.achievements = $scope.base_achievements[string]
    switch (string) {
      case 'player':
          $scope.player = true;
          $scope.pets = false;
          console.log($scope.player);
        break;
      case 'pets':
          $scope.player = false;
          $scope.pets = true;
        break;
    }

    console.log($scope.achievements);

  };
}])

.controller('userResourcesController', ['$scope','$http', '$state' , '$rootScope', '$ionicPopup', function($scope, $http, $state, $rootScope, $ionicPopup) {

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

}])


.controller('cookController', function countController($rootScope, $scope, $interval, $ionicPopup){

    $scope.cookingTimer = 0; // number of seconds remaining
    var stop;

    $scope.timerCountdown  = function(){

      console.log("cooking by the book");

      $scope.cookingTimer = 10;

      // start the countdown
      stop = $interval(function() {
        // decrement remaining seconds
        $scope.cookingTimer--;
        // if zero, stop $interval and show the popup
        if ($scope.cookingTimer === 0){
          $interval.cancel(stop);
          var alertPopup = $ionicPopup.alert({
             title: '',
             template: 'Bon Appétit!'});
        }
      },1000,0); // invoke every 1 second
    };
})

/*
  This directive is used to open regular and dynamic href links inside of inappbrowser.
*/
.directive('hrefInappbrowser', function() {
  return {
    restrict: 'A',
    replace: false,
    transclude: false,
    link: function(scope, element, attrs) {
      var href = attrs['hrefInappbrowser'];

      attrs.$observe('hrefInappbrowser', function(val){
        href = val;
      });

      element.bind('click', function (event) {

        window.open(href, '_system', 'location=yes');

        event.preventDefault();
        event.stopPropagation();

      });
    }
  };
});
