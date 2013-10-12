(function(angular, undefined) {

  angular.module('ngBattleTracker', [
    'templates-app',
    'templates-common',
    'ui.router',
    'ui.route',
    'ui.bootstrap',
    'ngBattleTracker.home',
    'ngBattleTracker.campaignView',
    'ngBattleTracker.battleView'
  ])

  .config(function myAppConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');
  })

  .run(function run() {})

  .controller('AppCtrl', function AppCtrl($scope, $location) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      if (angular.isDefined(toState.data.pageTitle)) {
        $scope.pageTitle = toState.data.pageTitle + ' | Battle Tracker';
      }
    });
  });

}(angular));