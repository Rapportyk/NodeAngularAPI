(function () {
    'use strict';

    angular
        .module('app')
        .factory('RoleService', RoleService);

    RoleService.$inject = ['$http', 'config'];
    function RoleService($http, config) {
        var service = {};

        service.GetAll = GetAll;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;

        return service;

        function GetAll() {
            return $http.get(config.apiUrl + config.endPoint.admin.role).then(handleSuccess, handleError);
        }

        function Create(data) {
            return $http.post(config.apiUrl + config.endPoint.admin.role, data).then(handleSuccess, handleError);
        }

        function Update(data, id) {
            return $http.put(config.apiUrl + config.endPoint.admin.role + '/' + id, data).then(handleSuccess, handleError);
        }

        function Delete(id) {
            return $http.delete(config.apiUrl + config.endPoint.admin.role + '/' + id).then(handleSuccess, handleError);
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
