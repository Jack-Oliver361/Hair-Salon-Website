'use strict';
app.controller('signupController', ['$scope', '$location', '$timeout', 'authService', function ($scope, $location, $timeout, authService) {

    $scope.savedSuccessfully = false;
    $scope.message = "";

    $scope.registration = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        dob: "",
        gender: ""
    };

    $scope.signUp = function () {
        $scope.message = "";
        if ($scope.policyCheck) {
            authService.saveRegistration($scope.registration).then(function (response) {

                $scope.savedSuccessfully = true;
                $scope.message = "User has been registered successfully, you will be redicted to login page in 2 seconds.";
                startTimer();

            },
                function (response) {
                    var errors = [];
                    if (response.data) {
                        for (var key in response.data.modelState) {
                            for (var i = 0; i < response.data.modelState[key].length; i++) {
                                errors.push(" -- " + response.data.modelState[key][i]);
                            }
                        }
                        $scope.message = "Failed to register user due to: " + errors.join(' \n\r ');
                    }
                });
        } else {
            $scope.message = "You can not register until you accept the terms to the privacy policy";
        }
    };

    var startTimer = function () {
        var timer = $timeout(function () {
            $timeout.cancel(timer);
            $location.path('/login');
        }, 2000);
    };

}]);