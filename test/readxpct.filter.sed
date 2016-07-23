\|^\s*/[/\*][A-Za-z0-9 \t]|{b skip_this_line}
s~^(\s*|.*\);\s+)//(=|…)\s*~\a\2~p
/^\s*D\.(annot|chap)\(/{
: mergelines_annot
/["']\s*\+\s*$/{N;b mergelines_annot}
s~["']\s*\+\s*\n\s*["']~~g
s~^\s*D\.([a-z]+)\(["'](.*)["'](\)\;?\s*(/[/*]\s.*|)$|)~<\1>\2~
  s~^<annot>(.*)$~\a=`# \1`~p
  s~^<chap>(.*)$~\a=""\n\a=`=== \1 ===`~p
}
:skip_this_line
