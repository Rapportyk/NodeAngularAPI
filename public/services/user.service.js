(function () {
    'use strict';

    angular
        .module('app')
        .factory('UserService', UserService);

    UserService.$inject = ['$http', 'config'];
    function UserService($http, config) {
        var service = {};

        service.GetAll = GetAll;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.ResetPassword = ResetPassword;
        service.GetAttenders = GetAttenders;

        return service;

        function GetAll() {
            return $http.get(config.apiUrl + config.endPoint.admin.user).then(handleSuccess, handleError);
        }

        function Create(data) {
            return $http.post(config.apiUrl + config.endPoint.admin.user, data).then(handleSuccess, handleError);
        }

        function Update(data, id) {
            return $http.put(config.apiUrl + config.endPoint.admin.user + '/' + id, data).then(handleSuccess, handleError);
        }

        function Delete(id) {
            return $http.delete(config.apiUrl + config.endPoint.admin.user + '/' + id).then(handleSuccess, handleError);
        }

        function ResetPassword(data) {
            return $http.post(config.apiUrl + config.endPoint.admin.resetPassword, data).then(handleSuccess, handleError);
        }

        function GetAttenders(data) {
            return $http.post(config.apiUrl + config.endPoint.admin.attenders, data).then(handleSuccess, handleError);
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
