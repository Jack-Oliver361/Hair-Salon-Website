'use strict';
angular.module('hm.booking', ['ui.bootstrap', 'ngMessages',]);

angular.module('hm.booking').directive('booking', [function () {
    return {
        restrict: 'E',
        scope: {
            datepickerOptions: '='
        },
        controller: 'bookingController',
        controllerAs: 'bookingController',
        templateUrl: 'index.html'
    };
}]);

angular.module('hm.booking').controller('bookingController', ['$scope', '$filter', 'bookingAPIFactory', 'bookingConfig', 'authService', '$location', '$timeout', function bookingController($scope, $filter, bookingAPIFactory, bookingConfig, authService, $location, $timeout) {
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
        minDate: new Date(),
        dateDisabled: myDisabledDates
    };

    function myDisabledDates(dateAndMode) {
        return (dateAndMode.mode === 'day' && (dateAndMode.date.getDay() === 0 || dateAndMode.date.getDay() === 6));
    }

    getAvailableServices();
    getAvailableProviders();

    vm.availableHours = [];
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


    function getAvailableServices() {
        vm.loader = true;

        bookingAPIFactory.getAvailableServices().then(function () {
            vm.loader = false;

            var status = vm.availableServicesStatus = bookingAPIFactory.status;

            if (status == 200) {
                vm.availableServices = bookingAPIFactory.availableServices;
                console.log("Success getting services from API, Code: " + status);
            } else {
                console.log("Error getting services from API, Code: " + status);
            }
        });
    }


    function getAvailableProviders() {
        vm.loader = true;

        bookingAPIFactory.getAvailableProviders().then(function () {
            vm.loader = false;

            var status = vm.availableProvidersStatus = bookingAPIFactory.status;

            if (status == 200) {
                vm.availableProviders = bookingAPIFactory.availableProviders;
                console.log("Success getting providers from API, Code: " + status);
            } else {
                console.log("Error getting providers from API, Code: " + status);
            }
        });
    }

    function getAvailableHours(provider, date, service) {
        vm.loader = true;

        var selectedDateFormatted = $filter('date')(date, vm.dateFormat);
        var params = {
            fullName: provider,
            date: selectedDateFormatted,
            Service: service
        };

        bookingAPIFactory.getAvailableHours(params).then(function () {
            vm.loader = false;

            var status = vm.availableHoursStatus = bookingAPIFactory.status;

            if (status == 200) {
                vm.availableHours = bookingAPIFactory.availableHours;
                console.log("Success getting available hours from API, Code: " + status);
            } else {
                console.log("Error getting available hours from API, Code: " + status);
            }
        });
    }

    function reserve(service, date, provider, hour, email) {

        vm.loader = true;
        var selectedDateFormatted = $filter('date')(date, vm.dateFormat);
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

            if (status == 200) {
                console.log("Success sending appointment to API, Code: " + status);
                $timeout(function () {
                    $location.path('/home');
                }, 3000);
            } else {
                console.log("Error sending appointment to API, Code: " + status);
            }

        });
    }
}]);


angular.module("hm.booking").run(["$templateCache", function ($templateCache) {
    $templateCache.put("availableServices.html", "<a class=\"list-group-item\" href=\"\" ng-repeat=\"item in bookingController.availableServices track by $index\" ng-click=\"bookingController.selectService(item)\"\r\n   ng-class=\"{\'angular-booking-selected\': bookingController.selectedService == item}\">\r\n    <span>{{item}}</span>\r\n</a>");
    $templateCache.put("availableProviders.html", "<a class=\"list-group-item\" href=\"\" ng-repeat=\"item in bookingController.availableProviders track by $index\" ng-click=\"bookingController.selectProvider(item)\"\r\n   ng-class=\"{\'angular-booking-selected\': bookingController.selectedProvider == item}\">\r\n    <span>{{item}}</span>\r\n</a>");
    $templateCache.put("availableHours.html", "<a class=\"list-group-item\" href=\"\" ng-repeat=\"item in bookingController.availableHours\" ng-click=\"bookingController.selectHour(item)\"\r\n   ng-class=\"{\'angular-booking-selected\': bookingController.selectedHour == item}\">\r\n    <span>{{item}}</span>\r\n</a>");
    $templateCache.put("confirmForm.html", "<div class=\"col-md-4 col-md-offset-4 angular-booking-clientForm\">\r\n    <div class=\"row\">\r\n        <h4 class=\"\" for=\"name\" style=\"margin-left:calc(100% - 75%);\">{{\"Service\"}} {{bookingController.selectedService}}</h4> </div>\r\n\r\n   <div class=\"row\"> <h4 class=\"\" for=\"phone\" style=\"margin-left:calc(100% - 75%);\">{{\"Day:\"}} {{bookingController.formattedDate}}</h4> </div>\r\n    <div class=\"row\"> <h4 class=\"\" for=\"email\" style=\"margin-left:calc(100% - 75%);\">{{\"Provider:\"}} {{bookingController.selectedProvider}}</h4> </div>\r\n <div class=\"row\"> <h4 class=\"\" for=\"email\" style=\"margin-left:calc(100% - 75%);\">{{\"Time:\"}} {{bookingController.selectedHour}}</h4> </div> <div class=\"row\"> <button style=\"margin-left:calc(100% - 75%);\" class=\"btn btn- info\" ng-click=\"bookingController.reserve()\"> Book Now </button> </div>\r\n\r\n  <div uib-alert class=\"alert-success text-center\" ng-if=\"bookingController.bookingStatus == 200\" style=\"margin-top: 1em\">\r\n            <span>Success!</span>\r\n            <p ng-if=\"bookingController.bookingMessage\">{{bookingController.bookingMessage}}</p>\r\n        </div>\r\n\r\n        <div uib-alert class=\"alertt-danger text-center\" ng-if=\"bookingController.bookingStatus == 500\" style=\"margin-top: 1em\">\r\n            <span>Error!</span>\r\n            <p ng-if=\"bookingController.bookingMessage\">{{bookingController.bookingMessage}}</p>\r\n        </div>\r\n    </div>\r\n</div>");
    $templateCache.put("datepicker.html", "<div uib-datepicker class=\"angular-booking-datepicker\" ng-model=\"bookingController.selectedDate\" datepicker-options=\"bookingController.datepickerOptions\"\r\n     ng-change=\"bookingController.onSelectDate(bookingController.selectedDate)\"></div>");
    $templateCache.put("index.html", "<div style='background-color: white' class=\"angular-booking-box\"> \r\n <uib-tabset active=\"bookingController.selectedTab\" justified=\"true\"> \r\n <uib-tab index=\"0\"> \r\n <uib-tab-heading> \r\n <span class=\"glyphicon glyphicon-list-alt\" aria-hidden=\"true\" class=\"angular-booking-icon-size\"></span>\r\n <h5 ng-if=\"bookingController.secondTabLocked\">{{\"Services\"}}</h5> \r\n <h5 ng-if=\"!bookingController.secondTabLocked\">{{bookingController.selectedService}}</h5> \r\n </uib-tab-heading> \r\n\r\n <div ng-include=\"\'loader.html\'\" class=\"text-center\" style=\"min-height: 250px\" ng-if=\"bookingController.loader\"> </div> \r\n\r\n <div ng-include=\"bookingController.serviceTemplate\" ng-if=\"!bookingController.loader\"></div>\r\n </uib-tab>\r\n\r\n <uib-tab index=\"1\" disable=\"bookingController.secondTabLocked\"> \r\n <uib-tab-heading> \r\n <span class=\"glyphicon glyphicon-calendar\" aria-hidden=\"true\" class=\"angular-booking-icon-size\"></span>\r\n <h5 ng-if=\"bookingController.thirdTabLocked\">{{\"date\"}}</h5> \r\n <h5 ng-if=\"!bookingController.thirdTabLocked\">{{bookingController.selectedDate | date: bookingController.dateFormat}}</h5> \r\n </uib-tab-heading> \r\n\r\n <div ng-include=\"\'loader.html\'\" class=\"text-center\" style=\"min-height: 250px\" ng-if=\"bookingController.loader\"> </div> \r\n\r\n <div ng-include=\"bookingController.datepickerTemplate\" ng-if=\"!bookingController.loader\"></div>\r\n </uib-tab>\r\n\r\n <uib-tab index=\"2\" disable=\"bookingController.thirdTabLocked\"> \r\n <uib-tab-heading> \r\n <span class=\"glyphicon glyphicon-user\" aria-hidden=\"true\" class=\"angular-booking-icon-size\"></span>\r\n <h5 ng-if=\"bookingController.fourthTabLocked\">{{\"Provider\"}}</h5> \r\n <h5 ng-if=\"!bookingController.fourthTabLocked\">{{bookingController.selectedProvider}}</h5>\r\n </uib-tab-heading>\r\n\r\n <div ng-include=\"\'loader.html\'\" class=\"text-center\" style=\"min-height: 250px\" ng-if=\"bookingController.loader\"></div>\r\n\r\n <div ng-include=\"bookingController.providerTemplate\" ng-if=\"!bookingController.loader\"></div>\r\n\r\n </uib-tab>\r\n <uib-tab index=\"3\" disable=\"bookingController.fourthTabLocked\"> \r\n <uib-tab-heading> \r\n <span class=\"glyphicon glyphicon-time\" aria-hidden=\"true\" class=\"angular-booking-icon-size\"></span>\r\n <h5 ng-if=\"bookingController.fifthTabLocked\">{{\"time\"}}</h5>\r\n                <h5 ng-if=\"!bookingController.fifthTabLocked\">{{bookingController.selectedHour}}</h5>\r\n \r\n\r\n </uib-tab-heading>\r\n\r\n <div ng-include=\"\'loader.html\'\" class=\"text-center\" style=\"min-height: 250px\" ng-if=\"bookingController.loader\"></div>\r\n\r\n <div class=\"angular-booking-availableHour\" ng-if=\"!bookingController.loader && bookingController.availableHours.length > 0\"> \r\n <div ng-include=\"bookingController.availableHoursTemplate\"></div>\r\n </div>\r\n\r\n <div ng-if=\"!bookingController.loader && bookingController.availableHours.length == 0\"> \r\n \r\n </div>\r\n </uib-tab>\r\n\r\n  <uib-tab index=\"4\" disable=\"bookingController.fifthTabLocked\">\r\n            <uib-tab-heading>\r\n                <span class=\"glyphicon glyphicon-user\" aria-hidden=\"true\" class=\"angular-booking-icon-size\"></span>\r\n                <h5>{{\"client\"}}</h5>\r\n            </uib-tab-heading>\r\n\r\n            <form class=\"form-horizontal\" name=\"reserveForm\" novalidate\r\n                  ng-submit=\"reserveForm.$valid && bookingController.reserve(bookingController.selectedDate, bookingController.selectedHour, bookingController.userData)\">\r\n                <div ng-include=\"\'loader.html\'\" class=\"text-center\" style=\"min-height: 250px\" ng-if=\"bookingController.loader\"></div>\r\n\r\n                <fieldset ng-if=\"!bookingController.loader\">\r\n                    <div ng-include=\"bookingController.confirmFormTemplate\"></div>\r\n                </fieldset>\r\n            </form>\r\n        </uib-tab></uib-tabset>\r\n</div>\r\n");
    $templateCache.put("loader.html", "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1\" width=\"50px\" height=\"50px\" viewBox=\"0 0 28 28\">\r\n    <!-- 28= RADIUS*2 + STROKEWIDTH -->\r\n\r\n    <title>Material design circular activity spinner with CSS3 animation</title>\r\n    <style type=\"text/css\">\r\n        /**************************/\r\n        /* STYLES FOR THE SPINNER */\r\n        /**************************/\r\n\r\n        /*\r\n         * Constants:\r\n         *      RADIUS      = 12.5\r\n         *      STROKEWIDTH = 3\r\n         *      ARCSIZE     = 270 degrees (amount of circle the arc takes up)\r\n         *      ARCTIME     = 1333ms (time it takes to expand and contract arc)\r\n         *      ARCSTARTROT = 216 degrees (how much the start location of the arc\r\n         *                                should rotate each time, 216 gives us a\r\n         *                                5 pointed star shape (it\'s 360/5 * 2).\r\n         *                                For a 7 pointed star, we might do\r\n         *                                360/7 * 3 = 154.286)\r\n         *\r\n         *      SHRINK_TIME = 400ms\r\n         */\r\n\r\n        .qp-circular-loader {\r\n            width:28px;  /* 2*RADIUS + STROKEWIDTH */\r\n            height:28px; /* 2*RADIUS + STROKEWIDTH */\r\n        }\r\n        .qp-circular-loader-path {\r\n            stroke-dasharray: 58.9;  /* 2*RADIUS*PI * ARCSIZE/360 */\r\n            stroke-dashoffset: 58.9; /* 2*RADIUS*PI * ARCSIZE/360 */\r\n            /* hides things initially */\r\n        }\r\n\r\n        /* SVG elements seem to have a different default origin */\r\n        .qp-circular-loader, .qp-circular-loader * {\r\n            -webkit-transform-origin: 50% 50%;\r\n            -moz-transform-origin: 50% 50%;\r\n        }\r\n\r\n        /* Rotating the whole thing */\r\n        @-webkit-keyframes rotate {\r\n            from {-webkit-transform: rotate(0deg);}\r\n            to {-webkit-transform: rotate(360deg);}\r\n        }\r\n        @-moz-keyframes rotate {\r\n            from {-webkit-transform: rotate(0deg);}\r\n            to {-webkit-transform: rotate(360deg);}\r\n        }\r\n        .qp-circular-loader {\r\n            -webkit-animation-name: rotate;\r\n            -webkit-animation-duration: 1568.63ms; /* 360 * ARCTIME / (ARCSTARTROT + (360-ARCSIZE)) */\r\n            -webkit-animation-iteration-count: infinite;\r\n            -webkit-animation-timing-function: linear;\r\n            -moz-animation-name: rotate;\r\n            -moz-animation-duration: 1568.63ms; /* 360 * ARCTIME / (ARCSTARTROT + (360-ARCSIZE)) */\r\n            -moz-animation-iteration-count: infinite;\r\n            -moz-animation-timing-function: linear;\r\n        }\r\n\r\n        /* Filling and unfilling the arc */\r\n        @-webkit-keyframes fillunfill {\r\n            from {\r\n                stroke-dashoffset: 58.8 /* 2*RADIUS*PI * ARCSIZE/360 - 0.1 */\r\n                /* 0.1 a bit of a magic constant here */\r\n            }\r\n            50% {\r\n                stroke-dashoffset: 0;\r\n            }\r\n            to {\r\n                stroke-dashoffset: -58.4 /* -(2*RADIUS*PI * ARCSIZE/360 - 0.5) */\r\n                /* 0.5 a bit of a magic constant here */\r\n            }\r\n        }\r\n        @-moz-keyframes fillunfill {\r\n            from {\r\n                stroke-dashoffset: 58.8 /* 2*RADIUS*PI * ARCSIZE/360 - 0.1 */\r\n                /* 0.1 a bit of a magic constant here */\r\n            }\r\n            50% {\r\n                stroke-dashoffset: 0;\r\n            }\r\n            to {\r\n                stroke-dashoffset: -58.4 /* -(2*RADIUS*PI * ARCSIZE/360 - 0.5) */\r\n                /* 0.5 a bit of a magic constant here */\r\n            }\r\n        }\r\n        @-webkit-keyframes rot {\r\n            from {\r\n                -webkit-transform: rotate(0deg);\r\n            }\r\n            to {\r\n                -webkit-transform: rotate(-360deg);\r\n            }\r\n        }\r\n        @-moz-keyframes rot {\r\n            from {\r\n                -webkit-transform: rotate(0deg);\r\n            }\r\n            to {\r\n                -webkit-transform: rotate(-360deg);\r\n            }\r\n        }\r\n        @-moz-keyframes colors {\r\n            0% {\r\n                stroke: #4285F4;\r\n            }\r\n            25% {\r\n                stroke: #DE3E35;\r\n            }\r\n            50% {\r\n                stroke: #F7C223;\r\n            }\r\n            75% {\r\n                stroke: #1B9A59;\r\n            }\r\n            100% {\r\n                stroke: #4285F4;\r\n            }\r\n        }\r\n\r\n        @-webkit-keyframes colors {\r\n            0% {\r\n                stroke: #4285F4;\r\n            }\r\n            25% {\r\n                stroke: #DE3E35;\r\n            }\r\n            50% {\r\n                stroke: #F7C223;\r\n            }\r\n            75% {\r\n                stroke: #1B9A59;\r\n            }\r\n            100% {\r\n                stroke: #4285F4;\r\n            }\r\n        }\r\n\r\n        @keyframes colors {\r\n            0% {\r\n                stroke: #4285F4;\r\n            }\r\n            25% {\r\n                stroke: #DE3E35;\r\n            }\r\n            50% {\r\n                stroke: #F7C223;\r\n            }\r\n            75% {\r\n                stroke: #1B9A59;\r\n            }\r\n            100% {\r\n                stroke: #4285F4;\r\n            }\r\n        }\r\n        .qp-circular-loader-path {\r\n            -webkit-animation-name: fillunfill, rot, colors;\r\n            -webkit-animation-duration: 1333ms, 5332ms, 5332ms; /* ARCTIME, 4*ARCTIME, 4*ARCTIME */\r\n            -webkit-animation-iteration-count: infinite, infinite, infinite;\r\n            -webkit-animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1), steps(4), linear;\r\n            -webkit-animation-play-state: running, running, running;\r\n            -webkit-animation-fill-mode: forwards;\r\n\r\n            -moz-animation-name: fillunfill, rot, colors;\r\n            -moz-animation-duration: 1333ms, 5332ms, 5332ms; /* ARCTIME, 4*ARCTIME, 4*ARCTIME */\r\n            -moz-animation-iteration-count: infinite, infinite, infinite;\r\n            -moz-animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1), steps(4), linear;\r\n            -moz-animation-play-state: running, running, running;\r\n            -moz-animation-fill-mode: forwards;\r\n        }\r\n\r\n    </style>\r\n\r\n    <!-- 3= STROKEWIDTH -->\r\n    <!-- 14= RADIUS + STROKEWIDTH/2 -->\r\n    <!-- 12.5= RADIUS -->\r\n    <!-- 1.5=  STROKEWIDTH/2 -->\r\n    <!-- ARCSIZE would affect the 1.5,14 part of this... 1.5,14 is specific to\r\n         270 degress -->\r\n    <g class=\"qp-circular-loader\">\r\n        <path class=\"qp-circular-loader-path\" fill=\"none\" d=\"M 14,1.5 A 12.5,12.5 0 1 1 1.5,14\" stroke-width=\"3\" stroke-linecap=\"round\"/>\r\n    </g>\r\n</svg>");
    $templateCache.put("noAvailableHours.html", "<span class=\"angular-booking-noAvailableHours\">{{\"noAvailableHours\"}}</span>");
}]);
