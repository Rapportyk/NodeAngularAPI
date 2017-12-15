(function () {
    'use strict';

    angular
        .module('app')
        .controller('MainController', MainController);

    MainController.$inject = ['$location', '$scope', '$rootScope', '$localStorage', 'Authentication'];
    function MainController($location, $scope, $rootScope, $localStorage, Authentication) {

        NProgress.configure({
            minimum: 0.2,
            trickleRate: 0.1,
            trickleSpeed: 200
        });

        $scope.$on('$routeChangeStart', function() {

            // NProgress Start
            $('body').addClass('cui-page-loading-state');
            NProgress.start();

        });

        $scope.$on('$routeChangeSuccess', function() {

            // Set to default (show) state left and top menu, remove single page classes
            $('body').removeClass('single-page single-page-inverse');
            $rootScope.hideLeftMenu = false;
            $rootScope.hideTopMenu = false;
            $rootScope.showFooter = true;

            // Firefox issue: scroll top when page load
            $('html, body').scrollTop(0);

            // Set active state menu after success change route
            $('.left-menu-list-active').removeClass('left-menu-list-active');
            $('nav.left-menu .left-menu-list-root .left-menu-link').each(function(){
                if ($(this).attr('href') == '#' + $location.path()) {
                    $(this).closest('.left-menu-list-root > li').addClass('left-menu-list-active');
                }
            });

            // NProgress End
            setTimeout(function(){
                NProgress.done();
            }, 1000);
            $('body').removeClass('cui-page-loading-state');
        });

        $scope.logout = function() {
            Authentication.logout();
        };
    }

})();
