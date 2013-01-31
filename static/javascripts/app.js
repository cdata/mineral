define(
  ['backbone', 'underscore', 'jquery', 'mineral/view/map'],
  function(Backbone, _, $, MapView) {
    return Backbone.Router.extend({
      initialize: function() {
        this.mapView = new MapView();
        $('#Map').append(this.mapView.render().$el);
      }
    });
  });
