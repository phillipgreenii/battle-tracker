(function() {
  "use strict";

  describe('battletracker', function() {

    describe('battleView', function() {

      beforeEach(module('ngBattleTracker.battleView'));

      describe('AddMultipleNonPartyCombatantsCtrl', function() {

        var ctrl, mockParentCtrl, scope;

        beforeEach(inject(function($controller, $rootScope) {
          scope = $rootScope.$new();
          ctrl = $controller('AddMultipleNonPartyCombatantsCtrl', {
            $scope: scope
          });
          scope.$parent = mockParentCtrl = {
            addCombatant: jasmine.createSpy()
          };
        }));

        describe('addMultipleNonPartyCombatants()', function() {
          it('should not add non part combatants without inititiaive', function() {
            scope.newMultipleNonPartyCombatants.nameBase = 'monster';
            scope.newMultipleNonPartyCombatants.count = 1;
            scope.refreshNewMultipleNonPartyCombatants();
            scope.addMultipleNonPartyCombatants();
            scope.$digest();

            expect(mockParentCtrl.addCombatant).not.toHaveBeenCalled();
          });

          it('should add non part combatants when all valid and reset', function() {
            scope.newMultipleNonPartyCombatants.nameBase = 'monster';
            scope.newMultipleNonPartyCombatants.count = 2;
            scope.refreshNewMultipleNonPartyCombatants();
            scope.newMultipleNonPartyCombatants.combatants[0].initiative = 4;
            scope.newMultipleNonPartyCombatants.combatants[1].initiative = 7;
            scope.addMultipleNonPartyCombatants();
            scope.$digest();

            //assert added combatants
            expect(mockParentCtrl.addCombatant).toHaveBeenCalled();
            expect(mockParentCtrl.addCombatant.callCount).toBe(2);
            var createdCombatant0 = mockParentCtrl.addCombatant.argsForCall[0][0],
              createdCombatant1 = mockParentCtrl.addCombatant.argsForCall[1][0];
            expect(createdCombatant0.name).toEqual('monster #0');
            expect(createdCombatant0.initiative).toBe(4);
            expect(createdCombatant1.name).toEqual('monster #1');
            expect(createdCombatant1.initiative).toBe(7);
            //assert reset
            expect(scope.newMultipleNonPartyCombatants.nameBase).toBeUndefined();
            expect(scope.newMultipleNonPartyCombatants.count).toBeUndefined();
            expect(scope.newMultipleNonPartyCombatants.combatants).toEqual([]);
          });

        });


        describe('refreshNewMultipleNonPartyCombatants()', function() {

          it('should add combatants with no initiative if count increases', function() {
            scope.newMultipleNonPartyCombatants.combatants = [{
              name: 'monster #0',
              initiative: 3
            }];
            scope.newMultipleNonPartyCombatants.nameBase = 'monster';
            scope.newMultipleNonPartyCombatants.count = 2;
            scope.refreshNewMultipleNonPartyCombatants();
            scope.$digest();

            expect(scope.newMultipleNonPartyCombatants.combatants.length).toBe(2);
            expect(scope.newMultipleNonPartyCombatants.combatants[0].name).toEqual('monster #0');
            expect(scope.newMultipleNonPartyCombatants.combatants[0].initiative).toBe(3);
            expect(scope.newMultipleNonPartyCombatants.combatants[1].name).toEqual('monster #1');
            expect(scope.newMultipleNonPartyCombatants.combatants[1].initiative).toBeUndefined();
          });

          it('should remove combatants if count decreases', function() {
            scope.newMultipleNonPartyCombatants.combatants = [{
              name: 'monster #0',
              initiative: 3
            }, {
              name: 'monster #1',
              initiative: 5
            }];
            scope.newMultipleNonPartyCombatants.nameBase = 'monster';
            scope.newMultipleNonPartyCombatants.count = 1;
            scope.refreshNewMultipleNonPartyCombatants();
            scope.$digest();

            expect(scope.newMultipleNonPartyCombatants.combatants.length).toBe(1);
            expect(scope.newMultipleNonPartyCombatants.combatants[0].name).toEqual('monster #0');
            expect(scope.newMultipleNonPartyCombatants.combatants[0].initiative).toBe(3);
          });

          it('should refresh name if count is the same', function() {
            scope.newMultipleNonPartyCombatants.combatants = [{
              name: 'monster #0',
              initiative: 3
            }, {
              name: 'monster #1',
              initiative: 5
            }];
            scope.newMultipleNonPartyCombatants.nameBase = 'potato';
            scope.newMultipleNonPartyCombatants.count = 2;
            scope.refreshNewMultipleNonPartyCombatants();
            scope.$digest();

            expect(scope.newMultipleNonPartyCombatants.combatants.length).toBe(2);
            expect(scope.newMultipleNonPartyCombatants.combatants[0].name).toEqual('potato #0');
            expect(scope.newMultipleNonPartyCombatants.combatants[0].initiative).toBe(3);
            expect(scope.newMultipleNonPartyCombatants.combatants[1].name).toEqual('potato #1');
            expect(scope.newMultipleNonPartyCombatants.combatants[1].initiative).toBe(5);
          });

        });

      });

    });

  });
})();