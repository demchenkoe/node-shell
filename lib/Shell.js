// Generated by CoffeeScript 1.4.0
var EventEmitter, Interface, Request, Response, Shell, events, readline, styles, util, utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

util = require('util');

readline = require('readline');

events = require('events');

EventEmitter = events.EventEmitter;

utils = require('./utils');

styles = require('./Styles');

Request = require('./Request');

Response = require('./Response');

Interface = require('readline').Interface;

Interface.prototype.setPrompt = (function(parent) {
  return function(prompt, length) {
    var args;
    args = Array.prototype.slice.call(arguments);
    if (!args[1]) {
      args[1] = styles.unstyle(args[0]).length;
    }
    return parent.apply(this, args);
  };
})(Interface.prototype.setPrompt);

module.exports = Shell = (function(_super) {

  __extends(Shell, _super);

  function Shell(settings) {
    var _base, _base1, _base2, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6,
      _this = this;
    if (settings == null) {
      settings = {};
    }
    if (!(this instanceof Shell)) {
      return new Shell(settings);
    }
    EventEmitter.call(this);
    this.tmp = {};
    this.settings = settings;
    if ((_ref = (_base = this.settings).prompt) == null) {
      _base.prompt = '>> ';
    }
    if ((_ref1 = (_base1 = this.settings).stdin) == null) {
      _base1.stdin = process.stdin;
    }
    if ((_ref2 = (_base2 = this.settings).stdout) == null) {
      _base2.stdout = process.stdout;
    }
    this.set('env', (_ref3 = (_ref4 = this.settings.env) != null ? _ref4 : process.env.NODE_ENV) != null ? _ref3 : 'development');
    this.set('command', typeof settings.command !== 'undefined' ? settings.command : process.argv.slice(2).join(' '));
    this.stack = [];
    this.styles = styles({
      stdout: this.settings.stdout
    });
    process.on('beforeExit', function() {
      return _this.emit('exit');
    });
    process.on('uncaughtException', function(e) {
      _this.emit('exit', [e]);
      _this.styles.red('Internal error, closing...').ln();
      console.error(e.message);
      console.error(e.stack);
      return process.exit();
    });
    this.isShell = (_ref5 = this.settings.isShell) != null ? _ref5 : process.argv.length === 2;
    if (this.isShell) {
      this["interface"]();
    }
    if ((_ref6 = settings.workspace) == null) {
      settings.workspace = utils.workspace();
    }
    if (settings.chdir === true) {
      process.chdir(settings.workspace);
    }
    if (typeof settings.chdir === 'string') {
      process.chdir(settings.chdir);
    }
    process.nextTick(function() {
      var command, noPrompt;
      if (_this.isShell) {
        command = _this.set('command');
        noPrompt = _this.set('noPrompt');
        if (command) {
          return _this.run(command);
        } else if (!noPrompt) {
          return _this.prompt();
        }
      } else {
        command = _this.set('command');
        if (command) {
          return _this.run(command);
        }
      }
    });
    return this;
  }

  Shell.prototype["interface"] = function() {
    if (this._interface != null) {
      return this._interface;
    }
    return this._interface = readline.createInterface(this.settings.stdin, this.settings.stdout);
  };

  Shell.prototype.configure = function(env, fn) {
    if (typeof env === 'function') {
      fn = env;
      env = 'all';
    }
    if (env === 'all' || env === this.settings.env) {
      fn.call(this);
    }
    return this;
  };

  Shell.prototype.use = function(handle) {
    if (handle) {
      this.stack.push({
        route: null,
        handle: handle
      });
    }
    return this;
  };

  Shell.prototype.cmds = {};

  Shell.prototype.run = function(command) {
    var index, next, req, res, self;
    command = command.trim();
    this.emit('command', [command]);
    this.emit(command, []);
    self = this;
    req = new Request(this, command);
    res = new Response({
      shell: this,
      stdout: this.settings.stdout
    });
    index = 0;
    next = function(err) {
      var arity, layer, text;
      layer = self.stack[index++];
      if (!layer) {
        if (err) {
          return self.emit('error', err);
        }
        if (command !== '') {
          text = "Command failed to execute " + command;
          if (err) {
            text += ": " + (err.message || err.name);
          }
          res.red(text);
        }
        return res.prompt();
      }
      arity = layer.handle.length;
      if (err) {
        if (arity === 4) {
          self.emit('error', err);
          return layer.handle(err, req, res, next);
        } else {
          return next(err);
        }
      } else if (arity < 4) {
        return layer.handle(req, res, next);
      } else {
        return next();
      }
    };
    return next();
  };

  Shell.prototype.set = function(setting, val) {
    if (!(val != null)) {
      if (this.settings.hasOwnProperty(setting)) {
        return this.settings[setting];
      } else if (this.parent) {
        return this.parent.set(setting);
      }
    } else {
      this.settings[setting] = val;
      return this;
    }
  };

  Shell.prototype.prompt = function() {
    var text;
    if (this.isShell) {
      text = this.styles.raw(this.settings.prompt, {
        color: 'green'
      });
      return this["interface"]().question(text, this.run.bind(this));
    } else {
      this.styles.ln();
      if (process.versions) {
        return this.quit();
      } else {
        this.settings.stdout.destroySoon();
        return this.settings.stdout.on('close', function() {
          return process.exit();
        });
      }
    }
  };

  Shell.prototype.quit = function(params) {
    this.emit('quit');
    this["interface"]().close();
    return this.settings.stdin.destroy();
  };

  return Shell;

})(EventEmitter);
