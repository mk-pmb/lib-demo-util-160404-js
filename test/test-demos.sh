#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
SELFPATH="$(readlink -m "$BASH_SOURCE"/..)"


function main () {
  local -A CFG
  CFG[action]=test_demos
  CFG[diff-context]=2
  CFG[use-color]=+
  CFG[interpreter:js]=nodejs
  CFG[interpreter:php]=php
  CFG[interpreter:pl]=perl
  CFG[interpreter:py]=python
  CFG[interpreter:sh]='#!'
  CFG[lint]=opportunistic
  tty --silent || CFG[use-color]=
  case "$TERM" in
    dumb ) CFG[use-color]=;;
  esac

  local POS_ARGS=()
  parse_cli_opts "$@" || return $?

  "${CFG[action]}" "${POS_ARGS[@]}"
  return $?
}


function parse_cli_opts () {
  local OPT=
  while [ "$#" -gt 0 ]; do
    OPT="$1"; shift
    case "$OPT" in
      '' ) continue;;
      -- ) POS_ARGS+=( "$@" ); break;;
      --color ) CFG[use-color]=+;;
      --no-color ) CFG[use-color]=;;
      --nolint ) CFG[lint]='skip';;
      --action=* | \
      --diff-context=* )
        OPT="${OPT#--}"
        CFG["${OPT%%=*}"]="${OPT#*=}";;
      --help | \
      -* )
        local -fp "${FUNCNAME[0]}" | guess_bash_script_config_opts-pmb
        [ "${OPT//-/}" == help ] && return 0
        echo "E: $0, CLI: unsupported option: $OPT" >&2; return 1;;
      * ) POS_ARGS+=( "$OPT" );;
    esac
  done
  return 0
}


function list_pkjs_interpreters () {
  nodejs -p '
    var progs = require("./package.json").config.DemoUtil160404.interpreters;
    Object.keys(progs).map(fxt => fxt + "\t" + progs[fxt]).join("\n")'
}


function test_demos () {
  local DEMOS=( "$@" )
  if [ "${#DEMOS[@]}" == 0 ]; then
    cd_up_to_package_basedir || return $?
    read_cfg_assoc interpreter: $'\t' < <(list_pkjs_interpreters 2>/dev/null)
    readarray -t DEMOS < <(find_demo_files)
  fi

  local PKG_BASEDIR="$PWD"
  cd "$PKG_BASEDIR" || return $?  # fail early if we can't go back later

  case "${CFG[lint]}" in
    '' ) ;;
    opportunistic ) opportunistic_lint || return $?;;
    skip ) CFG[lint]='<skipped>';;
    * ) echo "E: Unsupported linter: ${CFG[lint]}"; return $?;;
  esac

  local DEMO=
  local SXS=0
  local FAILS=0
  for DEMO in "${DEMOS[@]}" ''; do
    cd "$PKG_BASEDIR" || return $?
    [ -n "$DEMO" ] || continue
    if check_demo "$DEMO"; then
      let SXS="$SXS+1"
    else
      let FAILS="$FAILS+1"
    fi
  done
  [ "$SXS:$FAILS" == 0:0 ] && return 3$(echo 'E: unable to find any demos.' >&2)
  [ "$FAILS" != 0 ] && return 3$(echo "E: $FAILS demos failed." >&2)
  echo "I: All $SXS demos produced their expected output."

  case "${CFG[lint]}" in
    '' | '<linted>' ) ;;
    * ) echo "W: Unexpected lint result: ${CFG[lint]}" >&2;;
  esac

  return "$FAILS"
}


function read_cfg_assoc () {
  local PFX="$1"; shift
  local SEP="$1"; shift
  [ -n "$SEP" ] || SEP=$'[=\t:]'
  local KEY=
  while read -rs KEY; do
    [ "${KEY/$SEP/}" == "$KEY" ] && continue
    CFG["$PFX${KEY%%$SEP*}"]="${KEY#*$SEP}"
  done
}


function list_cfg () {
  local KEYS=()
  readarray -t KEYS < <(printf '%s\n' "${!CFG[@]}" | sort -V)
  local KEY=
  for KEY in "${KEYS[@]}"; do
    echo "$KEY='${CFG[$KEY]}'"
  done
}


function which1st () {
  which "$@" 2>/dev/null | grep -Pe '^/' -m 1
}


function opportunistic_lint () {
  if readlink -m "$(which1st jsl)" | grep -qFe /jslint; then
    CFG[lint]='<linted>'
    jsl; return $?
  fi
  if which1st jslint >/dev/null; then
    CFG[lint]='<linted>'
    jslint "${DEMOS[@]}"; return $?
  fi
  CFG[lint]='<skipped>'
  return 0
}


function find_demo_files () {
  local DEMO_FEXTS=()
  local FXT=
  for FXT in "${!CFG[@]}"; do case "$FXT" in
    interpreter:* ) DEMO_FEXTS+=( ".${FXT#*:}" );;
  esac; done
  local FIND_OPTS=(
    -xdev
   '(' -false
      -o -name .git
      -o -name .svn
      -o -name bower_components
      -o -name node_modules
    ')' -prune ','
    '(' -false
    )
  for FXT in "${DEMO_FEXTS[@]}"; do
    FIND_OPTS+=(
      -o -path "*/demo/*$FXT"
        # ^-- make sure to use "." as basedir so that demo/x.js is ./demo/x.js
      -o -path "./usage$FXT"
      -o -path "*/test/demo.*$FXT"
      -o -path "*/*.demo$FXT"
      )
  done
  FIND_OPTS+=(
    ')'
    )
  find . "${FIND_OPTS[@]}" | cut -b 3- | lang_c sort -V
}


function cd_up_to_package_basedir () {
  local UP=
  for UP in $(seq 1 5); do
    [ -f package.json ] && return 0
    cd ..
  done
  echo 'E: unable to find package.json' >&2
  return 2
}


function lang_c () {
  env LANG=C {LANGUAGE,LC_ALL}=en_US.UTF-8 "$@"; return $?
}


function logwarn () {
  local MSG="$*"
  local PFX='! '
  case "$MSG" in
    $'\r'* ) MSG="${MSG:1}"; PFX=$'\r'"$PFX";;
  esac
  echo "$PFX$MSG" >&2
}


function check_demo () {
  local DEMO_ABS="$1"
  local DEMO_DIR="$(dirname "$DEMO_ABS")"
  cd "$DEMO_DIR" || return $?
  local DEMO_FN="$(basename "$DEMO_ABS")"
  local DEMO_FXT=
  [[ "$DEMO_FN" =~ \.([a-z0-9]{2,6})$ ]] && DEMO_FXT="${BASH_REMATCH[1]}"
  local DEMO_BFN="${DEMO_FN%\.$DEMO_FXT}"
  local DEMO_NICK="$DEMO_DIR/$DEMO_BFN"
  local INTERPRETER=( "${CFG[interpreter:$DEMO_FXT]}" )
  case "$INTERPRETER" in
    '' )
      logwarn "$DEMO_ABS: no interpreter for *.$DEMO_FXT! found: $(
        list_cfg | sed -nre '$!s~$~ ~;s~^interpreter:~~p' | tr -d '\n')"
      return 2;;
    '#!' )
      [ -x "$DEMO_FN" ] || return 5$(
        logwarn "$DEMO_ABS: not executable")
      [ "$(head -c 2 "$DEMO_FN")" == '#!' ] || return 5$(
        logwarn "$DEMO_ABS: doesn't start with shebang")
      INTERPRETER=()
      ;;
  esac
  INTERPRETER+=( ./"$DEMO_FN" )

  echo -n "? $DEMO_NICK: "

  local DEMO_OUTPUT="$("${INTERPRETER[@]}" 2>&1; echo :)"
  [ -n "${DEMO_OUTPUT%:}" ] || return 2$(
    logwarn $'\r'"$DEMO_NICK: demo produced no output at all.")
  local OUT_CMP="$(nodejs "$SELFPATH/readxpct.js" "$DEMO_FN" \
    readOutputFile <(echo -n "${DEMO_OUTPUT%:}") \
    transformOutput compareOutputs printAndQuit)"
  [ -n "$OUT_CMP" ] || return 2$(
    logwarn $'\r'"$DEMO_NICK: unable to find any output expectations.")
  local OUTPUT_DIFF="$DEMO_BFN".out.diff
  <<<"${DEMO_OUTPUT%$'\n'}" lang_c diff -sU "${#OUT_CMP}0" \
    --label "$DEMO_NICK.expect" <(<<<"$OUT_CMP" lang_c sed -re '
      /^\+/d
      s~^[=-]~~') \
    --label "$DEMO_NICK.output" <(<<<"$OUT_CMP" lang_c sed -nre '
      s~^[=+]~~p') \
    >"$OUTPUT_DIFF"
  local DIFF_RV=$?
  if [ "$DIFF_RV" == 0 ] && cleanup_nodiff "$OUTPUT_DIFF"; then
    echo $'\b\b  \r'"✔ $DEMO_NICK"
    return 0
  fi

  logwarn $'\r'"$DEMO_NICK: $(diffstat ${CFG[use-color]:+-C} -f 4 \
    -- "$OUTPUT_DIFF" | lang_c sed -nre 's~^.*\|\s*~\t~p')"

  local GRP_SEP='…'
  [ -n "${CFG[use-color]}" ] && GRP_SEP='\x1b[90m'"$GRP_SEP"'\x1b[0m'
  GRP_SEP='s~^-{2}$~     '"$GRP_SEP~"

  local COLORIZE_DIFF='
    s~^( *)([0-9+]+)\t([:|+-])~\1\x1b[90m\2\x1b[0m\t\x1b[0\a\3~
    s!\a\-!;91&!
    s!\a\+!;94&!
    s!(;[0-9;]+|)\a(.)!\1m\2\x1b[0\1m!
    s~$~\x1b[0m~
    '
  diff_add_old_lnums "$OUTPUT_DIFF" | lang_c grep -C "${CFG[diff-context]%\
    }" -Pe '^[\s0-9]*[\+\-]' | lang_c sed -re "$GRP_SEP
    ${CFG[use-color]:+$COLORIZE_DIFF}"
  return 3
}


function diff_add_old_lnums () {
  lang_c sed -nre '
    : read_all
    $!{N;b read_all}
    s~^((\-{3}|\+{3})[^\n]*\n){2}~~
    s~^@@[^\n]*@@(\n|$)~~
    s~\a|\r~~g
    s~(^|\n)(\+)~\r\2~g
    s~(^|\n) ~\1|~g
    s~^([^\r])~\n&~
    p' -- "$@" | nl -ba --starting-line-num=0 | lang_c sed -re '
    s~\r~\n     +\t~g
    1{s~^[0-9 ]+\t(\n|$)~~;/^$/d}
    '
}


function failhint () {
  local HINT="$1"; shift
  "$@"; local RV=$?
  [ "$RV" == 0 ] || echo "H: ^-- $HINT rv=$RV <$*>" >&2
  return "$RV"
}


function cleanup_nodiff () {
  local DIFF_FN="$1"
  head -n 3 -- "$DIFF_FN" | tr '\n' '\r' | grep -qxPe 'Files [^\r]+ and'$(
    )' [^\r]+ are identical\.?\r' && rm -- "$DIFF_FN"
  return 0
}


















main "$@"; exit $?
