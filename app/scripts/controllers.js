//angular.module('starter.controllers', ['ionic'])


// A simple controller that fetches a list of data from a service
myApp.controller('PetIndexCtrl', function($scope, PetService) {
  // "Pets" is a service returning mock data (services.js)
  $scope.pets = PetService.all();
})
// A simple controller that shows a tapped item's data
.controller('PetDetailCtrl', function($scope, $stateParams, PetService) {
  // "Pets" is a service returning mock data (services.js)
  $scope.pet = PetService.get($stateParams.petId);
})
.directive('d1',function(){
        return {
            restrict: "E",
            templateUrl: 'templates/d1.html'

        }

    })
    .controller('settingCtrl',function($scope,$state, $firebaseSimpleLogin){
        var dataRef = new Firebase("https://rm-demo.firebaseio.com/");
        $scope.loginObj = $firebaseSimpleLogin(dataRef);
        $scope.logout = function(){
            console.log('xx');
//            $scope.loginObj.$login();
        };
    })

.controller('LoginCtrl', function($scope,$state, $firebaseSimpleLogin) {
        $scope.loginData = {};

        var dataRef = new Firebase("https://rm-demo.firebaseio.com/");
        $scope.loginObj = $firebaseSimpleLogin(dataRef);

        $scope.tryLogin = function() {
            $scope.loginObj.$login('password', {
                    email: $scope.loginData.email,
                    password: $scope.loginData.password,
                    rememberMe: true
                }
            ).then(function(user) {
                console.log('success');
                $state.go('home_landing');
                // The root scope event will trigger and navigate
            }, function(error) {
                // Show a form error here
                console.error('Unable to login', error);
            });
        };
    });