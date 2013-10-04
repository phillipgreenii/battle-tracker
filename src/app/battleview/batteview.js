(function(angular, undefined) {

  var actionDescriptors = [{
    label: 'Finish Turn',
    isApplicable: function(combatant) {
      return combatant.turnStatus === Combatant.TURN_STATUS.active ||
        combatant.turnStatus === Combatant.TURN_STATUS.delaying;
    },
    generateActionFor: function(combatant) {
      return function() {
        combatant.turnStatus = Combatant.TURN_STATUS.complete;
      };
    }
  }, {
    label: 'Delay Turn',
    isApplicable: function(combatant) {
      return combatant.turnStatus === Combatant.TURN_STATUS.active;
    },
    generateActionFor: function(combatant, position, combatants) {
      return function() {
        combatant.turnStatus = Combatant.TURN_STATUS.delaying;
      };
    }
  }, {
    label: 'Remove Combatant',
    isApplicable: function() {
      return true;
    },
    generateActionFor: function(combatant, position, combatants) {
      return function() {
        combatants.splice(position, 1);
      };
    }
  }];

  function Combatant(name, initiative, turnStatus) {
    var self = this;
    self.name = name;
    self.initiative = initiative;
    self.turnStatus = turnStatus || Combatant.TURN_STATUS.waiting;
  }

  Combatant.TURN_STATUS = {
    active: {
      label: 'active',
      ordinal: 4
    },
    delaying: {
      label: 'delaying',
      ordinal: 2
    },
    waiting: {
      label: 'waiting',
      ordinal: 1
    },
    complete: {
      label: 'complete',
      ordinal: 0
    }
  };

  Combatant.prototype.toString = function() {
    return "[Combatant " + this.name + ':' + this.turnStatus.label + "]";
  };

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

  .filter('orderByTurn', function() {
    return function(combatants) {
      return combatants.slice().sort(function(a, b) {
        if (a.turnStatus === b.turnStatus) {
          return b.initiative - a.initiative;
        } else {
          return b.turnStatus.ordinal - a.turnStatus.ordinal;
        }
      });
    };
  })

  .controller('BattleViewCtrl', function BattleViewCtrl($scope) {
    var ctrl = this;
    this.Combatant = Combatant;

    function filterCombatantsOfTurnStatus(turnStatus) {
      return $scope.combatants.filter(function(combatant) {
        return combatant.turnStatus === turnStatus;
      });
    }

    function sortCombatantList() {
      $scope.combatants.sort(function(a, b) {
        if (a.turnStatus === b.turnStatus) {
          return b.initiative - a.initiative;
        } else {
          return b.turnStatus.ordinal - a.turnStatus.ordinal;
        }
      });
    }

    function refreshCombatantList() {
      //clear active status
      filterCombatantsOfTurnStatus(Combatant.TURN_STATUS.active).forEach(function(combatant) {
        combatant.turnStatus = Combatant.TURN_STATUS.waiting;
      });
      //set active status
      (filterCombatantsOfTurnStatus(Combatant.TURN_STATUS.waiting)[0] || {}).turnStatus = Combatant.TURN_STATUS.active;
      calculateActions();
    }
    ctrl.refreshCombatantList = refreshCombatantList;

    function calculateActions() {
      $scope.combatants.forEach(function(combatant, index) {
        var actions = [];

        function buildAction(actionDescriptor, combatant) {
          var actionFn = actionDescriptor.generateActionFor(combatant, index, $scope.combatants);
          return {
            label: actionDescriptor.label,
            apply: function() {
              actionFn();
              refreshCombatantList();
            }
          };
        }

        actionDescriptors.forEach(function(actionDescriptor) {
          if (actionDescriptor.isApplicable(combatant, index, $scope.combatants)) {
            actions.push(buildAction(actionDescriptor, combatant));
          }
        });
        combatant.actions = actions;
      });
    }

    $scope.combatants = [];
    $scope.newCombatant = {};
    refreshCombatantList();

    function isValidCombatant(combatant) {
      return combatant && combatant.name && combatant.initiative !== undefined;
    }

    function determineInsertPosition(combatants, combatant) {
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
      var combatant = new ctrl.Combatant($scope.newCombatant.name, $scope.newCombatant.initiative),
        insertPosition = determineInsertPosition($scope.combatants, combatant);
      $scope.combatants.splice(insertPosition, 0, combatant);
      $scope.newCombatant = {};
      refreshCombatantList();
    };
  });

}(angular));