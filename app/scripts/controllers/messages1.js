angular.module('myApp.controllers.messages1', [])
    .controller('componentManagementCtrl', function
        ($scope, $log, ionicLoading, myComponent, $ionicPopover) {
        $ionicPopover.fromTemplateUrl('my-popover1.html', {
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
        // Execute action on hide popover
        $scope.$on('popover.hidden', function () {
            // Execute action
        });
        // Execute action on remove popover
        $scope.$on('popover.removed', function () {
            // Execute action
        });
    })

    //for message-detail.html
    .controller('myMessageListlCtrl', function
        (myComponent, myMessage, $stateParams, $location, $timeout, $scope, ionicLoading) {

        $scope.component = $stateParams.component;

        $scope.messages = myMessage.getMessageList($scope.component);
        ionicLoading.load();

        $scope.messages.$loaded().then(function () {
            ionicLoading.unload();
        });
        $scope.goDetail = function (key) {
            $scope.messages[key].read = false;
            $scope.messages.$save(key).then(function () {
                myComponent.UnreadCountMinus($scope.component);
                $location.path('/message').search({
                    'key': $scope.messages[key].$id,
                    'component': $scope.component
                });
            });

        };
        $scope.order = function (predicate, reverse) {
            $scope.messages = orderBy($scope.messages, predicate, reverse);
        };
    })

    //for message.html
    .controller('messageHeaderCtrl',
    function ($location, $log, $timeout, $scope, syncData, ionicLoading,$rootScope,fbutil) {

        var currentUser, authData = $rootScope.auth.$getAuth();
        if (authData) {
            console.log("Logged in as:", authData.uid);
            currentUser = authData.uid.toString();
        } else {
            console.log("Logged out");
        }
        var params = $location.search();
        var messageId = params.key;
        var component =params.component;
        var ctrlName = 'messageHeaderCtrl' ;

        $scope.$log = $log;
        $scope.syncedData = syncData(['users',currentUser,'messages', component,messageId])
                                .$asObject();
        $scope.syncedMetaData = syncData(['users',currentUser,'messages',
            component,messageId,'metadata']).$asArray();

        $scope.syncedItemStart = syncData(['users',currentUser,'messages',
            component,messageId,'items']).$asArray();//startAt:null,limit: 3,endAt: [1,'1']

//        $scope.syncedItemStart = fbutil.syncArray(['users',currentUser,'messages',
//            component,messageId,'items'], {startAt: '0', limit: 3});//startAt:null,limit: 3,endAt: [1,'1']

        $scope.syncedItemContinue = fbutil.syncArray(['users',currentUser,'messages',
            component,messageId,'items'], {startAt: '3'});//startAt 3

        $scope.syncedData.$watch(function (data) {

            $log.info(data, ctrlName, 'data changed!');
            $scope.syncedData.$loaded()
                .then(function (data) {
                    $scope.message = data;//all the data in the scope are from here.
                    $scope.message.id = data.$id;
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
            ionicLoading.load('Content Loading...');
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
        $scope.$parent.$watch('message.id', function (newVal) {
            if (angular.isUndefined(newVal) || newVal == null) {
                return
            }

            $scope.syncedData=$scope.$parent.syncedMetaData;
//            $scope.syncedData = fbutil.syncArray(['metadata', 'purchaseOrderHeader',
//                newVal]);

            $scope.syncedData.$loaded()
                .then(ionicLoading.unload());
//
        });
    })
    .controller('purchaseOrderItemCtrl',
    function ($location, $timeout, $scope, fbutil, ionicLoading) {

        ionicLoading.load();
        $scope.$parent.$watch('message.id', function (newVal) {
            if (angular.isUndefined(newVal) || newVal == null) {
                return
            }
//            $scope.syncedData = fbutil.syncArray(['metadata', 'purchaseOrderItem',
//                newVal], {startAt: '0', limit: 3});//startAt:null,limit: 3,endAt: [1,'1']
            $scope.syncedData=$scope.$parent.syncedItemStart;
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
                $scope.$parent.$watch('message.id', function (newVal) {
                    if (angular.isUndefined(newVal) || newVal == null) {
                        return
                    }
//                    $scope.continued = fbutil.syncArray(['metadata', 'purchaseOrderItem',
//                        newVal], {startAt: '3'});//startAt
                    $scope.continued = $scope.$parent.syncedItemContinue;
                    $scope.continued.$loaded()
                        .then($scope.isloaded = true)
                        .then(ionicLoading.unload());
//
                });


            }
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
