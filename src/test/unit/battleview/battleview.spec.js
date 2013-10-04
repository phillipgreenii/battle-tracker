(function() {
  "use strict";

  describe('battletracker', function() {

    describe('battleView', function() {
      var ctrl, scope;

      beforeEach(module('ngBattleTracker.battleView'));

      beforeEach(inject(function($controller, $rootScope) {
        scope = $rootScope.$new();
        ctrl = $controller('BattleViewCtrl', {
          $scope: scope
        });
      }));

      it('should not have any combatants on start', function() {
        expect(scope.combatants.length).toBe(0);
      });

      describe('orderByTurn filter', function() {
        var filter,
          activeCombatant10,
          delayingCombatant20,
          delayingCombatant15,
          waitingCombatant20,
          waitingCombatant15,
          completeCombatant20,
          completeCombatant15;

        beforeEach(inject(function(orderByTurnFilter) {
          filter = orderByTurnFilter;
        }));

        beforeEach(function(orderByTurnFilter) {
          activeCombatant10 = new ctrl.Combatant('activeCombatant10', 10, ctrl.Combatant.TURN_STATUS.active);
          delayingCombatant20 = new ctrl.Combatant('delayingCombatant20', 20, ctrl.Combatant.TURN_STATUS.delaying);
          delayingCombatant15 = new ctrl.Combatant('delayingCombatant15', 15, ctrl.Combatant.TURN_STATUS.delaying);
          waitingCombatant20 = new ctrl.Combatant('waitingCombatant20', 5, ctrl.Combatant.TURN_STATUS.waiting);
          waitingCombatant15 = new ctrl.Combatant('waitingCombatant15', 3, ctrl.Combatant.TURN_STATUS.waiting);
          completeCombatant20 = new ctrl.Combatant('completeCombatant20', 25, ctrl.Combatant.TURN_STATUS.complete);
          completeCombatant15 = new ctrl.Combatant('completeCombatant15', 23, ctrl.Combatant.TURN_STATUS.complete);
        });

        it('should sort active combatants to top', function() {
          var combatants = [completeCombatant20, waitingCombatant15, activeCombatant10, delayingCombatant15],
            filteredCombatants = filter(combatants);
          expect(filteredCombatants[0]).toEqual(activeCombatant10);
        });

        it('should sort delaying combatants by initiative', function() {
          var combatants = [delayingCombatant15, delayingCombatant20],
            filteredCombatants = filter(combatants);
          expect(filteredCombatants[0]).toEqual(delayingCombatant20);
          expect(filteredCombatants[1]).toEqual(delayingCombatant15);
        });

        it('should sort waiting combatants by initiative', function() {
          var combatants = [waitingCombatant15, waitingCombatant20],
            filteredCombatants = filter(combatants);
          expect(filteredCombatants[0]).toEqual(waitingCombatant20);
          expect(filteredCombatants[1]).toEqual(waitingCombatant15);
        });

        it('should sort complete combatants by initiative', function() {
          var combatants = [completeCombatant15, completeCombatant20],
            filteredCombatants = filter(combatants);
          expect(filteredCombatants[0]).toEqual(completeCombatant20);
          expect(filteredCombatants[1]).toEqual(completeCombatant15);
        });

        it('should sort delaying before waiting', function() {
          var combatants = [waitingCombatant20, delayingCombatant15],
            filteredCombatants = filter(combatants);
          expect(filteredCombatants[0]).toEqual(delayingCombatant15);
          expect(filteredCombatants[1]).toEqual(waitingCombatant20);
        });

        it('should sort waiting before complete', function() {
          var combatants = [completeCombatant20, waitingCombatant15],
            filteredCombatants = filter(combatants);
          expect(filteredCombatants[0]).toEqual(waitingCombatant15);
          expect(filteredCombatants[1]).toEqual(completeCombatant20);
        });

      });

      describe('Combatant', function() {
        it('should have name, initative, and no actions', function() {
          var combatant = new ctrl.Combatant('Ted', 3);

          expect(combatant.name).toEqual('Ted');
          expect(combatant.initiative).toEqual(3);
          expect(combatant.turnStatus).toEqual(ctrl.Combatant.TURN_STATUS.waiting);
        });
      });

      describe('when adding combatants', function() {

        it('should not add combatant without name', function() {
          scope.newCombatant.name = undefined;
          scope.newCombatant.initiative = 2;
          scope.addCombatant();
          scope.$digest();
          expect(scope.combatants.length).toBe(0);
        });

        it('should not add combatant without initiative', function() {
          scope.newCombatant.name = 'Nancy';
          scope.newCombatant.initiative = undefined;
          scope.addCombatant();
          scope.$digest();
          expect(scope.combatants.length).toBe(0);
        });

        it('should add combatant and reset newCombatant', function() {
          scope.newCombatant.name = 'Nancy';
          scope.newCombatant.initiative = 2;
          scope.addCombatant();
          scope.$digest();
          expect(scope.combatants.length).toBe(1);
          expect(scope.combatants[0].name).toEqual('Nancy');
          expect(scope.combatants[0].initiative).toBe(2);
          expect(scope.newCombatant.name).toBeUndefined();
          expect(scope.newCombatant.initiative).toBeUndefined();
        });

        describe('when combatants already exist', function() {

          beforeEach(function($controller, $rootScope) {
            scope.combatants.push(new ctrl.Combatant('Ed', 10));
            scope.combatants.push(new ctrl.Combatant('Jim', 5));
            scope.combatants.push(new ctrl.Combatant('Kal', 1));
            ctrl.refreshCombatantList();
            scope.$digest();
          });

          it('should add combatant after any combatants with higher initiative, but before any combatants with lower initiative', function() {
            scope.newCombatant.name = 'Nancy';
            scope.newCombatant.initiative = 7;
            scope.addCombatant();
            scope.$digest();
            expect(scope.combatants.length).toBe(4);
            expect(scope.combatants[1].name).toEqual('Nancy');
            expect(scope.combatants[1].initiative).toBe(7);
          });

          it('should add combatant just after any combatants with the same initiative', function() {
            scope.newCombatant.name = 'Nancy';
            scope.newCombatant.initiative = 5;
            scope.addCombatant();
            scope.$digest();
            expect(scope.combatants.length).toBe(4);
            expect(scope.combatants[2].name).toEqual('Nancy');
            expect(scope.combatants[2].initiative).toBe(5);
          });

        });
      });

      describe('Combatant Actions', function() {

        function lookupAction(actions, label) {
          var i, len = actions.length;
          for (i = 0; i < len; i++) {
            if (actions[i].label === label) {
              return i;
            }

          }
          return -1;
        }

        function applyAction(combatant, label) {
          var position = lookupAction(combatant.actions, label),
            action = combatant.actions[position];
          if (action) {
            action.apply();
          } else {
            throw "Action '" + label + "'' not found on " + combatant;
          }
        }

        beforeEach(function() {
          this.addMatchers({
            toHaveAction: function(label) {
              var combatant = this.actual,
                position = lookupAction(combatant.actions, label),
                actionFound = position >= 0,
                notText = this.isNot ? " not" : "";

              this.message = function() {
                return "Expected " + combatant + notText + " to have action '" + label + "'";
              };

              return actionFound;
            }
          });
        });

        describe('Finish Turn', function() {
          var finishTurnLabel = 'Finish Turn';

          beforeEach(function($controller, $rootScope) {
            var ed = new ctrl.Combatant('Ed', 10, ctrl.Combatant.TURN_STATUS.active),
              jim = new ctrl.Combatant('Jim', 5, ctrl.Combatant.TURN_STATUS.delaying),
              kal = new ctrl.Combatant('Kal', 1, ctrl.Combatant.TURN_STATUS.waiting),
              zack = new ctrl.Combatant('Zack', 1, ctrl.Combatant.TURN_STATUS.complete);
            scope.combatants = [ed, jim, kal, zack];
            ctrl.refreshCombatantList();
            scope.$digest();
          });

          it('should be available to active combatant', function() {
            expect(scope.combatants[0]).toHaveAction(finishTurnLabel);
          });

          it('should be available to delaying combatants', function() {
            expect(scope.combatants[1]).toHaveAction(finishTurnLabel);
          });

          it('should not be available to waiting combatants', function() {
            expect(scope.combatants[2]).not.toHaveAction(finishTurnLabel);
          });

          it('should not be available to complete combatants', function() {
            expect(scope.combatants[3]).not.toHaveAction(finishTurnLabel);
          });

          it('should mark combatant as their turn being taken', function() {
            var combatant = scope.combatants[0];
            expect(combatant.turnStatus).toEqual(ctrl.Combatant.TURN_STATUS.active);
            applyAction(combatant, finishTurnLabel);
            scope.$digest();
            expect(combatant.turnStatus).toEqual(ctrl.Combatant.TURN_STATUS.complete);
          });
        });

        describe('Delay Turn', function() {
          var delayTurnLabel = 'Delay Turn';

          beforeEach(function($controller, $rootScope) {
            var ed = new ctrl.Combatant('Ed', 10, ctrl.Combatant.TURN_STATUS.active),
              jim = new ctrl.Combatant('Jim', 5, ctrl.Combatant.TURN_STATUS.delaying),
              kal = new ctrl.Combatant('Kal', 1, ctrl.Combatant.TURN_STATUS.waiting),
              zack = new ctrl.Combatant('Zack', 1, ctrl.Combatant.TURN_STATUS.complete);
            scope.combatants = [ed, jim, kal, zack];
            ctrl.refreshCombatantList();
            scope.$digest();
          });

          it('should be available to active combatant', function() {
            expect(scope.combatants[0]).toHaveAction(delayTurnLabel);
          });

          it('should not be available to delaying combatants', function() {
            expect(scope.combatants[1]).not.toHaveAction(delayTurnLabel);
          });

          it('should not be available to waiting combatants', function() {
            expect(scope.combatants[2]).not.toHaveAction(delayTurnLabel);
          });

          it('should not be available to complete combatants', function() {
            expect(scope.combatants[3]).not.toHaveAction(delayTurnLabel);
          });

          it('should mark combatant as their turn being delayed', function() {
            var combatant = scope.combatants[0];
            expect(combatant.turnStatus).toEqual(ctrl.Combatant.TURN_STATUS.active);
            applyAction(combatant, delayTurnLabel);
            scope.$digest();
            expect(combatant.turnStatus).toEqual(ctrl.Combatant.TURN_STATUS.delaying);
          });
        });

        describe('Remove Combatant', function() {
          var removeCombatantLabel = 'Remove Combatant';

          beforeEach(function($controller, $rootScope) {
            var ed = new ctrl.Combatant('Ed', 10, ctrl.Combatant.TURN_STATUS.active),
              jim = new ctrl.Combatant('Jim', 5, ctrl.Combatant.TURN_STATUS.delaying),
              kal = new ctrl.Combatant('Kal', 1, ctrl.Combatant.TURN_STATUS.waiting),
              zack = new ctrl.Combatant('Zack', 1, ctrl.Combatant.TURN_STATUS.complete);
            scope.combatants = [ed, jim, kal, zack];
            ctrl.refreshCombatantList();
            scope.$digest();
          });

          it('should be available to active combatant', function() {
            expect(scope.combatants[0]).toHaveAction(removeCombatantLabel);
          });

          it('should be available to delaying combatants', function() {
            expect(scope.combatants[1]).toHaveAction(removeCombatantLabel);
          });

          it('should be available to waiting combatants', function() {
            expect(scope.combatants[2]).toHaveAction(removeCombatantLabel);
          });

          it('should be available to complete combatants', function() {
            expect(scope.combatants[3]).toHaveAction(removeCombatantLabel);
          });

          it('should remove combatant', function() {
            var combatant = scope.combatants[0];
            applyAction(combatant, removeCombatantLabel);
            scope.$digest();
            expect(scope.combatants).not.toContain(combatant);
          });
        });

      });
    });

  });
})();