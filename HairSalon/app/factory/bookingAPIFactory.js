angular.module('booking').factory('bookingAPIFactory', ['$http', 'bookingConfig', function bookingAPIFactory($http, bookingConfig) {

    var bookingAPI = {};
    bookingAPI.status = "";
    bookingAPI.availableHours = [];
    bookingAPI.availableProviders = [];
    bookingAPI.availableServices = [];


    bookingAPI.getAvailableHours = function (params) {
        return $http({
            method: 'GET',
            params: params,
            url: bookingConfig.getAvailableHoursAPIUrl,
            responseType: 'json'

        }).then(function (response) {
            bookingAPI.status = response.status;
            bookingAPI.availableHours = response.data;
        }, function (response) {
            bookingAPI.errorManagement(response.status);
        });
    }



    bookingAPI.getAvailableServices = function () {

        var req = {
            method: 'GET',
            url: bookingConfig.getAvailableServicesAPIUrl
        }

        return $http(req).then(function onSuccess(response) {
            bookingAPI.status = response.status;
            bookingAPI.availableServices = [];
            angular.forEach(response.data, function (item) {
                console.log(item.name);
                bookingAPI.availableServices.push(item.name);
            })

        }).catch(function Error(response) {
            bookingAPI.errorManagement(response.status);
        });
    }


    bookingAPI.getAvailableProviders = function () {

        var req = {
            method: 'GET',
            url: bookingConfig.getAvailableEmployeesAPIUrl
        }

        return $http(req).then(function onSuccess(response) {
            bookingAPI.status = response.status;
            bookingAPI.availableProviders = [];
            angular.forEach(response.data, function (item) {
                bookingAPI.availableProviders.push(item.firstName + " " + item.lastName);
            })

        }).catch(function Error(response) {
            bookingAPI.errorManagement(response.status);
        });
    }

    bookingAPI.reserve = function (booking) {
        return $http.post(bookingConfig.reserveAPIUrl, booking).then(function (response) {
            bookingAPI.status = response.status;
        }, function (response) {
            bookingAPI.errorManagement(response.status);
        });
    }



    bookingAPI.errorManagement = function (status) {
        resetVariables();
        switch (status) {
            case 500: 
                bookingAPI.status = "SERVER_ERROR";
                break;
            default: 
                bookingAPI.status = 401;
                break;
        }
    }

    function resetVariables() {
        bookingAPI.status = "";
        bookingAPI.message = "";
        bookingAPI.availableHours = "";
        bookingAPI.availableServices = "";
        bookingAPI.availableProviders = "";
    }
    return bookingAPI;
}]);