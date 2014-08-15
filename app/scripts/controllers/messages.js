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
    .controller('componentListCtrl', function ($scope, ionicLoading, myComponent) {
        $scope.components = myComponent.array;
        ionicLoading.load();
        $scope.components.$loaded().then(function () {
            console.log('componentListCtrl',"Initial data received!");
            ionicLoading.unload();
        });
        $scope.$on( 'myComponent.update', function( event ) {
            $scope.components.$loaded().then(function () {
            console.log('componentListCtrl',"update");
                console.log(    $scope.components);
            });
        });
    })
    .controller('purchaseOrderHeaderCtrl',
        function ($location, $timeout, $scope, fbutil, ionicLoading) {


            $scope.$parent.$watch('message.docId', function (newVal) {
                if (angular.isUndefined(newVal) || newVal == null) {
                    return
                }
                console.log(newVal);
                $scope.syncedData = fbutil.syncObject(['metadata','purchaseOrderHeader',
                    newVal]);
                $scope.syncedData.$loaded()
                    .then(function(data){
                        angular.forEach(data, function(value , key) {
                            console.log(value+"--"+key)
                        });
//                        //all the data in the scope are from here.
//                        $scope.message = {
//                            "id": data.$id,
//                            "component": data.component,
//                            "docId": data.docId,
//                            "last": data.last,
//                            "statusPre": data.statusPre,
//                            "statusCur": data.statusCur,
//                            "statusNext": data.statusNext,
//                            "title": data.title,
//                            "userFrom": data.userFrom,
//                            "userTo": data.userTo,
//                            "locked": data.locked,
//                            "lockedBy": data.lockedBy,
//                            "lockedDate": data.lockedDate
//                        };
////                    console.log($scope.message);
////
                    });
//                    .then(ionicLoading.unload());
            });
        })
    .controller('messageHeaderCtrl', function ($location, $timeout, $scope, syncData, ionicLoading) {
        var url = $location.url(),
            params = $location.search();
        var messageId = params.key;
        ionicLoading.load();
        $scope.message = {};
        $scope.syncedData = syncData(['messages', messageId]).$asObject();
        $scope.syncedData.$watch(function (data) {

            console.log(data,"messageHeaderCtrl data changed!");
            $scope.syncedData.$loaded()
                .then(function(data){
                    //all the data in the scope are from here.
                    $scope.message = {
                        "id": data.$id,
                        "component": data.component,
                        "docId": data.docId,
                        "last": data.last,
                        "statusPre": data.statusPre,
                        "statusCur": data.statusCur,
                        "statusNext": data.statusNext,
                        "title": data.title,
                        "userFrom": data.userFrom,
                        "userTo": data.userTo,
                        "locked": data.locked,
                        "lockedBy": data.lockedBy,
                        "lockedDate": data.lockedDate
                    };
//                    console.log($scope.message);

                })
                .then(ionicLoading.unload());
        });

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
    .controller('myMessageListlCtrl', function (myComponent, myMessage,
              $stateParams, $location, $timeout,$scope, ionicLoading) {

        $scope.component = $stateParams.component;

        $scope.messages = myMessage.getMessageList($scope.component);
        ionicLoading.load();

        $scope.messages.$loaded().then(function () {
            ionicLoading.unload();
//            console.log($scope.messages);
        });
        $scope.goDetail = function (key) {
            $scope.messages[key].read = false;
            $scope.messages.$save(key).then(function () {
                myComponent.UnreadCountMinus($scope.component);
                $location.path('/message').search({
                    'key': $scope.messages[key].$id
                });
            });

        };
        $scope.order = function (predicate, reverse) {
            $scope.messages = orderBy($scope.messages, predicate, reverse);
        };
    });