(function () {
    'use strict';

    angular
            .module('app')
            .factory('Scroll', Scroll);

    Scroll.$inject = ['$rootScope'];
    function Scroll($rootScope) {
        var scrollIt = {};

        scrollIt.start = start;
        return scrollIt;

        function start() {
            if ($(".dataTables_scrollBody").length && ($(".dataTables_scrollBody").scrollTop() + $(".dataTables_scrollBody").innerHeight()) >= $(".dataTables_scrollBody")[0].scrollHeight) {
                $('.dataTables_scrollBody').animate({ scrollTop: 0 }, 1000).delay(900);
                //$rootScope.$broadcast('refreshVisitorData');
            }
            else
                $('.dataTables_scrollBody').animate({ scrollTop: $(".dataTables_scrollBody").scrollTop() + $(".dataTables_scrollBody").innerHeight() + 1 }, '10000', function () {

                });
        }
    }

})();