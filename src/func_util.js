﻿/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = exports, fs = require('fs'),
  arrSlc = Function.call.bind(Array.prototype.slice);


EX.identity = function (x) { return x; };
EX.noop = function () { return; };


EX.bindIfMethodName = function (mthd, obj) {
  return ((obj
    && ((typeof mthd) === 'string')
    && ((typeof obj[mthd]) === 'function')
    && obj[mthd].bind(obj)
    ) || mthd);     // if it wasn't a method name, return mthd unchanged.
};


EX.bindCall = function (obj, mthd, bindArgs) {
  mthd = EX.bindIfMethodName(mthd, obj);
  if ((typeof mthd) !== 'function') {
    throw new Error('Cannot .bind .call on a non-function!');
  }
  if (Array.isArray(bindArgs)) {
    mthd = Function.bind.apply(mthd, [obj].concat(bindArgs));
  }
  return Function.call.bind(mthd);
};


EX.catch = function (dare, ctx, convert) {
  if (ctx === undefined) { ctx = null; }
  dare = EX.bindIfMethodName(dare, ctx);
  return function catchAndReturnError() {
    try {
      return dare.apply(ctx, arguments);
    } catch (err) {
      return (convert ? convert(err) : err);
    }
  };
};
EX.err2str = function (dare, ctx) { return EX.catch(dare, ctx, String); };


EX.bindFuncIfArray = function (func) {
  if ((typeof func) === 'function') { return func; }
  if (Array.isArray(func)) {
    func[0] = EX.bindIfMethodName(func[0], func[1]);
    if ((typeof func[0]) === 'function') {
      return Function.bind.apply(func[0], func.slice(1));
    }
  }
  throw new TypeError('Expected function or array!');
};


EX.splitClbk = function (workFunc, onSuccess, onError) {
  var splitter;
  onError = EX.bindFuncIfArray(onError);
  onSuccess = EX.bindFuncIfArray(onSuccess);
  splitter = function callbackErrorSplitter(err) {
    if (err) { return onError(err); }
    return onSuccess.apply(null, arrSlc(arguments, 1));
  };
  if (!workFunc) { return splitter; }
  return EX.bindFuncIfArray(workFunc)(splitter);
};


EX.readFileOr = function (fileArgs, recvData, recvErr) {
  if ((typeof fileArgs) === 'string') { fileArgs = [fileArgs, 'utf-8']; }
  return EX.splitClbk(['readFile', fs].concat(fileArgs), recvData, recvErr);
};


EX.delayDelivery = function (storedArgs) {
  storedArgs = arrSlc(arguments);
  storedArgs.from = (new Error('dummy')).stack.split(/\n\s*at\s+/).slice(1);
  return function (cb) {
    var dynArgs = arrSlc(arguments, 1);
    if ((typeof cb) !== 'function') {
      dynArgs = 'Cannot deliver args to non-function: ' + String(cb);
      dynArgs = [dynArgs, storedArgs.from].join('\n  ^--');
      throw new TypeError(dynArgs);
    }
    return cb.apply(null, storedArgs.concat(dynArgs));
  };
};


EX.arrayStripSharedPrefix = function (a, b) {
  var shifted = 0;
  while ((a.length > 0) && (b.length > 0) && (a[1] === b[1])) {
    a.shift();
    b.shift();
    shifted += 1;
  }
  if (shifted) { a[0] = b[0] = '…[' + shifted + ']…'; }
};
















/*scroll*/
