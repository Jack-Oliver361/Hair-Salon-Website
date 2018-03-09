'use strict';
app.factory('authService', ['$http', '$q', 'localStorageService', function ($http, $q, localStorageService) {

    var serviceBase = 'http://localhost:62975/';
    var authServiceFactory = {};

    var _authentication = {
        isAuth: false,
        userName: ""
    };

    var _saveRegistration = function (registration) {

        _logOut();

        return $http.post(serviceBase + 'api/customers/register', registration).then(function (response) {
            return response;
        });

    };

    var _login = function (loginData) {
        
        //var data = 'grant_type=password&username=' + loginData.userName + '&password=' + loginData.password;

        var deferred = $q.defer();

        var req = {
            method: 'POST',
            url: serviceBase + 'token/login',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: 'grant_type=password&username=' + loginData.userName + '&password=' + loginData.password

            
        }

        $http(req).then(function onSuccess(response) {


            console.log(response.data);
            localStorageService.set('authorizationData', { token: response.data.access_token, username: loginData.userName });

            _authentication.isAuth = true;
            _authentication.userName = loginData.userName;

            deferred.resolve(response);

        }).catch(function onError(err, status) {
                _logOut();
                deferred.reject(err);
            });

        return deferred.promise;

    };

    var _logOut = function () {

        localStorageService.remove('authorizationData');

        _authentication.isAuth = false;
        _authentication.userName = "";

    };

    var _fillAuthData = function () {

        var authData = localStorageService.get('authorizationData');
        if (authData) {
            _authentication.isAuth = true;
            _authentication.userName = authData.userName;
        }

    };

    authServiceFactory.saveRegistration = _saveRegistration;
    authServiceFactory.login = _login;
    authServiceFactory.logOut = _logOut;
    authServiceFactory.fillAuthData = _fillAuthData;
    authServiceFactory.authentication = _authentication;

    return authServiceFactory;
}]);