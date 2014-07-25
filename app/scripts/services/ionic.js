"use strict";
angular.module('myApp.services.ionic', ['ionic'])
.service('ionicLoading',function($ionicLoading){
        this.load=function(){
            $ionicLoading.show({
                template: '<i class="icon ion-loading-c"></i>\n<br/>\nLoading...',
                noBackdrop: false
            });
        };
        this.unload=function(){
            $ionicLoading.hide();
        };
    });