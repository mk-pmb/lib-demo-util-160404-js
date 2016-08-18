/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = exports, D = require('../')(module), ignVar = Array.bind(null, 0),
  fs = require('fs'),
  trafo = require('../src/output_transforms.js').transformOutput,
  MethodChain = require('../src/method_chain.js'),
  OutputExpectationParser = require('../src/output_expectation_parser.js');


EX.runFromCLI = function () {
  var srcFn = D.argv.shift(), chain;
  chain = new MethodChain(EX, [
    fs.readFile.bind(fs, srcFn, 'utf-8'),
    'parseSource',
  ].concat(D.argv), EX.report);
  chain.name = 'readxpct: ' + srcFn;
  chain.next();
};


EX.parseSource = function scan(chainNext) {
  var srcText = chainNext.methodChain.data(),
    categs = (new OutputExpectationParser()).parse(srcText).categorize();
  if (categs) { chainNext.methodChain.data(categs); }
  return chainNext(categs.parseErrors.length === 0 ? null
    : new Error('Errors while parsing source file'));
};


EX.report = function (err, data) {
  if (err instanceof Function) {
    data = err;
    err = null;
  }
  if (err) { return console.error('-ERR', err); }
  data = (data || false);
  data = (data.methodChain || data);
  if (data instanceof MethodChain) { data = data.data(); }
  console.log('+OK', data);
};


EX.printAndQuit = function (chainNext) {
  var data = chainNext.methodChain.data();
  if (data instanceof Array) { data = data.join('\n'); }
  console.log(data);
};


EX.getMagic = function (chainNext) {
  chainNext(null, chainNext.methodChain.data().magic);
};


EX.readOutputFile = function (chainNext) {
  var mtc = chainNext.methodChain, fn = mtc.shiftTodo();
  fs.readFile(fn, 'utf-8', function recvOutput(readErr, actual) {
    var lastLn;
    if (readErr) { return chainNext(readErr); }
    actual = actual.split(/\n/);
    lastLn = actual.pop();
    if (lastLn !== '') {
      actual.push(lastLn, "\\ no trailing newline");
    }
    mtc.data().actualOutput = actual;
    chainNext(null);
  });
};


EX.transformOutput = function (chainNext) {
  var data = chainNext.methodChain.data(), transformed, err = null;
  try {
    transformed = trafo(data.actualOutput, data.outputMagic);
    data.actualOutput = transformed;
  } catch (transErr) {
    err = transErr;
  }
  return chainNext(err);
};


EX.compareOutputs = function (chainNext) {
  var data = chainNext.methodChain.data(), cmp = [], add,
    expected = data.expectedOutput, actual = data.actualOutput,
    sideEffects = (actual.sideEffects || false);
  add = function (pfx, ln) { cmp.push(pfx + ln); };
  expected.forEach(function (expLn, lnIdx) {
    var actLn = actual[lnIdx], sfx = (sideEffects[lnIdx + 1] || false);
    if (sfx.overrideExpect !== undefined) { expLn = sfx.overrideExpect; }
    if (actLn === expLn) { return add('=', expLn); }
    add('-', expLn);
    if (actLn !== undefined) { add('+', actLn); }
  });
  if (actual.length > expected.length) {
    actual.slice(expected.length).map(function (ln) { add('+', ln); });
  }
  chainNext(null, cmp);
};



























if (require.main === module) { EX.runFromCLI(); }
