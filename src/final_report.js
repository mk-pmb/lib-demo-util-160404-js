/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = exports, pathLib = require('path');

EX.exitCodeTestsFailed = 3;

EX.ok = function (mod) {
  var D = this, ok = true;
  if (!D.expect) { throw new Error('no D.expect in ' + String(D)); }
  if (D.expect.failCnt !== 0) { ok = false; }
  if (mod === process.exit) {
    if (ok || D.ok.hadFailMsg) { return ok; }
    mod = null;
  }
  mod = (mod || D.currentModule);
  mod = (mod.name || mod);
  if (mod.filename) { mod = pathLib.basename(String(mod.filename), '.js'); }
  mod = (mod || '<no module>');
  if (ok) {
    console.log('+OK all ' + mod + ' tests passed.');
  } else {
    console.error('-ERR some ' + mod + ' tests failed.');
    D.ok.hadFailMsg = true;
  }
  return ok;
};

EX.ok.setupVerifyOnExit = function (D) {
  process.on('exit', function libDemo_verifyOnExit() {
    if (!D.ok(process.exit)) { process.exit(EX.exitCodeTestsFailed); }
  });
};
