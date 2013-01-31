define(['underscore', 'backbone', 'handlebars/templates'],
    function(_, Backbone, templates) {
  var View = Backbone.View.extend({
    templateName: '',
    dispose: function() {
      this.undelegateEvents();
      this.remove();
    },
    delegateEvents: function() {
      Backbone.View.prototype.delegateEvents.apply(this, arguments);

      if (this.modelBindings && this.model) {
        _.each(this.modelBindings, function(method, event) {
          this.model.on(event, this[method], this);
        }, this);
      }
    },
    undelegateEvents: function() {
      Backbone.View.prototype.undelegateEvents.apply(this, arguments);

      if (this.modelBindings && this.model) {
        _.each(this.modelBindings, function(method, event) {
          this.model.off(event, this[method], this);
        }, this);
      }
    },
    render: function() {
      if (this.templateName) {
        var template = templates[this.templateName];
        var data = this.model ? this.model.toJSON() : {};
        this.$el.html(template(data));
      }
      return this;
    }
  });

  _.extend(View.prototype, Backbone.Events);

  return View;
});
