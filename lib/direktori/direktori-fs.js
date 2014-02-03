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

      if (!path) callback(null, []);
      else {
        var isUri = path.indexOf("file://") == 0 ;
        var isAbs = path.indexOf("/") == 0;
        var isAbsRoot = isAbs && (path.length == 1);

        if (isUri) {
          readDir(path, callback);
        } else {

          if (direktori.root) {
            path = direktori.root.fullPath + (isAbs ? (isAbsRoot ? "" : path) : ("/" + path));
            readDir(path, callback);
          } else {

            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

            if (window.LocalFileSystem) {
              window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, 
                function (disk) {

                  direktori.root = disk.root;
                  path = direktori.root.fullPath + (isAbs ? (isAbsRoot ? "" : path) : ("/" + path));
                  readDir(path, callback);

                },

                function () { callback(new Error("Error read dir")); });

            } else {
              var dummy = [];
              var prefix = "file:///storage/emulated/0"
              for (var i = 0; i < 10; i++) {
                dummy.push({ name : "test-" + i, fullPath : prefix + "/test-" + i, isDirectory : true });
              }

              for (var i = 0; i < 10; i++) {
                dummy.push({ name : "test-" + i, fullPath : prefix + "/test-" + i, isDirectory : false });
              }

              callback(null, dummy);
            }

          }
        }
      }
    }
  }

})(window.direktori);