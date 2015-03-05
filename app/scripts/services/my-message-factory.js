/**
 * Created by C5155394 on 2015/3/4.
 */
angular.module('myApp.services.myMessage', ['firebase', 'firebase.utils', 'firebase.simpleLogin'])

    //functions:
    // 1, get message list with componentID
    // 2, get and update favorite
.factory('myMessage', ['$rootScope', 'syncData', 'simpleLogin',
    function ($rootScope, syncData, simpleLogin) {
        var currentUser = simpleLogin.user.uid;
        var statusObj;
        var MessageRefStr = 'users/' + currentUser + '/messages';

        var myMessages = {

            getMessageMetadata: function (componentId,messageId) {
                return  syncData([MessageRefStr, componentId,messageId,'data/metadata']).$asArray();
            },
            getMessageHeader: function (componentId,messageId) {
                return  syncData([MessageRefStr, componentId,messageId,'data']).$asObject();
            },
            getMessageHeaderArray: function (componentId,messageId) {
                return  syncData([MessageRefStr, componentId,messageId,'data']).$asArray();
            },
            //startAtItems:1,limit: 5
            getMessageItems: function (componentId,messageId) {
                return  syncData([MessageRefStr, componentId,messageId,'items']).$asArray();
            },

            //startAtItems:6
            getMessageMoreItems: function (componentId,messageId) {
                return  syncData([MessageRefStr, componentId,messageId,'moreItems']).$asArray();
            },
            markStatus: function(componentId, messageId,status,statusValue){
                //statusValue is optionalArg
                statusValue = (typeof statusValue === "undefined")
                    ? "defaultValue" : statusValue;

                var obj = syncData([MessageRefStr, componentId, messageId, 'data',status])
                    .$asObject();

                if (statusValue === "defaultValue") {
                    // load statusValue from firebase
                    obj.$loaded().then(function (data) {
                        statusObj = {
                            componentId:componentId,
                            messageId: messageId,
                            status:status,
                            statusValue: data.$value
                        };
                        $rootScope.$broadcast(status+'.update');
                    });
                } else {
                    //update statusValue in firebase
                    obj.$value = statusValue;
                    obj.$save().then(function () {
                        statusObj = {
                            componentId:componentId,
                            messageId: messageId,
                            status:status,
                            statusValue: statusValue
                        };
                        $rootScope.$broadcast(status+'.update');
                    });
                }
            },
            getStatus: function (componentId,messageId,status) {
                if ( componentId=== statusObj.componentId
                    && messageId === statusObj.messageId
                    && status === statusObj.status)
                {
                    return statusObj.statusValue;
                } else {
                    return 'error'
                }
            }

        };
        return myMessages;
    }]);

