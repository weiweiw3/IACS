'use strict';

angular.module('myApp.controllers.setting', [ ])
    .controller('LogoutCtrl',
    function ($scope, simpleLogin, $location, ionicLoading, $log, $ionicActionSheet) {
        $scope.$watch('action', function (data) {
            if (data !== true) {
                return
            }
//            ionicLoading.load('logout......');
            simpleLogin.logout();
        });
//        $scope.$on('$firebaseSimpleLogin:logout', function(){
//        $scope.$watch('$firebaseAuth:unauth', function(){
//
//            ionicLoading.unload();
//        });
        $scope.tryLogout = function () {
            var destructiveText = 'Logout', cancelText = 'Cancel';
            $scope.action = false;

            $ionicActionSheet.show({
                destructiveText: destructiveText + ' <i class="icon ion-log-out">',
                cancelText: cancelText,
                cancel: function () {
                    $scope.action = false;
                    $scope.message('logout');
                },

                destructiveButtonClicked: function () {
                    $scope.action = true;
                    $scope.message('logout');
                }
            });

        };
        $scope.message = function (msg) {
            console.info('User pressed ', msg);
        };
    })

    .controller('setting.profileCtrl', function ($scope, syncData, $rootScope) {
        $scope.items = ['settings', 'home', 'other'];
        /*triple data binding*/
        $scope.syncProfile = function () {

//          $scope.profile = {};
            syncData(['users', $rootScope.auth.user, 'profile']).$asObject()
                .$bindTo($scope, 'profile')
                .then(function (unBind) {
                    $scope.unBindProfile = unBind;
                })
            ;
        };
        // set initial binding
        $scope.syncProfile();

        $scope.unBindData = function () {
            // disable bind to prevent junk data being left in firebase
            $scope.unBindProfile();
        };


    })
;