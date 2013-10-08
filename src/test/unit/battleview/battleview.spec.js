(function() {
  "use strict";

  describe('battletracker', function() {

    describe('battleView', function() {

      beforeEach(module('ngBattleTracker.battleView'));

      describe('BattleViewCtrl', function() {
        var ctrl, scope, mockModal;


        beforeEach(function() {
          var modalInstance = {
            result: {
              then: function(callback) {
                callback(mockModal.resultToReturn);
              }
            }
          };
          mockModal = {
            resultToReturn: [],
            open: jasmine.createSpy()
          };
          mockModal.open.andReturn(modalInstance);

          module(function($provide) {
            $provide.value('$modal', mockModal);
          });
        });

        beforeEach(inject(function($controller, $rootScope, $modal) {
          scope = $rootScope.$new();
          ctrl = $controller('BattleViewCtrl', {
            $scope: scope,
            $modal: $modal
          });
        }));

        it('should not have any combatants on start', function() {
          expect(scope.combatants.length).toBe(0);
        });

        describe('isRoundComplete()', function() {

          it("should return true when all combatants' turnStatus is complete", function() {
            scope.combatants.push(new ctrl.Combatant('Ed', 10, false, ctrl.Combatant.TURN_STATUS.complete));
            scope.combatants.push(new ctrl.Combatant('Jim', 5, false, ctrl.Combatant.TURN_STATUS.complete));
            scope.combatants.push(new ctrl.Combatant('Kal', 1, false, ctrl.Combatant.TURN_STATUS.complete));
            scope.$digest();

            expect(scope.isRoundComplete()).toBe(true);
          });

          it("should return false when any combatant's turnStatus is not complete", function() {
            scope.combatants.push(new ctrl.Combatant('Ed', 10, false, ctrl.Combatant.TURN_STATUS.active));
            scope.combatants.push(new ctrl.Combatant('Jim', 5, false, ctrl.Combatant.TURN_STATUS.complete));
            scope.combatants.push(new ctrl.Combatant('Kal', 1, false, ctrl.Combatant.TURN_STATUS.complete));
            scope.$digest();

            expect(scope.isRoundComplete()).toBe(false);
          });

          it("should return false when no combatants", function() {
            expect(scope.isRoundComplete()).toBe(false);
          });

        });


        describe('resetBattle()', function() {

          it("should empty combatants when no partyMembers", function() {
            scope.combatants.push(new ctrl.Combatant('Ed', 10, false, ctrl.Combatant.TURN_STATUS.complete));
            scope.combatants.push(new ctrl.Combatant('Jim', 5, false, ctrl.Combatant.TURN_STATUS.complete));
            scope.combatants.push(new ctrl.Combatant('Kal', 1, false, ctrl.Combatant.TURN_STATUS.complete));
            scope.$digest();

            scope.resetBattle();
            expect(mockModal.open).not.toHaveBeenCalled();
            expect(scope.combatants).toEqual([]);
          });

          it("should replace combatants with combatants from modelInstance when combatants contained partyMembers", function() {
            mockModal.resultToReturn = [new ctrl.Combatant('Ed', 1, true)];

            scope.combatants.push(new ctrl.Combatant('Ed', 10, true, ctrl.Combatant.TURN_STATUS.active));
            scope.combatants.push(new ctrl.Combatant('Jim', 5, false, ctrl.Combatant.TURN_STATUS.complete));
            scope.combatants.push(new ctrl.Combatant('Kal', 1, false, ctrl.Combatant.TURN_STATUS.complete));
            scope.$digest();

            scope.resetBattle();

            //status are the same
            expect(mockModal.open).toHaveBeenCalled();
            expect(scope.combatants.length).toEqual(1);
            expect(scope.combatants[0].name).toEqual('Ed');
          });

          it("should pass to modal only partyMember combatants ordered by name", function() {
            scope.combatants.push(new ctrl.Combatant('Ed', 10, true, ctrl.Combatant.TURN_STATUS.complete));
            scope.combatants.push(new ctrl.Combatant('Jim', 5, false, ctrl.Combatant.TURN_STATUS.complete));
            scope.combatants.push(new ctrl.Combatant('Allen', 3, true, ctrl.Combatant.TURN_STATUS.complete));
            scope.combatants.push(new ctrl.Combatant('Kal', 1, false, ctrl.Combatant.TURN_STATUS.complete));
            scope.$digest();

            scope.resetBattle();
            expect(mockModal.open).toHaveBeenCalled();

            var passedInCombatants = mockModal.open.mostRecentCall.args[0].resolve.combatants();
            expect(passedInCombatants.length).toBe(2);
            expect(passedInCombatants[0].name).toEqual('Allen');
            expect(passedInCombatants[0].partyMember).toBe(true);
            expect(passedInCombatants[1].name).toEqual('Ed');
            expect(passedInCombatants[1].partyMember).toBe(true);
          });
        });

        describe('startNextRound()', function() {

          it("should reset all players to waiting and start the next round when round is complete", function() {
            scope.combatants.push(new ctrl.Combatant('Ed', 10, false, ctrl.Combatant.TURN_STATUS.complete));
            scope.combatants.push(new ctrl.Combatant('Jim', 5, false, ctrl.Combatant.TURN_STATUS.complete));
            scope.combatants.push(new ctrl.Combatant('Kal', 1, false, ctrl.Combatant.TURN_STATUS.complete));
            scope.$digest();

            scope.startNextRound();
            //status are reset
            expect(scope.combatants[0].turnStatus).toEqual(ctrl.Combatant.TURN_STATUS.active);
            expect(scope.combatants[1].turnStatus).toEqual(ctrl.Combatant.TURN_STATUS.waiting);
            expect(scope.combatants[2].turnStatus).toEqual(ctrl.Combatant.TURN_STATUS.waiting);
          });

          it("should do nothing if round is not complete", function() {
            scope.combatants.push(new ctrl.Combatant('Ed', 10, false, ctrl.Combatant.TURN_STATUS.active));
            scope.combatants.push(new ctrl.Combatant('Jim', 5, false, ctrl.Combatant.TURN_STATUS.complete));
            scope.combatants.push(new ctrl.Combatant('Kal', 1, false, ctrl.Combatant.TURN_STATUS.complete));
            scope.$digest();

            scope.startNextRound();

            //status are the same
            expect(scope.combatants[0].turnStatus).toEqual(ctrl.Combatant.TURN_STATUS.active);
            expect(scope.combatants[1].turnStatus).toEqual(ctrl.Combatant.TURN_STATUS.complete);
            expect(scope.combatants[2].turnStatus).toEqual(ctrl.Combatant.TURN_STATUS.complete);
          });

          it("should return false when no combatants", function() {
            expect(scope.isRoundComplete()).toBe(false);
          });

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
            activeCombatant10 = new ctrl.Combatant('activeCombatant10', 10, false, ctrl.Combatant.TURN_STATUS.active);
            delayingCombatant20 = new ctrl.Combatant('delayingCombatant20', 20, false, ctrl.Combatant.TURN_STATUS.delaying);
            delayingCombatant15 = new ctrl.Combatant('delayingCombatant15', 15, false, ctrl.Combatant.TURN_STATUS.delaying);
            waitingCombatant20 = new ctrl.Combatant('waitingCombatant20', 5, false, ctrl.Combatant.TURN_STATUS.waiting);
            waitingCombatant15 = new ctrl.Combatant('waitingCombatant15', 3, false, ctrl.Combatant.TURN_STATUS.waiting);
            completeCombatant20 = new ctrl.Combatant('completeCombatant20', 25, false, ctrl.Combatant.TURN_STATUS.complete);
            completeCombatant15 = new ctrl.Combatant('completeCombatant15', 23, false, ctrl.Combatant.TURN_STATUS.complete);
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
            var combatant = new ctrl.Combatant('Ted', 3, false);

            expect(combatant.name).toEqual('Ted');
            expect(combatant.initiative).toEqual(3);
            expect(combatant.partyMember).toEqual(false);
            expect(combatant.turnStatus).toEqual(ctrl.Combatant.TURN_STATUS.waiting);
          });
        });

        describe('addCombatant()', function() {

          beforeEach(function() {
            scope.combatants.push(new ctrl.Combatant('Ed', 10));
            scope.combatants.push(new ctrl.Combatant('Jim', 5));
            scope.combatants.push(new ctrl.Combatant('Kal', 1));
            ctrl.refreshCombatantList();
            scope.$digest();
          });

          it('should add combatant after any combatants with higher initiative, but before any combatants with lower initiative', function() {
            var newCombatant = new ctrl.Combatant('Nancy', 7);

            scope.addCombatant(newCombatant);
            scope.$digest();

            expect(scope.combatants.length).toBe(4);
            expect(scope.combatants[1].name).toEqual('Nancy');
            expect(scope.combatants[1].initiative).toBe(7);
          });

          it('should add combatant just after any combatants with the same initiative', function() {
            var newCombatant = new ctrl.Combatant('Nancy', 5);

            scope.addCombatant(newCombatant);
            scope.$digest();

            expect(scope.combatants.length).toBe(4);
            expect(scope.combatants[2].name).toEqual('Nancy');
            expect(scope.combatants[2].initiative).toBe(5);
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
              var ed = new ctrl.Combatant('Ed', 10, false, ctrl.Combatant.TURN_STATUS.active),
                jim = new ctrl.Combatant('Jim', 5, false, ctrl.Combatant.TURN_STATUS.delaying),
                kal = new ctrl.Combatant('Kal', 1, false, ctrl.Combatant.TURN_STATUS.waiting),
                zack = new ctrl.Combatant('Zack', 1, false, ctrl.Combatant.TURN_STATUS.complete);
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
              var ed = new ctrl.Combatant('Ed', 10, false, ctrl.Combatant.TURN_STATUS.active),
                jim = new ctrl.Combatant('Jim', 5, false, ctrl.Combatant.TURN_STATUS.delaying),
                kal = new ctrl.Combatant('Kal', 1, false, ctrl.Combatant.TURN_STATUS.waiting),
                zack = new ctrl.Combatant('Zack', 1, false, ctrl.Combatant.TURN_STATUS.complete);
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
              var ed = new ctrl.Combatant('Ed', 10, false, ctrl.Combatant.TURN_STATUS.active),
                jim = new ctrl.Combatant('Jim', 5, false, ctrl.Combatant.TURN_STATUS.delaying),
                kal = new ctrl.Combatant('Kal', 1, false, ctrl.Combatant.TURN_STATUS.waiting),
                zack = new ctrl.Combatant('Zack', 1, false, ctrl.Combatant.TURN_STATUS.complete);
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