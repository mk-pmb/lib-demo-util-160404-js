/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';


function shortenStackTrace(err, opts) {
  if (!opts) { opts = false; }
  if ((typeof err) !== 'string') { err = err.stack; }
  err = err.replace(/\n\s+at\s+/g, '\n');
  err = err.replace(/\n[\x00-\.0-\[\]-\uFFFF]+$/, ''
    /* ^- trailing lines with not slash or backslash,
          probably noode-internal modules. */);
  err = err.substr(err.indexOf(')\n') + 2, err.length
    /* ^- strip error message and first caller */);
  if ((typeof opts.nicePaths) === 'function') {
    err = err.replace(/\s+\(\S+\)(\n|$)/g, function (m) {
      m = String(m).replace(/^\s+\(/, '').split(/(:[:0-9]+|)(\))(\n*)$/);
      m[0] = opts.nicePaths(m[0]);
      return ' (' + m.join('');
    });
  }
  return err.replace(/(^|\n)Object\.<anonymous> \(/g, '$1('
    ).replace(/\n/g, ' \u2190 ');
}





module.exports = shortenStackTrace;
