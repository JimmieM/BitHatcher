angular.module('app.features.controllers')
.controller('chatController', ['$ionicScrollDelegate', '$scope','$rootScope','$http', '$state' , '$stateParams','$ionicPlatform', '$ionicLoading','$ionicPopup' ,
function($ionicScrollDelegate, $scope, $rootScope, $http, $state, $stateParams, $ionicPlatform, $ionicLoading, $ionicPopup) {

  $scope.init = function() {
    $scope.no_content = true;
    $scope.localChat_token = null;
    $scope.localChat = [];

    $scope.loadMessages();

    // setTimeout(function() {
    //   if ($scope.localChat.length > 0) {
    //     $ionicScrollDelegate.scrollBottom();
    //   }
    // }, 500);


  };

  $scope.chatting_with = $rootScope.chat.player2;

  // grab pointer to original function
  var oldSoftBack = $rootScope.$ionicGoBack;

  // override default behaviour
  $rootScope.$ionicGoBack = function() {
    $rootScope.chat.player2 = '';
    oldSoftBack();
    $ionicScrollDelegate.scrollTop();
  };

  $scope.fetchMessages = function(amount = 20) {
    console.log(amount);
    console.log($scope.localChat);
    var obj = {
      token: token,
      username_request: $rootScope.username,
      player2: $rootScope.chat.player2,
      chat_token: $scope.localChat_token,
      amount: amount
     };
     console.log(obj);

    var request = $http({
      method: "post",
      url: https_url + "/chat/load_chat.php",
      data: obj,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    request.success(function(data) {
      console.log(data);

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

            // if the param amount is less than 20, then its probably not a "load more", but the first load of the view
            // then, scroll to bottom - else, let the user read the loaded messages.
            if (amount <= 20) {
                $ionicScrollDelegate.scrollBottom();
            }


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
    request.finally(function() {
      $rootScope.$broadcast('scroll.refreshComplete'); // release refresh
    });

    // if ($rootScope.chat.player2 !== '') {
    //   setTimeout($scope.loadMessages, 3000);
    // }

  };

  var clicked = 1;
  $scope.loadMore = function() {
    console.log(clicked);
    $scope.fetchMessages((clicked++) * 20);
  }

  $scope.loadMessages = function() {
    if ($rootScope.chat.player2 !== '') {

    $scope.fetchMessages();

    var channel = realtime.channels.get($rootScope.username);
    channel.subscribe(function(message) {
      $scope.fetchMessages();
    });
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

    console.log($scope.localChat);


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
