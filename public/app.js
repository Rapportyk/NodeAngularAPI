(function () {
    'use strict';

    angular
        .module('app', ['ngRoute', 'ui-notification', 'datatables', 'app.config', 'ui.bootstrap', 'ngStorage', 'UserAuthentication', 'oitozero.ngSweetAlert', 'angularMoment', 'btford.socket-io', 'ui.select', 'ui.mask', 'isteven-multi-select', 'daterangepicker', 'datatables.buttons'])
        .config(config)
        .run(run);

    config.$inject = ['$routeProvider', '$locationProvider'];
    function config($routeProvider, $locationProvider) {

        $routeProvider

            .when('/login', {
                controller: 'LoginController',
                templateUrl: 'login/login.view.html',
                controllerAs: 'vm'
            })

            .when('/changePassword', {
                controller: 'ChangePasswordController',
                templateUrl: 'password/changepassword.view.html',
                controllerAs: 'vm'
            })

            .when('/admin', {
                controller: 'AdminController',
                templateUrl: 'admin/admin.view.html',
                controllerAs: 'vm'
            })

            .otherwise({ redirectTo: '/admin' });
    }

    run.$inject = ['Authentication', 'NotificationService', '$localStorage', '$rootScope', '$location'];
    function run(Authentication, NotificationService, $localStorage, $rootScope, $location) {

        Authentication.init();
        NotificationService.init();

        $rootScope.$on('$routeChangeStart', function (event, next) {

            var role = "";
            if($rootScope.globals)
                role = $rootScope.globals.role;
            else
                role = $localStorage.globals.role;

        });
    }

})();