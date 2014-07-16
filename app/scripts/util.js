//**copy from firereader
/*! service.util.js
 *************************************/
(function (angular) {
   "use strict";

   var appUtils = angular.module('myApp.utils', ['firebase', 'firebase.utils']);

   appUtils.factory('articlesUrl', ['firebaseRef', 'FB_DEMO_LIMIT', 'FB_LIVE_LIMIT',
       'encodeFirebaseKey', function(firebaseRef, FB_DEMO_LIMIT, FB_LIVE_LIMIT, encodeFirebaseKey) {
      return function(feedUrl, isDemo) {
         var limit = isDemo? FB_DEMO_LIMIT : FB_LIVE_LIMIT;
         return firebaseRef('articles', encodeFirebaseKey(feedUrl), 'entries').endAt().limit(limit);
      }
   }]);

   appUtils.factory('articlesMetaUrl', ['firebaseRef', 'encodeFirebaseKey', function(firebaseRef, encodeFirebaseKey) {
      return function(feedUrl) {
         return firebaseRef('articles_meta', encodeFirebaseKey(feedUrl));
      }
   }]);

   appUtils.factory('articlesIndexUrl', ['firebaseRef', 'encodeFirebaseKey', function(firebaseRef, encodeFirebaseKey) {
      return function(feedUrl) {
         return firebaseRef('articles', encodeFirebaseKey(feedUrl), 'index');
      }
   }]);

   appUtils.factory('feedUrl', ['firebaseRef', function(firebaseRef) {
      return function(feedId) {
         return firebaseRef('feeds', feedId);
      }
   }]);

   appUtils.factory('readUrl', ['FIREBASE_URL', 'Firebase', '$rootScope',
       function(URL, Firebase, $rootScope) {
      return function(feedId, isDemo) {
         if( isDemo ) { return null; }
         var path = URL + ['user', $rootScope.auth_min.provider, $rootScope.auth_min.user, 'read', feedId].join('/');

         return new Firebase(path).endAt().limit(250);
      }
   }]);

})(angular);