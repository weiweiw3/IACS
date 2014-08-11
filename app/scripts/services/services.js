//**copy from firereader

(function (angular) {
    "use strict";
    var appServices = angular.module('myApp.services', ['myApp.utils', 'firebase', 'firebase.utils']);

    appServices.factory('myProfileService', ['$FirebaseObject', '$rootScope', function ($FirebaseObject, $rootScope) {

    }]);
    appServices.factory('myPeerService',
        function ($timeout, $q, $firebase, $rootScope, firebaseRef) {
//            var currentUser = $rootScope.auth_min.user;
            var currentUser = '12';
            var myContactRef = firebaseRef(['users', currentUser, 'peers']);
            var PublicRef = firebaseRef(['peers']);
            var sync = $firebase(myContactRef);

            var myContacts = {
                ref: myContactRef,
                all: sync,
                findContact: function (opt, contactId) {
                    var result;
                    console.log(contactId);
                    myContactRef.once('value', function (snap) {
                        if (snap.hasChild(contactId) == true) {
                            result = true;
                        } else {
                            result = false;
                        }
                        opt.pass(result);
                    });

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
    appServices.factory('myMessageService', ['$rootScope', 'syncData',
        function ($rootScope, syncData) {

            var ref = syncData(['users', $rootScope.auth_min.user, 'messages']);
            var myMessages = {
                array: ref.$asArray(),
                object: ref.$asObject(),
                findMessageByComponent: function (componentId) {
                    var ref = syncData(['users', $rootScope.auth_min.user, 'messages', componentId]);
                    return ref;
                },
                findMessageById: function (componentId, messageId) {
                    var ref = syncData(['users', $rootScope.auth_min.user, 'messages', componentId, messageId])
                        .$asObject();
                    return ref;
                },
                messageFavorite: function (componentId, messageId) {
                    var ref = syncData(['users', $rootScope.auth_min.user,
                        'messages', componentId, messageId, 'favorite'])
                        .$asObject();
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

    appServices.factory('myComponentService', ['$rootScope', 'syncData',
        function ($rootScope, syncData) {

            var ref = syncData(['users', $rootScope.auth_min.user, 'components']);
            var myComponent = {
                all: ref,
                array: ref.$asArray(),
                object: ref.$asObject(),
                findComponent: function (componentId) {
                    return syncData(['users', $rootScope.auth_min.user,
                        'components', componentId]);
                },
                UnreadCountMinus: function (componentId) {
                    var ref = syncData(['users', $rootScope.auth_min.user,
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
    function cookie(key, value, options) {
        // key and at least value given, set cookie...
        if (arguments.length > 1 && String(value) !== "[object Object]") {
            options = angular.extend({ path: '/', expires: 365 }, options);

            if (value === null || value === undefined) {
                options.expires = -1;
            }

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            value = String(value);

            return (document.cookie = [
                encodeURIComponent(key), '=',
                options.raw ? value : encodeURIComponent(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path ? '; path=' + options.path : '',
                options.domain ? '; domain=' + options.domain : '',
                options.secure ? '; secure' : ''
            ].join(''));
        }

        // key and possibly options given, get cookie...
        options = value || {};
        var result, decode = options.raw ? function (s) {
            return s;
        } : decodeURIComponent;
        return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
    }

    /**
     * A utility to store variables in local storage, with a fallback to cookies if localStorage isn't supported.
     */
    appServices.factory('localStorage', ['$log', function ($log) {
        //todo should handle booleans and integers more intelligently?
        var loc = {
            /**
             * @param {string} key
             * @param value  objects are converted to json strings, undefined is converted to null (removed)
             * @returns {localStorage}
             */
            set: function (key, value) {
//               $log.debug('localStorage.set', key, value);
                var undefined;
                if (value === undefined || value === null) {
                    // storing a null value returns "null" (a string) when get is called later
                    // so to make it actually null, just remove it, which returns null
                    loc.remove(key);
                }
                else {
                    value = angular.toJson(value);
                    if (typeof(localStorage) === 'undefined') {
                        cookie(key, value);
                    }
                    else {
                        localStorage.setItem(key, value);
                    }
                }
                return loc;
            },
            /**
             * @param {string} key
             * @returns {*} the value or null if not found
             */
            get: function (key) {
                var v = null;
                if (typeof(localStorage) === 'undefined') {
                    v = cookie(key);
                }
                else {
                    //todo should reconstitute json values upon retrieval
                    v = localStorage.getItem(key);
                }
                return angular.fromJson(v);
            },
            /**
             * @param {string} key
             * @returns {localStorage}
             */
            remove: function (key) {
                if (typeof(localStorage) === 'undefined') {
                    cookie(key, null);
                }
                else {
                    localStorage.removeItem(key);
                }
                return loc;
            }
        };

        //debug just a temporary tool for debugging and testing
        angular.resetLocalStorage = function () {
            $log.info('resetting localStorage values');
            _.each(['authUser', 'authProvider', 'sortBy'], loc.remove);
        };

        return loc;
    }]);

    appServices.factory('updateScope', ['$timeout', '$parse', function ($timeout, $parse) {
        return function (scope, name, val, cb) {
            $timeout(function () {
                $parse(name).assign(scope, val);
                cb && cb();
            });
        }
    }]);

    /**
     * A simple utility to monitor changes to authentication and set some values in scope for use in bindings/directives/etc
     */
    appServices.factory('authScopeUtil', ['$log', 'updateScope', 'localStorage', '$location',
        function ($log, updateScope, localStorage, $location) {
            return function ($scope) {
                $scope.auth_min = {
                    authenticated: false,
                    user: null,
                    name: null,
                    provider: localStorage.get('authProvider')
                };

                $scope.$on('$firebaseSimpleLogin:login', _loggedIn);
                $scope.$on('$firebaseSimpleLogin:error', function (err) {
                    $log.error(err);
                    _loggedOut();
                });
                $scope.$on('$firebaseSimpleLogin:logout', _loggedOut);

                function parseName(user) {
                    switch (user.provider) {
                        case 'persona':
                            return (user.id || '').replace(',', '.');
                        default:
                            return user.id;
                    }
                }

                function _loggedIn(evt, user) {
                    localStorage.set('authProvider', user.provider);
                    $scope.auth_min = {
                        authenticated: true,
                        user: user.id,
                        name: parseName(user),
                        provider: user.provider
                    };
                    updateScope($scope, 'auth_min', $scope.auth_min, function () {
                        if (!($location.path() || '').match('/hearth')) {
                            $location.path('/hearth');
                        }
                    });
                }

                function _loggedOut() {
                    $scope.auth_min = {
                        authenticated: false,
                        user: null,
                        name: null,
                        provider: $scope.auth_min && $scope.auth_min.provider
                    };
                    updateScope($scope, 'auth_min', $scope.auth_min, function () {
                        $location.search('feed', null);
                        $location.path('/demo');
                    });
                }
            }
        }]);

    /**
     * Some straightforward scope methods for dealing with feeds and articles; these have no dependencies
     */
    appServices.factory('feedScopeUtils', ['localStorage', '$timeout', '$location',
        function (localStorage, $timeout, $location) {
            return function ($scope, feedMgr) {
                $scope.showRead = false;
                $scope.feedName = feedMgr.feedName.bind(feedMgr);
                $scope.feeds = feedMgr.getFeeds();
                $scope.articles = feedMgr.getArticles();
                $scope.counts = feedMgr.articleManager.counts;
                $scope.feedChoices = feedMgr.getChoices();

                $scope.feeds.$on('change', function () {
                    $scope.noFeeds = $scope.feeds.$getIndex().length === 0;
                });

                //todo snag this from $location?
                $scope.link = $scope.isDemo ? 'demo' : 'hearth';

                $scope.isActive = function (feedId) {
                    return $scope.activeFeed === feedId;
                };

                $scope.showAllFeeds = function () {
                    return !$scope.activeFeed;
                };

                $scope.openFeedBuilder = function ($event) {
                    $event && $event.preventDefault();
                    $scope.$broadcast('modal:customFeed');
                };

                $scope.openArticle = function (article, $event) {
                    if ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                    }
                    $scope.$broadcast('modal:article', article);
                };

                $scope.filterMethod = function (article) {
                    return passesFilter(article) && notRead(article) && activeFeed(article);
                };

                $scope.orderMethod = function (article) {
                    var v = article[$scope.sortField];
                    return $scope.sortDesc ? 0 - parseInt(v) : parseInt(v);
                };

                $scope.markArticleRead = function (article, $event, noSave) {

                    if ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                    }
                    var f = article.$feed;
                    if (!_.has($scope.readArticles, f)) {
                        $scope.readArticles[f] = {};
                    }
                    $scope.readArticles[f][article.$id] = Date.now();
                    noSave || $scope.readArticles.$save(f);
                };

                $scope.markFeedRead = function (feedId, $event) {
                    if ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                    }
                    angular.forEach($scope.articles, function (article) {
                        if (article.$feed === feedId) {
                            $scope.markArticleRead(article, null, true);
                        }
                    });
                    $scope.counts[feedId] = 0;
                    $scope.readArticles.$save();
                };

                $scope.markAllFeedsRead = function ($event) {
                    if ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                    }
                    angular.forEach($scope.feeds, function (feed) {
                        $scope.markFeedRead(feed.$id, $event);
                    });
                };

                $scope.noVisibleArticles = function () {
                    return !$scope.loading && !$scope.noFeeds && countActiveArticles() === 0;
                };

                var to;
                $scope.startLoading = function () {
                    $scope.loading = true;
                    to && $timeout.cancel(to);
                    to = $timeout(function () {
                        $scope.loading = false;
                    }, 4000);
                    return to;
                };

                $scope.stopLoading = function () {
                    to && $timeout.cancel(to);
                    to = null;
                    if ($scope.loading) {
                        $timeout(function () {
                            $scope.loading = false;
                        });
                    }
                };

                $scope.sortField = 'date';

                $scope.$watch('sortDesc', function () {
                    //todo store in firebase
                    localStorage.set('sortDesc', $scope.sortDesc);
                });

                $scope.sortDesc = !!localStorage.get('sortDesc');

                function passesFilter(article) {
                    if (_.isEmpty($scope.articleFilter)) {
                        return true;
                    }
                    var txt = ($scope.articleFilter || '').toLowerCase();
                    return _.find(article, function (v, k) {
                        return !!(v && (v + '').toLowerCase().indexOf(txt) >= 0);
                    });
                }

                function notRead(article) {
                    return $scope.showRead || !$scope.readArticles || !_.has($scope.readArticles, article.$feed) || !_.has($scope.readArticles[article.$feed], article.$id);
                }

                function activeFeed(article) {
                    return !$scope.activeFeed || $scope.activeFeed === article.$feed;
                }

                function countActiveArticles() {
                    if ($scope.activeFeed) {
                        return $scope.counts[$scope.activeFeed] || 0;
                    }
                    else {
                        return _.reduce($scope.counts, function (memo, num) {
                            return memo + num;
                        }, 0);
                    }
                }

                $scope.feeds.$on('loaded', checkSearchPath);
                $scope.feeds.$on('child_removed', checkSearchPath);
                function checkSearchPath() {
                    // if a feed is currently selected and that feed does not exist anymore
                    // then clear the selection
                    var feed = ($location.search() || {}).feed;
                    if (feed && !($scope.feeds || {})[feed]) {
                        $location.replace();
                        $location.search('feed', null);
                    }
                }

                $scope.startLoading();
                $scope.feeds.$on('loaded', function () {
                    $scope.stopLoading();
                });
            }
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
