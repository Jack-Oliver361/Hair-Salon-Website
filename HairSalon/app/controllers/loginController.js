'use strict';
app.controller('loginController', ['$scope', '$location', 'authService', function ($scope, $location, authService) {

    $scope.loginData = {
        userName: "",
        password: ""
    };

    $scope.message = "";

    $scope.login = function () {

        authService.login($scope.loginData).then(function (response) {

            $location.path('/home');

        },
            function (err) {
                console.log(err);
                if (err.error === "invalid_grant")
                    $scope.message = "The user name or password is incorrect";
                if (err === 400)
                    $scope.message = "Email or password are incorrect";
            });
    };

}]);