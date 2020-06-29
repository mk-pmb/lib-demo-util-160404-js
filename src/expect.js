/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';


var EX, uniEnt = require('./unicode-entities.js'),
  origDescribe = require('./describe.js'),
  ersatzRgxFmt = require('./ersatz_rgxfmt.js'),
  isErr = require('is-error'),
  quotes = require('./quotes.js');


function fullyDescribe(x) {
  return origDescribe(x, { previewMaxLen: Number.POSITIVE_INFINITY });
}


EX = function libDemo_expect(D, expCrit, expData, expWhere) {
  var bestDescribe = (D.describe || origDescribe), exp = { fail: '? ??',
    crit: expCrit, want: expData, okHint: '', where: expWhere,
    rslt: D.result, rsltDescr: bestDescribe(D.result) },
    ovrd = (D.expect.overrideCfg || false);
  switch (exp.crit) {
  case 'override':
    D.expect.overrideCfg = expData;
    if ((+expData.ttl || 0) < 1) { expData.ttl = 1; }
    return;
  case Error:
  case 'error':
    EX.chkError(exp);
    break;
  case 'fails=':
    exp.crit = '===';
    exp.rslt = D.expect.failCnt;
    exp.rsltDescr = 'expect.failCnt = ' + String(exp.rslt);
    break;
  case 'reset_fails':
    exp.rslt = D.expect.failCnt;
    exp.rsltDescr = 'expect.failCnt = ' + String(exp.rslt);
    if (exp.want === true) {
      exp.crit = 'type';
      exp.want = 'number';
    } else {
      exp.crit = '===';
      if (exp.rslt === exp.want) {
        D.expect.failCnt = 0;
        exp.rsltDescr += ', reset.';
      }
    }
    break;
  case JSON:
  case 'json':
    exp.crit = '===';
    if (expData instanceof RegExp) { exp.crit = 'regexp'; }
    exp.rslt = quotes.jsonify(exp.rslt, null, 2);
    break;
  }
  switch (exp.crit) {
  case 'type':
    if ((typeof exp.want) !== 'string') { exp.want = D.typeOf(exp.want); }
    EX.chkIsin(exp, D.typeOf(exp.rslt) === exp.want);
    break;
  case '===':
    exp.fail = (exp.rslt === exp.want ? false
      : uniEnt.ne + ' ' + bestDescribe(exp.want));
    break;
  case '!==':
    exp.fail = (exp.rslt !== exp.want ? false : '= ' + bestDescribe(exp.want));
    exp.okHint = uniEnt.ne + ' ' + bestDescribe(exp.want);
    break;
  case 'like':
    exp.fail = (fullyDescribe(exp.rslt) === fullyDescribe(exp.want) ? false
      : uniEnt.ne + ' ');
    exp.want = bestDescribe(exp.want);
    if (exp.fail) { exp.fail += exp.want; }
    break;
  case RegExp:
  case 'regexp':
    exp.okHint = quotes.oneLineJSONify(ersatzRgxFmt(exp.want, exp.rslt));
    if (exp.okHint === false) {
      exp.fail = uniEnt.rarrWithStroke + ' ' + String(exp.want);
    } else {
      exp.fail = false;
      exp.okHint = uniEnt.rarr + ' ' + exp.okHint;
      exp.rsltDescr = exp.rsltDescr.replace(/\s[\S\s]*$/, ' …');
    }
    break;
  case true:
    exp.fail = false;
    exp.okHint = uniEnt.heavyCheckMark + ' ' + exp.want;
    break;
  case false:
    exp.fail = uniEnt.downwardsZigzagArrow + ' disproven: ' + exp.want;
    break;
  case Error:
  case 'error':
    break;    // has been handled above
  case 'strlen':
    exp.rslt = quotes.oneLineJSONify(D.fancyStrLen(exp.rslt));
    exp.rsltDescr = 'strlen ' + exp.rslt;
    exp.want = quotes.oneLineJSONify(exp.want);
    exp.fail = (exp.rslt === exp.want ? false
      : uniEnt.ne + ' ' + exp.want);
    break;
  default:
    throw new Error('unsupported criterion: ' + bestDescribe(exp.crit));
  }
  if (ovrd.ttl > 0) {
    ovrd.ttl -= 1;
    ['where', 'rsltDescr', 'okHint'].map(function (k) {
      if (ovrd[k] !== undefined) { exp[k] = ovrd[k]; }
    });
  }
  if (ovrd.ttl < 1) { D.expect.overrideCfg = false; }
  if (exp.fail === false) {
    if (D.expect.verbose) {
      exp.rslt = '+ ' + exp.rsltDescr + (exp.okHint && ' ') + exp.okHint;
      if (ovrd) { exp.rslt = EX.overrideTransformMsg(ovrd, exp.rslt); }
      console.log(exp.rslt);
    }
    return true;
  }
  D.expect.failCnt += 1;
  exp.fail = '! ' + exp.rsltDescr + '\n' + exp.fail + '\n' +
    (exp.where === false ? '' : EX.failedWherePrefix + exp.where + '\n');
  if (ovrd) { exp.fail = EX.overrideTransformMsg(ovrd, exp.fail); }
  console.error(exp.fail);
  if ((D.expect.maxFails > 0) && (D.expect.failCnt >= D.expect.maxFails)) {
    exp.fail = EX.errMsg.maxFails + ' (' + D.expect.failCnt +
      '/' + D.expect.maxFails + ')';
    throw new Error(exp.fail);
    // ^- Node probably won't print the error b/c that would happen after
    //    D.verifyOnExit, which exit()s.
  }
  return false;
};


EX.failedWherePrefix = uniEnt.blackRightPointingIndex + ' ';
EX.failedWhereRegexp = new RegExp('^' + quotes.rgxEsc(EX.failedWherePrefix)
  + '\\([\\S\\s]+\\)$', '');


EX.errMsg = {
  maxFails: 'Reached maximum number of expectation failures',
};


EX.chkIsin = function (exp, isin, grp) {
  grp = ' {' + (grp || exp.want) + '}';
  if (isin) {
    exp.fail = false;
    exp.okHint = uniEnt.isin + grp;
  } else {
    exp.fail = uniEnt.notin + grp;
  }
};

EX.chkError = function (exp) {
  var err = exp.rslt;
  if (!isErr(err)) {
    exp.fail = uniEnt.notin + ' {error}';
    return;
  }
  if ((typeof exp.want) === 'function') {
    EX.chkIsin(exp, (err instanceof exp.want), 'error class ' +
      (exp.want.name || String(exp.want).split(/[\s\(]+/)[1] || '<anon>'));
    return;
  }
  err = String(err.message || err);
  if ((typeof exp.want) === 'string') {
    exp.crit = '===';
    exp.rslt = err;
    return;
  }
  if (exp.want instanceof RegExp) {
    exp.crit = 'regexp';
    exp.rslt = err;
    return;
  }
  return { crit: 'like' };
};


EX.overrideTransformMsg = function (ovr, msg) { return (ovr && msg); };













module.exports = EX;
