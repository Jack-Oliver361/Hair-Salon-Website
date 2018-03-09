'use strict';
app.factory('profileService', ['$http', function ($http) {

    var serviceBase = 'http://localhost:62975/';
    var ordersServiceFactory = {};

    var _getOrders = function () {

        return $http.get(serviceBase + 'api/customer').then(function (results) {
            return results;
        });
    };

    ordersServiceFactory.getOrders = _getOrders;

    return ordersServiceFactory;

}]);