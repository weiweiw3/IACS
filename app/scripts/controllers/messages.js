angular.module('myApp.controllers.messages', [])


    .filter('messageCountFilter', function () {
        return function (items) {
            var arrayToReturn = [];
            var keys = items.$getIndex();
            keys.forEach(function (key, i) {
                if (items[key].messageCount > 0) {
                    arrayToReturn.push(items[key]);
//                    console.log(i, items[key]); // Prints items in order they appear in Firebase.
                }
            });

            return arrayToReturn;
        };
    })
    .filter('unreadCountFilter', function () {
        return function (items) {
            var arrayToReturn = [];
            for (var i = 0; i < items.length; i++) {
                if (items[i].unreadCount > 1) {
                    arrayToReturn.push(items[i]);
                }
            }

            return arrayToReturn;
        };
    })
    .controller('componentListCtrl', function ($scope, ionicLoading, myComponentService) {
        $scope.components = myComponentService.array;
        ionicLoading.load();
        $scope.components.$loaded().then(function () {
//            console.log("Initial data received!");
            ionicLoading.unload();
        });

    })
    .controller('messageHeaderCtrl', function ($location, $timeout, $scope, syncData, ionicLoading) {
        var url = $location.url(),
            params = $location.search();
        var messageId = params.key;
        ionicLoading.load();

        $scope.message = syncData(['messages', messageId]).$asObject();
        $scope.message.$loaded().then(
            function () {
//                console.log($scope.message);
                ionicLoading.unload();
            }
        );
    })
    .controller('PopoverCtrl', function ($scope, $ionicPopover) {
        $ionicPopover.fromTemplateUrl('templates/my-popover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
        });
        $scope.openPopover = function ($event) {
            $scope.popover.show($event);
        };
        $scope.closePopover = function () {
            $scope.popover.hide();
        };
        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.popover.remove();
        });
    })
    .controller('messagesDetailCtrl', function (myComponentService, myMessageService, $stateParams, $location, $timeout, $scope, $rootScope, syncData, ionicLoading, $filter) {

        var currentComponentId = $scope.componentId = $stateParams.component;
        var orderBy = $filter('orderBy');
        $scope.messages = myMessageService.findMessageByComponent(currentComponentId);
        ionicLoading.load();
        $scope.messages.$loaded().then(function () {
            ionicLoading.unload();
//            console.log($scope.messages);
        });
        $scope.goDetail = function (key) {
            $scope.messages[key].read = false;
            $scope.messages.$save(key).then(function () {
                myComponentService.UnreadCountMinus(currentComponentId);
                $location.path('/message').search({
                    'key': key
                });
            });

        };
        $scope.order = function (predicate, reverse) {
            $scope.messages = orderBy($scope.messages, predicate, reverse);
        };
    });