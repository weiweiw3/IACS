
angular.module('firebase.service.login', ['firebase', 'firebase.utils'])

   .factory('loginService', ['$rootScope', '$firebaseSimpleLogin',
        'firebaseRef', 'authScopeUtil', 'profileCreator', '$timeout',
      function($rootScope, $firebaseSimpleLogin, firebaseRef, authScopeUtil, profileCreator, $timeout) {
         var auth = null;
         return {
            init: function() {
               return auth = $firebaseSimpleLogin(firebaseRef());
            },

            /**
             * @param {string} email
             * @param {string} pass
             * @param {Function} [callback]
             * @returns {*}
             */
            login: function(email, pass, remember, callback) {
               assertAuth();
               auth.$login('password', {
                  email: email,
                  password: pass,
                  rememberMe: remember
               }).then(function(user) {
                     if( callback ) {
                        callback(null, user);
                     }
                  }, callback);
            },

            logout: function() {
               assertAuth();
               $rootScope.$broadcast('authManager:beforeLogout', auth);
               auth.$logout();
            },

            addToScope: function($scope) {
                 authScopeUtil($scope);
                 $scope.login = this.login;
                 $scope.logout = this.logout;
            },

            changePassword: function(opts) {
               assertAuth();
               var cb = opts.callback || function() {};
               if( !opts.oldpass || !opts.newpass ) {
                  $timeout(function(){ cb('Please enter a password'); });
               }
               else if( opts.newpass !== opts.confirm ) {
                  $timeout(function() { cb('Passwords do not match'); });
               }
               else {
                  auth.$changePassword(opts.email, opts.oldpass, opts.newpass).then(function() { cb && cb(null) }, cb);
               }
            },

            createAccount: function(email, pass, callback) {
               assertAuth();

               auth.$createUser(email, pass)
                 .then(function(user) {

                     if( callback ){
                        callback(null, user);  
                     }
                  }, callback);
            },

            createProfile: profileCreator
         };

         function assertAuth() {
             if( auth === null ) { throw new Error('Must call loginService.init() before using its methods'); }
         }
      }])

   .factory('profileCreator', ['firebaseRef', '$timeout',
        'FB_PATH',
        function(firebaseRef, $timeout,FB_PATH) {
      return function(id, email, callback) {
          firebaseRef(FB_PATH.users_+
                email.replace('.',FB_PATH.REPLACE_DOT)+'/'+FB_PATH.userProfile_)
          .set({
                  id:id,
                  email: email,
                  name: firstPartOfEmail(email)
                },
              function(err) {
                //err && console.error(err);
                if( callback ) {
                   $timeout(function() {
                      callback(err);
                   })
            }
         });

         function firstPartOfEmail(email) {
            return ucfirst(email.substr(0, email.indexOf('@'))||'');
         }

         function ucfirst (str) {
            // credits: http://kevin.vanzonneveld.net
            str += '';
            var f = str.charAt(0).toUpperCase();
            return f + str.substr(1);
         }
      }
   }]);
