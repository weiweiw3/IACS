/**
 * Created by c5155394 on 2015/2/5.
 */
'use strict';

angular.module('myApp.controllers.SAPUserValidation', [ ])
    .controller('SAPUserValidationCtrl',
    function (myTask, $scope, ionicLoading, myUser) {
        //TODO 如果密码已经存在，可以进行修改操作；如果不存在，进行密码验证。
        //create A0001 task with A0001 input parameters
        var inputParas = '';

        var componentId = 'A0001';
        $scope.languages = [
            { name: "Chinese", value: '1'},
            { name: "English", value: 'E'},
            { name: "German", value: 'D'}
        ];
        $scope.preflang = { name: "English", value: 'E'};
        $scope.model = {};
        ionicLoading.load();
        $scope.serverUser = myUser.getServerUser();

        //   {user/password/valid/language}
        myUser.getSAPUser().$bindTo($scope, "model").then(function (snapdata) {
//            if (typeof snapdata.languages != 'undefined') {
//                $scope.preflang = $scope.languages[snapdata.languages];
//
//            } else {
//                $scope.preflang = $scope.languages[1];
//            }
            if (!snapdata.valid ) {
                $scope.model.buttontext='validate';
            } else {
                $scope.model.buttontext='update';
            }
        });

        $scope.SAPSysArray = myUser.getSAPSys();
        $scope.inputPObj = myTask.getInputP(componentId);

        $scope.inputPObj.$loaded().then(function (data) {
            inputParas = data.$value;
            $scope.serverUser.$loaded().then(function (data) {
                inputParas = inputParas.replace('$P00$', data.$value);
            });
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
            inputParas = inputParas.replace('$P08$', $scope.preflang.value);

            myTask.createTask(componentId, inputParas,
                'SAPValidation', $scope.clickEvent, buildParms());

//TODO 页面select生成值无法打印在console.log
            console.log(inputParas, $scope.preflang, $scope.selectedItem);
        };
        function buildParms() {
            return {

                callback: function (err) {
                    if (err == null) {
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
    });