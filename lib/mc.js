var child = require('child_process');
var q = require('q');
var _ = require('lodash');
var events = require('events');
var util = require('util');
var mcp = require('minecraft-protocol');

function MC(options) {
  events.EventEmitter.call(this);

  this.jarPath_ = options.jarPath;
  this.maxHeap_ = options.maxHeapSize || '1024M';
  this.startingHeap_ = options.startingHeapSize || this.maxHeap_;
  this.stderrBuffer_ = '';
  this.chunker_ = /([0-9\-\: ]+) \[([^\]]*)\] \[([^\]]*)\] ([^\n]*)\n/;
  this.clientName_ = options.clientName;
  this.clientPassword_ = options.clientPassword;
  this.playerList_ = {};
}

util.inherits(MC, events.EventEmitter);

MC.prototype.start = function() {
  var self = this;
  var result;
  var mc;

  if (this.serverStarts_) {
    return this.serverStarts_;
  }

  result = q.defer();

  mc = child.spawn('java', ['-Xmx' + this.maxHeap_,
                                  '-Xms' + this.startingHeap_,
                                  '-jar',
                                  this.jarPath_,
                                  'nogui']);

  mc.stderr.on('data', function checkDone(data) {
    if (/Done \([0-9ms\.]*\)!/.test(data.toString())) {
      mc.stderr.removeListener('data', checkDone);
      result.resolve(self.onServerStarted_());
    }
  });

  mc.stderr.on('data', _.bind(this.parseStderr_, this));

  mc.on('exit', _.bind(function(code) {
    this.log_('Server exited with code:', code);
    mc.removeAllListeners();
    mc.stdout.removeAllListeners();
    mc.stderr.removeAllListeners();
    result.resolve();
  }, this));

  this.mc_ = mc;
  this.serverStarts_ = result.promise;

  this.log_('Starting new server instance..');

  return this.serverStarts_;
};

MC.prototype.stop = function() {
  if (this.serverStarts_) {
    return this.serverStarts_.then(_.bind(function() {
      this.log_('Stopping server..');

      if (this.mc_) {
        this.mc_.kill();
      }

      if (this.client_) {
        this.client_.removeAllListeners();
      }

      this.mc_ = null;
      this.client_ = null;
      this.serverStarts_ = null;
    }, this));
  }

  return q.resolve();
};

MC.prototype.onServerStarted_ = function() {
  var result = q.defer();

  this.log_('Server started.');

  this.stderrBuffer_ = '';

  this.log_('Creating a new client:', this.clientName_);

  this.client_ = mcp.createClient({
    host: 'localhost',
    username: this.clientName_,
    password: this.clientPassword_
  });

  this.client_.once('connect', _.bind(function() {
    result.resolve(this.onClientConnected_());
  }, this));

  return result.promise;
};

MC.prototype.onClientConnected_ = function() {
  this.log_('Client connected.');
  this.client_.on(0x03, _.bind(this.onChat_, this));
  this.client_.on(0xFF, _.bind(this.onClientDisconnected_, this));
  this.client_.on(0xC9, _.bind(this.onPlayerListUpdate_, this));
  this.client_.once(0x00, _.bind(this.onClientHandshakeComplete_, this));
};

MC.prototype.onPlayerListUpdate_ = function(packet) {
  this.log_('Player', packet.playerName, 'is', (packet.online ? 'online.' : 'offline.'));
  this.playerList_[packet.playerName] = packet.online;
  this.emit('playerListUpdate', this.playerList_);
};

MC.prototype.onClientHandshakeComplete_ = function(packet) {
  this.log_('Client handshake completed.');
  this.client_.write(0x03, {
    message: '/gamemode creative'
  });
  this.client_.write(0x03, {
    message: '/tp 0 255 0'
  });
};

MC.prototype.onClientDisconnected_ = function(packet) {
  this.log_('Client disconnected:', packet.reason);
};

MC.prototype.onChat_ = function(packet) {
  var message = packet.message;

  message = message.replace(/^§[0-1a-zA-Z]/, '');

  this.log_('Chat:', message);
  this.emit('chat', message);
};

MC.prototype.parseStderr_ = function(data) {
  var chunk;

  if (data) {
    this.stderrBuffer_ += data.toString();
  }

  chunk = this.chunker_.exec(this.stderrBuffer_);

  if (chunk) {
    this.stderrBuffer_ = this.stderrBuffer_.substring(chunk[0].length,
                                                      this.stderrBuffer_.length);

    this.log_('MC:', chunk[0]);
  }
};

MC.prototype.log_ = function() {
  console.log.apply(console, arguments);
};

MC.prototype.sendMessage = function(message) {
  return this.serverStarts_.then(_.bind(function() {
    this.client_.write(0x03, {
      message: '/say ' + message
    });
  }, this));
};

MC.prototype.getPlayerList = function() {
  return _.clone(this.playerList_);
};

exports = module.exports = MC;



/*function MCEvent(chunk) {
  this.raw = chunk[0];
  this.date = chunk[1];
  this.level = chunk[2].toLowerCase();
  this.sender = chunk[3];
  this.message = chunk[4];

  if (MCEvent.type.CHAT.test(this.message)) {
    this.type = 'chat';
  } else if (MCEvent.type.CONNECTED.test(this.message)) {
    this.type = 'connected';
  } else if (MCEvent.type.DISCONNECTED.test(this.message)) {
    this.type = 'disconnected';
  } else {
    this.type = '';
  }

  this.name = this.level + (this.type ? ':' + this.type : '');
}

MCEvent.type.CHAT = /^<([^\>]*)> /;
MCEvent.type.CONNECTED = /logged in with entity id/;
MCEvent.type.DISCONNECTED = /lost connection\:/;*/


