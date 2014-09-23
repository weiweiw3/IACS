angular.module('myApp.controllers.messages', [])
    .controller('componentManagementCtrl', function
        ($scope, $log, ionicLoading, myComponent,$ionicPopover) {
        $ionicPopover.fromTemplateUrl('my-popover1.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });
        $scope.openPopover = function($event) {
            $scope.popover.show($event);
        };
        $scope.closePopover = function() {
            $scope.popover.hide();
        };
        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.popover.remove();
        });
        // Execute action on hide popover
        $scope.$on('popover.hidden', function() {
            // Execute action
        });
        // Execute action on remove popover
        $scope.$on('popover.removed', function() {
            // Execute action
        });
    })

        //for message-index.html
    .controller('componentListCtrl', function ($scope, $log, ionicLoading, myComponent) {
        var ctrlName = 'componentListCtrl';
        $scope.components = myComponent.array;
        $scope.$log = $log;

        $scope.components.$loaded().then(function () {
            $log.info(ctrlName, "Initial data received!");
            ionicLoading.unload();
        });
        $scope.$on('myComponent.update', function (event) {
            $scope.components.$loaded().then(function () {
                $log.info(ctrlName, "myComponent.update");
            });
        });
        $scope.$on('$viewContentLoaded', function () {
            ionicLoading.load('loading Message');
            $log.info(ctrlName, 'has loaded');
//            $log.log();
//            $log.warn(message)
//            $log.info(message)
//            $log.error(message)
        });
        $scope.$on('$destroy', function () {
            ionicLoading.unload();
            $log.info(ctrlName, 'is no longer necessary');
        });

        $scope.data = {
            showDelete: false
        };

        $scope.edit = function(item) {
            alert('Edit Item: ' + item.id);
        };
        $scope.share = function(item) {
            alert('Share Item: ' + item.id);
        };

        $scope.moveItem = function(item, fromIndex, toIndex) {
            $scope.components.splice(fromIndex, 1);
            $scope.components.splice(toIndex, 0, item);
        };

        $scope.onItemDelete = function(item) {
            $scope.components.splice($scope.components.indexOf(item), 1);
        };
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
    //for message-detail.html
    .controller('myMessageListlCtrl', function
        (myComponent, myMessage, $stateParams, $location, $timeout, $scope, ionicLoading) {

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
    //for message.html
    .controller('messageHeaderCtrl',
    function ($location, $log, $timeout, $scope, syncData, ionicLoading) {
        var params = $location.search();
        var messageId = params.key;
        var ctrlName = 'messageHeaderCtrl';
        $scope.$log = $log;
        $scope.syncedData = syncData(['messages', messageId]).$asObject();

        $scope.syncedData.$watch(function (data) {

            $log.info(data, ctrlName, 'data changed!');
            $scope.syncedData.$loaded()
                .then(function (data) {
                    $scope.message = data;//all the data in the scope are from here.
                    $scope.message.id=data.$id;
                    angular.forEach($scope.message, function (value, key) {
                        if (!key.indexOf('$')) {
                            delete $scope.message[key];
                        }

                    });
//                    console.log($scope.message);
                })
                .then(ionicLoading.unload());
        });
        $scope.$on('$viewContentLoaded', function () {
            ionicLoading.load('xxx');
            $log.info(ctrlName, 'has loaded');
        });
        $scope.$on('$destroy', function () {
//            $scope.syncedData.$destroy();
            ionicLoading.unload();
            console.log(ctrlName, 'is no longer necessary');
        });

    })
    .controller('purchaseOrderHeaderCtrl',
    function ($location, $timeout, $scope, fbutil, ionicLoading) {
        ionicLoading.load();
        $scope.$parent.$watch('message.docId', function (newVal) {
            if (angular.isUndefined(newVal) || newVal == null) {
                return
            }
            $scope.syncedData = fbutil.syncArray(['metadata', 'purchaseOrderHeader',
                newVal]);

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
        $scope.loadText = 'more items';
        $scope.loadingMore = function () {

            $scope.toLoad = true;

        };
        $scope.$watch('toLoad', function (newVal) {
            if (newVal === true) {
                $scope.loadText = 'loading';

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

    .controller('PopoverCtrl',
    function ($scope, $ionicPopover) {
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

    .controller("SampleCtrl", ["$scope", "$timeout", function ($scope, $timeout) {
        // create a Firebase reference
        var ref = new $window.Firebase("https://<your-firebase>.firebaseio.com/foo");
        // read data from Firebase into a local scope variable
        ref.on("value", function (snap) {
            // Since this event will occur outside Angular's $apply scope, we need to notify Angular
            // each time there is an update. This can be done using $scope.$apply or $timeout. We
            // prefer to use $timeout as it a) does not throw errors and b) ensures all levels of the
            // scope hierarchy are refreshed (necessary for some directives to see the changes)
            $timeout(function () {
                $scope.data = snap.val();
            });
        });
    }]);
