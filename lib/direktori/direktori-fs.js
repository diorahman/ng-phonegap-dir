(function (direktori) {

  if (direktori) {

    direktori.list = function (path, callback) {

      function readDir(uri, callback){

        window.resolveLocalFileSystemURI(uri, function (entry) {

          var reader = entry.createReader();

          reader.readEntries(
            function (entries){
              callback(null, entries);
            }, 
            function () {
              callback(new Error("Error read dir"));
            }
          );

        }, function(){
          callback(new Error("Error read dir"));
        });

      }

      var currentPath;

      if (typeof path == "function") {
        callback = path;
      } else if (typeof path == "string" ){
        currentPath = path || "";
      }

      callback = callback || function(){}

      if (direktori.root) {
        currentPath = currentPath || direktori.root.fullPath;
        readDir(currentPath, callback);
      }

      else {

        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

        if (window.LocalFileSystem)
        window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, 
          
          function(disk){

            direktori.root = disk.root;

            currentPath = currentPath || disk.root.fullPath;

            readDir(currentPath, callback);
            
          }, 
          function(){
            callback(new Error("Error read dir"));
          });
        else 
          callback(null, [{ fullPath : "test" }]);
      }
    }
  }

})(window.direktori);