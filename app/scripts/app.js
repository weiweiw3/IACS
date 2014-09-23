var isAuthenticated = false;
var dependencyModules = [
    'firebase.routeSecurity-ui-router',
    'firebase.utils',
    'firebase.utils.old',
    'firebase.service.login',
    'firebase.simpleLoginTools',
    'firebase.simpleLogin',
    'firebase',
    'ionic',
    'elasticsearch',
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

myApp.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});

/** AUTHENTICATION***************/

myApp.run(function ($state, simpleLogin, $rootScope) {

    simpleLogin.addToScope($rootScope);

});

/** ROOT SCOPE AND UTILS *************************/
myApp.run(['$rootScope', '$location', '$log', function ($rootScope, $location, $log, $state) {
    $rootScope.$log = $log;

    $rootScope.keypress = function (key, $event) {
        $rootScope.$broadcast('keypress', key, $event);
    };

    // this can't be done inside the .config() call because there is no access to $rootScope
    // so we hack it in here to supply it to the .config routing methods
    $rootScope.$watch('auth.authenticated', function () {
        isAuthenticated = $rootScope.auth.authenticated;
    });

    $rootScope.$watch('auth.user', function (value) {
        if (value == null) {
            console.log('user is null');
            $location.path('/login');
        }
    });
}]);








