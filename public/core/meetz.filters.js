(function () {
    'use strict';

    angular
        .module('app')
        .filter('removeSpace', removeSpace)
        .filter('parseInt', parseInt)
        .filter('capitalize', capitalize)
        .filter("unsafe", unsafe);

    function removeSpace() {
        return function (string) {
            if (!angular.isString(string)) {
                return string;
            }
            return string.replace(/[\s]/g, '');
        };
    }

    function parseInt() {
        return function(input) {
            return parseInt(input, 10);
        };
    }

    function capitalize() {
        return function(input){
            if(input.indexOf(' ') !== -1){
                var inputPieces,
                        i;

                input = input.toLowerCase();
                inputPieces = input.split(' ');

                for(i = 0; i < inputPieces.length; i++){
                    inputPieces[i] = capitalizeString(inputPieces[i]);
                }

                return inputPieces.toString().replace(/,/g, ' ');
            }
            else {
                input = input.toLowerCase();
                return capitalizeString(input);
            }

            function capitalizeString(inputString){
                return inputString.substring(0,1).toUpperCase() + inputString.substring(1);
            }
        };
    }

    function unsafe($sce) {
        return $sce.trustAsHtml;
    }

})();