/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = exports;


EX.ersatzRgxFmt = function ersatzRgxFmt(rgx, txt) {
  var m = ((arguments.length === 1) && (typeof rgx));
  if ((m === 'string') || (m === 'number')) {
    m = ersatzRgxFmt.prevMatch[rgx];
    return (m || (m === 0) || (m === '') ? m : false);
  }
  if (txt instanceof Array) {
    m = txt;
  } else {
    m = String(txt).match(rgx);
    ersatzRgxFmt.prevMatch = (m || false);
    if (!m) { return false; }
    if ((typeof m.index) === 'number') {
      m['<'] = m.before = txt.substr(0, m.index);
      m['>'] = m.after = txt.substr(m.index + m[0].length, txt.length);
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
  if ((txt instanceof Object) && (txt.length === 1)) { txt = txt[0]; }
  ersatzRgxFmt.prevResult = m['='] = txt;
  return txt;
};


EX.ersatzEllip = function ersatzEllip(s, max, end) {
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











/*scroll*/
