(function () {
    'use strict';

    angular
        .module('app')
        .factory('SocketService', SocketService);

    SocketService.$inject = ['socketFactory'];
    function SocketService(socketFactory) {
        return socketFactory();
    }
})();
