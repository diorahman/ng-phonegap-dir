angular.module('direktori.ui', [
  'direktori.ui.dirDrawer'
]);

angular.module('direktori.provider', [
  'direktori.provider.device',
  'direktori.provider.fileSystem',

]);

angular.module('direktori', [
  'direktori.ui', 'direktori.provider'
]);

(function(){

// on device ready
angular.module('direktori.provider.device', [])

.factory('$device', function($q, $rootScope, $document){
  
  var deferred = $q.defer();

  var resolve = function(){
    $rootScope.$apply(deferred.resolve);
    $document.unbind('deviceready', resolve);
  }

  $document.bind('deviceready', resolve);

  return {
    ready: function () {
      return deferred.promise;
    }
  };

});

angular.module('direktori.provider.fileSystem', [])

.factory('$dir', function($q){

  var list = function(path) {

    var deferred = $q.defer();

    direktori.list(path, function(err, data){

      if (err) deferred.reject(err);
      else {
        deferred.resolve(data);
      }

    });

    return deferred.promise;
  }

  return {
    list : list
  }

});

angular.module('direktori.ui.dirDrawer', [])

.directive('dirDrawer', function($interval, $device, $dir) {

  return {
    restrict: 'E',
    replace: true,
    template: '<div class="test"><ul><li ng-repeat="entry in entries">{{ entry.fullPath }}</li></ul></div>',

    scope: {
      // TODO: parameterized the entry
    },

    controller: ['$scope', '$window', function($scope, $window){

      $scope.list = function(path){

        $dir.list(path)

        .then(function(data){

          var entries = [];

          angular.forEach(data, function(value){
            entries.push(value);
          });

          // using safeApply (https://github.com/yearofmoo/AngularJS-Scope.SafeApply) 
          // instead of $timeout to force-update the ui
          /* 
          // alternative:
            $timeout(function(){
              $scope.entries = entries;  
            }, 1);
          */
          $scope.$root.$safeApply(function(){
            $scope.entries = entries;  
          });

        })
        
        .catch(function(err){
          // TODO: handle error
        })

        .finally (function(){
          // finally, fiuhhh
        });
      }

    }],

    link: function($scope, $element, $attr) {

      // device is ready, then set the list
      $device.ready().then(function(){
        $scope.list();
      });
    }
  };
});


})();