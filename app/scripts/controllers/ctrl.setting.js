'use strict';

angular.module('myApp.controllers.setting', [ ])

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