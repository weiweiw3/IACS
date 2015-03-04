/**
 * Created by C5155394 on 2015/3/4.
 */
angular.module('myApp.controllers.messagesInOneComponent', [])
//for message-list.html
    //get message list with factory myMessage
    //update unread number with factory myComponent
    .controller('messagesInOneComponentCtrl', function
        (myComponent, myMessage, $stateParams, $location, $timeout, $scope, ionicLoading) {

        $scope.component = $stateParams.component;

        $scope.messages = myMessage.getMessageList($scope.component);

        ionicLoading.load();

        $scope.messages.$loaded().then(function () {
            ionicLoading.unload();
        });

        $scope.goDetail = function (key) {
            $scope.messages[key].read = false;
            $scope.messages.$save(key).then(function () {

                myComponent.UnreadCountMinus($scope.component);

                $location.path('/message').search({
                    'key': $scope.messages[key].$id,
                    'component': $scope.component
                });

            });

        };

        $scope.order = function (predicate, reverse) {
            $scope.messages = orderBy($scope.messages, predicate, reverse);
        };
    });
