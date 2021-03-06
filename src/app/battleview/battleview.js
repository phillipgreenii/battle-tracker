(function(angular, undefined) {

  function defineActionDescriptors(Combatant) {
    return [{
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
  }



  angular.module('ngBattleTracker.battleView', [
    'ui.router',
    'ui.route',
    'ui.bootstrap.modal',
    'ui.bootstrap.tabs',
    'ngBattleTracker.campaign',
    'ngBattleTracker.battleView.model'
  ])

  .config(function battleViewConfig($stateProvider) {
    $stateProvider.state('battleView', {
      url: '/battleView/:campaignId?surprise',
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

  .controller('BattleViewCtrl', function BattleViewCtrl($scope, $modal, $stateParams, campaignService, BattleViewModel) {
    var ctrl = this,
      campaignId = $stateParams.campaignId,
      surpriseMode = !! $stateParams.surprise,
      campaign;

    function loadCampaign() {
      campaign = campaignService.lookupCampaignById(campaignId);
    }

    function init() {
      loadCampaign();
      campaign.combatants.forEach(function(combatantName) {
        $scope.combatants.push(
          new BattleViewModel.Combatant(combatantName, undefined, true));
      });
      resetBattle();
    }

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
      filterCombatantsOfTurnStatus(BattleViewModel.Combatant.TURN_STATUS.active).forEach(function(combatant) {
        combatant.turnStatus = BattleViewModel.Combatant.TURN_STATUS.waiting;
      });
      //set active status
      (filterCombatantsOfTurnStatus(BattleViewModel.Combatant.TURN_STATUS.waiting)[0] || {}).turnStatus = BattleViewModel.Combatant.TURN_STATUS.active;
      calculateActions();
    }
    ctrl.refreshCombatantList = refreshCombatantList;

    var actionDescriptors = defineActionDescriptors(BattleViewModel.Combatant);

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

    function extractAndCopyPartyMembers(combatants) {
      return combatants.filter(function(combatant) {
        return combatant.partyMember;
      }).map(function(partyMemberCabatant) {
        return new BattleViewModel.Combatant(partyMemberCabatant.name, undefined, true);
      }).sort(function(a, b) {
        return a.name.localeCompare(b.name);
      });
    }

    function resetBattle() {
      var partyMemberCopy = extractAndCopyPartyMembers($scope.combatants);
      if (partyMemberCopy.length > 0) {
        var modalInstance = $modal.open({
          templateUrl: 'battleview/resetmodal.tpl.html',
          controller: 'ResetModalInstanceCtrl',
          resolve: {
            combatants: function() {
              return partyMemberCopy;
            }
          }
        });

        modalInstance.result.then(function(combatants) {
          $scope.combatants = combatants.sort(function(a, b) {
            return b.initiative - a.initiative;
          });
          if (surpriseMode) {
            $scope.combatants.forEach(function(combatant) {
              combatant.turnStatus = BattleViewModel.Combatant.TURN_STATUS.complete;
            });
          }
          refreshCombatantList();
        });
      } else {
        $scope.combatants = [];
        refreshCombatantList();
      }
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

    function addCombatant(combatant) {
      var insertPosition = determineInsertPosition($scope.combatants, combatant);
      $scope.combatants.splice(insertPosition, 0, combatant);
      refreshCombatantList();
    }

    $scope.resetBattle = resetBattle;
    $scope.addCombatant = addCombatant;
    $scope.refreshCombatantList = refreshCombatantList;
    $scope.combatants = [];
    refreshCombatantList();
    init();
  })

  .controller('BattleRoundCtrl', function($scope, $stateParams, $location, BattleViewModel) {
    var campaignId = $stateParams.campaignId;

    function isRoundComplete() {
      var hasCombatants = $scope.combatants.length > 0,
        allComplete = $scope.combatants.every(function(combatant) {
          return combatant.turnStatus === BattleViewModel.Combatant.TURN_STATUS.complete;
        });
      return hasCombatants && allComplete;
    }

    function startNextRound() {
      if ($scope.isRoundComplete()) {
        $scope.combatants.forEach(function(combatant) {
          combatant.turnStatus = BattleViewModel.Combatant.TURN_STATUS.waiting;
        });
        $scope.$parent.refreshCombatantList();
      }
    }

    function endBattle() {
      $location.path("/campaignView/" + campaignId);
    }


    $scope.isRoundComplete = isRoundComplete;
    $scope.startNextRound = startNextRound;

    $scope.endBattle = endBattle;
  })

  .controller('AddNewCombatantCtrl', function($scope, BattleViewModel) {

    function generateNewCombatant() {
      return {
        name: undefined,
        initiative: undefined,
        partyMember: false
      };
    }

    function isValidCombatant(combatant) {
      return combatant && combatant.name && combatant.initiative !== undefined;
    }

    function addCombatant() {
      if (!isValidCombatant($scope.newCombatant)) {
        return;
      }
      var combatant = new BattleViewModel.Combatant($scope.newCombatant.name, $scope.newCombatant.initiative, $scope.newCombatant.partyMember);
      $scope.newCombatant = generateNewCombatant();
      $scope.$parent.addCombatant(combatant);
    }

    $scope.newCombatant = generateNewCombatant();
    $scope.addCombatant = addCombatant;
  })

  .controller('AddMultipleNonPartyCombatantsCtrl', function($scope, BattleViewModel) {

    function generateNewNonPartyCombatants() {
      return {
        nameBase: undefined,
        count: undefined,
        combatants: []
      };
    }

    function isValidCombatant(combatant) {
      return combatant && combatant.name && combatant.initiative !== undefined;
    }

    function refreshNewMultipleNonPartyCombatants() {
      var nameBase = $scope.newMultipleNonPartyCombatants.nameBase,
        count = $scope.newMultipleNonPartyCombatants.count,
        newCombatants = $scope.newMultipleNonPartyCombatants.combatants,
        i;

      if (count > 0) {
        newCombatants = newCombatants.slice(0, count);
        for (i = 0; i < count; i++) {
          newCombatants[i] = newCombatants[i] || {};
          newCombatants[i].name = nameBase + " #" + i;
        }
      }
      $scope.newMultipleNonPartyCombatants.combatants = newCombatants;
    }

    function addMultipleNonPartyCombatants() {
      if (!$scope.newMultipleNonPartyCombatants.combatants.every(isValidCombatant)) {
        return;
      }

      $scope.newMultipleNonPartyCombatants.combatants.forEach(function(c) {
        var combatant = new BattleViewModel.Combatant(c.name, c.initiative, false);
        $scope.$parent.addCombatant(combatant);
      });

      $scope.newMultipleNonPartyCombatants = generateNewNonPartyCombatants();
    }

    $scope.newMultipleNonPartyCombatants = generateNewNonPartyCombatants();
    $scope.refreshNewMultipleNonPartyCombatants = refreshNewMultipleNonPartyCombatants;
    $scope.addMultipleNonPartyCombatants = addMultipleNonPartyCombatants;
  })

  .controller('ResetModalInstanceCtrl', function($scope, $modalInstance, combatants) {
    function ok() {
      $modalInstance.close($scope.combatants);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    $scope.ok = ok;
    $scope.cancel = cancel;
    $scope.combatants = combatants;
  });
}(angular));