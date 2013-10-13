(function() {
  "use strict";

  describe('battletracker', function() {

    describe('campaign', function() {

      beforeEach(module('ngBattleTracker.campaign'));

      describe('campaignService', function() {
        var service, standardCampaigns;

        beforeEach(function() {
          inject(function($injector) {
            service = $injector.get('campaignService');
          });
        });

        function initializeData(campaigns) {
          service.internals.formatDataStore(campaigns);
        }

        beforeEach(function() {
          standardCampaigns = [{
            name: 'test0',
            id: '0',
            combatants: []
          }, {
            name: 'test1',
            id: '1',
            combatants: ['Ed']
          }, {
            name: 'test2',
            id: '2',
            combatants: ['Ed', 'Jones']
          }];
          initializeData(standardCampaigns);
        });

        describe('retrieveCampaigns()', function() {
          it('should return empty list when no campaigns', function() {
            initializeData([]);

            var result = service.retrieveCampaigns();
            expect(result).toEqual([]);
          });

          it('should return all campaigns', function() {
            var result = service.retrieveCampaigns();
            expect(result).toEqual(standardCampaigns);
          });
        });

        describe('lookupCampaignById()', function() {
          it('should return campaign with specified id, if it exist', function() {
            var result = service.lookupCampaignById('1');
            expect(result).toEqual(standardCampaigns[1]);
          });

          it('should return null if no campaign with speicifed id', function() {
            var result = service.lookupCampaignById('xxxxxx');
            expect(result).toBeNull();
          });
        });

        describe('createCampaign()', function() {
          it('should create campaign', function() {
            var originalIds = standardCampaigns.map(function(campaign) {
              return campaign.id;
            }),
              duplicateId,
              result,
              newId = service.createCampaign('new campaign');

            duplicateId = originalIds.indexOf(newId) >= 0;
            expect(duplicateId).toBeFalsy();

            result = service.lookupCampaignById(newId);
            expect(result.name).toEqual('new campaign');
            expect(result.combatants).toEqual([]);
            expect(result.id).toBeDefined();
            expect(parseInt(result.id,10)).toEqual(jasmine.any(Number));
          });
        });

        describe('saveCampaign()', function() {
          it('should save campaign if one exist with the specified id', function() {
            var campaignWithKnownId = {
              name: 'new name',
              id: '1',
              combatants: []
            };
            service.saveCampaign(campaignWithKnownId);
            expect(service.lookupCampaignById('1')).toEqual(campaignWithKnownId);
          });

          it('should throw an error if there exist no campaign with specified id', function() {
            var campaignWithUnknownId = {
              name: 'unknown',
              id: 'xxxx',
              combatants: []
            };
            expect(function() {
              service.saveCampaign(campaignWithUnknownId);
            }).toThrow();
          });
        });

        describe('deleteCampaign()', function() {
          it('should return true if campaign was deleted', function() {
            var expectedCampaigns,
              result;
            expectedCampaigns = standardCampaigns.slice();
            expectedCampaigns.splice(1, 1);

            result = service.deleteCampaign('1');

            expect(result).toBeTruthy();
            expect(service.retrieveCampaigns()).toEqual(expectedCampaigns);
          });

          it('should return false if no campaign was deleted because no id match', function() {
            var expectedCampaigns = standardCampaigns,
              result = service.deleteCampaign('xxxxxx');
            expect(result).toBeFalsy();
            expect(service.retrieveCampaigns()).toEqual(expectedCampaigns);
          });
        });

      });
    });
  });
})();