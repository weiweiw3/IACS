//**copy from firereader

(function (angular) {
    "use strict";
    var appServices = angular.module('myApp.services',
        ['firebase', 'firebase.utils', 'firebase.simpleLogin']);
    appServices.factory('myContact',
        function ($timeout, $q, $firebase, simpleLogin, $rootScope, syncData) {
            var currentUser = simpleLogin.user.uid;
            var myContactRef = syncData(['users', currentUser, 'contacts']);
            var PublicRef = syncData(['userList']);
            var sync = myContactRef.$asObject;
            var isContact = {};
            var myContacts = {
                ref: myContactRef,
                all: sync,
                findContact: function (contactId) {

                    myContactRef.once('value', function (snap) {

                        isContact = {
                            contactId: contactId,
                            isContact: snap.hasChild(contactId)
                        };

                        $rootScope.$broadcast('findContact.finish');
                    });
                },
                isContact: function (contactId) {
                    if (contactId === isContact.contactId) {
                        return isContact.isContact;
                    } else {
                        return 'error'
                    }
                },
                addContact: function (opt, contactId) {
                    var cb = opt.callback || function () {
                    };
                    var newContact;
                    var errorFn = function (err) {
                        $timeout(function () {
                            cb(err);
                        });
                    };
                    //promise process
                    isContact()
                        .then(findPublicContact)
                        .then(addIntoMyContacts)
                        // success
                        .then(function () {
                            cb && cb(null)
                        }, cb)
                        .catch(errorFn);
                    myContactRef.once('value', function (snap) {
                        if (snap.hasChild(contactId) !== true) {

                        }
                    }, function (err) {
                        // code to handle read error
                    });


                    function isContact() {//if existed, reject
                        var d = $q.defer();
                        myContactRef.once('value', function (snap) {
                            if (snap.hasChild(contactId) == true) {
                                d.reject();
                            } else {
                                d.resolve();
                            }
                        });
                        return d.promise;
                    }

                    function findPublicContact() {
                        var d = $q.defer();
                        PublicRef.child(contactId).once('value',
                            function (snap) {
                                newContact = snap.val();
                                console.log(contactId, newContact);
                                d.resolve();
                            },
                            function (err) {
                                console.log(err);
                                d.reject(err);
                            });
                        return d.promise;
                    }

                    function addIntoMyContacts() {
                        var d = $q.defer();
                        var ref = myContactRef.child(contactId);
                        var sync = $firebase(ref);
                        console.log(newContact);
                        sync.$set(newContact).then(function (ref) {
                                opt.pass(true);//set scope.pass as pass
                                d.resolve();
                            },
                            function (err) {
                                opt.pass(false);
                                d.reject(err);
                            });
                        return d.promise;
                    }
                }

            };
            return myContacts;
        });
    appServices.factory('createTask',
        function ($rootScope, $q, syncData, $timeout, simpleLogin) {
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
                checkLock: function(){

                    function checkLocked(ref) {
                        var d = $q.defer();

                        ref.$ref().once('value', function (snap) {
                            if (snap.val() === true) {
                                console.log('true',snap.val());

                                d.reject();
                                opt.pass(false);
                            } else {
                                console.log('false',snap.val());
                                d.resolve();
                            }
                        });
                        return d.promise;
                    }
                },

                create: function (opt, messageId, nextAction, inputPStr, event) {
                    var self=this;
                    var logRef = syncData(['users', currentUser, 'log', event, messageId]);
                    var lockRef = syncData(['users', currentUser, 'log', event,messageId,'lock']);
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
                    var promise=checkLocked(lockRef);
                    promise
                        .then(addNewTask(taskRef, inputPStr,event,currentUser))
                        .then(log4task(logRef,event))
                        .then(lockMessage(lockRef))
                        // success
                        .then(function () {
                            cb && cb(null)
                        }, cb)
                        .catch(errorFn);
                    function checkLocked(ref) {
                        var d = $q.defer();
                        ref.$ref().once('value', function (snap) {
                            if (snap.val() === true) {
                                d.reject();
                            } else {
                                d.resolve();
                            }
                        });
                        return d.promise;
                    }

                    function addNewTask(taskRef, inputP, event, userid) {

                        var d = $q.defer();
                        var taskDataObj=syncData([taskDefaultRefStr, event]);
                        var taskDataRef=taskDataObj.$ref();

                        taskDataRef.on("value", function(snap) {
                            var data=snap.val();
                            data.inputParas = '';
                            taskRef.$push(data).then(
                                function (ref) {
                                    inputP=inputP+ref.key();
                                    ref.child('inputParas').set(inputP);
                                    d.resolve();
                                }, function (error) {
                                    d.reject(error);
                                    console.log("Error:", error);
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
                                console.log(ref.key());   // Key for the new ly created record
                                d.resolve();
                            }, function (error) {
                                console.log("Error:", error);
                            });
                        return d.promise;
                    }

                    function lockMessage(lockref) {
                        var ref = lockref;
                        var d = $q.defer();
                        ref.$set(true)
                            .then(
                            function () {
                                opt.pass(true);
                                d.resolve();
                            }
                        );
                        return d.promise;
                    }
                }
            };
            return createTask;
        });


    //functions:
    // 1, get message list with componentID
    // 2, get and update favorite
    appServices.factory('myMessage', ['$rootScope', 'syncData', 'simpleLogin',
        function ($rootScope, syncData, simpleLogin) {

            var currentUser = simpleLogin.user.uid;
            var isFavorite = false;
            var messageMetadataRefStr = 'users/' + currentUser + '/messageMetadata';
            var MessageRefStr = 'users/' + currentUser + '/messages';

            var myMessages = {
                getMessageList: function (componentId) {
                    return  syncData([messageMetadataRefStr, componentId]).$asArray();
                },
                getFavorite: function (componentId, messageId, favorite) {
                    //favorite is optionalArg
                    favorite = (typeof favorite === "undefined") ? "defaultValue" : favorite;

                    var obj = syncData([MessageRefStr, componentId, messageId, 'favorite'])
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

    //get component information, and update unread number
    //ref sample: users/simplelogin%3A33/components/E0001
    appServices.factory('myComponent', ['$rootScope', 'syncData', 'simpleLogin',
        function ($rootScope, syncData, simpleLogin) {

            var currentUser = simpleLogin.user.uid;
            var ref = syncData(['users', currentUser, 'components']);
            var syncedArray = ref.$asArray();
            var syncedObject = ref.$asObject();
            var unreadCountRefStr = 'users/' + currentUser + '/components/$componentId$/unreadCount';

            syncedObject.$watch(function (event) {
//                console.log('myComponent', event, syncedArray, syncedObject, ref.toString());
                $rootScope.$broadcast('myComponent.update');
            });

            var myComponent = {
                all: ref,
                array: syncedArray,
                object: syncedObject,
                UnreadCountMinus: function (componentId) {
                    unreadCountRefStr = unreadCountRefStr.replace('$componentId$', componentId);
                    var ref = syncData(unreadCountRefStr);
                    ref.$transaction(function (currentCount) {
                        if (!currentCount) return 1;   // Initial value for counter.
                        if (currentCount < 0) return;  // Return undefined to abort transaction.
                        return currentCount - 1;             // Increment the count by 1.
                    }).then(function (snapshot) {
                        if (!snapshot) {
                            // Handle aborted transaction.
                        } else {
                            // Do something.
                        }
                    }, function (err) {
                        // Handle the error condition.c
                    });
                }
            };
            return myComponent;
        }]);


    appServices.factory('disposeOnLogout', ['$rootScope', function ($rootScope) {
        var disposables = [];

        $rootScope.$on('authManager:beforeLogout', function () {
            angular.forEach(disposables, function (fn) {
                fn();
            });
            disposables = [];
        });

        return function (fnOrRef, event, callback) {
            var fn;
            if (arguments.length === 3) {
                fn = function () {
                    fnOrRef.off(event, callback);
                }
            }
            else if (angular.isObject(fnOrRef) && fnOrRef.hasOwnProperty('$off')) {
                fn = function () {
                    fnOrRef.$off();
                }
            }
            else {
                fn = fnOrRef;
            }
            disposables.push(fn);
            return fnOrRef;
        }
    }]);

})(angular);
