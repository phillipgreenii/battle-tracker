(function(angular, undefined) {

  angular.module('ngBattleTracker.home', [
    'ui.router',
    'ui.route',
    'ui.bootstrap.modal',
    'ui.bootstrap.popover'
  ])

  .config(function homeConfig($stateProvider) {
    $stateProvider.state('home', {
      url: '/home',
      views: {
        "main": {
          controller: 'HomeCtrl',
          templateUrl: 'home/home.tpl.html'
        }
      },
      data: {
        pageTitle: 'Home'
      }
    });
  })
    .filter('combatantsSummary', function() {
      return function(combatants) {
        return combatants && combatants.length > 0 ? combatants.join(", ") : "--No Combatants--";
      };
    })

  .factory('campaignService', function() {
    var nextId = 0,
      DB = {
        campaigns: []
      };

    function generateId() {
      return '' + nextId++;
    }

    /**
     * this is just a temporary function, once real persistence is added, this won't be necessary
     */

    function clone(o) {
      var p, r = {};
      if (!o) {
        return o;
      }
      for (p in o) { //Needs a lot more work, just a basic example of a recursive copy function
        switch (true) {
          case o[p] instanceof Function:
            r[p] = o[p];
            break;
          case o[p] instanceof Date:
            r[p] = new Date(o[p]);
            break;
          case o === o[p]:
            //simple circular references only
            //a.some.child.object.references = a; will still cause trouble
            r[p] = r;
            break;
          case o[p] instanceof Array:
            r[p] = o[p].slice(0); //copy arrays
            break;
          default:
            r[p] = o[p] instanceof Object ? clone(o[p]) : o[p];
        }
      }
      return r;
    }

    function retrieveCampaigns() {
      return clone(DB.campaigns);
    }

    function lookupCambaignIndexById(campaignId) {
      return DB.campaigns.reduce(function(previousIndex, current, currentIndex) {
        return campaignId === current.id ? currentIndex : previousIndex;
      }, -1);
    }

    function lookupCampaignById(id) {
      return clone(DB.campaigns[lookupCambaignIndexById(id)] || null);
    }

    function saveCampaign(campaign) {
      DB.campaigns[lookupCambaignIndexById(campaign.id)] = clone(campaign);
    }

    function createCampaign(campaignName) {
      var newId = generateId(),
        newCampaign = {
          name: campaignName,
          id: newId,
          combatants: []
        };
      DB.campaigns.push(newCampaign);
      return newId;
    }

    function deleteCampaign(campaignId) {
      var index = lookupCambaignIndexById(campaignId);
      if (index >= 0) {
        DB.campaigns.splice(index, 1);
      }
      return index >= 0;
    }

    return {
      retrieveCampaigns: retrieveCampaigns,
      lookupCampaignById: lookupCampaignById,
      createCampaign: createCampaign,
      saveCampaign: saveCampaign,
      deleteCampaign: deleteCampaign
    };
  })

  .controller('HomeCtrl', function HomeCtrl($scope, $modal, $location, campaignService) {
    function createNewCampaign() {
      var modalInstance = $modal.open({
        templateUrl: 'home/createcampaignmodal.tpl.html',
        controller: 'CreateCampaignModalInstanceCtrl'
      });

      modalInstance.result.then(function(campaignName) {
        var campaignId = campaignService.createCampaign(campaignName);
        refreshCampaigns();
        $location.path("/campaignView/" + campaignId);
      });
    }

    function deleteCampaign(campaign) {
      if (campaignService.deleteCampaign(campaign.id)) {
        refreshCampaigns();
      }
    }

    function refreshCampaigns() {
      $scope.campaigns = campaignService.retrieveCampaigns();
    }

    function init() {
      refreshCampaigns(); //TODO add refresh to on page load event of some kind
    }

    $scope.createNewCampaign = createNewCampaign;
    $scope.deleteCampaign = deleteCampaign;
    init();
  })

  .controller('CreateCampaignModalInstanceCtrl', function($scope, $modalInstance) {
    function ok() {
      $modalInstance.close($scope.campaignInfo.campaignName);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    $scope.ok = ok;
    $scope.cancel = cancel;
    $scope.campaignInfo = {};
  });

}(angular));