/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var pathLib = require('path');

function LibDemoUtil160404(D) {
  D = (D || (this instanceof Object && this) || {});

  D.toString = function identifyLibDemoUtil(sub) {
    return '[LibDemoUtil160404' + (sub || '') + ']';
  };
  D.result = 'Put results here';
  D.exitCodeTestsFailed = 3;

  D.nodeModulesDir = pathLib.normalize(pathLib.join(module.filename,
    '..', '..', '..'));

  D.ent = {
    downwardsZigzagArrow: '\u21af',
    isin: '\u2208',
    ne: '\u2260',
    notin: '\u2209',
    rarr: '\u2192',
    Rarr: '\u21d2',
    rarrWithStroke: '\u219b',
    RarrWithStroke: '\u21cf',
  };

  D.chap = function (title) { console.log('\n=== ' + title + ' ==='); };
  D.annot = function (hint) { console.log('# ' + hint); };

  D.hrPath = function humanReadablePath(p, startEllip, quoteFunc) {
    var preEllip = '', tmp;
    if (quoteFunc === JSON) {
      p = JSON.stringify(p);
      quoteFunc = null;
    }
    if (!(quoteFunc instanceof Function)) { quoteFunc = String; }
    tmp = D.hrPath.fileAliases[p];
    if ((typeof tmp) === 'string') { return quoteFunc(tmp); }
    if ((!startEllip) && (startEllip !== '')) { startEllip = '/…'; }
    tmp = p.replace(/^[\S\s]+(\/(demo)\/)/, '$1');
    if (tmp !== p) {
      p = tmp;
      preEllip = startEllip;
    }
    if (p.substr(0, D.nodeModulesDir.length) === D.nodeModulesDir) {
      p = p.substr(D.nodeModulesDir.length);
      preEllip = startEllip;
    }
    return preEllip + quoteFunc(p);
  };
  D.hrPath.fileAliases = {};


  D.shortenStackTrace = function (err) {
    if ((typeof err) !== 'string') { err = err.stack; }
    err = err.replace(/\n\s+at\s+/g, '\n');
    err = err.replace(/\n[\x00-\.0-\[\]-\uFFFF]+$/, ''
      /* ^- trailing lines with not slash or backslash,
            probably noode-internal modules. */);
    err = err.substr(err.indexOf(')\n') + 2, err.length
      /* ^- strip error message and first caller */);
    err = err.replace(/\s+\(\S+\)(\n|$)/g, function (m) {
      m = String(m).replace(/^\s+\(/, '').split(/(:[:0-9]+|)(\))(\n*)$/);
      m[0] = D.hrPath(m[0], '…');
      return ' (' + m.join('');
    });
    return err;
  };


  D.ok = function (mod) {
    var ok = true;
    if (D.expect.failCnt !== 0) { ok = false; }
    if (mod === process) { return ok; }
    if (mod && mod.filename) {
      mod = pathLib.basename(String(mod.filename), '.js');
    }
    if (!mod) { mod = '??module??'; }
    if (ok) {
      console.log('+OK all ' + mod + ' tests passed.');
    } else {
      console.error('-ERR some ' + mod + ' tests failed.');
    }
    return ok;
  };

  process.on('exit', function libDemo_verifyOnExit() {
    if (!D.ok(process)) { process.exit(D.exitCodeTestsFailed); }
  });


  D.typeOf = function (x) {
    if (x === null) { return 'null'; }
    if (x instanceof Object) {
      switch (Object.getPrototypeOf(x)) {
      case Function.prototype:
        return typeof x;
      case Array.prototype:
        return 'array';
      }
      return Object.prototype.toString.call(x
        ).replace(/^\[object (\S+)\]$/, '$1');
    }
    return typeof x;
  };
  D.typeOf.cls = function (Cls) { return D.typeOf(new Cls()); };


  D.poorMansEllip = function (s, max, end) {
    s = String(s);
    if (1 > +(max || 0)) { max = 72; }
    if (s.length <= max) { return s; }
    if ((!end) && (end !== 0)) { end = 0.5; }
    if (end > 0) {
      if (end < 1) { end = Math.floor(end * max); }
      max -= end;
      end = s.substr(s.length - end, end);
    } else {
      end = '';
    }
    return (s.substr(0, max - 1) + '…' + end);
  };


  D.oneLineJSONify = function (x) {
    return JSON.stringify(x, null, 1).replace(/\n/g, ''
      ).replace(/^(\[|\{) /, '$1');
  };


  D.describe = function (x) {
    if (x instanceof Error) {
      return '(error) ' + JSON.stringify(String(x.message || x));
    }
    var t = D.typeOf(x);
    switch (t) {
    case 'function':
      return D.poorMansEllip(x);
    case 'null':
    case 'undefined':
      return t;
    case 'string':
    case 'object':
    case 'array':
      x = D.oneLineJSONify(x);
      break;
    }
    return '(' + t + ') ' + String(x);
  };


  D.logwrap = function (origFunc) {
    var wrappedFunc;
    wrappedFunc = function () {
      var result;
      try {
        result = origFunc.apply(null, arguments);
        result = '-> ' + D.describe(result);
      } catch (err) {
        result = '!! ' + String(err);
      }
      console.log(result);
    };
    Object.keys(origFunc).forEach(function copyExtraKey(key) {
      if (wrappedFunc[key] === undefined) {
        console.error('Copy key: ' + key);
        wrappedFunc[key] = origFunc[key];
      }
    });
    return wrappedFunc;
  };


  D.expect = function libDemo_expect(expCrit, expData, expWhere) {
    var exp = { fail: '? ??',  crit: expCrit, want: expData, where: expWhere,
      okHint: '', rslt: D.result, rsltDescr: D.describe(D.result) };
    switch (exp.crit) {
    case Error:
    case 'error':
      D.expect.chkError(exp);
      break;
    case 'fails=':
      exp.crit = '===';
      exp.rslt = D.expect.failCnt;
      exp.rsltDescr = 'expect.failCnt = ' + String(exp.rslt);
      break;
    }
    switch (exp.crit) {
    case 'type':
      if ((typeof exp.want) !== 'string') { exp.want = D.typeOf(exp.want); }
      D.expect.chkIsin(exp, D.typeOf(exp.rslt) === exp.want);
      break;
    case '===':
      exp.fail = (exp.rslt === exp.want ? false
        : D.ent.ne + ' ' + D.describe(exp.want));
      break;
    case '!==':
      exp.fail = (exp.rslt !== exp.want ? false : '= ' + D.describe(exp.want));
      exp.okHint = D.ent.ne + ' ' + exp.want;
      break;
    case 'like':
      exp.want = D.describe(exp.want);
      exp.fail = (exp.rsltDescr === exp.want ? false
        : D.ent.ne + ' ' + exp.want);
      break;
    case true:
      exp.fail = false;
      exp.okHint = D.ent.Rarr + ' ' + exp.want;
      break;
    case false:
      exp.fail = D.ent.RarrWithStroke + ' ' + exp.want;
      break;
    case Error:
    case 'error':
      break;    // has been handled above
    default:
      throw new Error('unsupported criterion: ' + D.describe(exp.crit));
    }
    if (exp.fail === false) {
      if (D.expect.verbose) {
        console.log('+ ' + exp.rsltDescr + (exp.okHint && ' ') + exp.okHint);
      }
      return true;
    }
    D.expect.failCnt += 1;
    if (!exp.where) { exp.where = D.shortenStackTrace(new Error('dummy')); }
    console.error(['! ' + exp.rsltDescr, exp.fail, '@ ' + exp.where,
      ''].join('\n'));
    return false;
  };
  D.expect.verbose = false;
  D.expect.failCnt = 0;

  D.expect.resetFailCnt = function () {
    var oldFails = D.expect.failCnt;
    D.expect.failCnt = 0;
    return oldFails;
  };

  D.expect.chkIsin = function (exp, isin, grp) {
    grp = ' {' + (grp || exp.want) + '}';
    if (isin) {
      exp.fail = false;
      exp.okHint = D.ent.isin + grp;
    } else {
      exp.fail = D.ent.notin + grp;
    }
  };

  D.expect.chkError = function (exp) {
    var err = exp.rslt;
    if (!(err instanceof Error)) {
      exp.fail = D.ent.notin + ' {error}';
      return;
    }
    if (exp.want instanceof Function) {
      D.expect.chkIsin(exp, err instanceof exp.want, 'error class ' +
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
      err = err.match(exp.want);
      if (err) {
        exp.fail = false;
        exp.okHint = D.ent.rarr + ' ' + err[0];
      } else {
        exp.fail = D.ent.rarrWithStroke + ' ' + String(exp.want);
      }
      return;
    }
    return { crit: 'like' };
  };


  D.catch = function (provoke) {
    try { D.result = provoke(); } catch (err) { D.result = err; }
  };










  return D;
}

module.exports = function libDemoFactory() { return new LibDemoUtil160404(); };
