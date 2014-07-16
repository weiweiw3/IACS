"use strict";

angular.module('myApp.routes', [ ])

    .config(['$stateProvider', '$urlRouterProvider',function($stateProvider, $urlRouterProvider) {

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
//                authRequired: true,
                abstract: true,
                templateUrl: "templates/tabs.html"
            })


            // the pet tab has its own child nav-view and history
            .state('tab.message-index', {
                url: '/messages',
                views: {
                    'messages-tab': {
                        templateUrl: 'templates/message-index.html'
//                        controller: 'PetIndexCtrl'
                    }
                }
            })

            .state('tab.message-detail', {
                url: '/message/:messageType',
                views: {
                    'messages-tab': {
                        templateUrl: 'templates/message-detail.html',
//                        controller: 'PetDetailCtrl'
                    }
                }
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

//            .state('tab.contacts-detail', {
//                url: '/contacts/:contactId',
//                views: {
//                    'contacts-tab': {
//                        templateUrl: 'templates/contact-detail.html',
//                        controller: 'PetDetailCtrl'
//                    }
//                }
//            })

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

//        // if none of the above states are matched, use this as the fallback
//        $urlRouterProvider.otherwise('/tab/pets');

        //isAuthenticated is set below in the .run() command
        $urlRouterProvider.otherwise(
//        isAuthenticated ?  '/login' : '/tab/pets'
            function () {
                if (isAuthenticated) {
                    return '/tab/setting'
                } else {
                    return '/login'
                }
            }
        );


    }
])
;