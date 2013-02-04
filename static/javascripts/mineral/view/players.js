define(['mineral/view', 'underscore'],
    function(View, _) {
  return View.extend({
    templateName: 'players',
    initialize: function(options) {
      this.socket = options.socket;
      this.socket.on('minecraft:players', _.bind(this.setPlayerList, this));
    },
    setPlayerList: function(players) {
      var $list = this.$('ul');
      $list.empty();
      _.each(players, function(online, player) {
        $list.append($('<li>').text(player)
                              .toggleClass('online', online)
                              .toggleClass('icon-chat', online)
                              .toggleClass('icon-moon', !online));
      });
    }
  });
});
