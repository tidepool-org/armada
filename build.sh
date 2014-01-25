#! /bin/bash -eu

# cleanup modules then re-install
rm -rf node_modules
npm install .

BUILD_DIR=build

# cleanup for mongo
function cleanup {
  echo "Killing pid[$1]"
  kill -9 $1;
  echo "Deleting the build directory: ${BUILD_DIR}"
  rm -r ${BUILD_DIR};
}

# mongo setup, a requirement for the integration tests
rm -rf ${BUILD_DIR}
DBPATH=${BUILD_DIR}/mongo
mkdir -p ${DBPATH}
mongod --noprealloc --nojournal --smallfiles --dbpath ${DBPATH} --logpath ${BUILD_DIR}/mongo_log.log &
MONGO_PID=$!
echo "Sleeping to let mongo start up"
sleep 3
echo "Running tests"
trap "cleanup ${MONGO_PID}" EXIT

# run tests
./node_modules/.bin/grunt test