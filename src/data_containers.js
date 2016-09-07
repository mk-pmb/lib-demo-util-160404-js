/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = exports, ignArg = Array,
  funcUtil = require('./func_util.js'),
  quotes = require('./quotes.js');


EX.arrSlc = Function.call.bind(Array.prototype.slice);
EX.hasOwn = Function.call.bind(Object.prototype.hasOwnProperty);

EX.hasKeys = function (obj, howMany) {
  var keyCnt = Object.keys(obj).length;
  if ((typeof howMany) === 'number') { return (keyCnt === howMany); }
  return (keyCnt > 0);
};


EX.arrayOrConcat = function (x) {
  if (Array.isArray(x)) { return x; }
  return [x].concat(EX.arrSlc(arguments, 1));
};


EX.sorted = function (arr, rule) {
  var srt = [].concat(arr);
  srt.sort(rule);
  return srt;
};
EX.sorted.keys = function (obj, rule) {
  return EX.sorted(Object.keys(obj), rule);
};
EX.sorted.map = function (obj, rule, iter) {
  if (!iter) {
    iter = rule;
    rule = undefined;
  }
  if (Array.isArray(obj)) { return EX.sorted(obj, rule).map(iter); }
  return EX.sorted.keys(obj, rule).map(function (key) {
    return iter(key, obj[key], obj);
  });
};


EX.npmEnvPkgCfg = function (key, dflt) {
  key = process.env['npm_package_config_' + key];
  return (key === undefined ? dflt : key);
};


EX.repeat = function (tmpl, howOften) {
  var rep, cnt;
  rep = (Array.isArray(tmpl) ? [] : '');
  for (cnt = 0; cnt < howOften; cnt += 1) { rep = rep.concat(tmpl); }
  return rep;
};


EX.fancyStrLen = function fancyStrLen(x) {
  if (Array.isArray(x)) { return x.map(fancyStrLen); }
  return String(x).length;
};


EX.setProp = function (obj, key, value) {
  obj[key] = value;
  return obj;
};

EX.getProp = function (obj, key, altnObj) {
  return (obj || altnObj || false)[key];
};
EX.getProp.dflt = function (obj, dflt, key) {
  key = (obj || false)[key];
  return (key === undefined ? dflt : key);
};
EX.getProp.these = function (obj, sel, opt) {
  if (sel === Object) { return obj; }
  if (sel === Array) { return obj.join(opt || ''); }
  if (Array.isArray(sel)) { return sel.map(EX.getProp.from(obj)); }
  return String(sel).replace(EX.getProp.slotsRgx, function (orig, num, key) {
    key = obj[num || key];
    if (key !== undefined) { return key; }
    if ((typeof opt) === 'string') { return opt; }
    return orig;
  });
};
EX.getProp.slotsRgx = /([0-9])|\{(#?[A-Za-z][A-Za-z0-9_]*)\}/g;


EX.getOrAddProp_dop = function (dflt, obj, prop) {
  if (!EX.hasOwn(obj, prop)) {
    switch (dflt) {
    case Object.create:
      dflt = dflt(null);
      break;
    }
    if ((typeof dflt) === 'function') { dflt = dflt(); }
    obj[prop] = dflt;
  }
  return obj[prop];
};


EX.pushOnto = function (prop, arr, values) {
  switch (typeof prop) {
  case 'number':
  case 'string':
    arr = EX.getOrAddProp_dop(Array, arr, prop);
    break;
  case 'object':
    values = arr;
    arr = prop;
    break;
  }
  arr.push.apply(arr, values);
  return arr;
};












/*scroll*/
