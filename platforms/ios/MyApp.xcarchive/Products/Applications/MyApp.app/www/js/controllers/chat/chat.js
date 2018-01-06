angular.module('app.features.controllers')
.controller('chatController', ['$ionicScrollDelegate', '$scope','$rootScope','$http', '$state' , '$stateParams','$ionicPlatform', '$ionicLoading','$ionicPopup' ,
function($ionicScrollDelegate, $scope, $rootScope, $http, $state, $stateParams, $ionicPlatform, $ionicLoading, $ionicPopup) {

  $scope.init = function() {
    $scope.no_content = true;
    $scope.localChat_token = null;

    $scope.loadMessages();

    setTimeout(function() {
      if ($scope.localChat.length > 0) {
        $ionicScrollDelegate.scrollBottom();
      }
    }, 500);


  };

  $scope.localChatting_with = $rootScope.chat.player2;

  // grab pointer to original function
  var oldSoftBack = $rootScope.$ionicGoBack;

  // override default behaviour
  $rootScope.$ionicGoBack = function() {
    $rootScope.chat.player2 = '';
    oldSoftBack();
    $ionicScrollDelegate.scrollTop();
  };

  $scope.loadMessages = function() {
    var obj = {
      token: token,
      username: $rootScope.username,
      player2: $rootScope.chat.player2,
      chat_token: $scope.localChat_token
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
        $rootScope.chat.player2 = '';
      }
      if (data !== null || data.length > 0) {

        // check if token is unrecognized  || changed.
        if (data.success == 1) {
          if (data.valid_token !== 1) {
            for (var j = 0; j < data.chats.length; j++) {
              data.chats[j].player_avatar = $rootScope.build_avatar(data.chats[j].player_avatar);
            }
            $scope.localChat_token = data.current_token;

            $scope.localChat = data.chats;
            $ionicScrollDelegate.scrollBottom();
          } else {
            $scope.localChat;
          }
        }


      } else {
        $scope.localChat = false;

      }
    });

    request.error(function(data) {
      $rootScope.chat.player2 = '';
      $rootScope.popup_notice('There was an error', data);

    });
    console.log($rootchat);
    if ($rootScope.chat.player2 !== '') {
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
      to: $rootScope.chat.player2,
      from: $rootScope.username,
      message: $scope.chat_message
     };

    var request = $http({
      token: token,
      method: "post",
      url: https_url + "/chat/new_message.php",
      data: obj,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    $scope.chat_message_backup = $scope.localChat_message;
    $scope.chat_message = ''; // clear input field.
    $scope.no_content = true;


    request.success(function(data) {
      data = data[0];
      chat_ = data.chat.chats;

      $scope.localChat_token = data.token;
      if (data.success === 1) {
        for (var j = 0; j < chat_.length; j++) {
          chat_[j].player_avatar = $rootScope.build_avatar(chat_[j].player_avatar);
        }

        $scope.localChat = chat_;

        $ionicScrollDelegate.scrollBottom();
      } else {
        $scope.chat_message = $scope.chat_message_backup;
      }
    });
  };
}])
