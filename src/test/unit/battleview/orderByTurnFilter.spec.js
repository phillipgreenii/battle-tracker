(function() {
  "use strict";

  describe('battletracker', function() {

    describe('battleView', function() {

      beforeEach(module('ngBattleTracker.battleView'));

      describe('orderByTurn filter', function() {
        var Combatant,
          filter,
          activeCombatant10,
          delayingCombatant20,
          delayingCombatant15,
          waitingCombatant20,
          waitingCombatant15,
          completeCombatant20,
          completeCombatant15;

        beforeEach(inject(function(BattleViewModel) {
          Combatant = BattleViewModel.Combatant;
        }));

        beforeEach(inject(function(orderByTurnFilter) {
          filter = orderByTurnFilter;
        }));

        beforeEach(function(orderByTurnFilter) {
          activeCombatant10 = new Combatant('activeCombatant10', 10, false, Combatant.TURN_STATUS.active);
          delayingCombatant20 = new Combatant('delayingCombatant20', 20, false, Combatant.TURN_STATUS.delaying);
          delayingCombatant15 = new Combatant('delayingCombatant15', 15, false, Combatant.TURN_STATUS.delaying);
          waitingCombatant20 = new Combatant('waitingCombatant20', 5, false, Combatant.TURN_STATUS.waiting);
          waitingCombatant15 = new Combatant('waitingCombatant15', 3, false, Combatant.TURN_STATUS.waiting);
          completeCombatant20 = new Combatant('completeCombatant20', 25, false, Combatant.TURN_STATUS.complete);
          completeCombatant15 = new Combatant('completeCombatant15', 23, false, Combatant.TURN_STATUS.complete);
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
    });
  });
})();