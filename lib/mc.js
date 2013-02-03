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
    if (/\[INFO\] \[Minecraft\] Done \([0-9ms\.]*\)!/.test(data.toString())) {
      mc.stderr.removeListener('data', checkDone);
      result.resolve(self.onServerStarted_());
    }
  });

  mc.on('exit', _.bind(function() {
    result.resolve();
    this.stop();
  }, this));

  this.mc_ = mc;
  this.serverStarts_ = result.promise;

  return this.serverStarts_;
};

MC.prototype.stop = function() {
  if (this.serverStarts_) {
    return this.serverStarts_.then(_.bind(function() {
      if (this.mc_) {
        this.mc_.kill();
        this.mc_.removeAllListeners();
        this.mc_.stdout.removeAllListeners();
        this.mc_.stderr.removeAllListeners();
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

  this.stderrBuffer_ = '';
  this.client_ = mcp.createClient({
    host: 'localhost',
    username: this.clientName_,
    password: this.clientPassword_
  });

  this.mc_.stderr.on('data', _.bind(this.parseStderr, this));
  this.client_.once('connect', _.bind(function() {
    result.resolve(this.onClientConnected_());
  }, this));

  return result.promise;
};

MC.prototype.onClientConnected_ = function() {
  this.client_.on(0x03, _.bind(this.onChatPacket_, this));
};

MC.prototype.onChatPacket_ = function(packet) {
  this.emit('chat', packet.message);
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

    console.log('MC:', chunk[0]);
  }
};

MC.prototype.sendMessage = function(message) {
  return this.serverStarts_.then(_.bind(function() {
    this.client_.write(0x03, {
      message: message
    });
  }, this));
};

MC.prototype.listPlayers = function() {
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


