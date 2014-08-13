//**copy from firereader

(function (angular) {
    "use strict";
    var appServices = angular.module('myApp.services', ['firebase', 'firebase.utils']);

//    appServices.factory('myProfileService', ['$FirebaseObject', '$rootScope',
//        function ($FirebaseObject, $rootScope) {
//
//    }]);

    appServices.factory('myContact',
        function ($timeout, $q, $firebase, $rootScope, fbutil) {
            var currentUser = $rootScope.auth.user;
            console.log(currentUser );
            var myContactRef = fbutil.ref(['users', currentUser, 'peers']);
            var PublicRef = fbutil.ref(['peers']);
            var sync = $firebase(myContactRef);

            var myContacts = {
                ref: myContactRef,
                all: sync,
                findContact: function (contactId) {
                    var syncedObject = fbutil.syncObject(['users', currentUser, 'peers',contactId]);
                    return syncedObject;
                },
                addContact: function (opt, contactId) {
                    var cb = opt.callback || function () {
                    };
                    var newPeer;
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
                                newPeer = snap.val();
                                d.resolve();
                            },
                            function (err) {
                                d.reject(err);
                            });
                        return d.promise;
                    }

                    function addIntoMyContacts() {
                        var d = $q.defer();
                        var ref = myContactRef.child(contactId);
                        var sync = $firebase(ref);
                        var id;

                        sync.$set(newPeer).then(function (ref) {
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
    appServices.factory('myMessageService', ['$rootScope', 'fbutil',
        function ($rootScope, fbutil) {
            var currentUser = $rootScope.auth.user;
            var syncedObject  = fbutil.syncObject(['users', currentUser , 'messages']);
            var syncedArray  = fbutil.syncArray(['users', currentUser , 'messages']);
            var myMessages = {
                array: syncedArray,
                object: syncedObject,
                findMessageByComponent: function (componentId) {
                    var ref = fbutil.syncObject(['users', currentUser , 'messages', componentId]);
                    return ref;
                },
                findMessageById: function (componentId, messageId) {
                    var ref = fbutil.syncObject(['users', currentUser , 'messages', componentId, messageId])
                        ;
                    return ref;
                },
                messageFavorite: function (componentId, messageId) {
                    var ref = fbutil.syncObject(['users', currentUser ,
                        'messages', componentId, messageId, 'favorite'])
                        ;
                    return ref;
                },
                saveMessageFavorite: function (componentId, messageId) {
                    var obj = this.messageFavorite(componentId, messageId);
                    obj.$save().then(function () {
                        console.log(obj.$id);
                    });
                }
            };
            return myMessages;
        }]);

    appServices.factory('myComponentService', ['$rootScope', 'fbutil',
        function ($rootScope, fbUtil) {
            var currentUser = $rootScope.auth.user;
            console.log(currentUser );
            var syncedObject  = fbUtil.syncObject(['users', currentUser, 'components']);
            var syncedArray  = fbUtil.syncArray(['users', currentUser, 'components']);
            var ref = fbUtil.ref(['users', currentUser, 'components']);
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
