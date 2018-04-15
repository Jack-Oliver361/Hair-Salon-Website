var app = angular.module('HairSalonWeb', ['ngRoute', 'LocalStorageModule', 'angular-loading-bar', "hm.booking", "ui.bootstrap", "pascalprecht.translate", "ngMessages"]);

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
});




app.config(function ($routeProvider) {

    $routeProvider.when("/home", {
        controller: "homeController",
        templateUrl: "/app/views/home.html"
    });

    $routeProvider.when("/login", {
        controller: "loginController",
        templateUrl: "/app/views/login.html"
    });

    $routeProvider.when("/signup", {
        controller: "signupController",
        templateUrl: "/app/views/signup.html"
    });
    $routeProvider.when("/account", {
        controller: "accountController",
        templateUrl: "/app/views/account.html"
    });

    $routeProvider.when("/reservation", {
        templateUrl: "/app/views/reservation.html"
    });

    $routeProvider.otherwise({ redirectTo: "/home" });

});

app.run(['authService', function (authService) {
    authService.fillAuthData();
}]);