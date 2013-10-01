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

      describe('Combatant', function() {
        it('should have name, initative, and no actions', function() {
          var combatant = new ctrl.Combatant('Ted', 3);

          expect(combatant.name).toEqual('Ted');
          expect(combatant.initiative).toEqual(3);
          expect(combatant.takenTurn).toBe(false);
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

          action.apply();
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
            scope.combatants.push(new ctrl.Combatant('Ed', 10));
            scope.combatants.push(new ctrl.Combatant('Jim', 5));
            scope.combatants.push(new ctrl.Combatant('Kal', 1));
            ctrl.refreshCombatantList();
            scope.$digest();
          });

          it('should be available to first combatant', function() {
            expect(scope.combatants[0]).toHaveAction(finishTurnLabel);
          });

          it('should not be available to non-first combatants', function() {
            expect(scope.combatants[1]).not.toHaveAction(finishTurnLabel);
            expect(scope.combatants[2]).not.toHaveAction(finishTurnLabel);
          });

          it('should mark combatant as their turn being taken', function() {
            var combatant = scope.combatants[0];
            expect(combatant.takenTurn).toEqual(false);
            applyAction(combatant, finishTurnLabel);
            scope.$digest();
            expect(combatant.takenTurn).toEqual(true);
          });

          it('should move them to the end of the list', function() {
            var combatant = scope.combatants[0],
              lastCombatant;
            applyAction(combatant, finishTurnLabel);
            scope.$digest();
            lastCombatant = scope.combatants[scope.combatants.length - 1];
            expect(combatant).toBe(lastCombatant);
          });
        });

        describe('Remove Combatant', function() {
          var removeCombatantLabel = 'Remove Combatant';

          beforeEach(function($controller, $rootScope) {
            scope.combatants.push(new ctrl.Combatant('Ed', 10));
            scope.combatants.push(new ctrl.Combatant('Jim', 5));
            scope.combatants.push(new ctrl.Combatant('Kal', 1));
            ctrl.refreshCombatantList();
            scope.$digest();
          });

          it('should be available to all combatants', function() {
            expect(scope.combatants[0]).toHaveAction(removeCombatantLabel);
            expect(scope.combatants[1]).toHaveAction(removeCombatantLabel);
            expect(scope.combatants[2]).toHaveAction(removeCombatantLabel);
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