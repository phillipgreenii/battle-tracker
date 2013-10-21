(function() {
  "use strict";

  describe('battletracker', function() {

    describe('battleView', function() {

      beforeEach(module('ngBattleTracker.battleView'));

      describe('BattleViewCtrl', function() {
        var ctrl, scope, mockModal, mockCampaignService, campaign, stateParams, Combatant;

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
            $provide.value('mockModal', mockModal);
          });
        });

        beforeEach(function() {
          campaign = {
            name: 'test campaign',
            id: '1234',
            combatants: ['Alf', 'Blade']
          };
          mockCampaignService = {
            lookupCampaignById: jasmine.createSpy(),
            saveCampaign: jasmine.createSpy()
          };
          mockCampaignService.lookupCampaignById.andReturn(campaign);
          stateParams = {
            campaignId: '1234'
          };

          module(function($provide) {
            $provide.value('mockCampaignService', mockCampaignService);
            $provide.value('$stateParams', stateParams);
          });
        });

        beforeEach(inject(function(BattleViewModel) {
          Combatant = BattleViewModel.Combatant;
        }));

        beforeEach(inject(function($controller, $rootScope, $location, mockModal) {
          scope = $rootScope.$new();
          ctrl = $controller('BattleViewCtrl', {
            $scope: scope,
            $location: $location,
            $modal: mockModal,
            campaignService: mockCampaignService
          });
        }));

        beforeEach(function() {
          mockModal.resultToReturn = [
            new Combatant('Alf', 4, true),
            new Combatant('Blade', 3, true)
          ];
        });

        it('should not have any combatants on start', function() {
          expect(mockCampaignService.lookupCampaignById).toHaveBeenCalled();
          expect(scope.combatants.length).toBe(0);
        });

        describe('resetBattle()', function() {

          it("should empty combatants when no partyMembers", function() {
            scope.combatants = [];
            scope.combatants.push(new Combatant('Ed', 10, false, Combatant.TURN_STATUS.complete));
            scope.combatants.push(new Combatant('Jim', 5, false, Combatant.TURN_STATUS.complete));
            scope.combatants.push(new Combatant('Kal', 1, false, Combatant.TURN_STATUS.complete));
            scope.$digest();

            scope.resetBattle();
            expect(mockModal.open).toHaveBeenCalled();
            expect(mockModal.open.argsForCall.length).toBe(1);
            expect(scope.combatants).toEqual([]);
          });

          it("should replace combatants with combatants from modelInstance when combatants contained partyMembers", function() {
            mockModal.resultToReturn = [new Combatant('Ed', 1, true)];

            scope.combatants = [];
            scope.combatants.push(new Combatant('Ed', 10, true, Combatant.TURN_STATUS.active));
            scope.combatants.push(new Combatant('Jim', 5, false, Combatant.TURN_STATUS.complete));
            scope.combatants.push(new Combatant('Kal', 1, false, Combatant.TURN_STATUS.complete));
            scope.$digest();

            scope.resetBattle();

            //status are the same
            expect(mockModal.open).toHaveBeenCalled();
            expect(mockModal.open.argsForCall.length).toBe(2);
            expect(scope.combatants.length).toEqual(1);
            expect(scope.combatants[0].name).toEqual('Ed');
          });

          it("should pass to modal only partyMember combatants ordered by name", function() {
            scope.combatants.push(new Combatant('Ed', 10, true, Combatant.TURN_STATUS.complete));
            scope.combatants.push(new Combatant('Jim', 5, false, Combatant.TURN_STATUS.complete));
            scope.combatants.push(new Combatant('Allen', 3, true, Combatant.TURN_STATUS.complete));
            scope.combatants.push(new Combatant('Kal', 1, false, Combatant.TURN_STATUS.complete));
            scope.$digest();

            scope.resetBattle();
            expect(mockModal.open).toHaveBeenCalled();
            expect(mockModal.open.argsForCall.length).toBe(2);

            var passedInCombatants = mockModal.open.mostRecentCall.args[0].resolve.combatants();
            expect(passedInCombatants.length).toBe(2);
            expect(passedInCombatants[0].name).toEqual('Allen');
            expect(passedInCombatants[0].partyMember).toBe(true);
            expect(passedInCombatants[1].name).toEqual('Ed');
            expect(passedInCombatants[1].partyMember).toBe(true);
          });
        });

        describe('Combatant', function() {
          it('should have name, initative, and no actions', function() {
            var combatant = new Combatant('Ted', 3, false);

            expect(combatant.name).toEqual('Ted');
            expect(combatant.initiative).toEqual(3);
            expect(combatant.partyMember).toEqual(false);
            expect(combatant.turnStatus).toEqual(Combatant.TURN_STATUS.waiting);
          });
        });

        describe('addCombatant()', function() {

          beforeEach(function() {
            scope.combatants.push(new Combatant('Ed', 10));
            scope.combatants.push(new Combatant('Jim', 5));
            scope.combatants.push(new Combatant('Kal', 1));
            ctrl.refreshCombatantList();
            scope.$digest();
          });

          it('should add combatant after any combatants with higher initiative, but before any combatants with lower initiative', function() {
            var newCombatant = new Combatant('Nancy', 7);

            scope.addCombatant(newCombatant);
            scope.$digest();

            expect(scope.combatants.length).toBe(4);
            expect(scope.combatants[1].name).toEqual('Nancy');
            expect(scope.combatants[1].initiative).toBe(7);
          });

          it('should add combatant just after any combatants with the same initiative', function() {
            var newCombatant = new Combatant('Nancy', 5);

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
              var ed = new Combatant('Ed', 10, false, Combatant.TURN_STATUS.active),
                jim = new Combatant('Jim', 5, false, Combatant.TURN_STATUS.delaying),
                kal = new Combatant('Kal', 1, false, Combatant.TURN_STATUS.waiting),
                zack = new Combatant('Zack', 1, false, Combatant.TURN_STATUS.complete);
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
              expect(combatant.turnStatus).toEqual(Combatant.TURN_STATUS.active);
              applyAction(combatant, finishTurnLabel);
              scope.$digest();
              expect(combatant.turnStatus).toEqual(Combatant.TURN_STATUS.complete);
            });
          });

          describe('Delay Turn', function() {
            var delayTurnLabel = 'Delay Turn';

            beforeEach(function($controller, $rootScope) {
              var ed = new Combatant('Ed', 10, false, Combatant.TURN_STATUS.active),
                jim = new Combatant('Jim', 5, false, Combatant.TURN_STATUS.delaying),
                kal = new Combatant('Kal', 1, false, Combatant.TURN_STATUS.waiting),
                zack = new Combatant('Zack', 1, false, Combatant.TURN_STATUS.complete);
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
              expect(combatant.turnStatus).toEqual(Combatant.TURN_STATUS.active);
              applyAction(combatant, delayTurnLabel);
              scope.$digest();
              expect(combatant.turnStatus).toEqual(Combatant.TURN_STATUS.delaying);
            });
          });

          describe('Remove Combatant', function() {
            var removeCombatantLabel = 'Remove Combatant';

            beforeEach(function($controller, $rootScope) {
              var ed = new Combatant('Ed', 10, false, Combatant.TURN_STATUS.active),
                jim = new Combatant('Jim', 5, false, Combatant.TURN_STATUS.delaying),
                kal = new Combatant('Kal', 1, false, Combatant.TURN_STATUS.waiting),
                zack = new Combatant('Zack', 1, false, Combatant.TURN_STATUS.complete);
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
    });

  });
})();