
var isAuthenticated = false;
var dependencyModules = [
    'firebase.routeSecurity-ui-router',
    'firebase.utils',
    'firebase.service.login',
    'angularFireAggregate',
    'firebase.simpleLoginTools',
    'firebase',
    'ionic' ];
var myAppComponents = [
    'myApp.utils',
    'myApp.routes',
//  'myApp.animate',
    'myApp.config',
    'myApp.filters',
    'myApp.services',
//  'appServices',
    'myApp.directives',
    'myApp.controllers',
    'myApp.contacts'
];

// Declare app level module which depends on filters, and services
var myApp = angular.module('starter', dependencyModules.concat(myAppComponents));

myApp.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});

myApp
    .run(['$state','loginService', '$rootScope', 'FIREBASE_URL','$firebaseSimpleLogin',
        function($state,loginService, $rootScope, FIREBASE_URL,$firebaseSimpleLogin) {

            // establish authentication
            $rootScope.auth = loginService.init('/login');
            $rootScope.FBURL = FIREBASE_URL;

            $rootScope.auth.$getCurrentUser().then(function(user) {
                if(!user){
                    // Might already be handled by logout event below
                    $state.go('login');
                }
            }, function(err) {
            });

            /** AUTHENTICATION
             ***************/
            loginService.addToScope($rootScope);
            // this can't be done inside the .config() call because there is no access to $rootScope
            // so we hack it in here to supply it to the .config routing methods
            $rootScope.$watch('auth_min.authenticated', function() {
                isAuthenticated = $rootScope.auth_min.authenticated;
            });
//            $rootScope.$on('$firebaseSimpleLogin:login', function(e, user) {
//                    $state.go('tab.pet-index');
//            });
//
//            $rootScope.$on('$firebaseSimpleLogin:logout', function(e, user) {
//                    $state.go('login');
//            });
        }])
/** ROOT SCOPE AND UTILS
 *************************/
    .run(['$rootScope', '$location', '$log', function($rootScope, $location, $log) {
        $rootScope.$log = $log;

        $rootScope.keypress = function(key, $event) {
            $rootScope.$broadcast('keypress', key, $event);
        };


//        //todo make this a service?
//        $rootScope.redirectPath = null;
//        $rootScope.$on('$routeUpdate', function(event, next, current) {
//            $rootScope.activeFeed = next.params.feed || false;
//            next.scope && (next.scope.activeFeed = next.params.feed||false);
//        });
//
//        $rootScope.$on("$routeChangeStart", function (event, next, current) {
//            $rootScope.activeFeed = next.params.feed || false;
//            next.scope && (next.scope.activeFeed = next.params.feed||false);
//        });
    }]);








