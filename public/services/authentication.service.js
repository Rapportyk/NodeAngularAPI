(function () {
    'use strict';


    var config = angular.module('UserAuthentication', ['app']).factory('authConfig', function (config) {
        var config = {
            "authURL": config.apiUrl + "/users/v1/login",
            "landingURL": "/admin",
            "loginURL": "/login"
        };
        return config;
    });

    angular
            .module('UserAuthentication')
            .factory('Authentication', Authentication);

    Authentication.$inject = ['$rootScope', '$location', '$localStorage', '$http', '$window', 'authConfig', 'AuthenticationService', 'SocketService'];
    function Authentication($rootScope, $location, $localStorage, $http, $window, authConfig, AuthenticationService, SocketService) {
        var service = {};

        service.init = init;
        service.login = login;
        service.logout = logout;
        service.clearCredentials = clearCredentials;

        return service;

        function init() {

            $rootScope.$on('$locationChangeStart', function (event, next, current) {
                // keep user logged in after page refresh
                $rootScope.globals = $localStorage.globals || {};

                // redirect to login page if not logged in and trying to access a restricted page
                var loggedIn = $rootScope.globals.userId;
                if (!loggedIn) {
                    $location.path(authConfig.loginURL);
                }
            });
        }

        function login(email, password, callback) {
            AuthenticationService.login(email, password, function (response) {
                if (response.status == 200) {
                    SocketService.emit('setUserId', response.data.userId);
                    AuthenticationService.SetCredentials(email, password, response);
                    $location.path(authConfig.landingURL);
                }
                else {
                    return callback(response);
                }
            });
        }

        function logout() {
            AuthenticationService.ClearCredentials();
            $rootScope.showSideBars = false;
            $location.path(authConfig.loginURL);
        }

        function clearCredentials(){
            AuthenticationService.ClearCredentials();
        }
    }

    angular
            .module('UserAuthentication')
            .factory('AuthenticationService', AuthenticationService);

    AuthenticationService.$inject = ['$http', '$localStorage', '$rootScope', 'authConfig'];
    function AuthenticationService($http, $localStorage, $rootScope, authConfig) {
        var service = {};

        service.login = login;
        service.SetCredentials = SetCredentials;
        service.ClearCredentials = ClearCredentials;

        return service;

        // Service to authenticate user
        function login(email, password, callback) {

            $http({
                method: 'POST',
                url: authConfig.authURL,
                data: { email: email, password: password }
            }).then(function successCallback(response) {
                // this callback will be called asynchronously
                callback(response);
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                callback(response);
            });
        }

        function SetCredentials(email, password, response) {
            $rootScope.globals = {
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                email: email,
                password: password,
                secretKey: response.data.secretKey,
                userId: response.data.userId,
                publicKey: response.data.publicKey,
                role: response.data.role
            };

            $localStorage.globals = $rootScope.globals;
        }

        function ClearCredentials() {
            $rootScope.globals = {};
            $localStorage.$reset();
            $http.defaults.headers.common.Authorization = 'Basic';
        }
    }

})();