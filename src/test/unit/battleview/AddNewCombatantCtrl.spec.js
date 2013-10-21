(function() {
  "use strict";

  describe('battletracker', function() {

    describe('battleView', function() {

      beforeEach(module('ngBattleTracker.battleView'));

      describe('AddNewCombatantCtrl', function() {

        var ctrl, mockParentCtrl, scope;

        beforeEach(inject(function($controller, $rootScope) {
          scope = $rootScope.$new();
          ctrl = $controller('AddNewCombatantCtrl', {
            $scope: scope
          });
          scope.$parent = mockParentCtrl = {
            addCombatant: jasmine.createSpy()
          };
        }));

        describe('addCombatant()', function() {

          it('should not add combatant without name', function() {
            scope.newCombatant.name = undefined;
            scope.newCombatant.initiative = 2;
            scope.addCombatant();
            scope.$digest();

            expect(mockParentCtrl.addCombatant).not.toHaveBeenCalled();
          });

          it('should not add combatant without initiative', function() {
            scope.newCombatant.name = 'Nancy';
            scope.newCombatant.initiative = undefined;
            scope.addCombatant();
            scope.$digest();

            expect(mockParentCtrl.addCombatant).not.toHaveBeenCalled();
          });

          it('should add combatant and reset newCombatant', function() {
            scope.newCombatant.name = 'Nancy';
            scope.newCombatant.initiative = 2;
            scope.addCombatant();
            scope.$digest();

            expect(mockParentCtrl.addCombatant).toHaveBeenCalled();
            var createdCombatant = mockParentCtrl.addCombatant.mostRecentCall.args[0];
            expect(createdCombatant.name).toEqual('Nancy');
            expect(createdCombatant.initiative).toBe(2);
            expect(scope.newCombatant.name).toBeUndefined();
            expect(scope.newCombatant.initiative).toBeUndefined();
          });
        });
      });
    });
  });
})();