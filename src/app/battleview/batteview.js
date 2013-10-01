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
    var ctrl = this;
    this.Combatant = function Combatant(name, initiative) {
      var self = this;
      self.name = name;
      self.initiative = initiative;
      self.takenTurn = false;
    };

    function refreshCombatantList() {
      $scope.combatants.sort(function(a, b) {
        if (!a.takenTurn && b.takenTurn) {
          return -1;
        } else if (a.takenTurn && !b.takenTurn) {
          return 1;
        } else {
          return b.initiative - a.initiative;
        }
      });

      calculateActions();
    }
    ctrl.refreshCombatantList = refreshCombatantList;

    function calculateActions() {
      $scope.combatants.forEach(function(combatant, index) {
        var actions = [];
        if (index === 0 && !combatant.takenTurn) {
          actions.push({
            label: 'Finish Turn',
            apply: function() {
              combatant.takenTurn = true;
              refreshCombatantList();
            }
          });
        }
        combatant.actions = actions;
      });
    }

    $scope.combatants = [];
    $scope.newCombatant = {};
    refreshCombatantList();

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
      $scope.combatants.push(new ctrl.Combatant($scope.newCombatant.name, $scope.newCombatant.initiative));
      $scope.newCombatant = {};
      refreshCombatantList();
    };
  });

}(angular));