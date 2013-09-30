(function(angular, undefined) {

  angular.module('ngBattleTracker.battleView', [
    'ui.router',
    'ui.route'
  ])

  .config(function homeConfig($stateProvider) {
    $stateProvider.state('battleView', {
      url: '/battleView',
      views: {
        "main": {
          controller: 'BattleViewCtrl',
          templateUrl: 'battleview/battleview.tpl.html'
        }
      },
      data: {
        pageTitle: 'Battle'
      }
    });
  })

  .controller('BattleViewCtrl', function BattleViewCtrl($scope) {
    $scope.combatants = [];
    $scope.newCombatant = {};

    function isValidCombatant(combatant) {
      return combatant && combatant.name && combatant.initiative !== undefined;
    }

    function determineInsertLocation(combatants, combatant) {
      var len = combatants.length,
        i;

      for (i = 0; i < len; i++) {
        if (combatants[i].initiative < combatant.initiative) {
          return i;
        }
      }

      return len;
    }
    $scope.addCombatant = function() {
      if (!isValidCombatant($scope.newCombatant)) {
        return;
      }
      $scope.combatants.splice(determineInsertLocation($scope.combatants, $scope.newCombatant), 0, $scope.newCombatant);
      $scope.newCombatant = {};
    };
  });

}(angular));