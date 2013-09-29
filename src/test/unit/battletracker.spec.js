(function() {
	"use strict";

	describe('battletracker', function() {

		it("will ensure unit tests are enabled", function() {
			expect(true).toBeTruthy();
		});

		it("will ensure module exists", function() {
			expect(angular.module('ngBattleTracker')).toBeDefined();
		});

	});
})();