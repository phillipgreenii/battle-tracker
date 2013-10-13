(function(angular, undefined) {

  angular.module('ngBattleTracker.home', [
    'ui.router',
    'ui.route',
    'ui.bootstrap.modal',
  'ui.bootstrap.popover',
    'ngBattleTracker.campaign'
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