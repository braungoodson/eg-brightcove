angular
	.module('app',['brightcove'])
	.provider('appProvider',[function(){this.$get=[function(){return new appProvider();}];function appProvider(){}}])
	.service('appService',[function(){return{};}])
	.factory('appFactory',[function(){return{};}])
	.directive('appDirective',[function(){return{};}])
;

angular.module('brightcove',[])

	.directive('bcVideoPlayer',[function(){
		return {
			restrict: 'A',
			template: ''+
			'<object id="myExperience" class="BrightcoveExperience">'+
				'<param name="bgcolor" value="#FFFFFF" />'+
				'<param name="width" value="480" />'+
				'<param name="height" value="270" />'+
				'<param name="playerID" value="3917049043001" />'+
				'<param name="playerKey" value="AQ~~,AAADj5LxskE~,uHgOBcd9fF_gWgPv_64aTjl8cc4Bu8K4" />'+
				'<param name="isVid" value="true" />'+
				'<param name="isUI" value="true" />'+
				'<param name="dynamicStreaming" value="true" />'+
				'<param name="@videoPlayer" value="3917841729001" />'+
				'<param name="includeAPI" value="true" />'+
			'</object>'
		};
	}])

	.factory('Brightcove',['$q','$interval',function($q,$interval){

		var f = {};
		var bc;

		init();

		function init() {
			bc = brightcove || null;
			if (!bc) {
				throw new Error('Could not acquire brightcove object!')
			}
		}

		f.init = function() {
			return bc.createExperiences();
		};

		f.getExperience = function() {
			var d = $q.defer();
			var experience;

			var timeout = 10;
			var i = $interval(function(){
				if (timeout--) {
					if (experience = bc.getExperience('myExperience')) {
						$interval.cancel(i);
						d.resolve(experience);
					}
				} else {
					$interval.cancel(i);
				}
			},100);

			return d.promise;
		};

		f.getPlayer = function() {
			var d = $q.defer();
			var player;

			var timeout = 10;
			var i = $interval(function(){
				if (timeout--) {
					if (player = bc.getPlayer('myExperience')) {
						$interval.cancel(i);
						d.resolve(player);
					}
				} else {
					$interval.cancel(i)
;				}
			},100);

			return d.promise;
		};

		return f;

	}])

	.controller('VideoPlayerController',['$scope','Brightcove',function($scope,Brightcove){

		Brightcove
			.init()
		;

		Brightcove
			.getExperience()
			.then(function(e){
				console.log(JSON.stringify(e));
			})
		;

	}])

;