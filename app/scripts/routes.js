// Ionic uses AngularUI Router which uses the concept of states
// Learn more here: https://github.com/angular-ui/ui-router
// Set up authRequired for routeSecurity-ui-router: True states which the app can be in.

"use strict";

angular.module('myApp.routes', ['firebase.simpleLogin' ])

    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('login', {            // setup an login page
                    url: "/login",
                    templateUrl: "templates/login.html",
                    controller: 'LoginCtrl'
                })

                .state('tab', {            // setup an abstract state for the tabs directive
                    url: "/tab",
                    authRequired: true,
                    abstract: true,
                    templateUrl: "templates/tabs.html"
                })

                .state('tab.messages', {            // the message tab has its own child nav-view and history
                    url: '/messages',
                    authRequired: true,
                    views: {
                        'messages-tab': {
                            templateUrl: 'templates/message-index.html'
                        }
                    }
//                    ,
//                    resolve: {
//                        // forces the page to wait for this promise to resolve before controller is loaded
//                        // the controller can then inject `user` as a dependency. This could also be done
//                        // in the controller, but this makes things cleaner (controller doesn't need to worry
//                        // about auth status or timing of displaying its UI components)
//                        user: ['simpleLogin', function (simpleLogin) {
//                            return simpleLogin.getUser();
//                        }]
//                    }
                })

                .state('message-detail', {
                    url: '/message/:component',
                    templateUrl: 'templates/message-detail.html'

                })
                .state('message', {
                    url: '/message',
                    templateUrl: 'templates/message.html'

                })
                .state('components-management', {
                    url: '/components-management',
                    templateUrl: 'templates/components-management.html'

                })
                // the contacts tab has its own child nav-view and history
                .state('tab.contacts', {
                    url: '/contacts',
                    authRequired: false,
                    views: {
                        'contacts-tab': {
                            templateUrl: 'templates/contacts.html'
                        }
                    }
                })

                .state('contacts-detail', {
                    url: '/contacts/:contactId',
                    templateUrl: 'templates/contact-detail.html'
                })

                // the components tab has its own child nav-view and history
                .state('tab.components', {
                    url: '/components',
                    authRequired: true,
                    views: {
                        'components-tab': {
                            templateUrl: 'templates/components.html',
                            controller: 'componentsCtrl'
                        }
                    }
                })

                // the setting tab has its own child nav-view and history
                .state('tab.setting', {
                    url: '/setting',
                    authRequired: true,
                    views: {
                        'setting-tab': {
                            templateUrl: 'templates/setting.html',
                            controller: 'LoginCtrl'
                        }
                    }
                })
                .state('tab.profile-detail', {
                    url: '/myprofile',
                    views: {
                        'setting-tab': {
                            authRequired: true,
                            templateUrl: 'templates/profile-detail.html'
                        }
                    }
                })
            ;

            // if none of the above states are matched, use this as the fallback
            //isAuthenticated is set below in the .run() command
            $urlRouterProvider.otherwise(
                function () {

                    if (isAuthenticated) {
                        return '/tab/messages'
                    } else {
                        return '/login'
                    }
                }
            );
        }



    ]);
///**
// * Apply some route security. Any route's resolve method can reject the promise with
// * { authRequired: true } to force a redirect. This method enforces that and also watches
// * for changes in auth status which might require us to navigate away from a path
// * that we can no longer view.
// */
//    .run(['$rootScope', '$location', 'simpleLogin', 'ROUTES', 'loginRedirectPath',
//        function ($rootScope, $location, simpleLogin, ROUTES, loginRedirectPath) {
//            // watch for login status changes and redirect if appropriate
//            simpleLogin.watch(check, $rootScope);
//
//            // some of our routes may reject resolve promises with the special {authRequired: true} error
//            // this redirects to the login page whenever that is encountered
//            $rootScope.$on("$routeChangeError", function (e, next, prev, err) {
//                if (angular.isObject(err) && err.authRequired) {
//                    $location.path(loginRedirectPath);
//                }
//            });
//
//            function check(user) {
//                // used by the changeEmail functionality so the user
//                // isn't redirected to the login screen while we switch
//                // out the accounts (see changeEmail.js)
//                if ($rootScope.authChangeInProgress) {
//                    return;
//                }
//                if (!user && authRequired($location.path())) {
//                    $location.path(loginRedirectPath);
//                }
//            }
//
//            function authRequired(path) {
//                return ROUTES.hasOwnProperty(path) && ROUTES[path].authRequired;
//            }
//        }
//    ]);