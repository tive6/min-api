#!/bin/bash

path="/data/www/resource_build/"

#cd $path
#ls
#pwd
#echo $1

if [ -d ${path}zip ];then
  echo "${path}zip 文件夹存在"
  else
  echo "${path}zip 文件夹不存在"
  mkdir ${path}zip
fi

#cd ${path}blog

mkdir ${path}zip

unzip -O utf-8 -o ${path}$1 -d $path

mv ${path}*.zip ${path}zip/




