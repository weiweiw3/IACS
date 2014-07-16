'use strict';

/* Controllers */

angular.module('myApp.controllers', ['myApp.utils', 'fr.feedManager'])

    .controller('NavCtrl', ['$scope',  'localStorage', function($scope, localStorage) {
        //todo NavCtrl is attached to <body> tag, use a pseudo element to limit scope?
        $scope.showAbout = !localStorage.get('hideAbout');

        $scope.toggleAbout = function() {
            $scope.showAbout = !$scope.showAbout;
            localStorage.set('hideAbout', !$scope.showAbout);
        };

        $scope.dismissAbout = function() {
            $scope.showAbout = false;
            localStorage.set('hideAbout', true);
        };
    }])

    .controller('HearthCtrl', ['$scope', 'feedManager', '$location', '$dialog', 'disposeOnLogout', 'feedScopeUtils', 'syncData', function($scope, feedManager, $location, $dialog, disposeOnLogout, feedScopeUtils, syncData) {
        var pid = $scope.auth.provider;
        var uid = $scope.auth.user;
        var feedMgr = $scope.feedManager = new feedManager(pid, uid, disposeOnLogout);
        feedScopeUtils($scope, feedMgr);

        // 2-way synchronize of the articles this user has marked as read
        $scope.readArticles = syncData(['user', pid, uid, 'read'], 250);

        $scope.addFeed = function(feedId) {
            feedMgr.addFeed(feedId, function(errCode, errMsg) {
                $location.search('feed', feedId);
                $scope.startLoading();
                $scope.articles.$on('change', function() { $scope.stopLoading(); });
            });
        };

        $scope.removeFeed = function(feedId, $event) {
            $dialog.dialog({
                backdrop: true,
                keyboard: true,
                backdropClick: true,
                templateUrl: 'partials/confirmDialog.html',
                controller: 'ConfirmDialogCtrl'
            }).open().then(function(confirmed) {
                if( confirmed ) {
                    if( $scope.activeFeed === feedId ) {
                        $scope.activeFeed = null;
                        $location.replace();
                        $location.search('feed', null);
                    }
                    if( $event ) {
                        $event.preventDefault();
                        $event.stopPropagation();
                    }
                    feedMgr.removeFeed(feedId);
                    $scope.readArticles.$remove(feedId);
                }
            });
        };
    }])

    .controller('DemoCtrl', ['$scope', 'feedManager', 'feedScopeUtils', function($scope, feedManager, feedScopeUtils) {
        $scope.isDemo = true;
        $scope.readArticles = {};
        var feedMgr = $scope.feedManager = new feedManager('demo', 'demo');
        feedScopeUtils($scope, feedMgr);
    }])

    .controller('ArticleCtrl', ['$scope', function($scope) {
        var ABSOLUTE_WIDTH = 850;

        $scope.opts = {
            dialogClass: 'modal article'
        };

        $scope.open = function(article) {
            if( !article ) { $scope.close(); }
            else {
                $scope.article = article;
                setNext(article);
                setPrev(article);
                $scope.isOpen = true;
                resize();
                if( angular.element(window).width() <= ABSOLUTE_WIDTH ) {
                    window.scrollTo(0,0);
                }
                $scope.markArticleRead(article);
            }
        };

        $scope.close = function() {
            $scope.isOpen = false;
        };

        $scope.closed = function() {
            $scope.article = null;
            $scope.isOpen = false;
        };

        // resize height of element dynamically
        var resize = _.debounce(function() {
            if( $scope.isOpen ) {
                var $article = angular.element('div.modal.article');
                var maxHeight = 'none';
                if( angular.element(window).width() > ABSOLUTE_WIDTH ) {
                    var windowHeight = angular.element(window).height();
                    var headHeight = $article.find('.modal-header').outerHeight() + $article.find('.modal-footer').outerHeight();
                    maxHeight = (windowHeight * .8 - headHeight)+'px';
                }
                $article.find('.modal-body').css('max-height', maxHeight);
            }
        }, 50);

        function setNext(article) {
            var next = angular.element('#'+article.$id).next('article');
            $scope.next = next.length? $scope.articles.find(next.attr('id')) : null;
        }

        function setPrev(article) {
            var prev = angular.element('#'+article.$id).prev('article');
            $scope.prev = prev.length? $scope.articles.find(prev.attr('id')) : null;
        }

        angular.element(window).bind('resize', resize);

        $scope.$on('modal:article', function(event, article) {
            $scope.open(article);
        });

    }])

    .controller('CustomFeedCtrl', ['$scope', function($scope) {
        var $log = $scope.$log;
        $scope.isOpen = false;

        $scope.$on('modal:customFeed', function() {
            $scope.open();
        });

        $scope.open = function() {
            $scope.isOpen = true;
        };

        $scope.close = function() {
            $scope.isOpen = false;
        };

        $scope.add = function() {
            $log.debug('adding custom feed', $scope.title, $scope.url);
            $scope.feedManager.addFeed({url: $scope.url, title: $scope.title});
            $scope.close();
            $scope.title = null;
            $scope.url = null;
        };
    }])

    .controller('ConfirmDialogCtrl', ['$scope', 'dialog', function($scope, dialog) {
        $scope.close = function(result) {
            dialog.close(result);
        }
    }])

    .controller('PetIndexCtrl', function() {
    })

    .controller('PetDetailCtrl', function($scope, $stateParams, PetService) {
      // "Pets" is a service returning mock data (services.js)
      $scope.pet = PetService.get($stateParams.petId);
    })

    .controller('componentsCtrl',function($scope,$ionicLoading){
        $scope.loadingOptions = {
            duration: 1000,
            delay: 0,
            template: '<i class="icon ion-loading-c"></i>\n<br/>\nLoading...',
            noBackdrop: false
        };
        $scope.showLoading = function() {
            $ionicLoading.show($scope.loadingOptions);
        };
    })

    .controller('LoginCtrl', ['$scope', 'loginService', '$location','waitForAuth','$q','$ionicLoading',
        function($scope, loginService, $location,waitForAuth, $q,$ionicLoading) {
            var defer = $q.defer();
            var loadingOptions = {
//                duration: 1000,
//                delay: 0,
                template: '<i class="icon ion-loading-c"></i>\n<br/>\nLoading...',
                noBackdrop: false
            };
            /*$scope.showLoading = function() {
                $ionicLoading.show($scope.loadingOptions);
            };*/


            $scope.logindata = {
                email: '',
                pass: '',
                remember: true
            };

            $scope.confirm = null;

            $scope.createMode = false;

            $scope.trylogin = function(cb) {

                function lo(){
                    var error =null;
                    var deferred = $q.defer();
                    $ionicLoading.show(loadingOptions );
                        loginService.login($scope.logindata.email,
                            $scope.logindata.pass, $scope.logindata.remember,
                            function(err, user) {
                                error = err? err + '' : null;
                                if( !err ) {
                                    cb && cb(user);
                                }
                                if(error != null){
                                    deferred.reject(error);
                                } else {
                                    deferred.resolve('ok');
                                }

                            });
                    return deferred.promise;
                }
                var promise = lo();
                promise.then(function(update) {
                    console.log('Success: ' + update);
                    $ionicLoading.hide();
                }, function(reason) {
                    console.log('Failed: ' + reason);
                    $ionicLoading.hide();
                }, function(update) {
                    console.log('Got notification: ' + update);
                });

            };

            $scope.createAccount = function() {
                $scope.err = null;
                if( assertValidLoginAttempt() ) {
                    loginService.createAccount($scope.logindata.email, $scope.logindata.pass,
                        function(err, user) {
                        if( err ) {
                            $scope.err = err? err + '' : null;
                        }
                        else {
                            // must be logged in before I can write to my profile

                            $scope.login(function() {
                                loginService.createProfile(user.uid, user.email);
//                                $location.path('/account');
                            });
                        }
                    });
                }
            };

            $scope.logout = function() {
                loginService.logout();
            };
            $scope.onSwipeLeft = function() {
                console.log('kk');
            };
            $scope.show1 =function(){
                function aa(waitForAuth){
                    waitForAuth.then(function(update) {
                        console.log('z');

                    }, function(reason) {
                        console.log('Failed: ' + reason);

                    }, function(update) {
                        console.log('Got notification: ' + update);
                    });
                }
                aa();
            };

            $scope.doRefresh = function() {
//                    $http.get('/new-items')
//                        .success(function(newItems) {
//                            $scope.items = newItems;
//                        })
//                        .finally(function() {
//                            // Stop the ion-refresher from spinning
//                            $scope.$broadcast('scroll.refreshComplete');
//                        });
            };

            function assertValidLoginAttempt() {
                if( !$scope.logindata.email ) {
                    $scope.err = 'Please enter an email address';
                }
                else if( !$scope.logindata.pass ) {
                    $scope.err = 'Please enter a password';
                }
//                else if( $scope.logindata.pass !== $scope.confirm ) {
//                    $scope.err = 'Passwords do not match';
//                }
                return !$scope.err;
            }
        }])

    .controller('ForeverCtrl',
    ['$scope', '$timeout','feedManager', '$location',
        'disposeOnLogout', 'feedScopeUtils', 'syncData',
        function($scope, $timeout,feedManager, $location,
                 disposeOnLogout, feedScopeUtils, syncData){
            var pid = $scope.auth_min.provider;
            var uid = $scope.auth_min.user;
            var feedMgr = $scope.feedManager = new feedManager(pid, uid, disposeOnLogout);
            feedScopeUtils($scope, feedMgr);

            // 2-way synchronize of the articles this user has marked as read
            $scope.readArticles = syncData(['user', pid, uid, 'read'], 250);

            $scope.items = [];
            for (var i = 0; i < 20; i++) {
                $scope.items.push(i);
            }

            //Load more after 1 second delay
            $scope.loadMoreItems = function() {
                var i = $scope.items.length;
                var j = $scope.items.length + 5;
                for (; i < j; i++) {
                    $scope.items.push('Item ' + i);
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            };
            $scope.addFeed = function(feedId) {
                feedMgr.addFeed(feedId, function(errCode, errMsg) {
                    $location.search('feed', feedId);
                    $scope.startLoading();
                    $scope.articles.$on('change', function() { $scope.stopLoading(); });
                });
            };
    }])
    .controller('ActionSheetCtrl', function($scope, $ionicActionSheet) {
        $scope.messages = [];
        $scope.takeAction = function() {
            $ionicActionSheet.show({
                buttons: [
                    { text: 'Share <i class="icon ion-share">' },
                    { text: 'Edit <i class="icon ion-edit">' }
                ],
                destructiveText: 'Delete <i class="icon ion-trash-b">',
                titleText: 'Modify your album',
                cancelText: 'Cancel',
                cancel: function() {
                    $scope.message('Cancel');
                    return true;
                },
                buttonClicked: function(index) {
                    $scope.message(index === 0 ? 'Share' : 'Edit');
                    return true;
                },
                destructiveButtonClicked: function() {
                    $scope.message('Delete');
                    return true;
                }
            });
        };
        $scope.message = function(msg) {
            $scope.messages.unshift({
                text: 'User pressed ' + msg
            });
        };
    })

;