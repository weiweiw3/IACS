var isAuthenticated = false;
var dependencyModules = [
    'firebase.utils',
    'firebase.simpleLogin',
    'firebase',
    'ionic',
//    'ui.router',
//  'elasticsearch',
    'angular-momentjs'];
var myAppComponents = [
    'myApp.routes',
//  'myApp.animate',
    'myApp.config',
    'myApp.filters',
//  'appServices',
    'myApp.directives',
    'myApp.directives.favoriteMessage',
    'myApp.directives.createTask',
    'myApp.controllers.setting',
    'myApp.controllers.login',
    'myApp.controllers.SAPUserValidation',
    'myApp.controllers.contacts',
    'myApp.controllers.chatRoom',
    'myApp.controller.ionic',
    'myApp.controllers.messagesIndex',
    'myApp.controllers.messagesInOneComponent',
    'myApp.controllers.messagesDetail',
    'myApp.controllers.messages1',
    'myApp.services.ionic',
    'myApp.services',
    'myApp.services.auth',
    'myApp.services.myComponent',
    'myApp.services.myMessage',
    'myApp.services.myTask',
    'myApp.services.myUser'
];

// Declare app level module which depends on filters, and services
var myApp = angular.module('starter', dependencyModules.concat(myAppComponents));

// do all the things ionic needs to get going
myApp.run(function ($ionicPlatform, $rootScope, FIREBASE_URL, $firebaseAuth, $firebase, $window, $location, $ionicLoading) {
    $ionicPlatform.ready(function (simpleLogin) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        $rootScope.userEmail = null;
        $rootScope.baseUrl = FIREBASE_URL;
        var authRef = new Firebase($rootScope.baseUrl);
        $rootScope.auth = $firebaseAuth(authRef);
        $rootScope.auth.$onAuth(function (authData) {
            if (authData) {
                isAuthenticated = true;
                $rootScope.authData = authData;
                console.log("Logged in email ", authData.password.email);
                console.log("Logged in as:", authData.uid);
            } else {
                isAuthenticated = false;
                console.log("Logged out");
                $ionicLoading.hide();
                $location.path('/login');
            }
        });

        $rootScope.notify = function (text) {
            $rootScope.show(text);
            $window.setTimeout(function () {
                $rootScope.hide();
            }, 1999);
        };

        $rootScope.$on("$stateChangeError",
            function (event, toState, toParams, fromState, fromParams, error) {

                // We can catch the error thrown when the $requireAuth promise is rejected
                // and redirect the user back to the home page
                if (error === "AUTH_REQUIRED") {
                    $location.path("/login");
                }
            });
    });

});

/** AUTHENTICATION***************/

myApp.run(function ($rootScope, $firebaseAuth, $firebase, $window, $ionicLoading) {

//    simpleLogin.addToScope($rootScope);

});

/** ROOT SCOPE AND UTILS *************************/
myApp.run(['$rootScope', '$location', '$log', function ($rootScope, $location, $log) {
    $rootScope.$log = $log;

    $rootScope.keypress = function (key, $event) {
        $rootScope.$broadcast('keypress', key, $event);
    };


}]);








