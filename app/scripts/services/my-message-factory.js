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
        var isFavorite = false;
        var messageMetadataRefStr = 'users/' + currentUser + '/messageMetadata';
        var MessageRefStr = 'users/' + currentUser + '/messages';

        var myMessages = {
            getMessageList: function (componentId) {
                return  syncData([messageMetadataRefStr, componentId]).$asArray();
            },
            getMessageMetadata: function (componentId,messageId) {
                return  syncData([messageMetadataRefStr, componentId,messageId]).$asArray();
            },
            getMessageHeader: function (componentId,messageId) {
                return  syncData([MessageRefStr, componentId,messageId,'data']).$asObject();
            },

            //startAtItems:1,limit: 5
            getMessageItems: function (componentId,messageId) {
                return  syncData([MessageRefStr, componentId,messageId,'items']).$asArray();
            },

            //startAtItems:6
            getMessageMoreItems: function (componentId,messageId) {
                return  syncData([MessageRefStr, componentId,messageId,'moreItems']).$asArray();
            },

            getFavorite: function (componentId, messageId, favorite) {
                //favorite is optionalArg
                favorite = (typeof favorite === "undefined") ? "defaultValue" : favorite;

                var obj = syncData([MessageRefStr, componentId, messageId, 'data','favorite'])
                    .$asObject();

                if (favorite === "defaultValue") {
                    // load favorite from server
                    obj.$loaded().then(function (data) {
                        isFavorite = {
                            messageId: messageId,
                            favorite: data.$value
                        };
                        $rootScope.$broadcast('isFavorite.update');
                    });
                } else {
                    //update favorite in server
                    obj.$value = favorite;
                    obj.$save().then(function (ref) {
                        isFavorite = {
                            messageId: messageId,
                            favorite: obj.$value
                        };
                        $rootScope.$broadcast('isFavorite.update');
                    });
                }

            },
            isFavorite: function (messageId) {
                if (messageId === isFavorite.messageId) {
                    return isFavorite.favorite;
                } else {
                    return 'error'
                }

            }

        };
        return myMessages;
    }]);

