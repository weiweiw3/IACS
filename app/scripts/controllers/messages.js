angular.module('myApp.controllers.messages', [])

    .directive('navContact',function($rootScope,syncData,ionicLoading){
        var contactRef = syncData(['users','12',
            'peers']);
//        contactRef.$on('loaded');
//        contactRef.$off('loaded');
        // Stops synchronization completely.
//        function stopSync() {
//            contactRef.$off();
//        }
        function isPeer(contactId ){

            var result = contactRef[contactId];
//            var result = contactRef['13'];
            console.log(contactId,contactRef,result);
//            stopSync();
            if (angular.isUndefined(result) || result == null){
                return false
            } else {
                return true
            }
        }
        return {
            restrict: "E",
            scope: {
                contact:"=user"
                // Use @ for One Way Text Binding
                // Use = for Two Way Binding
                // Use & to Execute Functions in the Parent Scope
            },
            controller: function ($scope,$rootScope) {
                ionicLoading.load();
                $scope.currentUser = $rootScope.auth_min.user;
                $scope.addContact = function(text){
                    console.log(text);
                };



//                function findContact(contact) {
//                    return contactRef.$child(contact);
//                }
//                findContact($scope.contact);
//                .then(function (snapshot) {
//                    if (!snapshot) {
//                        // Handle aborted transaction.
//                    } else {
//                        // Do something.
//                    }
//                }, function (err) {
//                    // Handle the error condition.c
//                });
            },
            templateUrl: '/templates/nav-contact.html',
            transclude: true,
            link: function (scope, element) {
                var contactId =scope.contact;

                scope.$watch('contact', function(newVal) {
                    if (angular.isUndefined(newVal) || newVal == null) {
                        return
                    }
                    ionicLoading.unload();
                    // do somethings with newVal
                    scope.isPeer = isPeer(scope.contact);
                    console.log(scope.contact,scope.isPeer);
                });


                scope.name = scope.contact;
//                $scope.name1 = '2';
//                $scope.contact=contact1;
                console.log(scope.contact);

            }
        };
    })
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
    .controller('messagesCtrl', function ($scope, syncData, $rootScope, ionicLoading) {

        $scope.components = syncData(['users', $rootScope.auth_min.user, 'components']);
        ionicLoading.load();
        $scope.components.$on("loaded", function () {
            console.log("Initial data received!");
            ionicLoading.unload();
        });

    })
    .controller('messageDetailCtrl', function ($location, $timeout, $scope, $stateParams, $rootScope, syncData, ionicLoading, $filter) {
        var url = $location.url(),
            params = $location.search();
        var messageId = params.key;
        $scope.message = [];
        $scope.message = syncData(['messages', messageId]);
        ionicLoading.load();
        $scope.message.$on("loaded", function () {
            console.log("Initial data received!");
            ionicLoading.unload();
        });
    })

    .controller('messagesDetailCtrl', function ($location, $timeout, $scope, $stateParams, $rootScope, syncData, ionicLoading, $filter) {
        $scope.component = $stateParams.component;
        ionicLoading.load();
        var orderBy = $filter('orderBy');
        var componentsRef = syncData(['users', $rootScope.auth_min.user, 'components', $scope.component, 'unreadCount']);
        var messageRef = syncData(['users', $rootScope.auth_min.user, 'messages', $scope.component ]);

        function objectToArray() {
            var keys = messageRef.$getIndex();
            $scope.messages = [];
            keys.forEach(function (key, i) {
                $scope.messages.push(messageRef [key]);
            });
        }

        messageRef.$on("loaded", function () {
            objectToArray();
            ionicLoading.unload();
            console.log("Initial data received!");

        });
        messageRef.$on("change", function () {
            objectToArray();
            $scope.messages = orderBy($scope.messages, 'favorite', true);
            console.log("A remote change was applied locally!");
        });
        $scope.favorite = function (key) {
            ionicLoading.load();
            messageRef[key].favorite = !messageRef[key].favorite;
            messageRef.$save(key).then(function(){
                ionicLoading.unload();
            });
        };
        function unreadToRead(key){
            messageRef[key].read = false;
        }
        $scope.goDetail = function (key) {
            unreadToRead(key);
            messageRef.$save(key).then(function () {
                recalculateUnreadCount();
                $location.path('/message').search({
                    'key': key
                });
            });

        };
        function recalculateUnreadCount() {
            componentsRef.$transaction(function (currentCount) {
                if (!currentCount) return 1;   // Initial value for counter.
                if (currentCount < 0) return;  // Return undefined to abort transaction.
                return currentCount - 1;             // Increment the count by 1.
            }).then(function (snapshot) {
                if (!snapshot) {
                    // Handle aborted transaction.
                } else {
                    // Do something.
                }
            }, function (err) {
                // Handle the error condition.c
            });
        }

        $scope.order = function (predicate, reverse) {
            console.log(predicate, reverse);
            $scope.messages = orderBy($scope.messages, predicate, reverse);
        };
    });



