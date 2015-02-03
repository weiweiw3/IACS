var isAuthenticated = false;
var dependencyModules = [
    'firebase.routeSecurity-ui-router',
    'firebase.utils',
    'firebase.utils.old',
    'firebase.service.login',
//  'firebase.simpleLoginTools',
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
    'myApp.controllers.setting',
    'myApp.controllers.contacts',
    'myApp.controllers.chatRoom',
    'myApp.controller.ionic',
    'myApp.controllers.messages',
    'myApp.services.ionic',
    'myApp.services'
];

// Declare app level module which depends on filters, and services
var myApp = angular.module('starter', dependencyModules.concat(myAppComponents));

// do all the things ionic needs to get going
myApp.run(function ($ionicPlatform, $rootScope, FIREBASE_URL, $firebaseAuth, $firebase, $window, $ionicLoading) {
    $ionicPlatform.ready(function () {
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
            $rootScope.authData = authData;
        });


        $rootScope.notify = function (text) {
            $rootScope.show(text);
            $window.setTimeout(function () {
                $rootScope.hide();
            }, 1999);
        };

        $rootScope.logout = function () {
            $rootScope.auth.$logout();
            $rootScope.hide();
            $rootScope.checkSession();
        };

        $rootScope.checkSession = function () {
            console.log('$rootScope.checkSession');
            var auth = new FirebaseSimpleLogin(authRef, function (error, user) {
                if (error) {
                    // no action yet.. redirect to default route
                    $rootScope.userEmail = null;
                    $window.location.href = '#/login';
                } else if (user) {
                    // user authenticated with Firebase
                    $rootScope.userEmail = user.email;
                    $window.location.href = ('#/tab/setting');
                } else {
                    // user is logged out
                    $rootScope.userEmail = null;
                    $window.location.href = '#/login';
                }
            });
        }
    });

    // this can't be done inside the .config() call because there is no access to $rootScope
    // so we hack it in here to supply it to the .config routing methods
    $rootScope.$watch('authData', function (value) {
        if (typeof value != 'undefined') {
            isAuthenticated = true;
            console.log(value, $rootScope.authData.uid);
        }
//        else{
//            console.log('user is null');
//            $location.path('/login');
//        }

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








