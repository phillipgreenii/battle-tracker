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
            scope.combatants.push({
              name: 'Ed',
              initiative: 10
            });
            scope.combatants.push({
              name: 'Jim',
              initiative: 5
            });
            scope.combatants.push({
              name: 'Kal',
              initiative: 1
            });
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
    });

  });
})();