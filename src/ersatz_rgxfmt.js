/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

function ersatzRgxFmt(rgx, txt) {
  var m = ((arguments.length === 1) && (typeof rgx));
  if ((m === 'string') || (m === 'number')) {
    m = ersatzRgxFmt.prevMatch[rgx];
    return (m || (m === 0) || (m === '') ? m : false);
  }
  if (Array.isArray(txt)) {
    m = txt;
  } else {
    m = String(txt).match(rgx);
    ersatzRgxFmt.prevMatch = (m || false);
    if (!m) { return false; }
    if ((typeof m.index) === 'number') {
      m['<'] = m.before = txt.slice(0, m.index);
      m['>'] = m.after = txt.slice(m.index + m[0].length);
    }
    txt = m;
  }
  if (rgx instanceof RegExp) {
    rgx = String(rgx).split(/\|\$:|\/[a-z]*$/);
    rgx = ((rgx.length > 2) ? rgx[rgx.length - 2] : false);
  }
  if ((typeof rgx) === 'string') {
    txt = rgx.replace(/\$([0-9<>\$])/g, function (mtc, grp) {
      if (mtc === '$$') { return grp; }
      return (txt[grp] || '');
    });
  }
  if (((txt && typeof txt) === 'object') && (txt.length === 1)) {
    txt = txt[0];
  }
  ersatzRgxFmt.prevResult = m['='] = txt;
  return txt;
}












module.exports = ersatzRgxFmt;
