var co = require('co');
var thunkify = require('thunkify');
var question = require('co-prompt');
var fs = require('co-fs');
var redimpala = require('RedImpalaLib');
var repl = require('repl');
var crypto = require('crypto');
var uuid = require('uuid');

var password = question.password;
var getFullBackup = thunkify(redimpala.getFullBackup);
var sendToken = thunkify(redimpala.sendToken);
var registerUKI = thunkify(redimpala.registerUKI);
var getPassword = thunkify(redimpala.getPassword);

co(function *() {
  var config = {};
  if (yield fs.exists('config.json')) {
    config = JSON.parse(yield fs.readFile('config.json'));
  }
  var opts = {};
  opts.login = yield question("What is your email ? ");
  if (config[opts.login] && config[opts.login].uki)
    opts.uki = config[opts.login].uki;
  else {
    // Generate UKI and save it in config.
    if (!config[opts.login])
      config[opts.login] = {};
    var tmp = yield [question("What is your token ? "), sendToken(opts.login)];
    var form = {
      token: tmp[0],
      login: opts.login,
    };
    var tmp2 = yield registerUKI(form);
    var uki = tmp2[0];
    console.log(tmp2[1]);
    config[opts.login].uki = opts.uki = uki;
    yield fs.writeFile('config.json', JSON.stringify(config));
  }
  opts.password = yield password("What is your password ? ");
  var backupstr = yield getFullBackup(opts);
  opts = null; // Attempt to get rid of the in-memory master password.
  while (true) {
    var pass = yield question("Which password do you want ? ");
    console.log(yield getPassword(backupstr, pass));
  }
})();
