/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

function ent(which) {
  var byName = {
    amp: '&',
    blackRightPointingIndex: '\u261B', // ☛
    checkMark: '\u2713', // ✓
    crossMark: '\u274C', // ❌
    dagger: '\u2020', // †
    doubleExclamationMark: '\u203C', // ‼
    doubleQuestionMark: '\u2047', // ⁇
    downwardsZigzagArrow: '\u21af', // ↯
    exist: '\u2203', // ∃
    forall: '\u2200', // ∀
    heavyCheckMark: '\u2714', // ✔
    heavyExclamationMark: '\u2757', // ❗
    isin: '\u2208', // ∈
    larr: '\u2190', // ←
    lArr: '\u21D0', // ⇐
    ne: '\u2260', // ≠
    negativeSquaredCrossMark: '\u274E', // ❎
    nexist: '\u2204', // ∄
    notin: '\u2209', // ∉
    oslash: '\u00F8', // ø
    rarr: '\u2192', // →
    rArr: '\u21d2', // ⇒
    rarrWithStroke: '\u219b', // ↛
    rArrWithStroke: '\u21cf', // ⇏
    referenceMark: '\u203B', // ※, japanese version of asterisk
    skullAndCrossbones: '\u2620', // ☠
    sum: '\u2211', // ∑
    victoryHand: '\u270C', // ✌
    warningSign: '\u26A0', // ⚠
  };
  return (which ? byName[which] : byName);
}












Object.assign(ent, ent());
module.exports = ent;
