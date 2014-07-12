
var isAuthenticated = false;
//var dependencyModules = ['ngSanitize', 'ui.bootstrap', 'ui.keypress', 'firebase.routeSecurity',
//    'firebase.utils', 'angularFireAggregate', 'ngRoute'];
var dependencyModules = ['firebase.routeSecurity','firebase.utils',
    'angularFireAggregate','firebase','ionic', 'starter.services'];
var myAppComponents = [
//    'myApp.utils',
//    'myApp.animate',
    'myApp.config'
//    'myApp.filters',
//    'myApp.services',
//    'appServices',
//    'myApp.directives',
//    'myApp.controllers'
];

// Declare app level module which depends on filters, and services
var myApp = angular.module('starter', dependencyModules.concat(myAppComponents));

//var myApp = angular.module('starter', ['myApp.config','ionic', 'starter.services', 'firebase']);

//.run(function($ionicPlatform) {
//    $ionicPlatform.ready(function() {
//        if(window.StatusBar) {
//            StatusBar.styleDefault();
//        }
//    });
//});

myApp.run(function($rootScope, FBURL, $firebaseSimpleLogin, $state, $window) {

    var dataRef = new Firebase(FBURL);
    var loginObj = $firebaseSimpleLogin(dataRef);

    loginObj.$getCurrentUser().then(function(user) {
        if(!user){
            // Might already be handled by logout event below
            $state.go('login');
        }
    }, function(err) {
    });

    $rootScope.$on('$firebaseSimpleLogin:login', function(e, user) {
        $state.go('home_landing');
    });

    $rootScope.$on('$firebaseSimpleLogin:logout', function(e, user) {
        console.log($state);
        $state.go('login');
    });
})
  .config(function($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the varimodule.routeSecurity.jsous states which the app can be in.
        $stateProvider
            // setup an login page
            .state('login', {
                url: "/login",
                templateUrl: "templates/login.html",
                controller: 'LoginCtrl'
            })

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })


            .state('home_landing', {
                url: '/tab',

                templateUrl: "templates/tabs.html"

            })

            // the pet tab has its own child nav-view and history
            .state('tab.pet-index', {
                url: '/pets',
                views: {
                    'pets-tab': {
                        templateUrl: 'templates/pet-index.html',
                        controller: 'PetIndexCtrl'
                    }
                }
            })

            .state('tab.pet-detail', {
                url: '/pet/:petId',
                views: {
                    'pets-tab': {
                        templateUrl: 'templates/pet-detail.html',
                        controller: 'PetDetailCtrl'
                    }
                }
            })

            .state('tab.adopt', {
                url: '/adopt',
                views: {
                    'adopt-tab': {
                        templateUrl: 'templates/adopt.html'
                    }
                }
            })
            .state('tab.components', {
                url: '/components',
                views: {
                    'components-tab': {
                        templateUrl: 'templates/components.html'
                    }
                }
            })
            .state('tab.setting', {
                url: '/setting',
                views: {
                    'setting-tab': {
                        templateUrl: 'templates/setting.html'
//                    controller: 'settingCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/pets');

    });



