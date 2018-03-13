/**
 * Angular reservation module
 * @author hmartos
 */
(function() {
	//Module definition with dependencies
	angular.module('hm.reservation', ['ui.bootstrap', 'pascalprecht.translate', 'ngMessages',]);

})();
/**
 * Provider for reservation module
 * @author hmartos
 */
(function() {
    angular.module('hm.reservation').provider('reservationConfig', [reservationConfigProvider]);

    function reservationConfigProvider() {

        var config = {
            getAvailableDatesFromAPI: false, //Enable/disable load of available dates from API
            getAvailableDatesAPIUrl: "http://localhost:8080/availableDates", //API url endpoint to load list of available dates
            getAvailableHoursAPIUrl: "http://localhost:62975/api/appointments/availableTimes", //API url endpoint to load list of available hours
            getAvailableEmployeesAPIUrl: "http://localhost:62975/api/employees", //API url endpoint to load list of available employees
            getAvailableServicesAPIUrl: "http://localhost:62975/api/services",
            reserveAPIUrl: "http://localhost:62975/api/appointments/createBooking", //API url endpoint to do a reserve
            dateFormat: "dd/MM/yyyy",
            language: "en",
            showConfirmationModal: true,
            serviceTemplate: "availableServices.html",
            providerTemplate: "availableProviders.html",
            datepickerTemplate: "datepicker.html",
            availableHoursTemplate: "availableHours.html",
            noAvailableHoursTemplate: "noAvailableHours.html",
            clientFormTemplate: "clientForm.html",
            confirmationModalTemplate: "confirmationModal.html"
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
/**
 * Controller for directive
 * @author hmartos
 */
(function () {
    //Controller
    angular.module('hm.reservation').controller('ReservationCtrl', ['$scope', '$filter', '$translate', 'reservationAPIFactory', 'reservationConfig', 'reservationService', 'authService', '$location', '$timeout', reservationCtrl]);

    function reservationCtrl($scope, $filter, $translate, reservationAPIFactory, reservationConfig, reservationService, authService, $location, $timeout) {
        //Capture the this context of the Controller using vm, standing for viewModel
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

        vm.getAvailableDatesFromAPI = reservationConfig.getAvailableDatesFromAPI;
        vm.dateFormat = reservationConfig.dateFormat;

        vm.providerTemplate = reservationConfig.providerTemplate;
        vm.serviceTemplate = reservationConfig.serviceTemplate;
        vm.datepickerTemplate = reservationConfig.datepickerTemplate;
        vm.availableHoursTemplate = reservationConfig.availableHoursTemplate;
        vm.noAvailableHoursTemplate = reservationConfig.noAvailableHoursTemplate;
        vm.clientFormTemplate = reservationConfig.clientFormTemplate;

        vm.datepickerOptions = $scope.datepickerOptions || {
            minDate: new Date() };
        

        $translate.use(reservationConfig.language);

        if (vm.getAvailableDatesFromAPI) {
            
            vm.availableDates = [];
            getAvailableDates();
            //Disable not available dates in datepicker
            vm.datepickerOptions.dateDisabled = disableDates;
        } 

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
            getAvailableHours(provider, vm.selectedDate, vm.selectedService);
            
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
         * Get available dates
         */
        function getAvailableDates() {
            vm.loader = true;

            reservationAPIFactory.getAvailableDates().then(function () {
                vm.loader = false;

                var status = vm.availableDatesStatus = reservationAPIFactory.status;
                var message = vm.availableDatesMessage = reservationAPIFactory.message;

                //Completed get available hours callback
                reservationService.onCompletedGetAvailableDates(status, message);

                //Success
                if (status == 200) {
                    vm.availableDates = reservationAPIFactory.availableDates;
                    //Successful get available hours callback
                    reservationService.onSuccessfulGetAvailableDates(status, message, vm.availableDates);

                    //Preselect first available date
                    if (vm.availableDates.length > 0) {
                        vm.selectedDate = new Date(vm.availableDates[0]);
                    }

                    //Error
                } else {
                    //Error get available hours callback
                    reservationService.onErrorGetAvailableDates(status, message);
                }
            });
        }
        /**
         * Get all services
         */
        function getAvailableServices() {
            vm.loader = true;

            reservationAPIFactory.getAvailableServices().then(function () {
                vm.loader = false;

                var status = vm.availableServicesStatus = reservationAPIFactory.status;
                var message = vm.availableServicesMessage = reservationAPIFactory.message;

                //Completed get available hours callback
                reservationService.onCompletedGetAvailableServices(status, message);

                //Success
                if (status == 200) {
                    vm.availableServices = reservationAPIFactory.availableServices;
                    //Successful get available hours callback
                    reservationService.onSuccessfulGetAvailableServices(status, message, vm.availableServices);

                    

                    //Error
                } else {
                    reservationService.onErrorGetAvailableServices(status, message);
                }
            });
        }

        /**
         * Get all services
         */
        function getAvailableProviders() {
            vm.loader = true;

            reservationAPIFactory.getAvailableProviders().then(function () {
                vm.loader = false;

                var status = vm.availableProvidersStatus = reservationAPIFactory.status;
                var message = vm.availableProvidersMessage = reservationAPIFactory.message;

                //Completed get available hours callback
                reservationService.onCompletedGetAvailableProviders(status, message);

                //Success
                if (status == 200) {
                    vm.availableProviders = reservationAPIFactory.availableProviders;
                    //Successful get available hours callback
                    reservationService.onSuccessfulGetAvailableServices(status, message, vm.availableProviders);



                    //Error
                } else {
                    //Error get available hours callback
                    reservationService.onErrorGetAvailableProviders(status, message);
                }
            });
        }


        /**
         * Check if a date is available <=> it is in availableDates array
         * @param date
         * @returns {boolean}
         */
        function isDateAvailable(date) {
            if (vm.availableDates.indexOf(date.toISOString().substr(0, 10)) !== -1) {
                return true;
            }

            return false;
        }

        /**
         * Function to disable all dates not in available dates list
         * @param dateAndMode
         * @returns {boolean}
         */
        function disableDates(dateAndMode) {
            var date = dateAndMode.date,
                mode = dateAndMode.mode;
            var Month = new Date(myDate);

            Month.setMonth(myDate.getMonth());

            return (dateAndMode.mode === 'month' && (dateAndMode.date.getMonth() < Month));
        }

        /**
         * Function executed before get available hours function.
         */
        function onBeforeGetAvailableHours(date) {
            reservationService.onBeforeGetAvailableHours(date).then(function () {
                

            }, function () {
                console.log("onBeforeGetAvailableHours: Rejected promise");
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
            reservationAPIFactory.getAvailableHours(params).then(function () {
                vm.loader = false;

                var status = vm.availableHoursStatus = reservationAPIFactory.status;
                var message = vm.availableHoursMessage = reservationAPIFactory.message;

                //Completed get available hours callback
                reservationService.onCompletedGetAvailableHours(status, message);

                //Success
                if (status == 200) {
                    vm.availableHours = reservationAPIFactory.availableHours;
                    //Successful get available hours callback
                    reservationService.onSuccessfulGetAvailableHours(status, message, vm.availableHours);


                    //Error
                } else {
                    //Error get available hours callback
                    reservationService.onErrorGetAvailableHours(status, message);

                }
            });
        }

       

        /**
         * Do reserve POST with selectedDate, selectedHour and userData as parameters of the call
         */
        function reserve(service, date, provider, hour, email) {
            var selectedDateFormatted = $filter('date')(date, vm.dateFormat);
            vm.loader = true;
            var params = { selectedService: service, selectedDate: selectedDateFormatted, selectedProvider: provider, selectedHour: hour, Email: email};

            reservationAPIFactory.reserve(params).then(function () {
                vm.loader = false;

                var status = vm.reservationStatus = reservationAPIFactory.status;
                var message = vm.reservationMessage = reservationAPIFactory.message;

                //Completed reserve callback
                reservationService.onCompletedReserve(service, date, provider, hour, email);

                //Success
                if (status == 200) {
                    //Successful reserve calback
                    reservationService.onSuccessfulReserve(service, date, provider, hour, email);
                    $timeout(function () {
                        $location.path('/home');
                    }, 3000);

                    //Error
                } else {
                    //Error reserve callback
                    reservationService.onErrorReserve(service, date, provider, hour, email);
                }
            });
        }
    }

})();
/**
 * Reservation directive
 * @author hmartos
 */
(function() {
    //Directive
    angular.module('hm.reservation').directive('reservation', [function() {
        return {
            restrict: 'E',
            scope: {
                datepickerOptions: '='
            },
            controller: 'ReservationCtrl',
            controllerAs: 'reservationCtrl',
            templateUrl: 'index.html'
        };
    }]);

})();
/**
 * Factory for reservation
 * @author hmartos
 */
(function() {
    function reservationAPIFactory($http, reservationConfig) {

        var reservationAPI = {};

        // Error details
        reservationAPI.status = "";
        reservationAPI.message = "";

        reservationAPI.availableHours = [];
        reservationAPI.availableProviders = [];
        reservationAPI.availableDates = [];
        reservationAPI.availableServices = [];

        //METHODS

        //Call to get list of available dates
        reservationAPI.getAvailableDates = function() {
            return $http.get(reservationConfig.getAvailableDatesAPIUrl).then(function(response) {
                //Success handler

                //validateAvailableDatesResponseData(response.data);

                reservationAPI.status = response.status;
                reservationAPI.message = response.data.message;
                reservationAPI.availableDates = response.data.availableDates;

            }, function(response) {
                reservationAPI.errorManagement(response.status);
            });
        }

        //Call to get list of available hours
        reservationAPI.getAvailableHours = function(params) {
            return $http({
                method: 'GET',
                params: params,
                url: reservationConfig.getAvailableHoursAPIUrl,
                responseType: 'json'

            }).then(function(response) {
                //Success handler
                //validateAvailableHoursResponseData(response.data);

                reservationAPI.status = response.status;
                reservationAPI.message = response.data.message;
                reservationAPI.availableHours = response.data;
            }, function(response) {
                reservationAPI.errorManagement(response.status);
            });
        }
        //Call to get list of available services
        reservationAPI.getAvailableServices = function () {

            var req = {
                method: 'GET',
                url: reservationConfig.getAvailableServicesAPIUrl
   

            }

            return $http(req).then(function onSuccess(response) {
                //Success handler
                
                //validateAvailableServicesResponseData(response.data);
                reservationAPI.status = response.status;
                reservationAPI.message = response.data.message;
                angular.forEach(response.data, function (item) {
                    reservationAPI.availableServices.push(item.name);
                })

            }).catch(function Error(response) {
                reservationAPI.errorManagement(response.status);
            });
        }

        //Call to get list of available services
        reservationAPI.getAvailableProviders = function () {

            var req = {
                method: 'GET',
                url: reservationConfig.getAvailableEmployeesAPIUrl


            }

            return $http(req).then(function onSuccess(response) {
                //Success handler

                //validateAvailableServicesResponseData(response.data);
                reservationAPI.status = response.status;
                reservationAPI.message = response.data.message;
                angular.forEach(response.data, function (item) {
                reservationAPI.availableProviders.push(item.firstName + " " + item.lastName);
               })

            }).catch(function Error(response) {
                reservationAPI.errorManagement(response.status);
            });
        }

        //Call to do a reserve
        reservationAPI.reserve = function(params) {
            return $http({
                method: 'POST',
                data: params,
                url: reservationConfig.reserveAPIUrl,
                responseType: 'json'

            }).then(function(response) {
                //Success handler
                //validateReserveResponseData(response.data);
                reservationAPI.status = response.status;
                reservationAPI.message = response.data.message;

            }, function(response) {
                reservationAPI.errorManagement(response.status);
            });
        }


        //Error management function, handles different kind of status codes
        reservationAPI.errorManagement = function(status) {
            resetVariables();
            switch (status) {
                case 500: //Server error
                    reservationAPI.status = "SERVER_ERROR";
                    break;
                default: //Other error, typically connection error
                    reservationAPI.status = "CONNECTION_ERROR";
                    break;
            }
        }

        //Reset factory variables when an error occurred
        function resetVariables() {
            reservationAPI.status = "";
            reservationAPI.message = "";
            reservationAPI.availableHours = "";
            reservationAPI.availableServices = "";
            reservationAPI.availableProviders = "";
        }

        //Validate if available dates response has expected keys
        function validateAvailableDatesResponseData(data) {
            if(!data.hasOwnProperty('status')) console.error("Get available hours response should have a 'status' key");
            if(!data.hasOwnProperty('message')) console.error("Get available hours response should have a 'message' key");
            if(!data.hasOwnProperty('availableDates')) console.error("Get available hours response should have a 'availableDates' key");
        }
        //Validate if available dates response has expected keys
        function validateAvailableDatesResponseData(data) {
            if (!data.hasOwnProperty('status')) console.error("Get available hours response should have a 'status' key");
            if (!data.hasOwnProperty('message')) console.error("Get available hours response should have a 'message' key");
            if (!data.hasOwnProperty('availableServices')) console.error("Get available services response should have a 'availableServices' key");
        }
        //Validate if available hours response has expected keys
        function validateAvailableHoursResponseData(data) {
            if(!data.hasOwnProperty('status')) console.error("Get available hours response should have a 'status' key");
            if(!data.hasOwnProperty('message')) console.error("Get available hours response should have a 'message' key");
            if(!data.hasOwnProperty('availableHours')) console.error("Get available hours response should have a 'availableHours' key");
        }

        //Validate if reserve response has expected keys
        function validateReserveResponseData(data) {
            if(!data.hasOwnProperty('status')) console.error("Reserve response should have a 'status' key");
            if(!data.hasOwnProperty('message')) console.error("Reserve response should have a 'message' key");
        }


        return reservationAPI;
    }
    angular.module('hm.reservation').factory('reservationAPIFactory', ['$http', 'reservationConfig', reservationAPIFactory]);
})();
/**
 * Service for reservation management
 * @author hmartos
 */
(function() {
    function reservationService($q, $filter, $uibModal, reservationConfig) {

        //Completed get available dates callback
        this.onCompletedGetAvailableDates = function(status, message) {
            console.log("Executing completed get available dates callback");
        }

        //Success get available dates callback
        this.onSuccessfulGetAvailableDates = function(status, message, availableDates) {
            console.log("Executing successful get available dates callback");
        }

        //Error get available dates callback
        this.onErrorGetAvailableDates = function(status, message) {
            console.log("Executing error get available dates callback");
        }
        //Completed get available services callback
        this.onCompletedGetAvailableServices = function (status, message) {
            console.log("Executing completed get available services callback");
        }

        //Success get available services callback
        this.onSuccessfulGetAvailableServices = function (status, message, availableServices) {
            console.log("Executing successful get available services callback");
        }

        //Error get available services callback
        this.onErrorGetAvailableServices = function (status, message) {
            console.log("Executing error get available services callback");
        }
        //Completed get available services callback
        this.onCompletedGetAvailableProviders = function (status, message) {
            console.log("Executing completed get available Providers callback");
        }

        //Success get available services callback
        this.onSuccessfulGetAvailableProviders = function (status, message, availableServices) {
            console.log("Executing successful get available Providers callback");
        }

        //Error get available services callback
        this.onErrorGetAvailableProviders = function (status, message) {
            console.log("Executing error get available Providers callback");
        }

        //Before get available hours callback
        this.onBeforeGetAvailableHours = function(selectedDate) {
            console.log("Executing before get available hours callback");
            var deferred = $q.defer();

            deferred.resolve();
            //deferred.reject();

            return deferred.promise;
        }

        //Completed get available hours callback
        this.onCompletedGetAvailableHours = function(status, message, selectedDate) {
            console.log("Executing completed get available hours callback");
        }

        //Success get available hours callback
        this.onSuccessfulGetAvailableHours = function(status, message, selectedDate, availableHours) {
            console.log("Executing successful get available hours callback");
        }

        //Error get available hours callback
        this.onErrorGetAvailableHours = function(status, message, selectedDate) {
            console.log("Executing error get available hours callback");
        }

        //Before reserve callback
        this.onBeforeReserve = function(service, date, provider, hour, email) {
            console.log("Executing before reserve callback");
            var deferred = $q.defer();

            if(reservationConfig.showConfirmationModal) {
                openConfirmationModal(deferred, service, date, provider, hour, email);

            } else {
                deferred.resolve();
                //deferred.reject();
            }

            return deferred.promise;
        }


        //Completed reserve callback
        this.onCompletedReserve = function (status, message, service, date, provider, hour, email) {
            console.log("Executing completed reserve callback");
        }

        //Success reserve callback
        this.onSuccessfulReserve = function (status, message, service, date, provider, hour, email) {
            console.log("Executing successful reserve callback");
        }

        //Error reserve callback
        this.onErrorReserve = function (status, message, service, date, provider, hour, email) {
            console.log("Executing error reserve callback");
        }

       
        

        /**
         * Controller for confirmation modal
         */
        function confirmationModalCtrl(service, date, provider, hour, email) {
            var vm = this;

            vm.selectedDate = selectedDate;
            vm.selectedHour = selectedHour;
            vm.userData = userData;

            vm.translationParams = {
                name: userData.name,
                selectedDate: selectedDate,
                selectedHour: selectedHour
            }
        }

    }
    angular.module('hm.reservation').service('reservationService', ['$q', '$filter', '$uibModal', 'reservationConfig', reservationService]);
})();
/**
 * Internationalization file with translations
 * @author hmartos
 */
(function() {
    "use strict";
    angular.module('hm.reservation').config(['$translateProvider', function($translateProvider) {
        $translateProvider.translations('en', {
            date: "Date",
            time: "Time",
            client: "Client",
            name: "Name",
            save: "Save",
            cancel: "Cancel",
            select: "Select",
            phone: "Phone",
            email: "Email",
            required: "This field is required",
            minLength: "Minimum length of {{minLength}} is required",
            maxLength: "Maximum length of {{maxLength}} is required",
            invalidCharacters: "Not allowed characters",
            invalidPhone: "Invalid phone number",
            invalidEmail: "Invalid email address",
            reserve: "Reserve",
            confirmOK: "Yes, reserve",
            confirmCancel: "No, cancel",
            confirmTitle: "Confirm reservation",
            confirmText: "{{name}}, Are you sure you want to reserve date {{selectedDate}} at {{selectedHour}}?.",
            noAvailableHours: "There are not available hours for selected date, please select another date"
        });

        $translateProvider.translations('es', {
            date: "Fecha",
            time: "Hora",
            client: "Cliente",
            name: "Nombre",
            save: "Guardar",
            cancel: "Cancelar",
            select: "Seleccionar",
            phone: "Teléfono",
            email: "Email",
            required: "Este campo no puede estar vacío",
            minLength: "El número mínimo de carácteres es {{minLength}}",
            maxLength: "El número máximo de carácteres es {{maxLength}}",
            invalidCharacters: "Caracteres no permitidos",
            invalidPhone: "Número de teléfono no válido",
            invalidEmail: "Email no válido",
            reserve: "Reservar",
            confirmOK: "Sí, reservar",
            confirmCancel: "No, cancelar",
            confirmTitle: "Confirmar reserva",
            confirmText: "{{name}}, ¿Estás seguro de que deseas reservar el día {{selectedDate}} a las {{selectedHour}}?.",
            noAvailableHours: "No hay horas disponibles para la fecha seleccionada, por favor selecciona otra fecha"
        });

        //Available languages map
        $translateProvider.registerAvailableLanguageKeys(['es', 'en'], {
            'es_*': 'es',
            'en_*': 'en'
        });

        //Determine preferred language
        $translateProvider.determinePreferredLanguage();

        //Escapes HTML in the translation
        $translateProvider.useSanitizeValueStrategy('escaped');

    }]);
})();
angular.module("hm.reservation").run(["$templateCache", function ($templateCache) {
$templateCache.put("availableServices.html", "<a class=\"list-group-item\" href=\"\" ng-repeat=\"item in reservationCtrl.availableServices\" ng-click=\"reservationCtrl.selectService(item)\"\r\n   ng-class=\"{\'angular-reservation-selected\': reservationCtrl.selectedService == item}\">\r\n    <span>{{item}}</span>\r\n</a>");
$templateCache.put("availableProviders.html", "<a class=\"list-group-item\" href=\"\" ng-repeat=\"item in reservationCtrl.availableProviders\" ng-click=\"reservationCtrl.selectProvider(item)\"\r\n   ng-class=\"{\'angular-reservation-selected\': reservationCtrl.selectedProvider == item}\">\r\n    <span>{{item}}</span>\r\n</a>");
$templateCache.put("availableHours.html", "<a class=\"list-group-item\" href=\"\" ng-repeat=\"item in reservationCtrl.availableHours\" ng-click=\"reservationCtrl.selectHour(item)\"\r\n   ng-class=\"{\'angular-reservation-selected\': reservationCtrl.selectedHour == item}\">\r\n    <span>{{item}}</span>\r\n</a>");
$templateCache.put("clientForm.html", "<div class=\"col-md-4 col-md-offset-4 angular-reservation-clientForm\">\r\n    <div class=\"row\">\r\n        <h4 class=\"\" for=\"name\" style=\"margin-left:calc(100% - 75%);\">{{\"Service\" | translate}} {{reservationCtrl.selectedService}}</h4> </div>\r\n\r\n   <div class=\"row\"> <h4 class=\"\" for=\"phone\" style=\"margin-left:calc(100% - 75%);\">{{\"Day:\" | translate}} {{reservationCtrl.formattedDate}}</h4> </div>\r\n    <div class=\"row\"> <h4 class=\"\" for=\"email\" style=\"margin-left:calc(100% - 75%);\">{{\"Provider:\" | translate}} {{reservationCtrl.selectedProvider}}</h4> </div>\r\n <div class=\"row\"> <h4 class=\"\" for=\"email\" style=\"margin-left:calc(100% - 75%);\">{{\"Time:\" | translate}} {{reservationCtrl.selectedHour}}</h4> </div> <div class=\"row\"> <button style=\"margin-left:calc(100% - 75%);\" class=\"btn btn- info\" ng-click=\"reservationCtrl.reserve()\"> Book Now </button> </div>\r\n\r\n  <div uib-alert class=\"alert-success text-center\" ng-if=\"reservationCtrl.reservationStatus == 200\" style=\"margin-top: 1em\">\r\n            <span>Success!</span>\r\n            <p ng-if=\"reservationCtrl.reservationMessage\">{{reservationCtrl.reservationMessage}}</p>\r\n        </div>\r\n\r\n        <div uib-alert class=\"alertt-danger text-center\" ng-if=\"reservationCtrl.reservationStatus == 500\" style=\"margin-top: 1em\">\r\n            <span>Error!</span>\r\n            <p ng-if=\"reservationCtrl.reservationMessage\">{{reservationCtrl.reservationMessage}}</p>\r\n        </div>\r\n    </div>\r\n</div>");
$templateCache.put("confirmationModal.html","<div class=\"modal-header\">\r\n    <h3 class=\"modal-title\">{{\"confirmTitle\" | translate}}</h3>\r\n</div>\r\n\r\n<div class=\"modal-body\">\r\n    <h5>{{\"confirmText\" | translate : confirmationModalCtrl.translationParams}}</h5>\r\n\r\n    <div ng-repeat=\"(key, value) in confirmationModalCtrl.userData track by $index\">\r\n        <label class=\"control-label\">{{key | translate}}</label>\r\n\r\n        <h5>{{value}}</h5>\r\n    </div>\r\n</div>\r\n\r\n<div class=\"modal-footer\">\r\n    <button class=\"btn btn-danger\" type=\"button\" ng-click=\"$dismiss()\">{{\"confirmCancel\" | translate}}</button>\r\n    <button class=\"btn btn-success\" type=\"button\" ng-click=\"$close()\">{{\"confirmOK\" | translate}}</button>\r\n</div>");
$templateCache.put("datepicker.html","<div uib-datepicker class=\"angular-reservation-datepicker\" ng-model=\"reservationCtrl.selectedDate\" datepicker-options=\"reservationCtrl.datepickerOptions\"\r\n     ng-change=\"reservationCtrl.onSelectDate(reservationCtrl.selectedDate)\"></div>");
$templateCache.put("index.html", "<div class=\"angular-reservation-box\"> \r\n <uib-tabset active=\"reservationCtrl.selectedTab\" justified=\"true\"> \r\n <uib-tab index=\"0\"> \r\n <uib-tab-heading> \r\n <span class=\"glyphicon glyphicon-list-alt\" aria-hidden=\"true\" class=\"angular-reservation-icon-size\"></span>\r\n <h5 ng-if=\"reservationCtrl.secondTabLocked\">{{\"Services\" | translate}}</h5> \r\n <h5 ng-if=\"!reservationCtrl.secondTabLocked\">{{reservationCtrl.selectedService}}</h5> \r\n </uib-tab-heading> \r\n\r\n <div ng-include=\"\'loader.html\'\" class=\"text-center\" style=\"min-height: 250px\" ng-if=\"reservationCtrl.loader\"> </div> \r\n\r\n <div ng-include=\"reservationCtrl.serviceTemplate\" ng-if=\"!reservationCtrl.loader\"></div>\r\n </uib-tab>\r\n\r\n <uib-tab index=\"1\" disable=\"reservationCtrl.secondTabLocked\"> \r\n <uib-tab-heading> \r\n <span class=\"glyphicon glyphicon-calendar\" aria-hidden=\"true\" class=\"angular-reservation-icon-size\"></span>\r\n <h5 ng-if=\"reservationCtrl.thirdTabLocked\">{{\"date\" | translate}}</h5> \r\n <h5 ng-if=\"!reservationCtrl.thirdTabLocked\">{{reservationCtrl.selectedDate | date: reservationCtrl.dateFormat}}</h5> \r\n </uib-tab-heading> \r\n\r\n <div ng-include=\"\'loader.html\'\" class=\"text-center\" style=\"min-height: 250px\" ng-if=\"reservationCtrl.loader\"> </div> \r\n\r\n <div ng-include=\"reservationCtrl.datepickerTemplate\" ng-if=\"!reservationCtrl.loader\"></div>\r\n </uib-tab>\r\n\r\n <uib-tab index=\"2\" disable=\"reservationCtrl.thirdTabLocked\"> \r\n <uib-tab-heading> \r\n <span class=\"glyphicon glyphicon-user\" aria-hidden=\"true\" class=\"angular-reservation-icon-size\"></span>\r\n <h5 ng-if=\"reservationCtrl.fourthTabLocked\">{{\"Provider\" | translate}}</h5> \r\n <h5 ng-if=\"!reservationCtrl.fourthTabLocked\">{{reservationCtrl.selectedProvider}}</h5>\r\n </uib-tab-heading>\r\n\r\n <div ng-include=\"\'loader.html\'\" class=\"text-center\" style=\"min-height: 250px\" ng-if=\"reservationCtrl.loader\"></div>\r\n\r\n <div ng-include=\"reservationCtrl.providerTemplate\" ng-if=\"!reservationCtrl.loader\"></div>\r\n\r\n </uib-tab>\r\n <uib-tab index=\"3\" disable=\"reservationCtrl.fourthTabLocked\"> \r\n <uib-tab-heading> \r\n <span class=\"glyphicon glyphicon-time\" aria-hidden=\"true\" class=\"angular-reservation-icon-size\"></span>\r\n <h5 ng-if=\"reservationCtrl.fifthTabLocked\">{{\"time\" | translate}}</h5>\r\n                <h5 ng-if=\"!reservationCtrl.fifthTabLocked\">{{reservationCtrl.selectedHour}}</h5>\r\n \r\n\r\n </uib-tab-heading>\r\n\r\n <div ng-include=\"\'loader.html\'\" class=\"text-center\" style=\"min-height: 250px\" ng-if=\"reservationCtrl.loader\"></div>\r\n\r\n <div class=\"angular-reservation-availableHour\" ng-if=\"!reservationCtrl.loader && reservationCtrl.availableHours.length > 0\"> \r\n <div ng-include=\"reservationCtrl.availableHoursTemplate\"></div>\r\n </div>\r\n\r\n <div ng-if=\"!reservationCtrl.loader && reservationCtrl.availableHours.length == 0\"> \r\n \r\n </div>\r\n </uib-tab>\r\n\r\n  <uib-tab index=\"4\" disable=\"reservationCtrl.fifthTabLocked\">\r\n            <uib-tab-heading>\r\n                <span class=\"glyphicon glyphicon-user\" aria-hidden=\"true\" class=\"angular-reservation-icon-size\"></span>\r\n                <h5>{{\"client\" | translate}}</h5>\r\n            </uib-tab-heading>\r\n\r\n            <form class=\"form-horizontal\" name=\"reserveForm\" novalidate\r\n                  ng-submit=\"reserveForm.$valid && reservationCtrl.reserve(reservationCtrl.selectedDate, reservationCtrl.selectedHour, reservationCtrl.userData)\">\r\n                <div ng-include=\"\'loader.html\'\" class=\"text-center\" style=\"min-height: 250px\" ng-if=\"reservationCtrl.loader\"></div>\r\n\r\n                <fieldset ng-if=\"!reservationCtrl.loader\">\r\n                    <div ng-include=\"reservationCtrl.clientFormTemplate\"></div>\r\n                </fieldset>\r\n            </form>\r\n        </uib-tab></uib-tabset>\r\n</div>\r\n" );
$templateCache.put("loader.html","<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1\" width=\"50px\" height=\"50px\" viewBox=\"0 0 28 28\">\r\n    <!-- 28= RADIUS*2 + STROKEWIDTH -->\r\n\r\n    <title>Material design circular activity spinner with CSS3 animation</title>\r\n    <style type=\"text/css\">\r\n        /**************************/\r\n        /* STYLES FOR THE SPINNER */\r\n        /**************************/\r\n\r\n        /*\r\n         * Constants:\r\n         *      RADIUS      = 12.5\r\n         *      STROKEWIDTH = 3\r\n         *      ARCSIZE     = 270 degrees (amount of circle the arc takes up)\r\n         *      ARCTIME     = 1333ms (time it takes to expand and contract arc)\r\n         *      ARCSTARTROT = 216 degrees (how much the start location of the arc\r\n         *                                should rotate each time, 216 gives us a\r\n         *                                5 pointed star shape (it\'s 360/5 * 2).\r\n         *                                For a 7 pointed star, we might do\r\n         *                                360/7 * 3 = 154.286)\r\n         *\r\n         *      SHRINK_TIME = 400ms\r\n         */\r\n\r\n        .qp-circular-loader {\r\n            width:28px;  /* 2*RADIUS + STROKEWIDTH */\r\n            height:28px; /* 2*RADIUS + STROKEWIDTH */\r\n        }\r\n        .qp-circular-loader-path {\r\n            stroke-dasharray: 58.9;  /* 2*RADIUS*PI * ARCSIZE/360 */\r\n            stroke-dashoffset: 58.9; /* 2*RADIUS*PI * ARCSIZE/360 */\r\n            /* hides things initially */\r\n        }\r\n\r\n        /* SVG elements seem to have a different default origin */\r\n        .qp-circular-loader, .qp-circular-loader * {\r\n            -webkit-transform-origin: 50% 50%;\r\n            -moz-transform-origin: 50% 50%;\r\n        }\r\n\r\n        /* Rotating the whole thing */\r\n        @-webkit-keyframes rotate {\r\n            from {-webkit-transform: rotate(0deg);}\r\n            to {-webkit-transform: rotate(360deg);}\r\n        }\r\n        @-moz-keyframes rotate {\r\n            from {-webkit-transform: rotate(0deg);}\r\n            to {-webkit-transform: rotate(360deg);}\r\n        }\r\n        .qp-circular-loader {\r\n            -webkit-animation-name: rotate;\r\n            -webkit-animation-duration: 1568.63ms; /* 360 * ARCTIME / (ARCSTARTROT + (360-ARCSIZE)) */\r\n            -webkit-animation-iteration-count: infinite;\r\n            -webkit-animation-timing-function: linear;\r\n            -moz-animation-name: rotate;\r\n            -moz-animation-duration: 1568.63ms; /* 360 * ARCTIME / (ARCSTARTROT + (360-ARCSIZE)) */\r\n            -moz-animation-iteration-count: infinite;\r\n            -moz-animation-timing-function: linear;\r\n        }\r\n\r\n        /* Filling and unfilling the arc */\r\n        @-webkit-keyframes fillunfill {\r\n            from {\r\n                stroke-dashoffset: 58.8 /* 2*RADIUS*PI * ARCSIZE/360 - 0.1 */\r\n                /* 0.1 a bit of a magic constant here */\r\n            }\r\n            50% {\r\n                stroke-dashoffset: 0;\r\n            }\r\n            to {\r\n                stroke-dashoffset: -58.4 /* -(2*RADIUS*PI * ARCSIZE/360 - 0.5) */\r\n                /* 0.5 a bit of a magic constant here */\r\n            }\r\n        }\r\n        @-moz-keyframes fillunfill {\r\n            from {\r\n                stroke-dashoffset: 58.8 /* 2*RADIUS*PI * ARCSIZE/360 - 0.1 */\r\n                /* 0.1 a bit of a magic constant here */\r\n            }\r\n            50% {\r\n                stroke-dashoffset: 0;\r\n            }\r\n            to {\r\n                stroke-dashoffset: -58.4 /* -(2*RADIUS*PI * ARCSIZE/360 - 0.5) */\r\n                /* 0.5 a bit of a magic constant here */\r\n            }\r\n        }\r\n        @-webkit-keyframes rot {\r\n            from {\r\n                -webkit-transform: rotate(0deg);\r\n            }\r\n            to {\r\n                -webkit-transform: rotate(-360deg);\r\n            }\r\n        }\r\n        @-moz-keyframes rot {\r\n            from {\r\n                -webkit-transform: rotate(0deg);\r\n            }\r\n            to {\r\n                -webkit-transform: rotate(-360deg);\r\n            }\r\n        }\r\n        @-moz-keyframes colors {\r\n            0% {\r\n                stroke: #4285F4;\r\n            }\r\n            25% {\r\n                stroke: #DE3E35;\r\n            }\r\n            50% {\r\n                stroke: #F7C223;\r\n            }\r\n            75% {\r\n                stroke: #1B9A59;\r\n            }\r\n            100% {\r\n                stroke: #4285F4;\r\n            }\r\n        }\r\n\r\n        @-webkit-keyframes colors {\r\n            0% {\r\n                stroke: #4285F4;\r\n            }\r\n            25% {\r\n                stroke: #DE3E35;\r\n            }\r\n            50% {\r\n                stroke: #F7C223;\r\n            }\r\n            75% {\r\n                stroke: #1B9A59;\r\n            }\r\n            100% {\r\n                stroke: #4285F4;\r\n            }\r\n        }\r\n\r\n        @keyframes colors {\r\n            0% {\r\n                stroke: #4285F4;\r\n            }\r\n            25% {\r\n                stroke: #DE3E35;\r\n            }\r\n            50% {\r\n                stroke: #F7C223;\r\n            }\r\n            75% {\r\n                stroke: #1B9A59;\r\n            }\r\n            100% {\r\n                stroke: #4285F4;\r\n            }\r\n        }\r\n        .qp-circular-loader-path {\r\n            -webkit-animation-name: fillunfill, rot, colors;\r\n            -webkit-animation-duration: 1333ms, 5332ms, 5332ms; /* ARCTIME, 4*ARCTIME, 4*ARCTIME */\r\n            -webkit-animation-iteration-count: infinite, infinite, infinite;\r\n            -webkit-animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1), steps(4), linear;\r\n            -webkit-animation-play-state: running, running, running;\r\n            -webkit-animation-fill-mode: forwards;\r\n\r\n            -moz-animation-name: fillunfill, rot, colors;\r\n            -moz-animation-duration: 1333ms, 5332ms, 5332ms; /* ARCTIME, 4*ARCTIME, 4*ARCTIME */\r\n            -moz-animation-iteration-count: infinite, infinite, infinite;\r\n            -moz-animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1), steps(4), linear;\r\n            -moz-animation-play-state: running, running, running;\r\n            -moz-animation-fill-mode: forwards;\r\n        }\r\n\r\n    </style>\r\n\r\n    <!-- 3= STROKEWIDTH -->\r\n    <!-- 14= RADIUS + STROKEWIDTH/2 -->\r\n    <!-- 12.5= RADIUS -->\r\n    <!-- 1.5=  STROKEWIDTH/2 -->\r\n    <!-- ARCSIZE would affect the 1.5,14 part of this... 1.5,14 is specific to\r\n         270 degress -->\r\n    <g class=\"qp-circular-loader\">\r\n        <path class=\"qp-circular-loader-path\" fill=\"none\" d=\"M 14,1.5 A 12.5,12.5 0 1 1 1.5,14\" stroke-width=\"3\" stroke-linecap=\"round\"/>\r\n    </g>\r\n</svg>");
$templateCache.put("noAvailableHours.html", "<span class=\"angular-reservation-noAvailableHours\">{{\"noAvailableHours\" | translate}}</span>");
}]);