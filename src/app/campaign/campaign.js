(function(angular, undefined) {
  "use strict";

  angular.module('LocalStorageModule').value('prefix', 'buildTracker');
  angular.module('ngBattleTracker.campaign', ['LocalStorageModule'])

  .factory('campaignService', function(localStorageService) {
    var nextId = new Date().getTime();

    function generateId() {
      nextId++;
      return "" + nextId;
    }

    function lookupCambaignIndexById(campaigns, campaignId) {
      return campaigns.reduce(function(previousIndex, current, currentIndex) {
        return campaignId === current.id ? currentIndex : previousIndex;
      }, -1);
    }

    function withCampaigns(callback, persist) {
      var campaigns = localStorageService.get('campaigns') || [],
        result = callback(campaigns);
      if (persist) {
        localStorageService.set('campaigns', campaigns);
      }
      return result;
    }

    function retrieveCampaigns() {
      return withCampaigns(function(campaigns) {
        return campaigns;
      });
    }

    function lookupCampaignById(id) {
      return withCampaigns(function(campaigns) {
        return campaigns[lookupCambaignIndexById(campaigns, id)] || null;
      });
    }

    function saveCampaign(campaign) {
      return withCampaigns(function(campaigns) {
        var index = lookupCambaignIndexById(campaigns, campaign.id);
        if (index >= 0) {
          campaigns[index] = campaign;
        } else {
          throw "Unable to save " + campaign.id + " (" + campaign.name + ") because there exist no current campaign with that id.";
        }
      }, true);
    }

    function createCampaign(campaignName) {
      return withCampaigns(function(campaigns) {
        var newId = generateId(),
          newCampaign = {
            name: campaignName,
            id: newId,
            combatants: []
          };
        campaigns.push(newCampaign);
        return newId;
      }, true);
    }

    function deleteCampaign(campaignId) {
      return withCampaigns(function(campaigns) {
        var index = lookupCambaignIndexById(campaigns, campaignId);
        if (index >= 0) {
          campaigns.splice(index, 1);
        }
        return index >= 0;
      }, true);
    }

    function formatDataStore(campaigns) {
      localStorageService.clearAll();
      localStorageService.set('campaigns', campaigns);
    }

    return {
      retrieveCampaigns: retrieveCampaigns,
      lookupCampaignById: lookupCampaignById,
      createCampaign: createCampaign,
      saveCampaign: saveCampaign,
      deleteCampaign: deleteCampaign,
      internals: {
        formatDataStore: formatDataStore
      }
    };
  });

}(angular));