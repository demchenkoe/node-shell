var exec, path;
path = require('path');
exec = require('child_process').exec;
module.exports = function(settings) {
  var shell, _ref, _ref2;
  if (!settings.shell) {
    throw new Error('No shell provided');
  }
  shell = settings.shell;
    if ((_ref = settings.workspace) != null) {
    _ref;
  } else {
    settings.workspace = shell.project_dir;
  };
  if (!settings.workspace) {
    throw new Error('No workspace provided');
  }
    if ((_ref2 = settings.glob) != null) {
    _ref2;
  } else {
    settings.glob = 'test/*.js';
  };
  shell.cmd('test', 'Run all test', function(req, res, next) {
    var p, paths, run, _i, _len;
    run = function(cmd) {
      var args, expresso;
      args = [];
      args.push(cmd);
      if (settings.coverage) {
        args.push('--cov');
      }
      if (settings.serial) {
        args.push('--serial');
      }
      if (settings.glob) {
        args.push(settings.glob);
      }
      expresso = exec('cd ' + settings.workspace + ' && ' + args.join(' '));
      expresso.stdout.on('data', function(data) {
        return res.cyan(data);
      });
      expresso.stderr.on('data', function(data) {
        return res.magenta(data);
      });
      return expresso.on('exit', function(code) {
        return res.prompt();
      });
    };
    paths = [].concat(module.paths, require.paths);
    for (_i = 0, _len = paths.length; _i < _len; _i++) {
      p = paths[_i];
      if (path.existsSync(p + '/expresso/bin/expresso')) {
        return run(p);
      }
    }
    res.magenta('Expresso not found');
    return res.prompt();
  });
  return shell.cmd('test :pattern', 'Run specific tests', function(req, res, next) {});
};