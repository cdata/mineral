define(['mineral/view', 'handlebars/templates', 'underscore'],
    function(View, templates, _) {
  return View.extend({
    templateName: 'chat',
    events: {
      'submit form': 'onFormSubmit_'
    },
    initialize: function(options) {
      View.prototype.initialize.apply(this, arguments);

      this.model = options.model;
      this.socket = options.socket;
      this.socket.on('minecraft:chat', _.bind(function(message) {
        this.addChat(message, 'minecraft');
      }, this));

      this.socket.on('mineral:chat', _.bind(function(message) {
        this.addChat(message, 'mineral');
      }, this));

      this.model.on('change:nick', this.onChangeNick_, this);
    },
    render: function() {
      View.prototype.render.apply(this, arguments);

      if (!this.model.has('nick')) {
        this.addChat('Please set your name by typing /nick <nick>', 'system');
      }

      return this;
    },
    onChangeNick_: function() {
      var previous = this.model.previous('nick');
      var nick = this.model.get('nick');

      if (!previous && nick) {
        this.addChat('Nick set to ' + nick, 'system');
      } else if (nick) {
        this.addChat('Nick changed to ' + nick, 'system');
      }
    },
    onFormSubmit_: function(e) {
      e.preventDefault();
      this.sendChat();
    },
    sendChat: function() {
      var $input = this.$('input');
      var text = $input.val();
      var nick = this.model.get('nick');
      var buffer = [];
      var match;
      var nick;

      $input.val('');

      if (/^\/nick/.test(text)) {
        match = /^\/nick ([A-Za-z0-9_]{1,20})/.exec(text);
        nick = match && match[1];

        if (nick) {
          this.model.set('nick', nick);
        } else {
          this.addChat('Valid nicks must be between 1 and 20 characters and contain only alphanumeric characters and underscores.', 'error');
        }
        return;
      }

      if (!this.model.has('nick')) {
        this.askForNick();
        return;
      }

      text = '<' + nick + '> ' + text;

      if (text) {
        while (text.length) {
          this.socket.emit('mineral:chat', text.substr(0, 80));
          text = text.substr(80);
        }
      }
    },
    addChat: function(message, type) {
      $(templates.message({
        message: message,
        type: type,
        date: new Date().toLocaleString()
      })).appendTo(this.$('.log'));
    },
    askForNick: function() {
      this.addChat('Nick not set. Please set with /nick <nick>', 'error');
    }
  });
});
