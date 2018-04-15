'use strict';
app.factory('accountService', ['$http', 'authService', function ($http, authService) {

    var serviceBase = 'http://localhost:62975/';
    var accountServiceFactory = {};

    var _getAccount = function () {
        var email = authService.authentication.userName;
        console.log(email);
        return $http.get(serviceBase + 'api/customers/GetCustomer?email='+ email).then(function (results) {
            return results;
            console.log(results.data);
        });
    };

    var _updateAccount = function (registration) {
        console.log(registration);
        return $http.put(serviceBase + 'api/customers/update', registration).then(function (response) {
            return response;
        });

    };

    accountServiceFactory.getAccount = _getAccount;
    accountServiceFactory.updateAccount = _updateAccount;

    return accountServiceFactory;

}]);