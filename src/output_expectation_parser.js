/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var CF,  /* constructor function for this file's pseudo-class */
  PT,  /* prototype alias */
  dCtn = require('./data_containers.js'),
  expect = require('./expect.js'),
  stockRgx = require('./stock_regexps.js'),
  rx = require('./shims.js').ersatzRgxFmt;


CF = function OutputExpectationParser() {
  var oep = this;
  oep.parseLine = function (lt, li) {
    var mode = oep.modes[oep.modes.length - 1];
    mode = oep[mode + 'Ln'];
    lt = lt.replace(CF.trailingSimpleSpace, '');
    if (rx(CF.sourceScaryStuff, lt)) {
      return { srcLnIdx: li, data: new Error('Scary character(s) at position' +
        rx('index') + ' (after "' + JSON.stringify(rx('<')) + ')') };
    }
    return mode.call(oep, lt, li);
  };
  oep.modes = ['src'];
  oep.expectations = [];
};
// util.inherits(CF, events.EventEmitter);
PT = CF.prototype;


CF.trailingSimpleSpace = /[ \t\r]+$/;
CF.sourceScaryStuff = /[\x00-\x06\x08\x0B-\x1A\x1C-\x1F\x7F-\x9F]+/;
CF.simpleCommentLine = /^\s*(?:\/[\/\*]|#\s)(?![=…])/;
CF.outputAnnot = /(?:^|\s)(?:\/{2}|#)=(0|i|…|)(?:\s+([`'"\/~])|\s*$)/;
CF.outputAnnotEndQuot = /(\W)([a-z]*)(?:|\s+\/{2}\s[\S\s]*\S)$/;
CF.outputEndQuotMissing = 'unterminated output expectation literal';
CF.outputApiFn = /^\s*D\.(chap|annot)\s*\(/;
CF.outputApiEndQuot = /["']\s*(?:(\+)$|\)(?:\s*;?|)(?:\s*\/{2}|))/;


PT.toString = function () {
  return '['.concat(this.constructor.name, ' ', this.name, ']');
};


PT.srcLn = function (lt, li) {
  var oep = this;
  if (lt.match(CF.simpleCommentLine)) { return; }
  if (rx(CF.outputAnnot, lt)) {
    li = { srcLnIdx: li, flag: (rx(1) || undefined),
      quot: rx(2), data: rx('>') };
    li.data = PT.unquoteOutputAnnot(li);
    return li;
  }
  if (rx(CF.outputApiFn, lt)) {
    this.merge = { srcLnIdx: li, flag: rx(1), accum: '' };
    oep.modes.push('apiFuncCont');
    return (oep.apiFuncContLn(rx('>'), li) || this.merge);
  }
  // return ['#', lt];
};


PT.unquoteOutputAnnot = function (li) {
  var txt = String(li.data), qt = li.quot, end = rx(CF.outputAnnotEndQuot, txt);
  if (end[1] !== qt) { return new Error(CF.outputEndQuotMissing); }
  delete li.quot;
  txt = rx('<');
  switch (qt) {
  case '/':
  case '~':
    try {
      return new RegExp(txt, end[2]);
    } catch (rgxErr) {
      return new Error('RegExp error in output annotation: ' + String(rgxErr));
    }
    break;
  case '"':
    try {
      return JSON.parse('"' + txt + '"');
    } catch (jsonErr) {
      return new Error('JSON error in output annotation: ' + String(jsonErr));
    }
    break;
  }
  return txt;
};


PT.apiFuncContLn = function (lt, li) {
  var oep = this;
  if (!rx(CF.outputApiEndQuot, lt)) {
    oep.modes.pop();
    lt = new Error(CF.outputEndQuotMissing + ' in ' + lt);
    return { srcLnIdx: li, data: lt };
  }
  li = oep.merge;
  li.accum += rx('<').replace(/^\s*['"]/, '');
  if (rx(1) !== '+') {
    lt = {
      chap: '\n=== \f ===',
      annot: '# \f',
    }[li.flag];
    if (lt) {
      delete li.flag;
      li.data = lt.replace(/\f/g, li.accum);
      delete li.accum;
    } else {
      li.data = new Error('unknown API: D.' + String(li.flag || '<none>'));
    }
    oep.modes.pop();
  }
};


PT.parse = function (src) {
  this.expectations = String(src).split(/\n/
    ).map(this.parseLine
    ).filter(Boolean);
  return this;
};


PT.categorize = function (expList) {
  var output = [], outputLineNum, err = [], magic = {}, add = {};
  add.magic = function (fx, outputLineOffset) {
    return dCtn.pushOnto(outputLineNum + (outputLineOffset || 0), magic, [fx]);
  };
  add.output = function (text) { dCtn.pushOnto(output, text.split(/\n/)); };
  (expList || this.expectations).forEach(function (expRec, recIdx) {
    var srcLn;
    outputLineNum = output.length + 1;
    if (!expRec) { return err.push([null, 'bad record', recIdx]); }
    srcLn = +expRec.srcLnIdx;
    srcLn = ((srcLn > 0) || (srcLn === 0) ? srcLn + 1 : null);
    (function handleData(data) {
      if (data === undefined) { return err.push([srcLn, 'no data', expRec]); }
      if (data instanceof Error) {
        return err.push([srcLn, String(data.message || data)]);
      }
      if (data instanceof RegExp) {
        switch (data.source) {
        case '$:expectFail@':
          data = expect.failedWherePrefix + '(error location)';
          // ^- Redundant only if the side effects of output transforms are
          //    applied. At time of parsing, we shouldn't assume that yet.
          add.magic(['replace-line-regexp', expect.failedWhereRegexp, data]);
          add.magic(['skip-lines-equal-to', '', 1], 1);
          break;
        default:
          add.magic(['replace-line-regexp', data]);
        }
        data = String(data);
      }
      if ((typeof data) === 'string') { return add.output(data); }
      return err.push([srcLn, 'unsupported data', expRec]);
    }(expRec.data));
    (function handleFlag(flag) {
      switch (flag) {
      case undefined:
        break;
      case '0':
        return add.magic(['replace-each', stockRgx.number, '0']);
      default:
        return err.push([srcLn, 'unsupported flag', flag]);
      }
    }(expRec.flag));
  });
  return { expectedOutput: output, parseErrors: err, outputMagic: magic };
};


CF.describeParseError = function descrErr(perr) {
  if (Array.isArray(perr.parseErrors)) { perr = perr.parseErrors; }
  if (Array.isArray(perr[0])) { return perr.map(descrErr); }
  perr.lnum = perr.shift();
  return '@' + perr.lnum + ': ' + perr.join(' | ');
};
CF.describeParseError.preview = function (perr, limit, intro) {
  if (perr.length === 0) { return false; }
  if (intro === undefined) { intro = 'Errors while parsing source file:'; }
  intro = [intro].concat(CF.describeParseError(perr.slice(0, limit)));
  limit = perr.length - limit;
  if (limit > 0) { intro[intro.length] = '+' + limit + ' more'; }
  return intro;
};














module.exports = CF;
