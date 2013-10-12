(function() {
  "use strict";

  describe('battletracker', function() {

    describe('home', function() {

      beforeEach(module('ngBattleTracker.home'));


      describe('HomeCtrl', function() {
        var ctrl, scope, mockModal, mockCampaignService;


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
          mockCampaignService = {
            campaigns: [],
            retrieveCampaigns: jasmine.createSpy(),
            createCampaign: jasmine.createSpy(),
            deleteCampaign: jasmine.createSpy()
          };
          mockCampaignService.retrieveCampaigns.andReturn(mockCampaignService.campaigns);

          module(function($provide) {
            $provide.value('mockCampaignService', mockCampaignService); //TODO implement mockCampaignService
          });
        });

        beforeEach(inject(function($controller, $rootScope, mockModal, $location, mockCampaignService) {
          scope = $rootScope.$new();
          ctrl = $controller('HomeCtrl', {
            $scope: scope,
            $modal: mockModal,
            $location: $location,
            campaignService: mockCampaignService
          });
        }));

        describe('init()', function() {
          it("should initialize campaigns to result from campaignService", function() {
            expect(scope.campaigns).toEqual(mockCampaignService.campaigns);
            //only called during init (1)
            expect(mockCampaignService.retrieveCampaigns).toHaveBeenCalled();
            expect(mockCampaignService.retrieveCampaigns.argsForCall.length).toBe(1);
          });
        });

        describe('createNewCampaign()', function() {

          it("should create campaign with name via campaignService", inject(function($location) {
            //arrange
            var nameOfCampaignToCreate = 'newCampaign';
            mockModal.resultToReturn = nameOfCampaignToCreate;
            mockCampaignService.createCampaign.andReturn(0);

            //act
            scope.createNewCampaign();

            //assert
            expect($location.url()).toEqual('/campaignView/0');
            expect(mockCampaignService.createCampaign).toHaveBeenCalled();
            expect(mockCampaignService.createCampaign.mostRecentCall.args).toEqual([nameOfCampaignToCreate]);
            //retrieveCampaigns() called during init and after create (2)
            expect(mockCampaignService.retrieveCampaigns).toHaveBeenCalled();
            expect(mockCampaignService.retrieveCampaigns.argsForCall.length).toBe(2);
          }));

        });


        describe('deleteCampaign()', function() {

          it("should delete campaign using id via campaignService and refresh on successful delete", function() {
            //arrange
            //other attribute left out because they aren't needed for this test
            var campaignToDelete = {
              id: 7
            };
            mockCampaignService.deleteCampaign.andReturn(true);

            //act
            scope.deleteCampaign(campaignToDelete);

            //assert
            expect(mockCampaignService.deleteCampaign).toHaveBeenCalled();
            expect(mockCampaignService.deleteCampaign.mostRecentCall.args).toEqual([7]);
            //retrieveCampaigns() called during init and after delete (1)
            expect(mockCampaignService.retrieveCampaigns).toHaveBeenCalled();
            expect(mockCampaignService.retrieveCampaigns.argsForCall.length).toBe(2);
          });

          it("should delete campaign using id via campaignService but not refresh on failed delete", function() {
            //arrange
            //other attribute left out because they aren't needed for this test
            var campaignToDelete = {
              id: 7
            };
            mockCampaignService.deleteCampaign.andReturn(false);

            //act
            scope.deleteCampaign(campaignToDelete);

            //assert
            expect(mockCampaignService.deleteCampaign).toHaveBeenCalled();
            expect(mockCampaignService.deleteCampaign.mostRecentCall.args).toEqual([7]);
            //retrieveCampaigns() called during init abut not after delete (1)
            expect(mockCampaignService.retrieveCampaigns).toHaveBeenCalled();
            expect(mockCampaignService.retrieveCampaigns.argsForCall.length).toBe(1);
          });

        });
      });
    });
  });
})();