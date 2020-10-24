#!/usr/bin/env bash

### <<< HARD-CODED
user=meteor
group='www-data'
folder=/var/www/jazyx/staging/
mongo_flag=run_mongo
### HARD-CODED >>>

if [ -n "$1" ];
then
  if [ $1 == mongo_flag ];
  then
    mongo_flag=true
  fi;
fi;

echo "Change ownership of package.tar.gz to meteor"
chown $user:$group package.tar.gz

echo "Move package.tar.gz to ${folder} and cd there"
mv package.tar.gz $folder
cd $folder
echo -n "Now in "; pwd
ls -al

echo "Rename current bundle for archival purposes"
max=0
filename="bundle"

for entry in "./${filename}"*
do
  # Strip string common to all matching filenames
  entry=${entry#"./bundle"} # "./bundle" itself will be empty
  if [ -n "$entry" ];
  then
    # Strip leading . and zeros, so conversion to number gives decim$
    entry=${entry#"."}
    ext=$(echo $entry | sed 's/^0*//')

    # Convert to a number
    ext="$((${ext} + 0))"

    if [ $ext -gt $max ];
    then
      max=$ext
    fi;
  fi;
done

# Convert to decimal number; add 1
max="$((${max} + 1))"

# Pad with zeros
if [ $max -lt 10 ];
then
  max="000${max}"
elif [ $max -lt 100 ];
then
  max="00${max}"
elif [ $max -lt 1000 ];
then
  max="0${max}"
fi;

mv $filename "${filename}.${max}"
echo "bundle renamed as ${filename}.${max}"
ls -al

echo "Unzip package.tar.gz"
tar xzf package.tar.gz

sudo -u $user -H bash -l << HERE
echo -n "Execute code as user "; whoami
cd bundle/programs/server
echo -n "Install package at "; pwd
npm install --production > /dev/null 2>&1
HERE

echo "Return to sudo to delete package.tar.gz"
rm package.tar.gz
ls -al

if [ mongo_flag = true ];
then
  echo "Run mongo script before restarting the server"
  mongo --eval "load('mongo.js')"
 fi;

echo "Restart nginx"
nginx -t
service nginx restart

