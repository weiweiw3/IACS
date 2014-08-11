angular.module('myApp.controllers.messages', [])

    .directive('favoriteMessage', function ($rootScope, myMessageService, $animate) {
        return {
            restrict: "EA",
            scope: {
                component: "=component",
                messageId: "=messageId"
            },

            replace: true,

            link: function ($scope, element, attrs) {
                var favorite = myMessageService.messageFavorite($scope.component, $scope.messageId);

                function toggleFavorite(isFavorite) {
                    if (isFavorite) {
                        $animate.removeClass(element, 'button button-icon  icon ion-ios7-star-outline');
                        $animate.addClass(element, 'button button-icon  icon ion-ios7-star');
                    } else {
                        $animate.removeClass(element, 'button button-icon  icon ion-ios7-star');
                        $animate.addClass(element, 'button button-icon  icon ion-ios7-star-outline');
                    }
                }

                favorite.$loaded().then(function () {

                    toggleFavorite(favorite.$value);
                });
                element.on('click', function () {
                    favorite.$value = !favorite.$value;
                    favorite.$save().then(
                        toggleFavorite(favorite.$value)
                    );

                });

            }
        };
    })
    .directive('addContact', function ($rootScope, myPeerService, $q, ionicLoading, $animate) {

        return {
            restrict: "E",
            scope: {
                contactId: "="// Use @ for One Way Text Binding;Use = for Two Way Binding;Use & to Execute Functions in the Parent Scope
            },
            controller: function ($scope) {

                ionicLoading.load();
//                $scope.isContact = true;
                $scope.$watch('contactId', function (newVal) {

                    if (angular.isUndefined(newVal) || newVal == null) {
                        return
                    }
//                    console.log('y2');
                    myPeerService.findContact(buildParms1(),angular.toJson(newVal));// number to string

                });
                function buildParms1() {
                    return {
                        pass: function (p) {
                            console.log(p);
                            $scope.isContact = p;
                        }
                    };
                }
            },
            template: '<a class="button button-small button-positive"' +
                'ng-hide="isContact" ng-click="addPeer()">{{ btnText }}</a>',
            replace: true,
            link: function ($scope, element) {



                $scope.$watch('isContact', function (newVal) {

                    if (angular.isUndefined(newVal) || newVal == null) {
                        return
                    }
                    console.log(newVal);
                    if (newVal == false) {
                        $scope.btnText = 'toAdd';
//                        $animate.addClass(element,'button button-small button-positive');
                        console.log(element);
                    }

                });


                $scope.addPeer = function () {
                    myPeerService.addContact(buildParms(), angular.toJson($scope.contactId));
                };

                //change the button information after the contact is added
                $scope.$watch('pass', function (newVal) {
                    if (newVal == true) {
                        $scope.btnText = 'added';
                        $animate.setClass(element, 'button-balanced','button-positive');
                    }
                });

                function buildParms() {
                    return {
                        pass: function (p) {
                            $scope.pass = p;
                        },
                        callback: function (err) {
                            if (err) {
                                $scope.err = err;
                            }
                            else {
                                $scope.msg = 'peer added!';
                            }
                        }
                    };
                }

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
    .controller('componentListCtrl', function ($scope, ionicLoading, myComponentService) {
        $scope.components = myComponentService.all.$asArray();
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
        $scope.messages = myMessageService.findMessageByComponent(currentComponentId).$asObject();
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