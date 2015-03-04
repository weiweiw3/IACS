'use strict';

/* Directives */
angular.module('myApp.directives', [])
    .directive('appVersion', ['version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }])

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
                                  createTask, $q, $animate, ionicLoading) {

//  TODO: create E0002 inputP
//  inputP: CompanySetting/EventDefaltValues/E0002
//        "PO_REL_CODE=$P01$;
//        PURCHASEORDER=$P02$;
//        FB_PATH=Event/E0002/$P03$/$P02$;
//        SAP_SYSTEM=sap_system_guid_default"
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
                var event='E0002';
                var inputPStr;
                $scope.inputPObj=createTask.getInputP(event);
                $scope.inputPObj.$loaded().then(
                    function (data){
                        inputPStr=data.$value;
                    }
                );
                $scope.$watch('message', function (newVal) {

                    if (angular.isUndefined(newVal) || newVal == null) {
                        return
                    }else{
                        console.log(newVal);
                    }
                    if (newVal.lock == true) {
                        $scope.isDisabled = true;
                        $scope.btnText = 'SEND OUT';
                    } else {
                            $scope.isDisabled = false;
                            $scope.btnText = 'Approve';
                            $scope.clickEvent = 'Approve';
                    }
                });

                $scope.click = function () {
                    $scope.btnText = 'processing...';
                    createTask.create(buildParms(),
                        $scope.message.id, $scope.clickEvent,inputPStr,event);

                };

                //change the button information after finished
                $scope.$watch('pass', function (newVal) {
                    if (newVal == true) {
                        $scope.message.locked=true;
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