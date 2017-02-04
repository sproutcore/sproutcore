#!/bin/bash -ex

OLD_PWD=$PWD

WD=${MASTER_WD:-"/tmp/sproutcore_master_$$"}
IP=${IP:-"127.0.0.1"}
PORT=${PORT:-"4020"}

echo "Running in $WD..."

/bin/mkdir -p ${WD} || /bin/true
cd ${WD}

git clone https://github.com/sproutcore/build-tools sproutcore
cd sproutcore
npm install
cd ..
sproutcore/bin/sproutcore init master
cd master
mkdir -p frameworks
cd frameworks
ln -s ${OLD_PWD} sproutcore
cd ..
if [ -z ${TRAVIS_JOB_ID} ]; then
    # not running under travis, stay in foreground until stopped
    ../sproutcore/bin/sproutcore serve --local-only=true --port=${PORT}
else
    # running under travis, daemonize
    #( ../bin/sc-server --host=${IP} --port=${PORT} --allow-from-ips=${ALLOW_IPS:-"*.*.*.*"} & ) || /bin/true
    ( ../sproutcore/bin/sproutcore serve --local-only=true --port=${PORT} --include-tests --disable-bt-feedback & ) || /bin/true
fi
cd ${OLD_PWD}
