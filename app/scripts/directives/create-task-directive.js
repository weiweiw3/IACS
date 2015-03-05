/**
 * Created by C5155394 on 2015/3/4.
 */
angular.module('myApp.directives.createTask', [])

.directive('createTask', function (myMessage,$rootScope,
                                   myTask, $q, $animate, ionicLoading) {

//  TODO: create E0002 inputP
//  inputP: CompanySetting/EventDefaltValues/E0002
//        "PO_REL_CODE=$P01$;
//        PURCHASEORDER=$P02$;
//        FB_PATH=Event/E0002/$P03$/$P02$;
//        SAP_SYSTEM=sap_system_guid_default"
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
            ionicLoading.load();
            $scope.inputPObj=myTask.getInputP(event);
            $scope.inputPObj.$loaded().then(
                function (data){
                    inputPStr=data.$value;
                }
            );
            $scope.$watch('message', function (newVal) {
                if (angular.isUndefined(newVal) || newVal == null) {
                    return
                }
                $scope.messageId=newVal.id;
                $scope.componentId=newVal.component;
                myMessage.markStatus($scope.componentId,$scope.messageId,'lock');
            });
            $scope.$on('lock.update', function (event) {
                $scope.lock = myMessage.getStatus($scope.componentId,$scope.messageId,'lock');

                toggleLock($scope.lock);
            });

            function toggleLock(lock) {
                if (typeof $scope.lock == "boolean" && lock) {
                    $scope.isDisabled = true;
                    $scope.btnText = 'SEND OUT';
                }else {

                    $scope.btnText = 'Approve';
                    $scope.isDisabled = false;
                    $scope.clickEvent = 'Approve';
                }
                ionicLoading.unload();
            }
            $scope.click = function () {
                $scope.btnText = 'processing...';
                ionicLoading.load();
                myTask.createTask(buildParms(),
                    $scope.message.id, $scope.clickEvent,inputPStr,event);
            };


            function buildParms() {
                return {

                    callback: function (err) {
                        if(err == null){
                            ionicLoading.load();
                        myMessage.markStatus($scope.componentId,$scope.messageId,'lock',true);
                        }

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
});