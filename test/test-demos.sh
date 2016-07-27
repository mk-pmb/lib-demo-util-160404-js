#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
SELFPATH="$(readlink -m "$BASH_SOURCE"/..)"


function main () {
  local -A CFG
  CFG[action]=test_demos
  CFG[diff-context]=2
  CFG[use-color]=+
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
      --xpct ) CFG[action]=read_expectations;;
      --color ) CFG[use-color]=+;;
      --no-color ) CFG[use-color]=;;
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


function test_demos () {
  local DEMOS=( "$@" )
  if [ "${#DEMOS[@]}" == 0 ]; then
    cd_up_to_package_basedir || return $?
    readarray -t DEMOS < <(find_demo_files)
  fi

  local PKG_BASEDIR="$PWD"
  cd "$PKG_BASEDIR" || return $?  # fail early if we can't go back later

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
  return "$FAILS"
}


function find_demo_files () {
  local FIND_OPTS=(
    -xdev
   '(' -false
      -o -name .git
      -o -name .svn
    ')' -prune ','
    -path '*/demo/*'    # make sure to use "." as basedir so that demo/x.js
                        # is ./demo/x.js
    -name '*.js'
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


function check_demo () {
  local DEMO_JS="$1"
  local DEMO_DIR="$(dirname "$DEMO_JS")"
  local DEMO_BFN="$(basename "$DEMO_JS" .js)"
  local DEMO_NICK="$DEMO_DIR/$DEMO_BFN"
  echo -n "? $DEMO_NICK: "
  cd "$DEMO_DIR" || return $?
  local EXPECTED="$(read_expectations "$DEMO_BFN.js")"
  [ -n "$EXPECTED" ] || return 2$(
    echo $'\r'"! $DEMO_NICK: unable to find any output expectations." >&2)
  local DEMO_OUTPUT="$(nodejs ./"$DEMO_BFN.js" 2>&1; echo :)"
  [ -n "${DEMO_OUTPUT%:}" ] || return 2$(
    echo $'\r'"! $DEMO_NICK: demo produced no output at all." >&2)
  DEMO_OUTPUT="$(failhint 'transform output' lang_c sed -rf <(echo "$EXPECTED"
    ) -- <(echo -n "${DEMO_OUTPUT%:}"); echo :)"
  DEMO_OUTPUT="${DEMO_OUTPUT%:}"
  [ -n "$DEMO_OUTPUT" ] || return 2$(
    echo $'\r'"! $DEMO_NICK: failed to transform the output." >&2)
  local OUTPUT_DIFF="$DEMO_BFN".out.diff
  <<<"${DEMO_OUTPUT%$'\n'}" lang_c diff -sU "9${#EXPECTED}00" \
    --label "$DEMO_NICK.expect" <(<<<"$EXPECTED" lang_c sed -nre 's~^#=~~p') \
    --label "$DEMO_NICK.output" /dev/stdin \
    >"$OUTPUT_DIFF"
  local DIFF_RV=$?
  if [ "$DIFF_RV" == 0 ] && cleanup_nodiff "$OUTPUT_DIFF"; then
    echo $'\r'"+ $DEMO_NICK: ok"
    return 0
  fi
  echo -n $'\r'"! $DEMO_NICK: "
  diffstat ${CFG[use-color]:+-C} -f 4 -- "$OUTPUT_DIFF" \
    | lang_c sed -nre 's~^.*\|\s*~\t~p'

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


function sed_file () {
  local SED_BFN="$1"; shift
  local SED_FN="$SELFPATH/$SED_BFN.sed"
  lang_c sed -rf "$SED_FN" "$@" && return 0
  echo "W: ^-- $SED_BFN failed." >&2
  return 2
}


function read_expectations () {
  sed_file readxpct.normalize -- "$@" \
    | sed_file readxpct.filter -n | nl -ba \
    | sed_file readxpct.transform
  local PIPE_RV="${PIPESTATUS[*]}"
  let PIPE_RV="${PIPE_RV// /+}"
  return "$PIPE_RV"
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
