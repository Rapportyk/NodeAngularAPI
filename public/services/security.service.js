(function () {
    'use strict';

    angular
        .module('app')
        .factory('SecurityService', SecurityService);

    SecurityService.$inject = ['$http', 'config'];
    function SecurityService($http, config) {

        var service = {};

        service.authenticate = authenticate;

        return service;

        function authenticate(privateKey, request) {

            var key = privateKey;

            if(config.isLive)
                return $http.post(config.apiUrl + config.endPoint.dashboard, data).then(handleSuccess, handleError);
            else
                return $http.post(config.jsonUrl + config.endPoint.dashboard + '.json', data).then(handleSuccess, handleError);
        }

        // private functions
        function handleSuccess(res) {
            return res;
        }

        function handleError(res) {
            return res;
        }
    }
})();
