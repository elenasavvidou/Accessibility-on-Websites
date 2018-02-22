var myApp = angular.module('myApp', []);

myApp.controller('cityList', function($scope) {
    $scope.message='this is an agular thing'
});

var myApp = angular.module('myApp', []);

myApp.controller('cityList', function($scope) {
    $scope.message='this is an agular thing'
    $scope.cities = [
        {
            name: 'Berlin',
            country: 'Germany'
        },
        {
            name: 'Hamburg',
            country: 'Germany'
        }
    ];

$scope.logCities = function (){
    
}
});
