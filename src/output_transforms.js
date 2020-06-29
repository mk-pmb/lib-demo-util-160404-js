/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = exports,
  dCtn = require('./data_containers.js'),
  typeChecks = require('./type_checks.js'),
  rgxEsc = require('./quotes.js').rgxEsc,
  rgxFmt = require('./ersatz_rgxfmt.js');


EX.transformOutput = function (actual, magic) {
  var transformed, lineNum = 0, lineText, sfxByLnum = {};
  actual = actual.slice();
  transformed = [];
  while (actual.length > 0) {
    lineNum += 1;
    lineText = EX.transformOneLine(lineNum, magic, actual.shift(),
      actual, sfxByLnum);
    if (lineText !== false) {
      transformed = transformed.concat(lineText);
    }
  }
  if (dCtn.hasKeys(sfxByLnum)) { transformed.sideEffects = sfxByLnum; }
  return transformed;
};


EX.transformOneLine = function (lineNum, magics, text, nextLines, sfxByLnum) {
  var lineSfx = {};
  magics = magics[lineNum];
  if (!magics) { return text; }
  magics.forEach(function (mg) {
    text = EX.applyOneMagic(text, mg, nextLines, lineSfx);
  });
  if (dCtn.hasKeys(lineSfx)) { sfxByLnum[lineNum] = lineSfx; }
  return text;
};


EX.applyOneMagic = function (text, magic, nextLines, sideEffects) {
  var spell = magic[0], func, extras = { nxLn: nextLines, sfx: sideEffects };
  if ((typeof text) !== 'string') { return text; }
  if ((typeof spell) !== 'string') {
    throw new Error('First item of a magic transformation should be its name '
      + 'as a string, not (' + (typeof spell) + ')' + JSON.stringify(spell));
  }
  func = EX['apply' + spell.replace(/\-?\b([a-z])/g,
    function (m, letter) { return m && letter.toUpperCase(); })];
  if ((typeof func) === 'function') {
    text = func.apply(extras, [text].concat(magic.slice(1)));
    if (extras.sfx) { magic.sfx = extras.sfx; }
    return text;
  }
  throw new Error('Unknown magic transformation: ' + JSON.stringify(spell));
};


EX.applySkipLine = function () { return false; };


EX.applyReplaceLineRegexp = function (text, rplWhat, rplWith) {
  if (!(rplWhat instanceof RegExp)) {
    return (text === rplWhat ? rplWith : text);
  }
  var match = rgxFmt(rplWhat, text);
  if (match === false) { return 'nomatch: ' + text; }
  if (typeChecks.isSet(rplWith)) {
    // use custom template, override the one in the regexp if any
    match = rgxFmt(rplWith, rgxFmt.prevMatch);
  }
  this.sfx.overrideExpect = match;
  return match;
};


EX.applyReplaceEach = function (text, rplWhat, rplWith) {
  if (rplWhat instanceof RegExp) {
    if (typeChecks.notSet(rplWith)) { rplWith = rgxFmt.bind(null, rplWhat); }
    rplWhat = rplWhat.source;
  } else {
    rplWhat = rgxEsc(rplWhat);
  }
  rplWith = text.replace(new RegExp(rplWhat, 'g'), rplWith);
  if (rplWith === text) { return 'nomatch: ' + String(rplWhat); }
  return rplWith;
};


EX.applySkipLinesEqualTo = function (text, equalText, maxSkips) {
  var nextLines = this.nxLn;
  while ((text === equalText) && (maxSkips > 0)) {
    text = nextLines.shift();
    maxSkips -= 1;
    if (text === undefined) { return false; }
  }
  return text;
};

















/*scroll*/
