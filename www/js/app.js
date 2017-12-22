
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

angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.directives','app.services', 'ngCordova','ionic.cloud'])

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


  $rootScope.gain_experience = function(amount) {

    var obj = {
      token: token,
      username: username,
      experience_amount: amount
     };

    var request = $http({

      method: "post",
      url: https_url + "/users/gain_level.php",
      data: obj,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    // $scope.server_response = server_response;

    request.success(function (data) {
      console.log(data);
    });
    request.error(function(data)
    {
      console.log(data);

       error_array = [];

      for (var i = 0; i < server_response.length; i++) {
        console.log("Server reponse:" + server_response[i]);
        if (data === server_response[i]) {
          error_array.push = server_response[i];
        }
      }

      //swal("Oops!","Connection error." + error_array > 0 ? "Error log:" + error_array : "","error");
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

    //new Date(new Date().getTime() + 10000)




    // $scope.scheduleDelayedNotification = function () {
    //   var now = new Date().getTime();
    //   var _10SecondsFromNow = new Date(now + 10 * 1000);
    //   alert("Gon die");
    //   $cordovaLocalNotification.schedule({
    //     id: 1,
    //     title: 'Title here',
    //     text: 'Text here',
    //     at: _10SecondsFromNow
    //   }).then(function (result) {
    //     // ...
    //     console.log(result);
    //   });
    // };


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

.controller('settingsController', ['$scope','$rootScope', '$state', '$http', '$ionicPopup','$cordovaSocialSharing' ,'$cordovaAppVersion' ,
  function($scope, $rootScope, $state, $http, $ionicPopup,$cordovaSocialSharing,$cordovaAppVersion) {

    document.addEventListener('deviceready', function () {

      cordova.getAppVersion.getVersionNumber(function(value) {
        $scope.appVersion = value;
        $rootScope.appVersion = value;
      });
      cordova.getAppVersion.getAppName().then(function (appname) {
        $scope.appName = appname;
      });
    });


  $scope.goTo = function(state) {
    $state.go(state);
  };

  console.log($scope.appPackage + ' : ' + $scope.appBuild + ' : ' + $scope.appName + ' : ' + $scope.appVersion);

  $scope.share = function(message = 'BitHatcher', subject = 'Check out BitHatcher, available for Android and iOS!', file= '', link= '') {
    $cordovaSocialSharing
      .share(message, subject, file, link) // Share via native share sheet
      .then(function(result) {
      }, function(err) {
        $rootScope.popup_notice('Error','Something went wrong..');
      });
  };

  $scope.feedback = function(message = '', subject = 'BitHatcher Feedback from: ' + username,toArr = ['bithatcher.com@gmail.com'], ccArr = ['bithatcher.com@gmail.com'],bccArr = ['bithatcher.com@gmail.com'], file = '') {
    $cordovaSocialSharing
    .shareViaEmail(message, subject, toArr, ccArr, bccArr, file)
    .then(function(result) {
      $rootScope.popup_notice('Thank you for the feedback!','');
    }, function(err) {
      $rootScope.popup_notice('Error','Something went wrong..');
    });
  };

  // logout function
  $scope.logout = function() {

    $ionicPopup.show({
      title:'Logout?',
      subTitle: 'Are you sure?',
      scope: $rootScope,
      buttons: [{
        text: 'Cancel',
        type: 'button-default',
        onTap: function (e) {

        }
       }, {
       text: 'Logout',
       type: 'gradient',
       onTap: function (e) {
         console.log("logging out");

         localStorage.clear();

         $rootScope = $rootScope.$new(true);
         $scope = $scope.$new(true);

         localStorage.removeItem("Username");
         var loggedIn = false;
         localStorage.setItem("LoggedIn", JSON.stringify(loggedIn));
         $rootScope.LoggedIn = false;

         localStorage.removeItem("Avatar");

         if (localStorage.getItem("Username")) {
           console.log("WTF DUDE!");
         } else {
            $state.reload();
            $state.go('login'); // redirect to login page.
         }
       }
     }]
    });
  };
}])

.controller('shopController', ['$scope','$http', '$state', '$stateParams','$ionicPlatform' , '$rootScope' , '$ionicLoading', '$ionicPopup' , '$ionicModal' , function($scope, $http, $state, $stateParams, $ionicPlatform, $rootScope, $ionicLoading, $ionicPopup, $ionicModal){


  // localStorage variables for the first time in app..
  //shop_guide = localStorage.getItem("shop_guide");

  // localStorage variables for the first time in app..
  var shop_guide = localStorage.getItem("shop_guide");

  if (shop_guide === "false" || shop_guide === undefined || shop_guide === null || shop_guide !== "true" || shop_guide === false) {
    // popup with player 2 invite.
    $ionicPopup.show({
      title: 'Spend your BitFunds to purchase pets and food',
      subTitle: "You'll gain most of your BitFunds by battling.",
      scope: $rootScope,
      buttons: [
        { text: 'Cancel' },
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
              attr: 'data-ng-disabled="pet_name.value === null "',
              type: 'gradient',
              onTap: function(e) {

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

.controller('recentBattlesController', ['$scope','$http', '$state', '$stateParams','$ionicPlatform' , '$rootScope' , '$ionicLoading', '$ionicPopup', '$ionicModal','$cordovaLocalNotification' ,
function($scope, $http, $state, $stateParams, $ionicPlatform, $rootScope, $ionicLoading, $ionicPopup, $ionicModal, $cordovaLocalNotification){

  var username =  localStorage.getItem("Username");
  var player_id = localStorage.getItem("Id");
  $scope.fetchRecentBattles = function() {
    // also fetch your projects.
    $rootScope.reloadAllProjects();
    $state.reload();

    var obj = {
        token:token,
        username_request: username,
     };

    var request = $http({
        method: "post",
        url: https_url + "/battles/recent_pvp_battles.php",
        data: obj,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    $ionicLoading.show({
      template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Loading...',
    });

    request.success(function(data) {

      $ionicLoading.hide();

      if (data.length > 0) {
        var i = 0;
          while (i < data.length) {
            if (data[i].project_1 === null ||
              data[i].project_2 === null) {
              data.splice(i, 1);
            } else {
              ++i;
            }
          }

          $scope.battles = data;
          console.log($scope.battles);
      } else {
        $scope.empty_battles = false;
      }


    });
    request.error(function(){
      $ionicLoading.hide();
      $rootScope.popup_notice("There was an error");
    });
    request.finally(function() {
      // function for cloisng ion-refresh thingy..
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

}])
.controller('battlesController', ['$scope','$http', '$state', '$stateParams','$ionicPlatform' , '$rootScope' , '$ionicLoading', '$ionicPopup', '$ionicModal','$cordovaLocalNotification' , function($scope, $http, $state, $stateParams, $ionicPlatform, $rootScope, $ionicLoading, $ionicPopup, $ionicModal, $cordovaLocalNotification){

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
        { text: 'Cancel' },
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

  var username =  localStorage.getItem("Username");
  var player_id = localStorage.getItem("Id");
  $scope.fetchBattles = function() {
    // also fetch your projects.
    $rootScope.reloadAllProjects();
    $state.reload();

    var obj = {
        token:token,
        username_request: username,
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

      $ionicLoading.hide();
      // user fetch
      if (data[0].success == 1) {
        console.log(data);
        $scope.battles = data;

        // check if any battles are any of your projects.
        $scope.projects = $rootScope.projects;

        for (var i = 0; i < $scope.projects.length; i++) {
          for (var j = 0; j < $scope.battles.length; j++) {
            // json.parse the attacks as well.
            if ($scope.battles[j].battle_player1_attacks !== null) {
              console.log($scope.battles[j].battle_player1_attacks);
              $scope.battles[j].battle_player1_attacks = JSON.parse($scope.battles[j].battle_player1_attacks);
            }

            if ($scope.projects[i].id === $scope.battles[j].battle_player1_project_id) {
              $scope.battles[j].can_sign = 0;
            }
          }
        }
      } else if(data[0].empty == 1) {
        $scope.empty_battles = true;
        $scope.battles = '';
      } else {
        $scope.empty_battles = false;
      }

      console.log($scope.battles);

    });
    request.error(function(){
      $ionicLoading.hide();
      $rootScope.popup_notice("There was an error");
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
      attacks: attacks
    };

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

    var username =  localStorage.getItem("Username");
    var player_id = localStorage.getItem("Id");
    console.log($rootScope.chosen_attacks);

    var obj = {
      token: token,
      battle_id: $rootScope.battle_params.battle_id, // the id of the battle.
      project_id: $rootScope.battle_params.project_id, // id of project signing up
      username_signing: username,
      id_signing: player_id,
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
               text: 'Close',
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

          username = localStorage.getItem("Username");
          var obj = {
            token: token,
            username_request: username,
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
}])

// global controller..
.controller('listController', ['$scope','$http', '$state' , '$stateParams','$ionicPlatform' , '$rootScope' , '$ionicLoading' , '$ionicPopup' , function($scope, $http, $state, $stateParams, $ionicPlatform, $rootScope, $ionicLoading, $ionicPopup){
    $state.reload();
    username = localStorage.getItem("Username");
    $scope.username = localStorage.getItem("Username");



    // TODO: dis is just test
    $rootScope.gain_experience(12);

    if (username !== null) {

      setInterval(function() {
        $rootScope.fetchProjects(false);
      }, 30000);
    }


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
         username: username,
         token: token
       };

      var request = $http({
        token: token,
        method: "post",
        url: https_url + "/projects/fetch_projects_beta.php",
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

          $scope.projects_full = data;
          $scope.projects = data.pets; // only the pets.
          $rootScope.projects = data.pets;



          if ($scope.projects.length === 0) {
            $scope.projects = false;
          } else {
            // assign
            $scope.outgoing_projects = 0;
            $scope.incoming_projects = 0;
            $scope.shared_projects = 0;

            for (var i = 0; i < $scope.projects.length; i++) {

              $scope.projects[i].player_avatar = $rootScope.build_avatar($scope.projects[i].player_avatar);

              // check if the project has levled up.
              if ($scope.projects[i].leveled_up === '1') {
                if ($scope.projects[i].battle_ready === '1') {
                  $rootScope.popup_notice($scope.projects[i].name + ' has reached a new stage!', 'The pet is now ready for battle!');
                } else {
                   $rootScope.popup_notice($scope.projects[i].name + ' has reached a new stage!');
                }

              }


              // at the same time as looping through,
              // check if any battles are finished.

              if ($scope.projects[i].battle_done === '1') {
                // battle is done.
                // fetch winner and resources.

                $rootScope.subTitle = '';

                // if you WON
                if ($scope.projects[i].battle_winner === '1') {
                  // init array to store each resources AND bitfunds AND pet
                  $rootScope.resources_won = [];
                  // get BitFunds amount won
                  $rootScope.resources_won.push($scope.projects[i].battle_reward_bitfunds + " BitFunds");
                  if ($scope.projects[i].battle_reward_pet !== 0) {
                    $rootScope.resources_won.push("Pet: " + $scope.projects[i].battle_reward_pet);
                  }

                  // get all resources that server returned
                  for (var x = 0; x < $scope.projects[i].battle_reward_resources.all_battle_resources_won.length; x++) {
                    if ($scope.projects[i].battle_reward_resources.all_battle_resources_won[x].success == 1) {
                        $rootScope.resources_won.push($scope.projects[i].battle_reward_resources.all_battle_resources_won[x].battle_resource_won);
                    } else {
                      // handle error.
                    }

                  }

                  //$rootScope.popup_notice("Battle won","Your project " + $scope.projects[i].name + " won against " + $scope.projects[i].battle_winner_project_name_opponent + "\n\nYou've earned following resources!");

                  // create templte for battle won. Check if its PvE or PvP
                  if ($scope.projects[i].battle_pvp_pve == 'pvp') {
                    $rootScope.subTitle = $scope.projects[i].name + " won against " + $scope.projects[i].battle_winner_project_name_opponent + "\n\nYou won " + $rootScope.resources_won.length + " resources!"
                  } else if($scope.projects[i].battle_pvp_pve == 'pve') {
                    $rootScope.subTitle = $scope.projects[i].name  + " won against bot" + "\n\nYou won " + $rootScope.resources_won.length + " resources!";
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

                  if ($scope.projects[i].battle_pvp_pve == 'pvp') {
                    subTitle = $scope.projects[i].battle_winner_project_name_opponent;
                  } else if($scope.projects[i].battle_pvp_pve == 'pve') {
                    $rootScope.subTitle = "bot";
                  } else {
                    $rootScope.subTitle = 'undefined';
                  }

                  if ($rootScope.projects[i].battle_looser_died === '1') {
                      $rootScope.popup_notice("Battle lost","Your pet " + $scope.projects[i].name + " lost against " + $rootScope.subTitle + "\n\n Your pet survived!");
                  } else {
                      $rootScope.popup_notice("Battle lost","Your pet " + $scope.projects[i].name + " lost against " + $rootScope.subTitle + "\n\n Your pet has been terminated. If you possess a revival potion, you can use to to revive your pet.");
                  }

                }
              }

              // before toggling sections. Sort Outgoing, incoming and shared.
              // check if there is any outgoing/incoming or shared projects.

              // outgoing
              if (($scope.projects[i].player1 === username) && ($scope.projects[i].request_sent_by_player1 === '1') && ($scope.projects[i].player2_accepted === '-1' || $scope.projects[i].player2_accepted === '0')) {
                $scope.outgoing_projects ++;
              }

              // incoming
              else if (($scope.projects[i].player2_accepted === '0') && ($scope.projects[i].player2 === username) && ($scope.projects[i].request_sent_by_player1 === '0')) {
                $scope.incoming_projects ++;
                  console.log($scope.incoming_projects);
              }

              // shared
              else if ($scope.projects[i].player2_accepted === '1' || $scope.projects[i].player2 === '') {
                $scope.shared_projects ++;
              }
            }
          }

          $rootScope.earnedAchievement($scope.projects_full);

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
    $scope.projects;

    console.log($scope.projects);

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
        url: https_url + "/projects/fetch_projects_beta.php",
        data: obj,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      request.success(function (data) {
        $ionicLoading.hide();
        console.log(data);
        // create scope variables with params to be accessed from Project.HTML view.

        // push the fetched data to a variable for ProjectController to access
        app.open_project = data.pets[0];

        var redirect = true;


        if (app.open_project.in_battle === '1') {
          if (app.open_project.battle_queued !== 1) {
            $rootScope.popup_notice(app.open_project.name + ' is currently in battle!');
            redirect = false;
          }


        }

        if (app.open_project.dead === 1) {
          //$rootScope.popup_notice(app.open_project.name + ' has died.');

          $ionicPopup.show({
            title: app.open_project.name + ' is dead',
            subTitle: "You can revive it by using a revival potion. Which only works if " + app.open_project.name + " died in battle",
            scope: $rootScope,
            buttons: [
              { text: 'Cancel' },
              {
                text: 'Use revival potion',
                type: 'gradient',
                onTap: function(e) {
                  $ionicPopup.show({
                    title: "Are you sure to spend 1 revival potion on " + app.open_project.name + "?",
                    scope: $rootScope,
                    buttons: [
                      { text: 'Cancel' },
                      {
                        text: 'Use revival potion',
                        type: 'gradient',
                        onTap: function(e) {
                          console.log(app.open_project.potiontype_revival + " player: " + user_inventory[0].player_potiontype_revival);
                          if (app.open_project.potiontype_revival >= 1 || user_inventory[0].player_potiontype_revival >= 1) {
                            var obj = {
                              token: token,
                              username_request: username,
                              revive_project: true,
                              project_id: app.open_project.id
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
                                $rootScope.popup_notice("You've successfully revived " + app.open_project.name);
                                $state.reload();
                              } else if(data.success === 0) {
                                $rootScope.popup_notice("Could not revive " + app.open_project.name, data.error_log);
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

        if (app.open_project.egg_creature == '1' && app.open_project.stage == '1') {
          $rootScope.popup_notice(app.open_project.name + ' is currently hatching.');
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
}])

.controller('projectsController', ['$scope', '$state', '$http' ,'$ionicLoading' ,'$rootScope',  function($scope, $state, $http,$ionicLoading, $rootScope){

  // username displayed in Profile.HTML
  $scope.username = localStorage.getItem("Username");

  $scope.avatar = localStorage.getItem("Avatar");

  //$rootScope.fetchUserData();
}])

.controller('loginController', ['$scope','$http', '$state','$ionicLoading','$ionicPopup','$ionicNavBarDelegate', '$rootScope',
function($scope, $http, $state, $ionicLoading, $ionicPopup,$ionicNavBarDelegate, $rootScope){
  $state.reload();
  $ionicNavBarDelegate.showBackButton(false);

  $scope.load_init = function(){
    swal.close();
    var loggedin = window.localStorage.getItem("LoggedIn");
    if ($rootScope.LoggedIn || loggedin) {
      console.log("Already Logged in!");
      $state.go('tabsController.projects');
    }
  };

  $scope.login = function (username,password) {

    $ionicLoading.show({
      template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Loading...',
    });

    var obj = {
      token: token,
      username: username,
      password: password
     };

    var usern = $scope.username;

    var request = $http({
        token: token,
        method: "post",
        url: https_url + "/users/login.php",
        data: obj,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

    console.log(request); // log the request

    request.success(function (data) {
        console.log(data);
        $ionicLoading.hide();

        cred = data[0].success;

        switch (cred) {
          case 1:
            try {
              // localStorage stuff
              var username = data[1].player_username;
              window.localStorage.setItem("Username", username);
              $rootScope.username = username;

              var loggedin = true;
              window.localStorage.setItem("LoggedIn", JSON.stringify(loggedin));
              $rootScope.loggedIn = true;

              // fetch Level
              var level = data[1].player_level;
              window.localStorage.setItem("level", level);

              // fetch avatar from JSON
              var avatar = data[1].player_avatar;

              // build avatar string
              avatar = 'img/avatar/' + avatar + '.png';

              console.log("Avatar signing in: " + avatar);
              window.localStorage.setItem("Avatar", avatar);
            } catch (e) {

              $rootScope.popup_notice('Error!');
            } finally {
              $state.reload();

              // reload to reload localstorage variables! TODO maybe this doesnt work in prod

              $state.go('tabsController.projects'); // redirect
              console.log("Logged in as: " + localStorage.getItem("Username"));
            }
            break;
          case 0:
            $rootScope.popup_notice("Wrong credentials");
            break;
          default:
          $rootScope.popup_notice("Wrong credentials");
        }
    });
    request.error(function(data)
    {
      $ionicLoading.hide();
      $rootScope.popup_notice("Connection error");
    });
  };

  $scope.gotoSignup = function() {
    $state.go('signup');
  };
}])


.controller('profileController', ['$scope','$rootScope','$http', '$state' , '$stateParams','$ionicPlatform' , '$ionicLoading','$ionicPopup' ,
function($scope, $rootScope, $http, $state, $stateParams, $ionicPlatform, $ionicLoading, $ionicPopup) {

  $scope.goToUsers = function() {
    $state.go('tabsController.users');
  };

  $scope.username = username;

  $scope.view_profile = view_profile;

  view_profile.player_avatar = $scope.build_avatar(view_profile.player_avatar);

  $scope.is_friend = $scope.view_profile.player_is_a_friend;

  $scope.online = false;

  if ($scope.view_profile.player_is_online == true) {
    $scope.online = true;
  }

  $scope.add_friend = function(username_add) {
    if (!$scope.is_friend) {
      var obj = {
        token: token,
        username_request: $scope.username,
        username_add: username_add,
       };

      var request = $http({
        token: token,
        method: "post",
        url: https_url + "/users/friends/add_friend.php",
        data: obj,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      request.success(function(data) {
        console.log(data);
        if (data.success == 1) {
          $scope.is_friend = true;
          $rootScope.popup_notice(username_add + ' is now your friend');
        } else {
          $rootScope.popup_notice('Unexpected error', 'Error: ' + data.error);
        }
      });
    } else {
      $rootScope.popup_notice("You're already friends with " + username_add);
    }

  };

}])


.controller('chatController', ['$ionicScrollDelegate', '$scope','$rootScope','$http', '$state' , '$stateParams','$ionicPlatform', '$ionicLoading','$ionicPopup' ,
function($ionicScrollDelegate, $scope, $rootScope, $http, $state, $stateParams, $ionicPlatform, $ionicLoading, $ionicPopup) {

  $scope.init = function() {
    $scope.no_content = true;
    $scope.chat_token = null;

    $scope.loadMessages();

    setTimeout(function() {
      if ($scope.chat.length > 0) {
        $ionicScrollDelegate.scrollBottom();
      }
    }, 500);


  };

  $scope.username = username;

  $scope.chatting_with = chat.player2;

  // grab pointer to original function
  var oldSoftBack = $rootScope.$ionicGoBack;

  // override default behaviour
  $rootScope.$ionicGoBack = function() {
    chat.player2 = '';
    oldSoftBack();
    $ionicScrollDelegate.scrollTop();
  };

  $scope.loadMessages = function() {
    var obj = {
      token: token,
      username_request: username,
      player2: chat.player2,
      chat_token: $scope.chat_token
     };

    var request = $http({
      token: token,
      method: "post",
      url: https_url + "/chat/load_chat.php",
      data: obj,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    request.success(function(data) {

      if (data === null) {
        chat.player2 = '';
      }
      if (data !== null || data.length > 0) {

        // check if token is unrecognized  || changed.
        if (data.success == 1) {
          if (data.valid_token !== 1) {
            for (var j = 0; j < data.chats.length; j++) {
              data.chats[j].player_avatar = $rootScope.build_avatar(data.chats[j].player_avatar);
            }
            $scope.chat_token = data.current_token;

            $scope.chat = data.chats;
            $ionicScrollDelegate.scrollBottom();
          } else {
            $scope.chat;
          }
        }


      } else {
        $scope.chat = false;

      }
    });

    request.error(function(data) {
      chat.player2 = '';
      $rootScope.popup_notice('There was an error', data);

    });
    console.log(chat);
    if (chat.player2 !== '') {
      setTimeout($scope.loadMessages, 3000);
    }
  };

  $scope.type = function() {
    $scope.no_content = true;
    if ($scope.chat_message !== '') {
      $scope.no_content = false;
    }
  };

  $scope.sendMessage = function() {

    var obj = {
      token: token,
      to: chat.player2,
      from: username,
      message: $scope.chat_message
     };

    var request = $http({
      token: token,
      method: "post",
      url: https_url + "/chat/new_message.php",
      data: obj,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    $scope.chat_message_backup = $scope.chat_message;
    $scope.chat_message = ''; // clear input field.
    $scope.no_content = true;


    request.success(function(data) {
      data = data[0];
      chat_ = data.chat.chats;

      $scope.chat_token = data.token;
      if (data.success === 1) {
        for (var j = 0; j < chat_.length; j++) {
          chat_[j].player_avatar = $rootScope.build_avatar(chat_[j].player_avatar);
        }

        $scope.chat = chat_;

        $ionicScrollDelegate.scrollBottom();
      } else {
        $scope.chat_message = $scope.chat_message_backup;
      }
    });
  };
}])

.controller('allUsersController', ['$ionicScrollDelegate','$scope', '$state', '$stateParams' ,'$http' ,'$ionicLoading' ,'$rootScope',
function($ionicScrollDelegate, $scope, $state, $stateParams, $http,$ionicLoading, $rootScope){

  $rootScope.users_view = 'friends';
  var update;

  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.switch_view($rootScope.users_view);

    $ionicScrollDelegate.scrollTop();
 });

  $scope.$on('$ionicView.afterLeave', function(){
    // has left Controller.
    clearTimeout(update);
  });



  $scope.chat = function(player2_username) {
    $rootScope.enterChat(player2_username);
  };

  $scope.switch_view = function(string) {

    switch (string) {
      case 'friends':
          $scope.title = 'Friends';
          $rootScope.users_view = 'friends';
          $scope.search = 'Search through your friends';
          $scope.updateFriends();

        break;

      case 'all_users':
          $scope.title = 'All users';
          $rootScope.users_view = 'all_users';
          $scope.search = 'Search through all users';
          $scope.updateUsers();

        break;
      default:
    }

  };

  $scope.updateFriends = function(timeout = false) {
    if (!timeout) {
      chat.player2 = ''; // clear chat cache.
    }

    var obj = {
      token: token,
      username_request: username,
     };

    var request = $http({
      token: token,
      method: "post",
      url: https_url + "/users/friends/get_friends.php",
      data: obj,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    request.success(function (data) {
      console.log(data);
      if (data !== null || data !== undefined) {
        if (data.success == 1) {
          data = data.friends;
          $scope.success = true;
          for (var i = 0; i < data.length; i++) {
            $scope.all_users = data;
            // if ($scope.all_users == undefined) {
            //   $scope.all_users = data;
            // } else {
            //   $scope.all_users[i].is_online = data[i].is_online;
            //   $scope.all_users[i].chat_notifications = data[i].chat_notifications;
            // }
          }
        } else {
          console.log("crash");
          $scope.success = false;
          $scope.error = data.error;
        }
      }

      console.log(data);

      // update = setTimeout(function() {
      //   $scope.updateUsers(true);
      // }, 4000);
    });

    request.finally(function() {
      $rootScope.$broadcast('scroll.refreshComplete');
    });


  };


  $scope.updateUsers = function(timeout = false) {

    if (!timeout) {
      chat.player2 = ''; // clear chat cache.
    }

    var obj = {
      token: token,
      username_request: username,
      get_all_users: true
     };

    var request = $http({
      token: token,
      method: "post",
      url: https_url + "/users/status/online_players.php",
      data: obj,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    request.success(function (data) {
      console.log(data);
      if (data !== null || data !== undefined) {
        $scope.success = true;
        for (var i = 0; i < data.length; i++) {
          $scope.all_users = data;
          // if ($scope.all_users == undefined) {
          //   $scope.all_users = data;
          // } else {
          //   $scope.all_users[i].is_online = data[i].is_online;
          //   $scope.all_users[i].chat_notifications = data[i].chat_notifications;
          // }
        }

        if (data == $scope.all_users) {
          console.log("No changes..");
        }
      }

      console.log(data);

      // update = setTimeout(function() {
      //   $scope.updateUsers(true);
      // }, 4000);
    });

    request.finally(function() {
      $rootScope.$broadcast('scroll.refreshComplete');
    });


  };

}])

// SIGNUP
.controller('signupController', ['$scope','$http','$state','$rootScope' ,'$ionicPopup' ,'$ionicLoading',
function($scope, $http, $state, $rootScope, $ionicPopup, $ionicLoading){

  $scope.disabled = false;

  $scope.platform = localStorage.getItem("Platform");

  $scope.gender_img = 'img/avatar/male.png';

  // prepare dropdown list for creature
  $scope.genders = ["Male", "Female", "Prefer not to say"];
  $scope.signup_gender = {};
  // start the select as default on first object
  $scope.signup_gender.index = 0;

  $scope.gender_changed_select = function(gender) {
    switch ($scope.signup_gender.index) {
      case 0:
          $scope.gender_img = 'male';
        break;
      case 1:
          $scope.gender_img = 'female';
        break;
      case 2:
          $scope.gender_img = 'other';
        break;
    }

    $scope.gender_img = 'img/avatar/' + $scope.gender_img + '.png';
  };

  $scope.validateEmail = function(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  $scope.signup = function(email, username, password) {

    //$scope.disabled = true;

    console.log(username, password, email);
    x = 1;
    if((username === undefined) || (password === undefined) || (email === undefined) || ($scope.gender === 0)) {
      $rootScope.popup_notice('Please fill all fields!');
    } else {

      var email_check = false;
      var username_check = false;
      var password_check = false;

      // check email regex etc.
      if ($scope.validateEmail(email)) {
        email_check = true;
      } else {
        $rootScope.popup_notice('Invalid email.');
      }

      if (username.length < 3) {
        $rootScope.popup_notice('Your username has to be atleast 3 characters.');
      }  else {
        username_check = true;
      }

      if (password.length < 6) {
        $rootScope.popup_notice('Your password has to be atleast 6 characters.');
      } else {
        password_check = true;
      }

      if (email_check && username_check && password_check) {
        var obj = {
            token: token,
            username: username,
            password: password,
            email: email,
            platform: $scope.platform,
            gender: $scope.signup_gender.index
         };

          var request = $http({
            method: "post",
            url: https_url + "/users/signup.php",
            data: obj,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        $ionicLoading.show({
          template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Loading...',
        });

        request.success(function (data) {
            console.log(data);
            $ionicLoading.hide();

            cred = data[0].success;

            switch (cred) {
              case 1:
                console.log("logged in");

                var username = data[0].player_username;
                // localStorage stuff
                localStorage.setItem("Username", username);

                console.log("Signign as: " + username);

                var loggedin = true;
                localStorage.setItem("LoggedIn", JSON.stringify(loggedin));
                $rootScope.LoggedIn = true;

                // fetch Level
                var level = data[0].player_level;
                localStorage.setItem("level", level);
                console.log(level);

                // fetch avatar from JSON
                var avatar = data[0].player_avatar;

                // build avatar string
                avatar = 'img/avatar/' + avatar + '.png';

                console.log("Avatar signing in: " + avatar);
                window.localStorage.setItem("Avatar", avatar);

                swal({
                  title: "Awesome!",
                  text: "Welcome, " + username,
                  timer: 1000,
                });

                setTimeout(function () {

                  $state.reload();
                  $state.go('tabsController.projects'); // redirect
                }, 1500);
                break;
              case 0:
                  if (data[0].re_log == 1) {
                    $rootScope.popup_notice("A problem occured, please sign in with your new credentials",'','', $state.go('login'));
                  }
                  if(data[0].user_exist == 1) {

                    $rootScope.popup_notice("That username already exist.");
                    $scope.disabled = false;
                  }
                break;
              default:

            }
        });
        request.error(function(data)
        {
          $ionicLoading.hide();
          $rootScope.popup_notice("There was an error..");
        });
      }
    }
  };
}])

.controller('projectController', ['$scope', '$rootScope', '$state','$stateParams' , '$http' , '$ionicLoading', '$ionicPopup',  function($scope, $rootScope, $state, $stateParams, $http, $ionicLoading, $ionicPopup){

  $scope.username = localStorage.getItem("Username");
  username_request = localStorage.getItem("Username");

  var project_guide = localStorage.getItem("project_guide");

  if (project_guide === "false" || project_guide === null || project_guide === null || project_guide !== "true" || project_guide === false) {
    // popup with player 2 invite.
    $ionicPopup.show({
      title: "This is your first pet.",
      subTitle: "Start by adding feeding bottles in the resource tab. Your pet can only eat specific kinds of food until later stages. ",
      scope: $rootScope,
      buttons: [
        { text: 'Cancel' },
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


  // $scope.resetStats = function() {
  //   obj = {
  //     reset: 1,
  //     project_id:app.open_project.id,
  //   };
  //
  //   var request = $http({
  //     token: token,
  //     method: "post",
  //     url: https_url + "/developer/actions/reset-stats.php",
  //     data: obj,
  //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  // });
  //
  //   request.success(function(response) {
  //     console.log(response);
  //   });
  // };

  // $scope.revertHours = function(hours,target) {
  //
  //   obj = {
  //     hours: hours,
  //     target_date: target,
  //     project_id:app.open_project.id,
  //   };
  //
  //   var request = $http({
  //     method: "post",
  //     token: token,
  //     url: https_url + "/developer/actions/subtract-update.php",
  //     data: obj,
  //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  // });
  //
  //   request.success(function (response) {
  //     console.log(response);
  //   });
  // };


  // app global array used to push project contents into from ListController -> ViewProject(), and recieve in projectController..
  $rootScope.project_variables = app.open_project;

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

  if (app.open_project.name === undefined) {
    $state.go('tabsController.projects');
    $state.refresh();
  } else {
    console.log($rootScope.project_variables.name);
    console.log("Loading Project...");
  }

  // create view functions..

  // egg variables handeled by $scope variables above
  // if it's an egg..
  if (app.open_project.egg_creature === '1' && app.open_project.stage === '1') {
      // present waiting for hatch button
      $scope.egg = true;

  } else {
    $scope.action_feed = true;
    $scope.action_water = true;
    $scope.action_pet = true;

  }

  var player_id = localStorage.getItem("Id");


$scope.feed = function(project_id,foodtype, foodtype_string) {

  obj = {
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

// PROJECT resourcesController
.controller('resourcesController', ['$scope', '$rootScope', '$state', '$http', '$ionicPopup', '$ionicLoading',  function($scope, $rootScope, $state, $http, $ionicPopup, $ionicLoading){

  var projectresource_guide = localStorage.getItem("projectresource_guide");

  if (projectresource_guide === "false" || projectresource_guide === undefined || projectresource_guide === null || projectresource_guide !== "true" || projectresource_guide === false) {
    // popup with player 2 invite.
    $ionicPopup.show({
      title: 'This is your pets resources',
      subTitle: "By investing in your pet and regularly feeding it and signing it up for battles, you add resources from your inventory.",
      scope: $rootScope,
      buttons: [
        { text: 'Cancel' },
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
              username: username,
              project_id: app.open_project.id,
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
                $scope.get_attacks_by_id(app.open_project.id);
                $state.reload();
              }
            });

          }
        }
      ]
    });
  }

  $scope.switch_view = function(string) {

    switch (string) {
      case 'attacks':
          $scope.title = 'Attacks';
          $rootScope.get_attacks_by_id(app.open_project.id);
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
      console.log($rootScope.project_variables[foodtype_string]);

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
          $state.reload();
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

}])

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
