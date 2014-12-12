angular.module('app',['gcc.carousel','gcc.video']);

angular.module('brightcove',[])

	.service('Brightcove',['$timeout','$rootScope',function($timeout,$rootScope){
		var bc, ml, me, ex, cm, pm;
		$rootScope.$on('brightcove:init',function(event,args){
			console.log(event.name);
			console.log(args);
		});
		$rootScope.$on('brightcove:load',function(event,args){
			console.log(event.name);
			console.log(args);
			bc = brightcove.api;
			ml = bc.modules.APIModules;
			me = bc.events.MediaEvent;
			ex = bc.getExperience(args.eid);
			cm = ex.getModule(ml.CONTENT);
			pm = ex.getModule(ml.VIDEO_PLAYER);
		});
		$rootScope.$on('brightcove:ready',function(event,args){
			console.log(event.name);
			console.log(args);
			pm.addEventListener(me.BEGIN,function(){
				$rootScope.$broadcast('player:begin',{});
			});
			pm.addEventListener(me.PLAY,function(){
				$rootScope.$broadcast('player:play',{});
			});
			pm.addEventListener(me.STOP,function(){
				$rootScope.$broadcast('player:stop',{});
			});
			pm.addEventListener(me.COMPLETE,function(){
				$rootScope.$broadcast('player:complete',{});
			});
			pm.addEventListener(me.PROGRESS,function(){
				$rootScope.$broadcast('player:progress',{});
			});
			pm.addEventListener(me.CHANGE,function(){
				$rootScope.$broadcast('player:change',{});
			});
			pm.addEventListener(me.ERROR,function(){
				$rootScope.$broadcast('player:error',{});
			});
		});
		var s = {};
		s.init = function() {
			$timeout(function(){
				brightcove.createExperiences();
				$rootScope.$broadcast('brightcove:init',{});
			},1);
		};
		s.enqueue = function(video) {
			switch (video.type) {
				case 'url': 
					pm.getCurrentVideo(function(v){
						v.defaultURL = video.url;
						v.videoStillURL = video.videoStill;
						v.thumbnailURL = video.thumbnail;
						v.displayName = video.title;
						v.shortDescription = video.videoCaption;
						cm.updateMedia(v,function(){
							console.log(arguments);
							pm.cueVideoByID(v.id);
						});
					});
					break;
				case 'id': 
					break;
				default: throw new Error('Unrecognized video type: '+video.type);
			}
		};
		return s;
	}])

	.directive('bcVideoPlayer',['$rootScope','Brightcove',function($rootScope,Brightcove){
		window.gcc = window.gcc || {};
		gcc.bc = gcc.bc || {};
		gcc.bc.onTemplateLoad = function(eid) {
			$rootScope.$broadcast('player:load',{eid:eid});
			$rootScope.$broadcast('brightcove:load',{eid:eid});
		};
		gcc.bc.onTemplateReady = function() {
			$rootScope.$broadcast('player:ready',{});
			$rootScope.$broadcast('brightcove:ready',{});
		};		
		return {
			restrict: 'A',
			scope: {
				eid: '@',
				pid: '@',
				pkey: '@',
				height: '@',
				width: '@',
				vid: '@'
			},
			replace: true,
			template: ''+
				'<object id="{{eid}}" class="BrightcoveExperience">'+
					'<param name="bgcolor" value="#FFFFFF" />'+
					'<param name="width" value="{{width}}" />'+
					'<param name="height" value="{{height}}" />'+
					'<param name="playerID" value="{{pid}}" />'+
					'<param name="playerKey" value="{{pkey}}" />'+
					'<param name="isVid" value="true" />'+
					'<param name="isUI" value="true" />'+
					'<param name="dynamicStreaming" value="true" />'+
					'<param name="@videoPlayer" value="{{vid}}"; />'+
					'<param name="includeAPI" value="true" />'+
					'<param name="templateLoadHandler" value="gcc.bc.onTemplateLoad" />'+
					'<param name="templateReadyHandler" value="gcc.bc.onTemplateReady" />'+
				'</object>'
		};
	}])

;

angular.module('gcc.content',[])

	.service('Content',[function(){
		var s = {};
		var videos = [];
		s.videos = function(video) {
			if (arguments.length) {
				if (typeof video === "object") {
					videos.push(video);
				} else {
					var id = video;
					for (var i in videos) {
						if (videos[i].id == id) {
							return videos[i];
						}
					}
				}
			} else {
				return videos;
			}
		};
		return s;
	}])

;

angular.module('gcc.carousel',['gcc.content'])

	.directive('gccCarouselItem',[function(){
		return {
			restrict: 'A',
			transclude: true,
			template: '<div data-ng-transclude></div>',
			link: function(scope,element,attributes) {
				element.bind('click',scope.carouselItem_onClick);
			}
		};
	}])

	.directive('gccCarousel',['Content',function(Content){
		return {
			restrict: 'A',
			scope: {
				type: '@'
			},
			link: function(scope,element,attributes) {
				switch (scope.type) {
					case 'video': scope.$parent.items = Content.videos(); break;
					default: throw new Error('Unrecognized carousel type: '+scope.type);
				}
			}
		};
	}])

	.controller('CarouselController',['$rootScope','$scope','Content',function($rootScope,$scope,Content){
		$scope.items = $scope.items || [];
		$scope.carouselItem_onClick = function() {
			var e = angular.element(this);
			var id = e.attr('data-id');
			enqueue(id,$scope.items);
			$rootScope.$broadcast('carousel:items:sorted',{});
			$rootScope.$broadcast('carousel:items:clicked',{id:id});
			$scope.$apply();
		};
		function enqueue(id,items) {
			items[0].priority = items[0].tmpPriority;
			for (var i in items) {
				if (items[i].id == id) {
					items[i].tmpPriority = items[i].priority + 100;
					items[i].priority = -1;
				}
			}
			items.sort(function(a,b){
				return a.priority - b.priority;
			});
		}
	}])

;

angular.module('gcc.video',['gcc.content','brightcove'])

	.directive('gccVideo',['Content',function(Content){
		return {
			restrict: 'A',
			scope: {
				id: '@',
				type: '@',
				title: '@',
				videoCaption: '@',
				url: '@',
				videoStill: '@',
				thumbnail: '@'
			},
			link: function(scope,element,attributes) {
				var priority = Content.videos().length;
				Content.videos({
					id: scope.id,
					type: scope.type,
					title: scope.title,
					videoCaption: scope.videoCaption,
					url: scope.url,
					videoStill: scope.videoStill,
					thumbnail: scope.thumbnail,
					priority: priority,
					tmpPriority: priority
				});
			}
		};
	}])

	.service('VideoPlayer',['Brightcove',function(Brightcove){
		var s = function() {
			return Brightcove;
		};
		s.init = function() {
			new s().init();
		};
		return s;
	}])

	.controller('VideoPlayerController',['$scope','VideoPlayer','Content',function($scope,VideoPlayer,Content){
		var videoPlayer = new VideoPlayer();
		videoPlayer.init();
		$scope.$on('carousel:items:clicked',function(event,args){
			console.log(event.name);
			console.log(args);
			var id = args.id;
			var video = Content.videos(id);
			videoPlayer.enqueue(video);
		});
		$scope.$on('player:init',function(event,args){
			console.log(event.name);
			console.log(args);
		});
		$scope.$on('player:load',function(event,args){
			console.log(event.name);
			console.log(args);
		});
		$scope.$on('player:ready',function(event,args){
			console.log(event.name);
			console.log(args);
		});
		$scope.$on('player:begin',function(event,args){
			console.log(event.name);
			console.log(args);
		});
		$scope.$on('player:play',function(event,args){
			console.log(event.name);
			console.log(args);
		});
		$scope.$on('player:stop',function(event,args){
			console.log(event.name);
			console.log(args);
		});
		$scope.$on('player:complete',function(event,args){
			console.log(event.name);
			console.log(args);
		});
		$scope.$on('player:progress',function(event,args){
			console.log(event.name);
			console.log(args);
		});
		$scope.$on('player:change',function(event,args){
			console.log(event.name);
			console.log(args);
		});
		$scope.$on('player:error',function(event,args){
			console.log(event.name);
			console.log(args);
		});
	}])

;