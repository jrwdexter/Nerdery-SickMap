define(['angular', 'jquery', 'Models/Sickcell'], function(angular, $, Sickcell){
    'use strict';
    return angular
    .module('sickMap.controllers', [])
    .controller('SickmapController', function ($scope) {
        $scope.XOffset = 0;
        $scope.YOffset = 0;
        $scope.Zoom = 1.0;

        var seatingPromise = $.get('/seating').done(function (data) {
            $scope.Users = JSON.parse(data).map(function (cell) {
                return new Sickcell(cell.RowCol, cell.Value);
            });
        }).error(function(data) {
            document.cookie = 'AccessToken=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            window.location = '/';
        });

        $.get('/sick').done(function (data) {
            var sickPeople = JSON.parse(data);
            seatingPromise.done(function () {
                $.grep($scope.Users, function (user) {
                    return sickPeople.indexOf(user.val) >= 0;
                }).forEach(function (user) {
                    user.sick = true;
                });
                $scope.$apply();
            });
        });

        $scope.ZoomIn = function () {
            $scope.Zoom += 0.1;
            if ($scope.Zoom > 10) {
                $scope.Zoom = 10;
            }
        };

        $scope.ZoomOut = function () {
            $scope.Zoom -= 0.1;
            if ($scope.Zoom < 1) {
                $scope.Zoom = 1;
            }
        };
    });
});
