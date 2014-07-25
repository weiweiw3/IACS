// Ionic uses AngularUI Router which uses the concept of states
// Learn more here: https://github.com/angular-ui/ui-router
// Set up authRequired for routeSecurity-ui-router: True states which the app can be in.

"use strict";

angular.module('myApp.routes', [ ])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('login', {            // setup an login page
                url: "/login",
                templateUrl: "templates/login.html",
                controller: 'LoginCtrl'
            })

            .state('tab', {            // setup an abstract state for the tabs directive
                url: "/tab",
//                authRequired: true,
                abstract: true,
                templateUrl: "templates/tabs.html"
            })

            .state('tab.message-index', {            // the message tab has its own child nav-view and history
                url: '/messages',
                authRequired: true,
                views: {
                    'messages-tab': {
                        templateUrl: 'templates/message-index.html'
                    }
                }
            })

            .state('message-detail', {
                url: '/message/:component',
                templateUrl: 'templates/message-detail.html'

            })
            .state('message', {
                url: '/message',
                templateUrl: 'templates/message.html'

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

            .state('tab.contacts-detail', {
                url: '/contacts/:contactId',
                views: {
                    'contacts-tab': {
                        templateUrl: 'templates/contact-detail.html'
                    }
                }

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