(function() {
  "use strict";

  describe('battletracker', function() {

    describe('battleView', function() {

      beforeEach(module('ngBattleTracker.battleView'));

      describe('BattleRoundCtrl', function() {

        var ctrl, mockParentCtrl, scope, Combatant;


        beforeEach(function() {
          var stateParams = {
            campaignId: '1234'
          };
          module(function($provide) {
            $provide.value('$stateParams', stateParams);
          });
        });

        beforeEach(inject(function($controller, $rootScope, BattleViewModel) {
          Combatant = BattleViewModel.Combatant;
          scope = $rootScope.$new();
          ctrl = $controller('BattleRoundCtrl', {
            $scope: scope
          });
          scope.$parent = mockParentCtrl = {
            refreshCombatantList: jasmine.createSpy()
          };
        }));

        beforeEach(function() {
          scope.combatants = [];
        });

        describe('isRoundComplete()', function() {
          it("should return true when all combatants' turnStatus is complete", function() {
            scope.combatants.push(new Combatant('Ed', 10, false, Combatant.TURN_STATUS.complete));
            scope.combatants.push(new Combatant('Jim', 5, false, Combatant.TURN_STATUS.complete));
            scope.combatants.push(new Combatant('Kal', 1, false, Combatant.TURN_STATUS.complete));
            scope.$digest();

            expect(scope.isRoundComplete()).toBe(true);
          });

          it("should return false when any combatant's turnStatus is not complete", function() {
            scope.combatants.push(new Combatant('Ed', 10, false, Combatant.TURN_STATUS.active));
            scope.combatants.push(new Combatant('Jim', 5, false, Combatant.TURN_STATUS.complete));
            scope.combatants.push(new Combatant('Kal', 1, false, Combatant.TURN_STATUS.complete));
            scope.$digest();

            expect(scope.isRoundComplete()).toBe(false);
          });

          it("should return false when no combatants", function() {
            expect(scope.isRoundComplete()).toBe(false);
          });

        });

        describe('startNextRound()', function() {

          it("should reset all players to waiting and start the next round when round is complete", function() {
            scope.combatants.push(new Combatant('Ed', 10, false, Combatant.TURN_STATUS.complete));
            scope.combatants.push(new Combatant('Jim', 5, false, Combatant.TURN_STATUS.complete));
            scope.combatants.push(new Combatant('Kal', 1, false, Combatant.TURN_STATUS.complete));
            scope.$digest();

            scope.startNextRound();
            //status are reset
            expect(scope.combatants[0].turnStatus).toEqual(Combatant.TURN_STATUS.waiting);
            expect(scope.combatants[1].turnStatus).toEqual(Combatant.TURN_STATUS.waiting);
            expect(scope.combatants[2].turnStatus).toEqual(Combatant.TURN_STATUS.waiting);
            expect(mockParentCtrl.refreshCombatantList).toHaveBeenCalled();
          });

          it("should do nothing if round is not complete", function() {
            scope.combatants.push(new Combatant('Ed', 10, false, Combatant.TURN_STATUS.active));
            scope.combatants.push(new Combatant('Jim', 5, false, Combatant.TURN_STATUS.complete));
            scope.combatants.push(new Combatant('Kal', 1, false, Combatant.TURN_STATUS.complete));
            scope.$digest();

            scope.startNextRound();

            //status are the same
            expect(scope.combatants[0].turnStatus).toEqual(Combatant.TURN_STATUS.active);
            expect(scope.combatants[1].turnStatus).toEqual(Combatant.TURN_STATUS.complete);
            expect(scope.combatants[2].turnStatus).toEqual(Combatant.TURN_STATUS.complete);
            expect(mockParentCtrl.refreshCombatantList).not.toHaveBeenCalled();
          });

          it("should return false when no combatants", function() {
            expect(scope.isRoundComplete()).toBe(false);
          });

        });

        describe('endBattle()', function() {

          it('should change the url to campaign view', inject(function($location) {
            scope.endBattle();

            expect($location.url()).toEqual('/campaignView/1234');
          }));

        });
      });

    });

  });
})();