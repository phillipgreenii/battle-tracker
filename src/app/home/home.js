(function(angular, undefined) {

  angular.module('ngBattleTracker.home', [
    'ui.router',
    'ui.route'
  ])

  .config(function homeConfig($stateProvider) {
    $stateProvider.state('home', {
      url: '/home',
      views: {
        "main": {
          controller: 'HomeCtrl',
          templateUrl: 'home/home.tpl.html'
        }
      },
      data: {
        pageTitle: 'Home'
      }
    });
  })

  .controller('HomeCtrl', function HomeCtrl($scope) {

  });

}(angular));