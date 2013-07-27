#!/bin/sh -ex

OLD_PWD=$PWD

WD=${MASTER_WD:-"/tmp/sproutcore_master_$$"}
IP=${IP:-"127.0.0.1"}
PORT=${PORT:-"4020"}

echo "Running in $WD..."

/bin/mkdir -p ${WD} || /bin/true
cd ${WD}

git clone https://github.com/sproutcore/abbot.git
cat > Gemfile <<EOF
source "http://rubygems.org"
gem "sproutcore", :path => "./abbot/"
EOF
bundle install --binstubs
./bin/sc-init master
cd master
mkdir frameworks
cd frameworks
ln -s ${OLD_PWD} sproutcore
cd ..
../bin/sc-server --host=${IP} --port=${PORT} --allow-from-ips=${ALLOW_IPS:-"*.*.*.*"} || /bin/true
#cd ${OLD_PWD}
#rm -rf ${WD}
