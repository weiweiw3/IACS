/**
 * Created by C5155394 on 2015/3/4.
 */
angular.module('myApp.services.myTask',
    ['firebase', 'firebase.utils', 'firebase.simpleLogin'])
.factory('myTask',
    function ($rootScope, $q, syncData, $timeout, simpleLogin,myMessage,myUser) {
        var currentUser = simpleLogin.user.uid;
        var date = Date.now();
        var messageLog = {
            action: '',
            user: currentUser,
            date: date
        };
        var taskDefaultRefStr='CompanySetting/EventDefaltValues';
        var createTask;
        createTask = {
            getInputP: function (event) {
                return syncData([taskDefaultRefStr, event, 'inputParas'])
                    .$asObject();
            },

            createTask: function (opt, messageId, nextAction, inputPStr, event) {
                var self=this;
                var componentId='E0001';
                var logRef = syncData(['users', currentUser, 'log', event, messageId]);
                var taskRef = syncData(['tasks']);

                messageLog.action = nextAction;
                var cb = opt.callback || function () {
                };
                var errorFn = function (err) {
                    $timeout(function () {
                        cb(err);
                    });
                };

                //promise process
                var promise=addNewTask(taskRef, inputPStr,event,currentUser);
                promise
                    .then(log4task(logRef,event))
//                    .then(myMessage.getLock(componentId,messageId,true))
                    // success
                    .then(function () {
                        cb && cb(null)
                    }, cb)
                    .catch(errorFn);


                function addNewTask(taskRef, inputP, event) {

                    var d = $q.defer();
                    var taskDataObj=syncData([taskDefaultRefStr, event]);
                    var taskDataRef=taskDataObj.$ref();
                    var ServerUser=myUser.getServerUser();
                    var taskData;

                    taskDataRef.on("value", function(snap) {
                        taskData=snap.val();
                        taskData.inputParas = '';
                        ServerUser.$loaded().then(function(data){
                            taskData.userId=data.$value;
                            taskRef.$push(taskData).then(
                                function (ref) {
                                    inputP=inputP+'; task_FB='+ref.key();
                                    ref.child('inputParas').set(inputP);
                                    console.log('new Task'+ref.key());
                                    d.resolve();
                                }, function (error) {
                                    d.reject(error);
                                    console.log("Error:", error);
                                });
                        });
                    });


                    return d.promise;
                }

                function log4task(logRef, event) {
                    var ref = logRef;
                    var d = $q.defer();
                    messageLog.action = event;
                    ref.$push(messageLog).then(
                        function (ref) {
//                            console.log(ref.key());   // Key for the new ly created record
                            d.resolve();
                        }, function (error) {
                            console.log("Error:", error);
                        });
                    return d.promise;
                }

            }
        };
        return createTask;
    });
