define(['mineral/view', 'overviewer', 'overviewer/config', 'jquery', 'q', 'underscore'],
       function(View, overviewer, overviewerConfig, $, q, _) {
  return View.extend({
    id: 'mcmap',
    initialize: function() {
      var result = q.defer();

      this.mapsAPILoads = result.promise;

      window.mapsLoaded = function() {
        result.resolve();
        window.mapsLoaded = null;
      };

      _.each(overviewerConfig.tilesets, function(tileSet) {
        tileSet.path = 'overviewer/' + tileSet.path;
      });

      _.each(overviewerConfig.CONST.image, function(path, name) {
        if (!/^http:/.test(path)) {
          overviewerConfig.CONST.image[name] = 'overviewer/' + path;
        }
      });

      overviewerConfig.map.controls.compass = false;
      overviewerConfig.map.controls.mapType = false;
      overviewerConfig.map.controls.coordsBox = false;
      overviewerConfig.map.controls.searchBox = false;

      delete overviewerConfig.map.controls.compass;

      $.getScript('http://maps.googleapis.com/maps/api/js?sensor=false&callback=mapsLoaded');
    },
    render: function() {
      this.mapsAPILoads.then(function() {

        overviewer.util.initialize();
      });
      return this;
    }
  });
});
