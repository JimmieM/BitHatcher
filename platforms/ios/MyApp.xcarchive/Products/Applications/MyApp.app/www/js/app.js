
// global variables;
var token = "30617466141a15e9f8224fbca3fd7a4f2378746a1c66084811c2b99f55b28ef6"; // static token for webserver.. // this is actually translated to, imadirtydirtygirl
var https_url = "https://bithatcher.com/api/app/v2";

// store global projects

// global object for storing logged in users inventory, which is fetched in profileController.





// TODO: DEPECRATED!
// global to get username and ID.
var username = window.localStorage.getItem("Username");
var id = window.localStorage.getItem("Id");
var player_token = window.localStorage.getItem("Token");

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


  $rootScope.user_id = localStorage.getItem("Id");

  $rootScope.username = localStorage.getItem("Username");
  $rootScope.app = {};
  $rootScope.user_inventory = {};

  // global object to store data when viewing someone elses profile. .run func.
  $rootScope.view_profile = {};

  $rootScope.chat = {};

  $rootScope.obj = {};

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
     $rootScope.projects = data.pets;
     console.log($rootScope.projects);
     return $rootScope.projects;
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
        $rootScope.user_id = data[0].player_id;
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
    $rootScope.chat.player2 = player2_username;
    $state.go('tabsController.chat');
  };

  // function to reload/fetch the project that you're in.
  $rootScope.reloadProject = function() {
    // do a post request with requested project.....
    var username = localStorage.getItem('Username');

    var obj = {
        token: token,
        username: username,
        project_id: $rootScope.app.open_project.id
     };

      var request = $http({
        method: "post",
        url: https_url + "/projects/fetch_projects_beta.php",
        data: obj,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    request.success(function(data) {
      $rootScope.project_variables = data['pets'][0];
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







// .controller('cookController', function countController($rootScope, $scope, $interval, $ionicPopup){
//
//     $scope.cookingTimer = 0; // number of seconds remaining
//     var stop;
//
//     $scope.timerCountdown  = function(){
//
//       console.log("cooking by the book");
//
//       $scope.cookingTimer = 10;
//
//       // start the countdown
//       stop = $interval(function() {
//         // decrement remaining seconds
//         $scope.cookingTimer--;
//         // if zero, stop $interval and show the popup
//         if ($scope.cookingTimer === 0){
//           $interval.cancel(stop);
//           var alertPopup = $ionicPopup.alert({
//              title: '',
//              template: 'Bon Appétit!'});
//         }
//       },1000,0); // invoke every 1 second
//     };
// })

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
