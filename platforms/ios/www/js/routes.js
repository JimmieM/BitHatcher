angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js

  $stateProvider

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  .state('tabsController.battles', {
    url: '/page2',
    views: {
      'battles': {
        templateUrl: 'templates/battles.html',
        controller: 'battlesCtrl'
      }
    }
  })


.state('tabsController.users', {
  url: '/users',
  views: {
    'users': {
      templateUrl: 'templates/all_users.html',
      controller: 'usersCtrl'
    }
  }
})


.state('tabsController.chat', {
  url: '/chat',
  views: {
    'users': {
      templateUrl: 'templates/chat.html',
      controller: 'chatCtrl'
    }
  }
})



  .state('tabsController.projects', {
    url: '/projects',
    views: {
      'projects': {
        templateUrl: 'templates/projects.html',
        controller: 'projectsCtrl'
      }
    }
  })

  .state('tabsController.recent_battles', {
    url: '/recent_battles',
    views: {
      'battles': {
        templateUrl: 'templates/recent_battles.html',
        controller: 'recentBattlesCtrl'
      }
    }
  })


  .state('tabsController.achievements', {
    url: '/achievements',
    views: {
      'projects': {
        templateUrl: 'templates/achievements.html',
        controller: 'achievementsCtrl'
      }
    }
  })

  .state('tabsController.inventory', {
    url: '/inventory',
    views: {
      'projects': {
        templateUrl: 'templates/inventory.html',
        controller: 'inventoryCtrl'
      }
    }
  })

    .state('tabsController.userResources', {
      url: '/userResources',
      views: {
        'projects': {
          templateUrl: 'templates/userResources.html',
          controller: 'userResourcesCtrl'
        }
      }
    })


  .state('tabsController.project', {
    url: '/page9',
    views: {
      'projects': {
        templateUrl: 'templates/project.html',
        controller: 'projectCtrl',
        params: {project: "null"}, // EXIT: still doesnt work
      }
    }
  })

        // project resources
        .state('tabsController.resources', {
          url: '/resources',
          views: {
            'projects': {
              templateUrl: 'templates/projectViews/resources.html',
              controller: 'resourcesCtrl'
            }
          }
        })

        // project resources
        .state('tabsController.shower', {
          url: '/shower',
          views: {
            'tab2': {
              templateUrl: 'templates/projectViews/shower.html',
              controller: 'showerCtrl'
            }
          }
        })


  .state('cartTabDefaultPage', {
    url: '/page3',
    views: {
      'tab2': {
        templateUrl: 'templates/cartTabDefaultPage.html',
        controller: 'cartTabDefaultPageCtrl'
      }
    }
  })

  .state('tabsController.shop', {
    url: '/shop',
    views: {
      'projects': {
        templateUrl: 'templates/shop.html',
        controller: 'shopCtrl'
      }
    }
  })

  .state('tabsController.profile', {
    url: '/profile',
    views: {
      'projects': {
        templateUrl: 'templates/profile.html',
        controller: 'profileCtrl'
      }
    }
  })

  // .state('tabsController.users', {
  //   url: '/users',
  //   views: {
  //     'projects': {
  //       templateUrl: 'templates/all_users.html',
  //       controller: 'usersCtrl'
  //     }
  //   }
  // })




  .state('tabsController.settings', {
    url: '/settings',
    views: {
      'projects': {
        templateUrl: 'templates/settings.html',
        controller: 'settingsCtrl'
      }
    }
  })

  .state('tabsController.versions', {
    url: '/settings',
    views: {
      'projects': {
        templateUrl: 'templates/versions.html',
        controller: 'versionsCtrl'
      }
    }
  })

  .state('login', {
    url: '/page5',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })


  .state('signup', {
    url: '/page6',
    templateUrl: 'templates/signup.html',
    controller: 'signupCtrl'
  })

  .state('terms', {
    url: '/terms',
    templateUrl: 'templates/terms.html',
    controller: 'termsCtrl'
  })

  .state('recover', {
    url: '/recover',
    templateUrl: 'templates/recover.html',
    controller: 'recoverCtrl'
  })

  .state('tabsController.newProject', {
    url: '/page7',
    views: {
      'projects': {
        templateUrl: 'templates/newProject.html',
        controller: 'newProjectCtrl'
      }
    }
  })

  // first-time using application states



  .state('firstGuide', {
    url: '/guide-1',
    templateUrl: 'templates/guide/firstGuide.html',
    controller: 'firstGuideCtrl'
  })

  .state('secondGuide', {
    url: '/guide-2',
    templateUrl: 'templates/guide/secondGuide.html',
    controller: 'secondGuideCtrl'
  })

  .state('thirdGuide', {
    url: '/guide-3',
    templateUrl: 'templates/guide/thirdGuide.html',
    controller: 'thirdGuideCtrl'
  })

  .state('fourthGuide', {
    url: '/guide-4',
    templateUrl: 'templates/guide/fourthGuide.html',
    controller: 'fourthGuideCtrl'
  })

  LoggedIn = JSON.parse(localStorage.getItem("LoggedIn"));
  if (!LoggedIn) {

    // redirect to guide if not completed..
    guideCompleted = localStorage.getItem("GuideCompletion");
    if (!guideCompleted) {
      $urlRouterProvider.otherwise('/guide-1');
      //$state.go('firstGuide');
    } else {
      $urlRouterProvider.otherwise('/page5');
      //$state.go('login');
      //console.log("Redirct to login");
    }


  } else {
    $urlRouterProvider.otherwise('/page1/projects');
    //$state.go('tabsController.projects');
  }
});
