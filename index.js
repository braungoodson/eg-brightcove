angular.module('app',['gcc.carousel','gcc.video']);

angular.module('brightcove',[])

	.service('Brightcove',['$timeout','$rootScope',function($timeout,$rootScope){
		var player;
		var s = {};
		s.init = function() {
			videojs('eg-player').ready(function(){
				player = this;
				$rootScope.$broadcast('brightcove:init',{});
			});
		};
		s.cue = function(video) {
			switch (video.type) {
				case 'url': 
					player = videojs('eg-player');
					player.src({
						src: video.url,
						type: video.mimetype
					});
					break;
				case 'id': 
					break;
				default: throw new Error('Unrecognized video type: '+video.type);
			}
		};
		return s;
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
				mimetype: '@',
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
					mimetype: scope.mimetype,
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
		$scope.$on('carousel:items:clicked',function(event,args){
			console.log(event.name);
			console.log(args);
			var id = args.id;
			var video = Content.videos(id);
			videoPlayer.cue(video);
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