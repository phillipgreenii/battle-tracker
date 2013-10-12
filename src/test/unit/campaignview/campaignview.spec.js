(function() {
  "use strict";

  describe('battletracker', function() {

    describe('campaignView', function() {

      beforeEach(module('ngBattleTracker.campaignView'));

      describe('CampaignViewCtrl', function() {
        var ctrl, scope, mockCampaignService, stateParams, campaign, mockModal;


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
            $provide.value('campaignService', mockCampaignService);
            $provide.value('$stateParams', stateParams);
          });
        });

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

        beforeEach(inject(function($controller, $rootScope, campaignService, $stateParams, mockModal) {
          scope = $rootScope.$new();
          ctrl = $controller('CampaignViewCtrl', {
            $scope: scope,
            campaignService: campaignService,
            $stateParams: $stateParams,
            $modal: mockModal
          });
        }));

        describe('init()', function() {
          it('should initialize campaign based upon stateParameter "campaignId"', function() {
            expect(mockCampaignService.lookupCampaignById).toHaveBeenCalled();
            expect(mockCampaignService.lookupCampaignById.mostRecentCall.args[0]).toEqual('1234');
            expect(scope.campaign).toEqual(campaign);
          });
        });

        describe('addNewCombatant()', function() {

          it("should add combatant to campaign", function() {
            //arrange
            var nameOfCombtantToAdd = 'potatoes',
              expectedCampaignToSave = {
                name: 'test campaign',
                id: '1234',
                combatants: ['Alf', 'Blade', 'potatoes']
              };
            mockModal.resultToReturn = nameOfCombtantToAdd;

            //act
            scope.addNewCombatant();

            //assert
            expect(mockCampaignService.saveCampaign).toHaveBeenCalled();
            expect(mockCampaignService.saveCampaign.mostRecentCall.args).toEqual([expectedCampaignToSave]);
            //refreshCampaign() called during init and after save (2)
            expect(mockCampaignService.lookupCampaignById).toHaveBeenCalled();
            expect(mockCampaignService.lookupCampaignById.argsForCall.length).toBe(2);
          });

        });

        describe('deleteCombatant()', function() {

          it("should delete exsting combatant and refresh", function() {
            //arrange
            var campaignToDelete = 'Alf',
              expectedCampaignToSave = {
                name: 'test campaign',
                id: '1234',
                combatants: ['Blade']
              };

            //act
            scope.deleteCombatant(campaignToDelete);

            //assert
            expect(mockCampaignService.saveCampaign).toHaveBeenCalled();
            expect(mockCampaignService.saveCampaign.mostRecentCall.args).toEqual([expectedCampaignToSave]);
            //refreshCampaign() called during init and after save (2)
            expect(mockCampaignService.lookupCampaignById).toHaveBeenCalled();
            expect(mockCampaignService.lookupCampaignById.argsForCall.length).toBe(2);
          });

          it("should delete but not refresh if combatant isn't found", function() {
            //arrange
            var campaignToDelete = 'Henery';

            //act
            scope.deleteCombatant(campaignToDelete);

            //assert
            expect(mockCampaignService.saveCampaign).not.toHaveBeenCalled();
            //refreshCampaign() called during init but not after after save (1)
            expect(mockCampaignService.lookupCampaignById).toHaveBeenCalled();
            expect(mockCampaignService.lookupCampaignById.argsForCall.length).toBe(1);
          });

        });
      });
    });
  });
})();