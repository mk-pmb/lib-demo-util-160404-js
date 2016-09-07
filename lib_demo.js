/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var CF, PT,
  defaultDescribe = require('./src/describe.js'),
  expect = require('./src/expect.js'),
  funcUtil = require('./src/func_util.js'),
  hrPath = require('./src/hrpath.js'),
  pathLib = require('path'),
  shortenStackTrace = require('./src/shorten_stack_trace.js'),
  mixins = {
    dataContainers: require('./src/data_containers.js'),
    ent: require('./src/unicode-entities.js'),
    finalReport: require('./src/final_report.js'),
    funcUtil: funcUtil,
    logwrap: require('./src/logwrap.js'),
    quotes: require('./src/quotes.js'),
    shims: require('./src/shims.js'),
    stockRgx: { stockRgx: require('./src/stock_regexps.js') },
    typeChecks: require('./src/type_checks.js'),
  };

CF = function LibDemoUtil160404(opts) {
  var D = this;
  if (PT.notType(this, CF)) { return new CF(opts); }
  if (!opts) { opts = false; }
  if ((opts && typeof opts) === 'object') {
    if ((typeof opts.filename) === 'string') { opts = { currentModule: opts }; }
  }
  D.currentModule = opts.currentModule;
  D.argv = (opts.argv || process.argv.slice(2));
  D.describe = function (x) { return defaultDescribe(x, D.describe); };
  D.describe.previewMaxLen = +(opts.describePreviewMaxLen
    || D.npmEnvPkgCfg('DemoUtil160404_previewMaxLen') || 80);
  CF.furnish(D);
  return D;
};
PT = CF.prototype;


PT.toString = function identifyLibDemoUtil(sub) {
  return '[LibDemoUtil160404' + (sub || '') + ']';
};
PT.chap = function (title) { console.log('\n=== ' + title + ' ==='); };
PT.annot = function (hint) { console.log('# ' + hint); };

PT.nodeModulesDir = pathLib.normalize(pathLib.join(module.filename,
  '..', '..', '..'));

Object.keys(mixins).forEach(function (destKey) {
  var mxn = mixins[destKey];
  if ((typeof mxn) === 'object') { return Object.assign(PT, mxn); }
  PT[destKey] = mxn;
});


CF.furnish = function (D) {
  var tmp;
  D.result = 'Put results here';

  D.catch = funcUtil.catch.bind(null, 'result', D);

  D.hrPath = function (p) { return hrPath(p, D.hrPath); };
  D.hrPath.prefixAliases = tmp = {};
  tmp[PT.nodeModulesDir] = D.toString();
  D.hrPath.fileAliases = tmp = {};
  tmp[module.filename] = D.toString();
  D.shortenStackTrace = function (err) {
    return shortenStackTrace(err, { nicePaths: D.hrPath });
  };

  D.expect = function (expCrit, expData, expWhere) {
    if (!expWhere) { expWhere = D.shortenStackTrace(new Error('dummy')); }
    return expect(D, expCrit, expData, expWhere);
  };
  Object.assign(D.expect, expect, { failCnt: 0, maxFails: 0,
    verbose: false });
  D.ok.setupVerifyOnExit(D);

  return D;
};

















module.exports = function libDemoFactory(opts) { return new CF(opts); };
