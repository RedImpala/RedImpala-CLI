var co = require('co');
var thunkify = require('thunkify');
var question = require('co-prompt');
var fs = require('co-fs');
var redimpala = require('RedImpalaLib');

var password = question.password;
var getFullBackup = thunkify(redimpala.getFullBackup);
var sendToken = thunkify(redimpala.sendToken);

var getToken = function *(email) {
  yield sendToken(email);
  return yield question("What is your token ? ");
}

co(function *() {
  var config = {};
  if (yield fs.exists('config.json')) {
    config = JSON.parse(yield fs.readFile('config.json'));
  }
  var opts = {};
  opts.login = yield question("What is your email ? ");
  if (config[opts.login] && config[opts.login].uki)
    opts.uki = config[opts.login].uki;
  else
    opts.token = yield getToken(opts.login);
  opts.password = yield password("What is your password ? ");
  console.log((yield getFullBackup(opts)).toString());
})();
