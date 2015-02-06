/**
 * Created by c5155394 on 2015/2/5.
 */
'use strict';

angular.module('myApp.controllers.SAPUserValidation', [ ])
    .controller('SAPUserValidationCtrl',function($scope,syncData,ionicLoading){

        var inputParas='';

        var sapinfArray;

       $scope.languages=[
        { name: "Chinese", value: '1'},
        { name: "English", value: 'E'},
        { name: "German", value: 'D'}
        ];

        $scope.model = {};
        $scope.model.user='';
        $scope.model.password='';
        $scope.model.preflang = $scope.languages[1];

        sapinfArray = $scope.syncedData
            = syncData(['CompanySetting/sap_system/sap_system_guid_default'])
            .$asArray();

        var A0001_InputP = syncData(['CompanySetting/EventDefaltValues/A0001/inputParas'])
            .$asObject();

        ionicLoading.load();

        A0001_InputP.$loaded().then(function () {
            inputParas=A0001_InputP.$value;
            sapinfArray.$loaded()
                .then(function() {
//                    console.log("sapinfArray has " + sapinfArray.length + " item(s)");
                    sapinfArray.forEach(function(entry) {
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

        $scope.tryValidation=function(){
            inputParas = inputParas.replace('$P06$', $scope.model.user);
            inputParas = inputParas.replace('$P07$', $scope.model.password);
            inputParas = inputParas.replace('$P08$', $scope.model.preflang.value);
            var data={
                    "companyId" : "40288b8147cd16ce0147cd236df20000",
                    "eventType" : "A0001",
                    "taskPriority" : 0,
                    "taskStatus" : "0",
                    "triggerTime" : "immediate",
                    "userId" : 100018
                };
            var ref1=syncData(['tasks']);
            ref1.$push(data).then(function(ref) {
                ref.key();   // key for the new ly created record
                inputParas = inputParas.replace('$P00$', ref.key());
                ref.child('inputParas').set(inputParas);
            }, function(error) {
                console.log("Error:", error);
            });
            console.log(inputParas,$scope.model.preflang);

        };
//
//        FB_PATH=Event/A0001/$P00$



    });