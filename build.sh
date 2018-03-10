#!/bin/bash
declare -a folders=("csharp" "java" "python" "golang" "nodejs6" "nodejs6-diff-package-size")

export AWS_PROFILE=${1-default}

for i in `seq 1 10`;
do
  for folder in "${folders[@]}"
  do
    cd $folder
    pwd
    
    sls deploy

    cd ..
  done

  node invoke-functions.js
done
