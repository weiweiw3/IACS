'use strict';

/* Directives */
angular.module('myApp.directives', [])
    .directive('appVersion', ['version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }])
    .directive('favoriteMessage', function ($rootScope, myMessage, $animate, ionicLoading) {
        return {
            restrict: "EA",
            scope: {
                component: "=",
                messageId: "="
            },
            replace: true,
            link: function ($scope, element, attrs) {
                var favorite = false;
                $scope.$on('isFavorite.update', function (event) {

                    favorite = myMessage.isFavorite($scope.messageId);

                    if (typeof favorite == "boolean") {
                        ionicLoading.unload();
                        $scope.favorite = favorite;
                        toggleFavorite($scope.favorite);
                    }

                });
                $scope.$watch('messageId', function (newVal) {
                    if (angular.isUndefined(newVal) || newVal == null) {
                        return
                    }
                    myMessage.getFavorite($scope.component, newVal);
                });

                function toggleFavorite(isFavorite) {
                    if (isFavorite) {
                        $animate.setClass(element, 'ion-star', 'ion-ios7-star-outline');
                    } else {
                        $animate.setClass(element, 'ion-ios7-star-outline', 'ion-star');
                    }
                }

                element.on('click', function () {
                    favorite = !favorite;
                    ionicLoading.load();
                    myMessage.getFavorite($scope.component, $scope.messageId, favorite);
                });

            }
        };
    })
    .directive('addContact', function (simpleLogin,$rootScope, myContact, $q, $animate, ionicLoading) {

        var currentUser = simpleLogin.user.uid;

        return {
            restrict: "E",
            scope: {
                contactId: "="// Use @ for One Way Text Binding;Use = for Two Way Binding;Use & to Execute Functions in the Parent Scope
            },

            template: '<a class="button button-small button-outline button-positive" ' +
                'ng-show="ngShow" ng-click="addContact()">{{ btnText }}</a>',
            replace: true,
            link: function ($scope, element) {
                $scope.$watch('contactId', function (newVal) {
                    console.log(newVal);
                    if (angular.isUndefined(newVal) || newVal == null) {
                        $scope.ngShow = false;


                        return;
                    }
                    if (newVal !== currentUser) {
                        ionicLoading.load();
                        myContact.findContact(newVal);
                        //angular.toJson() number to string

                    }
                });
                $scope.$on('findContact.finish', function (event) {
                    var isContact = myContact.isContact($scope.contactId);

                    if (typeof isContact == "boolean" && $scope.contactId !== currentUser) {

                        $scope.ngShow = !isContact;
                        $scope.btnText = 'toAdd';
                        ionicLoading.unload();
                        console.log($scope.ngShow, $scope.btnText);
                    }
                });
                $scope.addContact = function () {
                    $scope.btnText = 'adding...';
                    ionicLoading.load();
                    myContact.addContact(buildParms(), $scope.contactId);
                };

                //change the button information after the contact is added
                $scope.$watch('pass', function (newVal) {
                    if (newVal == true) {
                        $scope.btnText = 'added';
                        $animate.setClass(element, 'button-balanced', 'button-positive');
                        ionicLoading.unload();
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
                                $scope.msg = 'contact added!';
                            }
                        }
                    };
                }

            }
        }
            ;
    })

    .directive('reset', function (simpleLogin,$rootScope,
                                  messageUpdate, $q, $animate, ionicLoading) {
        var currentUser = simpleLogin.user.uid;
        return {
            restrict: "E",
            scope: {
                message: "="// Use @ for One Way Text Binding;Use = for Two Way Binding;Use & to Execute Functions in the Parent Scope
            },
            controller: function ($scope) {
                $scope.btnText = '';
                $scope.btnshow = false;
            },
            template: '<a class="button button-block button-positive"' +
                'ng-disabled="isDisabled" ng-click="click()">{{ btnText }}</a>',
            replace: true,
            link: function ($scope, element) {

                $scope.$watch('message', function (newVal) {
                    if (angular.isUndefined(newVal) || newVal == null) {
                        return
                    }
                    if (newVal.locked == true) {
                        $scope.isDisabled = true;
                        $scope.btnText = ' SEND OUT -- locked by ' + newVal.lockedBy;
                    } else {
                        //reset and show who is next operator
                        if (newVal.userFrom == currentUser && newVal.userTo != newVal.userFrom) {
                            $scope.isDisabled = false;
                            $scope.btnText = 'reset' +
                                ' (wait for user ' + newVal.userTo + ' to ' + newVal.statusNext + ')';
                            $scope.clickEvent = 'reset';
                        }
                        //just show who is next operator
                        if (newVal.userFrom !== currentUser && newVal.userTo !== currentUser
                            && !angular.isUndefined(newVal.userTo)) {
                            $scope.isDisabled = true;
                            $scope.btnText = ' wait for ' + newVal.userTo + ' to ' + newVal.statusNext;
                        }
                        //show what is my next operation
                        if (newVal.userTo === currentUser) {
                            $scope.isDisabled = false;
                            $scope.btnText = newVal.statusNext;
                            $scope.clickEvent = newVal.statusNext;
                        }

                    }

                });


                $scope.click = function () {
                    $scope.btnText = 'processing...';
                    messageUpdate.update(buildParms(), $scope.message.id, $scope.clickEvent);
                };

                //change the button information after finished
                $scope.$watch('pass', function (newVal) {
                    if (newVal == true) {
                        $scope.btnText = 'SEND OUT';
                        $animate.setClass(element, 'button-balanced', 'button-positive');
                        ionicLoading.unload();
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
                                $scope.msg = 'finished';
                            }
                        }
                    };
                }
            }
        };
    })

;