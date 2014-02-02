window.direktori = {
  version: '0.0.1'
};

(function(direktori) {

  var readyCallbacks = [];

  direktori.Platform = {
    isCordova: function() {
      return !(!window.cordova && !window.PhoneGap && !window.phonegap);
    } 
  }

  function simulateDeviceReady () {
    window.setTimeout(function() {
    var e = document.createEvent('Events'); 
      e.initEvent("deviceready"); 
      document.dispatchEvent(e);
    }, 1000);
  }

  function onWindowLoad () {
    if (!direktori.Platform.isCordova()) {
      simulateDeviceReady();
    } 
    window.removeEventListener("load", onWindowLoad, false);
  }

  window.addEventListener("load", onWindowLoad, false);

})(window.direktori);