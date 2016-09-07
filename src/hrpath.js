/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

function humanReadablePath(p, opts) {
  var tmp;
  if (!opts) { opts = false; }
  tmp = (opts.fileAliases || false)[p];
  if ((typeof tmp) === 'string') { return tmp; }

  if (opts.prefixAliases) {
    Object.keys(opts.prefixAliases).forEach(function (pfx) {
      if (p.substr(0, pfx.length) !== pfx) { return; }
      return opts.prefixAliases[pfx] + p.slice(pfx.length);
    });
  }
  p = p.replace(/^\/[\S\s]+(\/(demo)\/)/, '…$1');
  return p;
}






module.exports = humanReadablePath;
