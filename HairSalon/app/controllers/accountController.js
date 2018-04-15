'use strict';
app.controller('accountController', ['$scope', '$location', '$timeout', 'accountService', function ($scope, $location, $timeout, accountService) {

    $scope.savedSuccessfully = false;
    $scope.message = "";

    $scope.account = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        dob: "",
        gender: ""
    };

    accountService.getAccount().then(function (results) {

        console.log(results.data);
        $scope.account = {
            customerID:  results.data.customerID,
            firstName: results.data.firstName,
            lastName: results.data.lastName,
            email: results.data.email,
            password: results.data.password,
            confirmPassword: results.data.confirmPassword,
            phone: results.data.phone,
            dob: results.data.dob,
            gender: results.data.gender
        };

    }, function (error) {
        //alert(error.data.message);
        });

    $scope.updateAccount = function () {

       accountService.updateAccount($scope.account).then(function (response) {

            $scope.savedSuccessfully = true;
            $scope.message = "Account updated successfully, you will be redicted to login page in 2 seconds.";
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
                    $scope.message = "Failed to update account user due to: " + errors.join(' \n\r ');
                }
            });
    };

    var startTimer = function () {
        var timer = $timeout(function () {
            console.log("hi there");
            $timeout.cancel(timer);
            $location.path('/home');
        }, 2000);
    };

}]);