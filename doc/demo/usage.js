/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var D = require('lib-demo-util-160404')(module), tmp = {};
D.expect.verbose = true;
D.hrPath.fileAliases[module.filename] = '<usage demo>';

tmp.hi = 'hello';
D.result =      tmp.hi.substr(0, 4);
D.expect('===', 'hell');    //= `+ (string) "hell"`
D.expect('strlen', 4);      //= `+ (strlen) 4`
D.expect('!==', 'help');    //= `+ (string) "hell" ≠ (string) "help"`
D.expect('fails=', 0);      //= `+ expect.failCnt = 0`

D.chap('Expect violation of an expectation:');
D.expect('===', 'hel');
  //= `! (string) "hell"`
  //= '≠ (string) "hel"'
  //= "☛ (<usage demo>:17:3)"
  //= ""
D.expect('fails=', 1);        //= `+ expect.failCnt = 1`
D.expect('reset_fails', 1);   //= `+ expect.failCnt = 1, reset.`
D.expect('fails=', 0);        //= `+ expect.failCnt = 0`

D.chap('UTF-8 vs. UCS-2:');
D.result = '😇'; // U+01F607 smiling face with halo
D.expect('===', String.fromCodePoint(0x01F607));  //= `+ (string) "😇"`
D.expect('!==', '\u01F607');            //= `+ (string) "😇" ≠ (string) "Ƕ07"`
D.expect('===', '\uD83D\uDE07');        //= `+ (string) "😇"`
D.expect('strlen', D.result.length);    //= `+ (strlen) 2`



D.chap('Data containers:');
D.result = Array.from(tmp.hi);
D.expect('like', ['h', 'e', 'l', 'l', 'o']);
  //= `+ (array) ["h", "e", "l", "l", "o"]`
D.annot('^-- whether our human-readable description of the data looks the ' +
  'same');    // ^-- for test detection, the "+" has to be on ends of lines.
D.expect('type', 'array');
  //= `+ (array) ["h", "e", "l", "l", "o"] ∈ {array}`
D.expect('strlen', [1, 1, 1, 1, 1]);  //= `+ (strlen) [1, 1, 1, 1, 1]`

D.result = { str: ['abc', 'def'], num: [123, -456] };
D.expect('type', 'Object');
  //= `+ (Object) {"str": ["abc", "def"], "num": [123, -456]} ∈ {Object}`

D.result = function noop() { return 'I contain source code!'; };
D.expect('type', 'function');
  //= `+ (function) noop() { return 'I contain source code!'; } ∈ {function}`


D.result = 'ints -> zero: -2 -1 -0 | 0 | +0 +1 +2 | 1 2 345 6789';
D.expect('type', 'string');
  //=0 `+ (string) "ints -> zero: 0 0 0 | 0 | 0 0 0 | 0 0 0 0" ∈ {string}`
D.result = 'floats -> zero: -2.2 -1.1 -0.5 -0.0 | 0.000 | +0.5 +1.1 +2.2';
D.expect('type', 'string');
  //=0 `+ (string) "floats -> zero: 0 0 0 0 | 0 | 0 0 0" ∈ {string}`
D.result = 'exp nums -> zero: -2.2e-2 -1.1E-1 -0e0 | 0.0E0 | 1.1e+1 +2.2e2';
D.expect('type', 'string');
  //=0 `+ (string) "exp nums -> zero: 0 0 0 | 0 | 0 0" ∈ {string}`

D.chap('RegExp matching:');
tmp.rgx = {
  httpErrorTemplate: /^(\d+) ([\S\s]+)$|$:$2 (HTTP $1) <- $0/,
};

D.result = '404 Not Found';
D.expect('regexp', /^\d+/);     //= `+ (string) … → "404"`
D.expect('regexp', /\S+/g);     //= `+ (string) … → ["404", "Not", "Found"]`
D.expect('regexp', tmp.rgx.httpErrorTemplate);
  //= `+ (string) … → "Not Found (HTTP 404) <- 404 Not Found"`


D.chap('Synchronous runtime errors:');
function failWhale(why) {
  console.log('failWhale() gonna fail:', why);
  throw new Error(why);
}

D.result = D.catch(failWhale)('502 Bad Gateway');
  //= `failWhale() gonna fail: 502 Bad Gateway`
D.expect('type', 'Error');    //= `+ (error) 502 Bad Gateway ∈ {Error}`
D.expect('error', '502 Bad Gateway');   //= `+ (error) 502 Bad Gateway`
D.expect('error', /^\d+/);    //= `+ (error) … → "502"`
D.expect('error', /\S+/g);    //= `+ (error) … → ["502", "Bad", "Gateway"]`
D.expect('error', tmp.rgx.httpErrorTemplate);
  //= `+ (error) … → "Bad Gateway (HTTP 502) <- 502 Bad Gateway"`
D.annot();

D.result = D.err2str(failWhale)('410 Gone');
    //= `failWhale() gonna fail: 410 Gone`
D.expect('type', 'string');     //= `+ (string) "Error: 410 Gone" ∈ {string}`
D.expect('===', 'Error: 410 Gone');   //= `+ (string) "Error: 410 Gone"`
D.expect('regexp', /: \d+/);    //= `+ (string) … → ": 410"`
D.expect('regexp', /\S+/g);     //= `+ (string) … → ["Error:", "410", "Gone"]`
D.expect('regexp', tmp.rgx.httpErrorTemplate);
  //= `+ (string) … → false`  // because there's "Error: " in front of "410"


D.chap('Custom assertions:');
D.result = 42;
D.expect('override', { where: 'beaver' });
  // ^-- for the next expectation, use custom stack hint.
D.expect((D.result < 0), 'negative');
  //= `! (number) 42`
  //= `↯ confuted: negative`
  //= /beaver|$:drunken $0/
  //= ``
D.expect('reset_fails', 1);   //= `+ expect.failCnt = 1, reset.`
D.expect((D.result > 0), 'positive');   //= `+ (number) 42 ✔ positive`

D.chap('Output annotations in simple comment lines are ignored:');
// D.chap('ignored chapter');      //= `? not-ignored chapter`
D.result = 'ignored expect';
// D.expect('===', 'whatever');    //= `? not-ignored expect`
// D.annot('ignored annotation');  //= `? not-ignored annotation`

D.chap('Smart display of certain characters: (using univeil)');
D.annot('some control characters:');
D.result = decodeURIComponent('%00%04%07%08%09%0A%0C%0D%1B');
D.expect('type', 'string');
  //= `+ (string) "\u0000\u0004\u0007\b\t\n\f\r\u001b" ∈ {string}`
D.annot('ASCII DEL:');
D.result = '\x7F';
D.expect('type', 'string');
  //= `+ (string) "\u007F" ∈ {string}`

D.annot('D.jsonify = univeil(JSON.stringify(…)):');
D.result = D.jsonify('\x7F');
D.expect('strlen', 8);      //= `+ (strlen) 8`
D.result = D.result.charCodeAt(1);
D.expect('===', 0x5C);      //= `+ (number) 92`

D.annot('compare native JSON.stringify():');
D.result = JSON.stringify('\x7F');
D.expect('strlen', 3);      //= `+ (strlen) 3`
D.result = D.result.charCodeAt(1);
D.expect('===', 0x7F);      //= `+ (number) 127`


D.chap('Utility functions:');
function vowels(sel, opt) { return D.getProp.these(vowels.lower, sel, opt); }
vowels.lower = 'aeiou'.match(/\S/g);

D.result = vowels(Object);
D.expect('like', vowels.lower);   //= `+ (array) ["a", "e", "i", "o", "u"]`
D.result = vowels(Array);
D.expect('like', vowels.lower.join(''));    //= `+ (string) "aeiou"`
D.result = vowels(Array, '+');
D.expect('like', vowels.lower.join('+'));   //= `+ (string) "a+e+i+o+u"`
D.result = vowels(2);
D.expect('===', 'i');             //= `+ (string) "i"`
D.result = vowels('342');
D.expect('===', 'oui');           //= `+ (string) "oui"`


D.result = D.repeat(['a', 'b', 'c', {}], 2);
D.expect('like', ['a', 'b', 'c', {}, 'a', 'b', 'c', {}]);
//= `+ (array) ["a", "b", "c", {}, "a", "b", "c", {}]`
D.result[1] = 1;
D.result[3].o = 0;
D.result[5] = 5;
D.expect('like', ['a', 1, 'c', {o: 0}, 'a', 5, 'c', {o: 0}]);
//= `+ (array) ["a", 1, "c", {"o": 0}, "a", 5, "c", {"o": 0}]`









D.ok();     //= "+OK all usage tests passed."
