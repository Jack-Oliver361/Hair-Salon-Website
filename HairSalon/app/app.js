var app = angular.module('HairSalonWeb', ['ngRoute', 'LocalStorageModule', 'angular-loading-bar', "booking", "ui.bootstrap", "ngMessages"]);

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
});




app.config(function ( $routeProvider) {

    $routeProvider.when("/home", {
        controller: "homeController",
        templateUrl: "/app/views/home.html"
    });

    $routeProvider.when("/privacyPolicy", {
        controller: "",
        templateUrl: "/app/views/privacyPolicy.html"
    });

    $routeProvider.when("/termsAndCond", {
        controller: "",
        templateUrl: "/app/views/termsAndCon.html"
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
        templateUrl: "/app/views/reservation.html",
        
    });

    $routeProvider.otherwise({ redirectTo: "/home" });

});

app.run(['authService','$rootScope', '$location', function (authService, $rootScope, $location) {
    authService.fillAuthData();

    $rootScope.$on('$routeChangeStart', function (event) {
        if ($location.path() == "/reservation") {
            var authentication = authService.authentication;
            if (!authentication.isAuth) {
                console.log('DENY');
                event.preventDefault();
                $location.path('/login');
            }
            else {
                console.log('ALLOW');
                $location.path('/reservation');
            }
        }
        });

}]);
