/**
 * Created by c5155394 on 2015/2/5.
 */
'use strict';

angular.module('myApp.controllers.login', [ ])
    .controller('loginCtrl', function
        ($scope, simpleLogin, $location, ionicLoading, $log, $state,$rootScope) {
        $scope.logindata = {
            email: '',
            pass: '',
            remember: true
        };
        $scope.$log = $log;
        $scope.tryLogin = function () {
//            if(assertValidAccountProps()){
            ionicLoading.load('login......');
            simpleLogin.login($scope.logindata.email,
                $scope.logindata.pass)
                .then(function (/* user */) {
                    ionicLoading.unload();
                    $state.go('tab.messages');
                }, function (err) {
                    $log.error(errMessage(err));
                    ionicLoading.unload();
                    $scope.err = errMessage(err);
                });

//            }

        };

        function assertValidAccountProps() {
            if (!$scope.logindata.email) {
                $scope.err = 'Please enter an email address';
            }
            else if (!$scope.logindata.pass ) {
                $scope.err = 'Please enter a password';
            }
            console.log($scope.logindata.email,$scope.logindata.pass,$scope.logindata.remember,$scope.err);
            return !$scope.err;
        }

        function errMessage(err) {
            return angular.isObject(err) && err.code ? err.code : err + '';
        }
    });
