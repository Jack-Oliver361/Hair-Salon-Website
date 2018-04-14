
(function() {
	//Module definition with dependencies
	angular.module('hm.booking', ['ui.bootstrap', 'pascalprecht.translate', 'ngMessages',]);

})();

(function() {
    angular.module('hm.booking').provider('bookingConfig', [bookingConfigProvider]);

    function bookingConfigProvider() {

        var config = {
            getAvailableHoursAPIUrl: "http://localhost:62975/api/appointments/GetTimes", //API url endpoint to load list of available hours
            getAvailableEmployeesAPIUrl: "http://localhost:62975/api/employees/Get", //API url endpoint to load list of available employees
            getAvailableServicesAPIUrl: "http://localhost:62975/api/services/Get",
            reserveAPIUrl: "http://localhost:62975/api/appointments/createBooking", //API url endpoint to do a reserve
            dateFormat: "dd/MM/yyyy",
            serviceTemplate: "availableServices.html",
            providerTemplate: "availableProviders.html",
            datepickerTemplate: "datepicker.html",
            availableHoursTemplate: "availableHours.html",
            noAvailableHoursTemplate: "noAvailableHours.html",
            confirmFormTemplate: "confirmForm.html",
        };

        //Public API for the provider
        return ({
            $get: function() {
                return config;
            },
            set: function (values) {
                angular.extend(config, values);
            }
        });

    }
})();

(function () {

    angular.module('hm.booking').controller('BookingCtrl', ['$scope', '$filter', 'bookingAPIFactory', 'bookingConfig', 'bookingService', 'authService', '$location', '$timeout', bookingCtrl]);

    function bookingCtrl($scope, $filter, bookingAPIFactory, bookingConfig, bookingService, authService, $location, $timeout) {
        var vm = this;

        vm.selectedTab = 0;
        vm.secondTabLocked = true;
        vm.thirdTabLocked = true;
        vm.fourthTabLocked = true;
        vm.fifthTabLocked = true;

        vm.selectedDate = new Date();

        vm.selectedHour = "";
        vm.formattedDate = "";
        vm.selectedService = "";
        vm.selectedProvider = "";
        vm.userData = {};

        vm.loader = false;

        vm.getAvailableDatesFromAPI = bookingConfig.getAvailableDatesFromAPI;
        vm.dateFormat = bookingConfig.dateFormat;

        vm.providerTemplate = bookingConfig.providerTemplate;
        vm.serviceTemplate = bookingConfig.serviceTemplate;
        vm.datepickerTemplate = bookingConfig.datepickerTemplate;
        vm.availableHoursTemplate = bookingConfig.availableHoursTemplate;
        vm.noAvailableHoursTemplate = bookingConfig.noAvailableHoursTemplate;
        vm.confirmFormTemplate = bookingConfig.confirmFormTemplate;

        vm.datepickerOptions = $scope.datepickerOptions || {
            minDate: new Date() };
       


        vm.availableServices = [];
        getAvailableServices();

        vm.availableProviders = [];
        getAvailableProviders();

        vm.availableHours = [];
        //METHODS
        vm.onSelectDate = function (date) {
            vm.selectedDate = date;
            vm.thirdTabLocked = false;
            vm.selectedTab = 2;
            vm.fourthTabLocked = true;
            vm.fifthTabLocked = true;
            vm.selectedHour = "";
            vm.selectedProvider = "";
            

        }
        $scope.authentication = authService.authentication;
        vm.selectHour = function (hour) {
            vm.fifthTabLocked = false;
            vm.selectedHour = hour;
            vm.selectedTab = 4;
            vm.formattedDate = $filter('date')(vm.selectedDate, vm.dateFormat);
            
        }

        vm.selectProvider = function (provider) {
            vm.fourthTabLocked = false;
            vm.selectedProvider = provider;
            vm.selectedTab = 3;
            getAvailableHours(provider, vm.selectedDate, vm.selectedService);
            vm.fifthTabLocked = true;
            vm.selectedHour = "";


        }
        vm.selectService = function (service) {
            vm.secondTabLocked = false;
            vm.selectedService = service;
            vm.selectedTab = 1;
            vm.thirdTabLocked = true;
            vm.fourthTabLocked = true;
            vm.fifthTabLocked = true;
            vm.selectedHour = "";
            vm.formattedDate = "";
            vm.selectedProvider = "";
          
        }

        vm.reserve = function () {
           reserve(vm.selectedService, vm.selectedDate, vm.selectedProvider, vm.selectedHour, authService.authentication.userName);
        }

       
        //PRIVATE METHODS

        
        /**
         * Get all services
         */
        function getAvailableServices() {
            vm.loader = true;

            bookingAPIFactory.getAvailableServices().then(function () {
                vm.loader = false;

                var status = vm.availableServicesStatus = bookingAPIFactory.status;

                //Completed get available hours callback
                bookingService.onCompletedGetAvailableServices(status);

                //Success
                if (status == 200) {
                    vm.availableServices = bookingAPIFactory.availableServices;
                    //Successful get available hours callback
                    bookingService.onSuccessfulGetAvailableServices(status);

                    

                    //Error
                } else {
                    bookingService.onErrorGetAvailableServices(status);
                }
            });
        }

        /**
         * Get all services
         */
        function getAvailableProviders() {
            vm.loader = true;

            bookingAPIFactory.getAvailableProviders().then(function () {
                vm.loader = false;

                var status = vm.availableProvidersStatus = bookingAPIFactory.status;

                //Completed get available hours callback
                bookingService.onCompletedGetAvailableProviders(status);

                //Success
                if (status == 200) {
                    vm.availableProviders = bookingAPIFactory.availableProviders;
                    //Successful get available hours callback
                    bookingService.onSuccessfulGetAvailableServices(status);



                    //Error
                } else {
                    //Error get available hours callback
                    bookingService.onErrorGetAvailableProviders(status);
                }
            });
        }

        /**
         * Get available hours for a selected date
         */
        function getAvailableHours(provider, date, service) {
            var selectedDateFormatted = $filter('date')(date, vm.dateFormat);

            var params = {
                fullName: provider,
                date: selectedDateFormatted,
                Service: service
            };
            vm.loader = true;
            bookingAPIFactory.getAvailableHours(params).then(function () {
                vm.loader = false;

                var status = vm.availableHoursStatus = bookingAPIFactory.status;

                //Completed get available hours callback
                bookingService.onCompletedGetAvailableHours(status);

                //Success
                if (status == 200) {
                    vm.availableHours = bookingAPIFactory.availableHours;
                    //Successful get available hours callback
                    bookingService.onSuccessfulGetAvailableHours(status);


                    //Error
                } else {
                    //Error get available hours callback
                    bookingService.onErrorGetAvailableHours(status);

                }
            });
        }

       

        /**
         * Do reserve POST with selectedDate, selectedHour and userData as parameters of the call
         */
        function reserve(service, date, provider, hour, email) {
            var selectedDateFormatted = $filter('date')(date, vm.dateFormat);
            vm.loader = true;
            var params = {
                selectedService: service,
                selectedDate: selectedDateFormatted,
                selectedProvider: provider,
                selectedHour: hour,
                Email: email
            };

            bookingAPIFactory.reserve(params).then(function () {
                vm.loader = false;

                var status = vm.bookingStatus = bookingAPIFactory.status;
                var message = vm.bookingMessage = bookingAPIFactory.message;

                //Completed reserve callback
                bookingService.onCompletedReserve(service, date, provider, hour, email);

                //Success
                if (status == 200) {
                    //Successful reserve calback
                    bookingService.onSuccessfulReserve(service, date, provider, hour, email);
                    $timeout(function () {
                        $location.path('/home');
                    }, 3000);

                    //Error
                } else {
                    //Error reserve callback
                    bookingService.onErrorReserve(service, date, provider, hour, email);
                }
            });
        }
    }

})();


(function() {
    //Directive
    angular.module('hm.booking').directive('booking', [function() {
        return {
            restrict: 'E',
            scope: {
                datepickerOptions: '='
            },
            controller: 'BookingCtrl',
            controllerAs: 'bookingCtrl',
            templateUrl: 'index.html'
        };
    }]);

})();



(function() {
    function bookingAPIFactory($http, bookingConfig) {

        var bookingAPI = {};

        // Error details
        bookingAPI.status = "";

        bookingAPI.availableHours = [];
        bookingAPI.availableProviders = [];
        bookingAPI.availableServices = [];

        //METHODS

        //Call to get list of available hours
        bookingAPI.getAvailableHours = function(params) {
            return $http({
                method: 'GET',
                params: params,
                url: bookingConfig.getAvailableHoursAPIUrl,
                responseType: 'json'

            }).then(function(response) {
                //Success handler

                bookingAPI.status = response.status;
                bookingAPI.availableHours = response.data;
            }, function(response) {
                bookingAPI.errorManagement(response.status);
            });
        }
        //Call to get list of available services
        bookingAPI.getAvailableServices = function () {

            var req = {
                method: 'GET',
                url: bookingConfig.getAvailableServicesAPIUrl
   

            }

            return $http(req).then(function onSuccess(response) {
                //Success handler
                
                bookingAPI.status = response.status;
                angular.forEach(response.data, function (item) {
                    bookingAPI.availableServices.push(item.name);
                })

            }).catch(function Error(response) {
                bookingAPI.errorManagement(response.status);
            });
        }

        //Call to get list of available services
        bookingAPI.getAvailableProviders = function () {

            var req = {
                method: 'GET',
                url: bookingConfig.getAvailableEmployeesAPIUrl


            }

            return $http(req).then(function onSuccess(response) {
                //Success handler

                bookingAPI.status = response.status;
                angular.forEach(response.data, function (item) {
                bookingAPI.availableProviders.push(item.firstName + " " + item.lastName);
               })

            }).catch(function Error(response) {
                bookingAPI.errorManagement(response.status);
            });
        }

        //Call to do a reserve
        bookingAPI.reserve = function (booking) {
            return $http.post(bookingConfig.reserveAPIUrl, booking).then(function (response) {
                //Success handler
                bookingAPI.status = response.status;

            }, function(response) {
                bookingAPI.errorManagement(response.status);
            });
        }


        //Error management function, handles different kind of status codes
        bookingAPI.errorManagement = function(status) {
            resetVariables();
            switch (status) {
                case 500: //Server error
                    bookingAPI.status = "SERVER_ERROR";
                    break;
                default: //Other error, typically connection error
                    bookingAPI.status = 401;
                    break;
            }
        }

        //Reset factory variables when an error occurred
        function resetVariables() {
            bookingAPI.status = "";
            bookingAPI.message = "";
            bookingAPI.availableHours = "";
            bookingAPI.availableServices = "";
            bookingAPI.availableProviders = "";
        }

        

        return bookingAPI;
    }
    angular.module('hm.booking').factory('bookingAPIFactory', ['$http', 'bookingConfig', bookingAPIFactory]);
})();
/**
 * Service for booking management
 * @author hmartos
 */
(function() {
    function bookingService($q, $filter, $uibModal, bookingConfig) {

        
        //Completed get available services callback
        this.onCompletedGetAvailableServices = function (status) {
            console.log("Executing completed get available services callback");
        }

        //Success get available services callback
        this.onSuccessfulGetAvailableServices = function (status) {
            console.log("Executing successful get available services callback");
        }

        //Error get available services callback
        this.onErrorGetAvailableServices = function (status) {
            console.log("Executing error get available services callback");
        }
        //Completed get available services callback
        this.onCompletedGetAvailableProviders = function (status) {
            console.log("Executing completed get available Providers callback");
        }

        //Success get available services callback
        this.onSuccessfulGetAvailableProviders = function (status) {
            console.log("Executing successful get available Providers callback");
        }

        //Error get available services callback
        this.onErrorGetAvailableProviders = function (status) {
            console.log("Executing error get available Providers callback");
        }

        //Completed get available hours callback
        this.onCompletedGetAvailableHours = function(status) {
            console.log("Executing completed get available hours callback");
        }

        //Success get available hours callback
        this.onSuccessfulGetAvailableHours = function(status) {
            console.log("Executing successful get available hours callback");
        }

        //Error get available hours callback
        this.onErrorGetAvailableHours = function(status) {
            console.log("Executing error get available hours callback");
        }

        //Completed reserve callback
        this.onCompletedReserve = function (status) {
            console.log("Executing completed reserve callback");
        }

        //Success reserve callback
        this.onSuccessfulReserve = function (status) {
            console.log("Executing successful reserve callback");
        }

        //Error reserve callback
        this.onErrorReserve = function (status) {
            console.log("Executing error reserve callback");
        }

    }
    angular.module('hm.booking').service('bookingService', ['$q', '$filter', '$uibModal', 'bookingConfig', bookingService]);
})();

angular.module("hm.booking").run(["$templateCache", function ($templateCache) {
$templateCache.put("availableServices.html", "<a class=\"list-group-item\" href=\"\" ng-repeat=\"item in bookingCtrl.availableServices\" ng-click=\"bookingCtrl.selectService(item)\"\r\n   ng-class=\"{\'angular-booking-selected\': bookingCtrl.selectedService == item}\">\r\n    <span>{{item}}</span>\r\n</a>");
$templateCache.put("availableProviders.html", "<a class=\"list-group-item\" href=\"\" ng-repeat=\"item in bookingCtrl.availableProviders\" ng-click=\"bookingCtrl.selectProvider(item)\"\r\n   ng-class=\"{\'angular-booking-selected\': bookingCtrl.selectedProvider == item}\">\r\n    <span>{{item}}</span>\r\n</a>");
$templateCache.put("availableHours.html", "<a class=\"list-group-item\" href=\"\" ng-repeat=\"item in bookingCtrl.availableHours\" ng-click=\"bookingCtrl.selectHour(item)\"\r\n   ng-class=\"{\'angular-booking-selected\': bookingCtrl.selectedHour == item}\">\r\n    <span>{{item}}</span>\r\n</a>");
$templateCache.put("confirmForm.html", "<div class=\"col-md-4 col-md-offset-4 angular-booking-clientForm\">\r\n    <div class=\"row\">\r\n        <h4 class=\"\" for=\"name\" style=\"margin-left:calc(100% - 75%);\">{{\"Service\"}} {{bookingCtrl.selectedService}}</h4> </div>\r\n\r\n   <div class=\"row\"> <h4 class=\"\" for=\"phone\" style=\"margin-left:calc(100% - 75%);\">{{\"Day:\"}} {{bookingCtrl.formattedDate}}</h4> </div>\r\n    <div class=\"row\"> <h4 class=\"\" for=\"email\" style=\"margin-left:calc(100% - 75%);\">{{\"Provider:\"}} {{bookingCtrl.selectedProvider}}</h4> </div>\r\n <div class=\"row\"> <h4 class=\"\" for=\"email\" style=\"margin-left:calc(100% - 75%);\">{{\"Time:\"}} {{bookingCtrl.selectedHour}}</h4> </div> <div class=\"row\"> <button style=\"margin-left:calc(100% - 75%);\" class=\"btn btn- info\" ng-click=\"bookingCtrl.reserve()\"> Book Now </button> </div>\r\n\r\n  <div uib-alert class=\"alert-success text-center\" ng-if=\"bookingCtrl.bookingStatus == 200\" style=\"margin-top: 1em\">\r\n            <span>Success!</span>\r\n            <p ng-if=\"bookingCtrl.bookingMessage\">{{bookingCtrl.bookingMessage}}</p>\r\n        </div>\r\n\r\n        <div uib-alert class=\"alertt-danger text-center\" ng-if=\"bookingCtrl.bookingStatus == 500\" style=\"margin-top: 1em\">\r\n            <span>Error!</span>\r\n            <p ng-if=\"bookingCtrl.bookingMessage\">{{bookingCtrl.bookingMessage}}</p>\r\n        </div>\r\n    </div>\r\n</div>");
$templateCache.put("datepicker.html","<div uib-datepicker class=\"angular-booking-datepicker\" ng-model=\"bookingCtrl.selectedDate\" datepicker-options=\"bookingCtrl.datepickerOptions\"\r\n     ng-change=\"bookingCtrl.onSelectDate(bookingCtrl.selectedDate)\"></div>");
$templateCache.put("index.html", "<div class=\"angular-booking-box\"> \r\n <uib-tabset active=\"bookingCtrl.selectedTab\" justified=\"true\"> \r\n <uib-tab index=\"0\"> \r\n <uib-tab-heading> \r\n <span class=\"glyphicon glyphicon-list-alt\" aria-hidden=\"true\" class=\"angular-booking-icon-size\"></span>\r\n <h5 ng-if=\"bookingCtrl.secondTabLocked\">{{\"Services\"}}</h5> \r\n <h5 ng-if=\"!bookingCtrl.secondTabLocked\">{{bookingCtrl.selectedService}}</h5> \r\n </uib-tab-heading> \r\n\r\n <div ng-include=\"\'loader.html\'\" class=\"text-center\" style=\"min-height: 250px\" ng-if=\"bookingCtrl.loader\"> </div> \r\n\r\n <div ng-include=\"bookingCtrl.serviceTemplate\" ng-if=\"!bookingCtrl.loader\"></div>\r\n </uib-tab>\r\n\r\n <uib-tab index=\"1\" disable=\"bookingCtrl.secondTabLocked\"> \r\n <uib-tab-heading> \r\n <span class=\"glyphicon glyphicon-calendar\" aria-hidden=\"true\" class=\"angular-booking-icon-size\"></span>\r\n <h5 ng-if=\"bookingCtrl.thirdTabLocked\">{{\"date\"}}</h5> \r\n <h5 ng-if=\"!bookingCtrl.thirdTabLocked\">{{bookingCtrl.selectedDate | date: bookingCtrl.dateFormat}}</h5> \r\n </uib-tab-heading> \r\n\r\n <div ng-include=\"\'loader.html\'\" class=\"text-center\" style=\"min-height: 250px\" ng-if=\"bookingCtrl.loader\"> </div> \r\n\r\n <div ng-include=\"bookingCtrl.datepickerTemplate\" ng-if=\"!bookingCtrl.loader\"></div>\r\n </uib-tab>\r\n\r\n <uib-tab index=\"2\" disable=\"bookingCtrl.thirdTabLocked\"> \r\n <uib-tab-heading> \r\n <span class=\"glyphicon glyphicon-user\" aria-hidden=\"true\" class=\"angular-booking-icon-size\"></span>\r\n <h5 ng-if=\"bookingCtrl.fourthTabLocked\">{{\"Provider\"}}</h5> \r\n <h5 ng-if=\"!bookingCtrl.fourthTabLocked\">{{bookingCtrl.selectedProvider}}</h5>\r\n </uib-tab-heading>\r\n\r\n <div ng-include=\"\'loader.html\'\" class=\"text-center\" style=\"min-height: 250px\" ng-if=\"bookingCtrl.loader\"></div>\r\n\r\n <div ng-include=\"bookingCtrl.providerTemplate\" ng-if=\"!bookingCtrl.loader\"></div>\r\n\r\n </uib-tab>\r\n <uib-tab index=\"3\" disable=\"bookingCtrl.fourthTabLocked\"> \r\n <uib-tab-heading> \r\n <span class=\"glyphicon glyphicon-time\" aria-hidden=\"true\" class=\"angular-booking-icon-size\"></span>\r\n <h5 ng-if=\"bookingCtrl.fifthTabLocked\">{{\"time\"}}</h5>\r\n                <h5 ng-if=\"!bookingCtrl.fifthTabLocked\">{{bookingCtrl.selectedHour}}</h5>\r\n \r\n\r\n </uib-tab-heading>\r\n\r\n <div ng-include=\"\'loader.html\'\" class=\"text-center\" style=\"min-height: 250px\" ng-if=\"bookingCtrl.loader\"></div>\r\n\r\n <div class=\"angular-booking-availableHour\" ng-if=\"!bookingCtrl.loader && bookingCtrl.availableHours.length > 0\"> \r\n <div ng-include=\"bookingCtrl.availableHoursTemplate\"></div>\r\n </div>\r\n\r\n <div ng-if=\"!bookingCtrl.loader && bookingCtrl.availableHours.length == 0\"> \r\n \r\n </div>\r\n </uib-tab>\r\n\r\n  <uib-tab index=\"4\" disable=\"bookingCtrl.fifthTabLocked\">\r\n            <uib-tab-heading>\r\n                <span class=\"glyphicon glyphicon-user\" aria-hidden=\"true\" class=\"angular-booking-icon-size\"></span>\r\n                <h5>{{\"client\"}}</h5>\r\n            </uib-tab-heading>\r\n\r\n            <form class=\"form-horizontal\" name=\"reserveForm\" novalidate\r\n                  ng-submit=\"reserveForm.$valid && bookingCtrl.reserve(bookingCtrl.selectedDate, bookingCtrl.selectedHour, bookingCtrl.userData)\">\r\n                <div ng-include=\"\'loader.html\'\" class=\"text-center\" style=\"min-height: 250px\" ng-if=\"bookingCtrl.loader\"></div>\r\n\r\n                <fieldset ng-if=\"!bookingCtrl.loader\">\r\n                    <div ng-include=\"bookingCtrl.confirmFormTemplate\"></div>\r\n                </fieldset>\r\n            </form>\r\n        </uib-tab></uib-tabset>\r\n</div>\r\n" );
$templateCache.put("loader.html","<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1\" width=\"50px\" height=\"50px\" viewBox=\"0 0 28 28\">\r\n    <!-- 28= RADIUS*2 + STROKEWIDTH -->\r\n\r\n    <title>Material design circular activity spinner with CSS3 animation</title>\r\n    <style type=\"text/css\">\r\n        /**************************/\r\n        /* STYLES FOR THE SPINNER */\r\n        /**************************/\r\n\r\n        /*\r\n         * Constants:\r\n         *      RADIUS      = 12.5\r\n         *      STROKEWIDTH = 3\r\n         *      ARCSIZE     = 270 degrees (amount of circle the arc takes up)\r\n         *      ARCTIME     = 1333ms (time it takes to expand and contract arc)\r\n         *      ARCSTARTROT = 216 degrees (how much the start location of the arc\r\n         *                                should rotate each time, 216 gives us a\r\n         *                                5 pointed star shape (it\'s 360/5 * 2).\r\n         *                                For a 7 pointed star, we might do\r\n         *                                360/7 * 3 = 154.286)\r\n         *\r\n         *      SHRINK_TIME = 400ms\r\n         */\r\n\r\n        .qp-circular-loader {\r\n            width:28px;  /* 2*RADIUS + STROKEWIDTH */\r\n            height:28px; /* 2*RADIUS + STROKEWIDTH */\r\n        }\r\n        .qp-circular-loader-path {\r\n            stroke-dasharray: 58.9;  /* 2*RADIUS*PI * ARCSIZE/360 */\r\n            stroke-dashoffset: 58.9; /* 2*RADIUS*PI * ARCSIZE/360 */\r\n            /* hides things initially */\r\n        }\r\n\r\n        /* SVG elements seem to have a different default origin */\r\n        .qp-circular-loader, .qp-circular-loader * {\r\n            -webkit-transform-origin: 50% 50%;\r\n            -moz-transform-origin: 50% 50%;\r\n        }\r\n\r\n        /* Rotating the whole thing */\r\n        @-webkit-keyframes rotate {\r\n            from {-webkit-transform: rotate(0deg);}\r\n            to {-webkit-transform: rotate(360deg);}\r\n        }\r\n        @-moz-keyframes rotate {\r\n            from {-webkit-transform: rotate(0deg);}\r\n            to {-webkit-transform: rotate(360deg);}\r\n        }\r\n        .qp-circular-loader {\r\n            -webkit-animation-name: rotate;\r\n            -webkit-animation-duration: 1568.63ms; /* 360 * ARCTIME / (ARCSTARTROT + (360-ARCSIZE)) */\r\n            -webkit-animation-iteration-count: infinite;\r\n            -webkit-animation-timing-function: linear;\r\n            -moz-animation-name: rotate;\r\n            -moz-animation-duration: 1568.63ms; /* 360 * ARCTIME / (ARCSTARTROT + (360-ARCSIZE)) */\r\n            -moz-animation-iteration-count: infinite;\r\n            -moz-animation-timing-function: linear;\r\n        }\r\n\r\n        /* Filling and unfilling the arc */\r\n        @-webkit-keyframes fillunfill {\r\n            from {\r\n                stroke-dashoffset: 58.8 /* 2*RADIUS*PI * ARCSIZE/360 - 0.1 */\r\n                /* 0.1 a bit of a magic constant here */\r\n            }\r\n            50% {\r\n                stroke-dashoffset: 0;\r\n            }\r\n            to {\r\n                stroke-dashoffset: -58.4 /* -(2*RADIUS*PI * ARCSIZE/360 - 0.5) */\r\n                /* 0.5 a bit of a magic constant here */\r\n            }\r\n        }\r\n        @-moz-keyframes fillunfill {\r\n            from {\r\n                stroke-dashoffset: 58.8 /* 2*RADIUS*PI * ARCSIZE/360 - 0.1 */\r\n                /* 0.1 a bit of a magic constant here */\r\n            }\r\n            50% {\r\n                stroke-dashoffset: 0;\r\n            }\r\n            to {\r\n                stroke-dashoffset: -58.4 /* -(2*RADIUS*PI * ARCSIZE/360 - 0.5) */\r\n                /* 0.5 a bit of a magic constant here */\r\n            }\r\n        }\r\n        @-webkit-keyframes rot {\r\n            from {\r\n                -webkit-transform: rotate(0deg);\r\n            }\r\n            to {\r\n                -webkit-transform: rotate(-360deg);\r\n            }\r\n        }\r\n        @-moz-keyframes rot {\r\n            from {\r\n                -webkit-transform: rotate(0deg);\r\n            }\r\n            to {\r\n                -webkit-transform: rotate(-360deg);\r\n            }\r\n        }\r\n        @-moz-keyframes colors {\r\n            0% {\r\n                stroke: #4285F4;\r\n            }\r\n            25% {\r\n                stroke: #DE3E35;\r\n            }\r\n            50% {\r\n                stroke: #F7C223;\r\n            }\r\n            75% {\r\n                stroke: #1B9A59;\r\n            }\r\n            100% {\r\n                stroke: #4285F4;\r\n            }\r\n        }\r\n\r\n        @-webkit-keyframes colors {\r\n            0% {\r\n                stroke: #4285F4;\r\n            }\r\n            25% {\r\n                stroke: #DE3E35;\r\n            }\r\n            50% {\r\n                stroke: #F7C223;\r\n            }\r\n            75% {\r\n                stroke: #1B9A59;\r\n            }\r\n            100% {\r\n                stroke: #4285F4;\r\n            }\r\n        }\r\n\r\n        @keyframes colors {\r\n            0% {\r\n                stroke: #4285F4;\r\n            }\r\n            25% {\r\n                stroke: #DE3E35;\r\n            }\r\n            50% {\r\n                stroke: #F7C223;\r\n            }\r\n            75% {\r\n                stroke: #1B9A59;\r\n            }\r\n            100% {\r\n                stroke: #4285F4;\r\n            }\r\n        }\r\n        .qp-circular-loader-path {\r\n            -webkit-animation-name: fillunfill, rot, colors;\r\n            -webkit-animation-duration: 1333ms, 5332ms, 5332ms; /* ARCTIME, 4*ARCTIME, 4*ARCTIME */\r\n            -webkit-animation-iteration-count: infinite, infinite, infinite;\r\n            -webkit-animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1), steps(4), linear;\r\n            -webkit-animation-play-state: running, running, running;\r\n            -webkit-animation-fill-mode: forwards;\r\n\r\n            -moz-animation-name: fillunfill, rot, colors;\r\n            -moz-animation-duration: 1333ms, 5332ms, 5332ms; /* ARCTIME, 4*ARCTIME, 4*ARCTIME */\r\n            -moz-animation-iteration-count: infinite, infinite, infinite;\r\n            -moz-animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1), steps(4), linear;\r\n            -moz-animation-play-state: running, running, running;\r\n            -moz-animation-fill-mode: forwards;\r\n        }\r\n\r\n    </style>\r\n\r\n    <!-- 3= STROKEWIDTH -->\r\n    <!-- 14= RADIUS + STROKEWIDTH/2 -->\r\n    <!-- 12.5= RADIUS -->\r\n    <!-- 1.5=  STROKEWIDTH/2 -->\r\n    <!-- ARCSIZE would affect the 1.5,14 part of this... 1.5,14 is specific to\r\n         270 degress -->\r\n    <g class=\"qp-circular-loader\">\r\n        <path class=\"qp-circular-loader-path\" fill=\"none\" d=\"M 14,1.5 A 12.5,12.5 0 1 1 1.5,14\" stroke-width=\"3\" stroke-linecap=\"round\"/>\r\n    </g>\r\n</svg>");
$templateCache.put("noAvailableHours.html", "<span class=\"angular-booking-noAvailableHours\">{{\"noAvailableHours\"}}</span>");
}]);