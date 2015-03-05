/**
 * Created by c5155394 on 2015/2/5.
 */
'use strict';

angular.module('myApp.controllers.SAPUserValidation', [ ])
    .controller('SAPUserValidationCtrl',
    function (myTask,$scope, syncData, ionicLoading, myUser) {
        //TODO 如果密码已经存在，可以进行修改操作；如果不存在，进行密码验证。
        //create A0001 task with A0001 input parameters
        var inputParas = '';
        var taskData = {
            //TODO find root companyId
            "companyId": "40288b8147cd16ce0147cd236df20000",
            "eventType": "A0001",
            "taskPriority": "0",
            "taskStatus": "0",
            "triggerTime": "immediate",
            "userId": "100018"
            //TODO find serverUserID with FBUser
        };
        var event='A0001';
        $scope.languages = [
            { name: "Chinese", value: '1'},
            { name: "English", value: 'E'},
            { name: "German", value: 'D'}
        ];

        $scope.model = {};
        ionicLoading.load();

        $scope.model =myUser.getSAPUser(); //        {user/password/valid/language}
        $scope.model.$loaded().then(function (snapdata) {
            if (typeof snapdata.languages != 'undefined') {
                $scope.model.preflang = $scope.languages[snapdata.languages];
            } else {
                $scope.model.preflang = $scope.languages[1];
            }
            if (!snapdata.valid ) {
                $scope.model.buttontext='validate';
            } else {
                $scope.model.buttontext='update';
            }
        });

        $scope.SAPSysArray = myUser.getSAPSys();
        $scope.inputPObj=myTask.getInputP(event);

        $scope.inputPObj.$loaded().then(function (data) {
            inputParas = data.$value;
            $scope.SAPSysArray.$loaded()
                .then(function () {
                    $scope.SAPSysArray.forEach(function (entry) {
                        if (entry.$id === 'SAP_SYSTEM_GUID') {
                            inputParas = inputParas.replace('$P01$', entry.$value);
                        } else if (entry.$id === 'SYSTEM_ID') {
                            inputParas = inputParas.replace('$P02$', entry.$value);
                        } else if (entry.$id === 'SERVER_NAME') {
                            inputParas = inputParas.replace('$P03$', entry.$value);
                        } else if (entry.$id === 'INSTANCE_NUMBER') {
                            inputParas = inputParas.replace('$P04$', entry.$value);
                        } else if (entry.$id === 'CLIENT') {
                            inputParas = inputParas.replace('$P05$', entry.$value);
                        }
                    });
                    ionicLoading.unload();
                });
        });

        $scope.tryValidation = function () {
            inputParas = inputParas.replace('$P06$', $scope.model.user);
            inputParas = inputParas.replace('$P07$', $scope.model.password);
            inputParas = inputParas.replace('$P08$', $scope.model.preflang.value);
            var data = {
                "companyId": "40288b8147cd16ce0147cd236df20000",
                "eventType": "A0001",
                "taskPriority": "0",
                "taskStatus": "0",
                "triggerTime": "immediate",
                "userId": "100018"
            };

            var ref1 = syncData(['tasks']);
            ref1.$push(data).then(function (ref) {
                ref.key();   // key for the new ly created record
                inputParas = inputParas.replace('$P00$', ref.key());
                ref.child('inputParas').set(inputParas);
            }, function (error) {
                console.log("Error:", error);
            });
            console.log(inputParas, $scope.model.preflang);
        };

    });