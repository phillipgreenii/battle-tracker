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

        describe('Finish Turn', function() {

          beforeEach(function($controller, $rootScope) {
            scope.combatants.push(new ctrl.Combatant('Ed', 10));
            scope.combatants.push(new ctrl.Combatant('Jim', 5));
            scope.combatants.push(new ctrl.Combatant('Kal', 1));
            ctrl.refreshCombatantList();
            scope.$digest();
          });

          it('should be available to new combatants', function() {
            expect(scope.combatants[0].actions).toBeDefined();
            expect(scope.combatants[0].actions.length).toBe(1);
            expect(scope.combatants[0].actions[0].label).toEqual('Finish Turn');
          });

          it('should mark combatant as their turn being taken', function() {
            var combatant = scope.combatants[0];
            expect(combatant.takenTurn).toEqual(false);
            combatant.actions[0].apply();
            scope.$digest();
            expect(combatant.takenTurn).toEqual(true);
          });

          it('should move them to the end of the list', function() {
            var combatant = scope.combatants[0],
              lastCombatant;
            combatant.actions[0].apply();
            scope.$digest();
            lastCombatant = scope.combatants[scope.combatants.length - 1];
            expect(combatant).toBe(lastCombatant);
          });
        });
      });
    });

  });
})();