#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function readexp_gen () {
  local SED_BFN="${BASH_SOURCE%.gen.*}"

  local QUOT='"'
  local APOS="'"
  local AIGU='´'
  local GRAV='`'

  write_sed_file normalize '
    s~\s+$~~
    s~\a|\r~~g
    ' || return $?

  local FLT_ANNOT='
    /^\s*D\.(annot|chap)\(/{
    : mergelines_annot
    /`\s*\+\s*$/{N;b mergelines_annot}
    s~`\s*\+\s*\n\s*`~~g
    #s~\n~¶ ~g
    s~^\s*D\.([a-z]+)\(`(.*)`(\)\;?\s*(/[/*]\s.*|)$|)~<\1>\2~
    '
  FLT_ANNOT="${FLT_ANNOT//$GRAV/[$QUOT$APOS]}"
  FLT_ANNOT+='
      s~^<annot>(.*)$~\a=`# \1`~p
      s~^<chap>(.*)$~\a=""\n\a=`=== \1 ===`~p
    }'

  write_sed_file filter '
    \|^\s*/[/\*][A-Za-z0-9 \t]|{b skip_this_line}
    # ^- skip easy comments
    s~^(\s*|.*\);\s+)//(=|…)~\a\2~p
    '"$FLT_ANNOT"'
    :skip_this_line
    ' || return $?

  local EXACT_LINE_QUOTES='s~{lnum}=\s*`([^`]*)`$~#=\2~'
  EXACT_LINE_QUOTES='
    s~({lnum}=)(0)(\s*`)~\1\4\a\3@\2\a~
    '"$EXACT_LINE_QUOTES
    ${EXACT_LINE_QUOTES//$GRAV/$QUOT}
    ${EXACT_LINE_QUOTES//$GRAV/$APOS}
    "'
    s~^#=\a(0)@([0-9]+)\a~\2s![+-]?[0-9]+!0!g\n#=~
    '
  local ANY_ONE_LINE='s~{lnum}…$~\1s!^.*$!§!\n#=§~'
  ANY_ONE_LINE="${ANY_ONE_LINE//§/[… ignore output line #\\1 …]}"

  write_sed_file transform "
    $EXACT_LINE_QUOTES
    $ANY_ONE_LINE
    " '
    s~\{lnum\}~^\\s*([0-9]+)\\s\\a~
    ' || return $?

  return 0
}


function write_sed_file () {
  local SUB_FN="$1"
  local CODE="$2"
  local TRANSFORM="$3"
  local FN="${SED_BFN:-E_NO_SED_BFN}.$SUB_FN.sed"
  case "$CODE" in
    $'\n  '* )
      CODE="${CODE:1}"
      TRANSFORM+=$'\ns~^'"${CODE%%[^ ]*}~~"
      ;;
  esac
  CODE="$(sed -nre '2{p;q}' -- "$BASH_SOURCE")"$'\n'"$CODE"
  <<<"$CODE" LANG=C sed -re "$TRANSFORM"'
    /^\s*#/d
    s~\s+$~~
    /^$/d' >"$FN" || return $?$(echo "E: write $SUB_FN failed" >&2)
  if ! <<<$'foo\nbar' sed -rf "$FN" >/dev/null; then
    nl -ba "$FN"
    echo "E: test $SUB_FN failed" >&2
    return 2
  fi
  return 0
}










readexp_gen "$@"; exit $?
