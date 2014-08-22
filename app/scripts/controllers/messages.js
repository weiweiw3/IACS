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
            console.log('componentListCtrl', "Initial data received!");
            ionicLoading.unload();
        });
        $scope.$on('myComponent.update', function (event) {
            $scope.components.$loaded().then(function () {
                console.log('componentListCtrl', "update");
                console.log($scope.components);
            });
        });
        $scope.$on('$viewContentLoaded', function() {
            console.log('Child2 has loaded');
        });
        $scope.$on('$destroy', function() {
            console.log('Child2 is no longer necessary');
        });
//        $scope.$on("$routeChangeStart",
//            function (event, current, previous, rejection) {
//                console.log('$routeChangeStart');
//                //console.log($scope, $rootScope, $route, $location);
//            });
//        $scope.$on("$routeChangeSuccess",
//            function (event, current, previous, rejection) {
//                console.log('$routeChangeSuccess');
////                console.log($scope, $rootScope, $route, $location);
//            });
    })
    .controller('purchaseOrderHeaderCtrl',
    function ($location, $timeout, $scope, fbutil, ionicLoading) {


        ionicLoading.load();
        $scope.$parent.$watch('message.docId', function (newVal) {
            if (angular.isUndefined(newVal) || newVal == null) {
                return
            }
            $scope.syncedData = fbutil.syncArray(['metadata', 'purchaseOrderHeader',
                newVal]);//startAt

            $scope.syncedData.$loaded()
                .then(ionicLoading.unload());
//
        });
    })
    .controller('purchaseOrderItemCtrl',
    function ($location, $timeout, $scope, fbutil, ionicLoading) {

        ionicLoading.load();
        $scope.$parent.$watch('message.docId', function (newVal) {
            if (angular.isUndefined(newVal) || newVal == null) {
                return
            }
            $scope.syncedData = fbutil.syncArray(['metadata', 'purchaseOrderItem',
                newVal], {startAt: '0', limit: 3});//startAt:null,limit: 3,endAt: [1,'1']

            $scope.syncedData.$loaded()
                .then(function (data) {


                })
                .then(ionicLoading.unload());
//
        });
        $scope.isloaded = false;
        $scope.loadText ='more items';
        $scope.loadingMore = function () {

            $scope.toLoad = true;

        };
        $scope.$watch('toLoad',function(newVal){
            if (newVal===true){
                $scope.loadText ='loading';

                ionicLoading.load();
                $scope.$parent.$watch('message.docId', function (newVal) {
                    if (angular.isUndefined(newVal) || newVal == null) {
                        return
                    }
                    $scope.continued = fbutil.syncArray(['metadata', 'purchaseOrderItem',
                        newVal], {startAt: '3'});//startAt

                    $scope.continued.$loaded()
                        .then($scope.isloaded = true)
                        .then(ionicLoading.unload());
//
                });


            }
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

            console.log(data, "messageHeaderCtrl data changed!");
            $scope.syncedData.$loaded()
                .then(function (data) {
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
    .controller('myMessageListlCtrl', function (myComponent, myMessage, $stateParams, $location, $timeout, $scope, ionicLoading) {

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
    })
    .controller("SampleCtrl", ["$scope", "$timeout", function($scope, $timeout) {
        // create a Firebase reference
        var ref = new $window.Firebase("https://<your-firebase>.firebaseio.com/foo");
        // read data from Firebase into a local scope variable
        ref.on("value", function(snap) {
            // Since this event will occur outside Angular's $apply scope, we need to notify Angular
            // each time there is an update. This can be done using $scope.$apply or $timeout. We
            // prefer to use $timeout as it a) does not throw errors and b) ensures all levels of the
            // scope hierarchy are refreshed (necessary for some directives to see the changes)
            $timeout(function() {
                $scope.data = snap.val();
            });
        });
    }])
.controller('ExampleController', function ($scope, client, esFactory) {

    client.cluster.state({
        metric: [
            'cluster_name',
            'nodes',
            'master_node',
            'version'
        ]
    })
        .then(function (resp) {
            $scope.clusterState = resp;
            $scope.error = null;
        })
        .catch(function (err) {
            $scope.clusterState = null;
            $scope.error = err;

            // if the err is a NoConnections error, then the client was not able to
            // connect to elasticsearch. In that case, create a more detailed error
            // message
            if (err instanceof esFactory.errors.NoConnections) {
                $scope.error = new Error('Unable to connect to elasticsearch. ' +
                    'Make sure that it is running and listening at http://localhost:9200');
            }
        });

});
