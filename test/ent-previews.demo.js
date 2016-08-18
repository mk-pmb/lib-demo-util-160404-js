/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

function addPreview(m, e, s) {
  return (": '" + e + "'," + (s.split(/\S/)[0] || ' ') + '// ' +
    JSON.parse('"' + (m && e) + '"'));
}

var src = String(require('../src/unicode-entities.js')), diffs = [],
  entDefsRgx = /: '([\w\\]+)',?([ \t\/\x7F-\uFFFF]*)/g,
  expected = src.replace(entDefsRgx, addPreview).split(/\n/);

src.split(/\n/).forEach(function (lnTxt, exp) {
  exp = expected[exp];
  if (lnTxt === exp) { return; }
  diffs[diffs.length] = exp;
});


if (diffs.length === 0) {
  console.log('+OK');   //= `+OK`
} else {
  console.log((diffs.length > 5 ? expected : diffs).join('\n'));
  console.error('-ERR Found ' + diffs.length + ' missing or odd previews.');
  process.exit(diffs.length);
}
