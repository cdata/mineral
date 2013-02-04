define(['backbone'],
       function(Backbone) {
  return Backbone.Model.extend({
    defaults: {
      nick: undefined
    },
    initialize: function(model, options) {
      this.socket = options.socket;
      this.on('change:nick', this.updateStorage, this);
    },
    updateStorage: function() {
      try {
        localStorage.setItem('userData', JSON.stringify(this.toJSON()));
      } catch(e) {}
    }
  });
});
