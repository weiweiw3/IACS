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

    //for message-list.html
    //get message list with factory myMessage
    //update unread number with factory myComponent
    .controller('messageListCtrl', function
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
    function ($location, $log, $timeout, $scope, syncData, ionicLoading, simpleLogin) {

        var currentUser = simpleLogin.user.uid;
        var params = $location.search();
        var messageId = params.key;
        var component = params.component;
        var ctrlName = 'messageHeaderCtrl';
        var messageRef = $scope.messageRef = 'users' + '/' + currentUser + '/' + 'messages' + '/' + component + '/' + messageId;
        var metadataRef = $scope.metadataRef = 'users' + '/' + currentUser + '/' + 'messageMetadata' + '/' + component + '/' + messageId;

        $scope.$log = $log;
        $scope.syncedData = syncData([messageRef, 'data']).$asObject();

        $scope.syncedMetaData = syncData([metadataRef]).$asArray();

        $scope.syncedItemStart = syncData([messageRef, 'items']).$asArray();//startAt:1,limit: 5

        $scope.syncedItemContinue = syncData([messageRef, 'moreItems']).$asArray();//startAt 6

        $scope.syncedData.$watch(function (data) {

            $log.info(data, ctrlName, 'data changed!');
            $scope.syncedData.$loaded()
                .then(function (data) {
                    $scope.message = data;//all the data in the scope are from here.
//                    $scope.message.id = data.$id;
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

    .controller('messageItemCtrl',
    function ($location, $timeout, $scope, syncData, ionicLoading) {
        ionicLoading.load();
        var messageRef = $scope.$parent.messageRef;

        $scope.syncedItemStart = syncData([messageRef, 'items']).$asArray();//startAt:1,limit: 5

        $scope.syncedItemStart.$loaded()
            .then(ionicLoading.unload());

        $scope.isloaded = false;

        $scope.loadText = 'more items';

        $scope.loadingMore = function () {
            $scope.toLoad = true;
        };

        $scope.$watch('toLoad', function (newVal) {
            if (newVal === true) {
                $scope.loadText = 'loading';
                ionicLoading.load();
                $scope.continued = syncData([messageRef, 'moreItems']).$asArray();//startAt 6
                $scope.continued.$loaded()
                    .then($scope.isloaded = true)
                    .then(ionicLoading.unload());

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
