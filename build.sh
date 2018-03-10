#!/bin/bash
declare -a folders=("csharp" "java" "python" "golang" "nodejs6" "nodejs6-diff-package-size")

export AWS_PROFILE=personal

for i in `seq 1 10`;
do
  for folder in "${folders[@]}"
  do
    cd $folder
    pwd
    
    npx sls deploy

    cd ..
  done

  node invoke-functions.js
done
