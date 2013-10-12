(function(angular, undefined) {

  angular.module('ngBattleTracker.campaignView', [
    'ui.router',
    'ui.route',
    'ui.bootstrap.modal',
  ])

  .config(function campaignViewConfig($stateProvider) {
    $stateProvider.state('campaignView', {
      url: '/campaignView/:campaignId',
      views: {
        "main": {
          controller: 'CampaignViewCtrl',
          templateUrl: 'campaignview/campaignview.tpl.html'
        }
      },
      data: {
        pageTitle: 'Campaigns'
      }
    });
  })

  .controller('CampaignViewCtrl', function CampaignViewCtrl($scope, campaignService, $stateParams, $modal) {
    var campaignId = $stateParams.campaignId;

    function addNewCombatant() {
      var modalInstance = $modal.open({
        templateUrl: 'campaignview/createcombatantmodal.tpl.html',
        controller: 'CreateCombatantModalInstanceCtrl'
      });

      modalInstance.result.then(function(combatant) {
        $scope.campaign.combatants.push(combatant);
        campaignService.saveCampaign($scope.campaign);
        refreshCampaign();
      });
    }

    function deleteCombatant(combatant) {
      var index = $scope.campaign.combatants.indexOf(combatant);
      if (index >= 0) {
        $scope.campaign.combatants.splice(index, 1);
        campaignService.saveCampaign($scope.campaign);
        refreshCampaign();
      }
    }

    function refreshCampaign() {
      $scope.campaign = campaignService.lookupCampaignById(campaignId);
    }

    function init() {
      refreshCampaign(); //TODO add refresh to on page load event of some kind
    }

    $scope.addNewCombatant = addNewCombatant;
    $scope.deleteCombatant = deleteCombatant;
    init();
  })

  .controller('CreateCombatantModalInstanceCtrl', function($scope, $modalInstance) {
    function ok() {
      $modalInstance.close($scope.combatantInfo.name);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    $scope.ok = ok;
    $scope.cancel = cancel;
    $scope.combatantInfo = {};
  });



}(angular));