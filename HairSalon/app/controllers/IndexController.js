'use strict';
app.controller('indexController', ['$scope', '$location', '$anchorScroll', 'authService', function ($scope, $location, $anchorScroll, authService) {

    $scope.logOut = function () {
        authService.logOut();
        $location.path('/home');
    };
    $scope.gotoTop = function () {
        if ($location.path() == "/home") {
            $('html, body').animate({
                scrollTop: 0

            }, 1000, "easeInOutExpo");
        } else {
            $location.path('/home');
        }
    };
    $scope.authentication = authService.authentication;

}]);