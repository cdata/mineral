define(
  ['backbone', 'underscore', 'jquery', 'mineral/view/chat', 'mineral/view/players', 'io', 'mineral/model/user'],
  function(Backbone, _, $, ChatView, PlayersView, io, UserModel) {
    return Backbone.Router.extend({
      initialize: function() {
        var socket = this.socket = io.connect();
        var userData;

        try {
          userData = JSON.parse(localStorage.getItem('userData'));
        } catch(e) {}

        this.model = new UserModel(userData, {
          socket: socket
        });
        this.chatView = new ChatView({
          model: this.model,
          socket: socket
        });
        this.playersView = new PlayersView({
          model: this.model,
          socket: socket
        });

        $('#Chat').append(this.chatView.render().$el);
        $('#Players').append(this.playersView.render().$el);
      }
    });
  });
