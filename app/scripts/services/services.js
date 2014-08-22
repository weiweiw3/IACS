//**copy from firereader

(function (angular) {
    "use strict";
    var appServices = angular.module('myApp.services', ['firebase', 'firebase.utils']);
    appServices.service('client', function (esFactory) {
        return esFactory({
            host: 'localhost:9200',
            apiVersion: '1.3',
            log: 'trace'
        });
    });

    appServices.factory('myContact',
        function ($timeout, $q, $firebase, $rootScope, fbutil) {
            var currentUser = $rootScope.auth.user;
            var myContactRef = fbutil.ref(['users', currentUser, 'contacts']);
            var PublicRef = fbutil.ref(['userList']);
            var sync = $firebase(myContactRef);
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

    appServices.factory('messageUpdate', ['$rootScope', '$q', 'fbutil', '$timeout',
        function ($rootScope, $q, fbutil, $timeout) {
            var currentUser = $rootScope.auth.user;
            var date = Date.now();
            var messageLog = {
                action: '',
                user: currentUser,
                date: date
            };
            var publicMessageRef = fbutil.ref(['messages']);
            var messageUpdate = {

                update: function (opt, messageId, nextAction) {
                    var messageHistoryRef = fbutil.syncData(['messagesHistory', messageId]);
                    var messageRef = fbutil.syncObject(['messages',messageId]);
                    var taskRef = fbutil.syncObject(['tasks', messageId]);

                    messageLog.action = nextAction;
                    var cb = opt.callback || function () {
                    };
                    var errorFn = function (err) {
                        $timeout(function () {
                            cb(err);
                        });
                    };
                    //promise process
//                    checkLocked()->updateMessageHistory()
                    checkLocked()
                        .then(addNewTask)
                        .then(updateMessageHistory)
                        .then(lockMessage)
                        // success
                        .then(function () {
                            cb && cb(null)
                        }, cb)
                        .catch(errorFn);
                    function checkLocked() {
                        var d = $q.defer();
                        publicMessageRef.child(messageId).once('value', function (snap) {
                            if (snap.locked === true && snap.lockedBy !== currentUser) {
                                d.reject();
                            } else {
                                d.resolve();
                            }
                        });
                        return d.promise;
                    }


                    function addNewTask(){
                        var d = $q.defer();
                        taskRef.type = nextAction;
                        taskRef.user = currentUser;
                        taskRef.date = date;
                        taskRef.$save().then(
                            function (ref) {
                                console.log(ref.name());   // Key for the new ly created record
                                d.resolve();
                            }
                        );
                        return d.promise;
                    }
                    function updateMessageHistory() {
                        var d = $q.defer();
                        messageLog.action = nextAction;
                        messageHistoryRef.$push(messageLog).then(
                            function (ref) {
                                console.log(ref.name());   // Key for the new ly created record
                                d.resolve();
                            }
                        );
                        return d.promise;
                    }
                    function lockMessage() {
                        var d = $q.defer();
//                        messageRef.last = date;
//                        messageRef.statusNext = messageRef.statusCur;
//                        messageRef.statusCur = messageRef.statusPre;
//                        messageRef.userTo = messageRef.userFrom;
                        messageRef.locked = true;
                        messageRef.lockedBy = currentUser;
                        messageRef.lockedDate = date;
                        messageRef.$save()
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
            return messageUpdate;
        }]);
    appServices.factory('myMessage', ['$rootScope', 'fbutil',
        function ($rootScope, fbutil) {
            var currentUser = $rootScope.auth.user;
            var syncedObject = fbutil.syncObject(['users', currentUser , 'messages']);
            var syncedArray = fbutil.syncArray(['users', currentUser , 'messages']);
            var isFavorite = false;
            var myMessages = {
                array: syncedArray,
                object: syncedObject,
                getMessageList: function (componentId) {
                    return  fbutil.syncArray(['users', currentUser , 'messages', componentId]);
                },

                getFavorite: function (componentId, messageId, favorite) {

                    //favorite is optionalArg
                    favorite = (typeof favorite === "undefined") ? "defaultValue" : favorite;
                    var obj = fbutil.syncObject(['users', currentUser ,
                        'messages', componentId, messageId, 'favorite']);
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
                        //update server value
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

    appServices.factory('myComponent', ['$rootScope', 'fbutil',
        function ($rootScope, fbUtil) {
            var currentUser = $rootScope.auth.user;
            var syncedArray = fbUtil.syncArray(['users', currentUser, 'components']);
            var syncedObject = fbUtil.syncObject(['users', currentUser, 'components']);
            var ref = fbUtil.ref(['users', currentUser, 'components']);

            syncedObject.$watch(function (event) {
                console.log('myComponent', event);
                $rootScope.$broadcast('myComponent.update');
            });

            var myComponent = {
                all: ref,
                array: syncedArray,
                object: syncedObject,
                UnreadCountMinus: function (componentId) {
                    var ref = fbUtil.syncData(['users', currentUser,
                        'components', componentId, 'unreadCount']);
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
