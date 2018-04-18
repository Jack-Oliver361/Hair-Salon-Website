'use strict';
angular.module('booking').provider('bookingConfig', [function bookingConfigProvider() {

    var config = {
        getAvailableHoursAPIUrl: "http://localhost:62975/api/appointments/GetTimes", 
        getAvailableEmployeesAPIUrl: "http://localhost:62975/api/employees/Get",
        getAvailableServicesAPIUrl: "http://localhost:62975/api/services/Get",
        reserveAPIUrl: "http://localhost:62975/api/appointments/createBooking", 
        dateFormat: "dd/MM/yyyy",
        serviceTemplate: "availableServices.html",
        providerTemplate: "availableProviders.html",
        datepickerTemplate: "datepicker.html",
        availableHoursTemplate: "availableHours.html",
        noAvailableHoursTemplate: "noAvailableHours.html",
        confirmFormTemplate: "confirmForm.html",
    };

    return ({
        $get: function () {
            return config;
        },
        set: function (values) {
            angular.extend(config, values);
        }
    });

}]);