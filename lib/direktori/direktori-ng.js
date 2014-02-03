angular.module('direktori.ui', [
  'direktori.ui.dirDrawer'
]);

angular.module('direktori.provider', [
  'direktori.provider.device',
  'direktori.provider.fileSystem',
]);

angular.module('direktori.filter', [
  'direktori.filter.nameFromUri'
]);

angular.module('direktori', [
  'direktori.ui', 'direktori.provider', 'direktori.filter'
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

angular.module('direktori.filter.nameFromUri', [])

.filter('nameFromUri', function (){
  return function (uri) {

    if (direktori.root) {
      if (uri == direktori.root.fullPath) {

        // todo: find appropriate name for this
        return "Internal Storage";
      }
    }
    
    if (uri) return uri.split("/").pop();
    return uri;
  }
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

    // todo: parameterize the class
    template : '<ul class="nav direktori">\
                <li ng-repeat="entry in entries">\
                  <a ng-click="select(entry)">\
                  <i ng-class="{\'icon-folder-open\' : entry.isDirectory, \'icon-file\' : entry.isFile}">\
                  </i>\
                  {{ entry.name }}\
                </a></li>\
                </ul>',

    scope: {
      dirPath : '=',
      dirPrevPath : "=",
      dirUpPath : "=",
      dirImmediate : "@",
      dirFileSelected : "="
    },

    controller: ['$scope', '$window', function($scope, $window){

      $scope.fileSelected = [];

      $scope.select = function (entry) {
        if (entry.isDirectory) {
          $scope.dirPath = entry.fullPath;  
        } else {
          // Do selection
          var selected = $scope.selected || [];
          if (selected.indexOf(entry) < 0) {
            selected.push(entry);
          }
          
          (function(){
            $scope.selected = selected;
          })();
          
        }
      }

      $scope.list = function(path){

        $dir.list(path)

        .then(function(data){

          var entries = [];

          angular.forEach(data, function(value){
            entries.push(value);
          });

          // using safeApply (https://github.com/yearofmoo/AngularJS-Scope.SafeApply) 
          // instead of $timeout to force-update the ui
          //$scope.$root.$safeApply(function(){
            //$scope.entries = entries;  
          //});
          /* 
          // alternative:
            $timeout(function(){
              $scope.entries = entries;  
            }, 1);
          */
          
          (function(){
            $scope.entries = entries;    
          })();

          console.log(entries);

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

      $device.ready().then(function(){
        if ($scope.dirImmediate) {
          $scope.list("/");
        }
      });

      $scope.$watch("selected", function(selected){
        console.log(selected);
        $scope.dirFileSelected = selected;
      }, true);
      
      $scope.$watch("dirPath", function(path, prev) {

        $scope.dirPrevPath = prev;

        if (path) {
          // TODO: put in util 
          var dirUpPath = path;
          
          if( dirUpPath[dirUpPath.length - 1] == "/") {
            dirUpPath = path.slice(0, -1);
          }

          dirUpPath = dirUpPath.substr(0, dirUpPath.lastIndexOf("/"));

          if (direktori.root) {

            if (path == direktori.root.fullPath) {
              dirUpPath = "";
            } else {
              if (dirUpPath.length < direktori.root.fullPath.length) {
                dirUpPath = direktori.root.fullPath;
              } 
            }
          }
        }

        $scope.dirUpPath = dirUpPath;
        $scope.list(path);

      });
    }
  };
});


})();