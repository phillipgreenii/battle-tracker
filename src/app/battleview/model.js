(function(angular, undefined) {

  function Combatant(name, initiative, partyMember, turnStatus) {
    var self = this;
    self.name = name;
    self.initiative = initiative;
    self.partyMember = partyMember || false;
    self.turnStatus = turnStatus || Combatant.TURN_STATUS.waiting;
  }

  Combatant.TURN_STATUS = {
    active: {
      label: 'active',
      ordinal: 4
    },
    delaying: {
      label: 'delaying',
      ordinal: 2
    },
    waiting: {
      label: 'waiting',
      ordinal: 1
    },
    complete: {
      label: 'complete',
      ordinal: 0
    }
  };

  Combatant.prototype.toString = function() {
    return "[Combatant " + this.name + ':' + this.turnStatus.label + "]";
  };

  angular.module('ngBattleTracker.battleView.model', [])

  .constant('BattleViewModel', {
    Combatant: Combatant
  });

}(angular));