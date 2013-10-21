(function() {
  "use strict";

  describe('battletracker', function() {

    describe('battleView model', function() {

      beforeEach(module('ngBattleTracker.battleView.model'));

      describe('BattleViewModel', function() {
        var model;

        beforeEach(inject(function(BattleViewModel) {
          model = BattleViewModel;
        }));

        it('should define Combatant', function() {
          expect(model.Combatant).toBeDefined();
        });

      });

    });

  });
})();